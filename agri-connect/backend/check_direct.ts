import postgres from 'postgres';

// Construct direct connection string
// Original: postgres://postgres.aogrqxaamdbaxiiettim:Pasindu%40%212000@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
// Direct: postgres://postgres:Pasindu%40%212000@db.aogrqxaamdbaxiiettim.supabase.co:5432/postgres

const connectionString = "postgres://postgres:Pasindu%40%212000@db.aogrqxaamdbaxiiettim.supabase.co:5432/postgres";

async function checkDirect() {
    console.log('🔌 Testing DIRECT connection to port 5432...');
    console.log('URL:', connectionString.replace(/:[^:@]+@/, ':****@'));

    const sql = postgres(connectionString, {
        ssl: 'require',
        max: 1,
        connect_timeout: 15
    });

    try {
        const result = await sql`SELECT version()`;
        console.log('✅ Connected!', result[0].version);

        console.log('📊 Checking "users" table access...');
        try {
            const users = await sql`SELECT count(*) FROM "users"`;
            console.log('✅ Users table accessible. Count:', users[0].count);
        } catch (err: any) {
            console.log('❌ Failed to query users:', err.message);
            console.log('   Code:', err.code);
        }

    } catch (error: any) {
        console.error('❌ Direct connection failed:', error.message);
        console.error('   Code:', error.code);
    } finally {
        await sql.end();
    }
}

checkDirect();
