import type { PageServerLoad } from './$types';
import { db } from '$lib/connection'
import { inventory_history } from '$lib/schema'
import { desc, sql } from 'drizzle-orm';
//@ts-ignore
export const load = (async () => {
    async function load_logs_history() {
        const query: any = await db.select({
            inventory_history,
            formattedTime: sql<string>`CONCAT(DATE_FORMAT(time, '%h:%i %p'),' / ',DATE_FORMAT(time, '%M-%d-%Y'))`
        }).from(inventory_history).orderBy(desc(inventory_history.id))
        return query
    }
    return {
        data: await load_logs_history()
    };
}) satisfies PageServerLoad;