import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { orders, products, users } from '../database/schema';
import { eq, and, desc, sql, aliasedTable } from 'drizzle-orm';
import { CreateOrderRequest, Order } from 'agri-connect-shared';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

export class OrderService {
    async create(data: CreateOrderRequest, buyerId: string): Promise<Order> {
        if (!db) throw new Error('Database not initialized');
        const id = uuidv4();

        // Use a transaction
        return await db.transaction(async (tx) => {
            // Get product to check availability and price
            const productRecord = (await tx.select().from(products).where(eq(products.id, data.product_id)).limit(1))[0];

            if (!productRecord) throw new Error('Product not found');
            if (productRecord.quantity < data.quantity) throw new Error('Insufficient quantity');

            const unitPrice = productRecord.currentPrice;
            const totalPrice = unitPrice * data.quantity;

            // Simulate payment status
            const paymentStatus = (data.payment_method === 'card' || data.payment_method === 'bank_transfer') ? 'paid' : 'pending';

            // Create order
            await tx.insert(orders).values({
                id,
                productId: data.product_id,
                buyerId,
                quantity: data.quantity,
                unitPrice,
                totalPrice,
                status: 'pending',
                paymentMethod: data.payment_method,
                paymentStatus,
                deliveryAddress: data.delivery_address,
                deliveryLat: data.delivery_lat || null,
                deliveryLng: data.delivery_lng || null,
            });

            // Update product quantity
            await tx.update(products)
                .set({ quantity: sql`${products.quantity} - ${data.quantity}` })
                .where(eq(products.id, data.product_id));

            // Notify Farmer (after transaction)
            if (productRecord && productRecord.farmerId) {
                notificationService.create({
                    user_id: productRecord.farmerId,
                    title: 'New Order Received! 🚜',
                    message: `You have a new order for ${productRecord.name}. Please confirm it.`,
                    type: 'new_order',
                    related_id: id
                }).catch(err => console.error('Failed to create notification:', err));
            }

            const createdOrder = (await tx.select().from(orders).where(eq(orders.id, id)).limit(1))[0];
            return {
                id: createdOrder.id,
                product_id: createdOrder.productId,
                buyer_id: createdOrder.buyerId,
                quantity: createdOrder.quantity,
                unit_price: createdOrder.unitPrice,
                total_price: createdOrder.totalPrice,
                status: createdOrder.status as any,
                payment_method: createdOrder.paymentMethod || 'cod',
                payment_status: createdOrder.paymentStatus || 'pending',
                delivery_address: createdOrder.deliveryAddress || '',
                delivery_lat: createdOrder.deliveryLat || 0,
                delivery_lng: createdOrder.deliveryLng || 0,
                created_at: createdOrder.createdAt?.toISOString() || '',
                updated_at: createdOrder.updatedAt?.toISOString() || ''
            } as Order;
        });
    }

    async findById(id: string): Promise<Order | undefined> {
        if (!db) throw new Error('Database not initialized');
        const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
        const o = result[0];
        if (!o) return undefined;

        return {
            id: o.id,
            product_id: o.productId,
            buyer_id: o.buyerId,
            quantity: o.quantity,
            unit_price: o.unitPrice,
            total_price: o.totalPrice,
            status: o.status as any,
            payment_method: o.paymentMethod || 'cod',
            payment_status: o.paymentStatus || 'pending',
            delivery_address: o.deliveryAddress || '',
            delivery_lat: o.deliveryLat || 0,
            delivery_lng: o.deliveryLng || 0,
            created_at: o.createdAt?.toISOString() || '',
            updated_at: o.updatedAt?.toISOString() || ''
        } as Order;
    }

