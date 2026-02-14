const Database = require('better-sqlite3');
const db = new Database('./src/database/sqlite.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', JSON.stringify(tables.map(t => t.name)));

for (const table of tables) {
    const info = db.prepare(`PRAGMA table_info(${table.name})`).all();
    console.log(`Table ${table.name} columns:`, JSON.stringify(info.map(c => c.name)));
}

try {
    const executed = db.prepare('SELECT name FROM migrations').all();
    console.log('Executed migrations:', JSON.stringify(executed.map(m => m.name)));
} catch (e) {
    console.log('Migrations table not found or empty.');
}

db.close();
