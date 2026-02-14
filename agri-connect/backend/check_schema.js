const Database = require('better-sqlite3');
const path = require('path');

const db = new Database('./src/database/sqlite.db');

try {
    console.log('--- Orders Table ---');
    const orderColumns = db.prepare('PRAGMA table_info(orders)').all();
    console.log(JSON.stringify(orderColumns, null, 2));

    console.log('\n--- Products Table ---');
    const productColumns = db.prepare('PRAGMA table_info(products)').all();
    console.log(JSON.stringify(productColumns, null, 2));

    console.log('\n--- Order Samples (if any) ---');
    const orders = db.prepare('SELECT * FROM orders LIMIT 2').all();
    console.log(JSON.stringify(orders, null, 2));

} catch (err) {
    console.error(err);
} finally {
    db.close();
}
