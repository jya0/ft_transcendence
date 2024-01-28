const urlPageTitle = "Pong Os";
import { loadGameMenu, loadGameCanvas, loadToast, loadModal } from './loadComponent.js';
import { loadTournament } from './tournament.js';
import { loadTicTac } from './tic_tac.js'
import { loadGame } from './pong.js';

let userToken;
let user;
let LOGIN_PAGE_HTML = '';

await fetch('/components/login.html').then(response => response.text()).then(data => {
	LOGIN_PAGE_HTML = data;
});


await fetch('/api/get_user_data/', {
	method: 'GET',
	headers: {
		'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
	},
}).then(response => {
	if (response.status === 401 || response.status === 204) {
		console.log('user is not authenticated');
		localStorage.clear();
		return null;
	}
	return response.json();
}).then(data => {
	if (!data) {
		return;
	}
	console.log('Data fetched:', data);
	user = data.user_data;
	if (user) {
		console.log('user is authenticated');
		sessionStorage.setItem('user', JSON.stringify(user));
	}
})



const viewUserProfile = (username) => {
	console.log(`Viewing profile for ${username}`);
	const url = `/api/users/${username}?username=${user.username}}`;
	fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
		},
	})
		.then(response => response.text())
		.then(data => {
			console.log(data);
			document.getElementsByClassName("window")[0].innerHTML = data;
			const addFriendButton = document.getElementById('add-friend');
			addFriendButton.addEventListener('click', async () => {
				addFriend(addFriendButton, user.username, username);
			});
		})
		.catch(error => {
			console.error('Error:', error);
		});
}

const addFriend = async (button, username, newFriend) => {
	console.log(`Forming friendship for ${username} with ${newFriend}`);
	try {
		const response = await fetch(`/api/toggle_friend/?user1=${username}&user2=${newFriend}`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
				'x-csrftoken': getCookie('csrftoken'),
			},
		});

		if (!response.ok) {
			document.getElementById("content").innerHTML = LOGIN_PAGE_HTML;
			localStorage.clear();
			throw new Error(response.statusText === 'Unauthorized' ? 'Unauthorized' : 'Network response was not ok');
		}

		const data = await response.text();
		console.log("Data = ");
		console.log(data);
		if (data === 'Added') {
			button.innerHTML = 'Remove Friend';
			loadToast('Friend Added successfully :(');
		} else {
			button.innerHTML = 'Add Friend';
			loadToast('Friend Removed succesfully :)');
		}
	} catch (error) {
		console.error('Error:', error);
	}
}

let navbarLinks = document.querySelectorAll('#navbar a');

