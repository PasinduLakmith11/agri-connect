const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('./src/database/sqlite.db');

const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
const schemaData = {
    columns: tableInfo,
    firstOrderKeys: Object.keys(db.prepare("SELECT * FROM orders LIMIT 1").get() || {})
};

fs.writeFileSync('schema_output.json', JSON.stringify(schemaData, null, 2));
