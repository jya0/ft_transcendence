// import {io} from "socket.io-client";
export const loadTicTac = () => {

    const tictacButtonOnline = document.createElement('button');
    const tictacButtonLocal = document.createElement('button');

    document.getElementById('container').appendChild(tictacButtonOnline);
    document.getElementById('container').appendChild(tictacButtonLocal);


    tictacButtonOnline.id = 'startOnlineButton';
    tictacButtonOnline.innerHTML = 'Start Online Game';

    tictacButtonLocal.id = 'startLocalButton';
    tictacButtonLocal.innerHTML = 'Start Local Game';

    var N_SIZE = 3,
        EMPTY = "&nbsp;",
        boxes = [],
        turn = "X",
        score,
        moves;
    let gameOver = true;

    function init() {


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
        startNewGame();
    }

    function startNewGame() {
        score = {
            "X": 0,
            "O": 0
        };
        moves = 0;
        turn = "X";
        boxes.forEach(function (square) {
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
                tictacButtonOnline.style.visibility = 'visible';
                tictacButtonLocal.style.visibility = 'visible';
                return true;
            }
        }
        return false;
    }

    function contains(selector, text) {
        var elements = document.querySelectorAll(selector);
        return [].filter.call(elements, function (element) {
            return RegExp(text).test(element.textContent);
        });
    }

    function set() {
        if (this.innerHTML !== EMPTY) {
            return;
        }
        this.innerHTML = turn;
        moves += 1;
        score[turn] += this.identifier;
        if (win(this)) {
            alert('Winner: Player ' + turn);
            document.getElementById('game-container').remove();
            return ;
            // startNewGame();
        } else if (moves === N_SIZE * N_SIZE) {
            alert("Draw");
            // startNewGame();
            return ;
        } else {
            turn = turn === "X" ? "O" : "X";
            document.getElementById('turn').textContent = 'Player ' + turn;
        }
    }


    let btnCounter = 0;

    let localPlayerMode = false;



    let isGameOver = false;

    let socketStatus = false;

    let keyPressed;
    let leftPlayer = true;
    let rightPlayer = false;


    function handleLocalWinner() {
        let buttonText;

        //@todo

        document.getElementById("startLocalButton").innerHTML = buttonText;
        isGameOver = true;
        socketStatus = false;
        leftPlayer = true;
        rightPlayer = false;
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

    let player_count = 0;
    let url = `ws://localhost:8000/ws/socket-server/`
    let gameSocket;

 


    startLocalButton.addEventListener('click', () => {
        gameOver = true;
        console.log('hi');
        startLocalButton.style.visibility= 'hidden';
        startOnlineButton.style.visibility= 'hidden';

        init();

    });
}




