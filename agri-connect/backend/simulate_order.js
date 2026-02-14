const API_URL = 'http://127.0.0.1:5006/api';

async function runTest() {
    try {
        console.log('--- Registering Buyer ---');
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `buyer_${Date.now()}@test.com`,
                password: 'Password123!',
                phone: `077${Math.floor(Math.random() * 10000000)}`,
                full_name: 'Test Buyer',
                role: 'buyer',
                address: 'Colombo, Sri Lanka'
            })
        });
        const registerData = await registerRes.json();
        if (!registerRes.ok) throw new Error(JSON.stringify(registerData));
        console.log('Registration Success');

        console.log('\n--- Logging In ---');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: registerData.user.email,
                password: 'Password123!'
            })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
        const token = loginData.accessToken;
        console.log('Login Success, Token obtained');

        console.log('\n--- Fetching Products ---');
        const productsRes = await fetch(`${API_URL}/products`);
        const productsData = await productsRes.data || await productsRes.json(); // Fix if it's data
        const products = Array.isArray(productsData) ? productsData : productsData.products;

        if (!products || products.length === 0) {
            console.log('No products found. Cannot test ordering.');
            return;
        }
        const product = products[0];
        console.log(`Found product: ${product.name} (${product.id})`);

        console.log('\n--- Creating Order ---');
        const orderRes = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: product.id,
                quantity: 1,
                delivery_address: 'Colombo 07'
            })
        });
        const orderData = await orderRes.json();
        if (orderRes.ok) {
            console.log('Order Success:', orderData.id);
        } else {
            console.error('Order Failed:', JSON.stringify(orderData, null, 2));
        }

    } catch (err) {
        console.error('Test Failed:', err.message);
    }
}

runTest();
