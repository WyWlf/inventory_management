import { db, logger } from '$lib/connection'
import { error } from '@sveltejs/kit'
import { product_table, sales_history } from '$lib/schema'
import { eq } from 'drizzle-orm'

//@ts-ignore
export async function POST({ request, cookies }) {
    try {
        const { id, value } = await request.json()
        const [item_info]: any = await db.select().from(product_table).where(eq(product_table.id, id))
        const total_cost = value * item_info.unit_price || 0
        const [new_transaction]: any = await db.insert(sales_history).values({ item_id: id, item_name: item_info.item_name, units: value, price_unit: item_info.unit_price, total_cost: total_cost }).execute()
       
        if (new_transaction['affectedRows'] > 0) {
            logger(cookies.get('username'), cookies.get('username') + ' has sold ' + value + ' unit/s of ' + item_info.item_name)
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