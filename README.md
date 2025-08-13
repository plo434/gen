# Secure Messaging System with GunDB

A decentralized messaging system built with Node.js and GunDB that provides secure, real-time messaging capabilities.

## 🚀 Features

- **Real-time messaging** between users
- **Message persistence** with automatic cleanup
- **User management** with secure authentication
- **API-based architecture** for easy integration
- **Cross-platform compatibility** (Windows, Linux, macOS)
- **Memory-efficient** message handling

## 📁 Project Structure

```
gun/
├── messaging-server.js      # Main API server
├── messaging-app-v2.js      # Updated messaging client
├── messaging-app.js         # Original GunDB client
├── server.js               # Basic GunDB relay server
├── package.json            # Dependencies
└── README.md              # This file
```

## 🛠️ Installation

1. **Install Node.js** (version 14 or higher)
2. **Clone or download** the project files
3. **Install dependencies:**
   ```bash
   npm install
   ```

## 🚀 Quick Start

### 1. Start the Messaging Server

```bash
# Start the API server
node messaging-server.js
```

The server will start on port 8080 (or the port specified in PORT environment variable).

### 2. Start the Messaging Client

In a new terminal window:

```bash
# Start the messaging application
node messaging-app-v2.js
```

### 3. Use the Application

- Enter your user ID and password
- Choose from the main menu options
- Start chatting with other users

## 🔧 Configuration

### Server Configuration

The server can be configured using environment variables:

```bash
# Set custom port
PORT=3000 node messaging-server.js

# Set custom host
HOST=0.0.0.0 node messaging-server.js
```

### Client Configuration

Edit `messaging-app-v2.js` to change the server URL:

```javascript
const API_SERVER = 'http://your-server-url:port';
```

## 📡 API Endpoints

### Messages

- **POST** `/api/messages` - Send a message
- **GET** `/api/messages` - Get messages (with optional filters)
- **DELETE** `/api/messages` - Delete a message

### Users

- **POST** `/api/users` - Create a new user
- **GET** `/api/users` - Get all users

### Inbox

- **GET** `/api/inbox` - Get user's inbox
- **DELETE** `/api/inbox` - Clear user's inbox

### System

- **GET** `/api/health` - Server health check

## 💬 Message Flow

1. **User A** sends a message to **User B**
2. Message is stored on the server
3. **User B** receives the message in their inbox
4. Message is automatically deleted from server after reading
5. Message is saved locally in chat history

## 🔒 Security Features

- **Password hashing** using SHA-256
- **User authentication** required for operations
- **Permission checking** for message deletion
- **Input validation** for all API endpoints

## 🌐 Deployment

### Local Development

```bash
# Terminal 1: Start server
node messaging-server.js

# Terminal 2: Start client
node messaging-app-v2.js
```

### Cloud Deployment

The server can be deployed to various cloud platforms:

#### Render.com (Free)
1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `node messaging-server.js`
5. Deploy

#### Railway.app (Free tier)
1. Connect your GitHub repository
2. Set start command: `node messaging-server.js`
3. Deploy

#### Fly.io (Free tier)
1. Install Fly CLI
2. Create app: `fly apps create your-app-name`
3. Deploy: `fly deploy`

### Environment Variables for Production

```bash
# Set production port
PORT=3000

# Set production host
HOST=0.0.0.0

# Enable HTTPS (if using reverse proxy)
NODE_ENV=production
```

## 📊 Monitoring

### Health Check

```bash
curl http://your-server:port/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "messageCount": 150,
  "userCount": 25,
  "memory": {
    "heapUsed": 52428800,
    "heapTotal": 104857600
  }
}
```

### Server Logs

The server logs all requests with timestamps:

```
[2024-01-01T00:00:00.000Z] POST /api/messages
[2024-01-01T00:00:01.000Z] GET /api/inbox
[2024-01-01T00:00:02.000Z] DELETE /api/messages
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change port
   PORT=3001 node messaging-server.js
   ```

2. **Connection refused**
   - Make sure the server is running
   - Check firewall settings
   - Verify the correct server URL in the client

3. **Messages not received**
   - Check if both users are online
   - Verify user IDs are correct
   - Check server logs for errors

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=* node messaging-server.js
```

## 🔄 Updates and Maintenance

### Regular Maintenance

- Monitor server memory usage
- Check for new GunDB updates
- Review and rotate logs
- Monitor API usage patterns

### Backup Strategy

- Messages are automatically cleaned up after reading
- Chat history is stored locally on each client
- Consider implementing database persistence for critical messages

## 📈 Performance

### Optimization Tips

- Use connection pooling for high-traffic scenarios
- Implement rate limiting for API endpoints
- Monitor memory usage and implement garbage collection
- Use load balancing for multiple server instances

### Scalability

The system can be scaled by:

1. **Horizontal scaling**: Deploy multiple server instances
2. **Load balancing**: Use reverse proxy (nginx, HAProxy)
3. **Database scaling**: Implement Redis for message caching
4. **CDN**: Use CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [ISC License](LICENSE).

## 🆘 Support

For support and questions:

- Check the troubleshooting section
- Review server logs
- Test with the health check endpoint
- Verify network connectivity

## 🔮 Future Enhancements

- [ ] End-to-end encryption
- [ ] File sharing capabilities
- [ ] Group chat functionality
- [ ] Push notifications
- [ ] Web interface
- [ ] Mobile app
- [ ] Message search
- [ ] User profiles
- [ ] Message reactions
- [ ] Offline message queuing

---

**Note**: This system is designed for development and testing. For production use, consider implementing additional security measures, monitoring, and backup strategies.
