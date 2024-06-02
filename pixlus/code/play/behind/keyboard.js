import options_keybinds from "../../../options/index.json" with {type: "json"};
import { scale } from "../main.js";

export var keysPressed = {};

export var keybinds = options_keybinds.keybinds;

export function KeyPressed(key=""){
	key = key.toLowerCase();
	return keysPressed[key];
}
export function cancleKeyPress(key=""){
	key = key.toLowerCase(); 
	keysPressed[key] = false;
}

export var MousePositions = {
	X: -1,
	Y: -1,

	global: {
		X: -1,
		Y: -1
	}
};

document.body.addEventListener("mousewheel", (e) => {
	let scrollY = e.deltaY;
	let scrollX = e.deltaX;

	if(scrollY < 0){
		keysPressed["scroll-down"] = true;
	}else{
		keysPressed["scroll-up"] = true;
	}

	if(scrollX < 0){
		keysPressed["scroll-left"] = true;
	}else{
		keysPressed["scroll-right"] = true;
	}

}, false);

document.onkeydown = (e) => {

	let key = e.key.toLowerCase();

	keysPressed[key] = true;
}
window.onresize = (e) => {
	e.preventDefault();
}
document.onkeyup = (e) => {
	cancleKeyPress(e.key);
}
window.onmousemove = (e) => {

	MousePositions.global.X = e.clientX;
	MousePositions.global.Y = e.clientY;

	MousePositions.X = e.clientX / (16 * scale);
	MousePositions.Y = e.clientY / (16 * scale);
}
document.oncontextmenu = (e) => {
	e.preventDefault();
	keysPressed["mouserightclick"] = true;
}
document.onmousedown = (e) => {

	if (e.button == 4) {
		keysPressed["MouseWheelClick"] = true;
	}else{
		keysPressed["mouseclick"] = true;
	}
};
document.onmouseup = () => {
	keysPressed["mouseclick"] = false;
	keysPressed["mouserightclick"] = false;
	keysPressed["mousewheelclick"] = false;
};

function removeAllFromArray(arr=[], value) {
	var i = 0;
	while (i < arr.length) {
		if (arr[i] === value) {
			arr.splice(i, 1);
		} else {
			i += 1;
		}
	}
	return arr;
}


async function downloadImage(image){

	let date = new Date;
	let year = date.getFullYear();
	let month = date.getMonth();
	let day = date.getDate();

	let hour = date.getHours();
	let minute = date.getMinutes();
	let milliseconds = date.getMilliseconds();

	let link = document.createElement("a");
	link.href = image;
	link.download = `PIXLUS_screenshot_${year}-${month}-${day}_${hour+minute+milliseconds}`;
	link.click();
}

// Prevent Touchpad actions
window.addEventListener('wheel', (e) => {
	e.preventDefault();
}, {passive: false});

window.addEventListener("gesturestart", function (e) {
	e.preventDefault();
}, {passive: false});

window.addEventListener("gesturechange", function (e) {
	e.preventDefault();
}, {passive: false})

window.addEventListener("gestureend", function (e) {
	e.preventDefault();
}, {passive: false});