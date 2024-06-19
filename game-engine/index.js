import { ComponentGroup, engine } from "./utils.js";
import * as components from "./components/index.js";

engine.isPixelArt = true;
engine.setBackground("black");
engine.setIcon("./assets/sit.png");

let scale = 16 * 4 * window.devicePixelRatio;

console.log(scale);

let blockCountX = () => Math.floor(engine.canvas.width / scale) + 1;
let blockCountY = () => Math.floor(engine.canvas.height / scale) + 1;

let world = new ComponentGroup;
world.moveBy(0, 0);
engine.addObject(world);

function rectWrapAround(rect=new components.Rect) {

	let width = (blockCountX()) * scale;
	let height = (blockCountY()) * scale;

	
	let blockIndexX = rect.customAttribute("x").get();
	let blockIndexY = rect.customAttribute("y").get();

	if(rect.displayOffset.x + rect.displayOffset.w < 0){
		rect.display.x += width + scale;
		blockIndexX += width;
		rect.customAttribute("x").set(blockIndexX);
	}

	if(rect.displayOffset.x > width){
		rect.display.x -= width + scale;
		blockIndexX -= width;
		rect.customAttribute("x").set(blockIndexX);
	}

	if(rect.displayOffset.y + rect.displayOffset.h < 0){
		rect.display.y += height + scale;
		blockIndexY += width;
		rect.customAttribute("y").set(blockIndexY);
	}

	if(rect.displayOffset.y > height){
		rect.display.y -= height + scale;
		blockIndexY -= width;
		rect.customAttribute("y").set(blockIndexY);
	}

	let x = rect.customAttribute("x").get();
	let y = rect.customAttribute("y").get();
	let maxX = blockCountX() + 1;
	let maxY = blockCountX() + 1;
	let colourX = Math.sin(x / maxX) * 255;
	let colourY = Math.cos(y / maxY) * 255;
	let colourZ = 255 - Math.tan((x*y) / (maxX * maxY)) * 255;
	rect.colour = `rgb(${colourX}, ${colourY}, ${colourZ})`;
}

// let rect = new components.Rect;
// world.addObject(rect);
// rect.fixedPosition = true;
// rect.moveTo(0, 0);
// rect.setSize(scale, scale);
// rect.colour = `red`;
// rect.script = rectWrapAround;

function placeBlock(x=0, y=0, maxX=10, maxY=10){

	if(maxX != blockCountX() + 1|| maxY != blockCountY() + 1) {
		resize();
		return;
	}

	let rect = new components.Rect;
	world.addObject(rect);
	rect.fixedPosition = true;
	rect.moveTo(x * scale - engine.camera.position.x, y * scale - engine.camera.position.y);
	rect.setSize(scale, scale);
	let colourX = Math.sin((x) / maxX * 255);
	let colourY = Math.cos((y) / maxY * 255);
	let colourZ = 255 - Math.tan((x*y) / (maxX * maxY) * 255);
	rect.colour = `rgb(${colourX}, ${colourY}, ${colourZ})`;
	rect.customAttribute("x").set(x);
	rect.customAttribute("y").set(y);

	rect.script = rectWrapAround;

	x += 1;
	if(x > maxX && y > maxY) return;
	if(x > maxX) {
		x = 0;
		y += 1;
	}

	// window.requestAnimationFrame(() => {
	// 	placeBlock(x, y, maxX, maxY);
	// });

	setTimeout(() => {
		placeBlock(x, y, maxX, maxY);
	}, 0);
}

function resize(){
	let maxY = blockCountY() + 1;
	let maxX = blockCountX() + 1;
	world.components = {};
	world.componentHashes = [];

	for (let y = 0; y < maxY; y ++) {
		for (let x = 0; x < maxX; x ++) {
			let rect = new components.Rect;
			world.addObject(rect);
			rect.fixedPosition = true;
			rect.moveTo(x * scale - engine.camera.position.x, y * scale - engine.camera.position.y);
			rect.setSize(scale, scale);
			let colourX = Math.sin((x) / maxX * 255);
			let colourY = Math.cos((y) / maxY * 255);
			let colourZ = 255 - Math.tan((x*y) / (maxX * maxY) * 255);
			rect.colour = `rgb(${colourX}, ${colourY}, ${colourZ})`;
			rect.customAttribute("x").set(x);
			rect.customAttribute("y").set(y);

			rect.script = rectWrapAround;
		}
	}
}
resize();

engine.canvas.onresize = resize;

var player = new components.Image;
engine.addObject(player);
player.cameraTracking = true;
player.moveTo(0, 0);
player.setSize(scale, scale);
player.setCrop(0, 0, 16, 16);
player.source = "./assets/sit.png";
player.colour = "cyan";

player.script = function(){
	let speed = scale / 16;
	speed = Math.floor(speed);
	let delta = 50 * engine.time.delta;

	let speedX = 0;
	let speedY = 0;

	if(engine.keyboard.isKeyPressed("w", "ArrowUp"))    speedY -= speed * delta;
	if(engine.keyboard.isKeyPressed("s", "ArrowDown"))  speedY += speed * delta;
	if(engine.keyboard.isKeyPressed("a", "ArrowLeft"))  speedX -= speed * delta;
	if(engine.keyboard.isKeyPressed("d", "ArrowRight")) speedX += speed * delta;

	speedX = Math.floor(speedX);
	speedY = Math.floor(speedY);

	let direction = speedX / Math.abs(speedX||1);

	if(direction) player.display.w = Math.abs(player.display.w) * direction;

	player.moveBy(speedX, speedY);
	for (let index = 0; index < world.componentHashes.length; index ++) {
		let hash = world.componentHashes[index];
		let rect = world.components[hash];
		rect.moveBy(-speedX, -speedY);
	}
}