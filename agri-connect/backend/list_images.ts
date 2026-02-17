import { db } from './src/database';
import { products } from './src/database/schema';

async function listAllImages() {
    console.log('🖼️  Listing ALL Product Images...');
    try {
        const result = await db.select({
            id: products.id,
            name: products.name,
            images: products.images
        }).from(products);

        console.log(JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('❌ Query Failed:', error.message);
    } finally {
        process.exit();
    }
}

listAllImages();
