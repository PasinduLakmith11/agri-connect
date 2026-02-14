import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { CreateOrderRequest, Order } from 'agri-connect-shared';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

export class OrderService {
    async create(data: CreateOrderRequest, buyerId: string): Promise<Order> {
        const id = uuidv4();

        // Get product to check availability and price
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(data.product_id) as any;
        if (!product) throw new Error('Product not found');
        if (product.quantity < data.quantity) throw new Error('Insufficient quantity');

        const unitPrice = product.current_price;
        const totalPrice = unitPrice * data.quantity;

        // Simulate payment status
        const paymentStatus = (data.payment_method === 'card' || data.payment_method === 'bank_transfer') ? 'paid' : 'pending';

        // Start transaction
        const createOrder = db.transaction(() => {
            console.log('Inserting order record:', id);
            // Create order
            db.prepare(`
            INSERT INTO orders (
                id, product_id, buyer_id, quantity, unit_price, total_price, status,
                payment_method, payment_status,
                delivery_address, delivery_lat, delivery_lng, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, 'pending',
                ?, ?,
                ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        `).run(
                id, data.product_id, buyerId, data.quantity, unitPrice, totalPrice,
                data.payment_method, paymentStatus,
                data.delivery_address, data.delivery_lat || null, data.delivery_lng || null
            );

            console.log('Updating product quantity for:', data.product_id);
            // Update product quantity
            db.prepare('UPDATE products SET quantity = quantity - ? WHERE id = ?').run(data.quantity, data.product_id);
        });

        try {
            createOrder();
            console.log('Order transaction committed successfully');

            // Notify Farmer
            if (product && product.farmer_id) {
                notificationService.create({
                    user_id: product.farmer_id,
                    title: 'New Order Received! 🚜',
                    message: `You have a new order for ${product.name}. Please confirm it.`,
                    type: 'new_order',
                    related_id: id
                }).catch(err => console.error('Failed to create notification:', err));
            }
        } catch (error) {
            console.error('Order transaction failed:', error);
            throw error;
        }

        return (await this.findById(id)) as Order;
    }

    async findById(id: string): Promise<Order | undefined> {
        return db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order;
    }

    async findByUser(userId: string, role: string): Promise<Order[]> {
        if (role === 'buyer') {
            return db.prepare(`
            SELECT o.*, p.name as product_name, p.farmer_id 
            FROM orders o 
            JOIN products p ON o.product_id = p.id 
            WHERE o.buyer_id = ? 
            ORDER BY o.created_at DESC
        `).all(userId) as Order[];
        } else if (role === 'farmer') {
            return db.prepare(`
            SELECT o.*, p.name as product_name, p.farmer_id 
            FROM orders o 
            JOIN products p ON o.product_id = p.id 
            WHERE p.farmer_id = ? 
            ORDER BY o.created_at DESC
        `).all(userId) as Order[];
        }
        return [];
    }

    async update(id: string, updates: Partial<Order>): Promise<Order> {
        const fields = Object.keys(updates).filter(key => ['status', 'payment_status'].includes(key));
        if (fields.length === 0) return (await this.findById(id)) as Order;

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => (updates as any)[field]);

        // Start transaction for status updates that need side effects (like cancellation)
        const updateTransaction = db.transaction(() => {
            // If cancelling, restore quantity
            if (updates.status === 'cancelled') {
                const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Order;
                if (order && order.status !== 'cancelled') {
                    db.prepare('UPDATE products SET quantity = quantity + ? WHERE id = ?').run(order.quantity, order.product_id);
                }
            }

            db.prepare(`UPDATE orders SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);

            // Fetch and notify buyer for status changes
            if (updates.status) {
                const order = db.prepare('SELECT o.*, p.name as product_name FROM orders o JOIN products p ON o.product_id = p.id WHERE o.id = ?').get(id) as any;
                if (order) {
                    let title = 'Order Update! 📦';
                    let message = `Your order for ${order.product_name} is now ${updates.status.replace('_', ' ')}.`;

                    if (updates.status === 'confirmed') {
                        title = 'Order Accepted! ✅';
                        message = `The farmer has accepted your order for ${order.product_name}. Ready for logistics!`;
                    } else if (updates.status === 'in_transit') {
                        title = 'On the Way! 🚚';
                        message = `Your order for ${order.product_name} has been picked up and is in transit.`;
                    } else if (updates.status === 'delivered') {
                        title = 'Success! 🥳';
                        message = `Your order for ${order.product_name} has been delivered. Enjoy!`;
                    } else if ((updates.status as any) === 'completed') {
                        title = 'Mission Accomplished! 🏁';
                        message = `The buyer has confirmed receipt of ${order.product_name}. Trip finalized.`;
                    }

                    notificationService.create({
                        user_id: order.buyer_id,
                        title,
                        message,
                        type: 'order_status',
                        related_id: id
                    }).catch(err => console.error('Failed to notify buyer:', err));
                }
            }
        });

        updateTransaction();

        return (await this.findById(id)) as Order;
    }
}
