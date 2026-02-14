import db from '../config/database';

export class SmsService {
    // In a real app, this would use Twilio SDK
    async sendSms(to: string, message: string): Promise<boolean> {
        console.log(`[SMS MOCK] Sending to ${to}: ${message}`);

        // Log to DB
        db.prepare('INSERT INTO sms_logs (id, phone_number, message, direction, status) VALUES (?, ?, ?, ?, ?)').run(
            require('uuid').v4(), to, message, 'outbound', 'sent'
        );

        return true;
    }

    async handleIncomingSms(from: string, body: string): Promise<string> {
        console.log(`[SMS MOCK] Received from ${from}: ${body}`);

        // Log to DB
        db.prepare('INSERT INTO sms_logs (id, phone_number, message, direction, status) VALUES (?, ?, ?, ?, ?)').run(
            require('uuid').v4(), from, body, 'inbound', 'received'
        );

        // Simple Command Parser
        const command = body.trim().toUpperCase();

        if (command.startsWith('PRICE')) {
            const productName = body.substring(5).trim();
            const product = db.prepare('SELECT * FROM products WHERE name LIKE ? LIMIT 1').get(`%${productName}%`) as any;

            if (product) {
                return `${product.name} is currently Rs. ${product.current_price}/${product.unit}. Reply ORDER ${product.id} [qty] to buy.`;
            } else {
                return `Product not found. Try PRICE [product name]`;
            }
        }

        return 'Welcome to Agri-Connect. Reply PRICE [product] to get prices.';
    }
}

export const smsService = new SmsService();
