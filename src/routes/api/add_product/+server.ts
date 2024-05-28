import { db, logger } from '$lib/connection'
import { error } from '@sveltejs/kit'
import { product_table } from '$lib/schema'
//@ts-ignore
export async function POST({ request, cookies }) {
    try {
        const { product_name,
            description,
            product_type,
            unit_cost,
            unit_price } = await request.json()
        const [query]: any = await db.insert(product_table).values({ item_name: product_name, description: description, product_type: product_type, unit_cost: unit_cost, unit_price: unit_price }).execute()
    
        if (query['affectedRows'] > 0) {
            logger(cookies.get('username'), cookies.get('username') + ' has added a new product named ' + product_name)
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