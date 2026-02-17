const fetch = require('node-fetch');

async function checkBackend() {
    console.log('Testing backend connectivity on port 5006...');
    try {
        const res = await fetch('http://127.0.0.1:5006/');
        const text = await res.text();
        console.log('✅ Base URL /:', text);
    } catch (err) {
        console.error('❌ Base URL / failed:', err.message);
    }

    try {
        const res = await fetch('http://127.0.0.1:5006/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // Empty body to trigger validation error
        });
        const json = await res.json();
        console.log('✅ POST /api/auth/register response:', JSON.stringify(json, null, 2));
    } catch (err) {
        console.error('❌ POST /api/auth/register failed:', err.message);
    }
}

checkBackend();
