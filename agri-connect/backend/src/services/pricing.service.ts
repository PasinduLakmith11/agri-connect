import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { products, priceHistory } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import { socketService } from './socket.service';

export class PricingService {
    // Simulate price fluctuations
    startPricingEngine() {
        setInterval(async () => {
            try {
                await this.updatePrices();
            } catch (error) {
                console.error('Error in Pricing Engine:', error);
            }
        }, 30000); // Update every 30 seconds
    }

    private async updatePrices() {
        if (!db) return;

        // Fetch available products
        const availableProducts = await db.select({
            id: products.id,
            basePrice: products.basePrice,
            currentPrice: products.currentPrice,
            quantity: products.quantity,
            name: products.name
        })
            .from(products)
            .where(eq(products.status, 'available'));

        for (const product of availableProducts) {
            try {
                const fluctuation = (Math.random() * 0.1) - 0.05; // -0.05 to +0.05
                let newPrice = product.currentPrice * (1 + fluctuation);

                // Demand factor (simulated) - if quantity < 10, price goes up slightly
                if (product.quantity < 10) {
                    newPrice *= 1.02;
                }

                // Keep within reasonable checks of base_price (e.g. not below 0.5x or above 2x)
                if (newPrice < product.basePrice * 0.5) newPrice = product.basePrice * 0.5;
                if (newPrice > product.basePrice * 2.0) newPrice = product.basePrice * 2.0;

                newPrice = parseFloat(newPrice.toFixed(2));

                if (newPrice !== product.currentPrice) {
                    await db.update(products)
                        .set({ currentPrice: newPrice, updatedAt: new Date() })
                        .where(eq(products.id, product.id));

                    // Record history
                    await db.insert(priceHistory).values({
                        id: uuidv4(),
                        productId: product.id,
                        oldPrice: product.currentPrice,
                        newPrice: newPrice,
                    });

                    // Notify clients
                    socketService.broadcast('price_update', {
                        productId: product.id,
                        newPrice: newPrice,
                        productName: product.name
                    });
                }
            } catch (err) {
                console.error(`Error updating price for product ${product.id}:`, err);
            }
        }
    }
}

export const pricingService = new PricingService();
