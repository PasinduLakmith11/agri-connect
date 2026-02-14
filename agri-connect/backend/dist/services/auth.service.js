"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const jwt_1 = require("../utils/jwt");
class AuthService {
    async register(data) {
        const existingUser = database_1.default.prepare('SELECT id FROM users WHERE email = ? OR phone = ?').get(data.email, data.phone);
        if (existingUser) {
            throw new Error('User with this email or phone already exists');
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const id = (0, uuid_1.v4)();
        const insert = database_1.default.prepare(`
      INSERT INTO users (id, email, phone, password_hash, role, full_name, address, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
        insert.run(id, data.email, data.phone, hashedPassword, data.role, data.full_name, data.address || null);
        const user = database_1.default.prepare('SELECT * FROM users WHERE id = ?').get(id);
        const userDto = {
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
        const { accessToken, refreshToken } = (0, jwt_1.generateTokens)(userDto);
        return { user: userDto, accessToken, refreshToken };
    }
    async login(data) {
        const user = database_1.default.prepare('SELECT * FROM users WHERE email = ?').get(data.email);
        if (!user || !(await bcryptjs_1.default.compare(data.password, user.password_hash))) {
            throw new Error('Invalid credentials');
        }
        // Map to User type (exclude password)
        const userDto = {
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
        const { accessToken, refreshToken } = (0, jwt_1.generateTokens)(userDto);
        return { user: userDto, accessToken, refreshToken };
    }
}
exports.AuthService = AuthService;
