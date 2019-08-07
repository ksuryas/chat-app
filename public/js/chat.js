const socket = io();
const log = console.log;

socket.on('message', (msg) => {
	log(msg);
});

document.querySelector('#message-form').addEventListener('submit', (e) => {
	e.preventDefault();
	const message = document.querySelector('input').value;
	socket.emit('sendMessage', message);
});