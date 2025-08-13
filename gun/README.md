# GunDB Secure Messaging System

A secure messaging system using GunDB running on Render

## 🚀 Server

The server runs on Render and can be accessed via:
```
https://gen-kugt.onrender.com/gun
```

## 📁 Files

- `server.js` - Local GunDB server (for testing)
- `sender.js` - Message sending application with connection verification
- `receiver.js` - Message receiving application with connection verification
- `test-render-connection.js` - Test connection to Render server
- `start-server.bat` - Quick start for local server

## 🛠️ Installation

```bash
npm install
```

## 🧪 Connection Testing

### Test External Server
```bash
node test-render-connection.js
```

### Test Local Server
```bash
node server.js
```

## 💬 Using the System

### 1. Send Messages
```bash
node sender.js
```

### 2. Receive Messages
```bash
node receiver.js
```

### 3. Usage Steps
1. **Automatic Connection Check** - The app automatically verifies server connection
2. Enter your user ID
3. Enter your password
4. Enter the recipient user ID
5. Start typing and messages will be sent automatically

## 🔍 Automatic Connection Verification

### What happens on startup:
1. **🔍 Server Connection Check** - Verifies server availability via `/health` endpoint
2. **🔍 GunDB Connection Test** - Tests ability to read/write to the database
3. **✅ Readiness Confirmation** - App starts only after confirming connection

### Verification Messages:
- `✅ Server is connected and working properly`
- `✅ GunDB connection is working properly`
- `❌ Cannot connect to server` + troubleshooting tips
- `⚠️ Warning: GunDB connection issue` + option to continue

## 🔧 Configuration

### Change Server
If you want to change the server, edit these lines in `sender.js` and `receiver.js`:

```javascript
const GUN_SERVER = 'https://gen-kugt.onrender.com/gun';
const SERVER_HEALTH_URL = 'https://gen-kugt.onrender.com/health';
```

### Run Local Server
```bash
node server.js
```

## 🌐 External Network Access

The system already works from outside the network via Render! No additional configuration needed.

## 🔒 Security

- Messages encrypted using SHA-256
- Each message has a unique ID
- Message receipt confirmation
- Messages deleted from server inbox after receipt
- Connection verification before sending any messages

## 📝 Notes

- Make sure to use the same user IDs in both applications
- Messages are stored on Render server
- Can be used from anywhere in the world
- App automatically verifies connection before starting

## 🐛 Troubleshooting

### Connection Issues
```bash
node test-render-connection.js
```

### Message Issues
- Verify user IDs are correct
- Check for error messages in Terminal
- App displays clear error messages with tips

### GunDB Issues
- Ensure all libraries are installed
- Check Node.js version (preferably 14+)
- App automatically verifies connection

## 🆕 New Features

### Automatic Connection Verification:
- ✅ Server status check before starting
- ✅ GunDB connection testing
- ✅ Clear English messages
- ✅ Troubleshooting tips
- ✅ Visual indicators (emojis)

### User Interface Improvements:
- 📤 Message sending indicator
- 📨 Message receiving indicator
- ✅ Successful operation confirmation
- ❌ Clear error messages

## 📞 Support

If you encounter problems:
1. App automatically verifies connection
2. Follow the tips displayed on screen
3. Test connection: `node test-render-connection.js`
4. Verify user IDs are correct
