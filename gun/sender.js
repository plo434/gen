// --- GunDB Web Sender Application ---
const Gun = require('gun');
require('gun/lib/radix');
require('gun/lib/store');
require('gun/lib/rindexed');
const http = require('http');
const https = require('https');

const GUN_SERVER = 'http://localhost:8080/gun'; // Local server
const SERVER_HEALTH_URL = 'http://localhost:8080/health';
const MESSAGE_KEY = 'messages';
const INBOX_KEY = 'inbox';

// HTML Sender Interface
const SENDER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GunDB Message Sender</title>
    <script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gun/lib/radix.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gun/lib/store.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/gun/lib/rindexed.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100vh; display: flex; justify-content: center; align-items: center; }
        .sender-container { background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); width: 90%; max-width: 600px; padding: 30px; }
        .sender-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; margin-bottom: 30px; }
        .sender-header h1 { font-size: 24px; margin-bottom: 10px; }
        .connection-status { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; }
        .status-connected { background: rgba(76, 175, 80, 0.8); }
        .status-disconnected { background: rgba(244, 67, 54, 0.8); }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
        .form-group input, .form-group textarea { width: 100%; padding: 15px; border: 2px solid #e9ecef; border-radius: 10px; font-size: 14px; transition: border-color 0.3s; }
        .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #667eea; }
        .form-group textarea { resize: vertical; min-height: 100px; }
        .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 30px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: bold; transition: transform 0.2s; width: 100%; }
        .btn:hover { transform: translateY(-2px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .message-log { background: #f8f9fa; border-radius: 10px; padding: 20px; margin-top: 20px; max-height: 300px; overflow-y: auto; }
        .message-log h3 { margin-bottom: 15px; color: #333; }
        .log-entry { background: white; padding: 10px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #667eea; }
        .log-entry.success { border-left-color: #4CAF50; }
        .log-entry.error { border-left-color: #f44336; }
        .log-time { font-size: 12px; color: #666; }
        .server-info { background: #e9ecef; padding: 15px; border-radius: 10px; margin-bottom: 20px; font-size: 14px; text-align: center; }
    </style>
</head>
<body>
    <div class="sender-container">
        <div class="sender-header">
            <h1>📤 GunDB Message Sender</h1>
            <div class="connection-status" id="connectionStatus">Connecting...</div>
        </div>

        <div class="server-info">
            <strong>Server:</strong> http://localhost:8080/gun
        </div>

        <form id="senderForm">
            <div class="form-group">
                <label for="userId">Your User ID:</label>
                <input type="text" id="userId" placeholder="Enter your user ID" required>
            </div>
            
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" placeholder="Enter password" required>
            </div>
            
            <div class="form-group">
                <label for="targetUser">Send to User ID:</label>
                <input type="text" id="targetUser" placeholder="Enter recipient user ID" required>
            </div>
            
            <div class="form-group">
                <label for="messageContent">Message:</label>
                <textarea id="messageContent" placeholder="Type your message here..." required></textarea>
            </div>
            
            <button type="submit" class="btn" id="sendBtn">Send Message</button>
        </form>

        <div class="message-log">
            <h3>Message Log</h3>
            <div id="logEntries">
                <div class="log-entry">
                    Ready to send messages...
                </div>
            </div>
        </div>
    </div>

    <script>
        class GunDBSender {
            constructor() {
                this.gun = null;
                this.isConnected = false;
                
                this.initializeElements();
                this.initializeGunDB();
                this.bindEvents();
            }

            initializeElements() {
                this.connectionStatus = document.getElementById('connectionStatus');
                this.senderForm = document.getElementById('senderForm');
                this.userIdInput = document.getElementById('userId');
                this.passwordInput = document.getElementById('password');
                this.targetUserInput = document.getElementById('targetUser');
                this.messageContent = document.getElementById('messageContent');
                this.sendBtn = document.getElementById('sendBtn');
                this.logEntries = document.getElementById('logEntries');
            }

            initializeGunDB() {
                try {
                    this.gun = Gun(['http://localhost:8080/gun']);
                    
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
                this.senderForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.sendMessage();
                });
            }

            sendMessage() {
                const userId = this.userIdInput.value.trim();
                const password = this.passwordInput.value.trim();
                const targetUser = this.targetUserInput.value.trim();
                const content = this.messageContent.value.trim();

                if (!userId || !password || !targetUser || !content) {
                    this.addLogEntry('Please fill in all fields.', 'error');
                    return;
                }

                if (userId === targetUser) {
                    this.addLogEntry('You cannot send message to yourself.', 'error');
                    return;
                }

                this.addLogEntry('Sending message...', 'info');

                const messageId = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
                const message = {
                    id: messageId,
                    from: userId,
                    to: targetUser,
                    content: content,
                    timestamp: Date.now(),
                    verified: false
                };

                this.gun.get('messages').get(messageId).put(message, (ack) => {
                    if (ack && ack.err) {
                        console.error('Failed to send message:', ack.err);
                        this.addLogEntry('Failed to send message: ' + ack.err, 'error');
                    } else {
                        this.gun.get('inbox').get(targetUser).set(message);
                        
                        this.addLogEntry(\`Message sent successfully to \${targetUser}\`, 'success');
                        this.messageContent.value = '';
                    }
                });
            }

            addLogEntry(message, type = 'info') {
                const logEntry = document.createElement('div');
                logEntry.className = \`log-entry \${type}\`;
                
                const time = new Date().toLocaleTimeString();
                logEntry.innerHTML = \`
                    <div>\${message}</div>
                    <div class="log-time">\${time}</div>
                \`;
                
                this.logEntries.appendChild(logEntry);
                this.logEntries.scrollTop = this.logEntries.scrollHeight;
                
                // Keep only last 10 entries
                while (this.logEntries.children.length > 10) {
                    this.logEntries.removeChild(this.logEntries.firstChild);
                }
            }

            updateConnectionStatus(connected, status) {
                this.isConnected = connected;
                this.connectionStatus.textContent = status;
                this.connectionStatus.className = \`connection-status \${connected ? 'status-connected' : 'status-disconnected'}\`;
                
                this.sendBtn.disabled = !connected;
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            new GunDBSender();
        });
    </script>
</body>
</html>`;

// Create HTTP server for sender application
const senderServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`[Sender] ${new Date().toISOString()} ${req.method} ${req.url} from ${req.socket.remoteAddress}`);

    if (req.url === '/' || req.url === '/sender.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(SENDER_HTML);
    } else if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            time: new Date().toISOString(),
            service: 'GunDB Message Sender'
        }));
    } else {
        res.writeHead(404);
        res.end();
    }
});

const SENDER_PORT = 8081;

senderServer.listen(SENDER_PORT, () => {
    console.log(`📤 GunDB Message Sender started!`);
    console.log(`📱 Local: http://localhost:${SENDER_PORT}`);
    console.log(`💬 Chat Server: http://localhost:8080`);
    console.log(`🔐 GunDB Server: http://localhost:8080/gun`);
    console.log('');
    console.log('💡 To use the sender:');
    console.log('   1. Open http://localhost:8081 in your browser');
    console.log('   2. Fill in the form and send messages');
    console.log('   3. Messages will be delivered to the chat server');
    console.log('');
    console.log('Press Ctrl+C to stop the sender');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n📤 Sender shutting down...');
    senderServer.close(() => {
        console.log('📤 Sender closed.');
        process.exit(0);
    });
});