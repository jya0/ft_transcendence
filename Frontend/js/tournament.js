// import {io} from "socket.io-client";
import { loadLoginPage, modalMenuDisposeEvent, getCookie, loadModal, loadModalMenu, showGameWinner, loadToast, showModal, hideModal, TM_BRACKET } from "./loadComponent.js";
import { urlLocationHandler } from "./url-router.js"
import { querySelectIdEditInnerHTML, checkName, elementIdEditInnerHTML } from "./utility.js";

let continueExecution = true;
let gameSocket = "";
let user_name = "";

let LOGIN_PAGE_HTML = '';

await fetch('/components/login.html').then(response => response.text()).then(data => {
    LOGIN_PAGE_HTML = data;
});


export function loadTournament(username, localPlayerMode) {
    const canvas = document.getElementById('gameCanvas');
    const docModalGame = document.getElementById('modalGame');
    let player1 = username;
    user_name = username;
    let player2 = "";
    let semiFinal = true;
    if (!canvas || !docModalGame)
        return;
    let round = "semifinal";
    continueExecution = true;
    let tournament_name;
    let lastTimestamp = 0;
    const maxFrameRate = 60;
    const frameInterval = 1000 / maxFrameRate;
    const ctx = canvas.getContext('2d');

    // let localPlayerMode = true;
    let localCurrentPair = [];
    let pairings = [];
    let winners = [];

    const paddle = { width: canvas.width / 75, height: canvas.width / 75 * 8, speed: canvas.width / 100 };
    const ball = { size: canvas.width / 100, x: canvas.width / 2, y: canvas.height / 2, speedX: canvas.width / 150, speedY: canvas.width / 150 };
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
        ctx.font = (canvas.width * 0.08) + 'px ArgentPixel';
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(score.left, canvas.width / 4, 50);
        ctx.fillText(score.right, 3 * canvas.width / 4, 50);
        if (!localPlayerMode) {
            // if (leftPlayer) {
            ctx.fillText(player1, canvas.width / 4, canvas.height / 5);
            ctx.fillText(player2, 3 * canvas.width / 4, canvas.height / 5);
            // }
            // else {
                // ctx.fillText(player2, canvas.width / 4, canvas.height / 5);
                // ctx.fillText(player1, 3 * canvas.width / 4, canvas.height / 5);
            // }
        }
        ctx.font = (canvas.width * 0.02) + 'px ArgentPixel';
        if (localPlayerMode === true) {
            ctx.fillText(localCurrentPair[0], canvas.width / 4, canvas.height / 5);
            ctx.fillText(localCurrentPair[1], 3 * canvas.width / 4, canvas.height / 5);
        }
    }

    function updateBackend() {
        if (rightPlayer) {
            if (keys['w'] && players.right > 0) {
                players.right -= paddle.speed;
                keyPressed = 'w';
                gameSocket.send(JSON.stringify({
                    'type': 'update',
                    'game': 'pong',
                    'mode': 'tournament',
                    'round': round,
                    'player1':player1,
                    'player2':player2,
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
                    'game': 'pong',
                    'player1':player1,
                    'player2':player2,
                    'round': round,
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
                    'game': 'pong',
                    'player1':player1,
                    'player2':player2,
                    'round': round,

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
                    'game': 'pong',
                    'player1':player1,
                    'player2':player2,
                    'round': round,

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
        lastTimestamp = 0;
    }


    async function update() {
        if (isGameOver) return;

        ball.x += ball.speedX;
        ball.y += ball.speedY;

        if (ball.y < ball.size || ball.y > canvas.height - ball.size) {
            ball.speedY *= -1;
        }

        // if (ball.x < paddle.width && ball.y > players.left && ball.y < players.left + paddle.height ||
        //     ball.x > canvas.width - paddle.width && ball.y > players.right && ball.y < players.right + paddle.height) {
        //     ball.speedX *= -1;
        // }
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

    async function handleLocalWinner() {
        let buttonText;

        if (tournReady == false)
            return;

        if (!continueExecution)
            return;
        //show results
        if (g_count != 2) {

            // console.log(`Match ${g_count + 1}: ${pairings[g_count][0]} vs ${pairings[g_count][1]} *** Result: ${score.left} - ${score.right}`);
        }

        //update winners
        if (g_count == 0 || g_count == 1) {
            winners.push(getWinner(score, pairings[g_count][0], pairings[g_count][1]));
            winners.reverse();
            console.log("winners: ", winners);
        }
        // if (score)

        // resetGame();
        //reset
        isGameOver = false;
        socketStatus = false;
        leftPlayer = true;
        rightPlayer = false;
        score.left = 0;
        score.right = 0;
        resetBall();


        //prompt new match
        if (g_count == 0) {
            //@todo - show bracket
            // docModalGame.querySelector('#winner-p1').innerHTML = winners[0];
            querySelectIdEditInnerHTML(docModalGame, "winner-p1", winners[0]);
            toggleHighlight("tPlayer1Highlight");
            toggleHighlight("tPlayer2Highlight");
            toggleHighlight("tPlayer3Highlight");
            toggleHighlight("tPlayer4Highlight");
            showModal("modalGame");
            isGameOver = true;
            updateLocalPlayerDisplay(pairings[1][0], pairings[1][1]);
            await delay(4000);
            hideModal("modalGame");
            isGameOver = false;
            resetGame();
        }
        if (g_count == 1) {
            //@todo - show bracket
            // docModalGame.querySelector('#winner-p2').innerHTML = winners[1];
            querySelectIdEditInnerHTML(docModalGame, "winner-p2", winners[1]);
            toggleHighlight("tPlayer3Highlight");
            toggleHighlight("tPlayer4Highlight");
            toggleHighlight("tWinnerP1Highlight");
            toggleHighlight("tWinnerP2Highlight");
            showModal("modalGame");
            isGameOver = true;
            updateLocalPlayerDisplay(winners[0], winners[1]);
            await delay(4000);
            hideModal("modalGame");

            isGameOver = false;
            resetGame();
        }
        // end tournament
        if (g_count == 2) {
            tournReady = false;
            let champion = getWinner(score, winners[1], winners[0]);
            g_count = 0;
            tournReady = false;
            isGameOver = true;
            // docModalGame.querySelector('#winner-final').innerHTML = champion;
            querySelectIdEditInnerHTML(docModalGame, "winner-final", champion);
            toggleHighlight("tWinnerP1Highlight");
            toggleHighlight("tWinnerP2Highlight");
            toggleHighlight("tWinnerHighlight");
            showGameWinner(champion);
            window.history.pushState({}, "", '/play');
            urlLocationHandler();
            return;
            //@todo - show bracket
        }
        else
            g_count++;
    }

    function getWinner(scoreObj, playerLeft, playerRight) {
        return (scoreObj.left > scoreObj.right ? playerLeft : playerRight);
    }

    async function handleOnlineWinner() {
        console.log("sup mfs");
        let winnerMsg;
        let winner;
        console.log("leftPlayer = " + leftPlayer)
        console.log("rightPlayer = " + rightPlayer)

        if (tournReady == false)
            return;

        if (!continueExecution)
            return;



        if (g_count == 0) {
            // querySelectIdEditInnerHTML(docModalGame, "winner-p1", winners[0]);
            // toggleHighlight("tPlayer1Highlight");
            // toggleHighlight("tPlayer2Highlight");
            // toggleHighlight("tPlayer3Highlight");
            // toggleHighlight("tPlayer4Highlight");
            // showModal("modalGame");
            console.log("player 1 = " + player1)
            console.log("player 2 = " + player2)

            winner = getWinner(score, player1, player2);
            console.log("winner = " + winner);
            if (winner === user_name) {
                gameSocket.send(JSON.stringify({
                    'game': 'pong',
                    'type': 'end',
                    'mode': 'tournament',
                    'player1':player1,
                    'player2':player2,
                    'round': round,

                    'tournament_name': tournament_name,
                    'username': winner,
                    'score1': score.left,
                    'score2': score.right,
                }));
            }
            round = "final";
            isGameOver = true;
            // updateLocalPlayerDisplay(pairings[1][0], pairings[1][1]);
            await delay(4000).then(() => {
                isGameOver = false;
                resetGame();
                gameSocket.close();
                gameSocket = "";
                isGameOver = true;
                socketStatus = false;
                if (winner === user_name)
                {
					showModal("modalGame");
					// await delay(4000);
					hideModal("modalGame");
                    initiateSocket();
                }
                else {
                    showGameWinner(`TBA - Sorry you lost your chance. Please try again later`);
                    window.history.pushState({}, "", '/play');
                    urlLocationHandler();
                    hideModal("modalGame");
                }
            }
            );
            // hideModal("modalGame");

        }
        if (g_count == 1) {
            tournReady = false;
            let champion = getWinner(score, winners[1], winners[0]);
            g_count = 0;
            tournReady = false;
            isGameOver = true;

			elementIdEditInnerHTML("winner-final", champion);
			showModal("modalGame");
            showGameWinner(champion);
            window.history.pushState({}, "", '/play');
            urlLocationHandler();
			hideModal("modalGame");
            return;
        }
        else
            g_count++;
    }

    async function checkForWinner() {

        if (score.left >= 3 || score.right >= 3) {
            isGameOver = true;
            ctx.fillStyle = 'red';
            if (localPlayerMode)
                await handleLocalWinner();
            else
                await handleOnlineWinner();
        }
    }

    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });

    let player_count = 0;
    // let url = `wss://10.11.6.2:9090/ws/socket-server/`
    let url = `wss://10.11.6.2:9090/ws/socket-server/`;

    // let gameSocket;

    function initiateSocket() {
		document.dispatchEvent(modalMenuDisposeEvent);
        gameSocket = new WebSocket(url);
        gameSocket.onmessage = function (e) {
            let data = JSON.parse(e.data)
            console.log('Data: ', data)

            if (data.mode === 'single')
                return;
            if (data.game === 'tic')
                return;
            if (data.player1 != user_name && data.player2 != user_name)
                return;
            if (data.type === 'start' && data["status"] == "start") {
                player_count = 2;
                if (data["player2"] == user_name)
                    player2 = data["player1"];
                else
                    player2 = data["player2"];
                if (data.player2 == user_name) {
                    leftPlayer = false;
                    rightPlayer = true;
                }
                player1 = data.player1;
                player2 = data.player2;

				// showModal("modalGame");
                tournReady = true;
                if (round == 'final') {
					elementIdEditInnerHTML("winner-p1", player1);
					elementIdEditInnerHTML("winner-p2", player2);
					showModal("modalGame");
					// await delay(4000);
					hideModal("modalGame");
                    playOnlineGame();
                }
                else
				{
					elementIdEditInnerHTML("game1p1", player1);
					elementIdEditInnerHTML("game1p2", player2);
					elementIdEditInnerHTML("game2p1", data.game2p1);
					elementIdEditInnerHTML("game2p2", data.game2p2);
					showModal("modalGame");
					// await delay(4000);
					hideModal("modalGame");
					playOnlineTournamentMatch();
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
                gameSocket.close();
                gameSocket = "";
                isGameOver = true;
                socketStatus = false;
                continueExecution = false;
                showGameWinner(' You Win!');
                window.history.pushState({}, "", '/play');
                urlLocationHandler();
                return;
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
                'game': 'pong',
                'round': round,
                'mode': 'tournament',
                'tournament_name': tournament_name,
                'username': localStorage.getItem('username')
            }));

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
        console.log("match1: ", pairings[0], " match2: ", pairings[1]);
        return pairings;
    }


    async function playGame() {

        localPlayerMode = true;
        if (isGameOver || !animationFrameId) {
            isGameOver = false;
            score.left = 0;
            score.right = 0;
            resetBall();
            animationFrameId = requestAnimationFrame(gameLoop);
        }

    }
    const delay = ms => new Promise(res => setTimeout(res, ms));

    async function startLocalTournament() {
        console.log("sup mfs");
        // if (tournReady == false)
        //     return;
        let winners = [];
        localPlayerMode = true;
        loadModal('modalGameBody', TM_BRACKET);
		elementIdEditInnerHTML("game1p1", pairings[0][0]);
		elementIdEditInnerHTML("game1p2", pairings[0][1]);
		elementIdEditInnerHTML("game2p1", pairings[1][0]);
		elementIdEditInnerHTML("game2p2", pairings[1][1]);
        if (g_count == 0) {
            isGameOver = false;
            score.left = 0;
            score.right = 0;
            toggleHighlight("tPlayer1Highlight");
            toggleHighlight("tPlayer2Highlight");
            showModal("modalGame");
            updateLocalPlayerDisplay(pairings[0][0], pairings[0][1]);
            await delay(4000);
            hideModal("modalGame");
            resetBall();
            playGame();
        }
    }

    function updateLocalPlayerDisplay(playerLeft, playerRight) {
        localCurrentPair = [playerLeft, playerRight];
        // localCurrentPair.push(playerLeft, playerRight);
        console.log("player left:", localCurrentPair[0], " player right:", localCurrentPair[1]);
    };

    function setupLocalTournament() {
        loadModalMenu("modalMenu",
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
				`);
        showModal("modalMenu");

        document.getElementById('formPlayerNames')?.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevents the default form submission behavior


            const playerNames = Array.from(document.getElementById('formPlayerNames').querySelectorAll('input[id^="player"]')).map(input => input.value);

            console.log(playerNames);
            for (let i = 0; i < playerNames.length; ++i) {
                if (!checkName(playerNames[i]))
                    return;
            }
            // Check if all player names are unique
            if (hasDuplicates(playerNames)) {
                loadToast("Player names must be unique. Please enter distinct names for each player.");
                return;
            }
            // Perform matchmaking logic (for demonstration, this is a simple random pairing)
            pairings = randomPairing(playerNames);

            //@todo: show pairings via modal:

            tournReady = true;
			document.dispatchEvent(modalMenuDisposeEvent);
			startLocalTournament();
            // playerNameContainer.remove();
        });

    };


    function toggleHighlight(highlightId) {
        if (highlightId) {
            let highlight = docModalGame.querySelector('#' + highlightId);
            if (window.getComputedStyle(highlight).display == "none")
                highlight.style.display = "block";
            else
                highlight.style.display = "none";
        }
    };


    async function startTournament() {
        if (localPlayerMode) {
            setupLocalTournament();
            return;
        }
        await setupOnlineTournament();
    }
    startTournament();

    // Function to check for duplicate values in an array
    function hasDuplicates(array) {
        return (new Set(array)).size !== array.length;
    }

    async function submitTournament() {
        const tournamentName = document.getElementById('tournamentName').value;
        if (!tournamentName) {
            loadToast('Please enter a tournament name.');
            return;
        }
        let contentType;
        // Perform logic to create a new tournament
        // You can make a POST request to the backend and handle the response
        await fetch(`/api/create_tournament/?name=${tournamentName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'x-csrftoken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            }),
        }).then(response => {
            if (!response.ok) {
                localStorage.clear();
                console.log(response.statusText);
                return;
            }
            return response.text();
        }).then(data => {
            console.log(data);
            if (!data) {
                return;
            }
            if (data.length > 55) {
                displayTournamentLobby(data);
            }



        }).catch((error) => {
            console.error('Error:', error);
        });


    }


    async function joinTournament(tournamentName) {
        // Perform logic to join the selected tournament
        // You can make an API call or update the game state accordingly
        if (!tournamentName)
            return;
        console.log(`Joining tournament with name ${tournamentName}`);
        tournament_name = tournamentName;
        await fetch(`/api/join/?username=${localStorage.getItem('username')}&tournament_name=${tournamentName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'x-csrftoken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Include any necessary data for creating a tournament
                // (e.g., tournament name, settings, etc.)
            }),
        })
            .then(async response => {
                if (!response.ok) {
                    return null;
                }
                // loadLoginPage('Please login again');
                return response.json();
            })

            .then(async data => {
                if (!data) return;
                // Handle the response from the backend
                if (data.message === 'Tournament joined successfully') {
                    loadToast('Tournament joined successfully');

                    //@TODO : Clear screen !
                    // const menuContainer = document.getElementById('menu-container');
                    // menuContainer.remove();
                    // startLocalButton.style.visibility = 'hidden';

                    //@TODO : Display WAIT message
                    console.log("Waiting for lobby to fill & tournament to start ...");

                    //@TODO : Open socket
                    initiateSocket();
                } else if (data.message === "Sorry ur late. tournament is full :/") {
                    loadToast("Sorry ur late. tournament is full :/");
                } else if (data.message === "You are already in the tournament") {
                    loadToast('idiot ur already in the damn tournament STOP CHANGING PAGES !!STAY HERE PRICK');

                    //@TODO : Clear screen !
                    // const menuContainer = document.getElementById('menu-container');
                    // menuContainer.remove();
                    // startLocalButton.style.visibility = 'hidden';

                    //@TODO : Display WAIT message
                    console.log("Waiting for lobby to fill & tournament to start ...");
                } else {
                    console.error('Failed to join tournament', data);
                }
            });
        // await
        leftPlayer = true;
        rightPlayer = false;
    }
    function playOnlineGame() {
        console.log("gameover = " + isGameOver + " and animationid = " + animationFrameId);
        if (isGameOver || !animationFrameId) {
            isGameOver = false;
            score.left = 0;
            score.right = 0;
            resetBall();
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    async function playOnlineTournamentMatch() {
        resetGame();
        isGameOver = true;
        console.log("gcount = " + g_count);
        if (g_count == 0) {
            isGameOver = false;
            score.left = 0;
            score.right = 0;

            // showModal("modalGame");
            // toggleHighlight("tPlayer1Highlight");
            // toggleHighlight("tPlayer2Highlight");
            await delay(4000);
            // hideModal("modalGame");
            resetBall();
            canvas.dataset.animationFrameId = animationFrameId;
            playOnlineGame();

        }
        // if (isGameOver || !animationFrameId) {
        //     isGameOver = false;
        //     score.left = 0;
        //     score.right = 0;
        //     resetBall();
        //     animationFrameId = requestAnimationFrame(gameLoop);
        //     //TODO
        //     canvas.dataset.animationFrameId = animationFrameId;
        // }
    }

    async function setupOnlineTournament() {
        localPlayerMode = false;
        // displayMenu();
		loadModal("modalGame", TM_BRACKET);
        await fetch(`/api/tournaments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
        }).then(response => {
            if (!response.ok) {
                // document.getElementById("content").innerHTML = LOGIN_PAGE_HTML;
                localStorage.clear();
                console.log(response.statusText);
                // loadToast('Please login to continue');
                return null;
            }
            return response.text();
        }).then(data => {
            console.log(data);
            if (!data) {
                return;
            }
            displayTournamentLobby(data);
        }).catch((error) => {
            console.error('Error:', error);
        });

        // const joinButtons = document.querySelectorAll('[id="joinTourn"]');


    };

    function displayTournamentLobby(data) {
		loadModalMenu("modalMenu", data);
        const joinButtons = document.querySelectorAll('[id="joinTourn"]');

        joinButtons?.forEach(function (button) {
            button.addEventListener('click', function () {
                // Extract the tournament name from the closest card
                const tournamentName = button.closest('.card')?.querySelector('#tname')?.innerText.trim();

                // Call joinTournament with the extracted tournament name
                joinTournament(tournamentName);
            });
        });

        document.getElementById('createTournForm')?.addEventListener('submit', async (event) => {
            event.preventDefault();
			document.dispatchEvent(modalMenuDisposeEvent);
            await submitTournament();
        });
		//display Tournament Lobby
        showModal("modalMenu");
    }

    async function gameLoop(timestamp) {

        if (continueExecution == false)
            return;

        const elapsed = timestamp - lastTimestamp;
        // console.log(timestamp);

        if (elapsed == 0 || elapsed >= (frameInterval / 2)) {
            draw();
            await update();
            lastTimestamp = timestamp;
            if (isGameOver)
                return;
            requestAnimationFrame(gameLoop);
        }
    }

}
// Function to stop the execution from the outside
export function stopTournamentExecution() {
    continueExecution = false;
}

export function closePongTournSocket() {
    if (gameSocket === "")
        return;
    gameSocket.send(JSON.stringify({
        'game': 'pong',
        'type': 'terminate',
        'mode': 'tournament',
        'tournament_name': tournament_name,
        'sender': user_name,
    }));
    gameSocket.close();
    gameSocket = "";
}





