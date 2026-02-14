import db from '../config/database';
import { User, Product } from 'agri-connect-shared';

export class UserService {
    async findById(id: string): Promise<User | undefined> {
        const user = db.prepare('SELECT id, email, phone, role, full_name, location_lat, location_lng, address, verified, bio, profile_image, rating, rating_count, created_at, updated_at FROM users WHERE id = ?').get(id) as any;
        if (!user) return undefined;

        return {
            ...user,
            verified: Boolean(user.verified)
        } as User;
    }

    async getFarmerProfile(id: string): Promise<{ farmer: User, products: Product[] } | undefined> {
        const farmer = await this.findById(id);
        if (!farmer || farmer.role !== 'farmer') return undefined;

        // Fetch products by this farmer
        const products = db.prepare(`
            SELECT p.*, u.full_name as farmer_name 
            FROM products p 
            LEFT JOIN users u ON p.farmer_id = u.id 
            WHERE p.farmer_id = ? AND p.status = 'available'
        `).all(id) as any[];

        const formattedProducts = products.map(p => ({
            ...p,
            images: JSON.parse(p.images || '[]'),
            verified: Boolean(p.verified)
        })) as Product[];

        return { farmer, products: formattedProducts };
    }

    async update(id: string, updates: Partial<User>): Promise<User> {
        const fields = Object.keys(updates).filter(key =>
            ['full_name', 'email', 'phone', 'address', 'location_lat', 'location_lng', 'bio', 'farm_name', 'profile_image'].includes(key)
        );
        if (fields.length === 0) return (await this.findById(id)) as User;

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => (updates as any)[field]);

        db.prepare(`UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);

        return (await this.findById(id)) as User;
    }
}
