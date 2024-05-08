import * as fs from "node:fs";
import * as MESSAGES from "../messages/index.js";
import TYPES from "./types.json" assert {type: "json"};
import exp from "node:constants";

export var visibility = true;

export var page_404 = "/404.html";

/**
 * Disable the ability to return files to any client
 */
export function hide(){
	visibility = false;
}
/**
 * Enable the ability to return files to any client (default)
 */
export function show(){
	visibility = true;
}
/**
 * SERVER-SIDE
 * 
 * If a file can not be found, return a 404 page, in its place.
 * 
 * @param { string } path path to file the 404 page
 */
export function regester404(path=page_404){
	page_404 = path
}
/**
 * SERVER-SIDE
 * 
 * INTERNAL/EXTERNAL FUNCTION
 * 
 * Get a files contents from path, relative to the `server.js` file
 * 
 * INTERNALLY: Acts as the file-fetcher, when a client requests a file:
 * 
 * - `/path/` turns into `/path/index.html` OR `/path/index.htm`
 * - `/path/page` turns into `/path/page.html` OR `/path/page.htm`
 * 
 * @param { string } callback path to file, relative to the `server.js` file
 * @returns { object } { type:string, content: string }
 */
export function get(path=""){
	if(path.startsWith("./") == false){
		if(path.startsWith("/") == false) path = "/" + path;
		if(path.startsWith(".") == false) path = "." + path;
	}

	if(path.includes("?")){
		path = path.split("?")[0];
	}

	if(visibility == false) return {
		type: "text/plain",
		content: MESSAGES.code("403", path),
		status: 403
	};

	if(path.split(/(\w*\.\w*)$/).length == 1 && !path.endsWith("/")){
		if(fs.existsSync(path+".html")) path += ".html";
		else if(fs.existsSync(path+".htm")) path += ".htm";
		else if(fs.existsSync(path+"/")) return {
			type: "text/plain",
			header: {
				Location: "/"+path+"/"
			},
			content: "",
			status: 302
		};
		else {
			MESSAGES.code("404", path);
			let content404 = get(page_404);
			content404.status = 404;
			return content404;
		}
	}

	if(fs.existsSync(path) == false){
		MESSAGES.code("404", path);
		let content404 = get(page_404);
		content404.status = 404;
		return content404;
	}

	if(path.endsWith("/")){
		let message = "";

		if(fs.existsSync(path+"/index.html")){
			message = fs.readFileSync(path+"/index.html");
		}else if(fs.existsSync(path+"/index.htm")){
			message = fs.readFileSync(path+"/index.htm");
		}

		if(message == "") return {
			type: "text/plain",
			content: MESSAGES.code("404-dir", path),
			status: 404
		};

		return {
			type: "text/html",
			content: message,
			status: 200
		};
	}

	let pathArray = path.split(".");
	let fileType = "." + pathArray[pathArray.length- 1]

	let content_type = TYPES[fileType] || "";
	let fileContent = fs.readFileSync(path);

	return {
		type: content_type,
		content: fileContent,
		status: 200,
	};

}