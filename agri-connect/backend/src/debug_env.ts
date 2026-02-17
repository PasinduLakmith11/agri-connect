import { RegisterSchema, OrderSchema, ProductSchema, CreateOrderSchema } from 'agri-connect-shared';
import dotenv from 'dotenv';
import path from 'path';

const dotEnvResult = dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('Dotenv Result:', dotEnvResult.parsed ? 'Parsed successfully' : 'Failed to parse');
if (dotEnvResult.error) {
    console.error('Dotenv Error:', dotEnvResult.error);
}

console.log('RegisterSchema:', !!RegisterSchema);
console.log('OrderSchema:', !!OrderSchema);
console.log('ProductSchema:', !!ProductSchema);
console.log('CreateOrderSchema:', !!CreateOrderSchema);
console.log('DATABASE_URL from process.env:', !!process.env.DATABASE_URL);
