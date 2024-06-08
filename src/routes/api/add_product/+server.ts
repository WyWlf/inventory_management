import { db, logger } from '$lib/connection'
import { error } from '@sveltejs/kit'
import { inventory_cost, product_table } from '$lib/schema'
import { sql } from 'drizzle-orm'
//@ts-ignore
export async function POST({ request, cookies }) {
    try {
        const {
            brand,
            product_name,
            description,
            product_type,
            unit_cost,
            unit_price,
            images,
            stock } = await request.json()
        const [query]: any = await db.insert(product_table).values({ product_brand: brand, item_name: product_name, description: description, product_type: product_type, unit_cost: unit_cost, unit_price: unit_price, stock: stock, images: JSON.stringify(images) }).execute()

        if (query['affectedRows'] > 0) {
            const [query]: any = await db.update(inventory_cost).set({ total_cost: sql`${inventory_cost.total_cost} + (${stock} * ${unit_cost})` }).execute()
            logger(cookies.get('username'), cookies.get('username') + ' has added a new product named ' + product_name + ` with a quantity of ${stock}`)
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