// import {io} from "socket.io-client";
export const loadTournament = () => {

	let btnCounter = 0;
	const canvas = document.getElementById('pongCanvas');
	const ctx = canvas.getContext('2d');
	const startOnlineButton = document.getElementById('startOnlineTournButton');
	const startLocalButton = document.getElementById('startLocalTournButton');

	let localPlayerMode = true;
	let pairings;
	canvas.width = 800;
	canvas.height = 400;

	const paddle = { width: 10, height: 100, speed: 8 };
	const ball = { size: 10, x: canvas.width / 2, y: canvas.height / 2, speedX: 6, speedY: 6 };
	const score = { left: 0, right: 0 };
	const players = { left: (canvas.height - paddle.height) / 2, right: (canvas.height - paddle.height) / 2 };
	const keys = {};
	let isGameOver = false;
	let animationFrameId;

	let socketStatus = false;

	let keyPressed;
	let leftPlayer = false;
	let rightPlayer = true;

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
					'username': localStorage.getItem('username'),
					'key': keyPressed
				}))
			}
			if (keys['s'] && players.right < canvas.height - paddle.height) {
				players.right += paddle.speed;
				keyPressed = 's';
				gameSocket.send(JSON.stringify({
					'type': 'update',
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
					'username': localStorage.getItem('username'),
					'key': keyPressed
				}))
			}
			if (keys['s'] && players.left < canvas.height - paddle.height) {
				players.left += paddle.speed;
				keyPressed = 's';
				gameSocket.send(JSON.stringify({
					'type': 'update',
					'username': localStorage.getItem('username'),
					'key': keyPressed
				}))
			}
		}
	}


	function update() {
		console.log("helllo????");
		console.log(isGameOver);
		if (isGameOver) return;

		ball.x += ball.speedX;
		ball.y += ball.speedY;
		console.log("AAA");

		if (ball.y < ball.size || ball.y > canvas.height - ball.size) {
			ball.speedY *= -1;
		}
		console.log("BBB");
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

		if (score.left > score.right) {
			buttonText = "Left Player WINS! Press to play a new local game";
		} else {
			buttonText = "Right Player WINS! Press to play a new local game";
		}

		document.getElementById("startLocalButton").innerHTML = buttonText;
		isGameOver = true;
		socketStatus = false;
		leftPlayer = false;
		rightPlayer = true;
	}


	function handleOnlineWinner() {
		let buttonText;
		if ((rightPlayer && score.left >= 3) || (leftPlayer && score.right >= 3))
			buttonText = "You lose! Press to play a new online game";
		else {
			buttonText = "You win! Press to play a new online game";
			gameSocket.send(JSON.stringify({
				'type': 'end',
				'username': localStorage.getItem('username'),
				'score1': score.left,
				'score2': score.right,
			}))
		}
		document.getElementById("startOnlineButton").innerHTML = buttonText;
		gameSocket.close();
		isGameOver = true;
		socketStatus = false;
	}

	function checkForWinner() {

		if (score.left >= 3 || score.right >= 3) {
			isGameOver = true;
			btnCounter = 0;
			ctx.fillStyle = 'red';

			if (localPlayerMode)
				handleLocalWinner();
			else
				handleOnlineWinner();
			startOnlineButton.disabled = false;
			startLocalButton.disabled = false;

		}
	}

	document.addEventListener('keydown', (event) => {
		keys[event.key] = true;
	});

	document.addEventListener('keyup', (event) => {
		keys[event.key] = false;
	});

	let player_count = 0;
	let url = `ws://localhost:8000/ws/socket-server/`
	let gameSocket;

	function initiateSocket() {
		gameSocket = new WebSocket(url);

		gameSocket.onmessage = function (e) {
			let data = JSON.parse(e.data)
			console.log('Data: ', data)

			if (btnCounter == 0)
				return;
			if (data.type === 'start' && data["status"] == "start") {
				player_count = 2;
				document.getElementById("startOnlineButton").innerHTML = "In-game";
				if (data.sender != localStorage.getItem('username')) {
					rightPlayer = false;
					leftPlayer = true;
				}
				console.log(leftPlayer);
				console.log(rightPlayer);
				startOnlineButton.disabled = false;
				startOnlineButton.click();
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
	
	function playMatch() {
		startLocalButton.disabled = true;
		startLocalButton.style.visibility = 'hidden';

		startOnlineButton.disabled = true;
		startOnlineButton.style.visibility = 'hidden';

		localPlayerMode = true;
		if (isGameOver || !animationFrameId) {
			score.left = 0;
			score.right = 0;
			resetBall();
			animationFrameId = requestAnimationFrame(gameLoop);
		}
	}



	function startTournament() {
		// Assuming pairings is an array of arrays, where each inner array contains two player names
		let winners = [];
		startLocalButton.disabled = false;
		pairings.forEach((pairing, index) => {
			const player1 = pairing[0];
			const player2 = pairing[1];
			isGameOver = false;
			alert(`Match ${index + 1}: ${pairing[0]} vs ${pairing[1]}\n Press to start`);

			// Conduct the match between player1 and player2
			playMatch();
			// Display or handle the match result as needed
			console.log(`Match ${index + 1}: ${player1} vs ${player2} *** Result: ${score.left} - ${score.right}`);
			if (score.left > score.right)
				winners.push(player1);
			else
				winners.push(player2);
			alert(`Match ${index + 1}: ${player1} vs ${player2} *** Result: ${score.left} - ${score.right}`);

		});
		

		//final round:
		alert(`FINAL Match: ${winners[0]} vs ${winners[1]}\n Press to start`);
		playMatch();
		console.log(`FINAL Match: ${player1} vs ${player2} *** Result: ${score.left} - ${score.right}`);
		alert(`FINAL Match: ${player1} vs ${player2} *** Result: ${score.left} - ${score.right}`);
		// Additional logic after all matches are conducted
		console.log("Tournament completed!");
		
	}



	startLocalButton.addEventListener('click', () => {
		localPlayerMode = true;
		startLocalButton.disabled = true;
		startOnlineButton.disabled = true;

		 // Check if a form already exists and remove it
		 const existingForm = document.getElementById('tournamentSetupForm');
		 if (existingForm) {
			 existingForm.remove();
		 }
	 

		// Display a form to get the number of players and their names
		const formContainer = document.createElement('div');
		formContainer.innerHTML = `
			<form id="tournamentSetupForm">
				<label for="playerCount">Enter the number of players:</label>
				<input type="number" id="playerCount" name="playerCount" min="2" required>
				<button type="submit">Start Tournament</button>
			</form>
		`;

		document.getElementsByClassName('window-frame')[0].appendChild(formContainer);

		const tournamentSetupForm = document.getElementById('tournamentSetupForm');

		tournamentSetupForm.addEventListener('submit', (event) => {
			event.preventDefault();

			const playerCountInput = document.getElementById('playerCount');
			const playerCount = parseInt(playerCountInput.value, 10);

			if (isNaN(playerCount) || playerCount < 4 || playerCount % 2 !== 0 || playerCount > 100) {
				alert("Invalid input. Please enter a valid even number of players (minimum 4 & max 100).");
				return;
			}

			formContainer.remove(); // Remove the form once the input is collected

			// Now, create input fields for player names dynamically within the same form
			const playerNameContainer = document.createElement('div');
			playerNameContainer.innerHTML = `<p>Enter the names for ${playerCount} players:</p>`;

			const form = document.createElement('form');
			form.id = 'playerNamesForm';

			for (let i = 1; i <= playerCount; i++) {
				const label = document.createElement('label');
				label.textContent = `Player ${i}:`;

				const input = document.createElement('input');
				input.type = 'text';
				input.name = `player${i}`;
				input.required = true;

				playerNameContainer.appendChild(label);
				playerNameContainer.appendChild(input);
			}

			const beginTournButton = document.createElement('button');
			beginTournButton.type = 'submit';
			beginTournButton.innerHTML = 'Start Tournament';

			form.appendChild(playerNameContainer);
			form.appendChild(beginTournButton);
			document.getElementsByClassName('window-frame')[0].appendChild(form);

			form.addEventListener('submit', (event) => {
				event.preventDefault();

				const playerInputs = form.querySelectorAll(`input[name^="player"]`);
				const playerNames = Array.from(playerInputs).map(input => input.value);

				// Perform matchmaking logic (for demonstration, this is a simple random pairing)
				pairings = randomPairing(playerNames);

				// Create a list element to display pairings
				const resultsList = document.createElement('ul');
				resultsList.innerHTML = "<p>Matchmaking Results:</p>";

				pairings.forEach((pairing, index) => {
					const listItem = document.createElement('li');
					listItem.textContent = `Match ${index + 1}: ${pairing[0]} vs ${pairing[1]}`;
					resultsList.appendChild(listItem);
					// Perform additional actions with the pairings
				});

				// Append the list to the bottom of the page
				document.getElementsByClassName('window-frame')[0].appendChild(resultsList);

				// Clean up after starting the tournament
				form.remove();
				// animationFrameId = requestAnimationFrame(gameLoop);
				document.getElementsByClassName('window-frame')[0].removeChild(formContainer);
				playerNameContainer.remove();

			});
		});
		if(localPlayerMode)
			startTournament();
	});



	startOnlineButton.addEventListener('click', () => {
		localPlayerMode = false;
		startLocalButton.disabled = true;
		startOnlineButton.disabled = true;
		leftPlayer = true;
		console.log("YUUUUUU");
		if (btnCounter == 0) {
			initiateSocket();
			document.getElementById("startOnlineButton").innerHTML = "Waiting for second player ..."
			console.log("first press - ready to play!");
			btnCounter = btnCounter + 1;
			return;
		}

		if (isGameOver || !animationFrameId) {
			startOnlineButton.disabled = true;
			isGameOver = false;
			score.left = 0;
			score.right = 0;
			resetBall();
			animationFrameId = requestAnimationFrame(gameLoop);
		}
	});

	function gameLoop() {
		update();
		draw();
		if (!isGameOver) {
			animationFrameId = requestAnimationFrame(gameLoop);
		}
	}
	// startLocalButton.click();
	// startTournament();
}


