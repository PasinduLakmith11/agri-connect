const Database = require('better-sqlite3');
const db = new Database('./src/database/sqlite.db');
try {
    const migrations = db.prepare('SELECT * FROM migrations').all();
    console.log('Migrations:', JSON.stringify(migrations, null, 2));
} catch (e) {
    console.error('Error:', e.message);
}
db.close();
