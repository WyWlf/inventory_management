import type { LayoutServerLoad } from './$types';
import { db } from '$lib/connection'
import { error, redirect } from '@sveltejs/kit'
import { user_table } from '$lib/schema'
import { count, eq } from 'drizzle-orm'
import { verifyToken } from '$lib/auth'

export const load = (async ({ cookies, url }) => {
    try {
        let token: any = await verifyToken(cookies.get('token')!)
        if (token) {
            let query: any = await db.select({ count: count() }).from(user_table).where(eq(user_table.username, token))
            if (query[0].count == 0) {
                cookies.delete('id', { path: '/' })
                cookies.delete('token', { path: '/' })
                cookies.delete('username', { path: '/' })
            }
        } else {
            cookies.delete('id', { path: '/' })
            cookies.delete('token', { path: '/' })
            cookies.delete('username', { path: '/' })
        }

    } catch (errors: any) {
        console.error(errors)
        throw error(500, { message: errors.code })
    }

    return {};
}) satisfies LayoutServerLoad;