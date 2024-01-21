// import {io} from "socket.io-client";
export const loadGame = () => {
	let lastTimestamp = 0;
	const maxFrameRate = 60;
	const frameInterval = 1000 / maxFrameRate;
	let btnCounter = 0;
	const canvas = document.getElementById('pongCanvas');
	const ctx = canvas.getContext('2d');
	const startOnlineButton = document.getElementById('startOnlineButton');
	const startLocalButton = document.getElementById('startLocalButton');

	let localPlayerMode = false;
	canvas.width = 800;
	canvas.height = 400;

	const paddle = { width: 10, height: 100, speed: 8 };
	const ball = { size: 10, x: canvas.width / 2, y: canvas.height / 2, speedX: 6, speedY: 6 };
	const score = { left: 0, right: 0 };
	const players = { left: (canvas.height - paddle.height) / 2, right: (canvas.height - paddle.height) / 2 };
	const keys = {};


	function resetGame(params) {
		paddle.width = 10;
		paddle.height = 100;
		paddle.speed = 8;

		ball.x = canvas.width /2;
		ball.y = canvas.height /2;
		ball.speedX = 6;
		ball.speedY = 6;ws
		score.left = 0;
		score.right = 0;
		players.left = (canvas.height - paddle.height) / 2;
		players.right = (canvas.height - paddle.height) / 2;
	}


	let isGameOver = false;
	let animationFrameId;

	let socketStatus = false;

	let keyPressed;
	let leftPlayer = true;
	let rightPlayer = false;


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
					'mode': 'single',
					'username': localStorage.getItem('username'),
					'key': keyPressed,
				}))
			}
			if (keys['s'] && players.right < canvas.height - paddle.height) {
				players.right += paddle.speed;
				keyPressed = 's';
				gameSocket.send(JSON.stringify({
					'type': 'update',
					'mode': 'single',
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
					'mode': 'single',
					'username': localStorage.getItem('username'),
					'key': keyPressed
				}))
			}
			if (keys['s'] && players.left < canvas.height - paddle.height) {
				players.left += paddle.speed;
				keyPressed = 's';
				gameSocket.send(JSON.stringify({
					'type': 'update',
					'mode': 'single',
					'username': localStorage.getItem('username'),
					'key': keyPressed
				}))
			}
		}
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

		if (score.left > score.right) {
			buttonText = "Left Player WINS! Press to play a new local game";
		} else {
			buttonText = "Right Player WINS! Press to play a new local game";
		}

		document.getElementById("startLocalButton").innerHTML = buttonText;
		isGameOver = true;
		socketStatus = false;
		leftPlayer = true;
		rightPlayer = false;
	}


	function handleOnlineWinner() {
		let buttonText;
		if ((rightPlayer && score.left >= 3) || (leftPlayer && score.right >= 3))
			buttonText = "You lose! Press to play a new online game";
		else {
			buttonText = "You win! Press to play a new online game";
			gameSocket.send(JSON.stringify({
				'type': 'end',
				'mode': 'single',
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
			startLocalButton.style.visibility = 'visible';
			startOnlineButton.style.visibility = 'visible';
			resetGame();
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
			// console.log('Data: ', data)

			if (btnCounter == 0)
				return;
			if (data.type === 'start' && data["status"] == "start") {
				player_count = 2;
				document.getElementById("startOnlineButton").innerHTML = "In-game";
				if (data.sender == localStorage.getItem('username')) {
					leftPlayer = false;
					rightPlayer = true;
				}
				console.log(leftPlayer);
				console.log(rightPlayer);
				startOnlineButton.disabled = false;
				startOnlineButton.click();
			}

			if (data.sender == localStorage.getItem('username'))
				return;

			if (data.type == 'update') {
			if (isGameOver) return;

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
				'mode': 'single',
				'username': localStorage.getItem('username')
			}))

			player_count = 1;

			console.log("waiting for a second player...")
		});
		player_count = 1;
	}


	startLocalButton.addEventListener('click', () => {
		localPlayerMode = true;
		startLocalButton.disabled = true;
		startOnlineButton.disabled = true;
		startLocalButton.style.visibility = 'hidden';
		startOnlineButton.style.visibility = 'hidden';

		if (isGameOver || !animationFrameId) {
			isGameOver = false;
			score.left = 0;
			score.right = 0;
			resetBall();
			animationFrameId = requestAnimationFrame(gameLoop);
		}
	});

	startOnlineButton.addEventListener('click', () => {
		localPlayerMode = false;
		startLocalButton.disabled = true;
		startOnlineButton.disabled = true;
		startLocalButton.style.visibility = 'hidden';

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
	function gameLoop(timestamp) {
		const elapsed = timestamp - lastTimestamp;

		if (elapsed > frameInterval) {
			update(elapsed);
			draw();
			lastTimestamp = timestamp - (elapsed % frameInterval);
		}

		requestAnimationFrame(gameLoop);

	}
	// Add this function to print player locations
	function printPlayerLocations() {
		console.log('Player Locations - Left:', players.left, 'Right:', players.right);
	}

	// Call this function at regular intervals (e.g., every second)
	setInterval(printPlayerLocations, 1000); // Adjust the interval as needed


}




