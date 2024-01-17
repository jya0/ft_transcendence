const urlPageTitle = "Pong Os";
import { loadGame } from './pong.js';

// create document click that watches the nav links only
document.addEventListener("click", (e) => {
	const { target } = e;
	if (!target.matches("nav a")) {
		return;
	}
	e.preventDefault();
	urlRoute();
});

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
		title: "About me | " + urlPageTitle,
		description: "This is the desktop page",
	},
	"/myprofile": {
		title: "Contact Us | " + urlPageTitle,
		description: "This is the myprofile page",
	},
	"/play": {
		title: "Contact Us | " + urlPageTitle,
		description: "This is the play page",
	},
	"/users": {
		title: "Contact Us | " + urlPageTitle,
		description: "This is the users page",
	},
	"/profile": {
		title: "Contact Us | " + urlPageTitle,
		description: "This is the profile page",
	},
};

const urlRoute = (event) => {
	event = event || window.event; // get window.event if event argument not provided
	event.preventDefault();
	// window.history.pushState(state, unused, target link);
	// if (localStorage.getItem('access_token'))
	window.history.pushState({}, "", event.target.href);
	urlLocationHandler();
};

const insertCSS = (filePath) => {
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = filePath;
	document.head.appendChild(link);
};

insertCSS("/assets/css/global.csss");
insertCSS("/assets/css/index.css");

const urlLocationHandler = () => {
	tokenHandler();
	document.getElementById("content").innerHTML = ``;
	let location = window.location.pathname; // get the url path
	console.log("location:", location);
	if (location[location.length - 1] === '/') {
		location = location.slice(0, location.length - 1);
	}

	if (location.length == 0) {
		location = "/";
	}
	if (location === '/' && localStorage.getItem('access_token')) {
		console.log('location:', 'user is logged in');
		location = '/desktop';
	}
	if (!localStorage.getItem('access_token'))
		location = '/';
	const route = urlRoutes[location] || urlRoutes["404"];
	// const html = await fetch(route.template).then((response) => response.text());

	if (location === '/') {
		document.getElementById("main-nav").remove();
		document.getElementById("content").innerHTML = `<div class="login-hello">
														<div class="frame">
														  <div class="frame1">
															<div class="parent">
															  <b class="smile">☺</b>
															  <div class="unlock-pongos-parent">
																<div class="b">Unlock PongOS</div>
																<div class="button-primary" onClick="handle42Auth()">
																  <div class="password">Password ...</div>
																</div>
															  </div>
															</div>
														  </div>
														</div>
														<div class="frame2">
														  <div class="wrapper">
															<div class="b">—</div>
														  </div>
														</div>
														<div class="frame3">
														  <div class="frame4">
															<div class="group">
															  <div class="div1">—</div>
															  <div class="div2">•</div>
															</div>
														  </div>
														</div>
	  													</div>`;
	}
	if (location === '/play') {
		if (!document.getElementById("pongCanvas")) {
			const canvasButtonOnline = document.createElement('button');
			const canvasButtonLocal = document.createElement('button');

			const canvasElement = document.createElement('canvas');
			document.getElementById('content').appendChild(canvasButtonOnline);
			document.getElementById('content').appendChild(canvasButtonLocal);

			document.getElementById('content').appendChild(canvasElement);
			console.log('canvasButtonOnline:', canvasButtonOnline);
			console.log('canvasButtonLocal:', canvasButtonLocal);

			canvasButtonOnline.id = 'startOnlineButton';
			canvasButtonOnline.innerHTML = 'Start Online Game';

			canvasButtonLocal.id = 'startLocalButton';
			canvasButtonLocal.innerHTML = 'Start Local Game';
			canvasElement.id = 'pongCanvas';
			loadGame();
		}
		document.title = route.title;
		return;
	}
	else if (location === '/desktop') {
		document.getElementById("content").innerHTML = `<h1>Welcome to ${location}</h1>`;
	}
	else if (location === '/myprofile') {
		document.getElementById("content").innerHTML = `<h1>Welcome to ${location}</h1>
														<button id="logout" class="btn btn-primary" 
														onClick="handleLogout()">Logout</button>`;
	}
	else if (location === '/profile') {
		document.getElementById("content").innerHTML = `<h1>Welcome to player ${location}</h1>`;
	}
	if (document.getElementById("pongCanvas")) {
		console.log('pongCanvas exists');
		const canvasElement = document.getElementById("pongCanvas");
		canvasElement.remove();
		const canvasButtonOnline = document.getElementById('startOnlineButton');
		canvasButtonOnline.remove();

		const canvasButtonLocal = document.getElementById('startLocalButton');
		canvasButtonLocal.remove();
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
	const username = urlParams.get('user');
	console.log(token)
	console.log(username)

	if (token) {
		console.log('Token:', token);
		localStorage.setItem('access_token', token);
		let userData;
		fetch(`http://10.12.4.7:8000/api/users/${username}`, {
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
					console.log("No user data");
					return;
				}
				console.log("User data:", data);

				localStorage.setItem('username', userData['username']);
			})
	}

	const url = new URL(window.location.href);
	url.search = '';
	const mainUrl = url.toString();

	history.replaceState({}, '', mainUrl);
}
