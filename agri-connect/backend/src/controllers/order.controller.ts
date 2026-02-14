import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { CreateOrderSchema } from 'agri-connect-shared';
import { z } from 'zod';

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

        // If buyer, they can only cancel or confirm receipt
        if (req.user.role === 'buyer') {
            const order = await orderService.findById(id);
            if (!order || order.buyer_id !== req.user.userId) {
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
        } else if (req.user.role !== 'farmer' && req.user.role !== 'logistics' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const order = await orderService.update(id, updates);
        res.json(order);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
