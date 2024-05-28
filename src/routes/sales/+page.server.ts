import type { PageServerLoad } from './$types';
import { db } from '$lib/connection'
import { sales_history } from '$lib/schema'
import { desc, sql } from 'drizzle-orm';
//@ts-ignore
export const load = (async () => {
    async function load_sales_history() {
        const query: any = await db.select({
            sales_history,
            formattedTime: sql<string>`CONCAT(DATE_FORMAT(time, '%h:%i %p'),' / ',DATE_FORMAT(time, '%M-%d-%Y'))`
        }).from(sales_history).orderBy(desc(sales_history.id))
        return query
    }
    return {
        data: await load_sales_history()
    };
}) satisfies PageServerLoad;