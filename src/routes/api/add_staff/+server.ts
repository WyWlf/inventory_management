import { db, logger } from '$lib/connection'
import { error } from '@sveltejs/kit'
import { user_table } from '$lib/schema'
import bcrypt from 'bcrypt'
import { promisify } from 'util'
import { count, eq } from 'drizzle-orm'

const hashAsync = promisify(bcrypt.hash)

//@ts-ignore
export async function POST({ request, cookies }) {
    const salt = 10
    try {
        const { username,
            full_name,
            address,
            phone_number,
            password } = await request.json()
        const hashed_password = await hashAsync(password, salt)

        let user_count: any = await db.select({ count: count() }).from(user_table).where(eq(user_table.username, username))

        if (user_count[0].count == 0) {
            const [query]: any = await db.insert(user_table).values({ username: username, full_name: full_name, address: address, phone_number: phone_number, password: hashed_password }).execute()
            if (query['affectedRows'] > 0) {
                logger(cookies.get('username'), cookies.get('username') + ' has added a new staff member ' + username)
                return new Response(JSON.stringify({
                    status: 200
                }))
            } else {
                return new Response(JSON.stringify({
                    status: 500,
                    msg: 'A server error has occured.'
                }))
            }
        } else {
            return new Response(JSON.stringify({
                status: 500,
                msg: 'This username is already used by another account.'
            }))
        }



    } catch (errors: any) {
        console.error(errors)
        throw error(500, { message: errors.code })
    }

}