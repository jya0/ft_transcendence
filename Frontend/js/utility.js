import { loadToast } from "./loadComponent.js";

export const querySelectIdEditInnerHTML = (docElement, id, innerHTML) => {
	if (!docElement)
	{
		return ;
	}
	let queryElement = docElement.querySelector("#" + id);
	if (!queryElement)
	{
		return ;
	}
	queryElement.innerHTML = innerHTML;
};

export const elementIdEditInnerHTML = (id, innerHTML) => {
	let docElement = document.getElementById(id);
	if (!docElement)
	{
		return ;
	}
	docElement.innerHTML = innerHTML;
};

export const checkName = (name) => {
	var usernameRegex = /^[a-zA-Z0-9]+$/;

	if (!name || name.trim().length === 0 || name.trim().length < 5) {
		loadToast('Display name should not be empty, more than 5 characters and less than 50 characters');
		return (false);
	}
	else if (!name.match(usernameRegex)) {

		loadToast('Name should only include alphanumic characters!');
		return (false);
	}
	else if (name.length >= 15) {
		loadToast('Name should be less then 15 characters');
		return (false);
	}
	return (true);
};
