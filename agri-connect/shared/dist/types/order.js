"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrderSchema = exports.OrderSchema = exports.OrderStatusSchema = void 0;
const zod_1 = require("zod");
exports.OrderStatusSchema = zod_1.z.enum(['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled']);
exports.OrderSchema = zod_1.z.object({
    id: zod_1.z.string(),
    product_id: zod_1.z.string(),
    buyer_id: zod_1.z.string(),
    quantity: zod_1.z.number(),
    unit_price: zod_1.z.number(),
    total_price: zod_1.z.number(),
    status: exports.OrderStatusSchema,
    payment_method: zod_1.z.enum(['cod', 'bank_transfer', 'card']).default('cod'),
    payment_status: zod_1.z.enum(['pending', 'paid', 'failed']).default('pending'),
    delivery_address: zod_1.z.string().optional(),
    delivery_lat: zod_1.z.number().optional(),
    delivery_lng: zod_1.z.number().optional(),
    delivery_date: zod_1.z.string().optional(),
    created_at: zod_1.z.string(),
    updated_at: zod_1.z.string()
});
exports.CreateOrderSchema = zod_1.z.object({
    product_id: zod_1.z.string(),
    quantity: zod_1.z.number().min(1),
    payment_method: zod_1.z.enum(['cod', 'bank_transfer', 'card']),
    delivery_address: zod_1.z.string(),
    delivery_lat: zod_1.z.number().optional(),
    delivery_lng: zod_1.z.number().optional(),
});
//# sourceMappingURL=order.js.map