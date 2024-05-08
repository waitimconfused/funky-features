import { globalGraph, getRegexGroups } from "../index.js";
import { getFileOptions } from "./options.js";
import Node from "../display/nodes.js";
import { showFile } from "./show.js";
import { keyboard } from "../../toolkit/keyboard.js";

var readFiles = [];
var readFileNodes = [];

export async function readFile(fileName="", nodeConnector){

	if(readFileNodes.length > 10) return;

	if(/\/(\w*)$/gm.test()) fileName += "."+nodeConnector.title.split(".")[nodeConnector.title.split(".").length-1]
	let fileID = `${fileName}`;
	if(nodeConnector) while(fileID.startsWith(".")) fileID = fileID.replace(".", "");

	if(readFiles.includes(fileID)){
		let fileIndex = readFiles.indexOf(fileID);
		nodeConnector.connectTo(readFileNodes[fileIndex]);
		return undefined;
	}

	var fileNode = new Node(fileID);
	fileNode.addEventListener("dblclick", () => {
		keyboard.setKey("shift", false);
		showFile(fileNode.display.title);
	});
	if(fileName.match(/\..+$/g)?.length > 0){
		let fileExtension = getFileOptions(fileName).extension;
		fileNode.addTag(fileExtension);
	}
	fileNode.setValue(fileName);
	readFiles.push(fileID);
	readFileNodes.push(fileNode);

	if(readFiles.length == 1){
		fileNode.moveTo(0, 0);
	}else{
		fileNode.moveTo(
			(Math.random() * globalGraph.canvas.width - globalGraph.canvas.width / 2),
			(Math.random() * globalGraph.canvas.height - globalGraph.canvas.height / 2)
		);
	}

	nodeConnector?.connectTo(fileNode);

	let file = await fetch(fileName, {
		mode: 'no-cors'
	});
	if(file.status == "404") {
		fileNode.setTitle("404");
		fileNode.display.glyph = "404";
	}
	let fileContents = await file.text();
	let options = getFileOptions(fileName).data;
	let linkRegex = options?.links;
	let fileImportIndex = options?.linkPathIndex || 0;

	for(let linkRegexIndex = 0; linkRegexIndex < (linkRegex?.length || 0); linkRegexIndex ++){
		let regex = linkRegex[linkRegexIndex];
		let imports = getRegexGroups(regex, fileContents);

		for(let importIndex = 0; importIndex < imports.length; importIndex ++){
			let importFile = imports[importIndex];
			readFile(moveDirectory(fileName, importFile.at(fileImportIndex+1)), fileNode);
		}
	}
}

export function moveDirectory(oldDir="", appendDir=""){

	// oldDir = oldDir.replaceAll(/(\w{1,}\.\w{1,})/g, "");

	if(/^https{0,1}:/g.test(appendDir)) return appendDir;
	if(/^data:/g.test(appendDir)) return appendDir+".png";

	let returnedDir = "";

	if(appendDir.startsWith("/")) returnedDir =  appendDir;

	if(appendDir.startsWith("./")) {
		returnedDir = oldDir.replace(/\/\w+?\.\w+?$/,"") + "/" + appendDir.replace(/^\.\//, "");
	}
	
	if(appendDir.startsWith("../")) {
		returnedDir = oldDir.replace(/(\/\w+?\/\w+?\.\w+?)$/, "") + "/" + appendDir.replace(/^\.\.\//, "");
	}

	while(returnedDir.includes("/./") && returnedDir.includes("//")){
		returnedDir = returnedDir.replaceAll("/./", "/");
		returnedDir = returnedDir.replaceAll("//", "/");
	}

	if(returnedDir.startsWith(".") == false && appendDir.startsWith("/") == false) returnedDir = "." + returnedDir;

	// console.log({
	// 	current: oldDir,
	// 	append: appendDir,
	// 	result: returnedDir
	// });
	return returnedDir;
}