import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;

async function checkDatabase() {
    console.log('🔍 Checking database connection...\n');

    const sql = postgres(connectionString, {
        ssl: 'require',
        max: 1,
        connect_timeout: 10,
        prepare: false
    });

    try {
        // Test connection
        console.log('✅ Testing connection...');
        const result = await sql`SELECT current_database(), current_user, version()`;
        console.log('   Database:', result[0].current_database);
        console.log('   User:', result[0].current_user);
        console.log('   Version:', result[0].version.split(' ')[0], result[0].version.split(' ')[1]);
        console.log('');

        // Check if tables exist
        console.log('📊 Checking tables...');
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `;

        if (tables.length === 0) {
            console.log('   ❌ No tables found in the public schema!');
            console.log('');
            console.log('🛠️  ACTION REQUIRED:');
            console.log('   You need to run the SQL schema in Supabase:');
            console.log('   1. Open Supabase Dashboard');
            console.log('   2. Go to SQL Editor');
            console.log('   3. Copy contents from: backend/supabase_schema.sql');
            console.log('   4. Paste and run the script');
        } else {
            console.log(`   ✅ Found ${tables.length} tables:`);
            tables.forEach((t: any) => console.log(`      - ${t.table_name}`));

            // Check specifically for users table
            const hasUsers = tables.some((t: any) => t.table_name === 'users');
            if (!hasUsers) {
                console.log('');
                console.log('   ⚠️  "users" table not found!');
            }
        }

        // Check user permissions
        console.log('');
        console.log('🔐 Checking permissions...');
        try {
            const perms = await sql`
                SELECT 
                    grantee, 
                    privilege_type 
                FROM information_schema.role_table_grants 
                WHERE table_schema = 'public' 
                AND grantee = current_user
                LIMIT 5
            `;
            console.log(`   ✅ Current user has ${perms.length > 0 ? 'permissions' : 'limited access'}`);
        } catch (err) {
            console.log('   ⚠️  Could not verify permissions');
        }

    } catch (error: any) {
        console.error('❌ Database check failed:', error.message);
        if (error.code) {
            console.error('   Error code:', error.code);
        }
    } finally {
        await sql.end();
        console.log('');
        console.log('🏁 Check complete');
    }
}

checkDatabase();
