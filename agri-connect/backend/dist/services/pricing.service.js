"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pricingService = exports.PricingService = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../config/database"));
const socket_service_1 = require("./socket.service");
class PricingService {
    // Simulate price fluctuations
    startPricingEngine() {
        setInterval(() => {
            try {
                this.updatePrices();
            }
            catch (error) {
                console.error('Error in Pricing Engine:', error);
            }
        }, 30000); // Update every 30 seconds
    }
    updatePrices() {
        const products = database_1.default.prepare("SELECT id, base_price, current_price, quantity, name FROM products WHERE status = 'available'").all();
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
                if (newPrice < product.base_price * 0.5)
                    newPrice = product.base_price * 0.5;
                if (newPrice > product.base_price * 2.0)
                    newPrice = product.base_price * 2.0;
                newPrice = parseFloat(newPrice.toFixed(2));
                if (newPrice !== product.current_price) {
                    database_1.default.prepare('UPDATE products SET current_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newPrice, product.id);
                    // Record history
                    database_1.default.prepare('INSERT INTO price_history (id, product_id, old_price, new_price) VALUES (?, ?, ?, ?)').run((0, uuid_1.v4)(), product.id, product.current_price, newPrice);
                    // Notify clients
                    socket_service_1.socketService.broadcast('price_update', {
                        productId: product.id,
                        newPrice: newPrice,
                        productName: product.name
                    });
                }
            }
            catch (err) {
                console.error(`Error updating price for product ${product.id}:`, err);
            }
        });
    }
}
exports.PricingService = PricingService;
exports.pricingService = new PricingService();
