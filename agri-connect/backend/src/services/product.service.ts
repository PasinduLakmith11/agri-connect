import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { Product, CreateProductRequest } from 'agri-connect-shared';

export class ProductService {
    async create(data: CreateProductRequest, farmerId: string, imagePaths: string[]): Promise<Product> {
        const id = uuidv4();
        const imagesJson = JSON.stringify(imagePaths);

        const insert = db.prepare(`
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

        insert.run(
            id, farmerId, data.name, data.category || null, data.quantity, data.unit, data.base_price, data.base_price, // current_price starts as base_price
            data.harvest_date || null, data.expiry_date || null, data.location_lat || null, data.location_lng || null,
            imagesJson, data.description || null
        );

        return (await this.findById(id)) as unknown as Product;
    }

    async findAll(filters: any = {}): Promise<Product[]> {
        let query = `
            SELECT p.*, u.full_name as farmer_name 
            FROM products p 
            LEFT JOIN users u ON p.farmer_id = u.id 
            WHERE p.is_deleted = 0
        `;
        const params: any[] = [];

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

        const products = db.prepare(query).all(...params) as any[];
        return products.map(p => ({
            ...p,
            images: JSON.parse(p.images || '[]'),
            verified: Boolean(p.verified)
        })) as Product[];
    }

    async findById(id: string): Promise<Product | undefined> {
        const product = db.prepare(`
            SELECT p.*, u.full_name as farmer_name 
            FROM products p 
            LEFT JOIN users u ON p.farmer_id = u.id 
            WHERE p.id = ? AND p.is_deleted = 0
        `).get(id) as any;

        if (!product) return undefined;

        return {
            ...product,
            images: JSON.parse(product.images || '[]')
        } as Product;
    }

    async update(id: string, data: Partial<CreateProductRequest>, userId: string): Promise<Product> {
        // Verify ownership
        const product = await this.findById(id);
        if (!product) throw new Error('Product not found or deleted');
        if (product.farmer_id !== userId) throw new Error('Unauthorized');

        // Build update query dynamically
        const updates: string[] = [];
        const params: any[] = [];

        Object.keys(data).forEach(key => {
            if (data[key as keyof CreateProductRequest] !== undefined) {
                updates.push(`${key} = ?`);
                params.push(data[key as keyof CreateProductRequest]);
            }
        });

        updates.push('updated_at = CURRENT_TIMESTAMP');

        const updateQuery = `UPDATE products SET ${updates.join(', ')} WHERE id = ? AND is_deleted = 0`;
        params.push(id);

        db.prepare(updateQuery).run(...params);

        return (await this.findById(id)) as unknown as Product;
    }

    async updatePrice(id: string, basePrice: number, currentPrice: number, userId: string): Promise<Product> {
        const product = await this.findById(id);
        if (!product) throw new Error('Product not found or deleted');
        if (product.farmer_id !== userId) throw new Error('Unauthorized');

        db.prepare(`
            UPDATE products 
            SET base_price = ?, current_price = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? AND is_deleted = 0
        `).run(basePrice, currentPrice, id);

        return (await this.findById(id)) as unknown as Product;
    }

    async delete(id: string, userId: string): Promise<void> {
        const product = await this.findById(id);
        if (!product) throw new Error('Product not found or already deleted');
        if (product.farmer_id !== userId) throw new Error('Unauthorized');

        db.prepare('UPDATE products SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    }
}
