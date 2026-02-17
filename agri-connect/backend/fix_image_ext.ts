import { db } from './src/database';
import { products } from './src/database/schema';
import { sql } from 'drizzle-orm';

async function fixImageExtension() {
    console.log('🔧 Fixing Image Extensions...');
    try {
        // Update all products to use .jpg instead of .jfif
        await db.execute(sql`
            UPDATE products 
            SET images = REPLACE(images, '.jfif', '.jpg')
            WHERE images LIKE '%.jfif%'
        `);
        console.log('✅ Updated .jfif to .jpg in database');
    } catch (error: any) {
        console.error('❌ Update Failed:', error.message);
    } finally {
        process.exit();
    }
}

fixImageExtension();
