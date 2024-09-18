var cachedPages = {};
var cachedTemplates = {};

for (let key in sessionStorage) {
	if (key.startsWith("template.") == false) continue;

	let value = sessionStorage.getItem(key);

	cachedTemplates[key.replace(/^template\./, "")] = value;
}

export async function reloadTemplateElements(doubleReload=true){
	let templateElements = document.querySelectorAll("template[from]");

	for(let index = 0; index < templateElements.length; index ++){
		let replaceMe = templateElements[index];

		let importPath = replaceMe.getAttribute("from");
		if(!importPath) continue;
		let absolutePath = new URL(importPath, location.origin).href;

		let id = replaceMe.id;
		let html = "";

		if (absolutePath+"#"+id in cachedTemplates && doubleReload) {
			html = cachedTemplates[absolutePath+"#"+id];
			
			fetch(importPath)
			.then((response) => {
				return response.text()
			}).then((html) => {
				let templateNode = document.querySelector(`[template-href="${importPath}"][template-id="${id}"]`);
				loadTemplateElement(templateNode, html, importPath, id);
				cachedPages[importPath] = html;
				cachedTemplates[absolutePath+"#"+id] = html;
				sessionStorage.setItem("template."+absolutePath+"#"+id, html);
			})
		} else if(importPath in cachedPages) {
			html = cachedPages[importPath];
		} else {
			let response = await fetch(importPath);
			html = await response.text();
		}
		
		loadTemplateElement(replaceMe, html, importPath, id);

		cachedPages[importPath] = html;
		cachedTemplates[absolutePath+"#"+id] = html;
		sessionStorage.setItem("template."+absolutePath+"#"+id, html);
	}
}

function loadTemplateElement(replaceMe, html, path, id) {
	let iframe = document.createElement("iframe");
	iframe.style.display = "none";
	iframe.src = "about:blank";
	document.body.appendChild(iframe);
	iframe.contentWindow.document.documentElement.innerHTML = html;

	let template = iframe.contentWindow.document.querySelector(`template#${id}`) || document.createElement("template");
	template = template.content.cloneNode(true);

	let contentDiv = document.createElement("div");
	contentDiv.setAttribute("template-href", path);
	contentDiv.setAttribute("template-id", id);
	contentDiv.appendChild(template);
	replaceMe.replaceWith(contentDiv);
	document.body.removeChild(iframe);
}