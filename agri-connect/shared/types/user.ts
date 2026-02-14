import { z } from 'zod';

export const UserRoleSchema = z.enum(['farmer', 'buyer', 'logistics', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    phone: z.string(),
    role: UserRoleSchema,
    full_name: z.string(),
    location_lat: z.number().nullable().optional(),
    location_lng: z.number().nullable().optional(),
    address: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    farm_name: z.string().nullable().optional(),
    profile_image: z.string().nullable().optional(),
    rating: z.number().default(0),
    rating_count: z.number().default(0),
    verified: z.boolean().default(false),
    created_at: z.string(),
    updated_at: z.string()
});
export type User = z.infer<typeof UserSchema>;

export const RegisterSchema = z.object({
    email: z.string().email(),
    phone: z.string(),
    password: z.string().min(6),
    role: UserRoleSchema,
    full_name: z.string(),
    address: z.string().optional()
});
export type RegisterRequest = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});
export type LoginRequest = z.infer<typeof LoginSchema>;

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}
