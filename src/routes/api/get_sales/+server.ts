import { db } from '$lib/connection'
import { error } from '@sveltejs/kit'
import { sales_history } from '$lib/schema'
import { like, desc, sql, and } from 'drizzle-orm'
//@ts-ignore
export async function POST({ request }) {
    try {
        const { search, start_date, end_date, filter } = await request.json()
        let end = end_date

        if (filter == 'Daily') {
            end = start_date
        }

        if (start_date.length != 10 && end_date.length != 10) {
            end = '2100-01-01'
        }

        const query: any = await db.select({
            sales_history,
            formattedTime: sql<string>`CONCAT(DATE_FORMAT(time, '%h:%i %p'),' / ',DATE_FORMAT(time, '%M-%d-%Y'))`,
        }).from(sales_history).where(and(
            like(sales_history.item_name, '%' + search + '%'),
            sql`DATE(${sales_history.time}) BETWEEN ${start_date} and ${end}`))
            .orderBy(desc(sales_history.id))
        if (query) {
            return new Response(JSON.stringify({
                status: 200,
                data: query
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