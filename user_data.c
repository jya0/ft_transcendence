
async function handleAuth() {

	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get('code');
	var FORTY_TWO_CLIENT_ID = "u-s4t2ud-69155ca3ecf1f57fa6e8660a9988bbdd7f03a45128ea80a454d6f13939c4bca5"
	var FORTY_TWO_CLIENT_SECRET = "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"
	var FORTY_TWO_REDIRECT_URI = "https://localhost:8090/"
	console.log('code', code)
	if (code) {
		console.log("starting fetching....");
		await fetch(`http://localhost:8000/auth/?code=${code}`)
			.then(async response => {
				if (!response.ok) {
					alert('response was not ok');
				}
				data = await response.json();

				console.log('data', data)
				if (data.message) {
					console.log('message', message)
					return;
				}
				userToken = data.token;
				user = data.user;
				let csrfToken = data.csrfToken
				localStorage.setItem('access_token', userToken);
				localStorage.setItem('username', user.username);
				console.log(userToken);
				console.log(user);
				console.log(csrfToken);
				console.log(data.sessionId);
				// document.cookie = "sessionId=" + data.sessionId;
				console.log('authDone', authDone)
				const url = new URL(window.location.href);
				url.search = '';
				const mainUrl = url.toString();

				history.replaceState({}, '', mainUrl);






				const otp = data.otp
				console.log('otp', otp)
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
				}

			})
	}

}

handleAuth();