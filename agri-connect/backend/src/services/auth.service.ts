import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { RegisterRequest, LoginRequest, User, AuthResponse } from 'agri-connect-shared';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

export class AuthService {
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ? OR phone = ?').get(data.email, data.phone);

        if (existingUser) {
            throw new Error('User with this email or phone already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const id = uuidv4();

        const insert = db.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role, full_name, address, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

        insert.run(id, data.email, data.phone, hashedPassword, data.role, data.full_name, data.address || null);

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;

        const userDto: User = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            full_name: user.full_name,
            location_lat: user.location_lat,
            location_lng: user.location_lng,
            address: user.address,
            rating: user.rating || 0,
            rating_count: user.rating_count || 0,
            verified: Boolean(user.verified),
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        const { accessToken, refreshToken } = generateTokens(userDto);

        return { user: userDto, accessToken, refreshToken };
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(data.email) as any;

        if (!user || !(await bcrypt.compare(data.password, user.password_hash))) {
            throw new Error('Invalid credentials');
        }

        // Map to User type (exclude password)
        const userDto: User = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            full_name: user.full_name,
            location_lat: user.location_lat,
            location_lng: user.location_lng,
            address: user.address,
            rating: user.rating || 0,
            rating_count: user.rating_count || 0,
            verified: Boolean(user.verified),
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        const { accessToken, refreshToken } = generateTokens(userDto);

        return { user: userDto, accessToken, refreshToken };
    }

    async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = verifyRefreshToken(token);
        if (!payload) {
            throw new Error('Invalid or expired refresh token');
        }

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId) as any;
        if (!user) {
            throw new Error('User not found');
        }

        const userDto: User = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            full_name: user.full_name,
            location_lat: user.location_lat,
            location_lng: user.location_lng,
            address: user.address,
            rating: user.rating || 0,
            rating_count: user.rating_count || 0,
            verified: Boolean(user.verified),
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        return generateTokens(userDto);
    }
}
