import * as loader from "../loader_create.js";

import reloadFonts from "../pages/web_fonts.js";
import screeUpdate from "./screen/update.js";
import resizeCanvas from "./screen/resize.js";
import reloadWorlds from "../worlds/reload.js";

import Camera from "./screen/camera.js";
export var camera = new Camera;

import render from "./render.js";
import renderMenu from "../MenuCreator/render.js";

import gameOptions from "../../options/index.json" with {type: "json"};
import worlds from "../worlds/index.json" with {type: "json"};
import { loadAssets } from "./image.js";

import { KeyPressed, keysPressed } from "./behind/keyboard.js";
import PlaceBlock from "./behind/world_editor.js";
import { player } from "./entites/player.js";

import { Cat } from "./entites/cat.js";
import { blockTextures_generate } from "../texturepack.js";
// import { apiCall } from "../../Asterisk/client/index.js";

export var canvas = document.getElementById("screen");
export var innerScreen = document.createElement("canvas");
export var currentWorld = "Over";

export var actualScale = 1;
export var scale = actualScale / 4;
export var framesDrawn = 0;

export var lastCalledTime = 0;
export var delta = 1;
export var FPS = 0;

export var UI_options = {
	currentMenu: "",
	menuPath: [],
	openMenu: function(menuName = ""){
		this.currentMenu = menuName;
		this.menuPath.push(menuName);
	},
	closeMenu: function(){
		this.menuPath.shift();
		this.currentMenu = this.menuPath[this.menuPath.length - 1] || "";
	},
	getFPS: function(){
		return `${Math.round(FPS)}`
	}
};



// apiCall({ something: true }, "/api/addons/reload").then((something) => {
// 	if(something.status == 200){
// 		console.log("Reloaded addons");
// 	}else{
// 		console.error("Failed to reload addons");
// 	}
// });



var pumpkin = new Cat("Pumpkin");
pumpkin.moveToBlockRelative(0, 0);
pumpkin.followEntity(player);

var moochy = new Cat("Moochy");
moochy.catStyle = "moochy";
moochy.moveToBlockRelative(0, 0);
moochy.moveByPixel(0, -12);
moochy.collisions = false;
moochy.forever(() => {

	let distanceX = moochy.position.x - player.position.x;
	distanceX = Math.abs(distanceX);
	let distanceY = moochy.position.y - player.position.y;
	distanceY = Math.abs(distanceY);
	let distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
	distance = Math.floor(Math.abs(distance));

	if(distance < 17){
		if(player.position.x < moochy.position.x){
			moochy.image.flipX = true;
		} else if(player.position.x > moochy.position.x){
			moochy.image.flipX = false;
		}
	}
});

moochy.setAnimationLength(1);
moochy.setAnimation(async () => {
	let distanceX = moochy.position.x - player.position.x;
	distanceX = Math.abs(distanceX);
	let distanceY = moochy.position.y - player.position.y;
	distanceY = Math.abs(distanceY);
	let distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
	distance = Math.floor(Math.abs(distance));

	if(distance < 17){
		await moochy.animations.sit();
	} else {
		await moochy.animations.sleep();
	}
});

var gordon = new Cat("Gordon");
gordon.moveToBlockRelative(-3, 3);
gordon.moveByPixel(0, 0);

var tabby_cat = new Cat("Tabby");
tabby_cat.catStyle = "tabby";
tabby_cat.followEntity(player);

reloadFonts();
await blockTextures_generate();
await reloadWorlds();
loader.show("Loading");
loadAssets();

if((gameOptions.advanced["show_paused_menu"] !== false)){
	UI_options.openMenu("paused");
}
setTimeout(() => {
	camera.trackEntity(player);
	startLoop();
	loader.hide();

	resizeCanvas();

}, getRandomArbitrary(750, 1750));

function getRandomArbitrary(min, max){
	return Math.floor(Math.random() * (max - min) + min);
}


document.onvisibilitychange = () => {
	if(gameOptions.advanced.DEVELOPER_MODE !== true){
		if(UI_options.currentMenu == ""){
			UI_options.currentMenu = "paused";
		}
	}
}

var escapeKey = false;
var inventoryKey = false;
async function startLoop(){

	let context = canvas.getContext("2d");
	context.msImageSmoothingEnabled = false;
	context.mozImageSmoothingEnabled = false;
	context.webkitImageSmoothingEnabled = false;
	context.imageSmoothingEnabled = false;

	context.clearRect(0, 0, canvas.width, canvas.height);

	await reloadWorlds();
	resizeCanvas();

	camera.update();

	if(UI_options.currentMenu == ""){
		await render(currentWorld);

		context.drawImage(
			innerScreen,

			0, 0, canvas.width, canvas.height,
		);
	}else{
		await renderMenu(UI_options.currentMenu);
	}

	if(KeyPressed("escape") && !escapeKey){
		if(UI_options.currentMenu == "") UI_options.openMenu("paused")
		else UI_options.closeMenu();
	}
	escapeKey = KeyPressed("escape");

	if(KeyPressed("e") && !inventoryKey){
		if(UI_options.currentMenu == "") UI_options.openMenu("inventory")
		else UI_options.closeMenu();
	}
	inventoryKey = KeyPressed("e");

	await renderMenu("ingame");

	if(KeyPressed("MouseClick") && UI_options.currentMenu == ""){

		PlaceBlock(localStorage.getItem("currentBlock") || "grass_block");
	}

	delta = (Date.now() - lastCalledTime) / 1000;
	lastCalledTime = Date.now();
	FPS = 1 / delta;

	framesDrawn += 1;
	screeUpdate(startLoop);
}
export function switchWorldTo(newWorldName=""){
	let arrayOfWorldNames = [];

	worlds.worlds.forEach((item = { title: "", path: "" }) => {
		arrayOfWorldNames.push(item.title);
	});

	console.log(arrayOfWorldNames);

	if(arrayOfWorldNames.indexOf(newWorldName) == -1){
		console.error(`World "${newWorldName}" does not exist.`)
		return undefined;
	}

	currentWorld = newWorldName;

	player.moveToBlockRelative(0, 0);
}