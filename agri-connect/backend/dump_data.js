const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'agri_connect.db');
console.log(`Connecting to DB at: ${dbPath}`);

try {
    const db = new Database(dbPath, { verbose: console.log });

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const output = { tables };

    for (const table of tables) {
        if (table.name === 'sqlite_sequence') continue;
        console.log(`Inspecting table: ${table.name}`);
        output[table.name + '_schema'] = db.prepare(`PRAGMA table_info(${table.name})`).all();
        output[table.name + '_data'] = db.prepare(`SELECT * FROM ${table.name} LIMIT 5`).all();
    }

    fs.writeFileSync('db_dump.json', JSON.stringify(output, null, 2));
    console.log('Dump complete.');
} catch (err) {
    console.error('FAILED:', err);
}
