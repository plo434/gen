// --- GunDB Messaging API Server ---
const Gun = require('gun');
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 8080;
const GUN_OPTIONS = {
    web: undefined,
    radisk: false,
    localStorage: false
};

// In-memory storage for messages (alternative to GunDB for immediate operations)
const messageStore = new Map();
const userInboxes = new Map();

// Create HTTP server for messaging API
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Log all requests
    console.log(`[${new Date().toISOString()}] ${method} ${path}`);

    // Parse request body for POST/PUT requests
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const requestData = body ? JSON.parse(body) : {};

            // Route API endpoints
            if (path === '/api/health') {
                handleHealthCheck(req, res);
            } else if (path === '/api/messages' && method === 'POST') {
                handleSendMessage(req, res, requestData);
            } else if (path === '/api/messages' && method === 'GET') {
                handleGetMessages(req, res, parsedUrl.query);
            } else if (path === '/api/messages' && method === 'DELETE') {
                handleDeleteMessage(req, res, parsedUrl.query);
            } else if (path === '/api/users' && method === 'POST') {
                handleCreateUser(req, res, requestData);
            } else if (path === '/api/users' && method === 'GET') {
                handleGetUsers(req, res);
            } else if (path === '/api/inbox' && method === 'GET') {
                handleGetInbox(req, res, parsedUrl.query);
            } else if (path === '/api/inbox' && method === 'DELETE') {
                handleClearInbox(req, res, parsedUrl.query);
            } else {
                // Default response for root path
                if (path === '/') {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
                        <!DOCTYPE html>
                        <html>
                        <head><title>GunDB Messaging API Server</title></head>
                        <body>
                            <h1>GunDB Messaging API Server</h1>
                            <p>Server running on port ${PORT}</p>
                            <p>Available endpoints:</p>
                            <ul>
                                <li><strong>Key Management:</strong></li>
                                <li>POST /api/keys - Generate new key pair</li>
                                <li>GET /api/keys - Get user's public key</li>
                                <li>POST /api/keys/exchange - Perform key exchange</li>
                                <li><strong>Messaging:</strong></li>
                                <li>POST /api/messages - Send encrypted message</li>
                                <li>GET /api/messages - Get messages</li>
                                <li>DELETE /api/messages - Delete message</li>
                                <li><strong>Users:</strong></li>
                                <li>POST /api/users - Create user</li>
                                <li>GET /api/users - Get users</li>
                                <li><strong>Inbox:</strong></li>
                                <li>GET /api/inbox - Get user inbox</li>
                                <li>DELETE /api/inbox - Clear user inbox</li>
                                <li><strong>System:</strong></li>
                                <li>GET /api/health - Health check</li>
                            </ul>
                        </body>
                        </html>
                    `);
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Endpoint not found' }));
                }
            }
        } catch (error) {
            console.error('Error processing request:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
});

// Health check endpoint
function handleHealthCheck(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        messageCount: messageStore.size,
        userCount: userInboxes.size
    }));
}

// Send message endpoint
function handleSendMessage(req, res, data) {
    const { from, to, content } = data;

    if (!from || !to || !content) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required fields: from, to, content' }));
        return;
    }

    const messageId = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    const message = {
        id: messageId,
        from,
        to,
        content,
        timestamp: Date.now(),
        verified: false
    };

    // Store message in memory
    messageStore.set(messageId, message);

    // Add to recipient's inbox
    if (!userInboxes.has(to)) {
        userInboxes.set(to, new Map());
    }
    userInboxes.get(to).set(messageId, message);

    // Also store in GunDB for persistence
    const gun = Gun(GUN_OPTIONS);
    gun.get('messages').get(messageId).put(message);
    gun.get('inbox').get(to).set(message);

    console.log(`Message sent: ${from} -> ${to}: ${content}`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: true,
        messageId,
        message: 'Message sent successfully'
    }));
}

// Get messages endpoint
function handleGetMessages(req, res, query) {
    const { userId, messageId } = query;

    if (messageId) {
        // Get specific message
        const message = messageStore.get(messageId);
        if (message) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Message not found' }));
        }
    } else if (userId) {
        // Get all messages for a user
        const userMessages = [];
        for (const [id, message] of messageStore) {
            if (message.from === userId || message.to === userId) {
                userMessages.push(message);
            }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ messages: userMessages }));
    } else {
        // Get all messages
        const allMessages = Array.from(messageStore.values());
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ messages: allMessages }));
    }
}

// Delete message endpoint
function handleDeleteMessage(req, res, query) {
    const { messageId, userId } = query;

    if (!messageId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Message ID required' }));
        return;
    }

    const message = messageStore.get(messageId);
    if (!message) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Message not found' }));
        return;
    }

    // Check if user has permission to delete (sender or recipient)
    if (userId && message.from !== userId && message.to !== userId) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Permission denied' }));
        return;
    }

    // Remove from message store
    messageStore.delete(messageId);

    // Remove from all inboxes
    for (const [user, inbox] of userInboxes) {
        inbox.delete(messageId);
    }

    // Also delete from GunDB
    const gun = Gun(GUN_OPTIONS);
    gun.get('messages').get(messageId).put(null);

    console.log(`Message deleted: ${messageId}`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: true,
        message: 'Message deleted successfully'
    }));
}

// Create user endpoint
function handleCreateUser(req, res, data) {
    const { userId, password } = data;

    if (!userId || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required fields: userId, password' }));
        return;
    }

    if (userInboxes.has(userId)) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User already exists' }));
        return;
    }

    // Create user inbox
    userInboxes.set(userId, new Map());

    // Store user in GunDB
    const gun = Gun(GUN_OPTIONS);
    gun.get('users').get(userId).put({ userId, createdAt: Date.now() });

    console.log(`User created: ${userId}`);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: true,
        message: 'User created successfully',
        userId
    }));
}

// Get users endpoint
function handleGetUsers(req, res) {
    const users = Array.from(userInboxes.keys());

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ users }));
}

// Get user inbox endpoint
function handleGetInbox(req, res, query) {
    const { userId } = query;

    if (!userId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User ID required' }));
        return;
    }

    const inbox = userInboxes.get(userId);
    if (!inbox) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
    }

    const messages = Array.from(inbox.values());

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ inbox: messages }));
}

// Clear user inbox endpoint
function handleClearInbox(req, res, query) {
    const { userId } = query;

    if (!userId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User ID required' }));
        return;
    }

    const inbox = userInboxes.get(userId);
    if (!inbox) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
    }

    // Clear inbox
    inbox.clear();

    console.log(`Inbox cleared for user: ${userId}`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: true,
        message: 'Inbox cleared successfully'
    }));
}

// Start server
server.listen(PORT, (err) => {
    if (err) {
        console.error(`[Messaging Server] Failed to start:`, err);
        process.exit(1);
    }
    console.log(`[Messaging Server] API server running at http://localhost:${PORT}`);
    console.log(`[Messaging Server] GunDB relay initialized and ready`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[Messaging Server] Shutting down...');
    server.close(() => {
        console.log('[Messaging Server] Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n[Messaging Server] Received SIGTERM, shutting down...');
    server.close(() => {
        console.log('[Messaging Server] Server closed');
        process.exit(0);
    });
});
