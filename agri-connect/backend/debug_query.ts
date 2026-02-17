import { db } from './src/database';
import { users } from './src/database/schema';
import { eq, or } from 'drizzle-orm';

async function debugQuery() {
    console.log('🔍 Debugging User Query...');

    try {
        console.log('Attempting to select user with email janith@gmail.com...');

        const result = await db.select()
            .from(users)
            .where(
                or(
                    eq(users.email, 'janith@gmail.com'),
                    eq(users.phone, '0714563666')
                )
            )
            .limit(1);

        console.log('✅ Query success!');
        console.log('Result:', result);

    } catch (error: any) {
        console.error('❌ Query Failed!');
        console.error('---------------------------------------------------');
        console.error('Message:', error.message);
        console.error('Code:', error.code); // This is what we need!
        console.error('Detail:', error.detail);
        console.error('Hint:', error.hint);
        console.error('Name:', error.name);
        console.error('---------------------------------------------------');
        console.error('Full Error Object:', JSON.stringify(error, null, 2));
    } finally {
        process.exit();
    }
}

debugQuery();
