const users = [];
const log = console.log;

const addUsers = ({ id, username, space }) => {
	username = username.trim().toLowerCase();
	space = space.trim().toLowerCase();
	
	if(!username || !space) {
	   return {
		 error: 'The username and chat space fields are required!'
	   };
   }
	const existingUser = users.find((user) => {
		return user.space === space && user.username === username;
	});
	
	if(existingUser) {
		return {
		   error: 'Username already taken!'
		};
	}
	const user = { id, username, space };
	users.push(user);
	return { user };
};

const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);
	if(index !== -1) {
		return users.splice(index, 1)[0];
	}
};

const getUser = (id) => {
	return users.find((user) => user.id === id);
};


const getUsersInSpace = (space) => {
	return users.filter((user) => user.space === space);
};

module.exports = {
	addUsers,
	removeUser,
	getUser,
	getUsersInSpace
};