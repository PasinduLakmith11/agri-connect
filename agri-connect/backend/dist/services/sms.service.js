"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = exports.SmsService = void 0;
const database_1 = __importDefault(require("../config/database"));
class SmsService {
    // In a real app, this would use Twilio SDK
    async sendSms(to, message) {
        console.log(`[SMS MOCK] Sending to ${to}: ${message}`);
        // Log to DB
        database_1.default.prepare('INSERT INTO sms_logs (id, phone_number, message, direction, status) VALUES (?, ?, ?, ?, ?)').run(require('uuid').v4(), to, message, 'outbound', 'sent');
        return true;
    }
    async handleIncomingSms(from, body) {
        console.log(`[SMS MOCK] Received from ${from}: ${body}`);
        // Log to DB
        database_1.default.prepare('INSERT INTO sms_logs (id, phone_number, message, direction, status) VALUES (?, ?, ?, ?, ?)').run(require('uuid').v4(), from, body, 'inbound', 'received');
        // Simple Command Parser
        const command = body.trim().toUpperCase();
        if (command.startsWith('PRICE')) {
            const productName = body.substring(5).trim();
            const product = database_1.default.prepare('SELECT * FROM products WHERE name LIKE ? LIMIT 1').get(`%${productName}%`);
            if (product) {
                return `${product.name} is currently Rs. ${product.current_price}/${product.unit}. Reply ORDER ${product.id} [qty] to buy.`;
            }
            else {
                return `Product not found. Try PRICE [product name]`;
            }
        }
        return 'Welcome to Agri-Connect. Reply PRICE [product] to get prices.';
    }
}
exports.SmsService = SmsService;
exports.smsService = new SmsService();
