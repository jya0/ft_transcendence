

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