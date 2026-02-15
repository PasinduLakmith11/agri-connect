import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { products, users } from '../database/schema';
import { eq, and, like, or, desc } from 'drizzle-orm';
import { Product, CreateProductRequest } from 'agri-connect-shared';

export class ProductService {
    async create(data: CreateProductRequest, farmerId: string, imagePaths: string[]): Promise<Product> {
        if (!db) throw new Error('Database not initialized');
        const id = uuidv4();
        const imagesJson = JSON.stringify(imagePaths);

        await db.insert(products).values({
            id,
            farmerId,
            name: data.name,
            category: data.category || null,
            quantity: data.quantity,
            unit: data.unit,
            basePrice: data.base_price,
            currentPrice: data.base_price,
            harvestDate: data.harvest_date || null,
            expiryDate: data.expiry_date || null,
            locationLat: data.location_lat || null,
            locationLng: data.location_lng || null,
            address: data.address || null,
            images: imagesJson,
            description: data.description || null,
            status: 'available',
        });

        return (await this.findById(id)) as Product;
    }

    async findAll(filters: any = {}): Promise<Product[]> {
        if (!db) throw new Error('Database not initialized');

        let query = db.select({
            id: products.id,
            farmerId: products.farmerId,
            name: products.name,
            category: products.category,
            quantity: products.quantity,
            unit: products.unit,
            basePrice: products.basePrice,
            currentPrice: products.currentPrice,
            harvestDate: products.harvestDate,
            expiryDate: products.expiryDate,
            locationLat: products.locationLat,
            locationLng: products.locationLng,
            address: products.address,
            images: products.images,
            description: products.description,
            status: products.status,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
            farmerName: users.fullName,
        })
            .from(products)
            .leftJoin(users, eq(products.farmerId, users.id));

        const conditions = [eq(products.isDeleted, 0)];

        if (filters.category) {
            conditions.push(eq(products.category, filters.category));
        }

        if (filters.farmer_id) {
            conditions.push(eq(products.farmerId, filters.farmer_id));
        }

        if (filters.status) {
            conditions.push(eq(products.status, filters.status));
        }

        if (filters.search) {
            conditions.push(
                or(
                    like(products.name, `%${filters.search}%`),
                    like(products.description, `%${filters.search}%`)
                )!
            );
        }

        const results = await query
            .where(and(...conditions))
            .orderBy(desc(products.createdAt));

        return results.map(p => ({
            id: p.id,
            farmer_id: p.farmerId,
            name: p.name,
            category: p.category,
            quantity: p.quantity,
            unit: p.unit,
            base_price: p.basePrice,
            current_price: p.currentPrice,
            harvest_date: p.harvestDate,
            expiry_date: p.expiryDate,
            location_lat: p.locationLat,
            location_lng: p.locationLng,
            address: p.address,
            images: JSON.parse(p.images || '[]'),
            description: p.description,
            status: p.status as any,
            is_deleted: 0,
            created_at: p.createdAt?.toISOString() || '',
            updated_at: p.updatedAt?.toISOString() || '',
            farmer_name: p.farmerName
        })) as Product[];
    }

    async findById(id: string): Promise<Product | undefined> {
        if (!db) throw new Error('Database not initialized');

        const result = await db.select({
            id: products.id,
            farmerId: products.farmerId,
            name: products.name,
            category: products.category,
            quantity: products.quantity,
            unit: products.unit,
            basePrice: products.basePrice,
            currentPrice: products.currentPrice,
            harvestDate: products.harvestDate,
            expiryDate: products.expiryDate,
            locationLat: products.locationLat,
            locationLng: products.locationLng,
            address: products.address,
            images: products.images,
            description: products.description,
            status: products.status,
            createdAt: products.createdAt,
            updatedAt: products.updatedAt,
            farmerName: users.fullName,
        })
            .from(products)
            .leftJoin(users, eq(products.farmerId, users.id))
            .where(and(eq(products.id, id), eq(products.isDeleted, 0)))
            .limit(1);

        const p = result[0];
        if (!p) return undefined;

        return {
            id: p.id,
            farmer_id: p.farmerId,
            name: p.name,
            category: p.category,
            quantity: p.quantity,
            unit: p.unit,
            base_price: p.basePrice,
            current_price: p.currentPrice,
            harvest_date: p.harvestDate,
            expiry_date: p.expiryDate,
            location_lat: p.locationLat,
            location_lng: p.locationLng,
            address: p.address,
            images: JSON.parse(p.images || '[]'),
            description: p.description,
            status: p.status as any,
            is_deleted: 0,
            created_at: p.createdAt?.toISOString() || '',
            updated_at: p.updatedAt?.toISOString() || '',
            farmer_name: p.farmerName
        } as Product;
    }

    async update(id: string, data: Partial<CreateProductRequest>, userId: string): Promise<Product> {
        if (!db) throw new Error('Database not initialized');

        // Verify ownership
        const product = await this.findById(id);
        if (!product) throw new Error('Product not found or deleted');
        if (product.farmer_id !== userId) throw new Error('Unauthorized');

        const updates: any = {};
        if (data.name) updates.name = data.name;
        if (data.category) updates.category = data.category;
        if (data.quantity !== undefined) updates.quantity = data.quantity;
        if (data.unit) updates.unit = data.unit;
        if (data.base_price !== undefined) {
            updates.basePrice = data.base_price;
            updates.currentPrice = data.base_price;
        }
        if (data.harvest_date) updates.harvestDate = data.harvest_date;
        if (data.expiry_date) updates.expiryDate = data.expiry_date;
        if (data.location_lat) updates.locationLat = data.location_lat;
        if (data.location_lng) updates.locationLng = data.location_lng;
        if (data.description) updates.description = data.description;

        updates.updatedAt = new Date();

        await db.update(products)
            .set(updates)
            .where(and(eq(products.id, id), eq(products.isDeleted, 0)));

        return (await this.findById(id)) as Product;
    }

    async updatePrice(id: string, basePrice: number, currentPrice: number, userId: string): Promise<Product> {
        if (!db) throw new Error('Database not initialized');

        const product = await this.findById(id);
        if (!product) throw new Error('Product not found or deleted');
        if (product.farmer_id !== userId) throw new Error('Unauthorized');

        await db.update(products)
            .set({
                basePrice,
                currentPrice,
                updatedAt: new Date()
            })
            .where(and(eq(products.id, id), eq(products.isDeleted, 0)));

        return (await this.findById(id)) as Product;
    }

    async delete(id: string, userId: string): Promise<void> {
        if (!db) throw new Error('Database not initialized');

        const product = await this.findById(id);
        if (!product) throw new Error('Product not found or already deleted');
        if (product.farmer_id !== userId) throw new Error('Unauthorized');

        await db.update(products)
            .set({ isDeleted: 1, updatedAt: new Date() })
            .where(eq(products.id, id));
    }
}
