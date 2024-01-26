function handle42Auth() {
	const timestamp = new Date().getTime();
	fetch('http://localhost:8000/api/42_intra_link', {
		method: 'GET',
		credentials: 'include',
	})
		.then(response => {
			if (!response.ok) {
				alert(response.status);
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			console.log('Data fetched:', data);
			// Handle the fetched data
			forty_two_url = data.forty_two_url
			console.log(forty_two_url);
			window.location.href = forty_two_url;
		})
		.catch(error => {
			console.error('Error fetching data:', error);
		});

}

function handleLogout() {
	localStorage.clear();

	fetch('http://localhost:8000/logout', {
		credentials: 'include',
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			console.log('Data fetched:', data);
			if (data.message === 'Logged out successfully') {
				document.getElementById('content').innerHTML = 'You have been logged out successfully';
			}
			else {
				document.getElementById('logout').remove();
			}
		})
		.catch(error => {
			console.error('Error fetching data:', error);
		});
}

function updateDataContainer(data) {
	// Update the UI with the fetched data
	const dataContainer = document.getElementById('data-container');

	dataContainer.innerHTML = data;

}

function handleToken() {
	const credentials = {
		username: localStorage.getItem('username'),
		password: localStorage.getItem('username')
	};

	fetch('http://localhost:8000/api/token/', {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(credentials),
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			localStorage.setItem('token', data.access);
			localStorage.setItem('refresh', data.refresh);
			console.log('Data fetched:', data);
		})
		.catch(error => {
			alert(error);
		});
}


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
	minutes = minutes < 10 ? '0'+minutes : minutes;
	hours = hours < 10 ? '0'+hours : hours;
	seconds = seconds < 10 ? '0'+seconds : seconds;
	
	let formatDate = dayNames[dow].substr(0, 3) + " " + dom + " " + monthNames[month].substr(0, 3) + " " + hours + ":" + minutes + ":" + seconds + " " + ampm ;
	if (document.getElementById("datetime")) {
		document.getElementById("datetime").innerHTML = formatDate;
	}
}
let windowInterval = setInterval(updateTime, 1000);

setTimeout(() => {
	clearInterval(windowInterval);
	windowInterval = setInterval(updateTime, 1000);
}, 1100);