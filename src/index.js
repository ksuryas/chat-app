const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages.js');
const { addUsers, removeUser, getUser, getUsersInSpace } = require('./utils/users.js');
const express = require('express');
const app = express();

const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 8000;
const log = console.log;

app.use(express.static("public"));

io.on('connection', (socket) => {
   log('New socket connection');
	
	socket.on('join', ({  username, space }, cb) => {
		const {  error, user  } = addUsers({  id: socket.id, username, space });
		const msg = `Welcome to ${user.space}! Start chatting!`;
		const joinMessage = `${user.username} has joined the chat space!`;
		
		if(error) {
		  return cb(error);
		}
		
		socket.join(user.space);
		
		socket.emit('message', generateMessage('Admin', msg));
		socket.broadcast.to(user.space).emit('message', generateMessage('Admin', joinMessage));
		io.to(user.space).emit('roomData', {
			space: user.space,
			users: getUsersInSpace(user.space)
		});
		cb();
	});
	
	socket.on('sendMessage', (message, cb) => {
		const filter = new Filter();
		if(filter.isProfane(message)) {
			return cb('You cannot use bad words in your message');
		}
		const user = getUser(socket.id);
		io.to(user.space).emit('message', generateMessage(user.username, message));	
		
		cb();
	});
	socket.on('sendLocation', (coords, cb) => {
			const locationURL = `https://www.google.com/maps?q=${coords.lat},${coords.long}`;
			const user = getUser(socket.id);
			
		    io.to(user.space).emit('locationMessage', generateLocationMessage(user.username, locationURL));	
			cb();
	});
	
	socket.on('disconnect', () => {
		const user = removeUser(socket.id);
		
		if(user) {
		  io.emit('message', generateMessage('Admin', `${user.username} has left the chat space`));
			io.to(user.space).emit('roomData', {
			space: user.space,
			users: getUsersInSpace(user.space)
		});
	
		}

	});
		
});

server.listen(port, () => {
	log(`Chat App on ${port}`);
});