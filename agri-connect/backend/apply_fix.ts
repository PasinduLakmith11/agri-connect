import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, {
    ssl: 'require',
    max: 1,
    connect_timeout: 20,
    prepare: false
});

async function applyFix() {
    console.log('🔄 Attempting to apply DB permissions fix...');

    try {
        // 1. Check connection first
        const version = await sql`SELECT version()`;
        console.log('✅ Connected to:', version[0].version);

        // 2. Apply Grants
        console.log('🔑 Granting permissions...');
        await sql`GRANT USAGE ON SCHEMA public TO postgres`;
        await sql`GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres`;
        await sql`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres`;
        await sql`GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres`;

        // 3. Disable RLS on users to unblock login
        console.log('🔓 Disabling RLS on users table...');
        await sql`ALTER TABLE "users" DISABLE ROW LEVEL SECURITY`;

        console.log('✅ Permissions fixed successfully!');

    } catch (error: any) {
        console.error('❌ Failed to apply fix:', error.message);
        if (error.code) console.error('   Code:', error.code);
        console.log('\n⚠️ If this failed, please run the "backend/fix_permissions.sql" script in Supabase Dashboard manually.');
    } finally {
        await sql.end();
    }
}

applyFix();
