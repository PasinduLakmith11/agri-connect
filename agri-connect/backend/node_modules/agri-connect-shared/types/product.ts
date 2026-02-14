import { z } from 'zod';

export const ProductStatusSchema = z.enum(['available', 'sold', 'reserved']);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

export const ProductSchema = z.object({
    id: z.string(),
    farmer_id: z.string(),
    name: z.string(),
    category: z.string().optional(),
    quantity: z.number(),
    unit: z.string(),
    base_price: z.number(),
    current_price: z.number(),
    harvest_date: z.string().nullable().optional(),
    expiry_date: z.string().nullable().optional(),
    location_lat: z.number().nullable().optional(),
    location_lng: z.number().nullable().optional(),
    images: z.array(z.string()).optional(), // JSON string in DB, array here
    description: z.string().optional(),
    status: ProductStatusSchema,
    farmer_name: z.string().optional(),
    is_deleted: z.number().default(0),
    created_at: z.string(),
    updated_at: z.string()
});
export type Product = z.infer<typeof ProductSchema>;

export const CreateProductSchema = z.object({
    name: z.string().min(3),
    category: z.string().optional(),
    quantity: z.number().min(1, "Quantity must be at least 1"), // Handle as number, form might send string
    unit: z.string().min(1),
    base_price: z.number().min(0),
    current_price: z.number().min(0).optional(),
    harvest_date: z.string().optional(),
    expiry_date: z.string().optional(),
    description: z.string().optional(),
    location_lat: z.number().optional(),
    location_lng: z.number().optional(),
});
export type CreateProductRequest = z.infer<typeof CreateProductSchema>;
