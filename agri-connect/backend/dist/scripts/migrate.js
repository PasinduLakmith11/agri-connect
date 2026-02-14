"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const MIGRATIONS_DIR = path_1.default.join(__dirname, '../database/migrations');
// Create migrations table if not exists
database_1.default.exec(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
function migrate() {
    const files = fs_1.default.readdirSync(MIGRATIONS_DIR).sort();
    const executed = database_1.default.prepare('SELECT name FROM migrations').all();
    const executedNames = new Set(executed.map(m => m.name));
    for (const file of files) {
        if (!executedNames.has(file) && file.endsWith('.sql')) {
            console.log(`Running migration: ${file}`);
            const sql = fs_1.default.readFileSync(path_1.default.join(MIGRATIONS_DIR, file), 'utf-8');
            const runMigration = database_1.default.transaction(() => {
                database_1.default.exec(sql);
                database_1.default.prepare('INSERT INTO migrations (name) VALUES (?)').run(file);
            });
            try {
                runMigration();
                console.log(`Migration ${file} completed.`);
            }
            catch (error) {
                console.error(`Migration ${file} failed:`, error);
                process.exit(1);
            }
        }
    }
    console.log('All migrations executed successfully.');
}
migrate();
