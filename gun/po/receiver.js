
const Gun = require('gun');
require('gun/lib/radix');
require('gun/lib/store');
require('gun/lib/rindexed');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const gun = Gun(['http://localhost:8080/gun']);
let userId = "";
let password = "";
let targetUser = "";
const receivedMessages = new Set();

console.log("Secure Messaging App using GunDB\n");
console.log("----------------------------------");

rl.question("Enter your user ID: ", (id) => {
    userId = id.trim() || ("user_" + Math.random().toString(36).substr(2, 8));
    console.log("Your ID: " + userId);
    rl.question("Enter your password: ", (pass) => {
        password = crypto.createHash('sha256').update(pass).digest('hex');
        rl.question("Enter the recipient user ID: ", (target) => {
            targetUser = target.trim();
            startMessaging();
            startReceiving();
        });
    });
});

function startMessaging() {
    console.log("\nYou can now type messages (type 'exit' to quit):");
    rl.on('line', (input) => {
        if (input.toLowerCase() === 'exit') {
            console.log("You have exited the system.");
            process.exit(0);
        }
        if (input.trim() === "") return;
        const messageId = Date.now().toString(36) + Math.random().toString(36).substr(2, 3);
        const message = {
            id: messageId,
            from: userId,
            to: targetUser,
            content: input,
            timestamp: Date.now(),
            verified: false
        };
        gun.get('messages').get(messageId).put(message);
        gun.get('inbox').get(targetUser).set(message);
        console.log("Message sent: " + input);
    });
}

function startReceiving() {
    console.log("\nWaiting for new messages...");
    gun.get('inbox').get(userId).map().on((data, id) => {
        if (!data || !data.content || receivedMessages.has(data.id)) return;
        receivedMessages.add(data.id);
        const time = new Date(data.timestamp).toLocaleTimeString();
        console.log("\nNew message at " + time + ":\nFrom: " + data.from + "\nContent: " + data.content + "\n");
        if (!data.verified) {
            gun.get('messages').get(data.id).put({ ...data, verified: true });
        }
    });
}