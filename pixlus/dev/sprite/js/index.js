import { image } from "./image.js";
import save, { Tile } from "./save.js";

const tilemap = document.getElementById("tilemap");
const tilemap_context = tilemap.getContext("2d");

const preview = document.getElementById("preview");
const preview_context = preview.getContext("2d");

var source = "";
var sourcePath = "image.png";
var keysPressed = [];

const fileUploadButton = document.getElementById("image-upload");
const saveButton = document.getElementById("save");

fileUploadButton.onchange = () => {
	if(fileUploadButton.files && fileUploadButton.files[0]){
		var reader = new FileReader();
		reader.onload = function (e) {
			let element = document.getElementById('input');
			source = e.target.result;
			element.setAttribute("src", e.target.result);
			sourcePath = document.getElementById("image-upload").value;
			sourcePath = sourcePath.split("\\");
			sourcePath = sourcePath[sourcePath.length - 1];
			element.onload = function(){
				tilemap.width = element.width;
				tilemap.height = element.height;
			}
		};
		reader.readAsDataURL(fileUploadButton.files[0]);
	}
}


var speed = 150;
function Milliseconds(offset=0){ return( performance.now() ); };
function getFrame(arg, customSpeed=speed, offset=0, timeFunc=Milliseconds){

	if(Array.isArray(arg)){

		// ( Math.round( Milliseconds() / speed ) % arg.length)
		let actuallFrame = (timeFunc() - offset) / customSpeed;
		actuallFrame = Math.floor(actuallFrame);
		actuallFrame = actuallFrame % arg.length;

		return arg[actuallFrame];
	}else if(Number.isInteger(arg)){
		let frameNumber = 0;

		if(arg > 0){
		let actuallFrame = (timeFunc() - offset) / customSpeed;
		actuallFrame = Math.floor(actuallFrame);
		actuallFrame = actuallFrame % arg;
		frameNumber = actuallFrame;
		}
		return frameNumber;
	}else if(typeof arg == "string"){
		return arg;
	}else{
		return 0;
	}
}

tick();
function tick(){

	tilemap_context.clearRect(0, 0, tilemap.width, tilemap.height);
	preview_context.clearRect(0, 0, preview.width, preview.height);

	if(document.getElementById("width").value < 0) document.getElementById("width").value = "0";
	if(document.getElementById("height").value < 0) document.getElementById("height").value = "0";

	let x = document.getElementById("pos-x").value;
	let y = document.getElementById("pos-y").value;

	if(document.getElementById("width").value > tilemap.width - x) document.getElementById("width").value = `${tilemap.width - x}`;
	if(document.getElementById("height").value > tilemap.height - y) document.getElementById("height").value = `${tilemap.height - y}`;

	let width = document.getElementById("width").value || "16";
	width = JSON.parse(width);
	let height = document.getElementById("height").value || `${width}`;
	height = JSON.parse(height);

	preview_context.width = width;
	preview_context.height = height;

	if(document.getElementById("pos-x").value < 0) document.getElementById("pos-x").value = "0";
	if(document.getElementById("pos-y").value < 0) document.getElementById("pos-y").value = "0";

	if(document.getElementById("pos-x").value > tilemap.width - width) document.getElementById("pos-x").value = `${tilemap.width - width}`;
	if(document.getElementById("pos-y").value > tilemap.height - height) document.getElementById("pos-y").value = `${tilemap.height - height}`;

	let posX = document.getElementById("pos-x").value || "0";
	posX = JSON.parse(posX);
	let posY = document.getElementById("pos-y").value || "0";
	posY = JSON.parse(posY);

	let animationLength = document.getElementById("animation-length").value || "0";
	animationLength = JSON.parse(animationLength);
	let animationSpacing = document.getElementById("animation-spacing").value || `${width}`;
	animationSpacing = JSON.parse(animationSpacing);
	let animationDirection = document.getElementById("animation-direction").value || "horizontal";

	let tileType = document.getElementById("block-type").value || "block";
	let tileVariant = document.getElementById("block-varient").value || "default";
	let tileSource = document.getElementById("block-source").value || `./images/${sourcePath}`;

	image(
		source, 0, 0, tilemap.width, tilemap.height,

		0, 0, tilemap.width, tilemap.height,

		{}, false, tilemap
	);

	let offset = getFrame(animationLength) * animationSpacing;
	image(
		source, 0, 0, preview.width, preview.height,

		posX + (animationDirection=="horizontal"?offset:0),
		posY + (animationDirection=="vertical"?offset:0),
		width, height,

		{}, false, preview
	);

	for(let offset = 0; offset < Math.max(animationLength, 1); offset++){
		tilemap_context.beginPath();
		// tilemap_context.globalCompositeOperation = "color-burn";
		let colour = (getFrame(2) == 0)? "red":"blue";
		if(animationLength > 1) colour = (getFrame(animationLength) == offset)? "red":"blue";
		tilemap_context.strokeStyle = colour;
		tilemap_context.lineWidth = 2;
		tilemap_context.rect(posX + (animationDirection=="horizontal"?offset * animationSpacing:0), posY + (animationDirection=="vertical"?offset * animationSpacing:0), width, height);
		tilemap_context.stroke();
		tilemap_context.globalCompositeOperation = "source-over";
	}

	format(tileType, tileVariant, {
		source: tileSource,
		crop: {
			x: posX,
			y: posY,
			width: width,
			height: height,
		},
		animation: {
			length: animationLength,
			spacing: animationSpacing,
			direction: animationDirection,
		}
	});

	window.requestAnimationFrame(tick);
}

