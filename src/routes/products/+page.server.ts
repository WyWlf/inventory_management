import type { PageServerLoad } from './$types';
import { db } from '$lib/connection'
import { product_table } from '$lib/schema'
import { desc } from 'drizzle-orm';
//@ts-ignore
export const load = (async () => {
    async function load_products() {
        const query: any = await db.select().from(product_table).orderBy(desc(product_table.id))
        const types: any = await db.selectDistinct({
            type: product_table.product_type
        }).from(product_table).orderBy(product_table.product_type)

        const unique_product_name: any = await db.selectDistinct({
            item_name: product_table.item_name
        }).from(product_table).orderBy(product_table.item_name)
        return {
            query,
            types,
            unique_product_name
        }
    }
    return {
        data: await load_products()
    };
}) satisfies PageServerLoad;