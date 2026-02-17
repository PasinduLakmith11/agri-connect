import { db } from './src/database';
import { products } from './src/database/schema';

async function checkImages() {
    console.log('🖼️  Checking Product Images...');
    try {
        const result = await db.select({
            name: products.name,
            images: products.images
        }).from(products).limit(5);

        console.log('Found products:', JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('❌ Query Failed:', error.message);
    } finally {
        process.exit();
    }
}

checkImages();
