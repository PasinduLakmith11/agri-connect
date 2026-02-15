import db from './src/config/database';

const args = process.argv.slice(2);
const sql = args.join(' ');

if (!sql) {
    console.log('❌ Please provide a SQL command.');
    console.log('Example: npm run db-tool "DELETE FROM orders"');
    process.exit(1);
}

try {
    const stmt = db.prepare(sql);
    const result = stmt.run();
    console.log('✅ Success!');
    console.log('Changes:', result.changes);
} catch (error: any) {
    console.error('❌ Error executing SQL:', error.message);
}
