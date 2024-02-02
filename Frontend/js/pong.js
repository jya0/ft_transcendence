import { hideModal, loadModalMenu, loadSpinner, modalMenuDisposeEvent, showGameWinner, showModal } from "./loadComponent.js";
import { urlLocationHandler } from "./url-router.js"

let continueExecution = true;
let gameSocket = "";
let user_name = "";
let player1 = "";
let player2 = "";
export function loadGame(username, localPlayerMode) {
    const docModalGame = document.getElementById('modalGame');
    const canvas = document.getElementById('gameCanvas');
    if (!docModalGame || !canvas)
        return;
    let player1 = username;
    user_name = username;
    let player2 = "";
    let isGameOver = true;
    continueExecution = true;
    let lastTimestamp = 0;
    const maxFrameRate = 60;
    const frameInterval = 1000 / maxFrameRate;
    let btnCounter = 0;
    const ctx = canvas.getContext('2d');

    const paddle = { width: canvas.width / 100, height: canvas.width / 100 * 8, speed: canvas.width / 100 };
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
        lastTimestamp = 0;
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
        ctx.font = (canvas.width * 0.02) + 'px ArgentPixel';
        if (localPlayerMode) {
            player2 = "guest";
        }
        if (leftPlayer) {
            ctx.fillText(player1, canvas.width / 4, canvas.height / 5);
            ctx.fillText(player2, 3 * canvas.width / 4, canvas.height / 5);
        }
        else {
            ctx.fillText(player2, canvas.width / 4, canvas.height / 5);
            ctx.fillText(player1, 3 * canvas.width / 4, canvas.height / 5);
        }

    }

    function updateBackend() {
        if (rightPlayer) {
            if (keys['w'] && players.right > 0) {
                players.right -= paddle.speed;
                keyPressed = 'w';
                gameSocket.send(JSON.stringify({
                    'game': 'pong',
                    'type': 'update',
                    'mode': 'single',
                    'player1': player1,
                    'player2': player2,
                    'username': username,
                    'key': keyPressed,
                }))
            }
            if (keys['s'] && players.right < canvas.height - paddle.height) {
                players.right += paddle.speed;
                keyPressed = 's';
                gameSocket.send(JSON.stringify({
                    'game': 'pong',
                    'type': 'update',
                    'player1': player1,
                    'player2': player2,
                    'mode': 'single',
                    'username': username,
                    'key': keyPressed
                }))
            }
        }
        else {
            if (keys['w'] && players.left > 0) {
                players.left -= paddle.speed;
                keyPressed = 'w';
                gameSocket.send(JSON.stringify({
                    'game': 'pong',
                    'type': 'update',
                    'player1': player1,
                    'player2': player2,
                    'mode': 'single',
                    'username': username,
                    'key': keyPressed
                }))
            }
            if (keys['s'] && players.left < canvas.height - paddle.height) {
                players.left += paddle.speed;
                keyPressed = 's';
                gameSocket.send(JSON.stringify({
                    'game': 'pong',
                    'type': 'update',
                    'player1': player1,
                    'player2': player2,
                    'mode': 'single',
                    'username': username,
                    'key': keyPressed
                }))
            }
        }
    }

    async function update() {
        if (isGameOver) return;
        // document.dispatchEvent(modalMenuDisposeEvent);
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
            resetBall();
            await checkForWinner();
            return;
        }
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speedX *= -1;
    }


    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function handleLocalWinner() {
        let winner;

        if (score.left > score.right) {
            winner = player1;
        } else {
            winner = "Guest";
        }

        isGameOver = true;
        socketStatus = false;
        leftPlayer = true;
        rightPlayer = false;
        showGameWinner(winner);
        window.history.pushState({}, "", '/play');
        urlLocationHandler();
        return;
    }


    async function handleOnlineWinner() {
        let winnerMsg;
        let winner;
        if ((rightPlayer && score.left >= 3) || (leftPlayer && score.right >= 3)) {
            winner = player2;
            winnerMsg = ` ${winner} |
            Sorry You lose!`;
        }
        else {
            winner = player1;
            winnerMsg = ` ${winner} |
            Congrats You won!`;
            gameSocket.send(JSON.stringify({
                'game': 'pong',
                'type': 'end',
                'mode': 'single',
                'player1': player1,
                'player2': player2,
                'username': winner,
                'score1': score.left,
                'score2': score.right,
            }))
        }
        if (gameSocket !== "")
            gameSocket.close();
        gameSocket = "";
        isGameOver = true;
        socketStatus = false;
        showGameWinner(winnerMsg);
        window.history.pushState({}, "", '/play');
        urlLocationHandler();
    }

    async function checkForWinner() {

        if (score.left >= 3 || score.right >= 3) {
            isGameOver = true;
            btnCounter = 0;
            ctx.fillStyle = 'red';

            if (localPlayerMode)
                await handleLocalWinner();
            else
                await handleOnlineWinner();
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
    let url = `wss://10.13.1.12:9090/ws/socket-server/`;
    // let url = `wss://10.13.1.12:9090/ws/socket-server/`;


    async function initiateSocket() {
        gameSocket = new WebSocket(url);

        gameSocket.onmessage = function (e) {
            let data = JSON.parse(e.data)

            if (btnCounter == 0)
                return;

            if (data.game === 'tic')
                return;
            if (data.type === 'terminate' && (data.player1 == user_name || data.player2 == user_name)) {
                if (gameSocket !== "") {
                    gameSocket.close();
                }
                gameSocket = "";
                isGameOver = true;
                socketStatus = false;
                continueExecution = false;
                showGameWinner(' You Win!');
                window.history.pushState({}, "", '/play');
                urlLocationHandler();
                return;
            }

            if (data.player1 != username && data.player2 != username)
                return;
            if (data.type === 'start' && data["status"] == "start") {
                player_count = 2;
                // loadSpinner("modalGameBody", "text-black");
                if (data["player2"] == user_name)
                    player2 = data["player1"];
                else
                    player2 = data["player2"];
                startGame();

                if (data.sender == username) {
                    leftPlayer = false;
                    rightPlayer = true;
                }
            }

            if (data.sender == username)
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
            else if (data.type === 'terminate' && (data.player1 == user_name || data.player2 == user_name)) {
                if (gameSocket !== "") {
                    gameSocket.close();
                }
                gameSocket = "";
                isGameOver = true;
                socketStatus = false;
                continueExecution = false;
                showGameWinner(' You Win!');
                window.history.pushState({}, "", '/play');
                urlLocationHandler();
                return;
            }
            else if (data.type === 'close') {
                isGameOver = true;
                player_count = 1;
                if (gameSocket !== "") {
                    gameSocket.close();
                }
            }
            else {
            }
        }

        gameSocket.addEventListener("open", (event) => {
            if (socketStatus == true)
                return
            socketStatus = true;

            gameSocket.send(JSON.stringify({
                'game': 'pong',
                'type': 'start',
                'mode': 'single',
                'username': username
            }))

            player_count = 1;

            loadModalMenu("modalMenu", "");
            loadSpinner("modalMenuBody", "text-black");
            showModal("modalMenu");
        });
        player_count = 1;
    }

    async function gameLoop(timestamp) {
        // document.dispatchEvent(modalMenuDisposeEvent);

        window.addEventListener('beforeunload', function (event) {

            if (gameSocket !== "" && player2 != "") {
                // Call the closePong1v1Socket function to terminate the game
                closePong1v1Socket();
                showGameWinner('You lose!');
                window.history.pushState({}, "", '/play');
                urlLocationHandler();
                // Display a custom message (some browsers may not support this)
                event.returnValue = 'Are you sure you want to leave?';
            }
        });
        if (continueExecution == false)
            return;
        const elapsed = timestamp - lastTimestamp;

        if (elapsed == 0 || elapsed >= (frameInterval / 2)) {
            document.dispatchEvent(modalMenuDisposeEvent);
            draw();
            await update();
            lastTimestamp = timestamp;
            if (isGameOver)
                return;
            requestAnimationFrame(gameLoop);
        }
    }

    async function startGame() {
        if (localPlayerMode) {
            if (isGameOver || !animationFrameId) {
                isGameOver = false;
                score.left = 0;
                score.right = 0;
                resetBall();
                animationFrameId = requestAnimationFrame(gameLoop);
                canvas.dataset.animationFrameId = animationFrameId;
            }
        }
        else {
            if (btnCounter == 0) {
                initiateSocket();
                btnCounter = btnCounter + 1;
                return;
            }
            if (isGameOver || !animationFrameId) {
                isGameOver = false;
                score.left = 0;
                score.right = 0;
                resetBall();
                // await delay(3000);


                animationFrameId = requestAnimationFrame(gameLoop);
                //TODO
                canvas.dataset.animationFrameId = animationFrameId;
            }
        }
    }

    startGame();
    // Add an event listener for beforeunload

    // Rest of your existing code...

}

// Function to stop the execution from the outside
export function stopPongExecution() {
    continueExecution = false;
}

export function closePong1v1Socket() {
    if (gameSocket === "")
        return;
    gameSocket.send(JSON.stringify({
        'game': 'pong',
        'type': 'terminate',
        'player1': player1,
        'player2': player2,
        'mode': 'single',
        'sender': user_name,
    }))
    if (gameSocket !== "") {
        gameSocket.close();
    }
    gameSocket = "";
}

export default {
    loadGame: loadGame,
    stopPongExecution: stopPongExecution,
    closePong1v1Socket: closePong1v1Socket
};
