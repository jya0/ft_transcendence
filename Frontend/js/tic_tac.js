import { hideModal, loadModal, loadSpinner, showGameWinner, showModal } from "./loadComponent.js";
import { urlLocationHandler } from "./url-router.js"

let continueExecution = true;
let gameSocket = "";
let user_name = "";
import { elementIdEditInnerHTML, querySelectIdEditInnerHTML } from "./utility.js";


export function loadTicTac(username, localPlayerMode) {
    let docWinScreen = document.getElementById('windowScreen');

    if (!docWinScreen)
        return;

    let player1 = username;
    user_name = username;
    let player2 = "";
    let isGameOver = true;
    continueExecution = true;
    let lastTimestamp = 0;
    let btnCounter = 0;
    let socketStatus = false;
    let keyPressed;
    let leftPlayer = true;
    let rightPlayer = false;
    let currentPlayerSymbol = "";



    var N_SIZE = 3,
        EMPTY = "&nbsp;",
        boxes = [],
        turn = "X",
        score,
        moves;
    let gameOver = false;

    function local_init() {


        gameOver = false;

        var container = document.createElement('div');
        container.id = 'tictac-container';
        container.className = 'tictactoe';
        container.classList = "d-flex flex-row h-100 w-100 mh-100 mw-100 border border-0 border-black justify-content-around align-items-center overflow-auto font--argent"
        container.innerHTML =
            `
				<div id="tictactoe" class="d-flex flex-column h-100 justify-content-center align-items-center flex-grow-1 h-100 w-100 border border-0 border-black">
				</div>
				<div id="turn" class="container-fluid text-capitalize text-black w-25 me-5 text-center h2 border border-1 border-black rounded p-4 order-0 order-1">
					player x
				</div>
			`;
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
        console.log(docWinScreen.getBoundingClientRect().height);
        board.style.scale = docWinScreen.getBoundingClientRect().width / 300 * 0.5;
        container.querySelector("#tictactoe").appendChild(board);
        docWinScreen.innerHTML = "";
        docWinScreen.appendChild(container);
        // board.classList.add("ratio", "ratio-1x1");
        console.log(docWinScreen.getBoundingClientRect().height);
        board.style.scale = docWinScreen.getBoundingClientRect().width / 300 * 0.5;
        container.querySelector("#tictactoe").appendChild(board);
        docWinScreen.innerHTML = "";
        docWinScreen.appendChild(container);
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
        var memberOf = clicked.className.split(/\s+/);
        for (var i = 0; i < memberOf.length; i++) {
            var testClass = '.' + memberOf[i];
            var items = contains('#tictactoe ' + testClass, turn);
            if (items.length == N_SIZE) {
                gameOver = true;

                if (localPlayerMode) {
                    showGameWinner(turn);
                }

                if (!localPlayerMode && turn === currentPlayerSymbol) {
                    handleOnlineWinner(true); // true indicates the current player is the winner
                }

                return true;
            }
        }
        return false;
    }


    function contains(selector, text) {
        var elements = document.querySelectorAll(selector);
        if (!elements)
            return (false);
        if (!elements)
            return (false);
        return [].filter.call(elements, function (element) {
            return RegExp(text).test(element.textContent);
        });
    }


    function set() {
        if (gameOver || this.innerHTML !== EMPTY || (!localPlayerMode && turn !== currentPlayerSymbol)) {
            return;
        }

        this.innerHTML = turn;
        moves += 1;
        score[turn] += this.identifier;
        if (win(this)) {
            querySelectIdEditInnerHTML(docWinScreen, "turn", `PLAYER ${turn} WINS!`);
            return;
        } else if (moves === N_SIZE * N_SIZE) {
            // alert("Draw");
            querySelectIdEditInnerHTML(docWinScreen, "turn", `DRAW!`);
            handleOnlineDraw(false);
            return;
        } else {
            turn = turn === "X" ? "O" : "X";
            querySelectIdEditInnerHTML(docWinScreen, "turn", 'Player ' + turn);
            querySelectIdEditInnerHTML(docWinScreen, "turn", 'Player ' + turn);
        }
    }

    let player_count = 0;
    let url = `wss://10.11.6.4:9090/ws/socket-server/`;
    // let url = `wss://localhost:9090/ws/socket-server/`;



    function playGame() {
        gameOver = false;


        if (localPlayerMode) {
            local_init();
            startNewGame();
        }
        else {
            initiateSocket();
            online_init();
        }

    }
    playGame();

    function handleOnlineWinner(isWinner) {
        let winnerMsg;
        if (isWinner) {
            winnerMsg = `${user_name}
            Congrats You won!`;
            gameSocket.send(JSON.stringify({
                'game': 'tic',
                'type': 'end',
                'winner': user_name,
                'game': 'tic',
                'mode': 'single',
                'username': user_name,
            }));
        } else {
            winnerMsg = `Sorry, you lost!`;
        }

        gameSocket.close();
        gameSocket = "";
        isGameOver = true;
        socketStatus = false;
        showGameWinner(winnerMsg);
        window.history.pushState({}, "", '/play');
        urlLocationHandler();
    }
    function handleOnlineDraw(winner) {
        let winnerMsg;
        winnerMsg = `NONE :
         DRAW`;
        if (winner) {

            gameSocket.send(JSON.stringify({
                'game': 'tic',
                'type': 'end',
                'winner': 'NONE',
                'game': 'tic',
                'mode': 'single',
                'username': user_name,
            }));
        }

        gameSocket.close();
        gameSocket = "";
        isGameOver = true;
        socketStatus = false;
        showGameWinner(winnerMsg);
        window.history.pushState({}, "", '/play');
        urlLocationHandler();
    }


    function initiateSocket() {
        gameSocket = new WebSocket(url);

        gameSocket.onmessage = function (e) {
            let data = JSON.parse(e.data)
            console.log('Data: ', data)

            if (data.game === 'pong')
                return;
            if (data.type === 'start' && data["status"] === "start") {
                player_count = 2;
                console.log("BOYS U CAN START NOW!");
                hideModal("modalGame");
                window.addEventListener('beforeunload', function (event) {
                    console.info("This page is reloaded");
                    // console.log(btnCounter);
                    if (gameSocket !== "" && player2 != "") {
                        // Call the closePong1v1Socket function to terminate the game
                        closeTicTac1v1Socket();
                        showGameWinner('You lose!');
                        window.history.pushState({}, "", '/play');
                        urlLocationHandler();
                        // Display a custom message (some browsers may not support this)
                        event.returnValue = 'Are you sure you want to leave?';
                    }
                });
                if (continueExecution == false)
                    return;
                // loadSpinner("modalGameBody", "text-black");
                if (data["player2"] == user_name)
                    player2 = data["player1"];
                else
                    player2 = data["player2"];

                currentPlayerSymbol = (data["player1"] === user_name) ? "X" : "O";
                startNewGame();
                if (data.sender == username) {
                    leftPlayer = false;
                    rightPlayer = true;
                }
            }

            if (data.sender == username)
                return;

            if (data.type == 'update') {
                // if (isGameOver) return;
                handleMove(data);
            }

            else if (data.type === 'terminate' && (data.player1 === user_name || data.player2 === user_name)) {
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
            else if (data.type === 'close') {
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
                'game': 'tic',
                'type': 'start',
                'mode': 'single',
                'username': username
            }))

            player_count = 1;

            console.log("waiting for a second player...");
            loadSpinner("modalGameBody", "text-black");
            showModal("modalGame");
            console.log("showing");
        });
        player_count = 1;
    }



    function online_init() {

        var container = document.createElement('div');
        container.id = 'tictac-container';
        container.className = 'tictactoe';
        container.classList = "d-flex flex-row h-100 w-100 mh-100 mw-100 border border-0 border-black justify-content-around align-items-center overflow-auto font--argent"
        container.innerHTML =
            `
				<div id="tictactoe" class="d-flex flex-column h-100 justify-content-center align-items-center flex-grow-1 h-100 w-100 border border-0 border-black">
				</div>
				<div id="turn" class="container-fluid text-capitalize text-black w-25 me-5 text-center h2 border border-1 border-black rounded p-4 order-0 order-1">
					player x
				</div>

			`;
        // document.getElementsByClassName('container')[0].appendChild(container);

        var board = document.createElement('div');
        // board.setAttribute("border", 1);
        // board.setAttribute("cellspacing", 10);

        var identifier = 1;
        for (var i = 0; i < N_SIZE; i++) {
            var row = document.createElement('tr');
            board.appendChild(row);
            for (var j = 0; j < N_SIZE; j++) {
                var cell = document.createElement('td');
                cell.addEventListener("click", function () {
                    // Send the clicked cell information to the server
                    if (this.innerHTML === EMPTY) {
                        console.log("SENDING!");
                        const cellIndex = boxes.indexOf(this);
                        if (turn !== currentPlayerSymbol)
                            return;
                        gameSocket.send(JSON.stringify({
                            'type': 'update',
                            'game': 'tic',
                            'mode': 'single',
                            'username': localStorage.getItem('username'),
                            'key': cellIndex
                        }));
                    }
                });
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
        // document.getElementById('tictactoe').appendChild(board);
        console.log(docWinScreen.getBoundingClientRect().height);
        board.style.scale = docWinScreen.getBoundingClientRect().width / 300 * 0.5;
        container.querySelector("#tictactoe").appendChild(board);
        docWinScreen.innerHTML = "";
        docWinScreen.appendChild(container);

        // document.getElementById("container").appendChild(board);
    }

    function handleMove(data) {
        if (continueExecution == false)
            return;
        hideModal("modalGame");
        if (data['key'] >= 0 && data['key'] < boxes.length && boxes[data['key']].innerHTML === EMPTY) {
            boxes[data['key']].innerHTML = turn;
            moves += 1;
            if (win(boxes[data['key']])) {
                // If the opponent wins, display the losing message
                if (turn !== currentPlayerSymbol) {
                    gameOver = true;
                    showGameWinner(` ${player2}
                    Sorry, you lost!`);
                    gameSocket.close();
                    gameSocket = "";
                    socketStatus = false;
                    window.history.pushState({}, "", '/play');
                    urlLocationHandler();
                }
            } else if (moves === N_SIZE * N_SIZE) {
                gameOver = true;
                handleOnlineDraw(turn !== currentPlayerSymbol);

            } else {
                turn = turn === "X" ? "O" : "X";
                document.getElementById('turn').textContent = 'Player ' + turn;
            }
        }
    }


}


// Function to stop the execution from the outside
export function stopTicTacExecution() {
    continueExecution = false;
    // console.error("AAAAAAAAAAAA");
}

export function closeTicTac1v1Socket() {
    if (gameSocket === "")
        return;
    console.log("terminating....");
    gameSocket.send(JSON.stringify({
        'game': 'tic',
        'type': 'terminate',
        'mode': 'online1v1',
        'sender': user_name,
    }))
    gameSocket.close();
    gameSocket = "";
}
