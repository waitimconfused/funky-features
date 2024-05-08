reloadTemplateElements();
async function reloadTemplateElements(){
	let templateElements = document.querySelectorAll("template[from]");

	for(let index = 0; index < templateElements.length; index ++){
		let replaceMe = templateElements[index];

		let importPath = replaceMe.getAttribute("from");
		let id = replaceMe.id;

		if(!importPath) continue;

		let response = await fetch(importPath);
		let html = await response.text();
		
		let iframe = document.createElement("iframe");
		iframe.style.display = "none";
		iframe.src = "about:blank";
		document.body.appendChild(iframe);
		iframe.contentWindow.document.open();
		iframe.contentWindow.document.write(html);
		iframe.contentWindow.document.close();

		let template = iframe.contentWindow.document.querySelector(`template#${id}`) || document.createElement("template");
		template = template.content.cloneNode(true);
		replaceMe.replaceWith(template);
		document.body.removeChild(iframe);
	}
}