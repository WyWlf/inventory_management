import { db, logger } from '$lib/connection'
import { error } from '@sveltejs/kit'
import { product_table, inventory_cost } from '$lib/schema'
import { eq, sql } from 'drizzle-orm'
//@ts-ignore
export async function POST({ request, cookies }) {
    try {
        const {
            id,
            new_stock_value,
            value,
            action,
            item_name } = await request.json()
        const [query]: any = await db.update(product_table).set({ stock: new_stock_value }).where(eq(product_table.id, id)).execute()
        const [item_cost] : any = await db.select({price: product_table.unit_cost}).from(product_table).where(eq(product_table.id, id))
        if (query['affectedRows'] > 0) {
            if (action == 'add') {
                const [query]: any = await db.update(inventory_cost).set({ total_cost: sql`${inventory_cost.total_cost} + (${value} * ${item_cost.price})` }).execute()
                logger(cookies.get('username'), `${cookies.get('username')} has added ${value} stock/s of ${item_name}`)
            }
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