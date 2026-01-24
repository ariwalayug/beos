// Built-in fetch used
const BASE_URL = 'http://localhost:5000/api';

async function testAuth() {
    console.log('--- Testing Authentication ---');

    const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        role: 'user',
        blood_type: 'O+',
        phone: '1234567890',
        city: 'Metropolis',
        available: true
    };

    try {
        // 1. Register
        console.log('1. Registering new user...');
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(testUser),
            headers: { 'Content-Type': 'application/json' }
        });
        const regData = await regRes.json();

        if (!regData.success) {
            console.error('Registration Failed:', regData);
            return;
        }
        console.log('   Registration Successful:', regData.user.email);
        const token = regData.token;

        // 2. Get Me (with token)
        console.log('2. Fetching Current User...');
        const meRes = await fetch(`${BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const meData = await meRes.json();
        console.log('   Get Me Result:', meData.success ? 'Success' : 'Failed');

        // 3. Login
        console.log('3. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email: testUser.email, password: testUser.password }),
            headers: { 'Content-Type': 'application/json' }
        });
        const loginData = await loginRes.json();
        console.log('   Login Result:', loginData.success ? 'Success' : 'Failed');

        console.log('--- Auth Test Complete ---');

    } catch (error) {
        console.error('Test Error:', error);
    }
}

testAuth();
