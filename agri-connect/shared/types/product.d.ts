import { z } from 'zod';
export declare const ProductStatusSchema: z.ZodEnum<{
    available: "available";
    sold: "sold";
    reserved: "reserved";
}>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export declare const ProductSchema: z.ZodObject<{
    id: z.ZodString;
    farmer_id: z.ZodString;
    name: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    unit: z.ZodString;
    base_price: z.ZodNumber;
    current_price: z.ZodNumber;
    harvest_date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    expiry_date: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    location_lat: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    location_lng: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    images: z.ZodOptional<z.ZodArray<z.ZodString>>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        available: "available";
        sold: "sold";
        reserved: "reserved";
    }>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, z.core.$strip>;
export type Product = z.infer<typeof ProductSchema>;
export declare const CreateProductSchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    unit: z.ZodString;
    base_price: z.ZodNumber;
    harvest_date: z.ZodOptional<z.ZodString>;
    expiry_date: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    location_lat: z.ZodOptional<z.ZodNumber>;
    location_lng: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type CreateProductRequest = z.infer<typeof CreateProductSchema>;
