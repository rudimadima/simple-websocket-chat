import http from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';

import { login } from './login.js';
import { setWsChatServer } from './setWsChatServer.js';

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

// Error middleware
app.use((err, req, res, next) => {
  res.status(400).json({ message: 'Server error!' });
});

app.get('/', (req, res) => { res.send('Main page. This app is made for chat via websocket.'); });

app.options('/chat/login', (req, res) => { res.send(''); });
app.post('/chat/login', login);

const port = process.env.PORT || 3000;

const server = http.createServer(app);
console.log(`Starting http-server at port ${port}`);
server.listen(port);

const wss = new WebSocketServer({ server, path: '/chat/communicate' });
setWsChatServer(wss);
