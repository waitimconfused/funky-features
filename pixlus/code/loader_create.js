import reloadTexts from "./pages/web_fonts.js";

var keyboardClickFunctionCached = () => {};
var keyboardUnclickFunctionCached = () => {};

var MouseClickFunctionCached = () => {};
var MouseUnclickFunctionCached = () => {};

export var loader = document.createElement("div");

export async function show(message="") {


	keyboardClickFunctionCached = document.onkeydown;
	keyboardUnclickFunctionCached = document.onkeyup;

	MouseClickFunctionCached = document.onmousedown;
	MouseUnclickFunctionCached = document.onmouseup;

	document.onkeydown = () => {};


	loader.setAttribute("class", "loader");
	loader.setAttribute("style", `--character-length: ${message.length};`)
	loader.setAttribute("active", "");
	document.body.appendChild(loader);
	
	let loader_dot = document.createElement("div");
	loader_dot.setAttribute("class", "dot");
	loader.appendChild(loader_dot);
	
	let loader_line = document.createElement("div");
	loader_line.setAttribute("class", "line");
	loader.appendChild(loader_line);
	
	let loader_message = document.createElement("div");
	loader_message.setAttribute("class", "message");
	loader.appendChild(loader_message);
	let loader_message_content = document.createElement("h1");
	loader_message_content.innerHTML = message;
	loader_message.appendChild(loader_message_content);

	loader.click();

	reloadTexts();
}

export async function hide(){
	loader.removeAttribute("active");

	setTimeout(() => {
		loader.remove();
		document.onkeydown = keyboardClickFunctionCached;
		document.onkeyup = keyboardUnclickFunctionCached;

		document.onmousedown = MouseClickFunctionCached;
		document.onmouseup = MouseUnclickFunctionCached;
	}, 1000);
}