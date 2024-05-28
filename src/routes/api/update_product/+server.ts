import { db, logger } from '$lib/connection'
import { error } from '@sveltejs/kit'
import { product_table } from '$lib/schema'
import { eq } from 'drizzle-orm'
//@ts-ignore
export async function POST({ request, cookies }) {
    try {
        const {
            id,
            item_name,
            description,
            product_type,
            unit_cost,
            unit_price } = await request.json()
        const [query]: any = await db.update(product_table).set({ item_name: item_name, description: description, product_type: product_type, unit_cost: unit_cost, unit_price: unit_price }).where(eq(product_table.id, id)).execute()

        if (query['affectedRows'] > 0) {
            logger(cookies.get('username'), cookies.get('username') + ' has updated the product information of ' + item_name)
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