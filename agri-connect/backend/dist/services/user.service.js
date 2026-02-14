"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = __importDefault(require("../config/database"));
class UserService {
    async findById(id) {
        const user = database_1.default.prepare('SELECT id, email, phone, role, full_name, location_lat, location_lng, address, verified, bio, profile_image, rating, rating_count, created_at, updated_at FROM users WHERE id = ?').get(id);
        if (!user)
            return undefined;
        return {
            ...user,
            verified: Boolean(user.verified)
        };
    }
    async getFarmerProfile(id) {
        const farmer = await this.findById(id);
        if (!farmer || farmer.role !== 'farmer')
            return undefined;
        // Fetch products by this farmer
        const products = database_1.default.prepare(`
            SELECT p.*, u.full_name as farmer_name 
            FROM products p 
            LEFT JOIN users u ON p.farmer_id = u.id 
            WHERE p.farmer_id = ? AND p.status = 'available'
        `).all(id);
        const formattedProducts = products.map(p => ({
            ...p,
            images: JSON.parse(p.images || '[]'),
            verified: Boolean(p.verified)
        }));
        return { farmer, products: formattedProducts };
    }
}
exports.UserService = UserService;
