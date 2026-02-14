const Database = require('better-sqlite3');
const db = new Database('./src/database/sqlite.db');

try {
    const users = db.prepare('SELECT id, email, role FROM users').all();
    console.log('--- Users ---');
    console.log(JSON.stringify(users, null, 2));

    const products = db.prepare('SELECT id, name, farmer_id FROM products').all();
    console.log('\n--- Products ---');
    console.log(JSON.stringify(products, null, 2));

    const orders = db.prepare('SELECT * FROM orders').all();
    console.log('\n--- Orders ---');
    console.log(JSON.stringify(orders, null, 2));

} catch (err) {
    console.error(err);
} finally {
    db.close();
}
