import postgres from 'postgres';

const regions = [
    'ap-south-1',       // Mumbai (Likely for Sri Lanka)
    'ap-southeast-1',   // Singapore
    'us-east-1',        // N. Virginia (Default)
    'eu-central-1',     // Frankfurt
    'sa-east-1'         // Sao Paulo
];

const projectRef = 'aogrqxaamdbaxiiettim';
const password = 'Pasindu@!2000'; // Extracted from provided guide
const database = 'postgres';

async function testConnection(region: string) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    // Supavisor connection string format: postgres://[user].[project]:[pass]@[host]:6543/[db]
    // The username is usually 'postgres' for the default user.
    // Note: Supavisor supports 'postgres.projectref' as username.

    // BUT checking the guide, user had: postgres:Pasindu...
    // The pooler requires project ref in username often, e.g. 'postgres.projectref'

    const user = `postgres.${projectRef}`;

    const url = `postgres://${user}:${encodeURIComponent(password)}@${host}:6543/${database}?sslmode=require`;

    console.log(`Trying ${region}... (${host})`);

    try {
        const sql = postgres(url, { connect_timeout: 5 });
        const result = await sql`SELECT 1`;
        console.log(`✅ SUCCESS! Connected to ${region}`);
        console.log(`\n🎉 FOUND WORKING CONNECTION STRING:\n${url}\n`);

        // Output for user to copy easily (decoded)
        console.log(`DATABASE_URL="postgres://${user}:${password}@${host}:6543/${database}"`);

        await sql.end();
        process.exit(0);
    } catch (error: any) {
        console.log(`❌ Failed ${region}: ${error.code || error.message}`);
        // console.log(error); // Uncomment for debug
    }
}

async function main() {
    console.log('🔍 Searching for valid Supabase Connection Pooler...');

    for (const region of regions) {
        await testConnection(region);
    }

    console.log('\n❌ Could not connect to any common region pooler.');
    console.log('Please check your Supabase Dashboard for the correct Connection Pooler URL.');
}

main();
