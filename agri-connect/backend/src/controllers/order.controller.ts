import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { CreateOrderSchema } from 'agri-connect-shared';
import { z } from 'zod';
import { db } from '../database';
import { products } from '../database/schema';
import { eq } from 'drizzle-orm';

const orderService = new OrderService();

export const createOrder = async (req: Request, res: Response) => {
    try {
        const data = CreateOrderSchema.parse(req.body);
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const order = await orderService.create(data, req.user.userId);
        res.status(201).json(order);
    } catch (error: any) {
        console.error('Create order error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: (error as z.ZodError).errors });
        }
        res.status(400).json({ message: error.message || 'Failed to create order' });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const orders = await orderService.findByUser(req.user.userId, req.user.role);
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
export const updateOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        console.log(`Update Order Attempt - User: ${req.user.userId}, Role: ${req.user.role}, Attempting updates:`, updates);

        const user = req.user;
        const role = user.role.toLowerCase();

        // Fetch order to check ownership
        const order = await orderService.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (role === 'buyer') {
            if (order.buyer_id !== user.userId) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            // Buyer can cancel or mark as completed (confirm receipt)
            if (updates.status !== 'cancelled' && updates.status !== 'completed') {
                return res.status(400).json({ message: 'Buyers can only cancel or confirm receipt' });
            }

            // Can only cancel if pending or confirmed
            if (updates.status === 'cancelled' && order.status !== 'pending' && order.status !== 'confirmed') {
                return res.status(400).json({ message: `Cannot cancel order in ${order.status} state` });
            }

            // Can only mark completed if delivered
            if (updates.status === 'completed' && order.status !== 'delivered') {
                return res.status(400).json({ message: 'Can only confirm receipt for orders that are delivered' });
            }
        } else if (role === 'farmer') {
            // Farmers can only update orders for their own products
            if (!db) return res.status(500).json({ message: 'Database not initialized' });
            const productResult = await db.select({ farmerId: products.farmerId })
                .from(products)
                .where(eq(products.id, order.product_id))
                .limit(1);

            const product = productResult[0];
            console.log(`Farmer Ownership Check - User: ${user.userId}, Product Owner: ${product?.farmerId}`);
            if (!product || product.farmerId !== user.userId) {
                return res.status(403).json({
                    message: 'Forbidden: You do not own the product in this order',
                    details: { orderId: id, farmerId: user.userId, productOwnerId: product?.farmerId }
                });
            }
        } else if (role !== 'logistics' && role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const updatedOrder = await orderService.update(id, updates);
        res.json(updatedOrder);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
