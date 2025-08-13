# GunDB Network Configuration Guide

## Problem
The server was only running on `localhost` (127.0.0.1), which means it couldn't be accessed from outside the local network.

## Solution
The server has been updated to work on all network interfaces (0.0.0.0) with CORS headers added.

## Configuration Steps

### 1. Start the Server
```bash
node server.js
```

### 2. Find External IP Address
#### On Windows:
```cmd
ipconfig
```
Look for "IPv4 Address" in the network you're using.

#### On Linux/Mac:
```bash
ifconfig
# or
ip addr show
```

### 3. Configure Firewall
#### Windows Firewall:
1. Open "Windows Defender Firewall"
2. Choose "Allow an app or feature through Windows Defender Firewall"
3. Add Node.js or port 8080

#### Or via PowerShell (as Administrator):
```powershell
New-NetFirewallRule -DisplayName "GunDB Server" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
```

### 4. Configure Router (if behind a router):
1. Enter router settings (usually 192.168.1.1)
2. Look for "Port Forwarding" or "Virtual Server"
3. Add rule:
   - Protocol: TCP
   - External Port: 8080
   - Internal IP: Local computer IP address
   - Internal Port: 8080

### 5. Test Connection
#### From same network:
```
http://YOUR_LOCAL_IP:8080
```

#### From outside network:
```
http://YOUR_EXTERNAL_IP:8080
```

## Update Client Files

### Modify sender.js and receiver.js:
```javascript
// Replace this line:
const GUN_SERVER = 'https://gen-kugt.onrender.com/gun';

// With this:
const GUN_SERVER = 'http://YOUR_EXTERNAL_IP:8080/gun';
```

## Environment Variables (Optional)
You can set environment variables:

```bash
# Windows
set PORT=9000
set HOST=0.0.0.0

# Linux/Mac
export PORT=9000
export HOST=0.0.0.0
```

## Test Connection
```bash
# Test from same network
curl http://YOUR_LOCAL_IP:8080/health

# Test from outside network
curl http://YOUR_EXTERNAL_IP:8080/health
```

## Security Notes
- Server is currently open to everyone
- Authentication can be added later
- Use HTTPS for production
- Monitor logs for suspicious access attempts
