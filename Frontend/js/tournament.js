// import {io} from "socket.io-client";
export const loadTournament = () => {
    let tournament_name;
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');
    const startOnlineButton = document.getElementById('startOnlineTournButton');
    const startLocalButton = document.getElementById('startLocalTournButton');

    let localPlayerMode = true;
    let pairings = [];
    let winners = [];
    canvas.width = 800;
    canvas.height = 400;

    const paddle = { width: 10, height: 100, speed: 8 };
    const ball = { size: 10, x: canvas.width / 2, y: canvas.height / 2, speedX: 6, speedY: 6 };
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
				    'mode':'tournament',
                    'tournament_name':tournament_name,
                    'username': localStorage.getItem('username'),
                    'key': keyPressed
                }))
            }
            if (keys['s'] && players.right < canvas.height - paddle.height) {
                players.right += paddle.speed;
                keyPressed = 's';
                gameSocket.send(JSON.stringify({
                    'type': 'update',
				    'mode':'tournament',
                    'tournament_name':tournament_name,
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
				    'mode':'tournament',
                    'tournament_name':tournament_name,
                    'username': localStorage.getItem('username'),
                    'key': keyPressed
                }))
            }
            if (keys['s'] && players.left < canvas.height - paddle.height) {
                players.left += paddle.speed;
                keyPressed = 's';
                gameSocket.send(JSON.stringify({
                    'type': 'update',
				    'mode':'tournament',
                    'tournament_name':tournament_name,
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

        if (tournReady == false)
            return;

        //show results
        if (g_count != 2) {

            alert(`Match ${g_count + 1}: ${pairings[g_count][0]} vs ${pairings[g_count][1]} *** Result: ${score.left} - ${score.right}`);
            console.log(`Match ${g_count + 1}: ${pairings[g_count][0]} vs ${pairings[g_count][1]} *** Result: ${score.left} - ${score.right}`);
        }

        //update winners
        if (g_count == 0 || g_count == 1) {
            winners.push((pairings[g_count][0] > pairings[g_count][1]) ? pairings[g_count][0] : pairings[g_count][1]);
        }


        //reset
        isGameOver = false;
        socketStatus = false;
        leftPlayer = true;
        rightPlayer = false;
        score.left = 0;
        score.right = 0;
        resetBall();
        paddle.width = 10;
        paddle.height = 100;


        //prompt new match
        if (g_count == 0) {
            alert(`Match ${g_count + 2}: ${pairings[1][0]} vs ${pairings[1][1]}\n Press to start`);
        }
        if (g_count == 1) {
            alert(`Match ${g_count + 2}: ${winners[0]} vs ${winners[1]}\n Press to start`);
        }
        // end tournament
        if (g_count == 2) {
            tournReady = false;
            startLocalButton.disabled = false;
            startOnlineButton.disabled = false;
            startLocalButton.style.visibility = 'visible';
            startOnlineButton.style.visibility = 'visible';
            if (score.left > score.right) {
                buttonText = `Left Player - ${winners[0]} WINS! Press to play a new local game`;
            } else {
                buttonText = `Right Player - ${winners[1]} WINS! Press to play a new local game`;
            }
            g_count = 0;
            tournReady = false;
            isGameOver = true;
            document.getElementById("startLocalTournButton").innerHTML = buttonText;
        }
        else
            g_count++;
    }


    function handleOnlineWinner() {
        let buttonText;
        if ((rightPlayer && score.left >= 3) || (leftPlayer && score.right >= 3))
            buttonText = "You lose! Press to play a new online game";
        else {
            buttonText = "You win! Press to play a new online game";
            gameSocket.send(JSON.stringify({
                'type': 'end',
                'mode':'tournament',
                'tournament_name':tournament_name,
                'username': localStorage.getItem('username'),
                'score1': score.left,
                'score2': score.right,
            }))
        }
        document.getElementById("startOnlineTournButton").innerHTML = buttonText;
        gameSocket.close();
        isGameOver = true;
        socketStatus = false;
    }

    function checkForWinner() {

        if (score.left >= 3 || score.right >= 3) {
            isGameOver = true;
            ctx.fillStyle = 'red';

            if (localPlayerMode)
                handleLocalWinner();
            else
                handleOnlineWinner();
        }
    }

    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });

    let player_count = 0;
    let url = `wss://localhost:8090/ws/socket-server/`
    let gameSocket;

    function initiateSocket() {
        gameSocket = new WebSocket(url);

        gameSocket.onmessage = function (e) {
            let data = JSON.parse(e.data)
            console.log('Data: ', data)

            if (data.mode === 'single')
                return ;

            if (data.type === 'start' && data["status"] == "start") {
                player_count = 2;
                document.getElementById("startOnlineTournButton").innerHTML = "In-game";
                if (data.sender == localStorage.getItem('username')) {
                    leftPlayer = false;
                    rightPlayer = true;
                }
                console.log(leftPlayer);
                console.log(rightPlayer);
                playOnlineTournamentMatch();
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
                'mode':'tournament',
                'tournament_name':tournament_name,
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


    function playGame() {
        localPlayerMode = true;
        startLocalButton.disabled = true;
        startOnlineButton.disabled = true;
        if (isGameOver || !animationFrameId) {
            isGameOver = false;
            score.left = 0;
            score.right = 0;
            resetBall();
            animationFrameId = requestAnimationFrame(gameLoop);
        }

    }


    function startLocalTournament() {
        if (tournReady == false)
            return;
        let winners = [];
        localPlayerMode = true;
        let player1 = pairings[0][0];
        let player2 = pairings[0][1];
        startLocalButton.disabled = true;
        startOnlineButton.disabled = true;
        startLocalButton.style.visibility = 'hidden';
        startOnlineButton.style.visibility = 'hidden';
        if (g_count == 0) {
            isGameOver = false;
            score.left = 0;
            score.right = 0;
            resetBall();
            // alert(`Match 1: ${player1} vs ${player2}\n Press to start`);
            playGame();
            // startLocalButton.disabled = false;
            // startLocalButton.click();
        }
    }

    startLocalButton.addEventListener('click', () => {

        // Check if a form already exists and remove it
        const checker = document.getElementById('tourn-player-count');
        if (checker) {
            checker.remove();
        }

        if (tournReady) {
            document.getElementById("startLocalTournButton").textContent = "Matchmaking complete. Press to start local tournament!";
            startLocalTournament();
        }

        localPlayerMode = true;
        startLocalButton.disabled = true;
        startOnlineButton.disabled = true;
        startLocalButton.style.visibility = 'hidden';
        startOnlineButton.style.visibility = 'hidden';


        // Display a form to get the number of players and their names
        const formContainer = document.createElement('div');
        formContainer.innerHTML = `
			<form id="tournamentSetupForm">
				<label for="playerCount">Enter the number of players:</label>
				<input type="number" id="playerCount" name="playerCount" min="2" required>
				<button id="formButton" type="submit">Start Tournament</button>
			</form>
		`;
        formContainer.id = 'tourn-player-count';


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

            // formContainer.remove(); // Remove the form once the input is collected
            document.getElementById('tourn-player-count').remove();

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

                // Check if all player names are unique
                if (hasDuplicates(playerNames)) {
                    alert("Player names must be unique. Please enter distinct names for each player.");
                    return;
                }
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
                beginTournButton.disabled = false;

                // Append the list to the bottom of the page
                document.getElementsByClassName('window-frame')[0].appendChild(resultsList);
                tournReady = true;
                document.getElementById("startLocalTournButton").textContent = "Matchmaking complete. Press to start local tournament!";

                startLocalButton.disabled = false;
                startOnlineButton.disabled = false;
                startLocalButton.style.visibility = 'visible';
                startOnlineButton.style.visibility = 'visible';

                // Clean up after starting the tournament
                form.remove();
                // animationFrameId = requestAnimationFrame(gameLoop);
                playerNameContainer.remove();

            });
        });
    });




    // Function to check for duplicate values in an array
    function hasDuplicates(array) {
        return (new Set(array)).size !== array.length;
    }



    function displayMenu() {
        const menuContainer = document.createElement('div');
        menuContainer.id = 'menu-container';

        // Fetch the list of online tournaments from the backend
        fetch('http://localhost:8000/api/tournaments')
            .then(response => response.json())
            .then(tournaments => {
                const tournamentList = document.createElement('ul');
                tournamentList.innerHTML = '<p>Online Tournaments:</p>';
                tournamentList.id = 'tourn-list';
                console.log(tournaments);
                tournaments.forEach(tournament => {
                    const listItem = document.createElement('li');
                    listItem.textContent = tournament.name;

                    const joinButton = document.createElement('button');
                    joinButton.textContent = 'Join';
                    joinButton.addEventListener('click', () => joinTournament(tournament.name));

                    listItem.appendChild(joinButton);
                    tournamentList.appendChild(listItem);
                });

                menuContainer.appendChild(tournamentList);
            })
            .catch(error => console.error('Error fetching tournaments:', error));

        // Button to create a new tournament
        const createButton = document.createElement('button');
        createButton.textContent = 'Create New Tournament';
        createButton.addEventListener('click', createNewTournament);

        menuContainer.appendChild(createButton);

        // Append the menu to the document
        document.getElementsByClassName('window-frame')[0].appendChild(menuContainer);
    }

    function createNewTournament() {
        // Check if the input field already exists
        const inputField = document.getElementById('tournamentNameInput');
        if (inputField) {
            alert('Please enter a tournament name before creating a new tournament.');
            return;
        }

        // Create an input field for the tournament name
        const tournamentNameInput = document.createElement('input');
        tournamentNameInput.type = 'text';
        tournamentNameInput.id = 'tournamentNameInput';
        tournamentNameInput.placeholder = 'Enter tournament name';

        // Button to submit the tournament name
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.id = 'submitButton';
        submitButton.addEventListener('click', () => submitTournament());

        // Append the input field and submit button next to the create button
        const menuContainer = document.getElementById('menu-container');
        menuContainer.appendChild(tournamentNameInput);
        menuContainer.appendChild(submitButton);
    }

    async function submitTournament() {
        const tournamentName = document.getElementById('tournamentNameInput').value;
        if (!tournamentName) {
            alert('Please enter a tournament name.');
            return;
        }

        // Perform logic to create a new tournament
        // You can make a POST request to the backend and handle the response
        await fetch(`/api/create_tournament/?name=${tournamentName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Include any necessary data for creating a tournament
                // (e.g., tournament name, settings, etc.)
            }),
        })
            .then(response => response.json())
            .then(data => {
                // Handle the response from the backend
                if (data.message === 'Please choose another tournament name') {
                    alert('Please choose another tournament name');
                } else if (data.message === 'Tournament created successfully') {
                    alert('Tournament created successfully');
                } else {
                    console.error('Unexpected response:', data);
                }
            })
            .catch(error => console.error('Error creating tournament:', error));

        // Remove the input field and submit button after creating the tournament
        const tournamentNameInput = document.getElementById('tournamentNameInput');
        const submitButton = document.getElementById('submitButton');
        tournamentNameInput.parentNode.removeChild(tournamentNameInput);
        submitButton.remove();

        const tournamentList = document.getElementById('tourn-list');
        const listItem = document.createElement('li');
                    listItem.textContent = tournamentName;

                    const joinButton = document.createElement('button');
                    joinButton.textContent = 'Join';
                    joinButton.addEventListener('click', () => joinTournament(tournamentName));

                    listItem.appendChild(joinButton);
                    tournamentList.appendChild(listItem);
    }

    async function joinTournament(tournamentName) {
        // Perform logic to join the selected tournament
        // You can make an API call or update the game state accordingly
        console.log(`Joining tournament with name ${tournamentName}`);
        tournament_name = tournamentName;
        await fetch(`http://10.12.1.10:8090/api/join/?username=${localStorage.getItem('username')}&tournament_name=${tournamentName}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Include any necessary data for creating a tournament
                // (e.g., tournament name, settings, etc.)
            }),
        })
            .then(response => response.json())
            .then(data => {
                // Handle the response from the backend
                if (data.message === 'Tournament joined successfully') {
                    alert('Tournament joined successfully');
                    
                    //@TODO : Clear screen !
                    const menuContainer = document.getElementById('menu-container');
                    menuContainer.remove();
                    startLocalButton.style.visibility = 'hidden';

                    //@TODO : Display WAIT message
                    document.getElementById("startOnlineTournButton").textContent = "Waiting for lobby to fill & tournament to start ..."
                    
                    //@TODO : Open socket
                    initiateSocket();


                } else if (data.message === "Sorry ur late. tournament is full :/") {
                    alert("Sorry ur late. tournament is full :/");
                } else if(data.message ===  "You are already in the tournament") {
                    alert('idiot ur already in the damn tournament STOP CHANGING PAGES !!STAY HERE PRICK');
                    
                    //@TODO : Clear screen !
                    const menuContainer = document.getElementById('menu-container');
                    menuContainer.remove();
                    startLocalButton.style.visibility = 'hidden';

                    //@TODO : Display WAIT message
                    document.getElementById("startOnlineTournButton").textContent = "Waiting for lobby to fill & tournament to start ..."
                }
                else {
                    console.error('Failed to join tournament', data);
                }
            })
            .catch(error => console.error('Error joining tournament:', error));
    }


    function playOnlineTournamentMatch() {
        localPlayerMode = false;
        startLocalButton.disabled = true;
        startOnlineButton.disabled = true;
        if (isGameOver || !animationFrameId) {
            isGameOver = false;
            score.left = 0;
            score.right = 0;
            resetBall();
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    startOnlineButton.addEventListener('click', () => {
        localPlayerMode = false;
        startLocalButton.disabled = true;
        startOnlineButton.disabled = true;
        console.log("YUUUUUU");

        displayMenu();
    });

    function gameLoop() {
        update();
        draw();

        if (!isGameOver) {
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

}




