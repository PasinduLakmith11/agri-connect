import { db } from './src/database';
import { products } from './src/database/schema';
import fs from 'fs';
import path from 'path';

async function restoreImages() {
    console.log('🔄 Restoring Missing Images...');
    const uploadsDir = path.join(__dirname, 'src', 'uploads');
    const placeholderPath = path.join(uploadsDir, '1707997604427.jpg');

    if (!fs.existsSync(placeholderPath)) {
        console.error('❌ Placeholder image not found!');
        process.exit(1);
    }

    try {
        const result = await db.select({ images: products.images }).from(products);

        for (const product of result) {
            if (product.images && Array.isArray(product.images)) {
                for (const imgPath of product.images) {
                    const filename = path.basename(imgPath);
                    const destPath = path.join(uploadsDir, filename);

                    if (!fs.existsSync(destPath)) {
                        console.log(`Copying placeholder to ${filename}...`);
                        fs.copyFileSync(placeholderPath, destPath);
                    }
                }
            }
        }
        console.log('✅ All missing images restored!');
    } catch (error: any) {
        console.error('❌ Restoration Failed:', error.message);
    } finally {
        process.exit();
    }
}

restoreImages();
