"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
class OrderService {
    async create(data, buyerId) {
        const id = (0, uuid_1.v4)();
        // Get product to check availability and price
        const product = database_1.default.prepare('SELECT * FROM products WHERE id = ?').get(data.product_id);
        if (!product)
            throw new Error('Product not found');
        if (product.quantity < data.quantity)
            throw new Error('Insufficient quantity');
        const unitPrice = product.current_price;
        const totalPrice = unitPrice * data.quantity;
        // Simulate payment status
        const paymentStatus = (data.payment_method === 'card' || data.payment_method === 'bank_transfer') ? 'paid' : 'pending';
        // Start transaction
        const createOrder = database_1.default.transaction(() => {
            console.log('Inserting order record:', id);
            // Create order
            database_1.default.prepare(`
            INSERT INTO orders (
                id, product_id, buyer_id, quantity, unit_price, total_price, status,
                payment_method, payment_status,
                delivery_address, delivery_lat, delivery_lng, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, 'pending',
                ?, ?,
                ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        `).run(id, data.product_id, buyerId, data.quantity, unitPrice, totalPrice, data.payment_method, paymentStatus, data.delivery_address, data.delivery_lat || null, data.delivery_lng || null);
            console.log('Updating product quantity for:', data.product_id);
            // Update product quantity
            database_1.default.prepare('UPDATE products SET quantity = quantity - ? WHERE id = ?').run(data.quantity, data.product_id);
        });
        try {
            createOrder();
            console.log('Order transaction committed successfully');
        }
        catch (error) {
            console.error('Order transaction failed:', error);
            throw error;
        }
        return (await this.findById(id));
    }
    async findById(id) {
        return database_1.default.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    }
    async findByUser(userId, role) {
        if (role === 'buyer') {
            return database_1.default.prepare(`
            SELECT o.*, p.name as product_name, p.farmer_id 
            FROM orders o 
            JOIN products p ON o.product_id = p.id 
            WHERE o.buyer_id = ? 
            ORDER BY o.created_at DESC
        `).all(userId);
        }
        else if (role === 'farmer') {
            return database_1.default.prepare(`
            SELECT o.*, p.name as product_name, p.farmer_id 
            FROM orders o 
            JOIN products p ON o.product_id = p.id 
            WHERE p.farmer_id = ? 
            ORDER BY o.created_at DESC
        `).all(userId);
        }
        return [];
    }
}
exports.OrderService = OrderService;
