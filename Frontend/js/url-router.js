const urlPageTitle = "Pong Os";
import { loadGame } from './pong.js';
import { loadTournament } from './tournament.js';


let username
let image
let is_2fa_enabled
let is_online
let picture
let email
let userToken
let userId
let user = localStorage.getItem('user');

if (user) {
	user = JSON.parse(user)
	username = user['username'];
	image = user['image'];
	is_2fa_enabled = user['is_2fa_enabled'];
	is_online = user['is_online'];
	picture = user['picture'];
	email = user['email'];
	userToken = user['access_token'];
	userId = user['id'];
}

const viewUserProfile = (username) => {
	console.log(`Viewing profile for ${username}`);
	const url = `http://localhost:8000/api/users/${username}`;

	fetch(url)
		.then(response => response.text())
		.then(data => {
			console.log(data);
			document.getElementsByClassName("window")[0].innerHTML = data;
			// Handle the response data here
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

 const addFriend = async (button, username, newFriend) => {
	console.log(`Forming friendship for ${username} with ${newFriend}`);
	try {
		const response = await fetch(`http://localhost:8000/api/toggle_friend/?user1=${username}&user2=${newFriend}`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
				'x-csrftoken': getCookie('csrftoken'),
			},
		});

		if (!response.ok) {
			throw new Error(response.statusText === 'Unauthorized' ? 'Unauthorized' : 'Network response was not ok');
		}

		const data = await response.text();
		console.log("Data = ");
		console.log(data);
		if (data === 'Added') {
			button.innerHTML = 'Remove Friend';
			alert('Friend Added successfully :(');
		} else {
			button.innerHTML = 'Add Friend';
			alert('Friend Removed succesfully :)');
		}
	} catch (error) {
		console.error('Error:', error);
	}
}





// create document click that watches the nav links only
document.querySelector('#navbar').addEventListener("click", (e) => {
	const { target } = e;
	e.preventDefault();
	urlRoute();
});

function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === name + '=') {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

// create an object that maps the url to the template, title, and description
const urlRoutes = {
	404: {
		title: "404 | " + urlPageTitle,
		description: "Page not found",
	},
	"/": {
		title: "login | " + urlPageTitle,
		description: "This is the login page",
	},
	"/desktop": {
		title: "About Us | " + urlPageTitle,
		description: "This is the desktop page",
	},
	"/myprofile": {
		title: "myprofile | " + urlPageTitle,
		description: "This is the myprofile page",
	},
	"/play": {
		title: "play | " + urlPageTitle,
		description: "This is the play page",
	},
	"/users": {
		title: "users | " + urlPageTitle,
		description: "This is the users page",
	},
	"/profile": {
		title: "profile | " + urlPageTitle,
		description: "This is the profile page",
	},
};

const urlRoute = (event) => {
	event = event || window.event; // get window.event if event argument not provided
	event.preventDefault();
	let href = event.target.href;
	if (event.target.tagName !== 'A')
		href = event.target.parentElement.href;
	window.history.pushState({}, "", href);
	urlLocationHandler();
};

const insertCSS = (filePath) => {
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = filePath;
	document.head.appendChild(link);
};

// insertCSS("/assets/css/global.css");
// insertCSS("/assets/css/index.css");

function setMainWindowframe() {
	insertOrCreateContent();
	document.getElementById("content").innerHTML = `<div class="window-frame" id="main-window">
	<div class="top-bar">
	  <img class="top-bar-child" alt="" src="./assets/public/rectangle-4.svg" />

	  <div class="options">
		<img class="vector-icon" alt="" src="./assets/public/vector.svg" />

		<img class="dot-grid-icon" alt="" src="./assets/public/dot-grid.svg" />
	  </div>
	  </div>
		<div class="window"></div>
	</div>`;
}

let loadFile = function (event) {
	let image = document.getElementById('output');
	image.src = URL.createObjectURL(event.target.files[0]);
};

const urlLocationHandler = async () => {
	if (tokenHandler()) {
		return;
	}
	insertOrCreateContent();
	document.getElementById("content").innerHTML = ``;
	let location = window.location.pathname;
	if (location[location.length - 1] === '/') {
		location = location.slice(0, location.length - 1);
	}
	if (location.length == 0) {
		location = "/";
	}
	if (location === '/' && localStorage.getItem('access_token')) {
		location = '/desktop';
	}
	if (!localStorage.getItem('access_token')) {
		location = '/';
	}
	const route = urlRoutes[location] || urlRoutes["404"];

	if (location === '/') {
		if (document.getElementById("navbar")) {
			document.getElementById("navbar").remove();
		}
		await fetch('/components/login.html').then(response => response.text()).then(data => {
			document.getElementById("content").innerHTML = data;
		});
	}
	if (location === '/play') {
		setMainWindowframe();
		if (!document.getElementById("pongCanvas")) {
			const canvasElement = document.createElement('canvas');

			const canvasButtonOnline = document.createElement('button');
			const canvasButtonLocalGame = document.createElement('button');
			// const canvasButtonLocalTourn = document.createElement('button');


			document.getElementsByClassName('window')[0].appendChild(canvasElement);
			document.getElementsByClassName('window')[0].appendChild(canvasButtonOnline);
			document.getElementsByClassName('window')[0].appendChild(canvasButtonLocalGame);
			// document.getElementsByClassName('window')[0].appendChild(canvasButtonLocalTourn);


			console.log('canvasButtonOnline:', canvasButtonOnline);
			console.log('canvasButtonLocalGame:', canvasButtonLocalGame);
			// console.log('canvasButtonLocalTourn:', canvasButtonLocalTourn);


			canvasButtonOnline.id = 'startOnlineButton';
			canvasButtonOnline.innerHTML = 'Start Online Game';

			canvasButtonLocalGame.id = 'startLocalButton';
			canvasButtonLocalGame.innerHTML = 'Start Local Game';

			// canvasButtonLocalTourn.id = 'startLocalTournButton';
			// canvasButtonLocalTourn.innerHTML = 'Start Local Tournament';


			canvasElement.id = 'pongCanvas';
			loadGame();
		}
		document.title = route.title;
		return;
	}

	else if (location === '/tournament') {
		setMainWindowframe();

		if (!document.getElementById("pongCanvas")) {

			const canvasElement = document.createElement('canvas');
			const canvasButtonLocalTourn = document.createElement('button');
			const canvasButtonOnlineTourn = document.createElement('button');


			document.getElementsByClassName('window')[0].appendChild(canvasElement);
			document.getElementsByClassName('window')[0].appendChild(canvasButtonLocalTourn);
			document.getElementsByClassName('window')[0].appendChild(canvasButtonOnlineTourn);


			console.log('canvasButtonLocalTourn:', canvasButtonLocalTourn);
			console.log('canvasButtonOnlineTourn:', canvasButtonOnlineTourn);

			canvasButtonLocalTourn.id = 'startLocalTournButton';
			canvasButtonLocalTourn.innerHTML = 'Start Local Tournament';

			canvasButtonOnlineTourn.id = 'startOnlineTournButton';
			canvasButtonOnlineTourn.innerHTML = 'Start Online Tournament';

			canvasElement.id = 'pongCanvas';
			loadTournament(); // You may need to modify loadGame() to handle tournament-specific logic
		}
		document.title = route.title;
		return;
	}
	else if (location === '/desktop') {
		setMainWindowframe();
	}
	else if (location === '/myprofile') {
		setMainWindowframe();

		document.getElementById("content").innerHTML += `<h1>Welcome to ${location}</h1>
														<button id="logout" class="btn btn-primary" 
														onClick="handleLogout()">Logout</button>`;
	}
	else if (location === '/profile') {
		setMainWindowframe();

		await fetch(`http://localhost:8000/api/users/${localStorage.getItem('username')}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
			},
		}).then(response => {
			if (!response.ok) {
				response.statusText === 'Unauthorized' ? alert('Unauthorized') : alert('Network response was not ok');
			}
			return response.text();
		}).then(data => {
			// console.log(data);
			document.getElementsByClassName("window")[0].innerHTML = data;

			document.getElementById('file').addEventListener('change', loadFile, false);
			document.getElementById('uploadButton').addEventListener('click', async () => {
				let fileInput = document.getElementById('file');
				let file = fileInput.files[0];

				if (file) {
					let formData = new FormData();
					formData.append('image', file);
					formData.append('username', localStorage.getItem('username'));
					await fetch('http://localhost:8000/api/update_user_profile/', {
						method: 'POST',
						body: formData,
						headers: {
							'X-CSRFToken': getCookie('csrftoken'),
							'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
						},
						credentials: 'include',
					})
						.then(response => response.json())
						.then(data => {
							// inser success message
							console.log(data);
						})
						.catch(error => {
							console.error('Error:', error);
						});
				}
			});

		}).catch((error) => {
			console.error('Error:', error);
		});

		document.getElementById('2fa-button').addEventListener('click', async () => {
			console.log(userId);

			try {
				const response = await fetch(`http://localhost:8000/enable_or_disable_2fa/?username=${localStorage.getItem('username')}`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
						'x-csrftoken': getCookie('csrftoken'),
					},
				});

				if (!response.ok) {
					throw new Error(response.statusText === 'Unauthorized' ? 'Unauthorized' : 'Network response was not ok');
				}

				const data = await response.text();

				if (data === '2FA disabled successfully') {
					document.getElementById('2fa-button').innerHTML = 'Enable 2FA';
					alert('2FA disabled successfully');
				} else {
					await fetch('/components/login.html').then(response => response.text()).then(data => {
						document.getElementById("navbar").remove();
						document.getElementById("content").innerHTML = data;
						localStorage.clear();
					});
					alert('2FA enabled successfully, please login again')
				}
			} catch (error) {
				console.error('Error:', error);
			}
		});

	}
	else if (location === '/users') {
		setMainWindowframe();
		await fetch('/components/player-card.html').then(response => response.text()).then(data => {
			document.getElementsByClassName("window")[0].innerHTML = data;
		});
		let users = getAllUsers();

		const input = document.getElementById("search-user");
		users.then((data) => {
			users = data;
			insertAllUsers(users);
		});
		// handling search input
		input.addEventListener("keyup", () => {
			let inputValue = input.value;

			if (!inputValue) {
				insertAllUsers(users);
				return;
			}
			insertAllUsers(users.filter((user) => user.username.startsWith(inputValue)));
		});
	}
	if (document.getElementById("pongCanvas")) {

		const canvasElement = document.getElementById("pongCanvas");
		canvasElement.remove();
		const canvasButton = document.getElementById('startButton');
		canvasButton.remove();
	}

	document.title = route.title;
};

