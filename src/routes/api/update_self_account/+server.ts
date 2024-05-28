import { db, logger } from '$lib/connection'
import { error } from '@sveltejs/kit'
import { user_table } from '$lib/schema'
import { and, eq } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { promisify } from 'util'

const hashAsync = promisify(bcrypt.hash)
const compareAsync = promisify(bcrypt.compare)
//@ts-ignore
export async function POST({ request, cookies }) {
    const salt = 10
    try {
        const {
            full_name,
            address,
            phone_number,
            old_password,
            new_password,
            change_pass } = await request.json()
        let curr_user: any = await db.select({ password: user_table.password }).from(user_table).where(and(eq(user_table.id, parseInt(cookies.get('id')!))))
        const verify_pass = await compareAsync(old_password, curr_user[0].password)
        const hashed_password = await hashAsync(new_password, salt)

        if (curr_user) {
            if (change_pass) {
                if (verify_pass) {
                    const [query]: any = await db.update(user_table).set({ full_name: full_name, address: address, phone_number: phone_number, password: hashed_password }).where(eq(user_table.id, parseInt(cookies.get('id')!))).execute()

                    if (query['affectedRows'] > 0) {
                        logger(cookies.get('username'), cookies.get('username') + ' has updated their own account information')
                        return new Response(JSON.stringify({
                            status: 200,
                            msg: 'Account information updated successfully.'
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
                        msg: 'Password is incorrect.'
                    }))
                }
            } else {
                const [query]: any = await db.update(user_table).set({ full_name: full_name, address: address, phone_number: phone_number }).where(eq(user_table.id, parseInt(cookies.get('id')!))).execute()

                if (query['affectedRows'] > 0) {
                    logger(cookies.get('username'), cookies.get('username') + ' has updated their own account information')
                    return new Response(JSON.stringify({
                        status: 200,
                        msg: 'Account information updated successfully.'
                    }))
                } else {
                    return new Response(JSON.stringify({
                        status: 500,
                        msg: 'A server error has occured.'
                    }))
                }
            }

        } else {
            return new Response(JSON.stringify({
                status: 500,
                msg: 'Could not retrieve account information on the server.'
            }))
        }

    } catch (errors: any) {
        console.error(errors)
        throw error(500, { message: errors.code })
    }

}