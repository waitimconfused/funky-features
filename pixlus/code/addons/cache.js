// import { apiCall } from "../../Asterisk/client/index.js";
import { setParams as setRuntimeParams } from "./lib/runtime.js";

export var CachedAddons = {};

export async function cacheAddon(title=""){
	if(title in CachedAddons) return CachedAddons[title];

	let fileName = title.replace(/^addons\//g, "");
	let addon = await import(`../addons/comp/${fileName}.js`);

	CachedAddons[title] = addon;
	
	return addon;
}

export async function addon(title, params={}){

	let loadedAddon = await cacheAddon(title);
	setRuntimeParams(params);

	return loadedAddon;
}

export function reloadAddons(){
	// apiCall({ reload: true }, "/api/addons/reload").then(() => {
	// 	location.reload();
	// });
}