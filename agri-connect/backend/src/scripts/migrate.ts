import db from '../config/database';
import fs from 'fs';
import path from 'path';

const MIGRATIONS_DIR = path.join(__dirname, '../database/migrations');

// Create migrations table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

function migrate() {
    const files = fs.readdirSync(MIGRATIONS_DIR).sort();

    const executed = db.prepare('SELECT name FROM migrations').all() as { name: string }[];
    const executedNames = new Set(executed.map(m => m.name));

    for (const file of files) {
        if (!executedNames.has(file) && file.endsWith('.sql')) {
            console.log(`Running migration: ${file}`);
            const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');

            const runMigration = db.transaction(() => {
                db.exec(sql);
                db.prepare('INSERT INTO migrations (name) VALUES (?)').run(file);
            });

            try {
                runMigration();
                console.log(`Migration ${file} completed.`);
            } catch (error) {
                console.error(`Migration ${file} failed:`, error);
                process.exit(1);
            }
        }
    }

    console.log('All migrations executed successfully.');
}

migrate();
