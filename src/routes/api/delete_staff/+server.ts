import { db, logger } from '$lib/connection'
import { error } from '@sveltejs/kit'
import { user_table } from '$lib/schema'
import { eq } from 'drizzle-orm'
//@ts-ignore
export async function POST({ request, cookies }) {
    try {
        const { id } = await request.json()
        const item_name: any = await db.select({item_name: user_table.username}).from(user_table).where(eq(user_table.id, id))
        logger(cookies.get('username'), cookies.get('username') + ' has deleted this user ' + item_name[0].item_name) + ' from the staff member list'
        const [query]: any = await db.delete(user_table).where(eq(user_table.id, id)).execute()

        if (query['affectedRows'] > 0) {
            return new Response(JSON.stringify({
                status: 200
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