var cachedPages = {};

reloadTemplateElements();
async function reloadTemplateElements(){
	let templateElements = document.querySelectorAll("template[from]");

	for(let index = 0; index < templateElements.length; index ++){
		let replaceMe = templateElements[index];

		let importPath = replaceMe.getAttribute("from");
		if(!importPath) continue;

		let id = replaceMe.id;
		let html = "";

		if(importPath in cachedPages) {
			html = cachedPages[importPath];
		} else {
			let response = await fetch(importPath);
			html = await response.text();
		}
		
		let iframe = document.createElement("iframe");
		iframe.style.display = "none";
		iframe.src = "about:blank";
		document.body.appendChild(iframe);
		iframe.contentWindow.document.documentElement.innerHTML = html;

		cachedPages[importPath] = html;

		let template = iframe.contentWindow.document.querySelector(`template#${id}`) || document.createElement("template");
		template = template.content.cloneNode(true);
		replaceMe.replaceWith(template);
		document.body.removeChild(iframe);
	}
}