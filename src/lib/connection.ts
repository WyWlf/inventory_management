import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { inventory_history } from '$lib/schema'
const poolConnection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: '',
    database: "inventory_management",
});

export const db = drizzle(poolConnection);

export async function logger(username: string, action_event: string) {
    try {
        const [action]: any = await db.insert(inventory_history).values({ username: username, action: action_event })

        if (action['affectedRows'].length > 0) {
            return {
                status: 200
            }
        } else {
            return {
                status: 500,
                msg: 'An error has been encountered during logging an event.'
            }
        }
    } catch (error) {
        console.error(error)
        return {
            status: 500,
            msg: 'An error has been encountered during logging an event.'
        }
    }
}