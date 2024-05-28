import type { PageServerLoad } from './$types';
import { db } from '$lib/connection'
import { user_table } from '$lib/schema'
import { desc, eq } from 'drizzle-orm';
//@ts-ignore
export const load = (async ({cookies}) => {
    async function load_account_information() {
        const query: any = await db.select().from(user_table).where(eq(user_table.id, parseInt(cookies.get('id')!)))
        if (query) {
            return query
        }
    }
    return {
        data: await load_account_information()
    };
}) satisfies PageServerLoad;