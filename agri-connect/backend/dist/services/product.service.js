"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
class ProductService {
    async create(data, farmerId, imagePaths) {
        const id = (0, uuid_1.v4)();
        const imagesJson = JSON.stringify(imagePaths);
        const insert = database_1.default.prepare(`
      INSERT INTO products (
        id, farmer_id, name, category, quantity, unit, base_price, current_price,
        harvest_date, expiry_date, location_lat, location_lng, images, description, status,
        created_at, updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, 'available',
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);
        insert.run(id, farmerId, data.name, data.category || null, data.quantity, data.unit, data.base_price, data.base_price, // current_price starts as base_price
        data.harvest_date || null, data.expiry_date || null, data.location_lat || null, data.location_lng || null, imagesJson, data.description || null);
        return (await this.findById(id));
    }
    async findAll(filters = {}) {
        let query = `
            SELECT p.*, u.full_name as farmer_name 
            FROM products p 
            LEFT JOIN users u ON p.farmer_id = u.id 
            WHERE p.is_deleted = 0
        `;
        const params = [];
        if (filters.category) {
            query += ' AND p.category = ?';
            params.push(filters.category);
        }
        if (filters.farmer_id) {
            query += ' AND p.farmer_id = ?';
            params.push(filters.farmer_id);
        }
        if (filters.status) {
            query += ' AND p.status = ?';
            params.push(filters.status);
        }
        // Simple search
        if (filters.search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }
        query += ' ORDER BY p.created_at DESC';
        const products = database_1.default.prepare(query).all(...params);
        return products.map(p => ({
            ...p,
            images: JSON.parse(p.images || '[]'),
            verified: Boolean(p.verified)
        }));
    }
    async findById(id) {
        const product = database_1.default.prepare(`
            SELECT p.*, u.full_name as farmer_name 
            FROM products p 
            LEFT JOIN users u ON p.farmer_id = u.id 
            WHERE p.id = ? AND p.is_deleted = 0
        `).get(id);
        if (!product)
            return undefined;
        return {
            ...product,
            images: JSON.parse(product.images || '[]')
        };
    }
    async update(id, data, userId) {
        // Verify ownership
        const product = await this.findById(id);
        if (!product)
            throw new Error('Product not found or deleted');
        if (product.farmer_id !== userId)
            throw new Error('Unauthorized');
        // Build update query dynamically
        const updates = [];
        const params = [];
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                updates.push(`${key} = ?`);
                params.push(data[key]);
            }
        });
        updates.push('updated_at = CURRENT_TIMESTAMP');
        const updateQuery = `UPDATE products SET ${updates.join(', ')} WHERE id = ? AND is_deleted = 0`;
        params.push(id);
        database_1.default.prepare(updateQuery).run(...params);
        return (await this.findById(id));
    }
    async updatePrice(id, basePrice, currentPrice, userId) {
        const product = await this.findById(id);
        if (!product)
            throw new Error('Product not found or deleted');
        if (product.farmer_id !== userId)
            throw new Error('Unauthorized');
        database_1.default.prepare(`
            UPDATE products 
            SET base_price = ?, current_price = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? AND is_deleted = 0
        `).run(basePrice, currentPrice, id);
        return (await this.findById(id));
    }
    async delete(id, userId) {
        const product = await this.findById(id);
        if (!product)
            throw new Error('Product not found or already deleted');
        if (product.farmer_id !== userId)
            throw new Error('Unauthorized');
        database_1.default.prepare('UPDATE products SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    }
}
exports.ProductService = ProductService;
