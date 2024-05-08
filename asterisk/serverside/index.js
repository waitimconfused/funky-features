import * as API from "./api.js";
import * as FILES from "../files/index.js";
import * as MESSAGE from "../messages/index.js";
import http from "node:http";

var SERVER = null;

/**
 * SERVER-SIDE
 * 
 * The port number that the server is hosted on
 * 
 * When opening a local server, use `Ast.serverside.open(<PORT>);`
*/
export var port = 0;

/**
 * SERVER-SIDE
 * 
 * Open a port on the current machine, on any specified port number
 * 
 * Example:
 * ```js
 * Ast.serverside.open(8080);
 * 
 * // Server opened on port "8080"
 * // To view: http://localhost:8080
 * ```
*/
export function open(portNumber=8080){
	port = portNumber;

	SERVER = http.createServer(onRequest);
	SERVER.listen(portNumber);

	MESSAGE.code("server-open", portNumber);
}
/**
 * SERVER-SIDE
 * 
 * INTERNAL FUNCTION
 * 
 * Handling server requests
*/
export function onRequest(request=http.IncomingMessage, response=http.ServerResponse){

	let ip = request.connection.remoteAddress;

	if (ip == "::1") {
		ip = "::ffff:127.0.0.1";
	}

	ip = ip.split(":")[3];

	let isAPI = false;

	let req_url = request.url;

	API.endpoints.forEach( (apiData) => {
		if(apiData.name == req_url) isAPI = true;
	} );

	if(isAPI == true){

		var body = "";
		request.on("readable", function() {
			body += request.read() || "";
		});

		request.on("end", async function() {
			body = JSON.parse(body || "{}");
	
			let API_response = API.handleRequest(body, req_url, ip);
			let API_responseString = JSON.stringify(API_response.content || {status: 200});
			response.writeHead(API_response.content?.status || 200, { "Content-Type": "plain/text" });
			
			let chunks = API_responseString.match(/.{1,8}/g);

			chunks.forEach((chunk) => {
				response.write(chunk);
			});
			response.end();
		});

	}else{
		let filePath = req_url;
		let file = FILES.get(filePath);
		let fileType = file.type;
		let fileHeader = file.header || {};
		let fileContent = file.content;

		fileHeader["Content-Type"] = fileType;
		
		response.writeHead(file.status, fileHeader);
		response.end( fileContent );
	}
}

export * as api from "./api.js";
export * as files from "../files/index.js";