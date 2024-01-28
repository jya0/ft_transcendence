
export const loadGameMenu = () => {
	document.getElementById("windowScreen").innerHTML =
		`
			<div class="row p-0 m-0 d-flex mh-100 mw-100 h-100 w-100 overflow-auto border border-0 border-danger" id="gameMenu">
				<!-- BACKGROUND DECOR -->
				<div class="position-absolute z-0 h-100 w-100">
					<div class="d-flex h-25 w-25 position-absolute end-50 border border-0 border-danger align-items-center justify-content-end pe-3">
						<div class="d-flex h-50 border border-0 border-danger">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
								<title>weather-meteor</title><g><path d="M30.47 9.15H32v1.52h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M30.47 4.57H32V6.1h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M30.47 0H32v1.53h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M28.95 13.72h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M28.95 6.1h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M28.95 1.53h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M27.43 15.24h1.52v1.53h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M27.43 7.62h1.52v1.53h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M27.43 3.05h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M25.9 16.77h1.53v3.04H25.9Z" fill="#ffffff" stroke-width="1"></path><path d="M25.9 10.67h1.53v1.52H25.9Z" fill="#ffffff" stroke-width="1"></path><path d="M25.9 4.57h1.53V6.1H25.9Z" fill="#ffffff" stroke-width="1"></path><path d="M25.9 0h1.53v1.53H25.9Z" fill="#ffffff" stroke-width="1"></path><path d="M24.38 19.81h1.52v3.05h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M24.38 12.19h1.52v1.53h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M24.38 6.1h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M24.38 1.53h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M22.85 22.86h1.53v3.05h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M22.85 3.05h1.53v1.52h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M21.33 15.24h1.52v1.53h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M21.33 9.15h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M21.33 0h1.52v1.53h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M19.81 25.91h3.04v1.52h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M19.81 4.57h1.52V6.1h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M19.81 1.53h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M18.28 27.43h1.53v1.53h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M18.28 12.19h1.53v1.53h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M16.76 7.62h1.52v1.53h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M16.76 1.53h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M15.24 28.96h3.04v1.52h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M15.24 9.15h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M13.71 3.05h3.05v1.52h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M9.14 30.48h6.1V32h-6.1Z" fill="#ffffff" stroke-width="1"></path><path d="M12.19 4.57h1.52V6.1h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M9.14 6.1h3.05v1.52H9.14Z" fill="#ffffff" stroke-width="1"></path><path d="M15.24 27.43v-1.52h1.52v-1.53h1.52v-1.52h1.53v-6.09h-1.53v-1.53h-1.52v-1.52h-1.52v-1.53h-6.1v1.53H7.62v1.52H6.09v1.53H4.57v6.09h1.52v1.52h1.53v1.53h1.52v1.52Zm-3.05 -12.19h3.05v1.53h1.52v1.52h1.52v3.05h-1.52v-3.05h-1.52v-1.52h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M4.57 28.96h4.57v1.52H4.57Z" fill="#ffffff" stroke-width="1"></path><path d="M6.09 7.62h3.05v1.53H6.09Z" fill="#ffffff" stroke-width="1"></path><path d="M4.57 9.15h1.52v1.52H4.57Z" fill="#ffffff" stroke-width="1"></path><path d="M3.05 27.43h1.52v1.53H3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M3.05 10.67h1.52v1.52H3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M1.52 24.38h1.53v3.05H1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M1.52 12.19h1.53v3.05H1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M0 15.24h1.52v9.14H0Z" fill="#ffffff" stroke-width="1"></path></g>
							</svg>
						</div>
					</div>
					<div class="d-flex h-25 w-25 position-absolute end-0 bottom-0 border border-0 border-danger align-items-center justify-content-center">
						<div class="d-flex h-75 border border-0 border-danger">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
								<title>entertainment-events-hobbies-board-game-dice</title><g><path d="M17.525 31.24v-1.52h3.04v-1.53h3.05v-1.52h3.05v-1.53h1.52v-1.52h1.53V8.38h-1.53V6.86h-1.52v1.52h-3.05v1.53h-3.05v1.52h-3.04v1.52h-3.05v1.53H16v15.24h-1.52v1.52Zm6.09 -18.29h3.05v1.53h-3.05Zm-4.57 9.15H22.1v3.04h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M23.615 5.34h3.05v1.52h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M20.565 3.81h3.05v1.53h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M17.525 2.29h3.04v1.52h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M14.475 6.86h3.05v3.05h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M14.475 0.76h3.05v1.53h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M11.425 28.19h3.05v1.53h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M11.425 11.43h3.05v1.52h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M11.425 2.29h3.05v1.52h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M11.425 22.1h3.05v3.04h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M11.425 16h3.05v3.05h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M8.375 26.67h3.05v1.52h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M8.375 9.91h3.05v1.52h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M8.375 3.81h3.05v1.53h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M5.335 25.14h3.04v1.53h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M5.335 8.38h3.04v1.53h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M5.335 5.34h3.04v1.52h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M5.335 19.05h3.04v3.05h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M5.335 12.95h3.04V16h-3.04Z" fill="#ffffff" stroke-width="1"></path><path d="M3.805 23.62h1.53v1.52h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M3.805 6.86h1.53v1.52h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M2.285 8.38h1.52v15.24h-1.52Z" fill="#ffffff" stroke-width="1"></path></g>
							</svg>
						</div>
					</div>
				</div>
				<!-- PONG -->
				<div class="col-6 m-0 bg-black border border-1 border-light">
					<div class="position-relative z-1 mt-5 pt-5 d-flex flex-column gap-5 align-items-center border border-0 border-danger">
						<div class="font--argent display-3 text-white text-capitalize text-center text--shadow border border-0 border-danger">
							pong
						</div>
						<div class="w-75 d-flex flex-column gap-4 border border-0 border-danger">
							<a href="/games_pong_local" class="focus-ring p-1 focus--light btn btn-light rounded-1">
								<div class="text-capitalize font--argent h1">
									local
								</div>
							</a>
							<a href="/games_pong_online" class="focus-ring p-1 focus--light btn btn-light rounded-1">
								<div class="text-capitalize font--argent h1">
									online
								</div>
							</a>
							<a href="/games_pong_local_tournament" class="focus-ring p-1 focus--light btn btn-light rounded-1">
								<div class="text-capitalize font--argent h1">
									local tournament
								</div>
							</a>
							<a href="/games_pong_online_tournament" class="focus-ring p-1 focus--light btn btn-light rounded-1">
								<div class="text-capitalize font--argent h1">
									online tournament
								</div>
							</a>
						</div>
					</div>
				</div>
				<!-- TIC TAC TOE -->
				<div class="col-6 m-0 bg-black border border-1 border-light">
					<div class="position-relative z-1 mt-5 pt-5 d-flex flex-column gap-5 align-items-center border border-0 border-danger">
						<div class="font--argent display-3 text-white text-capitalize border border-0 border-danger text-center">
							tic-tac-toe
						</div>
						<div class="w-75 d-flex flex-column gap-4 border border-0 border-danger">
							<a href="/games_tictactoe_local" class="focus-ring p-1 focus--light btn btn-light rounded-1">
								<div class="text-capitalize font--argent h1">
									local
								</div>
							</a>
							<a href="/games_tictactoe_online" class="focus-ring p-1 focus--light btn btn-light rounded-1">
								<div class="text-capitalize font--argent h1">
									online
								</div>
							</a>
						</div>
					</div>
				</div>
			</div>
			<script src="/js/pong.js" type="module"></script>


		`
}

