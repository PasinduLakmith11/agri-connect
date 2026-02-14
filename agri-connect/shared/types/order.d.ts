import { z } from 'zod';
export declare const OrderStatusSchema: z.ZodEnum<{
    pending: "pending";
    confirmed: "confirmed";
    in_transit: "in_transit";
    delivered: "delivered";
    cancelled: "cancelled";
}>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export declare const OrderSchema: z.ZodObject<{
    id: z.ZodString;
    product_id: z.ZodString;
    buyer_id: z.ZodString;
    quantity: z.ZodNumber;
    unit_price: z.ZodNumber;
    total_price: z.ZodNumber;
    status: z.ZodEnum<{
        pending: "pending";
        confirmed: "confirmed";
        in_transit: "in_transit";
        delivered: "delivered";
        cancelled: "cancelled";
    }>;
    delivery_address: z.ZodOptional<z.ZodString>;
    delivery_lat: z.ZodOptional<z.ZodNumber>;
    delivery_lng: z.ZodOptional<z.ZodNumber>;
    delivery_date: z.ZodOptional<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, z.core.$strip>;
export type Order = z.infer<typeof OrderSchema>;
export declare const CreateOrderSchema: z.ZodObject<{
    product_id: z.ZodString;
    quantity: z.ZodNumber;
    delivery_address: z.ZodString;
    delivery_lat: z.ZodOptional<z.ZodNumber>;
    delivery_lng: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;
export interface OrderWithProduct extends Order {
    product_name: string;
    farmer_id: string;
}
