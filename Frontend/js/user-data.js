import { elementIdEditInnerHTML } from "./utility.js";

function updateTime() {
	const monthNames = ["January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"];
	const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	const now = new Date();

	let year = now.getFullYear();
	let month = now.getMonth();
	let dow = now.getDay();
	let dom = now.getDate();
	let hours = now.getHours();
	let minutes = now.getMinutes();
	let seconds = now.getSeconds();

	let ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	hours = hours < 10 ? '0' + hours : hours;
	seconds = seconds < 10 ? '0' + seconds : seconds;

	let formatDate = dayNames[dow].substring(0, 3) + " " + dom + " " + monthNames[month].substring(0, 3) + " " + hours + ":" + minutes + ":" + seconds + " " + ampm;
	elementIdEditInnerHTML("datetime", formatDate);
}

let windowInterval = setInterval(updateTime, 1000);

function updateInterval() {
    clearInterval(windowInterval);
    windowInterval = setInterval(updateTime, 1000);
}

setTimeout(updateInterval, 1100);