navbarLinks.forEach(function (link) {
	link.addEventListener('click', function (event) {
		event.preventDefault();
		window.history.pushState({}, "", link);
		urlLocationHandler();
	});
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
	console.log('urlroute event', event);
	event = event || window.event; // get window.event if event argument not provided
	event.preventDefault();
	let href = event.target.parentElement.parentElement.parentElement.href;
	console.log('urlroute href', href);
	console.log('urlroute event.target.tagName', event.target.tagName);
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
	document.getElementById("content").innerHTML =
		`					
			<div class="container p-0 m-0 border border-0 border-light" id="closeWindow">
				<div class="p-0 rounded-1 d-flex flex-column overflow-hidden shadow-lg border border-0 border-light">
					<!-- WINDOW-BAR -->
					<div class="d-flex p-0 border border-0 border-light bg-black">
						<button type="button" class="d-flex m-2 border border-0 border-light bg-transparent" id="close-me" aria-label="Close">
							<svg xmlns="https://www.w3.org/2000/svg" width="20" height="20"
								viewBox="0 0 20 20" fill="none">
								<path
									d="M2.21736 20H4.44931V17.7697H6.66667V15.5539H8.88403V13.3382H11.116V15.5539H13.3333V17.7697H15.5653V20H17.7826V17.7697H20V15.5539H17.7826V13.3382H15.5653V11.1079H13.3333V8.89213H15.5653V6.67639H17.7826V4.44606H20V2.23032H17.7826V0H15.5653V2.23032H13.3333V4.44606H11.116V6.67639H8.88403V4.44606H6.66667V2.23032H4.44931V0H2.21736V2.23032H0V4.44606H2.21736V6.67639H4.44931V8.89213H6.66667V11.1079H4.44931V13.3382H2.21736V15.5539H0V17.7697H2.21736V20Z"
									fill="#E1E0DF" />
							</svg>
						</button>
						<div class="container-fluid my-1 me-1 border border-0 border-light bg--polka">
						</div>
					</div>
					<!-- WINDOW-SCREEN -->
					<div class="ratio ratio-4x3">
						<div class="d-flex h-100 w-100 flex-grow-1 border border-0 border-light bg-light window" id="windowScreen">
						</div>
					</div>
				</div>
			</div>
		`;
	document.getElementById('close-me').addEventListener('click', () => {
		document.getElementById('closeWindow').innerHTML = '';
	});
}

async function updateProfile(file) {

	const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB

	if (file.size > maxSizeInBytes) {
		loadToast('File size is too large, Please choose a smaller file.');
		return;
	}

	let formData = new FormData();
	formData.append('image', file);
	formData.append('username', user.username);
	await fetch('/api/update_user_profile/', {
		method: 'POST',
		body: formData,
		headers: {
			'X-CSRFToken': getCookie('csrftoken'),
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
		},
		credentials: 'include',
	})
		.then(response => {
			if (!response.ok) {
				console.log('response', response);
				document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
				loadToast('Failed to update Image, You have to login again for security reasons!');
				localStorage.clear();
				return null;
			}
			return response.json()

		}).then(data => {
			if (!data) {
				return;
			}
			loadToast('Image updated successfully');
		})
		.catch(error => {
			console.error('Error:', error);
		});
}


let loadModalFile = async function (event) {
	let image = document.getElementById('output');

	document.getElementById('inputFile-btn').addEventListener('click', async () => {
		let modalInput = document.getElementById('modal-inputFile');
		if (modalInput) {
			let modalFile = modalInput.files[0];

			if (modalFile) {
				updateProfile(modalFile, image);
				if (image) {
					image.src = URL.createObjectURL(event.target.files[0]);
				}
			}
		}
	});

};


document.getElementById('modalSetting').addEventListener('click', async () => {
	loadModal(
		`
			<div class="input-group">
				<input type="file" class="form-control" accept="image/*" id="modal-inputFile"
					aria-describedby="inputFile" aria-label="Upload">
				<button class="btn btn-dark" type="button" id="inputFile-btn">Upload Profile
					Pic</button>
			</div>

			<div class="input-group mb-3 mt-5">
				<span class="input-group-text">@</span>
				<div class="form-floating">
					<input type="text" class="form-control" id="floatingInputGroup1"
						placeholder="Username">
					<label for="floatingInputGroup1">Username</label>
				</div>
				<button id="nickname-btn" type="button" class="btn btn-primary">Save
					Username</button>
                <div class="input-group mb-3 mt-5">
                <div class="form-floating">
                    <button id="logout" class="btn btn-primary">Logout</button>
                </div>
			</div>
		`);


	document.getElementById('modal-inputFile').addEventListener('change', loadModalFile, false);
	document.getElementById('logout').addEventListener('click', () => {
		localStorage.clear();
		console.log('logout');
		fetch('/api/logout', {
			credentials: 'include',
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(async data => {
				console.log('Data fetched:', data);
				if (data.message === 'Logged out successfully') {
					document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
					loadToast('You have been logged out successfully');
				}
				else {
					document.getElementById('logout').remove();
				}
			})
			.catch(error => {
				console.error('Error fetching data:', error);
			});

	});
	document.getElementById('nickname-btn').addEventListener('click', async () => {

		const newDisplayName = document.getElementById('floatingInputGroup1');
		const nicknameValue = newDisplayName.value;
		const displayNameElement = document.getElementById('displayName');

		if (!nicknameValue) {
			loadToast('Display name should not be empty');
			return;
		}
		else if (nicknameValue.length >= 50) {
			loadToast('Size of display name should be less than 50 characters');
			return;
		}

		await fetch('/api/update_display_name/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken'),
				'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
			},
			credentials: 'include',
			body: JSON.stringify({ display_name: nicknameValue }),
		},

		).then(response => {
			if (!response.ok) {
				console.log('response', response);
				document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
				loadToast('Failed to update display name, You have to login again for security reasons!');
				return null;
			}
			return response.json()

		}).then(data => {
			if (!data) {
				return;
			}
			if (displayNameElement) {
				displayNameElement.textContent = nicknameValue;
			}
			loadToast('Display name updated successfully');
		})
	});
});

