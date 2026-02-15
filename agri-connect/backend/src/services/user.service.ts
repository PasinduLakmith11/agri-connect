import { db } from '../database';
import { users, products } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import { User, Product } from 'agri-connect-shared';

export class UserService {
    async findById(id: string): Promise<User | undefined> {
        if (!db) throw new Error('Database not initialized');
        const userRecord = (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
        if (!userRecord) return undefined;

        return {
            id: userRecord.id,
            email: userRecord.email,
            phone: userRecord.phone,
            role: userRecord.role as any,
            full_name: userRecord.fullName,
            location_lat: userRecord.locationLat,
            location_lng: userRecord.locationLng,
            address: userRecord.address,
            verified: Boolean(userRecord.verified),
            bio: userRecord.bio,
            profile_image: userRecord.profileImage,
            rating: userRecord.rating || 0,
            rating_count: userRecord.ratingCount || 0,
            created_at: userRecord.createdAt?.toISOString() || '',
            updated_at: userRecord.updatedAt?.toISOString() || ''
        } as User;
    }

    async getFarmerProfile(id: string): Promise<{ farmer: User, products: Product[] } | undefined> {
        if (!db) throw new Error('Database not initialized');
        const farmer = await this.findById(id);
        if (!farmer || farmer.role !== 'farmer') return undefined;

        // Fetch products by this farmer
        const productRecords = await db.select({
            p: products,
            farmerName: users.fullName
        })
            .from(products)
            .leftJoin(users, eq(products.farmerId, users.id))
            .where(and(eq(products.farmerId, id), eq(products.status, 'available'), eq(products.isDeleted, 0)));

        const formattedProducts = productRecords.map(item => ({
            id: item.p.id,
            farmer_id: item.p.farmerId,
            name: item.p.name,
            category: item.p.category,
            quantity: item.p.quantity,
            unit: item.p.unit,
            base_price: item.p.basePrice,
            current_price: item.p.currentPrice,
            harvest_date: item.p.harvestDate,
            expiry_date: item.p.expiryDate,
            location_lat: item.p.locationLat,
            location_lng: item.p.locationLng,
            address: item.p.address,
            images: JSON.parse(item.p.images || '[]'),
            description: item.p.description,
            status: item.p.status as any,
            is_deleted: item.p.isDeleted || 0,
            created_at: item.p.createdAt?.toISOString() || '',
            updated_at: item.p.updatedAt?.toISOString() || '',
            farmer_name: item.farmerName
        })) as Product[];

        return { farmer, products: formattedProducts };
    }

    async update(id: string, updates: Partial<User>): Promise<User> {
        if (!db) throw new Error('Database not initialized');

        const dbUpdates: any = { updatedAt: new Date() };
        if (updates.full_name) dbUpdates.fullName = updates.full_name;
        if (updates.email) dbUpdates.email = updates.email;
        if (updates.phone) dbUpdates.phone = updates.phone;
        if (updates.address) dbUpdates.address = updates.address;
        if (updates.location_lat) dbUpdates.locationLat = updates.location_lat;
        if (updates.location_lng) dbUpdates.locationLng = updates.location_lng;
        if (updates.bio) dbUpdates.bio = updates.bio;
        if (updates.farm_name) dbUpdates.farmName = updates.farm_name;
        if (updates.profile_image) dbUpdates.profileImage = updates.profile_image;

        await db.update(users).set(dbUpdates).where(eq(users.id, id));

        return (await this.findById(id)) as User;
    }
}
