const socket = io(); 
const log = console.log;

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $shareLocation = document.querySelector('#shareLocation');

const $messages = document.querySelector('#messages');
const messageTemplate = document.querySelector('#message-template');

socket.on('message', (msg) => {
	log(msg);
	const html = Mustache.render(messageTemplate);
	log(typeof(html));
	$messages.insertAdjacentElement('beforeend', html);
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