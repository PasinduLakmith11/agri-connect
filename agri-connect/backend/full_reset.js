const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run() {
    console.log('--- Killing node processes ---');
    try {
        execSync('powershell "Stop-Process -Name node -Force -ErrorAction SilentlyContinue"');
    } catch (e) { }

    const dbPath = './src/database/sqlite.db';
    console.log(`--- deleting ${dbPath} ---`);
    if (fs.existsSync(dbPath)) {
        try {
            fs.unlinkSync(dbPath);
        } catch (e) {
            console.error('Failed to delete DB:', e.message);
        }
    }

    console.log('--- Running migrations ---');
    try {
        execSync('npx ts-node src/scripts/migrate.ts', { stdio: 'inherit' });
    } catch (e) {
        console.error('Migration failed');
    }

    console.log('--- Starting server ---');
    try {
        execSync('npx ts-node src/server.ts', { stdio: 'inherit' });
    } catch (e) {
        console.error('Server failed to start');
    }
}

run();
