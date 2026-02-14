const Database = require('better-sqlite3');
try {
    const db = new Database(':memory:');
    db.prepare('CREATE TABLE test (id INTEGER)').run();
    console.log('better-sqlite3 works!');
} catch (err) {
    console.error('better-sqlite3 failed:', err);
    process.exit(1);
}
