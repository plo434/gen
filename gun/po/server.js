const Gun = require('gun');
const http = require('http');
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>GunDB Relay Server</title>
      </head>
      <body>
        <h1>GunDB Relay Server running on port ${port}</h1>
        <p>${new Date().toLocaleString()}</p>
      </body>
      </html>
    `);
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});


const gun = Gun({
    web: server,
    radisk: false, // disables disk persistence to avoid Windows file errors
    localStorage: false
});

console.log("🔌 GunDB Relay initialized");