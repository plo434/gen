# Quick Start Guide - GunDB Messaging System

## 🚀 Get Started in 3 Steps

### Step 1: Test Connection
```bash
node test-render-connection.js
```
✅ You should see all endpoints working (except `/gun` which is normal)

### Step 2: Start Sender
```bash
node sender.js
```
- App will automatically check server connection
- Enter your user ID (or press Enter for auto-generated)
- Enter your password
- Enter recipient user ID

### Step 3: Start Receiver
```bash
node receiver.js
```
- Use the same user ID as recipient in sender
- Enter password
- Enter sender's user ID as recipient

## 💬 Start Messaging

1. **In sender terminal**: Type your message and press Enter
2. **In receiver terminal**: You'll see the message appear automatically
3. **Messages are encrypted** and stored securely on Render

## 🔧 Troubleshooting

### Connection Issues
- Check internet connection
- Verify server is running on Render
- Run `node test-render-connection.js`

### Message Issues
- Ensure user IDs match between sender and receiver
- Check for error messages in terminal
- App shows clear status indicators

## 📱 Features

- ✅ **Automatic connection verification**
- ✅ **Real-time messaging**
- ✅ **Message encryption**
- ✅ **Cross-platform compatibility**
- ✅ **External network access**

## 🌐 Server Status

Your server is running on: `https://gen-kugt.onrender.com`

**No additional setup needed!** The system works from anywhere in the world.

