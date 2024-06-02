import { int, text, mysqlSchema, date } from "drizzle-orm/mysql-core";
export const mySchema = mysqlSchema("inventory_management")
export const product_table = mySchema.table("products", {
    id: int("id").primaryKey().autoincrement(),
    product_brand: text("product_brand"),
    item_name: text("item_name"),
    description: text("description"),
    product_type: text("product_type"),
    unit_cost: int("unit_cost"),
    unit_price: int("unit_price"),
    stock: int("stock"),
    images: text("images")
});

export const user_table = mySchema.table("users", {
    id: int("id").primaryKey().autoincrement(),
    username: text("username"),
    full_name: text("full_name"),
    address: text("address"),
    phone_number: text("phone_number"),
    password: text("password"),
});

export const sales_history = mySchema.table("sales_history", {
    id: int("id").primaryKey().autoincrement(),
    item_id: int("item_id"),
    item_name: text("item_name"),
    price_unit: int("price_unit"),
    units: int("units"),
    total_cost: int("total_cost"),
    time: date("time"),
});

export const inventory_history = mySchema.table("inventory_history", {
    id: int("id").primaryKey().autoincrement(),
    username: text("username"),
    action: text("action"),
    time: date("time"),
});

export const inventory_cost = mySchema.table("inventory_cost", {
    total_cost: int("total_cost"),
    total_profit: int("total_profit")
});