const urlLocationHandler = async () => {

	if (!user) {
		document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
		loadToast('Please login to continue');
		return;
	}
	insertOrCreateContent();
	document.getElementById("content").innerHTML = ``;
	document.getElementById("username-welcome").innerHTML = `${user ? user.username : ''}`;
	let location = window.location.pathname;
	if (location[location.length - 1] === '/') {
		location = location.slice(0, location.length - 1);
	}
	if (location.length == 0) {
		location = "/";
	}
	console.log('after login -> ', location);
	console.log('after login -> ', localStorage.getItem('access_token'));
	if (location === '/' && localStorage.getItem('access_token')) {
		console.log('desktop route');
		location = '/desktop';
	}
	if (!localStorage.getItem('access_token')) {
		console.log('no access route');
		location = '/';
	}
	const route = urlRoutes[location] || urlRoutes["404"];

	if (location === '/') {
		console.log('login route');
		if (document.getElementById("navbar")) {
			document.getElementById("navbar").remove();
		}
		console.log('login route')
		document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
		loadToast('Please login to continue');
		return;
	}
	document.getElementById("navbar").style.display = 'flex';

	if (location === '/games_pong_local' ||
		location === '/games_pong_online' ||
		location === '/games_pong_local_tournament' ||
		location === '/games_pong_online_tournament' ||
		location === '/games_tictactoe_local' ||
		location === '/games_tictactoe_online') {
		setMainWindowframe();
		// loadGameCanvas(function(canvas) {
		// 	loadGame(canvas);
		// });
		loadGameCanvas();
		switch (location) {
			case '/games_pong_local':
				loadGame(true);
				break;
			case '/games_pong_online':
				loadGame(false);
				break;
			case '/games_tictactoe_local':
				loadTicTac();
				break;
			case '/games_pong_local_tournament':
				loadTournament();
				break;
			default:
				break;
		}
		document.title = route.title;
		return;
	}
	else if (location === '/play') {
		setMainWindowframe();
		loadGameMenu();
		let gameMenu = document.querySelectorAll('#gameMenu a');

		gameMenu.forEach(function (link) {
			link.addEventListener('click', function (event) {
				event.preventDefault();
				window.history.pushState({}, "", link);
				urlLocationHandler();
			});
		});
		document.title = route.title;
		return;
	}
	else if (location === '/desktop') {

		// function openSmallWindow() {
		// 	const width = 200;
		// 	const height = 150;


		// 	const left = Math.abs(Math.floor((Math.random() * window.innerWidth - width)) - 1000);
		// 	const top = Math.abs(Math.floor((Math.random() * window.innerHeight - height / 2)) - 500);
		// 	console.log(left, top);

		// 	const windowFrame = document.createElement('div');
		// 	windowFrame.className = 'small-window-frame';
		// 	windowFrame.style.left = left + 'px';
		// 	windowFrame.style.top = top + 'px';


		// 	const topBar = document.createElement('div');
		// 	topBar.className = 'small-top-bar';
		// 	windowFrame.appendChild(topBar);


		// 	const rectangleIcon = document.createElement('img');
		// 	rectangleIcon.className = 'small-top-bar-child';
		// 	rectangleIcon.src = './assets/public/rectangle-4.svg';
		// 	topBar.appendChild(rectangleIcon);

		// 	const options = document.createElement('div');
		// 	options.className = 'small-options';
		// 	topBar.appendChild(options);

		// 	const vectorIcon = document.createElement('img');
		// 	vectorIcon.className = 'small-vector-icon';
		// 	vectorIcon.src = './assets/public/vector.svg';
		// 	options.appendChild(vectorIcon);

		// 	const dotGridIcon = document.createElement('img');
		// 	dotGridIcon.className = 'small-dot-grid-icon';
		// 	dotGridIcon.src = './assets/public/dot-grid.svg';
		// 	options.appendChild(dotGridIcon);


		// 	const windowContent = document.createElement('div');
		// 	windowContent.className = 'small-window';


		// 	const welcomeText = document.createElement('div');
		// 	welcomeText.className = 'small-welcome-text';
		// 	welcomeText.textContent = `Welcome ${user ? user.username : ''}!`;
		// 	windowContent.appendChild(welcomeText);

		// 	windowFrame.appendChild(windowContent);

		// 	document.getElementById('content').appendChild(windowFrame);


		// 	windowFrame.style.display = 'block';



		// 	setTimeout(() => {
		// 		document.getElementById('content').removeChild(windowFrame);
		// 	}, 500);
		// }


		// const windowInterval = setInterval(openSmallWindow, 50);

		// const location = window.location.pathname;

		// setTimeout(() => {
		// 	clearInterval(windowInterval);
		// }, 1000);
	}
	else if (location === '/profile') {
		setMainWindowframe();
		if (!user) {
			document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
			localStorage.clear();
			return;
		}
		await fetch(`/api/users/${user.username}?username=${user.username}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
			},
		}).then(response => {
			if (!response.ok) {
				document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
				localStorage.clear();
				console.log(response.statusText);
				loadToast('Please login to continue');
				return null;
			}
			return response.text();
		}).then(data => {
			// console.log(data);
			if (!data) {
				return;
			}
			document.getElementById("windowScreen").innerHTML = data;
			// const imageContainer = document.getElementById('imageContainer');
			// const hoverText = document.getElementById('hoverText');

			// imageContainer.addEventListener('mouseover', function () {
			// 	hoverText.style.display = 'block';
			// });

			// imageContainer.addEventListener('mouseout', function () {
			// 	hoverText.style.display = 'none';
			// });

			// document.getElementById('file').addEventListener('change', loadFile, false);


		}).catch((error) => {
			console.error('Error:', error);
		});

		document.getElementById('2fa-button').addEventListener('click', async () => {
			console.log('2fa-button clicked');
			try {
				const response = await fetch(`api/enable_or_disable_2fa/?username=${user.username}`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
						'x-csrftoken': getCookie('csrftoken'),
					},
				});

				if (!response.ok) {
					document.getElementById("content").innerHTML = LOGIN_PAGE_HTML;
					localStorage.clear();
					throw new Error(response.statusText === 'Unauthorized' ? 'Unauthorized' : 'Network response was not ok');
				}

				const data = await response.text();

				if (data === '2FA disabled successfully') {
					document.getElementById('2fa-button').innerHTML = 'Enable 2FA';
					loadToast('2FA disabled successfully');
				} else {
					document.getElementById("navbar").style.display = 'none';
					document.getElementById("content").innerHTML = LOGIN_PAGE_HTML;
					localStorage.clear();
					loadToast('2FA enabled successfully, please login again');
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
	else {
		await fetch('/components/404-component.html').then(response => response.text()).then(data => {
			document.getElementById("main-content").innerHTML = data;
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

// call the urlLocationHandler function to handle the initial url
handleUserData();

async function handleUserData() {


	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get('code');
	const url = new URL(window.location.href);
	url.search = '';
	const mainUrl = url.toString();

	history.replaceState({}, '', mainUrl);
	console.log('code', code)
	if (code) {
		document.getElementById("content").innerHTML = `
			<div id="spinner" class="d-flex justify-content-center" style="z-index: 15; top: 50%; color: white; margin-top: 50%;">
				<div class="spinner-border" role="status" style="width: 250px; height: 250px;">
				<span class="visually-hidden">Loading...</span>
				</div>
				<h1>Hang on, cooking...</h1>
			</div>
		`;
		// document.getElementById("nav-container").classList.add("hidden");
		if (document.getElementById("navbar")) {
			document.getElementById("navbar").style.display = 'none';
		}
		console.log("starting fetching....");
		await fetch(`/api/auth/?code=${code}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(response => {
				console.log('response', response)
				if (!response.ok) {
					if (response.status === 400) {
						loadToast('Invalid code');
						document.getElementById("content").innerHTML = LOGIN_PAGE_HTML;
						localStorage.clear();
						return;
					}
					loadToast('Please login to continue');
					document.getElementById("content").innerHTML = LOGIN_PAGE_HTML;
					localStorage.clear();
					return;
				}
				return response.json();
			}).then(data => {
				if (!data) {
					return;
				}
				if (data.message) {
					if (data.message === 'hacker') {
						window.location.href = `https://www.google.com/search?q=hello%20mr%20${data.name}%20how%20are%20you%20today`;
					}
					console.log('message', data.message)
					return;
				}
				userToken = data.token;
				user = data.user;
				sessionStorage.setItem('user', JSON.stringify(user));
				// isAuthDone = true;
				const otp = data.otp
				if (otp === 'validate_otp') {
					console.log('validate otp');
					setMainWindowframe();

					document.getElementById('windowScreen').innerHTML =
						`
						<div class="d-flex flex-column h-100 w-100 mh-100 mw-100 gap-5 justify-content-center align-items-center font--argent" id="otp-container">
							<div class="p-5">
								<label for="otp-input" class="form-label">Your OTP Code is valid for 60 seconds</label>
								<input type="text" class="form-control" id="otp-input" placeholder="Enter OTP code">
							</div>
							<button type="submit-otp" id="submit-otp" class="btn btn-primary">Validate OTP</button>
						</div>
					`;

					document.getElementById('submit-otp').addEventListener('click', async () => {
						let otp = document.getElementById('otp-input').value;
						if (!otp) {
							loadToast('Please enter OTP code');
							return;
						}
						const requestBody = new URLSearchParams();
						requestBody.append('username', data.user.username);
						requestBody.append('otp', otp);

						await fetch('api/validate_otp/', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded',
								'Authorization': `Bearer ${userToken}`,
								'x-csrftoken': getCookie('csrftoken'),
							},
							body: requestBody.toString(),
						})
							.then(response => {
								if (!response.ok) {
									document.getElementById("content").innerHTML = LOGIN_PAGE_HTML;
									localStorage.clear();
									throw new Error(response.statusText === 'Unauthorized' ? 'Unauthorized' : 'Network response was not ok');
								}
								return response.json();
							})
							.then(data => {
								// Handle the response data here
								if (data.message === 'OTP is valid') {
									console.log(data);
									localStorage.setItem('access_token', userToken);
									document.getElementsByClassName("window")[0].innerHTML = '';
									loadToast('OTP is valid, enjoy pongos');
									// document.getElementById("navbar").style.display = 'none';
									window.history.pushState({}, "", '/desktop');

									window.onpopstate = urlLocationHandler;
									// call the urlLocationHandler function to handle the initial url
									window.route = urlRoute;
									urlLocationHandler();
								}
								else {
									loadToast('Invalid OTP code');
									document.getElementById('otp-container').innerHTML += '<button type="" id="try-again-btn" class="btn btn-primary">Try Again</button>';
									document.getElementById('try-again-btn').addEventListener('click', () => {
										document.getElementById("content").innerHTML = LOGIN_PAGE_HTML;
										localStorage.clear();
									});
								}

							})
							.catch(error => {
								console.error('Error:', error);
							});
					});
					return;
				}
				let csrfToken = data.csrfToken
				if (userToken && user) {
					localStorage.setItem('access_token', userToken);
					localStorage.setItem('username', user.username);
					console.log(userToken);
					console.log(user);
					console.log(csrfToken);
					console.log(data.sessionId);
					// document.cookie = "sessionId=" + data.sessionId;
					// console.log('authDone', authDone)

				}


				window.history.pushState({}, "", '/desktop');

				window.onpopstate = urlLocationHandler;
				// call the urlLocationHandler function to handle the initial url
				window.route = urlRoute;
				urlLocationHandler();


			})
		return;
	}
	window.onpopstate = urlLocationHandler;
	// call the urlLocationHandler function to handle the initial url
	window.route = urlRoute;
	urlLocationHandler();
}


