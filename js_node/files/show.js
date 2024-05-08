import { globalGraph } from "../index.js";
import { moveDirectory } from "./index.js";
import { fileOptions, getFileOptions } from "./options.js";

export async function showFile(source=""){
	globalGraph.setSize("50%", "100%");
	let response = await fetch(source);
	let text = await response.text();
	let textSpace = document.getElementById("filespace");
	if(!textSpace){
		textSpace = document.createElement("ol");
		document.body.appendChild(textSpace);
		textSpace.id = "filespace";
	}
	window.reloadCode = reloadCode;
	window.showFile = (src="") => {
		let newPath = moveDirectory(source, src);
		showFile(newPath);
	};
	window.reloadCode(source, text);
}
function reloadCode(source="", text=""){

	let filetype = getFileOptions(source).extension;

	let code = document.getElementById("filespace");
	let lines = text.split("\n");
	code.innerHTML = "";
	code.style.backgroundImage = "none";

	if(filetype == ".md"){
		code.innerHTML = text
			.replaceAll(/^### {0,}(.*$)/gim, '<h3>$1</h3>')
			.replaceAll(/^## {0,}(.*$)/gim, '<h2>$1</h2>')
			.replaceAll(/^# {0,}(.*$)/gim, '<h1>$1</h1>')
			.replaceAll(/\*\*(.*)\*\*/gim, '<b>$1</b>')
			.replaceAll(/\*(.*)\*/gim, '<i>$1</i>')
			.replaceAll(/\`\`\`([\s\S\w\W]*)\`\`\`/gim, '<code class="code-block">$1</code>')
			.replaceAll(/\`(.*)\`/gim, '<code class="code-inline">$1</code>')
			.replaceAll(/\[(.*)\]\((.*)\)/g, "<a class='link' title='$2' onclick='window.showFile(`$2`)'>$1</a>")
			.replaceAll("\n", "<br>")
			.replaceAll("  ", "\t");
	}else if(filetype == ".jpg"){
		code.style.backgroundImage = "url("+source+")";
		code.style.backgroundSize = "contain";
		code.style.backgroundRepeat = "no-repeat";
	}else{
		for(let lineNumber = 0; lineNumber < lines.length; lineNumber ++){
			let line = lines[lineNumber];

			let codeLineElement = document.createElement("li");
			codeLineElement.innerText = line;
			code.appendChild(codeLineElement);
		}
	}
}