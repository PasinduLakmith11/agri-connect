import db from './backend/src/config/database';

try {
    const users = db.prepare('SELECT id, email, role, full_name FROM users').all();
    console.log('--- Users in Database ---');
    console.table(users);
} catch (error) {
    console.error('Error fetching users:', error);
}
