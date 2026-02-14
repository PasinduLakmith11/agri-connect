"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbPath = process.env.DATABASE_PATH || './src/database/sqlite.db';
// Ensure directory exists
const dir = path_1.default.dirname(dbPath);
if (!fs_1.default.existsSync(dir)) {
    fs_1.default.mkdirSync(dir, { recursive: true });
}
const db = new better_sqlite3_1.default(dbPath, {
    verbose: console.log
});
db.pragma('journal_mode = WAL');
exports.default = db;
