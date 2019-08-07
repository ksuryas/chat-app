const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const express = require('express');
const app = express();

const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 8000;
const log = console.log;

app.use(express.static("public"));

io.on('connection', (socket) => {
   log('New socket connection');
	const msg = 'Welcome! Start chatting!';
    socket.emit('message', msg);
	socket.on('sendMessage', (message) => {
		io.emit('message', message);
	});
});

server.listen(port, () => {
	log(`Chat App on ${port}`);
});