const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
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
	socket.broadcast.emit('message', 'A new user joined our application');
	
	socket.on('sendMessage', (message, cb) => {
		const filter = new Filter();
		if(filter.isProfane(message)) {
			return cb('You cannot use bad words in your message');
		}
		io.emit('message', message);
		cb();
	});
	socket.on('sendLocation', (coords, cb) => {
			io.emit('message', `https://www.google.com/maps?q=${coords.lat},${coords.long}`);
			cb();

	});
	
	socket.on('disconnect', () => {
		io.emit('message', 'A user has left our application')	
	});
});

server.listen(port, () => {
	log(`Chat App on ${port}`);
});
