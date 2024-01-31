

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