// add an event listener to the window that watches for url changes
window.onpopstate = urlLocationHandler;
// call the urlLocationHandler function to handle the initial url
window.route = urlRoute;
// call the urlLocationHandler function to handle the initial url
urlLocationHandler();

function tokenHandler() {
	const urlParams = new URLSearchParams(window.location.search);
	const token = urlParams.get('token');
	const otp = urlParams.get('otp');
	const urlUsername = urlParams.get('username');
	console.log(token);
	console.log(otp);
	if (token && !otp) {
		console.log('token---------->');
		localStorage.setItem('access_token', token);
		let userData;
		fetch('http://localhost:8000/api/get_user_data/', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
		})
			.then(response => {
				if (!response.ok) {
					response.statusText === 'Unauthorized' ? alert('Unauthorized') : alert('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				userData = data[0];
				if (!userData) {
					return;
				}
				localStorage.setItem('username', userData['username']);
				localStorage.setItem('user', JSON.stringify(userData));
				username = userData['username'];
				image = userData['image'];
				is_2fa_enabled = userData['is_2fa_enabled'];
				is_online = userData['is_online'];
				picture = userData['picture'];
				email = userData['email'];
				userId = userData['id'];
				userToken = token;
			})
		const url = new URL(window.location.href);
		url.search = '';
		const mainUrl = url.toString();

		history.replaceState({}, '', mainUrl);
	}
	if (otp === 'validate_otp') {
		console.log('validate otp');
		// setMainWindowframe();
		document.getElementById("content").innerHTML = `<div class="window-frame" id="main-window">
		<div class="top-bar">
		  <img class="top-bar-child" alt="" src="./assets/public/rectangle-4.svg" />

		  <div class="options">
			<img class="vector-icon" alt="" src="./assets/public/vector.svg" />

			<img class="dot-grid-icon" alt="" src="./assets/public/dot-grid.svg" />
		  </div>
		  </div>
			<div class="window"></div>
		</div>`;
		document.getElementsByClassName('window')[0].innerHTML = `
									<div class="mb-3 p-20px">
									<label for="otp-input" class="form-label">OTP Code</label>
									<input type="text" class="form-control" id="otp-input" placeholder="Enter OTP code">
									</div>
									<button type="submit-otp" id="submit-otp" class="btn btn-primary">Validate OTP</button>
								`;

		document.getElementById('submit-otp').addEventListener('click', async () => {
			let otp = document.getElementById('otp-input').value;
			if (!otp) {
				alert('Please enter OTP code');
				return;
			}
			const requestBody = new URLSearchParams();
			requestBody.append('username', urlUsername);
			requestBody.append('otp', otp);

			await fetch('http://localhost:8000/validate_otp/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': `Bearer ${token}`,
					'x-csrftoken': getCookie('csrftoken'),
				},
				body: requestBody.toString(),
			})
				.then(response => {
					if (!response.ok) {
						throw new Error(response.statusText === 'Unauthorized' ? 'Unauthorized' : 'Network response was not ok');
					}
					return response.json();
				})
				.then(data => {
					// Handle the response data here
					if (data.message === 'OTP is valid') {
						console.log(data);
						localStorage.setItem('access_token', token);
						document.getElementsByClassName("window")[0].innerHTML = '';
						alert('OTP is valid, enjoy pongos');
						return false;
					}
					else {
						alert('Invalid OTP code');
					}

				})
				.catch(error => {
					console.error('Error:', error);
				});
		});
		const url = new URL(window.location.href);
		url.search = '';
		const mainUrl = url.toString();

		history.replaceState({}, '', mainUrl);
		return true;
	}
	return false;
}


