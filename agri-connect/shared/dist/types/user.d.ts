import { z } from 'zod';
export declare const UserRoleSchema: z.ZodEnum<{
    farmer: "farmer";
    buyer: "buyer";
    logistics: "logistics";
    admin: "admin";
}>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    role: z.ZodEnum<{
        farmer: "farmer";
        buyer: "buyer";
        logistics: "logistics";
        admin: "admin";
    }>;
    full_name: z.ZodString;
    location_lat: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    location_lng: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    address: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    profile_image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    rating: z.ZodDefault<z.ZodNumber>;
    rating_count: z.ZodDefault<z.ZodNumber>;
    verified: z.ZodDefault<z.ZodBoolean>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, z.core.$strip>;
export type User = z.infer<typeof UserSchema>;
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<{
        farmer: "farmer";
        buyer: "buyer";
        logistics: "logistics";
        admin: "admin";
    }>;
    full_name: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}
