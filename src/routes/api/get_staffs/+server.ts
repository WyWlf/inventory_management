import { db } from '$lib/connection'
import { error } from '@sveltejs/kit'
import { user_table } from '$lib/schema'
import { like, desc, and, ne } from 'drizzle-orm'
//@ts-ignore
export async function POST({ request, cookies }) {
    try {
        const { search } = await request.json()
        const query: any = await db.select().from(user_table).where(and(like(user_table.username, '%' + search + '%'), ne(user_table.id, parseInt(cookies.get('id')!)))).orderBy(desc(user_table.id))
        if (query) {
            return new Response(JSON.stringify({
                status: 200,
                data: query
            }))
        } else {
            return new Response(JSON.stringify({
                status: 500,
            }))
        }
    } catch (errors: any) {
        console.error(errors)
        throw error(500, { message: errors.code })
    }

}