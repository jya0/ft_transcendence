

export const querySelectIdEditInnerHTML = (docElement, id, innerHTML) => {
	if (!docElement)
	{
		console.log("Doc element parameter is undefined!");
		return ;
	}
	let queryElement = docElement.querySelector("#" + id);
	if (!queryElement)
	{
		console.log("Couldn't find your query element!");
		return ;
	}
	queryElement.innerHTML = innerHTML;
};

export const elementIdEditInnerHTML = (id, innerHTML) => {
	let docElement = document.getElementById(id);
	if (!docElement)
	{
		console.log("Couldn't find your document element!");
		return ;
	}
	docElement.innerHTML = innerHTML;
};

export const checkName = (name) => {
	if (!name || name.trim().length === 0 || name.trim().length < 5) {
		loadToast('Display name should not be empty, more than 5 characters and less than 50 characters');
		return (false);
	}
	else if (name.length >= 50) {
		loadToast('Size of display name should be less than 50 characters');
		return (false);
	}
	return (true);
};