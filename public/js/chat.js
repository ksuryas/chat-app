const socket = io(); 
const log = console.log;

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $shareLocation = document.querySelector('#shareLocation');

const $messages = document.querySelector('#messages');
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, space } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
	const $newMessage = $messages.lastElementChild;
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
	const visibleHeight = $messages.offsetHeight;
	const containerHeight = $messages.scrollHeight;
	const scrollOffset = $messages.scrollTop + visibleHeight;
	
	if(containerHeight - newMessageHeight <= scrollOffset) {
	   $messages.scrollTop = $messages.scrollHeight;
   }
};

socket.on('message', (msg) => {
	log(msg);
	const html = Mustache.render(messageTemplate, {
		username: msg.username,
		message: msg.text,
		createdAt: moment(msg.createdAt).format('hh:mm a')
	});
	$messages.insertAdjacentHTML('beforeend', html);
	autoscroll();
});

socket.on('locationMessage', (message) => {
	log(message);
	const html = Mustache.render(locationTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('hh:mm a')
	});
	$messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ space, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		space,
		users
	}); 
	document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
	e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled');
	const message = document.querySelector('input').value;
	socket.emit('sendMessage', message, (error) => {
		$messageFormButton.removeAttribute('disabled');
		$messageFormInput.value = '';
		$messageFormInput.focus();
		
		if(error) {
			return log(error);
		}
		log('Message delivered');
	});
});

$shareLocation.addEventListener('click', () => {
	if(!navigator.geolocation) {
		return alert('Geolocation not supported for your browser'); 
	}
	
	$shareLocation.setAttribute('disabled', 'disabled');
	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit('sendLocation', {
			lat: position.coords.latitude,
			long: position.coords.longitude
		}, () => {
			log('Shared Location');
			
			$shareLocation.removeAttribute('disabled');
		});
	});
});

socket.emit('join', { username, space }, (error) => {
	if(error) {
		alert(error);
		location.href = '/';
	}
	
});