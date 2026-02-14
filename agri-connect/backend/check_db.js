const Database = require('better-sqlite3');
const db = new Database('./src/database/sqlite.db');

console.log('--- USERS SCHEMA ---');
const usersInfo = db.prepare("PRAGMA table_info(users)").all();
console.log(JSON.stringify(usersInfo, null, 2));

console.log('\n--- PENDING ORDERS ---');
const orders = db.prepare("SELECT id, status, delivery_lat, delivery_lng, delivery_address, product_id FROM orders WHERE status = 'pending'").all();
console.log(JSON.stringify(orders, null, 2));

console.log('\n--- PRODUCT LOCATIONS FOR PENDING ORDERS ---');
for (const order of orders) {
    const product = db.prepare("SELECT id, location_lat, location_lng FROM products WHERE id = ?").get(order.product_id);
    console.log(`Order ${order.id}: Product ${order.product_id} ->`, JSON.stringify(product));
}
