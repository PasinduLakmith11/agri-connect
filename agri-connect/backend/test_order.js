const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const db = new Database('./src/database/sqlite.db');

async function testOrder() {
    try {
        // Find a product
        const product = db.prepare('SELECT * FROM products LIMIT 1').get();
        if (!product) {
            console.log('No products found in DB. Please add a product first.');
            return;
        }
        console.log('Found product:', product.id, 'Quantity:', product.quantity);

        const buyerId = 'test-buyer-id';
        const data = {
            product_id: product.id,
            quantity: 1,
            delivery_address: 'Test Address',
            delivery_lat: 0,
            delivery_lng: 0
        };

        const id = uuidv4();
        const unitPrice = product.current_price;
        const totalPrice = unitPrice * data.quantity;

        console.log('Creating order:', id);

        const tx = db.transaction(() => {
            db.prepare(`
                INSERT INTO orders (
                    id, product_id, buyer_id, quantity, unit_price, total_price, status,
                    delivery_address, delivery_lat, delivery_lng, created_at, updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, 'pending',
                    ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                )
            `).run(
                id, data.product_id, buyerId, data.quantity, unitPrice, totalPrice,
                data.delivery_address, data.delivery_lat || null, data.delivery_lng || null
            );

            db.prepare('UPDATE products SET quantity = quantity - ? WHERE id = ?').run(data.quantity, data.product_id);
        });

        tx();
        console.log('Order created successfully in transaction');

        const savedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
        console.log('Saved order:', savedOrder);

        const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(product.id);
        console.log('Updated product quantity:', updatedProduct.quantity);

    } catch (err) {
        console.error('Order creation failed:', err);
    } finally {
        db.close();
    }
}

testOrder();
