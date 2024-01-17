const urlPageTitle = "Pong Os";
import { loadGame } from './pong.js';

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
	tokenHandler();
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
		document.getElementById("navbar").remove();
		await fetch('/components/login.html').then(response => response.text()).then(data => {
			document.getElementById("content").innerHTML = data;
		});
	}
	if (location === '/play') {
		setMainWindowframe();
		if (!document.getElementById("pongCanvas")) {
			const canvasButton = document.createElement('button');
			const canvasElement = document.createElement('canvas');
			document.getElementsByClassName('window')[0].appendChild(canvasButton);
			document.getElementsByClassName('window')[0].appendChild(canvasElement);

			canvasButton.id = 'startButton';
			canvasButton.innerHTML = 'Start Game';
			canvasElement.id = 'pongCanvas';
			loadGame();
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
		await fetch('/components/myprofile.html').then(response => response.text()).then(data => {
			document.getElementsByClassName("window")[0].innerHTML = data;

			document.getElementById('file').addEventListener('change', loadFile, false);
			document.getElementById('uploadButton').addEventListener('click', () => {
				let fileInput = document.getElementById('file');
				let file = fileInput.files[0];

				if (file) {
					let formData = new FormData();
					formData.append('image', file);
					formData.append('username', localStorage.getItem('username'));
					fetch('http://localhost:8000/api/update_user_profile/', {
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
		});

		const username = localStorage.getItem('username');
		await fetch(`http://localhost:8000/api/two_fa_toggle/?username=${username}`, {
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
			console.log(data);
			document.getElementById('2fa-toggle').innerHTML = data;
		}).catch((error) => {
			console.error('Error:', error);
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
	if (token) {

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
			})
	}

	const url = new URL(window.location.href);
	url.search = '';
	const mainUrl = url.toString();

	history.replaceState({}, '', mainUrl);
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
	await fetch('http://localhost:8000/users/', {
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

function insertAllUsers(users) {
	document.getElementById('player-card-div').innerHTML = '';
	if (!users) {
		return;
	}
	users.forEach(user => {
		const playerCard = `
							<div class="row row-cols-4 justify-content-center">
							<div class="col-auto border border-1 border-dark">
							<img src="${user.image ? user.image : user.picture.link}"
							style="width: 100%; height:100px; border-radius: 50%;">
							</div>
							<div class="col-4 border border-1 border-dark">
							<div class="row justify-content-left text-uppercase">
							<h4>${user.username}</h4>
							</div>
							<div class="row justify-content-left text-uppercase"><a>status: ${user.is_online ? "online 🟢" : "offline ⚪"}</a></div>
							<div class="row justify-content-left text-uppercase">
							<h5>ranking</h5>
							</div>
							</div>
							<div class="col-auto g-0 border border-1 border-dark"><button
							class="h-100 w-100 btn btn-primary text-capitalize" type="button">add friend</button></div>
							<div class="col-auto g-0 border border-1 border-dark"><button class="h-100 w-100 btn btn-info text-capitalize"
							type="button">view profile</button></div>
							</div>`;
		document.getElementById('player-card-div').innerHTML += playerCard;
	});
}


// window.addEventListener('beforeunload', function (event) {
// 	// Perform actions before the page is unloaded (e.g., show a confirmation dialog)
// 	// You can return a string to display a custom confirmation message
// 	const confirmationMessage = 'Are you sure you want to leave?';
// 	(event || window.event).returnValue = confirmationMessage; // Standard for most browsers
// 	return confirmationMessage; // For some older browsers
// });