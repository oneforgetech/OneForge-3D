// Startup file for cPanel "Setup Node.js App" (Passenger). Locally, use `npm run dev` / `npm start`.
const { createServer } = require('http');
const next = require('next');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> ONEFORGE listening on ${port} (${process.env.NODE_ENV})`);
  });
});
