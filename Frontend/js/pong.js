// import {io} from "socket.io-client";
export const loadGame = () => {

	let btnCounter = 0;
	const canvas = document.getElementById('pongCanvas');
	const ctx = canvas.getContext('2d');
	const startButton = document.getElementById('startButton');

	canvas.width = 800;
	canvas.height = 400;

	const paddle = { width: 10, height: 100, speed: 4 };
	const ball = { size: 10, x: canvas.width / 2, y: canvas.height / 2, speedX: 4, speedY: 4 };
	const score = { left: 0, right: 0 };
	const players = { left: (canvas.height - paddle.height) / 2, right: (canvas.height - paddle.height) / 2 };
	const keys = {};
	let isGameOver = false;
	let animationFrameId;

	let socketStatus = false;

	let keyPressed;

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
		
		if (keys['w'] && players.left > 0){
			players.left -= paddle.speed;
			keyPressed = 'w';
			chatSocket.send(JSON.stringify({
				'type':'update',
				'username': localStorage.getItem('username'),
				'key':keyPressed
			}))
		}
		if (keys['s'] && players.left < canvas.height - paddle.height) {
			players.left += paddle.speed;
			keyPressed = 's';
			chatSocket.send(JSON.stringify({
				'type':'update',
				'username': localStorage.getItem('username'),
				'key': keyPressed
			}))
		}
		// if (keys['w'] && players.left > 0) players.left -= paddle.speed;
		// if (keys['s'] && players.left < canvas.height - paddle.height) players.left += paddle.speed;

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





	let player_count = 0;
	let url = `ws://10.12.4.7:8000/ws/socket-server/`

	const chatSocket = new WebSocket(url)

	chatSocket.addEventListener("open", (event) => {
		if (socketStatus == true)
			return
		socketStatus = true;

		chatSocket.send(JSON.stringify({
			'type':'start',
			'username': localStorage.getItem('username')
		}))
		
		player_count = 1;

		console.log("waiting for a second player...")
	});

	// chatSocket.addEventListener("error", (errorEvent) => {
	// 	console.error("WebSocket error:", errorEvent);
	// 	// Handle the error gracefully here
	// 	// Set gameOver to true or take appropriate actions
	// 	// gameOver = true;
	//   });
	  
	//   chatSocket.addEventListener("close", (closeEvent) => {
	// 	console.log("WebSocket closed:", closeEvent);
	// 	// Handle the WebSocket close event here
	// 	// Set gameOver to true or take appropriate actions
	// 	// gameOver = true;
	//   });
	  
	 
	//   window.addEventListener("beforeunload", function (e) {
	// 	var confirmationMessage = "\AYYOO WHAT AR U DOING U WANNA LOSE?????/";
	  
	// 	(e || window.event).returnValue = confirmationMessage; //Gecko + IE
	// 	chatSocket.send(JSON.stringify({
	// 		'type':'close',
	// 		'username': localStorage.getItem('username')
	// 	}))
	// 	return confirmationMessage;                            //Webkit, Safari, Chrome
	//   });




	chatSocket.onmessage = function (e) {
		let data = JSON.parse(e.data)
		console.log('Data: ', data)

		if (btnCounter != 0 && data.type === 'start' && data.sender != localStorage.getItem('username')&& data["status"] == "start") {
			player_count = player_count + 1;
			// document.getElementById("startButton").innerHTML = "Second player found. Press to begin";
			startButton.click();
		}
		else if(data.type == 'update') {
			if (data['sender'] == localStorage.getItem('username'))
				return ;
			if (data['key']=='w' && players.right > 0) players.right -= paddle.speed;
			if (data['key'] =='s' && players.right < canvas.height - paddle.height) players.right += paddle.speed;
		}
		else if(data.type == 'close') {
			gameOver = true;
			player_count = 1;
			chatSocket.close();
		}
		else {
			console.log("woops not yet...")
		}
	}
	startButton.click();
	startButton.addEventListener('click', () => {
		btnCounter = btnCounter + 1;

		if (player_count == 1) {
			// document.getElementById("startButton").innerHTML = "Waiting for second player ..."
			return;
		}

		if (isGameOver || !animationFrameId) {
			isGameOver = false;
			score.left = 0;
			score.right = 0;
			resetBall();

			// if (player_count == 1) {
			// 	console.log("still waiting for a second player...")
			// 	return;
			// }
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
