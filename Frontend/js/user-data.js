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