function removeItem(array, item) {
	var i = array.length;

	while (i--) {
		if (array[i] === item) {
		array.splice(i, 1);
		}
	}
	return array;
}

var mouseX = 0;
var mouseY = 0;
document.onmousemove = (e) => {
	mouseX = e.clientX;
	mouseY = e.clientY;
};

document.onkeydown = (e) => {
	let key = e.key.toLowerCase();
	if(keysPressed.includes(key) == false) keysPressed.push(key);
	if(document.elementFromPoint(mouseX, mouseY)?.id == "tilemap"){
		e.preventDefault();
		handleKeyboard();
	}
	if(e.ctrlKey & e.key == "s"){
		e.preventDefault();
		saveButton.onclick();
	}
}
document.onkeyup = (e) => {
	let key = e.key.toLowerCase();

	keysPressed = removeItem(keysPressed, key);
}

function handleKeyboard(){

	let posX = document.getElementById("pos-x").value || "0";
	posX = JSON.parse(posX);
	let posY = document.getElementById("pos-y").value || "0";
	posY = JSON.parse(posY);

	let width = document.getElementById("width").value || "16";
	width = JSON.parse(width);
	let height = document.getElementById("height").value || `${width}`;
	height = JSON.parse(height);

	let animationDirection = document.getElementById("animation-direction").value || "horizontal";
	let animationLength = document.getElementById("animation-length").value || `${0}`;
	animationLength = JSON.parse(animationLength);
	let animationSpacing = document.getElementById("animation-spacing").value || `${width}`;
	animationSpacing = JSON.parse(animationSpacing);

	let change = 1;

	if(keysPressed.includes("shift")) change = 5;

	let ctrlKey = keysPressed.includes("control");
	let animationKey = keysPressed.includes("a");

	if(animationKey == false){
		if(ctrlKey == false){
			if(keysPressed.includes("arrowup")) posY -= change;
			if(keysPressed.includes("arrowdown")) posY += change;

			if(keysPressed.includes("arrowleft")) posX -= change;
			if(keysPressed.includes("arrowright")) posX += change;
		}else if(ctrlKey == true){
			if(keysPressed.includes("arrowup")) height -= change;
			if(keysPressed.includes("arrowdown")) height += change;

			if(keysPressed.includes("arrowleft")) width -= change;
			if(keysPressed.includes("arrowright")) width += change;
		}
	}else{
		if(ctrlKey == false){
			animationLength = (animationLength > 1)?animationLength:1;
			if(keysPressed.includes("arrowup")){
				if(animationDirection == "horizontal") animationLength = 1;
				animationLength -= 1;
				animationDirection = "vertical";
			}
			if(keysPressed.includes("arrowdown")){
				if(animationDirection == "horizontal") animationLength = 1;
				animationLength += 1;
				animationDirection = "vertical";
			}

			if(keysPressed.includes("arrowleft")){
				if(animationDirection == "vertical") animationLength = 1;
				animationLength -= 1;
				animationDirection = "horizontal";
			}
			if(keysPressed.includes("arrowright")){
				if(animationDirection == "vertical") animationLength = 1;
				animationLength += 1;
				animationDirection = "horizontal";
			}

			animationLength = (animationLength > 1)?animationLength:0;
		}else if(ctrlKey == true){
			if(animationDirection == "vertical"){
				if(keysPressed.includes("arrowup")) animationSpacing -= change;
				if(keysPressed.includes("arrowdown")) animationSpacing += change;
			}else{
				if(keysPressed.includes("arrowleft")) animationSpacing -= change;
				if(keysPressed.includes("arrowright")) animationSpacing += change;
			}
		}
	}

	document.getElementById("pos-y").value = posY;
	document.getElementById("pos-x").value = posX;

	document.getElementById("width").value = width;
	document.getElementById("height").value = height;

	document.getElementById("animation-length").value = animationLength;
	document.getElementById("animation-spacing").value = animationSpacing;
	document.getElementById("animation-direction").value = animationDirection;

}

