import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config/env';
import * as schema from './schema';

// Configure postgres connection with SSL for Supabase
const connectionString = env.DATABASE_URL;

const sql = postgres(connectionString, {
    ssl: 'require',
    max: 10,
    idle_timeout: 20,
    connect_timeout: 30,
    prepare: false, // Disable prepared statements for connection pooler
    connection: {
        application_name: 'agri-connect-backend'
    }
});

export const db = drizzle(sql, { schema });
export default db;
