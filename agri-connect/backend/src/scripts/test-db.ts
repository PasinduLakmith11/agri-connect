import { db } from '../database';
import { users } from '../database/schema';
import { eq, or } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function testSupabaseConnection() {
    console.log('='.repeat(60));
    console.log('🔍 Testing Supabase Connection and Table Access');
    console.log('='.repeat(60));

    try {
        if (!db) {
            throw new Error('Database instance is null (Check DATABASE_URL in .env)');
        }

        console.log('✅ Database instance exists');

        // 1. Basic Table Access Test
        console.log('⏳ Test 1: Simple SELECT ALL...');

        // Race a query against a timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timed out (5s)')), 5000)
        );

        const queryPromise = db.select().from(users).limit(1);

        await Promise.race([queryPromise, timeoutPromise]);
        console.log('✅ Test 1 PASSED');

        // 2. Exact Failing Query Test
        console.log('\n⏳ Test 2: Reproducing the "Failed query"...');
        const email = 'ranasinghe@gmail.com';
        const phone = '0715689458';

        const existingUser = await db.select()
            .from(users)
            .where(or(eq(users.email, email), eq(users.phone, phone)))
            .limit(1);

        console.log('✅ Test 2 PASSED! Query executed successfully.');
        console.log('   Result:', existingUser);
        console.log('\n✅ ALL SYSTEMS GO! Your backend is correctly connected.');

        process.exit(0);

    } catch (error: any) {
        console.error('\n❌ CONNECTION TEST FAILED');

        const isNetworkError = error.code === 'ENOTFOUND' || error.message.includes('connect') || error.message.includes('timeout');

        if (isNetworkError) {
            console.error('\n🔴 CRITICAL NETWORK ERROR DETECTED');
            console.error('   Your local environment cannot connect to the database address.');
            console.error('   Use of direct IPv6 address (db.supabase.co) fails on IPv4 networks.');

            const fixPath = path.resolve(__dirname, '../../FIX_DB_CONNECTION.md');
            console.error(`\n👉 PLEASE READ THE FIX GUIDE:\n   ${fixPath}\n`);
            console.error('   It contains the exact steps to get the Supabase Connection Pooler URL.');
        } else {
            // Log full error to file
            const errorLog = `TIMESTAMP: ${new Date().toISOString()}\nERROR: ${error.stack}\nFULL: ${JSON.stringify(error, null, 2)}`;
            fs.writeFileSync('db-error.log', errorLog);
            console.error(`   Error details logged to db-error.log`);
            console.error(`   Message: ${error.message}`);
        }
        process.exit(1);
    }
}

testSupabaseConnection();
