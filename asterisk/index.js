import { networkInterfaces } from "node:os";
export * as serverside from "./serverside/index.js";
export * as api from "./serverside/api.js";
export * as files from "./files/index.js";
export * as message from "./messages/index.js";
export * as clientside from "./client/index.js";

/**
 * Exactally like `console.log`
*/
export function clearLogs(){
	console.clear();
}

/**
 * SERVER-SIDE
 * 
 * Get IP of current machine
 * @returns { string }
*/
export function getIP() {
	let nets = networkInterfaces();
	let results = {}; // Or just '{}', an empty object

	for (const name of Object.keys(nets)) {
		for (const net of nets[name]) {
			// Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
			// 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
			const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
			if (net.family === familyV4Value && !net.internal) {
				if (!results[name]) {
					results[name] = [];
				}
				results[name].push(net.address);
			}
		}
	}

	return (results["Wi-Fi"] || ["127.0.0.1"])[0];
}

/**
 * SERVER-SIDE
 * 
 * Get IP of current machine
 * @param { string } requestIP The IP of the request from client
 * @returns { boolean }
*/
export function isThisMachine(requestIP="") {
	let myIP = getIP();
	let isThisMachine = requestIP == myIP || requestIP == "127.0.0.1";

	return isThisMachine;
}