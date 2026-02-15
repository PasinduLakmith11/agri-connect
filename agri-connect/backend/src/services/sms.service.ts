import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { smsLogs, products } from '../database/schema';
import { eq, like } from 'drizzle-orm';

export class SmsService {
    // In a real app, this would use Twilio SDK
    async sendSms(to: string, message: string): Promise<boolean> {
        if (!db) return false;
        console.log(`[SMS MOCK] Sending to ${to}: ${message}`);

        // Log to DB
        await db.insert(smsLogs).values({
            id: uuidv4(),
            phone: to,
            message: message,
            direction: 'outgoing',
            status: 'sent',
        });

        return true;
    }

    async handleIncomingSms(from: string, body: string): Promise<string> {
        if (!db) return '';
        console.log(`[SMS MOCK] Received from ${from}: ${body}`);

        // Log to DB
        await db.insert(smsLogs).values({
            id: uuidv4(),
            phone: from,
            message: body,
            direction: 'incoming',
            status: 'delivered',
        });

        // Simple Command Parser
        const command = body.trim().toUpperCase();

        if (command.startsWith('PRICE')) {
            const productName = body.substring(5).trim();
            const productRecord = (await db.select().from(products).where(like(products.name, `%${productName}%`)).limit(1))[0];

            if (productRecord) {
                return `${productRecord.name} is currently Rs. ${productRecord.currentPrice}/${productRecord.unit}. Reply ORDER ${productRecord.id} [qty] to buy.`;
            } else {
                return `Product not found. Try PRICE [product name]`;
            }
        }

        return 'Welcome to Agri-Connect. Reply PRICE [product] to get prices.';
    }
}

export const smsService = new SmsService();
