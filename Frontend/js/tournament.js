// import {io} from "socket.io-client";
export function loadTournament() {
	let tournament_name;
	const canvas = document.getElementById('gameCanvas');
	const ctx = canvas.getContext('2d');

	let localPlayerMode = true;
	let pairings = [];
	let winners = [];
	// canvas.width = 800;
	// canvas.height = 400;

	const paddle = { width: 10, height: 100, speed: 8 };
	const ball = { size: 10, x: canvas.width / 2, y: canvas.height / 2, speedX: 6, speedY: 6 };
	const score = { left: 0, right: 0 };
	const players = { left: (canvas.height - paddle.height) / 2, right: (canvas.height - paddle.height) / 2 };
	const keys = {};

	let tournReady = false;
	let isGameOver = false;
	let animationFrameId;

	let socketStatus = false;
	let btnCounter = 0;
	let keyPressed;
	let leftPlayer = true;
	let rightPlayer = false;
	let g_count = 0;

	function draw() {
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, players.left, paddle.width, paddle.height);
		ctx.fillRect(canvas.width - paddle.width, players.right, paddle.width, paddle.height);
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
		ctx.fill();
		ctx.font = '30px Arial';
		ctx.fillText(score.left, canvas.width / 4, 50);
		ctx.fillText(score.right, 3 * canvas.width / 4, 50);
	}

	function updateBackend() {
		if (rightPlayer) {
			if (keys['w'] && players.right > 0) {
				players.right -= paddle.speed;
				keyPressed = 'w';
				gameSocket.send(JSON.stringify({
					'type': 'update',
					'mode': 'tournament',
					'tournament_name': tournament_name,
					'username': localStorage.getItem('username'),
					'key': keyPressed
				}))
			}
			if (keys['s'] && players.right < canvas.height - paddle.height) {
				players.right += paddle.speed;
				keyPressed = 's';
				gameSocket.send(JSON.stringify({
					'type': 'update',
					'mode': 'tournament',
					'tournament_name': tournament_name,
					'username': localStorage.getItem('username'),
					'key': keyPressed
				}))
			}
		}
		else {
			if (keys['w'] && players.left > 0) {
				players.left -= paddle.speed;
				keyPressed = 'w';
				gameSocket.send(JSON.stringify({
					'type': 'update',
					'mode': 'tournament',
					'tournament_name': tournament_name,
					'username': localStorage.getItem('username'),
					'key': keyPressed
				}))
			}
			if (keys['s'] && players.left < canvas.height - paddle.height) {
				players.left += paddle.speed;
				keyPressed = 's';
				gameSocket.send(JSON.stringify({
					'type': 'update',
					'mode': 'tournament',
					'tournament_name': tournament_name,
					'username': localStorage.getItem('username'),
					'key': keyPressed
				}))
			}
		}
	}


	function resetGame() {

		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		score.left = 0;
		score.right = 0;
		players.left = (canvas.height - paddle.height) / 2;
		players.right = (canvas.height - paddle.height) / 2;
	}


	function update() {
		if (isGameOver) return;

		ball.x += ball.speedX;
		ball.y += ball.speedY;

		if (ball.y < ball.size || ball.y > canvas.height - ball.size) {
			ball.speedY *= -1;
		}

		if (ball.x < paddle.width && ball.y > players.left && ball.y < players.left + paddle.height ||
			ball.x > canvas.width - paddle.width && ball.y > players.right && ball.y < players.right + paddle.height) {
			ball.speedX *= -1;
		}

		if (localPlayerMode == true) {
			if (keys['ArrowUp'] && players.right > 0) players.right -= paddle.speed;
			if (keys['ArrowDown'] && players.right < canvas.height - paddle.height) players.right += paddle.speed;
			if (keys['w'] && players.left > 0) players.left -= paddle.speed;
			if (keys['s'] && players.left < canvas.height - paddle.height) players.left += paddle.speed;
		}
		else
			updateBackend();


		if (ball.x < 0 || ball.x > canvas.width) {
			ball.x > canvas.width ? score.left++ : score.right++;
			resetBall();
			checkForWinner();
			return;
		}

	}

	function resetBall() {
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		ball.speedX *= -1;
	}

	function handleLocalWinner() {
		let buttonText;

		if (tournReady == false)
			return;

		//show results
		if (g_count != 2) {

			alert(`Match ${g_count + 1}: ${pairings[g_count][0]} vs ${pairings[g_count][1]} *** Result: ${score.left} - ${score.right}`);
			console.log(`Match ${g_count + 1}: ${pairings[g_count][0]} vs ${pairings[g_count][1]} *** Result: ${score.left} - ${score.right}`);
		}

		//update winners
		if (g_count == 0 || g_count == 1) {
			winners.push((pairings[g_count][0] > pairings[g_count][1]) ? pairings[g_count][0] : pairings[g_count][1]);
		}


		//reset
		isGameOver = false;
		socketStatus = false;
		leftPlayer = true;
		rightPlayer = false;
		score.left = 0;
		score.right = 0;
		resetBall();
		paddle.width = 10;
		paddle.height = 100;


		//prompt new match
		if (g_count == 0) {
			// alert(`Match ${g_count + 2}: ${pairings[1][0]} vs ${pairings[1][1]}\n Press to start`);
			//@todo - show bracket
			resetGame();
		}
		if (g_count == 1) {
			// alert(`Match ${g_count + 2}: ${winners[0]} vs ${winners[1]}\n Press to start`);
			//@todo - show bracket

			resetGame();
		}
		// end tournament
		if (g_count == 2) {
			tournReady = false;
			let winner;
			if (score.left > score.right) {
				buttonText = `Left Player - ${winners[0]} WINS! Press to play a new local game`;
				winner = winners[0];

			} else {
				buttonText = `Right Player - ${winners[1]} WINS! Press to play a new local game`;
				winner = winners[1];

			}
			winners = [];
			winners.push(winner);
			g_count = 0;
			tournReady = false;
			isGameOver = true;
			alert(buttonText);
			//@todo - show bracket
		}
		else
			g_count++;
	}


	function handleOnlineWinner() {
		let buttonText;
		if ((rightPlayer && score.left >= 3) || (leftPlayer && score.right >= 3))
			buttonText = "You lose! Press to play a new online game";
		else {
			buttonText = "You win! Press to play a new online game";
			gameSocket.send(JSON.stringify({
				'type': 'end',
				'mode': 'tournament',
				'tournament_name': tournament_name,
				'username': localStorage.getItem('username'),
				'score1': score.left,
				'score2': score.right,
			}))
		}
		document.getElementById("startOnlineTournButton").innerHTML = buttonText;
		gameSocket.close();
		isGameOver = true;
		socketStatus = false;
	}

	function checkForWinner() {

		if (score.left >= 3 || score.right >= 3) {
			isGameOver = true;
			ctx.fillStyle = 'red';

			if (localPlayerMode)
				handleLocalWinner();
			else
				handleOnlineWinner();
		}
	}

	document.addEventListener('keydown', (event) => {
		keys[event.key] = true;
	});

	document.addEventListener('keyup', (event) => {
		keys[event.key] = false;
	});

	let player_count = 0;
	let url = `wss://localhost:8090/ws/socket-server/`
	let gameSocket;

	function initiateSocket() {
		gameSocket = new WebSocket(url);

		gameSocket.onmessage = function (e) {
			let data = JSON.parse(e.data)
			console.log('Data: ', data)

			if (data.mode === 'single')
				return;

			if (data.type === 'start' && data["status"] == "start") {
				player_count = 2;
				// document.getElementById("startOnlineTournButton").innerHTML = "In-game";
				if (data.sender == localStorage.getItem('username')) {
					leftPlayer = false;
					rightPlayer = true;
				}
				// console.log(leftPlayer);
				// console.log(rightPlayer);
				playOnlineTournamentMatch();
			}

			if (data.sender == localStorage.getItem('username'))
				return;

			if (data.type == 'update') {
				if (leftPlayer) {
					if (data['key'] == 'w' && players.right > 0) players.right -= paddle.speed;
					if (data['key'] == 's' && players.right < canvas.height - paddle.height) players.right += paddle.speed;
				}
				else {
					if (data['key'] == 'w' && players.left > 0) players.left -= paddle.speed;
					if (data['key'] == 's' && players.left < canvas.height - paddle.height) players.left += paddle.speed;
				}
			}
			else if (data.type == 'close') {
				gameOver = true;
				player_count = 1;
				gameSocket.close();
			}
			else {
				// console.log("woops not yet...")
			}
		}

		gameSocket.addEventListener("open", (event) => {
			if (socketStatus == true)
				return
			socketStatus = true;

			gameSocket.send(JSON.stringify({
				'type': 'start',
				'mode': 'tournament',
				'tournament_name': tournament_name,
				'username': localStorage.getItem('username')
			}))

			player_count = 1;
			console.log("waiting for a second player...")
		});
		player_count = 1;
	}


	// Simple random pairing function
	function randomPairing(playerNames) {
		const shuffledPlayers = [...playerNames].sort(() => Math.random() - 0.5);
		const pairings = [];

		for (let i = 0; i < shuffledPlayers.length; i += 2) {
			pairings.push([shuffledPlayers[i], shuffledPlayers[i + 1]]);
		}

		return pairings;
	}


	function playGame() {
		localPlayerMode = true;
		// startLocalButton.disabled = true;
		// startOnlineButton.disabled = true;
		if (isGameOver || !animationFrameId) {
			isGameOver = false;
			score.left = 0;
			score.right = 0;
			resetBall();
			animationFrameId = requestAnimationFrame(gameLoop);
		}

	}


	function startLocalTournament() {
		console.log("sup mfs");
		// if (tournReady == false)
		//     return;
		let winners = [];
		localPlayerMode = true;
		let player1 = pairings[0][0];
		let player2 = pairings[0][1];
		// startLocalButton.disabled = true;
		// startOnlineButton.disabled = true;
		// startLocalButton.style.visibility = 'hidden';
		// startOnlineButton.style.visibility = 'hidden';
		if (g_count == 0) {
			isGameOver = false;
			score.left = 0;
			score.right = 0;
			resetBall();
			// alert(`Match 1: ${player1} vs ${player2}\n Press to start`);
			playGame();
			// startLocalButton.disabled = false;
			// startLocalButton.click();
		}
	}

	function setupTournament() {

		// // Check if a form already exists and remove it
		// const checker = document.getElementById('tourn-player-count');
		// if (checker) {
		//     checker.remove();
		// }

		// if (tournReady) {
		//     // document.getElementById("startLocalTournButton").textContent = "Matchmaking complete. Press to start local tournament!";
		//     startLocalTournament();
		// }

		// localPlayerMode = true;
		// // startLocalButton.disabled = true;
		// // startOnlineButton.disabled = true;
		// // startLocalButton.style.visibility = 'hidden';
		// // startOnlineButton.style.visibility = 'hidden';


		// Display a form to get the number of players and their names
		// const formContainer = document.createElement('div');
		// formContainer.innerHTML = `
		//      <form id="tournamentSetupForm">
		//      </form>
		//  `;
		// formContainer.innerHTML = `
		//      <form id="tournamentSetupForm">
		//          <label for="playerCount">Enter the number of players:</label>
		//          <input type="number" id="playerCount" name="playerCount" min="2" required>
		//          <button id="formButton" type="submit">Start Tournament</button>
		//      </form>
		//  `;
		// formContainer.id = 'tourn-player-count';


		// document.getElementById('windowScreen').appendChild(formContainer);

		// const tournamentSetupForm = document.getElementById('tournamentSetupForm');
		// tournamentSetupForm.addEventListener('submit', (event) => {

		// event.preventDefault();

		// const playerCountInput = document.getElementById('playerCount');
		// const playerCount = parseInt(playerCountInput.value, 10);

		// if (isNaN(playerCount) || playerCount < 4 || playerCount % 2 !== 0 || playerCount > 100) {
		// alert("Invalid input. Please enter a valid even number of players (minimum 4 & max 100).");
		// return;
		// }

		// formContainer.remove(); // Remove the form once the input is collected
		// document.getElementById('tourn-player-count').remove();

		const docModalMain = document.getElementById('modalMain');
		docModalMain.querySelector('#modalMainBody').innerHTML =
			`
					<form id="formPlayerNames">
						<div class="row row-cols-2 gy-4 font--argent justify-content-center">
							<div class="col">
								<div class="input-group">
									<span class="input-group-text"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24" width="24"><title>interface-essential-profile-male</title><g><path d="M22.8525 9.1425H24v5.715h-1.1475Z" fill="#000000" stroke-width="1"></path><path d="M21.7125 14.857499999999998h1.1400000000000001v2.2874999999999996h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M21.7125 6.855h1.1400000000000001v2.2874999999999996h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M20.572499999999998 17.145h1.1400000000000001v2.2800000000000002h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M20.572499999999998 4.574999999999999h1.1400000000000001v2.2800000000000002h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M19.424999999999997 19.424999999999997h1.1475v1.1475H19.424999999999997Z" fill="#000000" stroke-width="1"></path><path d="M19.424999999999997 3.4275h1.1475V4.574999999999999H19.424999999999997Z" fill="#000000" stroke-width="1"></path><path d="M17.137500000000003 20.572499999999998h2.2874999999999996v1.1400000000000001h-2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M17.137500000000003 2.2874999999999996h2.2874999999999996v1.1400000000000001h-2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M15.997499999999999 15.997499999999999h1.1400000000000001v1.1475h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="m6.855 11.43 1.1400000000000001 0 0 -1.1475 8.0025 0 0 1.1475 1.1400000000000001 0 0 4.5675 1.1475 0 0 -9.1425 -1.1475 0 0 -1.1400000000000001 -1.1400000000000001 0 0 -1.1400000000000001 -8.0025 0 0 1.1400000000000001 -1.1400000000000001 0 0 1.1400000000000001 -1.1400000000000001 0 0 9.1425 1.1400000000000001 0 0 -4.5675z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 21.7125h2.2800000000000002v1.1475h-2.2800000000000002Z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 17.145h1.1400000000000001v1.1400000000000001h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 12.57h1.1400000000000001v2.2874999999999996h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 1.1400000000000001h2.2800000000000002v1.1475h-2.2800000000000002Z" fill="#000000" stroke-width="1"></path><path d="M9.1425 22.86h5.715V24h-5.715Z" fill="#000000" stroke-width="1"></path><path d="M9.1425 18.285h5.715v1.1400000000000001h-5.715Z" fill="#000000" stroke-width="1"></path><path d="M10.2825 15.997499999999999h3.4275v1.1475h-3.4275Z" fill="#000000" stroke-width="1"></path><path d="M9.1425 0h5.715v1.1400000000000001h-5.715Z" fill="#000000" stroke-width="1"></path><path d="M6.855 21.7125h2.2874999999999996v1.1475H6.855Z" fill="#000000" stroke-width="1"></path><path d="M7.995 17.145h1.1475v1.1400000000000001h-1.1475Z" fill="#000000" stroke-width="1"></path><path d="M7.995 12.57h1.1475v2.2874999999999996h-1.1475Z" fill="#000000" stroke-width="1"></path><path d="M6.855 1.1400000000000001h2.2874999999999996v1.1475H6.855Z" fill="#000000" stroke-width="1"></path><path d="M6.855 15.997499999999999h1.1400000000000001v1.1475H6.855Z" fill="#000000" stroke-width="1"></path><path d="M4.5675 20.572499999999998h2.2874999999999996v1.1400000000000001H4.5675Z" fill="#000000" stroke-width="1"></path><path d="M4.5675 2.2874999999999996h2.2874999999999996v1.1400000000000001H4.5675Z" fill="#000000" stroke-width="1"></path><path d="M3.4275 19.424999999999997h1.1400000000000001v1.1475H3.4275Z" fill="#000000" stroke-width="1"></path><path d="M3.4275 3.4275h1.1400000000000001V4.574999999999999H3.4275Z" fill="#000000" stroke-width="1"></path><path d="M2.2874999999999996 17.145h1.1400000000000001v2.2800000000000002H2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M2.2874999999999996 4.574999999999999h1.1400000000000001v2.2800000000000002H2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M1.1400000000000001 14.857499999999998h1.1475v2.2874999999999996H1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M1.1400000000000001 6.855h1.1475v2.2874999999999996H1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M0 9.1425h1.1400000000000001v5.715H0Z" fill="#000000" stroke-width="1"></path></g></svg></span>
									<div class="form-floating">
										<input type="text" class="form-control" id="player01" placeholder="player01">
										<label for="player01" class="form-label text-capitalize">player01</label>
									</div>
								</div>
							</div>
							<div class="col">
								<div class="input-group">
									<span class="input-group-text"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24" width="24"><title>interface-essential-profile-male</title><g><path d="M22.8525 9.1425H24v5.715h-1.1475Z" fill="#000000" stroke-width="1"></path><path d="M21.7125 14.857499999999998h1.1400000000000001v2.2874999999999996h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M21.7125 6.855h1.1400000000000001v2.2874999999999996h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M20.572499999999998 17.145h1.1400000000000001v2.2800000000000002h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M20.572499999999998 4.574999999999999h1.1400000000000001v2.2800000000000002h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M19.424999999999997 19.424999999999997h1.1475v1.1475H19.424999999999997Z" fill="#000000" stroke-width="1"></path><path d="M19.424999999999997 3.4275h1.1475V4.574999999999999H19.424999999999997Z" fill="#000000" stroke-width="1"></path><path d="M17.137500000000003 20.572499999999998h2.2874999999999996v1.1400000000000001h-2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M17.137500000000003 2.2874999999999996h2.2874999999999996v1.1400000000000001h-2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M15.997499999999999 15.997499999999999h1.1400000000000001v1.1475h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="m6.855 11.43 1.1400000000000001 0 0 -1.1475 8.0025 0 0 1.1475 1.1400000000000001 0 0 4.5675 1.1475 0 0 -9.1425 -1.1475 0 0 -1.1400000000000001 -1.1400000000000001 0 0 -1.1400000000000001 -8.0025 0 0 1.1400000000000001 -1.1400000000000001 0 0 1.1400000000000001 -1.1400000000000001 0 0 9.1425 1.1400000000000001 0 0 -4.5675z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 21.7125h2.2800000000000002v1.1475h-2.2800000000000002Z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 17.145h1.1400000000000001v1.1400000000000001h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 12.57h1.1400000000000001v2.2874999999999996h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 1.1400000000000001h2.2800000000000002v1.1475h-2.2800000000000002Z" fill="#000000" stroke-width="1"></path><path d="M9.1425 22.86h5.715V24h-5.715Z" fill="#000000" stroke-width="1"></path><path d="M9.1425 18.285h5.715v1.1400000000000001h-5.715Z" fill="#000000" stroke-width="1"></path><path d="M10.2825 15.997499999999999h3.4275v1.1475h-3.4275Z" fill="#000000" stroke-width="1"></path><path d="M9.1425 0h5.715v1.1400000000000001h-5.715Z" fill="#000000" stroke-width="1"></path><path d="M6.855 21.7125h2.2874999999999996v1.1475H6.855Z" fill="#000000" stroke-width="1"></path><path d="M7.995 17.145h1.1475v1.1400000000000001h-1.1475Z" fill="#000000" stroke-width="1"></path><path d="M7.995 12.57h1.1475v2.2874999999999996h-1.1475Z" fill="#000000" stroke-width="1"></path><path d="M6.855 1.1400000000000001h2.2874999999999996v1.1475H6.855Z" fill="#000000" stroke-width="1"></path><path d="M6.855 15.997499999999999h1.1400000000000001v1.1475H6.855Z" fill="#000000" stroke-width="1"></path><path d="M4.5675 20.572499999999998h2.2874999999999996v1.1400000000000001H4.5675Z" fill="#000000" stroke-width="1"></path><path d="M4.5675 2.2874999999999996h2.2874999999999996v1.1400000000000001H4.5675Z" fill="#000000" stroke-width="1"></path><path d="M3.4275 19.424999999999997h1.1400000000000001v1.1475H3.4275Z" fill="#000000" stroke-width="1"></path><path d="M3.4275 3.4275h1.1400000000000001V4.574999999999999H3.4275Z" fill="#000000" stroke-width="1"></path><path d="M2.2874999999999996 17.145h1.1400000000000001v2.2800000000000002H2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M2.2874999999999996 4.574999999999999h1.1400000000000001v2.2800000000000002H2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M1.1400000000000001 14.857499999999998h1.1475v2.2874999999999996H1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M1.1400000000000001 6.855h1.1475v2.2874999999999996H1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M0 9.1425h1.1400000000000001v5.715H0Z" fill="#000000" stroke-width="1"></path></g></svg></span>
									<div class="form-floating">
										<input type="text" class="form-control" id="player02" placeholder="player02">
										<label for="player02" class="form-label text-capitalize">player02</label>
									</div>
								</div>
							</div>
							<div class="col">
								<div class="input-group">
									<span class="input-group-text"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24" width="24"><title>interface-essential-profile-male</title><g><path d="M22.8525 9.1425H24v5.715h-1.1475Z" fill="#000000" stroke-width="1"></path><path d="M21.7125 14.857499999999998h1.1400000000000001v2.2874999999999996h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M21.7125 6.855h1.1400000000000001v2.2874999999999996h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M20.572499999999998 17.145h1.1400000000000001v2.2800000000000002h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M20.572499999999998 4.574999999999999h1.1400000000000001v2.2800000000000002h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M19.424999999999997 19.424999999999997h1.1475v1.1475H19.424999999999997Z" fill="#000000" stroke-width="1"></path><path d="M19.424999999999997 3.4275h1.1475V4.574999999999999H19.424999999999997Z" fill="#000000" stroke-width="1"></path><path d="M17.137500000000003 20.572499999999998h2.2874999999999996v1.1400000000000001h-2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M17.137500000000003 2.2874999999999996h2.2874999999999996v1.1400000000000001h-2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M15.997499999999999 15.997499999999999h1.1400000000000001v1.1475h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="m6.855 11.43 1.1400000000000001 0 0 -1.1475 8.0025 0 0 1.1475 1.1400000000000001 0 0 4.5675 1.1475 0 0 -9.1425 -1.1475 0 0 -1.1400000000000001 -1.1400000000000001 0 0 -1.1400000000000001 -8.0025 0 0 1.1400000000000001 -1.1400000000000001 0 0 1.1400000000000001 -1.1400000000000001 0 0 9.1425 1.1400000000000001 0 0 -4.5675z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 21.7125h2.2800000000000002v1.1475h-2.2800000000000002Z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 17.145h1.1400000000000001v1.1400000000000001h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 12.57h1.1400000000000001v2.2874999999999996h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 1.1400000000000001h2.2800000000000002v1.1475h-2.2800000000000002Z" fill="#000000" stroke-width="1"></path><path d="M9.1425 22.86h5.715V24h-5.715Z" fill="#000000" stroke-width="1"></path><path d="M9.1425 18.285h5.715v1.1400000000000001h-5.715Z" fill="#000000" stroke-width="1"></path><path d="M10.2825 15.997499999999999h3.4275v1.1475h-3.4275Z" fill="#000000" stroke-width="1"></path><path d="M9.1425 0h5.715v1.1400000000000001h-5.715Z" fill="#000000" stroke-width="1"></path><path d="M6.855 21.7125h2.2874999999999996v1.1475H6.855Z" fill="#000000" stroke-width="1"></path><path d="M7.995 17.145h1.1475v1.1400000000000001h-1.1475Z" fill="#000000" stroke-width="1"></path><path d="M7.995 12.57h1.1475v2.2874999999999996h-1.1475Z" fill="#000000" stroke-width="1"></path><path d="M6.855 1.1400000000000001h2.2874999999999996v1.1475H6.855Z" fill="#000000" stroke-width="1"></path><path d="M6.855 15.997499999999999h1.1400000000000001v1.1475H6.855Z" fill="#000000" stroke-width="1"></path><path d="M4.5675 20.572499999999998h2.2874999999999996v1.1400000000000001H4.5675Z" fill="#000000" stroke-width="1"></path><path d="M4.5675 2.2874999999999996h2.2874999999999996v1.1400000000000001H4.5675Z" fill="#000000" stroke-width="1"></path><path d="M3.4275 19.424999999999997h1.1400000000000001v1.1475H3.4275Z" fill="#000000" stroke-width="1"></path><path d="M3.4275 3.4275h1.1400000000000001V4.574999999999999H3.4275Z" fill="#000000" stroke-width="1"></path><path d="M2.2874999999999996 17.145h1.1400000000000001v2.2800000000000002H2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M2.2874999999999996 4.574999999999999h1.1400000000000001v2.2800000000000002H2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M1.1400000000000001 14.857499999999998h1.1475v2.2874999999999996H1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M1.1400000000000001 6.855h1.1475v2.2874999999999996H1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M0 9.1425h1.1400000000000001v5.715H0Z" fill="#000000" stroke-width="1"></path></g></svg></span>
									<div class="form-floating">
										<input type="text" class="form-control" id="player03" placeholder="player03">
										<label for="player03" class="form-label text-capitalize">player03</label>
									</div>
								</div>
							</div>
							<div class="col">
								<div class="input-group">
									<span class="input-group-text"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24" width="24"><title>interface-essential-profile-male</title><g><path d="M22.8525 9.1425H24v5.715h-1.1475Z" fill="#000000" stroke-width="1"></path><path d="M21.7125 14.857499999999998h1.1400000000000001v2.2874999999999996h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M21.7125 6.855h1.1400000000000001v2.2874999999999996h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M20.572499999999998 17.145h1.1400000000000001v2.2800000000000002h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M20.572499999999998 4.574999999999999h1.1400000000000001v2.2800000000000002h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M19.424999999999997 19.424999999999997h1.1475v1.1475H19.424999999999997Z" fill="#000000" stroke-width="1"></path><path d="M19.424999999999997 3.4275h1.1475V4.574999999999999H19.424999999999997Z" fill="#000000" stroke-width="1"></path><path d="M17.137500000000003 20.572499999999998h2.2874999999999996v1.1400000000000001h-2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M17.137500000000003 2.2874999999999996h2.2874999999999996v1.1400000000000001h-2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M15.997499999999999 15.997499999999999h1.1400000000000001v1.1475h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="m6.855 11.43 1.1400000000000001 0 0 -1.1475 8.0025 0 0 1.1475 1.1400000000000001 0 0 4.5675 1.1475 0 0 -9.1425 -1.1475 0 0 -1.1400000000000001 -1.1400000000000001 0 0 -1.1400000000000001 -8.0025 0 0 1.1400000000000001 -1.1400000000000001 0 0 1.1400000000000001 -1.1400000000000001 0 0 9.1425 1.1400000000000001 0 0 -4.5675z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 21.7125h2.2800000000000002v1.1475h-2.2800000000000002Z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 17.145h1.1400000000000001v1.1400000000000001h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 12.57h1.1400000000000001v2.2874999999999996h-1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M14.857499999999998 1.1400000000000001h2.2800000000000002v1.1475h-2.2800000000000002Z" fill="#000000" stroke-width="1"></path><path d="M9.1425 22.86h5.715V24h-5.715Z" fill="#000000" stroke-width="1"></path><path d="M9.1425 18.285h5.715v1.1400000000000001h-5.715Z" fill="#000000" stroke-width="1"></path><path d="M10.2825 15.997499999999999h3.4275v1.1475h-3.4275Z" fill="#000000" stroke-width="1"></path><path d="M9.1425 0h5.715v1.1400000000000001h-5.715Z" fill="#000000" stroke-width="1"></path><path d="M6.855 21.7125h2.2874999999999996v1.1475H6.855Z" fill="#000000" stroke-width="1"></path><path d="M7.995 17.145h1.1475v1.1400000000000001h-1.1475Z" fill="#000000" stroke-width="1"></path><path d="M7.995 12.57h1.1475v2.2874999999999996h-1.1475Z" fill="#000000" stroke-width="1"></path><path d="M6.855 1.1400000000000001h2.2874999999999996v1.1475H6.855Z" fill="#000000" stroke-width="1"></path><path d="M6.855 15.997499999999999h1.1400000000000001v1.1475H6.855Z" fill="#000000" stroke-width="1"></path><path d="M4.5675 20.572499999999998h2.2874999999999996v1.1400000000000001H4.5675Z" fill="#000000" stroke-width="1"></path><path d="M4.5675 2.2874999999999996h2.2874999999999996v1.1400000000000001H4.5675Z" fill="#000000" stroke-width="1"></path><path d="M3.4275 19.424999999999997h1.1400000000000001v1.1475H3.4275Z" fill="#000000" stroke-width="1"></path><path d="M3.4275 3.4275h1.1400000000000001V4.574999999999999H3.4275Z" fill="#000000" stroke-width="1"></path><path d="M2.2874999999999996 17.145h1.1400000000000001v2.2800000000000002H2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M2.2874999999999996 4.574999999999999h1.1400000000000001v2.2800000000000002H2.2874999999999996Z" fill="#000000" stroke-width="1"></path><path d="M1.1400000000000001 14.857499999999998h1.1475v2.2874999999999996H1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M1.1400000000000001 6.855h1.1475v2.2874999999999996H1.1400000000000001Z" fill="#000000" stroke-width="1"></path><path d="M0 9.1425h1.1400000000000001v5.715H0Z" fill="#000000" stroke-width="1"></path></g></svg></span>
									<div class="form-floating">
										<input type="text" class="form-control" id="player04" placeholder="player04">
										<label for="player04" class="form-label text-capitalize">player04</label>
									</div>
								</div>
							</div>
							<button type="submit" class="col-auto btn btn-light btn-lg px-3 py-1 rounded-1" id="beginTournament">
								<p class="display-5 text-capitalize text-black text-wrap p-0 m-0 g-0" style="font-size: calc(100% + 0.5vw);">start tournament</p>
							</button>	
						</div>
					</form>
				`;
		const tmpModalMain = bootstrap.Modal.getOrCreateInstance(docModalMain);
		tmpModalMain.show();


		document.getElementById('formPlayerNames').addEventListener('submit', function (event) {
			event.preventDefault(); // Prevents the default form submission behavior

			// Get the values from the input fields
			// var player01Value = document.getElementById('player01').value;
			// var player02Value = document.getElementById('player02').value;
			// var player03Value = document.getElementById('player03').value;
			// var player04Value = document.getElementById('player04').value;

			// Do something with the form data (e.g., send it to the server or perform some action)
			// console.log('Player 01:', player01Value);
			// console.log('Player 02:', player02Value);
			// console.log('Player 03:', player03Value);
			// console.log('Player 04:', player04Value);

			// Add any additional logic here

			// Reset the form if needed
			// document.getElementById('yourFormId').reset();

			const form = document.getElementById('formPlayerNames');
			const playerInputs = form.querySelectorAll('input[id^="player"]');
			const playerNames = Array.from(playerInputs).map(input => input.value);

			console.log(playerNames);

			// Check if all player names are unique
			if (hasDuplicates(playerNames)) {
				alert("Player names must be unique. Please enter distinct names for each player.");
				return;
			}
			// Perform matchmaking logic (for demonstration, this is a simple random pairing)
			pairings = randomPairing(playerNames);

			//@todo: show pairings via modal:


			tournReady = true;
			// playerNameContainer.remove();
			startLocalTournament();



		});








		// // Now, create input fields for player names dynamically within the same form
		// const playerNameContainer = document.createElement('div');
		// playerNameContainer.innerHTML = `<p>Enter the names for 4 players:</p>`;

		// const form = document.createElement('form');
		// form.id = 'playerNamesForm';

		// for (let i = 1; i <= 4; i++) {
		// 	const label = document.createElement('label');
		// 	label.textContent = `Player ${i}:`;

		// 	const input = document.createElement('input');
		// 	input.type = 'text';
		// 	input.name = `player${i}`;
		// 	input.required = true;

		// 	playerNameContainer.appendChild(label);
		// 	playerNameContainer.appendChild(input);
		// }

		// const beginTournButton = document.createElement('button');
		// beginTournButton.type = 'submit';
		// beginTournButton.innerHTML = 'Start Tournament';

		// form.appendChild(playerNameContainer);
		// form.appendChild(beginTournButton);
		// document.getElementById('windowScreen').appendChild(form);

		// form.addEventListener('submit', (event) => {
		// 	event.preventDefault();

		// 	const playerInputs = form.querySelectorAll(`input[name^="player"]`);
		// 	const playerNames = Array.from(playerInputs).map(input => input.value);

		// 	// Check if all player names are unique
		// 	if (hasDuplicates(playerNames)) {
		// 		alert("Player names must be unique. Please enter distinct names for each player.");
		// 		return;
		// 	}
		// 	// Perform matchmaking logic (for demonstration, this is a simple random pairing)
		// 	pairings = randomPairing(playerNames);

		// 	// Create a list element to display pairings
		// 	const resultsList = document.createElement('ul');
		// 	resultsList.innerHTML = "<p>Matchmaking Results:</p>";

		// 	pairings.forEach((pairing, index) => {
		// 		const listItem = document.createElement('li');
		// 		listItem.textContent = `Match ${index + 1}: ${pairing[0]} vs ${pairing[1]}`;
		// 		resultsList.appendChild(listItem);
		// 		// Perform additional actions with the pairings
		// 	});
		// 	beginTournButton.disabled = false;

		// 	// Append the list to the bottom of the page
		// 	document.getElementById('windowScreen').appendChild(resultsList);
		// 	tournReady = true;
		// 	// document.getElementById("startLocalTournButton").textContent = "Matchmaking complete. Press to start local tournament!";

		// 	// startLocalButton.disabled = false;
		// 	// startOnlineButton.disabled = false;
		// 	// startLocalButton.style.visibility = 'visible';
		// 	// startOnlineButton.style.visibility = 'visible';

		// 	// Clean up after starting the tournament
		// 	form.remove();
		// 	// animationFrameId = requestAnimationFrame(gameLoop);
		// 	playerNameContainer.remove();
		// 	startLocalTournament();

		// });

	};


	setupTournament();

	// Function to check for duplicate values in an array
	function hasDuplicates(array) {
		return (new Set(array)).size !== array.length;
	}



	function displayMenu() {
		const menuContainer = document.createElement('div');
		menuContainer.id = 'menu-container';

		// Fetch the list of online tournaments from the backend
		fetch('http://localhost:8000/api/tournaments')
			.then(response => response.json())
			.then(tournaments => {
				const tournamentList = document.createElement('ul');
				tournamentList.innerHTML = '<p>Online Tournaments:</p>';
				tournamentList.id = 'tourn-list';
				console.log(tournaments);
				tournaments.forEach(tournament => {
					const listItem = document.createElement('li');
					listItem.textContent = tournament.name;

					const joinButton = document.createElement('button');
					joinButton.textContent = 'Join';
					joinButton.addEventListener('click', () => joinTournament(tournament.name));

					listItem.appendChild(joinButton);
					tournamentList.appendChild(listItem);
				});

				menuContainer.appendChild(tournamentList);
			})
			.catch(error => console.error('Error fetching tournaments:', error));

		// Button to create a new tournament
		const createButton = document.createElement('button');
		createButton.textContent = 'Create New Tournament';
		createButton.addEventListener('click', createNewTournament);

		menuContainer.appendChild(createButton);

		// Append the menu to the document
		document.getElementsByClassName('window-frame')[0].appendChild(menuContainer);
	}

	function createNewTournament() {
		// Check if the input field already exists
		const inputField = document.getElementById('tournamentNameInput');
		if (inputField) {
			alert('Please enter a tournament name before creating a new tournament.');
			return;
		}

		// Create an input field for the tournament name
		const tournamentNameInput = document.createElement('input');
		tournamentNameInput.type = 'text';
		tournamentNameInput.id = 'tournamentNameInput';
		tournamentNameInput.placeholder = 'Enter tournament name';

		// Button to submit the tournament name
		const submitButton = document.createElement('button');
		submitButton.textContent = 'Submit';
		submitButton.id = 'submitButton';
		submitButton.addEventListener('click', () => submitTournament());

		// Append the input field and submit button next to the create button
		const menuContainer = document.getElementById('menu-container');
		menuContainer.appendChild(tournamentNameInput);
		menuContainer.appendChild(submitButton);
	}

	async function submitTournament() {
		const tournamentName = document.getElementById('tournamentNameInput').value;
		if (!tournamentName) {
			alert('Please enter a tournament name.');
			return;
		}

		// Perform logic to create a new tournament
		// You can make a POST request to the backend and handle the response
		await fetch(`/api/create_tournament/?name=${tournamentName}`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				// Include any necessary data for creating a tournament
				// (e.g., tournament name, settings, etc.)
			}),
		})
			.then(response => response.json())
			.then(data => {
				// Handle the response from the backend
				if (data.message === 'Please choose another tournament name') {
					alert('Please choose another tournament name');
				} else if (data.message === 'Tournament created successfully') {
					alert('Tournament created successfully');
				} else {
					console.error('Unexpected response:', data);
				}
			})
			.catch(error => console.error('Error creating tournament:', error));

		// Remove the input field and submit button after creating the tournament
		const tournamentNameInput = document.getElementById('tournamentNameInput');
		const submitButton = document.getElementById('submitButton');
		tournamentNameInput.parentNode.removeChild(tournamentNameInput);
		submitButton.remove();

		const tournamentList = document.getElementById('tourn-list');
		const listItem = document.createElement('li');
		listItem.textContent = tournamentName;

		const joinButton = document.createElement('button');
		joinButton.textContent = 'Join';
		joinButton.addEventListener('click', () => joinTournament(tournamentName));

		listItem.appendChild(joinButton);
		tournamentList.appendChild(listItem);
	}

	async function joinTournament(tournamentName) {
		// Perform logic to join the selected tournament
		// You can make an API call or update the game state accordingly
		console.log(`Joining tournament with name ${tournamentName}`);
		tournament_name = tournamentName;
		await fetch(`http://10.12.1.10:8090/api/join/?username=${localStorage.getItem('username')}&tournament_name=${tournamentName}`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				// Include any necessary data for creating a tournament
				// (e.g., tournament name, settings, etc.)
			}),
		})
			.then(response => response.json())
			.then(data => {
				// Handle the response from the backend
				if (data.message === 'Tournament joined successfully') {
					alert('Tournament joined successfully');

					//@TODO : Clear screen !
					const menuContainer = document.getElementById('menu-container');
					menuContainer.remove();
					startLocalButton.style.visibility = 'hidden';

					//@TODO : Display WAIT message
					document.getElementById("startOnlineTournButton").textContent = "Waiting for lobby to fill & tournament to start ..."

					//@TODO : Open socket
					initiateSocket();


				} else if (data.message === "Sorry ur late. tournament is full :/") {
					alert("Sorry ur late. tournament is full :/");
				} else if (data.message === "You are already in the tournament") {
					alert('idiot ur already in the damn tournament STOP CHANGING PAGES !!STAY HERE PRICK');

					//@TODO : Clear screen !
					const menuContainer = document.getElementById('menu-container');
					menuContainer.remove();
					startLocalButton.style.visibility = 'hidden';

					//@TODO : Display WAIT message
					document.getElementById("startOnlineTournButton").textContent = "Waiting for lobby to fill & tournament to start ..."
				}
				else {
					console.error('Failed to join tournament', data);
				}
			})
			.catch(error => console.error('Error joining tournament:', error));
	}


	function playOnlineTournamentMatch() {
		localPlayerMode = false;
		startLocalButton.disabled = true;
		startOnlineButton.disabled = true;
		if (isGameOver || !animationFrameId) {
			isGameOver = false;
			score.left = 0;
			score.right = 0;
			resetBall();
			animationFrameId = requestAnimationFrame(gameLoop);
		}
	}

	// startOnlineButton.addEventListener('click', () => {
	//     localPlayerMode = false;
	//     startLocalButton.disabled = true;
	//     startOnlineButton.disabled = true;
	//     console.log("YUUUUUU");

	//     displayMenu();
	// });

	function gameLoop() {
		update();
		draw();

		if (!isGameOver) {
			animationFrameId = requestAnimationFrame(gameLoop);
		}
	}

}




