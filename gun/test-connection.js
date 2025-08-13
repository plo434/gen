// --- Test Connection Script ---
const http = require('http');

const TEST_SERVER = 'http://localhost:8080'; // Change this to your server IP
const TEST_ENDPOINTS = [
    '/',
    '/health',
    '/gun'
];

console.log('Testing GunDB Server Connection...\n');

async function testEndpoint(endpoint) {
    return new Promise((resolve) => {
        const url = `${TEST_SERVER}${endpoint}`;
        console.log(`Testing: ${url}`);

        const req = http.get(url, (res) => {
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

        req.setTimeout(5000, () => {
            console.log(`⏰ ${endpoint}: Timeout after 5 seconds`);
            console.log('');
            req.destroy();
            resolve();
        });
    });
}

async function runTests() {
    console.log('Starting connection tests...\n');

    for (const endpoint of TEST_ENDPOINTS) {
        await testEndpoint(endpoint);
    }

    console.log('Connection tests completed!');
    console.log('\nTo test from external network:');
    console.log('1. Find your external IP address');
    console.log('2. Replace localhost with your IP in this script');
    console.log('3. Run: node test-connection.js');
    console.log('4. Check firewall and router settings');
}

runTests().catch(console.error);

