const BASE_URL = 'http://127.0.0.1:5000/api';
let token = '';

async function runTests() {
    console.log('--- TESTING SIGNUP ---');
    try {
        const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Doc',
                clinicName: 'Test Clinic',
                location: 'Village A',
                contact: '1234567890',
                password: 'password123'
            })
        });
        console.log('Signup Status:', signupRes.status);
        console.log('Signup Response:', await signupRes.json());
    } catch (e) { console.error('Signup fails', e.message) }

    console.log('\n--- TESTING LOGIN ---');
    try {
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contact: '1234567890',
                password: 'password123'
            })
        });
        console.log('Login Status:', loginRes.status);
        const loginData = await loginRes.json();
        console.log('Login Response:', loginData);
        token = loginData.token;
    } catch (e) { console.error('Login fails', e.message); return; }

    if (!token) return console.log('No token, aborting referrals test');

    console.log('\n--- TESTING CREATE REFERRAL ---');
    try {
        const referralRes = await fetch(`${BASE_URL}/referrals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                patientAge: 45,
                symptoms: 'Chest pain',
                vitals: 'BP 150/90',
                urgency: 'High'
            })
        });
        console.log('Create Referral Status:', referralRes.status);
        console.log('Create Referral Response:', await referralRes.json());
    } catch (e) { console.error('Create Referral fails', e.message); }

    console.log('\n--- WAITING 6 SECONDS FOR AUTO-ACCEPT ---');
    await new Promise(resolve => setTimeout(resolve, 6000));

    console.log('\n--- TESTING GET REFERRALS ---');
    try {
        const getRes = await fetch(`${BASE_URL}/referrals`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Get Referrals Status:', getRes.status);
        console.log('Get Referrals Response:', await getRes.json());
    } catch (e) { console.error('Get Referrals fails', e.message); }
}

runTests();
