const Database = require('better-sqlite3');
const db = new Database('./src/database/sqlite.db');

console.log('--- DEBUG ROUTE SERVICE DATA ---');

// 1. Get Pending Orders
const orders = db.prepare("SELECT * FROM orders WHERE status = 'pending' OR status = 'confirmed'").all();
console.log(`Found ${orders.length} pending/confirmed orders.`);

for (const order of orders) {
    console.log(`\nOrder ID: ${order.id}`);
    console.log(`  Status: ${order.status}`);
    console.log(`  Delivery Lat/Lng: ${order.delivery_lat}, ${order.delivery_lng}`);
    console.log(`  Buyer ID: ${order.buyer_id}`);

    // Check Buyer
    const buyer = db.prepare('SELECT id, full_name, location_lat, location_lng FROM users WHERE id = ?').get(order.buyer_id);
    console.log(`  Buyer Profile: ${buyer ? `Lat: ${buyer.location_lat}, Lng: ${buyer.location_lng}` : 'Not Found'}`);

    // Check Product
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(order.product_id);
    if (product) {
        console.log(`  Product ID: ${product.id}`);
        console.log(`  Product Location: ${product.location_lat}, ${product.location_lng}`);
        console.log(`  Farmer ID: ${product.farmer_id}`);

        const farmer = db.prepare('SELECT id, full_name, location_lat, location_lng FROM users WHERE id = ?').get(product.farmer_id);
        console.log(`  Farmer Profile: ${farmer ? `Lat: ${farmer.location_lat}, Lng: ${farmer.location_lng}` : 'Not Found'}`);
    } else {
        console.log('  Product Not Found!');
    }
}
