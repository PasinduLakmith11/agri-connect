import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function testSupabase() {
    console.log('🔌 Testing Supabase Connection...\n');

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL not found in .env');
        process.exit(1);
    }

    console.log('📍 Connection URL (masked):');
    const urlParts = new URL(dbUrl);
    console.log(`   Host: ${urlParts.hostname}`);
    console.log(`   Port: ${urlParts.port || '5432'}`);
    console.log(`   Database: ${urlParts.pathname.slice(1)}`);
    console.log(`   User: ${urlParts.username}`);
    console.log('');

    const sql = postgres(dbUrl, {
        ssl: 'require',
        max: 1,
        connect_timeout: 10,
        prepare: false
    });

    try {
        // Simple ping
        const result = await sql`SELECT 1 as ping, current_timestamp`;
        console.log('✅ Connection successful!');
        console.log(`   Ping: ${result[0].ping}`);
        console.log(`   Timestamp: ${result[0].current_timestamp}`);
        console.log('');

        // Check for users table
        const tableCheck = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            )
        `;

        if (tableCheck[0].exists) {
            console.log('✅ "users" table exists');

            // Count users
            const userCount = await sql`SELECT COUNT(*) as count FROM users`;
            console.log(`   Total users: ${userCount[0].count}`);
        } else {
            console.log('❌ "users" table does NOT exist');
            console.log('');
            console.log('🛠️  YOU NEED TO CREATE THE DATABASE SCHEMA:');
            console.log('   1. Open: https://supabase.com/dashboard');
            console.log('   2. Select your project');
            console.log('   3. Go to: SQL Editor (left sidebar)');
            console.log('   4. Click: "+ New Query"');
            console.log('   5. Copy the entire contents of: backend/supabase_schema.sql');
            console.log('   6. Paste into the SQL Editor');
            console.log('   7. Click: "Run" (or press Ctrl+Enter)');
            console.log('   8. Wait for success message');
            console.log('   9. Re-run this test: npm run db-test');
        }

    } catch (error: any) {
        console.error('❌ Connection failed!');
        console.error(`   Error: ${error.message}`);
        if (error.code) {
            console.error(`   Code: ${error.code}`);
        }
        console.log('');
        console.log('💡 Troubleshooting:');
        console.log('   - Check your Supabase project is active');
        console.log('   - Verify DATABASE_URL in .env is correct');
        console.log('   - Ensure your IP is allowed (Supabase > Settings > Database)');
    } finally {
        await sql.end();
    }
}

testSupabase();
