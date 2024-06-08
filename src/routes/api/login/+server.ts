import { db, logger } from '$lib/connection'
import { error } from '@sveltejs/kit'
import { user_table } from '$lib/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { generateToken } from '$lib/auth'
import { promisify } from 'util'

const compareAsync = promisify(bcrypt.compare)
//@ts-ignore
export async function POST({ request, cookies }) {
    try {
        const { username, password } = await request.json()
        const query: any = await db.select({ password: user_table.password, id: user_table.id, role: user_table.role }).from(user_table).where(eq(user_table.username, username))
        if (query.length > 0) {
            const compare = await compareAsync(password, query[0].password)
            if (compare) {
                cookies.set('username', username, { path: '/', httpOnly: false, secure: false })
                cookies.set('id', query[0].id, { path: '/', httpOnly: false, secure: false })
                cookies.set('token', generateToken(username), { path: '/', httpOnly: false, secure: false })
                cookies.set('role', query[0].role, { path: '/', httpOnly: false, secure: false })
                logger(cookies.get('username'), cookies.get('username') + ' has logged in to the system')
                return new Response(JSON.stringify({
                    status: 200,
                }))
            } else {
                return new Response(JSON.stringify({
                    status: 500,
                    msg: 'Password is incorrect'
                }))
            }
        } else {
            return new Response(JSON.stringify({
                status: 500,
                msg: 'No account found'
            }))
        }
    } catch (errors: any) {
        console.error(errors)
        throw error(500, { message: errors.code })
    }

}