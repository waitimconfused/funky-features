import * as fs from "node:fs";
import * as MESSAGES from "../messages/index.js";
import * as Ast from "../index.js";
import TYPES from "./types.json" assert {type: "json"};

export var visibility = true;

var registeredFiles = [];

export var statusPages = {
	"404": "/404.html"
};

export var lockedIP = false;

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
export function regester404(path=statusPages["404"]){
	statusPages["404"] = path
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
export function get(path="", IP=""){

	if(lockedIP && !Ast.isThisMachine(IP)){
		MESSAGES.code("403", path);
		let content404 = MESSAGES.code("403", path);
		if(statusPages["403"]) content404 = get(statusPages["403"]);
		content404.status = 404;
		return content404;
	}

	if(path.startsWith("./") == false){
		if(path.startsWith("/") == false) path = "/" + path;
		if(path.startsWith(".") == false) path = "." + path;
	}

	if(path.includes("?")){
		path = path.split("?")[0];
	}

	if(visibility == false){
		let content404 = MESSAGES.code("403", path);
		if(statusPages["403"]) content404 = get(statusPages["403"]);
		content404.status = 404;
		return content404;
	}

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
			let content404 = MESSAGES.code("404", path);
			if(statusPages["404"]) content404 = get(statusPages["404"]);
			content404.status = 404;
			return content404;
		}
	}

	if(fs.existsSync(path) == false){
		if(fs.existsSync(path+".html")) {
			let fileContent = fs.readFileSync(path+".html");
			return {
				type: "text/html",
				content: fileContent,
				status: 200
			};
		}
		MESSAGES.code("404", path);
		let content404 = MESSAGES.code("404", path);
		if(statusPages["404"]) content404 = get(statusPages["404"]);
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

/**
 * SERVER-SIDE
 * 
 * Locks all API endpoints to the device opening the server
*/
export function lock(){
	lockedIP = true;
}

/**
 * SERVER-SIDE
 * 
 * Allowes all devices to access the API endpoints
*/
export function unlock(){
	lockedIP = false;
}