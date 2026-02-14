"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.RegisterSchema = exports.UserSchema = exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
exports.UserRoleSchema = zod_1.z.enum(['farmer', 'buyer', 'logistics', 'admin']);
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string(),
    role: exports.UserRoleSchema,
    full_name: zod_1.z.string(),
    location_lat: zod_1.z.number().nullable().optional(),
    location_lng: zod_1.z.number().nullable().optional(),
    address: zod_1.z.string().nullable().optional(),
    verified: zod_1.z.boolean().default(false),
    created_at: zod_1.z.string(),
    updated_at: zod_1.z.string()
});
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    phone: zod_1.z.string(),
    password: zod_1.z.string().min(6),
    role: exports.UserRoleSchema,
    full_name: zod_1.z.string(),
    address: zod_1.z.string().optional()
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
