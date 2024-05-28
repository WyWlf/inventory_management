import type { PageServerLoad } from './$types';
import { db } from '$lib/connection'
import { user_table } from '$lib/schema'
import { desc, ne } from 'drizzle-orm';
export const load = (async ({ cookies }) => {
    async function load_staffs() {
        try {
            const query: any = await db.select().from(user_table).where(ne(user_table.id, parseInt(cookies.get('id')!))).orderBy(desc(user_table.id))
            if (query) {
                return query
            }
        } catch (error) {
            console.log(error)
        }
    }
    return {
        data: await load_staffs()
    };
}) satisfies PageServerLoad;