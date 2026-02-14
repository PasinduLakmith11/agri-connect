import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { socketService } from './socket.service';

export class PricingService {
    // Simulate price fluctuations
    startPricingEngine() {
        setInterval(() => {
            try {
                this.updatePrices();
            } catch (error) {
                console.error('Error in Pricing Engine:', error);
            }
        }, 30000); // Update every 30 seconds
    }

    private updatePrices() {
        // Use parameterized query or double check single quotes
        const products = db.prepare("SELECT id, base_price, current_price, quantity, name FROM products WHERE status = 'available'").all() as any[];

        products.forEach(product => {
            try {
                // Simple algorithm: 
                // - Random fluctuation +/- 5%
                // - Increase if quantity low (supply/demand)

                const fluctuation = (Math.random() * 0.1) - 0.05; // -0.05 to +0.05
                let newPrice = product.current_price * (1 + fluctuation);

                // Demand factor (simulated) - if quantity < 10, price goes up slightly
                if (product.quantity < 10) {
                    newPrice *= 1.02;
                }

                // Keep within reasonable checks of base_price (e.g. not below 0.5x or above 2x)
                if (newPrice < product.base_price * 0.5) newPrice = product.base_price * 0.5;
                if (newPrice > product.base_price * 2.0) newPrice = product.base_price * 2.0;

                newPrice = parseFloat(newPrice.toFixed(2));

                if (newPrice !== product.current_price) {
                    db.prepare('UPDATE products SET current_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newPrice, product.id);

                    // Record history
                    db.prepare('INSERT INTO price_history (id, product_id, old_price, new_price) VALUES (?, ?, ?, ?)').run(
                        uuidv4(), product.id, product.current_price, newPrice
                    );

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
        });
    }
}

export const pricingService = new PricingService();