    async findByUser(userId: string, role: string): Promise<Order[]> {
        if (!db) throw new Error('Database not initialized');

        // Aliases for the users table to distinguish between buyer and farmer
        const buyers = aliasedTable(users, 'buyers');
        const farmers = aliasedTable(users, 'farmers');

        let query = db.select({
            id: orders.id,
            productId: orders.productId,
            buyerId: orders.buyerId,
            quantity: orders.quantity,
            unitPrice: orders.unitPrice,
            totalPrice: orders.totalPrice,
            status: orders.status,
            paymentMethod: orders.paymentMethod,
            paymentStatus: orders.paymentStatus,
            deliveryAddress: orders.deliveryAddress,
            deliveryLat: orders.deliveryLat,
            deliveryLng: orders.deliveryLng,
            deliveryDate: orders.deliveryDate,
            createdAt: orders.createdAt,
            updatedAt: orders.updatedAt,
            productName: products.name,
            farmerId: products.farmerId,
            // Buyer Details
            buyerName: buyers.fullName,
            buyerPhone: buyers.phone,
            buyerLat: buyers.locationLat,
            buyerLng: buyers.locationLng,
            // Farmer Details
            farmerName: farmers.fullName,
            farmName: farmers.farmName,
            farmerPhone: farmers.phone,
            farmerAddress: farmers.address,
            farmerLat: farmers.locationLat,
            farmerLng: farmers.locationLng
        })
            .from(orders)
            .innerJoin(products, eq(orders.productId, products.id))
            .innerJoin(farmers, eq(products.farmerId, farmers.id))
            .innerJoin(buyers, eq(orders.buyerId, buyers.id));

        let results;
        if (role === 'buyer') {
            results = await query.where(eq(orders.buyerId, userId)).orderBy(desc(orders.createdAt));
        } else if (role === 'farmer') {
            results = await query.where(eq(products.farmerId, userId)).orderBy(desc(orders.createdAt));
        } else {
            // Logistics/Admin see all
            results = await query.orderBy(desc(orders.createdAt));
        }

        return results.map(o => ({
            id: o.id,
            product_id: o.productId,
            buyer_id: o.buyerId,
            quantity: o.quantity,
            unit_price: o.unitPrice,
            total_price: o.totalPrice,
            status: o.status as any,
            payment_method: o.paymentMethod || 'cod',
            payment_status: o.paymentStatus || 'pending',
            delivery_address: o.deliveryAddress || '',
            delivery_lat: o.deliveryLat || o.buyerLat || 0,
            delivery_lng: o.deliveryLng || o.buyerLng || 0,
            created_at: o.createdAt?.toISOString() || '',
            updated_at: o.updatedAt?.toISOString() || '',
            product_name: o.productName,
            farmer_id: o.farmerId,
            // Extended details for logistics
            buyer_name: o.buyerName,
            buyer_phone: o.buyerPhone,
            farmer_name: o.farmName || o.farmerName,
            farmer_phone: o.farmerPhone,
            farmer_address: o.farmerAddress,
            farmer_lat: o.farmerLat || 0,
            farmer_lng: o.farmerLng || 0
        })) as any[]; // Cast to any to support extended fields
    }

    async update(id: string, updates: Partial<Order>): Promise<Order> {
        if (!db) throw new Error('Database not initialized');

        return await db.transaction(async (tx) => {
            const currentOrder = (await tx.select().from(orders).where(eq(orders.id, id)).limit(1))[0];
            if (!currentOrder) throw new Error('Order not found');

            // If cancelling, restore quantity
            if (updates.status === 'cancelled' && currentOrder.status !== 'cancelled') {
                await tx.update(products)
                    .set({ quantity: sql`${products.quantity} + ${currentOrder.quantity}` })
                    .where(eq(products.id, currentOrder.productId));
            }

            const dbUpdates: any = { updatedAt: new Date() };
            if (updates.status) dbUpdates.status = updates.status;
            if (updates.payment_status) dbUpdates.paymentStatus = updates.payment_status;

            await tx.update(orders).set(dbUpdates).where(eq(orders.id, id));

            // Fetch and notify buyer for status changes
            if (updates.status) {
                const orderWithProduct = (await tx.select({
                    id: orders.id,
                    buyerId: orders.buyerId,
                    productName: products.name
                })
                    .from(orders)
                    .innerJoin(products, eq(orders.productId, products.id))
                    .where(eq(orders.id, id))
                    .limit(1))[0];

                if (orderWithProduct) {
                    let title = 'Order Update! 📦';
                    let message = `Your order for ${orderWithProduct.productName} is now ${updates.status.replace('_', ' ')}.`;

                    if (updates.status === 'confirmed') {
                        title = 'Order Accepted! ✅';
                        message = `The farmer has accepted your order for ${orderWithProduct.productName}. Ready for logistics!`;
                    } else if (updates.status === 'in_transit') {
                        title = 'On the Way! 🚚';
                        message = `Your order for ${orderWithProduct.productName} has been picked up and is in transit.`;
                    } else if (updates.status === 'delivered') {
                        title = 'Success! 🥳';
                        message = `Your order for ${orderWithProduct.productName} has been delivered. Enjoy!`;
                    }

                    notificationService.create({
                        user_id: orderWithProduct.buyerId,
                        title,
                        message,
                        type: 'order_status',
                        related_id: id
                    }).catch(err => console.error('Failed to notify buyer:', err));
                }
            }

            return (await this.findById(id)) as Order;
        });
    }
}