function format(type="", varient="", data={}){
	let tiles_json_element = document.getElementById("blocks.json");
	let tileType_json_element = document.getElementById("block.json");

	let tileTypes = {};
	tileTypes[type] = `./json/${type}.json`;
	let tileType = {};
	if(data.animation.length <= 1) data.animation = false;
	tileType[varient] = data;

	tileTypes = JSON.stringify(tileTypes, null, 4);
	tileType = JSON.stringify(tileType, null, 4);

	if(tiles_json_element.innerHTML !== tileTypes) {
		tiles_json_element.innerHTML = tileTypes;
		tileType_json_element.title = `./json/${type}.json`;
	}
	if(tileType_json_element.innerHTML !== tileType) {
		tileType_json_element.innerHTML = tileType;
	}
}

saveButton.onclick = () => {
	let cropX = document.getElementById("pos-x").value || "0";
	cropX = JSON.parse(cropX);
	let cropY = document.getElementById("pos-y").value || "0";
	cropY = JSON.parse(cropY);

	let cropWidth = document.getElementById("width").value || "16";
	cropWidth = JSON.parse(cropWidth);
	let cropHeight = document.getElementById("height").value || `${cropWidth}`;
	cropHeight = JSON.parse(cropHeight);

	let animationDirection = document.getElementById("animation-direction").value || "horizontal";
	let animationLength = document.getElementById("animation-length").value || `${0}`;
	animationLength = JSON.parse(animationLength);
	let animationSpacing = document.getElementById("animation-spacing").value || `${cropWidth}`;
	animationSpacing = JSON.parse(animationSpacing);

	let tileType = document.getElementById("block-type").value || "block";
	let tileVarient = document.getElementById("block-varient").value || "default";
	let tileSource = document.getElementById("block-source").value || `./images/${tileType}.png`;

	let context = tilemap.getContext("2d");

	context.clearRect(0, 0, tilemap.width, tilemap.height)

	image(
		source, 0, 0, tilemap.width, tilemap.height,

		0, 0, tilemap.width, tilemap.height,

		{}, false, tilemap
	);

	save(new Tile({
		type: tileType,
		varient: tileVarient,
		imageSource: tileSource,
		imageData: tilemap.toDataURL(),

		crop: {
			x: cropX,
			y: cropY,
			width: cropWidth,
			height: cropHeight
		},

		animation: {
			length: animationLength,
			spacing: animationSpacing,
			direction: animationDirection
		},
	}));
};