function insertOrCreateContent() {
	if (!document.getElementById("content")) {
		const content = document.createElement('div');
		content.id = 'content';
		document.body.appendChild(content);
	}
}


async function getAllUsers(override) {
	let location = window.location.pathname;
	if (location[location.length - 1] === '/') {
		location = location.slice(0, location.length - 1);
	}
	if (location !== '/users')
		return;
	let users;
	await fetch('http://localhost:8000/api/get_all_users/', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
			'Content-Type': 'application/json'
		},
	}).then(response => {
		if (!response.ok) {
			if (response.status === 401 || response.status === 403) {
				localStorage.clear();
				document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
				document.cookie = 'sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
				window.location.href = '/';
				return;
			}
			response.statusText === 'Unauthorized' ? alert('Unauthorized') : alert('Network response was not ok');
		}
		return response.json();
	}).then(data => {
		console.log(data);
		users = data.filter(user => user.username !== "admin");
		return users;
	}).catch((error) => {
		console.error('Error:', error);
	});
	return users;
}
function elementExistsInArray(array, element) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === element) {
            return true;
        }
    }
    return false;
}
async function getAllFriends(override) {
	let location = window.location.pathname;
	if (location[location.length - 1] === '/') {
		location = location.slice(0, location.length - 1);
	}
	if (location !== '/users')
		return;
	let users = [];
	await fetch(`http://localhost:8000/api/friends/${localStorage.getItem('username')}`, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
			'Content-Type': 'application/json'
		},
	}).then(response => {
		if (!response.ok) {
			if (response.status === 401 || response.status === 403) {
				localStorage.clear();
				document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
				document.cookie = 'sessionid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
				window.location.href = '/';
				return;
			}
			response.statusText === 'Unauthorized' ? alert('Unauthorized') : alert('Network response was not ok');
		}
		return response.json();
	}).then(data => {
		// console.log(data);
		users = data;
		console.log(users);
		return users;
	}).catch((error) => {
		console.error('Error:', error);
	});
	return users;
}



