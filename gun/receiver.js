// --- Secure GunDB Messaging Client ---
const Gun = require('gun');
require('gun/lib/radix');
require('gun/lib/store');
require('gun/lib/rindexed');
const readline = require('readline');
const crypto = require('crypto');
const https = require('https');

const GUN_SERVER = 'https://gen-kugt.onrender.com/gun';
const SERVER_HEALTH_URL = 'https://gen-kugt.onrender.com/health';
const MESSAGE_KEY = 'messages';
const INBOX_KEY = 'inbox';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Function to check server connection
async function checkServerConnection() {
    return new Promise((resolve) => {
        console.log('🔍 Checking server connection...');

        const req = https.get(SERVER_HEALTH_URL, (res) => {
            if (res.statusCode === 200) {
                console.log('✅ Server is connected and working properly');
                resolve(true);
            } else {
                console.log(`❌ Server is running but there is an issue: ${res.statusCode}`);
                resolve(false);
            }
        });

        req.on('error', (err) => {
            console.log(`❌ Cannot connect to server: ${err.message}`);
            console.log('💡 Make sure:');
            console.log('   - Internet connection is working');
            console.log('   - Server is running on Render');
            console.log('   - URL: https://gen-kugt.onrender.com');
            resolve(false);
        });

        req.setTimeout(10000, () => {
            console.log('⏰ Server connection timeout (10 seconds)');
            req.destroy();
            resolve(false);
        });
    });
}

// Function to test GunDB connection
async function testGunDBConnection() {
    return new Promise((resolve) => {
        console.log('🔍 Testing GunDB connection...');

        const testGun = Gun([GUN_SERVER]);
        const testNode = testGun.get('connection_test');

        testNode.put({ test: true, timestamp: Date.now() }, (ack) => {
            if (ack && ack.err) {
                console.log(`❌ GunDB connection issue: ${ack.err}`);
                resolve(false);
            } else {
                console.log('✅ GunDB connection is working properly');
                resolve(true);
            }
        });

        // Timeout after 5 seconds
        setTimeout(() => {
            console.log('⏰ GunDB test timeout');
            resolve(false);
        }, 5000);
    });
}

const gun = Gun([GUN_SERVER]);
let userId = "";
let password = "";
let targetUser = "";
const receivedMessages = new Set();

console.log("Secure Messaging App using GunDB\n----------------------------------");

// Main initialization function
async function initializeApp() {
    console.log('🚀 Starting application...\n');

    // Check server connection first
    const serverConnected = await checkServerConnection();
    if (!serverConnected) {
        console.log('\n❌ Failed to connect to server. Cannot continue.');
        console.log('💡 Try again later or check server settings.');
        process.exit(1);
    }

    // Test GunDB connection
    const gunDBConnected = await testGunDBConnection();
    if (!gunDBConnected) {
        console.log('\n⚠️  Warning: GunDB connection issue. Messages may not work properly.');
        console.log('💡 You can continue but may experience receiving issues.');
    }

    console.log('\n🎉 Application is ready to use!\n');

    // Start the app
    promptLogin();
}

// Prompt for user credentials and recipient
function promptLogin() {
    rl.question("Enter your user ID: ", (id) => {
        userId = (id && id.trim()) ? id.trim() : ("user_" + Math.random().toString(36).substr(2, 8));
        console.log("Your ID: " + userId);
        rl.question("Enter your password: ", (pass) => {
            password = crypto.createHash('sha256').update(pass).digest('hex');
            rl.question("Enter the recipient user ID: ", (target) => {
                targetUser = target.trim();
                if (!targetUser) {
                    console.log("Recipient user ID cannot be empty.");
                    return promptLogin();
                }
                startMessaging();
                startReceiving();
            });
        });
    });
}

// Send messages
function startMessaging() {
    console.log("\nYou can now type messages (type 'exit' to quit):");
    rl.on('line', (input) => {
        if (input.toLowerCase() === 'exit') {
            console.log("You have exited the system.");
            process.exit(0);
        }
        if (input.trim() === "") {
            console.log("Cannot send an empty message.");
            return;
        }

        // Add connection status indicator
        console.log('📤 Sending message...');

        const messageId = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
        const message = {
            id: messageId,
            from: userId,
            to: targetUser,
            content: input,
            timestamp: Date.now(),
            verified: false
        };

        gun.get(MESSAGE_KEY).get(messageId).put(message, ackHandler);
        gun.get(INBOX_KEY).get(targetUser).set(message, ackHandler);
        console.log("✅ Message sent: " + input);
    });
}

// Receive messages
function startReceiving() {
    console.log("\nWaiting for new messages...");
    gun.get(INBOX_KEY).get(userId).map().on((data, id) => {
        if (!data || !data.content || receivedMessages.has(data.id)) return;
        receivedMessages.add(data.id);
        const time = new Date(data.timestamp).toLocaleTimeString();
        console.log(`\n📨 New message at ${time}:\nFrom: ${data.from}\nContent: ${data.content}\n`);
        // Confirm message receipt
        if (!data.verified) {
            gun.get(MESSAGE_KEY).get(data.id).put({ ...data, verified: true }, ackHandler);
        }
        // Remove message from server inbox after receipt
        gun.get(INBOX_KEY).get(userId).get(id).put(null, (ack) => {
            if (ack && ack.err) {
                console.error("Error deleting message from inbox:", ack.err);
            } else {
                console.log("✅ Message deleted from server inbox.");
            }
        });
    });
}

// GunDB write acknowledgement handler
function ackHandler(ack) {
    if (ack && ack.err) {
        console.error("❌ GunDB Error:", ack.err);
    } else {
        console.log("✅ GunDB operation successful");
    }
}

// Start the application
initializeApp();