
import { querySelectIdEditInnerHTML, elementIdEditInnerHTML } from "./utility.js";
import { urlLocationHandler } from "./url-router.js"

let LOGIN_PAGE_HTML = '';

await fetch('/components/login.html').then(response => response.text()).then(data => {
	LOGIN_PAGE_HTML = data;
});

export	let	TM_BRACKET = "";

await fetch('/components/tournament-bracket.html').then(response => response.text()).then(data => {
	TM_BRACKET = data;
});

export	let	GAME_MENU = "";

await fetch('/components/game-menu.html').then(response => response.text()).then(data => {
	GAME_MENU = data;
});

export const loadGameMenu = () => {
	elementIdEditInnerHTML("windowScreen", GAME_MENU);
}

export const loadGameCanvas = () => {

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
	document.getElementById('windowScreen')?.appendChild(canvasElement);
}

export const loadToast = (message) => {
	const toastAlert = document.getElementById('mainToast');
	if (!toastAlert)
		return;
	// toastAlert.querySelector('.toast-body').innerHTML = message;
	querySelectIdEditInnerHTML(toastAlert, "toast-text", message);
	const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastAlert);
	toastBootstrap.show();
};


// export const loadModal = (innerContent) => {
// 	document.getElementById('modalSettingBody').innerHTML = innerContent;
// };

export const loadModal = (idModalBody, innerHTML) => {
	elementIdEditInnerHTML(idModalBody, innerHTML);
};

export const showModal = (idModal) => {
	const docModal = document.getElementById(idModal);

	if (docModal)
	{
		const tmpModal = bootstrap.Modal.getOrCreateInstance(docModal);
		tmpModal.show();
	}
}

export const hideModal = (idModal) => {
	const docModal = document.getElementById(idModal);
	if (docModal)
	{

		const tmpModal = bootstrap.Modal.getOrCreateInstance(docModal);
		tmpModal.hide();
	}
}

export const	modalMenuDisposeEvent = new Event("modalMenuDisposeEvent");

export	const loadModalMenu = (idModal, innerHTML) => {
	let	isDefaultAction;

	elementIdEditInnerHTML(idModal + "Body", innerHTML);
	isDefaultAction = false;
	document.addEventListener("modalMenuDisposeEvent", event => {
		isDefaultAction = true;
		hideModal(idModal);
		// document.removeEventListener("modalMenuDisposeEvent", event);
	});
	document.getElementById(idModal)?.addEventListener('hidden.bs.modal', event => {
		if (isDefaultAction)
			return ;
		window.history.pushState({}, "", '/play');
		urlLocationHandler();
	});
}

export const showGameWinner = (winner) => {
	loadModal('modalGameBody',
		`<div class="d-flex flex-column h-100 w-100 mh-100 mw-100 overflow-hidden font--neue align-items-center justify-content-center gap-2 border border-1 border-white bg-black">
			<div class="d-flex p-0 m-0 h-25 w-25 animation--updown">
				<div class="ratio ratio-1x1">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><title>interface-essential-crown</title><g><path d="M29.715 9.145h1.52v3.04h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M26.665 7.615h3.05v1.53h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="m26.665 18.285 1.53 0 0 -4.57 1.52 0 0 -1.53 -3.05 0 0 -3.04 -1.52 0 0 4.57 1.52 0 0 4.57z" fill="#ffffff" stroke-width="1"></path><path d="m25.145 19.805 -1.53 0 0 1.53 1.53 0 0 1.52 -18.29 0 0 -1.52 1.53 0 0 -1.53 -1.53 0 0 -1.52 -1.52 0 0 7.62 1.52 0 0 1.52 18.29 0 0 -1.52 1.52 0 0 -7.62 -1.52 0 0 1.52z" fill="#ffffff" stroke-width="1"></path><path d="M23.615 13.715h1.53v1.52h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M22.095 15.235h1.52v1.53h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M20.575 16.765h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M19.045 19.805h3.05v1.53h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M19.045 13.715h1.53v3.05h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M17.525 10.665h1.52v3.05h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M17.525 6.095h1.52v3.05h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M14.475 9.145h3.05v1.52h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M14.475 4.575h3.05v1.52h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M14.475 18.285h3.05v3.05h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M12.955 10.665h1.52v3.05h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M12.955 6.095h1.52v3.05h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M11.425 13.715h1.53v3.05h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="M9.905 19.805h3.05v1.53h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M9.905 16.765h1.52v1.52h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M8.385 15.235h1.52v1.53h-1.52Z" fill="#ffffff" stroke-width="1"></path><path d="M6.855 13.715h1.53v1.52h-1.53Z" fill="#ffffff" stroke-width="1"></path><path d="m2.285 12.185 0 1.53 1.53 0 0 4.57 1.52 0 0 -4.57 1.52 0 0 -4.57 -1.52 0 0 3.04 -3.05 0z" fill="#ffffff" stroke-width="1"></path><path d="M2.285 7.615h3.05v1.53h-3.05Z" fill="#ffffff" stroke-width="1"></path><path d="M0.765 9.145h1.52v3.04H0.765Z" fill="#ffffff" stroke-width="1"></path></g></svg>
				</div>
			</div>
			<p class="display-1 text-uppercase text-white text-center animation--updown">
			Winner:	${winner}
			</p>
		</div>`);
	showModal("modalGame");
};

export const loadSpinner = (elementId, color) => {
	elementIdEditInnerHTML(elementId,
		`
			<div class="d-flex h-100 w-100 justify-content-center align-items-center">
				<div id="spinner" class="d-flex flex-column justify-content-center align-items-center gap-5 ${color}">
					<div class="spinner-grow display-1" style="width: 5vw; height: 5vw;" role="status">
						<span class="visually-hidden">Loading...</span>
					</div>
					<p class="m-0 p-0 font--neue text-capitalize display-1">Hang tight...</p>
				</div>
			</div>
		`);
}

// export function loadLoginPage(message) {
// 	console.log("loadLoginPage");
// 	elementIdEditInnerHTML("main-content", LOGIN_PAGE_HTML);
// 	if (!document.getElementById("main-content"))
// 		return ;
// 	// document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
// 	if (message) {
// 		console.log("loadLoginPage message");
// 		loadToast(message);
// 	}
// 	localStorage.clear();
// 	const docModalSetting = document.getElementById('modalSetting');
// 	const tmpModalSetting = bootstrap.Modal.getOrCreateInstance(docModalSetting);
// 	tmpModalSetting.hide();
// }


export function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === name + '=') {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

export async function loadLoginPage(message) {
	document.getElementById("main-content").innerHTML = LOGIN_PAGE_HTML;
	if (message) {
		loadToast(message);
	}
	localStorage.clear();
	await fetch('/api/logout/', {
		credentials: 'include',
	})
		.then(response => {
			if (!response.ok) {
				return null
			}
			return null;
		})
	const docModalAll = document.querySelectorAll(".modal");
	const tmpModalBs = '';
	docModalAll.forEach(element => {
		tmpModalBs = bootstrap.Modal.getOrCreateInstance(element);
		tmpModalBs.hide();
	});
}
