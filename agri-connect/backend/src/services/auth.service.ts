import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { users } from '../database/schema';
import { eq, or } from 'drizzle-orm';
import { RegisterRequest, LoginRequest, User, AuthResponse } from 'agri-connect-shared';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

export class AuthService {
    async register(data: RegisterRequest): Promise<AuthResponse> {
        if (!db) throw new Error('Database not initialized');

        const existingUser = await db.select()
            .from(users)
            .where(
                or(
                    eq(users.email, data.email),
                    eq(users.phone, data.phone)
                )
            )
            .limit(1);

        if (existingUser.length > 0) {
            throw new Error('User with this email or phone already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const id = uuidv4();

        await db.insert(users).values({
            id,
            email: data.email,
            phone: data.phone,
            passwordHash: hashedPassword,
            role: data.role as any,
            fullName: data.full_name,
            address: data.address || null,
        });

        const userRecord = (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];

        const userDto: User = {
            id: userRecord.id,
            email: userRecord.email,
            phone: userRecord.phone,
            role: userRecord.role as any,
            full_name: userRecord.fullName,
            location_lat: userRecord.locationLat,
            location_lng: userRecord.locationLng,
            address: userRecord.address,
            bio: userRecord.bio,
            farm_name: userRecord.farmName,
            profile_image: userRecord.profileImage,
            rating: userRecord.rating || 0,
            rating_count: userRecord.ratingCount || 0,
            verified: Boolean(userRecord.verified),
            created_at: userRecord.createdAt?.toISOString() || '',
            updated_at: userRecord.updatedAt?.toISOString() || ''
        };

        const { accessToken, refreshToken } = generateTokens(userDto);

        return { user: userDto, accessToken, refreshToken };
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        if (!db) throw new Error('Database not initialized');

        const userRecord = (await db.select().from(users).where(eq(users.email, data.email)).limit(1))[0];

        if (!userRecord || !(await bcrypt.compare(data.password, userRecord.passwordHash))) {
            throw new Error('Invalid credentials');
        }

        const userDto: User = {
            id: userRecord.id,
            email: userRecord.email,
            phone: userRecord.phone,
            role: userRecord.role as any,
            full_name: userRecord.fullName,
            location_lat: userRecord.locationLat,
            location_lng: userRecord.locationLng,
            address: userRecord.address,
            bio: userRecord.bio,
            farm_name: userRecord.farmName,
            profile_image: userRecord.profileImage,
            rating: userRecord.rating || 0,
            rating_count: userRecord.ratingCount || 0,
            verified: Boolean(userRecord.verified),
            created_at: userRecord.createdAt?.toISOString() || '',
            updated_at: userRecord.updatedAt?.toISOString() || ''
        };

        const { accessToken, refreshToken } = generateTokens(userDto);

        return { user: userDto, accessToken, refreshToken };
    }

    async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
        if (!db) throw new Error('Database not initialized');

        const payload = verifyRefreshToken(token);
        if (!payload) {
            throw new Error('Invalid or expired refresh token');
        }

        const userRecord = (await db.select().from(users).where(eq(users.id, payload.userId)).limit(1))[0];
        if (!userRecord) {
            throw new Error('User not found');
        }

        const userDto: User = {
            id: userRecord.id,
            email: userRecord.email,
            phone: userRecord.phone,
            role: userRecord.role as any,
            full_name: userRecord.fullName,
            location_lat: userRecord.locationLat,
            location_lng: userRecord.locationLng,
            address: userRecord.address,
            bio: userRecord.bio,
            farm_name: userRecord.farmName,
            profile_image: userRecord.profileImage,
            rating: userRecord.rating || 0,
            rating_count: userRecord.ratingCount || 0,
            verified: Boolean(userRecord.verified),
            created_at: userRecord.createdAt?.toISOString() || '',
            updated_at: userRecord.updatedAt?.toISOString() || ''
        };

        return generateTokens(userDto);
    }
}
