// Simple Web Server for GunDB Chat Application
const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'GunDB Chat Web Server',
        time: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API endpoint for server info
app.get('/api/server-info', (req, res) => {
    res.json({
        gunServer: 'https://gen-kugt.onrender.com/gun',
        webServer: `http://localhost:${PORT}`,
        timestamp: new Date().toISOString()
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found on this server.',
        available: ['/', '/health', '/api/server-info']
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong on the server.'
    });
});

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
    console.log('🚀 GunDB Chat Web Server started!');
    console.log(`📱 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
    console.log(`🔐 GunDB Server: https://gen-kugt.onrender.com/gun`);
    console.log('');
    console.log('💡 To test the chat:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Open another browser window/tab');
    console.log('   3. Use different user IDs to chat between them');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});

