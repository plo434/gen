// --- Updated Messaging Application using API Server ---
const readline = require('readline');
const crypto = require('crypto');
const http = require('http');

const API_SERVER = 'http://localhost:8080'; // Change this to your server URL when deploying
const API_BASE = `${API_SERVER}/api`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let userId = "";
let password = "";
let currentChatUser = "";
const receivedMessages = new Set();
const chatHistory = new Map();

console.log("Secure Messaging Application using API Server");
console.log("============================================");

// HTTP request helper function
function makeRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}${endpoint}`;
        const options = {
            hostname: new URL(API_SERVER).hostname,
            port: new URL(API_SERVER).port || 80,
            path: `${API_BASE}${endpoint}`,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (error) {
                    resolve({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data && (method === 'POST' || method === 'PUT')) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Login function
function promptLogin() {
    rl.question("Enter your user ID: ", async (id) => {
        userId = (id && id.trim()) ? id.trim() : ("user_" + Math.random().toString(36).substr(2, 8));
        console.log("Your ID: " + userId);

        rl.question("Enter your password: ", async (pass) => {
            password = crypto.createHash('sha256').update(pass).digest('hex');

            try {
                // Create user if doesn't exist
                const response = await makeRequest('POST', '/users', { userId, password });
                if (response.status === 201 || response.status === 409) {
                    console.log("Login successful!");
                    showMainMenu();
                } else {
                    console.log("Login failed:", response.data.error);
                    promptLogin();
                }
            } catch (error) {
                console.log("Connection error. Make sure the server is running.");
                promptLogin();
            }
        });
    });
}

// Main menu
function showMainMenu() {
    console.log("\nMain Menu:");
    console.log("1. Start new chat");
    console.log("2. View chat history");
    console.log("3. Change current user");
    console.log("4. Show account info");
    console.log("5. Check server status");
    console.log("6. Exit");

    rl.question("Choose operation number: ", (choice) => {
        switch (choice.trim()) {
            case '1':
                startNewChat();
                break;
            case '2':
                showChatHistory();
                break;
            case '3':
                changeCurrentUser();
                break;
            case '4':
                showAccountInfo();
                break;
            case '5':
                checkServerStatus();
                break;
            case '6':
                console.log("Thank you for using the application!");
                process.exit(0);
                break;
            default:
                console.log("Invalid choice, try again");
                showMainMenu();
        }
    });
}

// Start new chat
function startNewChat() {
    rl.question("Enter the user ID you want to chat with: ", (target) => {
        if (!target.trim()) {
            console.log("User ID cannot be empty");
            showMainMenu();
            return;
        }

        currentChatUser = target.trim();
        console.log(`\nStarted chat with: ${currentChatUser}`);
        console.log("Type your message (type 'menu' to return to main menu):");

        // Start receiving messages
        startReceiving();

        // Start sending messages
        startMessaging();
    });
}

// Send messages
function startMessaging() {
    rl.on('line', async (input) => {
        if (input.toLowerCase() === 'menu') {
            rl.removeAllListeners('line');
            showMainMenu();
            return;
        }

        if (input.toLowerCase() === 'exit') {
            console.log("Thank you for using the application!");
            process.exit(0);
        }

        if (input.trim() === "") {
            console.log("Cannot send empty message");
            return;
        }

        try {
            const response = await makeRequest('POST', '/messages', {
                from: userId,
                to: currentChatUser,
                content: input
            });

            if (response.status === 200) {
                const messageId = response.data.messageId;
                const message = {
                    id: messageId,
                    from: userId,
                    to: currentChatUser,
                    content: input,
                    timestamp: Date.now(),
                    verified: false
                };

                // Save message to local chat history
                if (!chatHistory.has(currentChatUser)) {
                    chatHistory.set(currentChatUser, []);
                }
                chatHistory.get(currentChatUser).push({
                    ...message,
                    isOwn: true
                });

                console.log(`Message sent: ${input}`);
            } else {
                console.log("Failed to send message:", response.data.error);
            }
        } catch (error) {
            console.log("Error sending message:", error.message);
        }
    });
}

// Receive messages
async function startReceiving() {
    // Poll for new messages every 2 seconds
    setInterval(async () => {
        try {
            const response = await makeRequest('GET', `/inbox?userId=${userId}`);

            if (response.status === 200 && response.data.inbox) {
                for (const message of response.data.inbox) {
                    if (!receivedMessages.has(message.id)) {
                        receivedMessages.add(message.id);
                        const time = new Date(message.timestamp).toLocaleTimeString();

                        // Display received message
                        console.log(`\nNew message at ${time}:`);
                        console.log(`From: ${message.from}`);
                        console.log(`Content: ${message.content}`);
                        console.log("Type your message (type 'menu' to return to main menu):");

                        // Save message to chat history
                        if (!chatHistory.has(message.from)) {
                            chatHistory.set(message.from, []);
                        }
                        chatHistory.get(message.from).push({
                            ...message,
                            isOwn: false
                        });

                        // Delete message from server after reading
                        try {
                            await makeRequest('DELETE', `/messages?messageId=${message.id}&userId=${userId}`);
                        } catch (error) {
                            console.log("Error deleting message from server");
                        }
                    }
                }
            }
        } catch (error) {
            // Silent error handling for polling
        }
    }, 2000);
}

// Show chat history
function showChatHistory() {
    if (chatHistory.size === 0) {
        console.log("No previous chats");
        showMainMenu();
        return;
    }

    console.log("\nChat History:");
    let index = 1;
    for (const [user, messages] of chatHistory) {
        console.log(`${index}. ${user} (${messages.length} messages)`);
        index++;
    }

    rl.question("\nChoose chat number to view (or type 'back' to return): ", (choice) => {
        if (choice.toLowerCase() === 'back') {
            showMainMenu();
            return;
        }

        const choiceNum = parseInt(choice);
        if (isNaN(choiceNum) || choiceNum < 1 || choiceNum > chatHistory.size) {
            console.log("Invalid number");
            showChatHistory();
            return;
        }

        const users = Array.from(chatHistory.keys());
        const selectedUser = users[choiceNum - 1];
        const messages = chatHistory.get(selectedUser);

        console.log(`\nChat with ${selectedUser}:`);
        console.log("=".repeat(50));

        messages.forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString();
            const prefix = msg.isOwn ? "You" : `${msg.from}`;
            console.log(`[${time}] ${prefix}: ${msg.content}`);
        });

        console.log("=".repeat(50));
        rl.question("\nPress Enter to return to main menu: ", () => {
            showMainMenu();
        });
    });
}

// Change current user
function changeCurrentUser() {
    rl.question("Enter new user ID: ", (target) => {
        if (!target.trim()) {
            console.log("User ID cannot be empty");
            showMainMenu();
            return;
        }

        currentChatUser = target.trim();
        console.log(`Current user changed to: ${currentChatUser}`);
        showMainMenu();
    });
}

// Show account info
function showAccountInfo() {
    console.log("\nAccount Information:");
    console.log(`User ID: ${userId}`);
    console.log(`Current user: ${currentChatUser || 'None'}`);
    console.log(`Number of chats: ${chatHistory.size}`);
    console.log(`Total messages: ${Array.from(chatHistory.values()).reduce((sum, msgs) => sum + msgs.length, 0)}`);

    rl.question("\nPress Enter to return to main menu: ", () => {
        showMainMenu();
    });
}

// Check server status
async function checkServerStatus() {
    try {
        const response = await makeRequest('GET', '/health');
        if (response.status === 200) {
            console.log("\nServer Status:");
            console.log(`Status: ${response.data.status}`);
            console.log(`Uptime: ${Math.floor(response.data.uptime / 60)} minutes`);
            console.log(`Message Count: ${response.data.messageCount}`);
            console.log(`User Count: ${response.data.userCount}`);
            console.log(`Memory Usage: ${Math.round(response.data.memory.heapUsed / 1024 / 1024)} MB`);
        } else {
            console.log("Server error:", response.data.error);
        }
    } catch (error) {
        console.log("Cannot connect to server:", error.message);
    }

    rl.question("\nPress Enter to return to main menu: ", () => {
        showMainMenu();
    });
}

// Start application
console.log("Connecting to messaging server...");
promptLogin();
