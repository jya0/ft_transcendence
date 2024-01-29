import { loadToast } from './loadComponent.js';

function updateTime() {
	const monthNames = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"];
	const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	const now = new Date();

	let year = now.getFullYear();
	let month = now.getMonth();
	let dow = now.getDay();
	let dom = now.getDate();
	let hours = now.getHours();
	let minutes = now.getMinutes();
	let seconds = now.getSeconds();

	let ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	hours = hours < 10 ? '0' + hours : hours;
	seconds = seconds < 10 ? '0' + seconds : seconds;

	let formatDate = dayNames[dow].substr(0, 3) + " " + dom + " " + monthNames[month].substr(0, 3) + " " + hours + ":" + minutes + ":" + seconds + " " + ampm;
	if (document.getElementById("datetime")) {
		document.getElementById("datetime").innerHTML = formatDate;
	}
}
// let windowInterval = setInterval(updateTime, 1000);

// setTimeout(() => {
// 	clearInterval(windowInterval);
// 	windowInterval = setInterval(updateTime, 1000);
// }, 1100);
let windowInterval;

function updateInterval() {
    clearInterval(windowInterval);
    windowInterval = setInterval(updateTime, 1000);
}

windowInterval = setInterval(updateTime, 1000);

setTimeout(updateInterval, 1100);


if (document.getElementById('test_user')) {

	document.getElementById('test_user').addEventListener('click', async () => {
		await fetch("/api/generate_test_user/").then(response => {
			if (!response.ok) {
				response.statusText === 'Unauthorized' ? alert('Unauthorized') : alert('Network response was not ok');
			}
			return response.json();
		}).then(data => {
			console.log(data.token)
			userToken = data.token;
			user = data.user;
			localStorage.setItem('access_token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));
			isAuthDone = true;
			if (localStorage.getItem('access_token')) {
				console.log('authDone', localStorage.getItem('access_token'))
			}
			// window.location.reload();
			console.log('Data fetched:', data);
			location = '/desktop';
			window.history.pushState({}, "", location);
			isAuthDone = true;
			document.getElementById("main-content").innerHTML = '';
			urlLocationHandler();

		}).catch((error) => {
			console.error('Error:', error);
		});
	});
}