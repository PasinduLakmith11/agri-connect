"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductSchema = exports.ProductSchema = exports.ProductStatusSchema = void 0;
const zod_1 = require("zod");
exports.ProductStatusSchema = zod_1.z.enum(['available', 'sold', 'reserved']);
exports.ProductSchema = zod_1.z.object({
    id: zod_1.z.string(),
    farmer_id: zod_1.z.string(),
    name: zod_1.z.string(),
    category: zod_1.z.string().optional(),
    quantity: zod_1.z.number(),
    unit: zod_1.z.string(),
    base_price: zod_1.z.number(),
    current_price: zod_1.z.number(),
    harvest_date: zod_1.z.string().nullable().optional(),
    expiry_date: zod_1.z.string().nullable().optional(),
    location_lat: zod_1.z.number().nullable().optional(),
    location_lng: zod_1.z.number().nullable().optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(), // JSON string in DB, array here
    description: zod_1.z.string().optional(),
    status: exports.ProductStatusSchema,
    created_at: zod_1.z.string(),
    updated_at: zod_1.z.string()
});
exports.CreateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    category: zod_1.z.string().optional(),
    quantity: zod_1.z.number().min(1, "Quantity must be at least 1"), // Handle as number, form might send string
    unit: zod_1.z.string().min(1),
    base_price: zod_1.z.number().min(0),
    harvest_date: zod_1.z.string().optional(),
    expiry_date: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    location_lat: zod_1.z.number().optional(),
    location_lng: zod_1.z.number().optional(),
});