function insertOrCreateContent() {
	if (!document.getElementById("content")) {
		const content = document.createElement('div');
		content.id = 'content';
		document.body.appendChild(content);
	}
}

async function generateTestUser() {
	await fetch("/api/generate_test_user/").then(response => {
		if (!response.ok) {
			loadToast('Please login to continue');
		}
		return response.json();
	}).then(data => {
		localStorage.setItem('access_token', data.token);
		localStorage.setItem('user', data.user);
		// window.location.reload();
		console.log('Data fetched:', data);
	}).catch((error) => {
		console.error('Error:', error);
	});
	urlLocationHandler();

}


async function getAllUsers(override) {
	let location = window.location.pathname;
	if (location[location.length - 1] === '/') {
		location = location.slice(0, location.length - 1);
	}
	if (location !== '/users')
		return;
	let users;
	console.log * 'access_token', localStorage.getItem('access_token');
	await fetch('/api/get_all_users/', {
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
			// response.statusText === 'Unauthorized' ? alert('Unauthorized') : alert('Network response was not ok');
			loadToast('Please login to continue');
		}
		return response.json();
	}).then(data => {
		console.log(data);

		let sameUser = user['username'];
		users = data.filter(item => (item.username !== "admin" && item.username !== sameUser));
		console.log('filtered users -> ', users);
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
	await fetch(`/api/friends/${user.username}`, {
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
			// response.statusText === 'Unauthorized' ? alert('Unauthorized') : alert('Network response was not ok');
			loadToast('Please login to continue');
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
								<div class="d-flex flex-row p-0 g-0">
								<div class="col-2 p-0 border border-1 border-dark">
									<div class="ratio ratio-1x1 bg-black mh-100 mw-100">
										<img src="${user.image ? user.image : user.picture.link}" class="object-fit-cover rounded-circle img-fluid p-1" alt="...">
									</div>
								</div>
								<div class="col d-flex flex-column ps-2 justify-content-center text-truncate text-break border border-1 border-dark">
									<p class="font--argent p-0 m-0" style="font-size: 1.5vw;">${user.intra}</p>
									<p class="font--argent p-0 m-0" style="font-size: 0.75vw;">${user.is_online ? "online 🟢" : "offline ⚪"}</p>
									<p class="font--argent text-capitalize p-0 m-0" style="font-size: 0.9vw;">ranking</p>
								</div>
								<div class="col-2 p-0 text-truncate border border-1 border-dark">
									<div class="ratio ratio-1x1">
										<button class="btn bg-primary-subtle rounded-0 font--argent text-capitalize view-profile-btn text-wrap" type="button" style="font-size: 1vw;">view profile</button>
									</div>
								</div>
								<div class="col-2 p-0 text-truncate border border-1 border-dark">
									<div class="ratio ratio-1x1">
										<button class="btn bg-dark-subtle rounded-0 font--argent text-capitalize add-friend-btn text-wrap" type="button" style="font-size: 1vw;">
											${isFriend ? "remove friend" : "add friend"}
										</button>
									</div>
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
			addFriend(button, user.username, users[i].username);
		});
	}
}

// window.addEventListener('onbeforeunload', function (event) {
// 	// Perform actions before the page is unloaded (e.g., show a confirmation dialog)
// 	// You can return a string to display a custom confirmation message
// 	const confirmationMessage = 'Are you sure you want to leave?';
// 	(event || window.event).returnValue = confirmationMessage; // Standard for most browsers
// 	return confirmationMessage; // For some older browsers
// });


// window.addEventListener('onbeforeunload', function (event) {
// 	// Perform actions before the page is unloaded (e.g., show a confirmation dialog)
// 	// You can return a string to display a custom confirmation message
// 	// const confirmationMessage = 'Are you sure you want to leave?';
// 	// window.location.pathname = "/desktop";
// 	console.log("im TRYIN!");
// 	window.history.pushState({}, "", "/desktop");
// 	urlLocationHandler();
// 	(event || window.event).returnValue = confirmationMessage; // Standard for most browsers
// 	return confirmationMessage; // For some older browsers
// });


// window.onbeforeunload	= () => {
// 	// window.location.pathname = "/desktop";
// 	console.log("im TRYIN!");
// 	window.history.pushState({}, "", "/desktop");
// }