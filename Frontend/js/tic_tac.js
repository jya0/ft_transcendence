// import {io} from "socket.io-client";
export function  loadTicTac(){


    let btnCounter = 0;
    let localPlayerMode = false;
    let isGameOver = false;
    let socketStatus = false;
    let keyPressed;
    let leftPlayer = true;
    let rightPlayer = false;


    var N_SIZE = 3,
        EMPTY = "&nbsp;",
        boxes = [],
        turn = "X",
        score,
        moves;
    let gameOver = false;

    function local_init() {

        var container = document.createElement('div');
        container.id = 'game-container';
        container.className = 'tictactoe';
		container.classList = "d-flex flex-row h-100 w-100 mh-100 mw-100 border border-0 border-black justify-content-around align-items-center overflow-auto font--argent"
        container.innerHTML = 
			`
				<div id="tictactoe" class="d-flex flex-column h-100 justify-content-center align-items-center flex-grow-1 h-100 w-100 border border-0 border-black">
				</div>
				<div id="turn" class="container-fluid text-capitalize text-black w-25 me-5 text-center h2 border border-1 border-black rounded p-4 order-1">
					player x
				</div>
			
			`;
        gameOver = false;
        document.getElementById('windowScreen').innerHTML = "";
        document.getElementById('windowScreen').appendChild(container);
        var board = document.createElement('div');
        // board.setAttribute("border", 1);
        // board.setAttribute("cellspacing", 10);

        var identifier = 1;
        for (var i = 0; i < N_SIZE; i++) {
            var row = document.createElement('tr');
            board.appendChild(row);
            for (var j = 0; j < N_SIZE; j++) {
                var cell = document.createElement('td');
                cell.setAttribute('height', 100);
                cell.setAttribute('width', 100);
                cell.setAttribute('align', 'center');
                cell.setAttribute('valign', 'center');
                cell.classList.add('col' + j, 'row' + i);
                if (i == j) {
                    cell.classList.add('diagonal0');
                }
                if (j == N_SIZE - i - 1) {
                    cell.classList.add('diagonal1');
                }
                cell.identifier = identifier;
                cell.addEventListener("click", set);
                row.appendChild(cell);
                boxes.push(cell);
                identifier += identifier;
            }
        }
		// board.classList.add("ratio", "ratio-1x1");
		console.log(document.getElementById("windowScreen").getBoundingClientRect().height);
		board.style.scale = document.getElementById("windowScreen").getBoundingClientRect().width / 300 * 0.5;
        document.getElementById('tictactoe').appendChild(board);
        console.log("heheeee");

    }


    function startNewGame() {
        score = {
            "X": 0,
            "O": 0
        };
        moves = 0;
        turn = "X";
        boxes?.forEach(function (square) {
            square.innerHTML = EMPTY;
        });
    }


    function win(clicked) {
        // Get all cell classes
        var memberOf = clicked.className.split(/\s+/);
        for (var i = 0; i < memberOf.length; i++) {
            var testClass = '.' + memberOf[i];
            var items = contains('#tictactoe ' + testClass, turn);
            // winning condition: turn == N_SIZE
            if (items.length == N_SIZE) {
                gameOver = true;

                return true;
            }
        }
        return false;
    }

    function contains(selector, text) {
        var elements = document.querySelectorAll(selector);
		if (!elements)
			return (false);
        return [].filter.call(elements, function (element) {
            return RegExp(text).test(element.textContent);
        });
    }
    function set() {
        if (gameOver)
            return ;
        if (this.innerHTML !== EMPTY) {
            return;
        }
        this.innerHTML = turn;
        moves += 1;
        score[turn] += this.identifier;
        if (win(this)) {
            // document.getElementById('game-container').remove();
            // startNewGame();
            // alert('Winner: Player ' + turn);
            document.getElementById('turn').textContent =`PLAYER ${turn} WINS!`;
            return ;
        } else if (moves === N_SIZE * N_SIZE) {
            // alert("Draw");
            document.getElementById('turn').textContent =`DRAW!`;

            // startNewGame();
            return;
        } else {
            turn = turn === "X" ? "O" : "X";
            document.getElementById('turn').textContent = 'Player ' + turn;
        }

    }

    let player_count = 0;
    // let url = `wss://10.12.1.10:8000/ws/socket-server/`;
	let url = `wss://localhost:8090/ws/socket-server/`;

    let gameSocket;

    // startLocalButton.addEventListener('click', () => {
    //     gameOver = true;
    //     console.log('hi');
    //     startLocalButton.style.visibility = 'hidden';
    //     startOnlineButton.style.visibility = 'hidden';

    //     local_init();
    //     startNewGame();
    // });

    function playGame() {
        console.log("HEYYY");
        gameOver = true;
        console.log('hi');

        local_init();
        startNewGame();
    }
    playGame();
    // function updateBackend() {
    //     if (rightPlayer) {
    //         if (keys['w'] && players.right > 0) {
    //             players.right -= paddle.speed;
    //             keyPressed = 'w';
    //             gameSocket.send(JSON.stringify({
    //                 'type': 'update',
    //                 'mode': 'single',
    //                 'username': localStorage.getItem('username'),
    //                 'key': keyPressed,
    //             }))
    //         }
    //         if (keys['s'] && players.right < canvas.height - paddle.height) {
    //             players.right += paddle.speed;
    //             keyPressed = 's';
    //             gameSocket.send(JSON.stringify({
    //                 'type': 'update',
    //                 'mode': 'single',
    //                 'username': localStorage.getItem('username'),
    //                 'key': keyPressed
    //             }))
    //         }
    //     }
    //     else {
    //         if (keys['w'] && players.left > 0) {
    //             players.left -= paddle.speed;
    //             keyPressed = 'w';
    //             gameSocket.send(JSON.stringify({
    //                 'type': 'update',
    //                 'mode': 'single',
    //                 'username': localStorage.getItem('username'),
    //                 'key': keyPressed
    //             }))
    //         }
    //         if (keys['s'] && players.left < canvas.height - paddle.height) {
    //             players.left += paddle.speed;
    //             keyPressed = 's';
    //             gameSocket.send(JSON.stringify({
    //                 'type': 'update',
    //                 'mode': 'single',
    //                 'username': localStorage.getItem('username'),
    //                 'key': keyPressed
    //             }))
    //         }
    //     }
    // }

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
                handleMove();
            }
            else if (data.type == 'close') {
                gameOver = true;
                player_count = 1;
                endGame();
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



    function online_init() {

        var container = document.createElement('div');
        container.id = 'game-container';
        container.className = 'tictactoe';
        container.innerHTML = `<div id="tictactoe"></div>
		<div align="center">
			<span id='turn'>Player X</span>
		</div>
        `

        document.getElementsByClassName('container')[0].appendChild(container);

        var board = document.createElement('table');
        board.setAttribute("border", 1);
        board.setAttribute("cellspacing", 10);

        var identifier = 1;
        for (var i = 0; i < N_SIZE; i++) {
            var row = document.createElement('tr');
            board.appendChild(row);
            for (var j = 0; j < N_SIZE; j++) {
                var cell = document.createElement('td');
                cell.addEventListener("click", function () {
                    // Send the clicked cell information to the server
                    if (!isGameOver && this.innerHTML === EMPTY) {
                        const cellIndex = boxes.indexOf(this);
                        gameSocket.send(JSON.stringify({
                            'type': 'move',
                            'mode': 'ticTacToe',
                            'username': localStorage.getItem('username'),
                            'cellIndex': cellIndex
                        }));
                    }
                });
                cell.setAttribute('height', 120);
                cell.setAttribute('width', 120);
                cell.setAttribute('align', 'center');
                cell.setAttribute('valign', 'center');
                cell.classList.add('col' + j, 'row' + i);
                if (i == j) {
                    cell.classList.add('diagonal0');
                }
                if (j == N_SIZE - i - 1) {
                    cell.classList.add('diagonal1');
                }
                cell.identifier = identifier;
                cell.addEventListener("click", set);
                row.appendChild(cell);
                boxes.push(cell);
                identifier += identifier;
            }
        }
        document.getElementById('tictactoe').appendChild(board);

        // document.getElementById("container").appendChild(board);
    }

    function handleMove(data) {
        if (!isGameOver && data['cellIndex'] >= 0 && data['cellIndex'] < boxes.length &&
            boxes[data['cellIndex']].innerHTML === EMPTY) {
            boxes[data['cellIndex']].innerHTML = turn;
            moves += 1;

            if (win(boxes[data['cellIndex']])) {
                loadToast('Winner: Player ' + turn);
                endGame();
            } else if (moves === N_SIZE * N_SIZE) {
                loadToast("Draw");
                endGame();
            } else {
                turn = turn === "X" ? "O" : "X";
                document.getElementById('turn').textContent = 'Player ' + turn;
            }
        }
    }

    function endGame() {
        isGameOver = true;
        tictacButtonOnline.style.visibility = 'visible';
        tictacButtonLocal.style.visibility = 'visible';
    }



    // startOnlineButton.addEventListener('click', () => {
    //     localPlayerMode = false;
    //     startLocalButton.disabled = true;
    //     startOnlineButton.disabled = true;
    //     startLocalButton.style.visibility = 'hidden';

    //     console.log("YUUUUUU");
    //     if (btnCounter == 0) {
    //         initiateSocket();
    //         document.getElementById("startOnlineButton").innerHTML = "Waiting for second player ..."
    //         console.log("first press - ready to play!");
    //         btnCounter = btnCounter + 1;
    //         return;
    //     }
    //     online_init();
    //     startNewGame();
    // });
}




