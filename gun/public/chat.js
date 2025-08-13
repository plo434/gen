// GunDB Secure Chat Application
class GunDBChat {
    constructor() {
        this.gun = null;
        this.userId = '';
        this.targetUser = '';
        this.password = '';
        this.isConnected = false;
        this.messages = new Map();
        this.typingTimeout = null;

        this.initializeElements();
        this.initializeGunDB();
        this.bindEvents();
        this.checkConnection();
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
        this.typingIndicator = document.getElementById('typingIndicator');

        // Form inputs
        this.userIdInput = document.getElementById('userId');
        this.passwordInput = document.getElementById('password');
        this.targetUserInput = document.getElementById('targetUser');
    }

    initializeGunDB() {
        try {
            // Initialize GunDB with Render server
            this.gun = Gun(['https://gen-kugt.onrender.com/gun']);

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

        // Message input events
        this.messageInput.addEventListener('input', () => {
            this.handleTyping();
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
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
            content: `Chat started with ${this.targetUser}`,
            from: 'System',
            timestamp: Date.now(),
            type: 'system'
        });

        // Start listening for messages
        this.listenForMessages();

        // Listen for typing indicators
        this.listenForTyping();

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

    listenForTyping() {
        // Listen for typing indicators from target user
        this.gun.get('typing').get(this.targetUser).on((data) => {
            if (data && data.isTyping && data.userId === this.targetUser) {
                this.showTypingIndicator(true);

                // Hide typing indicator after 3 seconds
                clearTimeout(this.typingTimeout);
                this.typingTimeout = setTimeout(() => {
                    this.showTypingIndicator(false);
                }, 3000);
            }
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
                this.autoResizeTextarea();

                // Hide typing indicator
                this.showTypingIndicator(false);
            }
        });
    }

    addMessage(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${messageData.type}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const textDiv = document.createElement('div');
        textDiv.textContent = messageData.content;

        const infoDiv = document.createElement('div');
        infoDiv.className = 'message-info';

        if (messageData.type === 'system') {
            infoDiv.textContent = 'System • ' + this.formatTime(messageData.timestamp);
        } else {
            infoDiv.textContent = `${messageData.from} • ${this.formatTime(messageData.timestamp)}`;
        }

        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(infoDiv);
        messageDiv.appendChild(contentDiv);

        this.chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    handleTyping() {
        // Send typing indicator
        this.gun.get('typing').get(this.userId).put({
            isTyping: true,
            userId: this.userId,
            timestamp: Date.now()
        });
    }

    showTypingIndicator(show) {
        if (show) {
            this.typingIndicator.classList.add('active');
        } else {
            this.typingIndicator.classList.remove('active');
        }
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    checkConnection() {
        // Check server health
        fetch('https://gen-kugt.onrender.com/health')
            .then(response => {
                if (response.ok) {
                    this.updateConnectionStatus(true, 'Connected');
                } else {
                    this.updateConnectionStatus(false, 'Server Error');
                }
            })
            .catch(error => {
                console.error('Server connection check failed:', error);
                this.updateConnectionStatus(false, 'Disconnected');
            });
    }

    updateConnectionStatus(connected, status) {
        this.isConnected = connected;
        this.connectionStatus.textContent = status;
        this.connectionStatus.className = `connection-status ${connected ? 'status-connected' : 'status-disconnected'}`;

        // Update button states
        this.sendBtn.disabled = !connected;
        this.messageInput.disabled = !connected;
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type === 'error' ? 'error-message' : 'success-message'}`;
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

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, stop listening
        console.log('Page hidden, stopping real-time updates');
    } else {
        // Page is visible, resume listening
        console.log('Page visible, resuming real-time updates');
    }
});

// Handle beforeunload
window.addEventListener('beforeunload', () => {
    // Clean up any ongoing operations
    console.log('Page unloading, cleaning up...');
});

