export function loadGame(localPlayerMode) {

	let isGameOver = false;

	let lastTimestamp = 0;
	const maxFrameRate = 60;
	const frameInterval = 1000 / maxFrameRate;
	let btnCounter = 0;
	const canvas = document.getElementById('gameCanvas');
	console.log("ayyy");
	const ctx = canvas.getContext('2d');

	const paddle = { width: canvas.width / 50, height: canvas.width / 50 * 8, speed: canvas.width / 100 };
	const ball = { size: canvas.width / 100, x: canvas.width / 2, y: canvas.height / 2, speedX: canvas.width / 150, speedY: canvas.width / 150 };
	const score = { left: 0, right: 0 };
	const players = { left: (canvas.height - paddle.height) / 2, right: (canvas.height - paddle.height) / 2 };
	const keys = {};

	function resetGame(params) {

		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		score.left = 0;
		score.right = 0;
		players.left = (canvas.height - paddle.height) / 2;
		players.right = (canvas.height - paddle.height) / 2;
	}

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
		ctx.font = (canvas.width * 0.08) + 'px ArgentPixel';
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
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

		// Collision detection with paddles
		let paddleLeftEdgeX = 0;
		let paddleRightEdgeX = canvas.width - paddle.width;
		// Check collision with left paddle
		if (ball.x - ball.size < paddleLeftEdgeX + paddle.width &&
			ball.y + ball.size > players.left &&
			ball.y - ball.size < players.left + paddle.height) {
			// Adjust the ball's X position to prevent it from going inside the paddle
			ball.x = paddleLeftEdgeX + paddle.width + ball.size;
			ball.speedX *= -1;
		}
		// Check collision with right paddle
		if (ball.x + ball.size > paddleRightEdgeX &&
			ball.y + ball.size > players.right &&
			ball.y - ball.size < players.right + paddle.height) {
			// Adjust the ball's X position to prevent it from going inside the paddle
			ball.x = paddleRightEdgeX - ball.size;
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
			draw();
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
		let winnerMsg;

		if (score.left > score.right) {
			winnerMsg = "Left Player WINS! Press to play a new local game";
		} else {
			winnerMsg = "Right Player WINS! Press to play a new local game";
		}

		ctx.font = (canvas.width * 0.08) + 'px ArgentPixel';
		ctx.textAlign = "center";
		ctx.textBaseline = "center";
		ctx.fillText(winnerMsg, canvas.width / 2, canvas.height / 2, canvas.width);
		isGameOver = true;
		socketStatus = false;
		leftPlayer = true;
		rightPlayer = false;
	}


	function handleOnlineWinner() {
		let winnerMsg;
		if ((rightPlayer && score.left >= 3) || (leftPlayer && score.right >= 3))
			winnerMsg = "You lose! Press to play a new online game";
		else {
			winnerMsg = "You win! Press to play a new online game";
			gameSocket.send(JSON.stringify({
				'type': 'end',
				'mode': 'single',
				'username': localStorage.getItem('username'),
				'score1': score.left,
				'score2': score.right,
			}))
		}
		ctx.font = (canvas.width * 0.08) + 'px ArgentPixel';
		ctx.textAlign = "center";
		ctx.textBaseline = "center";
		ctx.fillText(winnerMsg, canvas.width / 2, canvas.height / 2, canvas.width);

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
	let animationFrameId;
	// let url = `wss://10.12.1.10:8090/ws/socket-server/`;
	let url = `wss://localhost:8090/ws/socket-server/`;

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
				startGame();

				if (data.sender == localStorage.getItem('username')) {
					leftPlayer = false;
					rightPlayer = true;
				}
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
				isGameOver = true;
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

	function gameLoop(timestamp) {
		const elapsed = timestamp - lastTimestamp;
		// console.log(timestamp);

		if (elapsed >= (frameInterval / 2)) {
			draw();
			update();
			lastTimestamp = timestamp;
			if (isGameOver)
				return;
			requestAnimationFrame(gameLoop);
		}
	}

	function startGame() {
		if (localPlayerMode) {
			if (isGameOver || !animationFrameId) {
				isGameOver = false;
				score.left = 0;
				score.right = 0;
				resetBall();
				animationFrameId = requestAnimationFrame(gameLoop);
			}
		}
		else {
			if (btnCounter == 0) {
				initiateSocket();
				console.log("first press - ready to play!");
				btnCounter = btnCounter + 1;
				return;
			}

			if (isGameOver || !animationFrameId) {
				isGameOver = false;
				score.left = 0;
				score.right = 0;
				resetBall();
				animationFrameId = requestAnimationFrame(gameLoop);
			}
		}
	}

	startGame();
}




export default {
	loadGame: loadGame
};