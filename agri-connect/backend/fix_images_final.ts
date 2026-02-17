import { db } from './src/database';
import { products } from './src/database/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function fixImagesFinal() {
    console.log('🚀 Starting Final Image Fix...');
    const uploadsDir = path.join(__dirname, 'src', 'uploads');
    const placeholderPath = path.join(uploadsDir, '1707997604427.jpg'); // Ensure this exists from previous steps

    if (!fs.existsSync(placeholderPath)) {
        console.error('❌ Placeholder 1707997604427.jpg not found. Please ensure it exists.');
        // Try falling back to jfif if jpg missing
        if (fs.existsSync(path.join(uploadsDir, '1707997604427.jfif'))) {
            fs.copyFileSync(path.join(uploadsDir, '1707997604427.jfif'), placeholderPath);
        } else {
            // If completely missing, we can't copy. But we can still update DB.
            console.warn('⚠️ No source placeholder found. Files might be missing.');
        }
    }

    try {
        const allProducts = await db.select().from(products);

        for (const product of allProducts) {
            if (!product.images) continue;

            let imagesArray: string[] = [];
            try {
                // Handle if it's already an array or a string
                imagesArray = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
            } catch (e) {
                console.error(`Error parsing images for product ${product.id}:`, e);
                continue;
            }

            if (!Array.isArray(imagesArray)) continue;

            let needsUpdate = false;
            const newImages = imagesArray.map(img => {
                if (img.endsWith('.jfif')) {
                    needsUpdate = true;
                    return img.replace('.jfif', '.jpg');
                }
                return img;
            });

            if (needsUpdate) {
                console.log(`🔧 Updating product ${product.name} (${product.id})...`);

                // 1. Update DB
                await db.update(products)
                    .set({ images: JSON.stringify(newImages) })
                    .where(eq(products.id, product.id));

                // 2. Ensure file exists with .jpg extension
                for (const newImgPath of newImages) {
                    const filename = path.basename(newImgPath);
                    const destPath = path.join(uploadsDir, filename);

                    if (!fs.existsSync(destPath)) {
                        console.log(`   📄 Creating file: ${filename}`);
                        if (fs.existsSync(placeholderPath)) {
                            fs.copyFileSync(placeholderPath, destPath);
                        } else {
                            // verify if the .jfif version exists and rename it
                            const oldFilename = filename.replace('.jpg', '.jfif');
                            const oldPath = path.join(uploadsDir, oldFilename);
                            if (fs.existsSync(oldPath)) {
                                fs.renameSync(oldPath, destPath);
                            }
                        }
                    }
                }
            }
        }
        console.log('✅ Final Image Fix Complete!');
    } catch (error: any) {
        console.error('❌ Fix Failed:', error.message);
    } finally {
        process.exit();
    }
}

fixImagesFinal();
