function handle42Auth() {
	const timestamp = new Date().getTime();
	fetch('http://localhost:8000/42_intra_link', {
		credentials: 'include',
		method: 'GET',
		headers: {
			'Cache-Control': 'no-cache',
		},
	})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			console.log('Data fetched:', data);
			// Handle the fetched data
			forty_two_url = data.forty_two_url + `&state=${timestamp}` + `&random=${Math.random()}`;
			console.log(forty_two_url);
			window.location.href = forty_two_url;
		})
		.catch(error => {
			console.error('Error fetching data:', error);
		});
}

function handleLogout() {
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
			if (data.message === 'Logged out successfully') {
				document.getElementById('content').innerHTML = 'You have been logged out successfully';
			}
			document.getElementById('logout').remove();
		})
		.catch(error => {
			console.error('Error fetching data:', error);
		});
}

document.addEventListener('DOMContentLoaded', () => {
	const dynamicLinks = document.querySelectorAll('.dynamic-link');

	dynamicLinks.forEach(link => {
		link.addEventListener('click', event => {
			event.preventDefault();
			const route = event.target.getAttribute('href');
			console.log('Fetching data from:', route);
			fetchBackendData(`http://localhost:8000${route}/`)
				.then(data => {
					console.log('Data fetched:', data);
					updateDataContainer(data);
				})
				.catch(error => {
					console.error('Error fetching data:', error);
				});
		});
	});
});

function fetchBackendData(route) {

	return fetch(route, { credentials: 'include' })
		.then(response => {
			if (!response.ok) {	
				console.log(response.json());
				throw new Error('Network response was not ok');
			}
			return response.text();
		});
}

function updateDataContainer(data) {
	// Update the UI with the fetched data
	const dataContainer = document.getElementById('data-container');

	dataContainer.innerHTML = data;

}

function getData() {
	let userData;
	fetch('http://localhost:8000/get_user_data/', { credentials: 'include' })
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
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
			const container = document.getElementById("content");
			data.forEach((obj) => {
				Object.entries(obj).forEach((key, value) => {
					container.innerHTML +=
						"<p>" + key[0].toUpperCase() + ": " + key[1] + "</p>";
				});
			});

			const userPic = document.getElementById('user-pic');
			if (userData) {
				userPic.src = userData.picture.link;
				userPic.style.cssText = 'border: 2px solid black; margin: 10px; height: 100px; width: 100px; border-radius: 50%;'
			}
		})
		.catch(error => {
			console.error('Error fetching user data:', error);
		});
}