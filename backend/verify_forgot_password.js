const BASE_URL = 'http://localhost:4000/user';

async function testForgotPassword() {
    const timestamp = Date.now();
    const user = {
        name: `Test User ${timestamp}`,
        username: `testuser${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'password123'
    };

    console.log('--- Starting Verification ---');

    try {
        // 1. Signup
        console.log('1. Signing up user...');
        let res = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        let data = await res.json();
        
        if (!data.success) {
            throw new Error(`Signup failed: ${data.message}`);
        }
        
        const securityCode = data.user.securityCode;
        console.log('   Signup successful!');
        console.log(`   Security Code: ${securityCode}`);

        if (!securityCode || securityCode.length !== 4) {
            throw new Error(`Invalid security code generated: ${securityCode}`);
        }

        // 2. Try Reset with WRONG code
        console.log('2. Testing Reset with WRONG code...');
        res = await fetch(`${BASE_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                securityCode: '0000',
                newPassword: 'newpassword123'
            })
        });
        data = await res.json();

        if (res.status === 400) {
            console.log('   Correctly failed with wrong code.');
        } else {
            throw new Error(`Reset with wrong code SHOULD have failed but got status ${res.status}`);
        }

        // 3. Try Reset with CORRECT code
        console.log('3. Testing Reset with CORRECT code...');
        res = await fetch(`${BASE_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                securityCode: securityCode,
                newPassword: 'newpassword123'
            })
        });
        data = await res.json();

        if (!data.success) {
            throw new Error(`Reset with correct code failed: ${data.message}`);
        }
        console.log('   Password reset successful!');

        // 4. Login with NEW password
        console.log('4. Logging in with NEW password...');
        res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: user.email,
                password: 'newpassword123'
            })
        });
        data = await res.json();

        if (!data.success) {
            throw new Error(`Login with new password failed: ${data.message}`);
        }
        console.log('   Login successful!');
        
        if (data.user && data.user.securityCode === securityCode) {
             console.log('   Security Code present in Login response: OK');
        } else {
             console.log('   WARNING: Security Code NOT present in Login response');
        }

        console.log('--- Verification Passed! ---');

    } catch (error) {
        console.error('--- Verification Failed ---');
        console.error(error.message);
    }
}

testForgotPassword();
