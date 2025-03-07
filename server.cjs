const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Parse command line arguments for port
const argv = process.argv.slice(2);
let portArg = 3000;

for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '-p' || argv[i] === '--port') {
    if (i + 1 < argv.length && argv[i + 1]) {
      portArg = parseInt(argv[i + 1], 10);
      break;
    }
  }
}

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Load SSL certificates
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certs/localhost.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs/localhost.crt')),
};

const PORT = process.env.PORT || portArg;

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    // Ensure req.url is defined before parsing
    const parsedUrl = req.url ? parse(req.url, true) : parse('/', true);
    handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    if (err) {
      console.error('Error starting server:', err);
      throw err;
    }
    console.log(`> Server started on https://localhost:${PORT}`);
  });
}); 