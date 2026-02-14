import { z } from 'zod';

export const OrderStatusSchema = z.enum(['pending', 'confirmed', 'in_transit', 'delivered', 'completed', 'cancelled']);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderSchema = z.object({
    id: z.string(),
    product_id: z.string(),
    buyer_id: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    total_price: z.number(),
    status: OrderStatusSchema,
    payment_method: z.enum(['cod', 'bank_transfer', 'card']).default('cod'),
    payment_status: z.enum(['pending', 'paid', 'failed']).default('pending'),
    delivery_address: z.string().optional(),
    delivery_lat: z.number().optional(),
    delivery_lng: z.number().optional(),
    delivery_date: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string()
});
export type Order = z.infer<typeof OrderSchema>;

export const CreateOrderSchema = z.object({
    product_id: z.string(),
    quantity: z.number().min(1),
    payment_method: z.enum(['cod', 'bank_transfer', 'card']),
    delivery_address: z.string(),
    delivery_lat: z.number().optional(),
    delivery_lng: z.number().optional(),
});
export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;

export interface OrderWithProduct extends Order {
    product_name: string; // aggregated
    farmer_id: string;
}
