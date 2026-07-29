const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const path = require('path');
const cors = require('cors');
const qrcode = require('qrcode');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(express.json());

// serve web client
app.use('/', express.static(path.join(__dirname, '..', 'web-client', 'public')));

const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });

// simple socket auth placeholder (improve in prod)
io.use((socket, next) => {
  // could check token here
  next();
});

io.on('connection', (socket) => {
  console.log('Web client connected', socket.id);
  socket.on('request_qr', () => {
    // listeners for qr are on bot side; bot will emit 'qr' to io
  });
});

function start() {
  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`Web server listening on http://localhost:${PORT}`);
      resolve();
    });
  });
}

module.exports = { app, server, io, start };
