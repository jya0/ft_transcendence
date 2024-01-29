const urlPageTitle = "Pong Os";
import { loadGameMenu, loadGameCanvas, loadToast, loadModal, loadSpinner, getCookie } from './loadComponent.js';
import { loadTournament, stopTournamentExecution } from './tournament.js';
import { loadTicTac } from './tic_tac.js'
import { loadGame, stopPongExecution } from './pong.js';

let userToken;
let user;
let LOGIN_PAGE_HTML = '';
let gameMode = 'none';
await fetch('/components/login.html').then(response => response.text()).then(data => {
	LOGIN_PAGE_HTML = data;
});

function loadLoginPage(message) {
	document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
	if (message) {
		loadToast(message);
	}
	localStorage.clear();
	const docModalMain = document.getElementById('modalSetting');
	const tmpModalSetting = bootstrap.Modal.getOrCreateInstance(docModalMain);
	tmpModalSetting.hide();
}
console.log(sessionStorage.getItem('username'))
await fetch(`/api/get_user_data/?username=${sessionStorage.getItem('username')}`, {
	method: 'GET',
}).then(response => {
	if (response.status === 204) {
		console.log('User is not authenticated');
		localStorage.clear();
		return null;
	}
	else if (!response.ok) {
		console.log(`response`, response.status);
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
			loadToast('Unauthorized, please login again!')
			localStorage.clear();
			return;
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
		
        if (gameMode !== 'none') {
        
            console.log("heyyyyyyyyyyyyyyyyyyyyyy");
            const canvasElement = document.getElementById("gameCanvas");
            let animationId = canvasElement.dataset.animationFrameId;
            window.cancelAnimationFrame(animationId);
            canvasElement.remove();
            if (gameMode === 'pong single')
                stopPongExecution();
            if (gameMode === 'pong tournament')
                stopTournamentExecution();
            gameMode = 'none';
        }
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
				const docModalMain = document.getElementById('modalSetting');
				const tmpModalSetting = bootstrap.Modal.getOrCreateInstance(docModalMain);
				tmpModalSetting.hide();
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


document.getElementById('modalSettingBtn').addEventListener('click', async () => {
	loadModal('modalSettingBody',
		`
			<div class="d-flex flex-column align-items-center rounded p-5 border border-1 border-black w-100 h-100 font--argent gap-5">
				<div class="input-group w-50">
					<input type="file" class="form-control border border-1 border-black" accept="image/*" id="modal-inputFile"
						aria-describedby="inputFile" aria-label="Upload">
					<button class="btn btn-dark text-capitalize w-25" type="button" id="inputFile-btn">upload</button>
				</div>
				<div class="input-group w-50">
					<span class="input-group-text border border-1 border-dark bg-dark text-white">
						<svg xmlns="http://www.w3.org/2000/svg" width="30px" viewBox="0 0 32 32"><title>interface-essential-text-input-area-3</title><g><path d="M30.48 15.995H32v4.58h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M30.48 11.425H32v3.05h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M28.95 20.575h1.53v1.52h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M28.95 9.905h1.53v1.52h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M27.43 22.095h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M27.43 8.385h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M25.91 5.335h3.04v1.52h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M25.91 25.145h3.04v1.52h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M24.38 6.855h1.53v18.29h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M21.34 5.335h3.04v1.52h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M21.34 25.145h3.04v1.52h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M18.29 22.095h4.57v1.52h-4.57Z" fill="#ffffff" stroke-width="1"></path><path d="M21.34 19.045h1.52v1.53h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M21.34 14.475h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M19.81 15.995h1.53v3.05h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M18.29 8.385h4.57v1.52h-4.57Z" fill="#ffffff" stroke-width="1"></path><path d="M16.76 15.995h1.53v3.05h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M12.19 22.095h4.57v1.52h-4.57Z" fill="#ffffff" stroke-width="1"></path><path d="m13.72 15.995 3.04 0 0 -1.52 -3.04 0 0 -3.05 -1.53 0 0 9.15 4.57 0 0 -1.53 -3.04 0 0 -3.05z" fill="#ffffff" stroke-width="1"></path><path d="M12.19 8.385h4.57v1.52h-4.57Z" fill="#ffffff" stroke-width="1"></path><path d="m10.67 12.955 -1.52 0 0 3.04 -3.05 0 0 -3.04 -1.53 0 0 7.62 1.53 0 0 -3.05 3.05 0 0 3.05 1.52 0 0 -7.62z" fill="#ffffff" stroke-width="1"></path><path d="M6.1 22.095h4.57v1.52H6.1Z" fill="#ffffff" stroke-width="1"></path><path d="M6.1 11.425h3.05v1.53H6.1Z" fill="#ffffff" stroke-width="1"></path><path d="M6.1 8.385h4.57v1.52H6.1Z" fill="#ffffff" stroke-width="1"></path><path d="M3.05 22.095h1.52v1.52H3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M3.05 8.385h1.52v1.52H3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M1.53 20.575h1.52v1.52H1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M1.53 9.905h1.52v1.52H1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M0 15.995h1.53v4.58H0Z" fill="#ffffff" stroke-width="1"></path><path d="M0 11.425h1.53v3.05H0Z" fill="#ffffff" stroke-width="1"></path></g></svg>
					</span>
					<div class="form-floating">
						<input type="text" class="form-control border border-1 border-dark" id="displayNameInput"
							placeholder="Username">
						<label for="displayNameInput" class="text-capitalize">display name</label>
					</div>
					<button id="nickname-btn" type="button" class="btn btn-dark w-25">
						<p class="h5 p-0 m-0 text-capitalize">save</p>
					</button>
				</div>
				<button id="logout" class="btn btn-dark px-5">
					<p class="display-5 text-capitalize p-0">
						logout
					</p>
				</button>
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
					loadLoginPage('Please login to continue');
					return null
				}
				return response.json();
			})
			.then(async data => {
				if (!data) return;
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
		const docModalMain = document.getElementById('modalSetting');
		const tmpModalSetting = bootstrap.Modal.getOrCreateInstance(docModalMain);
		tmpModalSetting.hide();

	});
	document.getElementById('nickname-btn').addEventListener('click', async () => {

		const newDisplayName = document.getElementById('displayNameInput');
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
				const docModalMain = document.getElementById('modalSetting');
				const tmpModalSetting = bootstrap.Modal.getOrCreateInstance(docModalMain);
				tmpModalSetting.hide();
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

async function generateTestUser() {
	let location = window.location.pathname;
	if (location == '/test_user') {
		await fetch("/api/generate_test_user/").then(response => {
			if (!response.ok) {
				loadToast('Please login to continue');
			}
			return response.json();
		}).then(data => {
			localStorage.setItem('access_token', data.token);
			user = data.user;
			localStorage.setItem('user', data.user);
			sessionStorage.setItem('username', user.username);
			// window.location.reload();
			console.log('Data fetched:', data);
		}).catch((error) => {
			console.error('Error:', error);
		});
	};

}


const urlLocationHandler = async () => {
	generateTestUser();
	if (!user) {
		document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
		return;
	}

    if (gameMode !== 'none') {
        
        console.log("heyyyyyyyyyyyyyyyyyyyyyy");
        const canvasElement = document.getElementById("gameCanvas");
        let animationId = canvasElement.dataset.animationFrameId;
        window.cancelAnimationFrame(animationId);
		canvasElement.remove();
        if (gameMode === 'pong single')
            stopPongExecution();
        if (gameMode === 'pong tournament')
            stopTournamentExecution();
        gameMode = 'none';
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
		loadGameCanvas();
		switch (location) {
			case '/games_pong_local':
                gameMode = 'pong single';
				loadGame(true);
				break;
			case '/games_pong_online':
                gameMode = 'pong single';
				loadGame(false);
				break;
			case '/games_tictactoe_local':
				loadTicTac();
				break;
			case '/games_pong_local_tournament':
                gameMode = 'pong tournament';
				loadTournament(true);
				break;
			case '/games_pong_online_tournament':
                gameMode = 'pong tournament';
				loadTournament(false);
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

		function openSmallWindow() {
			const width = 200;
			const height = 150;


			const left = Math.abs(Math.floor((Math.random() * window.innerWidth - width)) - 1000);
			const top = Math.abs(Math.floor((Math.random() * window.innerHeight - height / 2)) - 500);
			console.log(left, top);

			const windowFrame = document.createElement('div');
			windowFrame.className = 'small-window-frame';
			windowFrame.style.left = left + 'px';
			windowFrame.style.top = top + 'px';


			const topBar = document.createElement('div');
			topBar.className = 'small-top-bar';
			windowFrame.appendChild(topBar);


			const rectangleIcon = document.createElement('img');
			rectangleIcon.className = 'small-top-bar-child';
			rectangleIcon.src = './assets/public/rectangle-4.svg';
			topBar.appendChild(rectangleIcon);

			const options = document.createElement('div');
			options.className = 'small-options';
			topBar.appendChild(options);

			const vectorIcon = document.createElement('img');
			vectorIcon.className = 'small-vector-icon';
			vectorIcon.src = './assets/public/vector.svg';
			options.appendChild(vectorIcon);

			const dotGridIcon = document.createElement('img');
			dotGridIcon.className = 'small-dot-grid-icon';
			dotGridIcon.src = './assets/public/dot-grid.svg';
			options.appendChild(dotGridIcon);


			const windowContent = document.createElement('div');
			windowContent.className = 'small-window';


			const welcomeText = document.createElement('div');
			welcomeText.className = 'small-welcome-text';
			welcomeText.textContent = `Welcome ${user ? user.username : ''}!`;
			windowContent.appendChild(welcomeText);

			windowFrame.appendChild(windowContent);

			document.body.appendChild(windowFrame);

			windowFrame.style.display = 'block';



			setTimeout(() => {
				document.body.removeChild(windowFrame);
			}, 500);
		}


		const windowInterval = setInterval(openSmallWindow, 50);

		const location = window.location.pathname;

		setTimeout(() => {
			clearInterval(windowInterval);
		}, 500);
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
					loadToast('Please login to to verify your identity');
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
		loadSpinner("content", "text-white");
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
						document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
						loadToast('Invalid code');
						localStorage.clear();
						return;
					}
					document.getElementById("content").innerHTML = LOGIN_PAGE_HTML;
					loadToast('Please login to continue');
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
				const otp = data.otp
				if (otp === 'validate_otp') {
					console.log('validate otp');
					setMainWindowframe();

					document.getElementById('windowScreen').innerHTML =
						`
						<div class="d-flex flex-column h-100 w-100 mh-100 mw-100 gap-5 justify-content-center align-items-center font--argent" id="otp-container">
							<div class="p-5">
								<label for="otp-input" class="form-label">Your OTP Code is valid for 2 minutes</label>
								<input type="text" class="form-control" id="otp-input" placeholder="Enter OTP code">
							</div>
							<button type="submit-otp" id="submit-otp" class="btn btn-outline-dark border border-2 border-black rounded">Validate OTP</button>
						</div>
					`;

					document.getElementById('submit-otp').addEventListener('click', async () => {
						console.log('submit otp clicked');
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
									loadToast('Please login to continue');
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
									window.history.pushState({}, "", '/desktop');

									window.onpopstate = urlLocationHandler;
									// call the urlLocationHandler function to handle the initial url
									window.route = urlRoute;
									urlLocationHandler();
								}
								else {
									loadToast('Invalid OTP code');
									const tryAgainButton = '<button type="" id="try-again-btn" class="btn btn-outline-dark border border-2 border-black rounded">Try Again</button>';
									if (!document.getElementById('try-again-btn')) {
										document.getElementById('otp-container').insertAdjacentHTML('beforeend', tryAgainButton);
									}
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
			if (!response.ok) {
				localStorage.clear();
				document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
				loadToast('Please login to continue');
				return null;
			}
		}
		return response.json();
	}).then(data => {
		if (!data) {
			return;
		}
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
			if (!response.ok) {
				localStorage.clear();
				document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
				loadToast('Please login to continue');
				return null;
			}
		}
		return response.json();
	}).then(data => {
		if (!data) {
			return;
		}
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
	if (!users) {
		return;
	}
	if (document.getElementById('player-card-div')) {
		document.getElementById('player-card-div').innerHTML = '';
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