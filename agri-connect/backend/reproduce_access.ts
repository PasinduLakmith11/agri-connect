import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { ssl: 'require', prepare: false });

async function checkAccess() {
    console.log('Testing access to "users" table...');
    try {
        const users = await sql`SELECT * FROM "users" LIMIT 1`;
        console.log('Success!', users);
    } catch (error: any) {
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        if (error.code === '42501') {
            console.error('Confirmed: Access Denied (insufficient_privilege)');
        }
    } finally {
        await sql.end();
    }
}

checkAccess();