export const loadGameCanvas = () => {
    console.log("LOADCANVAS");
    console.log(document.getElementById('windowScreen').getBoundingClientRect().width);
    if (!document.getElementById("gameCanvas")) {
        let canvasElement = document.createElement('canvas');
        canvasElement.id = 'gameCanvas';
        canvasElement.width = 1200;
        canvasElement.height = 900;
		// canvasElement.style.margin = '0 auto';
        // let scale =	(document.getElementById('windowScreen').getBoundingClientRect().width) / (canvasElement.width);
        canvasElement.style.scale = 1;
        const ctx = canvasElement.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        document.getElementById('windowScreen').appendChild(canvasElement);
    }
}

export const loadToast = (message) => {
	const toastAlert = document.getElementById('mainToast');
	toastAlert.querySelector('.toast-body').innerHTML = message;
	const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastAlert);
	toastBootstrap.show();
};

// export const loadModal = (innerContent) => {
// 	document.getElementById('modalMainBody').innerHTML = innerContent;
// };

export const loadModal = (innerHTML) => {
	document.getElementById('modalMainBody').innerHTML = innerHTML;
};

export const loadSpinner = (elementId) => {
	document.getElementById(elementId).innerHTML = 
	`
		<div class="d-flex h-100 w-100 justify-content-center align-items-center">
			<div id="spinner" class="d-flex flex-column justify-content-center align-items-center gap-5">
				<div class="spinner-grow display-1 text-white" style="width: 5vw; height: 5vw;" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
				<p class="m-0 p-0 font--neue text-white text-capitalize display-1">Hang tight...</p>
			</div>
		</div>
	`;
}