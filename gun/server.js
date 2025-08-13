// --- GunDB Web Chat Server ---
const Gun = require('gun');
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0'; // Bind to all network interfaces
const GUN_OPTIONS = {
    web: undefined, // will be set after server creation
    radisk: false, // disk persistence disabled for Windows compatibility
    localStorage: false
};

// HTML Chat Interface
const CHAT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GunDB Web Chat</title>
    <script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gun/lib/radix.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gun/lib/store.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gun/lib/rindexed.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .chat-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            width: 90%;
            max-width: 800px;
            height: 80vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .chat-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            position: relative;
        }

        .chat-header h1 {
            font-size: 24px;
            margin-bottom: 10px;
        }

        .connection-status {
            position: absolute;
            top: 20px;
            right: 20px;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }

        .status-connected {
            background: #4CAF50;
            color: white;
        }

        .status-disconnected {
            background: #f44336;
            color: white;
        }

        .login-section {
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
        }

        .login-form {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .form-group {
            flex: 1;
            min-width: 150px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }

        .form-group input {
            width: 100%;
            padding: 10px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }

        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }

        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: transform 0.2s;
        }

        .btn:hover {
            transform: translateY(-2px);
        }

        .chat-section {
            flex: 1;
            display: none;
            flex-direction: column;
        }

        .chat-section.active {
            display: flex;
        }

        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
        }

        .message {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }

        .message.sent {
            flex-direction: row-reverse;
        }

        .message-content {
            background: white;
            padding: 12px 16px;
            border-radius: 18px;
            max-width: 70%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            position: relative;
        }

        .message.sent .message-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .message.received .message-content {
            background: white;
            color: #333;
        }

        .message-info {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }

        .message.sent .message-info {
            color: rgba(255,255,255,0.8);
        }

        .chat-input-section {
            padding: 20px;
            background: white;
            border-top: 1px solid #e9ecef;
        }

        .chat-input-form {
            display: flex;
            gap: 10px;
        }

        .chat-input {
            flex: 1;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 25px;
            font-size: 14px;
            resize: none;
            outline: none;
            transition: border-color 0.3s;
        }

        .chat-input:focus {
            border-color: #667eea;
        }

        .send-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: transform 0.2s;
        }

        .send-btn:hover {
            transform: translateY(-2px);
        }

        .user-info {
            background: #e9ecef;
            padding: 10px 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 14px;
        }

        .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 8px;
            margin: 10px 0;
            border: 1px solid #f5c6cb;
        }

        .success-message {
            background: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 8px;
            margin: 10px 0;
            border: 1px solid #c3e6cb;
        }

        @media (max-width: 768px) {
            .chat-container {
                width: 95%;
                height: 90vh;
            }
            
            .login-form {
                flex-direction: column;
            }
            
            .form-group {
                min-width: auto;
            }
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <h1>🔐 GunDB Web Chat</h1>
            <div class="connection-status" id="connectionStatus">Connecting...</div>
        </div>

        <div class="login-section" id="loginSection">
            <div class="user-info">
                <strong>Server:</strong> http://localhost:${PORT}/gun
            </div>
            <form class="login-form" id="loginForm">
                <div class="form-group">
                    <label for="userId">User ID:</label>
                    <input type="text" id="userId" placeholder="Enter your user ID" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" placeholder="Enter password" required>
                </div>
                <div class="form-group">
                    <label for="targetUser">Chat with:</label>
                    <input type="text" id="targetUser" placeholder="Enter recipient user ID" required>
                </div>
                <button type="submit" class="btn">Start Chat</button>
            </form>
        </div>

        <div class="chat-section" id="chatSection">
            <div class="chat-messages" id="chatMessages">
                <div class="message received">
                    <div class="message-content">
                        Welcome to GunDB Web Chat! 🎉
                        <div class="message-info">System • Just now</div>
                    </div>
                </div>
            </div>
            
            <div class="chat-input-section">
                <form class="chat-input-form" id="chatForm">
                    <textarea 
                        class="chat-input" 
                        id="messageInput" 
                        placeholder="Type your message here..." 
                        rows="1"
                        maxlength="500"
                    ></textarea>
                    <button type="submit" class="send-btn" id="sendBtn">Send</button>
                </form>
            </div>
        </div>
    </div>

    <script>
        // GunDB Web Chat Application
        class GunDBChat {
            constructor() {
                this.gun = null;
                this.userId = '';
                this.targetUser = '';
                this.password = '';
                this.isConnected = false;
                this.messages = new Map();
                
                this.initializeElements();
                this.initializeGunDB();
                this.bindEvents();
            }

            initializeElements() {
                this.connectionStatus = document.getElementById('connectionStatus');
                this.loginSection = document.getElementById('loginSection');
                this.chatSection = document.getElementById('chatSection');
                this.loginForm = document.getElementById('loginForm');
                this.chatForm = document.getElementById('chatForm');
                this.chatMessages = document.getElementById('chatMessages');
                this.messageInput = document.getElementById('messageInput');
                this.sendBtn = document.getElementById('sendBtn');
                
                // Form inputs
                this.userIdInput = document.getElementById('userId');
                this.passwordInput = document.getElementById('password');
                this.targetUserInput = document.getElementById('targetUser');
            }

            initializeGunDB() {
                try {
                    // Initialize GunDB with local server
                    this.gun = Gun(['http://localhost:${PORT}/gun']);
                    
                    // Test connection
                    this.gun.get('connection_test').put({
                        test: true,
                        timestamp: Date.now()
                    }, (ack) => {
                        if (ack && ack.err) {
                            console.error('GunDB connection error:', ack.err);
                            this.updateConnectionStatus(false, 'Connection Error');
                        } else {
                            console.log('GunDB connected successfully');
                            this.updateConnectionStatus(true, 'Connected');
                        }
                    });
                    
                } catch (error) {
                    console.error('Failed to initialize GunDB:', error);
                    this.updateConnectionStatus(false, 'Initialization Failed');
                }
            }

            bindEvents() {
                // Login form submission
                this.loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });

                // Chat form submission
                this.chatForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.sendMessage();
                });

                // Enter key handling
                this.messageInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendMessage();
                    }
                });
            }

            handleLogin() {
                this.userId = this.userIdInput.value.trim();
                this.password = this.passwordInput.value.trim();
                this.targetUser = this.targetUserInput.value.trim();

                if (!this.userId || !this.password || !this.targetUser) {
                    this.showMessage('Please fill in all fields.', 'error');
                    return;
                }

                if (this.userId === this.targetUser) {
                    this.showMessage('You cannot chat with yourself. Please choose a different user ID.', 'error');
                    return;
                }

                // Start chat
                this.startChat();
            }

            startChat() {
                // Hide login, show chat
                this.loginSection.style.display = 'none';
                this.chatSection.classList.add('active');

                // Add welcome message
                this.addMessage({
                    content: \`Chat started with \${this.targetUser}\`,
                    from: 'System',
                    timestamp: Date.now(),
                    type: 'system'
                });

                // Start listening for messages
                this.listenForMessages();
                
                // Focus on message input
                this.messageInput.focus();
            }

            listenForMessages() {
                // Listen for messages sent to current user
                this.gun.get('inbox').get(this.userId).map().on((data, id) => {
                    if (!data || !data.content || this.messages.has(id)) return;
                    
                    this.messages.set(id, data);
                    
                    // Add message to chat
                    this.addMessage({
                        content: data.content,
                        from: data.from,
                        timestamp: data.timestamp,
                        type: 'received'
                    });

                    // Mark as verified
                    if (!data.verified) {
                        this.gun.get('messages').get(id).put({
                            ...data,
                            verified: true
                        });
                    }

                    // Remove from inbox after receipt
                    this.gun.get('inbox').get(this.userId).get(id).put(null);
                });
            }

            sendMessage() {
                const content = this.messageInput.value.trim();
                if (!content) return;

                const messageId = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
                const message = {
                    id: messageId,
                    from: this.userId,
                    to: this.targetUser,
                    content: content,
                    timestamp: Date.now(),
                    verified: false
                };

                // Send message to GunDB
                this.gun.get('messages').get(messageId).put(message, (ack) => {
                    if (ack && ack.err) {
                        console.error('Failed to send message:', ack.err);
                        this.showMessage('Failed to send message. Please try again.', 'error');
                    } else {
                        // Add to inbox of target user
                        this.gun.get('inbox').get(this.targetUser).set(message);
                        
                        // Add message to local chat
                        this.addMessage({
                            content: content,
                            from: this.userId,
                            timestamp: Date.now(),
                            type: 'sent'
                        });

                        // Clear input
                        this.messageInput.value = '';
                    }
                });
            }

            addMessage(messageData) {
                const messageDiv = document.createElement('div');
                messageDiv.className = \`message \${messageData.type}\`;
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'message-content';
                
                const textDiv = document.createElement('div');
                textDiv.textContent = messageData.content;
                
                const infoDiv = document.createElement('div');
                infoDiv.className = 'message-info';
                
                if (messageData.type === 'system') {
                    infoDiv.textContent = 'System • ' + this.formatTime(messageData.timestamp);
                } else {
                    infoDiv.textContent = \`\${messageData.from} • \${this.formatTime(messageData.timestamp)}\`;
                }
                
                contentDiv.appendChild(textDiv);
                contentDiv.appendChild(infoDiv);
                messageDiv.appendChild(contentDiv);
                
                this.chatMessages.appendChild(messageDiv);
                
                // Scroll to bottom
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }

            formatTime(timestamp) {
                const date = new Date(timestamp);
                const now = new Date();
                const diff = now - date;
                
                if (diff < 60000) { // Less than 1 minute
                    return 'Just now';
                } else if (diff < 3600000) { // Less than 1 hour
                    const minutes = Math.floor(diff / 60000);
                    return \`\${minutes}m ago\`;
                } else if (diff < 86400000) { // Less than 1 day
                    const hours = Math.floor(diff / 3600000);
                    return \`\${hours}h ago\`;
                } else {
                    return date.toLocaleDateString();
                }
            }

            updateConnectionStatus(connected, status) {
                this.isConnected = connected;
                this.connectionStatus.textContent = status;
                this.connectionStatus.className = \`connection-status \${connected ? 'status-connected' : 'status-disconnected'}\`;
                
                // Update button states
                this.sendBtn.disabled = !connected;
                this.messageInput.disabled = !connected;
            }

            showMessage(message, type = 'info') {
                const messageDiv = document.createElement('div');
                messageDiv.className = \`message \${type === 'error' ? 'error-message' : 'success-message'}\`;
                messageDiv.textContent = message;
                
                // Insert after header
                this.chatSection.insertBefore(messageDiv, this.chatSection.firstChild);
                
                // Remove after 5 seconds
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 5000);
            }
        }

        // Initialize chat when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new GunDBChat();
        });
    </script>
</body>
</html>`;

// Create HTTP server for GunDB relay and web chat
const server = http.createServer((req, res) => {
    // Add CORS headers for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Basic request logging
    console.log(`[GunDB] ${new Date().toISOString()} ${req.method} ${req.url} from ${req.socket.remoteAddress}`);

    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(CHAT_HTML);
    } else if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            time: new Date().toISOString(),
            host: HOST,
            port: PORT,
            service: 'GunDB Web Chat Server'
        }));
    } else if (req.url === '/chat') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(CHAT_HTML);
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, HOST, (err) => {
    if (err) {
        console.error(`[GunDB] Server failed to start:`, err);
        process.exit(1);
    }
    console.log(`🚀 GunDB Web Chat Server started!`);
    console.log(`📱 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
    console.log(`🔐 GunDB endpoint: http://localhost:${PORT}/gun`);
    console.log(`💬 Chat interface: http://localhost:${PORT}/chat`);
    console.log('');
    console.log('💡 To test the chat:');
    console.log('   1. Open http://localhost:8080 in your browser');
    console.log('   2. Open another browser window/tab');
    console.log('   3. Use different user IDs to chat between them');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});

// Attach GunDB to HTTP server
GUN_OPTIONS.web = server;
const gun = Gun(GUN_OPTIONS);

console.log('[GunDB] Relay initialized and ready for web chat.');

// --- Graceful Shutdown ---
process.on('SIGINT', () => {
    console.log('\n[GunDB] Relay shutting down...');
    server.close(() => {
        console.log('[GunDB] Server closed.');
        process.exit(0);
    });
});