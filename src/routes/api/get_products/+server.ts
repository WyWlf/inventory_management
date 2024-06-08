import { db } from '$lib/connection'
import { error } from '@sveltejs/kit'
import { product_table } from '$lib/schema'
import { like, desc } from 'drizzle-orm'
//@ts-ignore
export async function POST({ request }) {
    try {
        const { search } = await request.json()
        const query: any = await db.select().from(product_table).where(like(product_table.item_name, '%' + search + '%')).orderBy(desc(product_table.id))

        const unique_product_name: any = await db.selectDistinct({
            item_name: product_table.item_name
        }).from(product_table).orderBy(product_table.item_name)

        const types: any = await db.selectDistinct({
            type: product_table.product_type
        }).from(product_table).orderBy(product_table.product_type)

        const brand_list: any = await db.selectDistinct({
            product_brand: product_table.product_brand
        }).from(product_table).orderBy(product_table.product_brand)

        if (query) {
            return new Response(JSON.stringify({
                status: 200,
                data: query,
                unique_list: unique_product_name,
                types: types,
                brands: brand_list
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