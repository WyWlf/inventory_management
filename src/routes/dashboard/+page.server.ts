import type { PageServerLoad } from './$types';
import { db } from '$lib/connection'
import { sales_history, product_table, inventory_history, inventory_cost } from '$lib/schema'
import { asc, desc, eq, sql } from 'drizzle-orm';
//@ts-ignore
export const load = (async () => {
    async function load_sales_history() {
        const this_day_revenue: any = await db.select({
            revenue: sql<number>`SUM(${sales_history.total_cost})`
        }).from(sales_history).where(sql`date(${sales_history.time}) = CURRENT_DATE()`)

        const this_month_revenue: any = await db.select({
            revenue: sql<number>`SUM(${sales_history.total_cost})`
        }).from(sales_history).where(sql`date(MONTH(${sales_history.time})) = MONTH(CURRENT_DATE)`)

        const overall_statistics: any = await db.select({
            revenue: sql<number>`SUM(${sales_history.total_cost})`,
            items_sold: sql<number>`SUM(${sales_history.units})`,
        }).from(sales_history)

        const total_inventory_cost: any = await db.select().from(inventory_cost)

        const top_selling_metric: any = await db.select({
            item_name: sales_history.item_name,
            total_units: sql<number>`SUM(${sales_history.units}) as total_units`,
        }).from(sales_history).groupBy(sales_history.item_name).orderBy(desc(sql`total_units`)).limit(5)

        const low_selling_metric: any = await db.select({
            item_name: sales_history.item_name,
            total_units: sql<number>`SUM(${sales_history.units}) as total_units`,
        }).from(sales_history).groupBy(sales_history.item_name).orderBy(asc(sql`total_units`)).limit(5)

        const low_stock_metric: any = await db.select({
            item_name: product_table.item_name,
            total_stock: sql<number>`SUM(${product_table.stock}) as total_stock`,
        }).from(product_table).groupBy(product_table.item_name).orderBy(asc(sql`total_stock`)).limit(5)

        const events: any = await db.select({
            inventory_history,
            formattedTime: sql<string>`CONCAT(DATE_FORMAT(time, '%h:%i %p'),' / ',DATE_FORMAT(time, '%M-%d-%Y'))`
        }).from(inventory_history).orderBy(desc(inventory_history.id)).limit(10)

        return {
            this_day_revenue,
            this_month_revenue,
            overall_statistics,
            top_selling_metric,
            low_selling_metric,
            low_stock_metric,
            events,
            total_inventory_cost
        }
    }
    return {
        data: await load_sales_history()
    };
}) satisfies PageServerLoad;