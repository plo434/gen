// --- Test Render GunDB Server Connection ---
const http = require('http');
const https = require('https');

const RENDER_SERVER = 'https://gen-kugt.onrender.com';
const TEST_ENDPOINTS = [
    '/',
    '/health',
    '/gun'
];

console.log('Testing Render GunDB Server Connection...\n');
console.log(`Server: ${RENDER_SERVER}\n`);

async function testEndpoint(endpoint) {
    return new Promise((resolve) => {
        const url = `${RENDER_SERVER}${endpoint}`;
        console.log(`Testing: ${url}`);

        // Use https for Render
        const req = https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`✅ ${endpoint}: ${res.statusCode} - ${res.statusMessage}`);
                if (endpoint === '/health') {
                    try {
                        const health = JSON.parse(data);
                        console.log(`   Server Info: ${JSON.stringify(health, null, 2)}`);
                    } catch (e) {
                        console.log(`   Response: ${data.substring(0, 100)}...`);
                    }
                } else if (endpoint === '/') {
                    console.log(`   HTML Response: ${data.substring(0, 150)}...`);
                }
                console.log('');
                resolve();
            });
        });

        req.on('error', (err) => {
            console.log(`❌ ${endpoint}: ${err.message}`);
            console.log('');
            resolve();
        });

        req.setTimeout(10000, () => {
            console.log(`⏰ ${endpoint}: Timeout after 10 seconds`);
            console.log('');
            req.destroy();
            resolve();
        });
    });
}

async function runTests() {
    console.log('Starting connection tests to Render server...\n');

    for (const endpoint of TEST_ENDPOINTS) {
        await testEndpoint(endpoint);
    }

    console.log('Connection tests completed!');
    console.log('\nNext steps:');
    console.log('1. If all tests pass ✅, your server is working correctly');
    console.log('2. Test messaging between two clients:');
    console.log('   - Terminal 1: node sender.js');
    console.log('   - Terminal 2: node receiver.js');
    console.log('3. Make sure both clients use the same user IDs for testing');
}

runTests().catch(console.error);

