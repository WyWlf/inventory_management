import { db, logger } from '$lib/connection'
import { error } from '@sveltejs/kit'
import { product_table, sales_history, inventory_cost } from '$lib/schema'
import { eq, sql } from 'drizzle-orm'

//@ts-ignore
export async function POST({ request, cookies }) {
    try {
        const { id, value, discount } = await request.json()
        const [item_info]: any = await db.select().from(product_table).where(eq(product_table.id, id))
        let slashed_price = 0
        function calculate_discount(discount: number, unit_price: number, qty: number) {
            let initial_price = parseFloat((unit_price * qty).toFixed(2));
            let discount_percentage = 0;
            if (discount > 0) {
                discount_percentage = discount / 100;
                slashed_price = parseFloat((initial_price * discount_percentage).toFixed(2))
                return parseFloat(
                    (initial_price - initial_price * discount_percentage).toFixed(2)
                );
            } else if (discount === 0) {
                return parseFloat(initial_price.toFixed(2));
            }
        }

        const total_cost = (discount === 0) ? parseFloat((value * item_info.unit_price).toFixed(2)) || 0 : calculate_discount(discount, item_info.unit_price, value)
        const [new_transaction]: any = await db.insert(sales_history).values({ item_id: id, item_name: item_info.item_name, units: value, price_unit: item_info.unit_price, total_cost: total_cost, discount: discount, price_discounted: slashed_price }).execute()

        if (new_transaction['affectedRows'] > 0) {
            const true_cost: number = item_info.unit_price - item_info.unit_cost
            const transaction_profit = (discount === 0) ? value * true_cost : calculate_discount(discount, true_cost, value)
            const [profit]: any = await db.update(inventory_cost).set({ total_profit: sql`${inventory_cost.total_profit} + ${transaction_profit}` })
            logger(cookies.get('username'), cookies.get('username') + ' has sold ' + value + ' unit/s of ' + item_info.item_name + `${(discount > 0) ? ` and applied a discount of ${parseInt(discount)}%` : ''}`)
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