
export const loadGame = () => {

	const canvas = document.getElementById('pongCanvas');
	const ctx = canvas.getContext('2d');
	const startButton = document.getElementById('startButton');

	canvas.width = window.innerWidth / 2;
	canvas.height = window.innerWidth / 2;

	const paddle = { width: 10, height: 100, speed: 4 };
	console.log(Math.random());
	const ball = { size: 10, x: canvas.width / 2, y: canvas.height / 2, speedX: 6, speedY: 6 };
	const score = { left: 0, right: 0 };
	const players = { left: (canvas.height - paddle.height) / 2, right: (canvas.height - paddle.height) / 2 };
	const keys = {};
	let isGameOver = false;
	let animationFrameId;

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

		if (keys['ArrowUp'] && players.right > 0) players.right -= paddle.speed;
		if (keys['ArrowDown'] && players.right < canvas.height - paddle.height) players.right += paddle.speed;
		if (keys['w'] && players.left > 0) players.left -= paddle.speed;
		if (keys['s'] && players.left < canvas.height - paddle.height) players.left += paddle.speed;

		if (ball.x < 0 || ball.x > canvas.width) {
			ball.x > canvas.width ? score.left++ : score.right++;
			resetBall();
			checkForWinner();
		}
	}

	function resetBall() {
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		ball.speedX *= -1;
	}

	function checkForWinner() {
		if (score.left >= 3 || score.right >= 3) {
			isGameOver = true;
			ctx.fillStyle = 'red';
			ctx.fillText(score.left >= 3 ? "Left Player Wins!" : "Right Player Wins!", canvas.width / 2 - 100, canvas.height / 2);
			startButton.disabled = false;
		}
	}

	document.addEventListener('keydown', (event) => {
		keys[event.key] = true;
	});

	document.addEventListener('keyup', (event) => {
		keys[event.key] = false;
	});

	startButton.addEventListener('click', () => {
		if (isGameOver || !animationFrameId) {
			isGameOver = false;
			score.left = 0;
			score.right = 0;
			resetBall();
			animationFrameId = requestAnimationFrame(gameLoop);
			startButton.disabled = true;
		}
	});

	function gameLoop() {
		update();
		draw();
		if (!isGameOver) {
			animationFrameId = requestAnimationFrame(gameLoop);
		}
	}
}