async function insertAllUsers(users) {
	document.getElementById('player-card-div').innerHTML = '';
	if (!users) {
		return;
	}
	let friends = await getAllFriends();

	//call getAllFriends here:
	console.log(friends);
	
	users.forEach(user => {
		let isFriend = false;
		console.log(user.username);
		isFriend = elementExistsInArray(friends, user.intra)
		const playerCard = `
			<div class="row p-0 g-0">
				<div class="col border border-1 border-dark ratio ratio-1x1">
					<div class="ratio ratio-1x1" style="background-color: rebeccapurple;">
						<img src="${user.image ? user.image : user.picture.link}" class="img-fluid rounded-circle" alt="...">
					</div>
				</div>
				<div class="col-6 border border-1 border-dark overflow-auto mh-100 mw-50">
					<ul class="list-group">
						<li class="list-group-item justify-content-left text-uppercase"><h4>${user.intra}</h4></li>
						<li class="list-group-item justify-content-left text-uppercase"><a>${user.is_online ? "online 🟢" : "offline ⚪"}</a></li>
						<li class="list-group-item justify-content-left text-uppercase"><h5>ranking</h5></li>
					</ul>
				</div>
				<div class="col border border-1 border-dark ratio ratio-1x1">
					<button class="h-100 w-100 btn btn-primary text-capitalize add-friend-btn" type="button">${isFriend ? "Remove Friend" : "Add Friend"}</button>
				</div>
				<div class="col border border-1 border-dark ratio ratio-1x1">
					<button class="h-100 w-100 btn btn-info text-capitalize view-profile-btn" type="button">View Profile</button>
				</div>
			</div>`;

		document.getElementById('player-card-div').innerHTML += playerCard;

	});
	const buttons = document.getElementsByClassName('view-profile-btn');
	for (let i = 0; i < buttons.length; i++) {
		const button = buttons[i];
		button.addEventListener('click', function () {
			viewUserProfile(users[i].username);
		});
	}
	const addFriendButtons = document.getElementsByClassName('add-friend-btn');
	for (let i = 0; i < addFriendButtons.length; i++) {
		const button = addFriendButtons[i];
		button.addEventListener('click', function () {
			addFriend(button, localStorage.getItem('username'), users[i].username);
		});
	}
}

// window.addEventListener('beforeunload', function (event) {
// 	// Perform actions before the page is unloaded (e.g., show a confirmation dialog)
// 	// You can return a string to display a custom confirmation message
// 	const confirmationMessage = 'Are you sure you want to leave?';
// 	(event || window.event).returnValue = confirmationMessage; // Standard for most browsers
// 	return confirmationMessage; // For some older browsers
// });


// window.addEventListener('beforeunload', function (event) {
// 	// Perform actions before the page is unloaded (e.g., show a confirmation dialog)
// 	// You can return a string to display a custom confirmation message
// 	const confirmationMessage = 'Are you sure you want to leave?';
// 	(event || window.event).returnValue = confirmationMessage; // Standard for most browsers
// 	return confirmationMessage; // For some older browsers
// });


