function handle42Auth() {
	window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-69155ca3ecf1f57fa6e8660a9988bbdd7f03a45128ea80a454d6f13939c4bca5&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fauth&response_type=code";
}


function getData() {
	let userData;
	fetch('http://localhost:8000/get_user_data/', {
		credentials: 'include' // Send cookies to authenticate the request
	})
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
			const container = document.querySelector(".content");
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