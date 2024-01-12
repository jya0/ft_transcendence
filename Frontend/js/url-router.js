const urlPageTitle = "Pong Os";

// create document click that watches the nav links only
document.addEventListener("click", (e) => {
	const { target } = e;
	if (!target.matches("nav a")) {
		return;
	}
	e.preventDefault();
	urlRoute();
});

// create an object that maps the url to the template, title, and description
const urlRoutes = {
	404: {
		template: "/components/404.html",
		title: "404 | " + urlPageTitle,
		description: "Page not found",
	},
	"/": {
		template: "/components/index.html",
		title: "Login | " + urlPageTitle,
		description: "Login Page",
	},
	"/desktop": {
		template: "/components/about.html",
		title: "About Us | " + urlPageTitle,
		description: "This is the about page",
	},
	"/profile": {
		template: "/components/contact.html",
		title: "Contact Us | " + urlPageTitle,
		description: "This is the contact page",
	},
	"/play": {
		template: `/components/home.html`,
		title: "Contact Us | " + urlPageTitle,
		description: "This is the contact page",
	},
    "/users": {
		template: `/components/home.html`,
		title: "Contact Us | " + urlPageTitle,
		description: "This is the contact page",
	},
    "/profile/user": {
		template: "/components/contact.html",
		title: "Contact Us | " + urlPageTitle,
		description: "This is the contact page",
	},
};

// create a function that watches the url and calls the urlLocationHandler
const urlRoute = (event) => {
	event = event || window.event; // get window.event if event argument not provided
	event.preventDefault();
	// window.history.pushState(state, unused, target link);
	if (localStorage.getItem('access_token'))
		window.history.pushState({}, "", event.target.href);
	urlLocationHandler();
};

// create a function that handles the url location
const urlLocationHandler = async () => {
	let location = window.location.pathname; // get the url path
	console.log("location:", location);
	// if the path length is 0, set it to primary page route
	if (location.length == 0) {
		location = "/";
	}
	if (!localStorage.getItem('access_token')) {
		location = '/home';
	}
	// get the route object from the urlRoutes object
	const route = urlRoutes[location] || urlRoutes["404"];
	// get the html from the template
	const html = await fetch(route.template).then((response) => response.text());
	// set the content of the content div to the html
	document.getElementById("content").innerHTML = html;
	document.getElementById("data-container").innerHTML = '';
	// set the title of the document to the title of the route
	document.title = route.title;
	// set the description of the document to the description of the route
	document
		.querySelector('meta[name="description"]')
		.setAttribute("content", route.description);
};

// add an event listener to the window that watches for url changes
window.onpopstate = urlLocationHandler;
// call the urlLocationHandler function to handle the initial url
window.route = urlRoute;
// call the urlLocationHandler function to handle the initial url
urlLocationHandler();

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (token) {
	console.log('Token:', token);
	localStorage.setItem('access_token', token);
	let userData;
	fetch('http://localhost:8000/api/get_user_data/', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
	})
		.then(response => {
			if (!response.ok) {
				response.statusText === 'Unauthorized' ? alert('Unauthorized') : alert('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			userData = data[0];
			if (!userData) {
				console.log("No user data");
				return;
			}
			console.log("User data:", data);
			
			localStorage.setItem('username', userData['username']);
		})
}

const url = new URL(window.location.href);
url.search = '';
const mainUrl = url.toString();

history.replaceState({}, '', mainUrl);
