"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyOrders = exports.createOrder = void 0;
const order_service_1 = require("../services/order.service");
const agri_connect_shared_1 = require("agri-connect-shared");
const zod_1 = require("zod");
const orderService = new order_service_1.OrderService();
const createOrder = async (req, res) => {
    try {
        const data = agri_connect_shared_1.CreateOrderSchema.parse(req.body);
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const order = await orderService.create(data, req.user.userId);
        res.status(201).json(order);
    }
    catch (error) {
        console.error('Create order error:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }
        res.status(400).json({ message: error.message || 'Failed to create order' });
    }
};
exports.createOrder = createOrder;
const getMyOrders = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const orders = await orderService.findByUser(req.user.userId, req.user.role);
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMyOrders = getMyOrders;
