import { ComponentGroup, engine } from "../utils.js";
import * as components from "../components.js";
import { isInRange, keyboard, mouse } from "../../toolbelt/toolbelt.js";

let worldData = [
	["red", "green", "blue"],
	["green", "blue", "red"],
	["blue", "red", "green"],
]

// engine.camera.canZoom = false;
// engine.isPixelArt = true;
engine.background = "white";
engine.setFavicon("./demos/sit.png");
engine.loadAsset("./demos/sit.png")

let scale = 16 * 5;

let blockCountX = () => Math.floor(window.innerWidth / scale) + 1;
let blockCountY = () => Math.floor(window.innerHeight / scale) + 1;

// let background = new components.Rect;
// background.fixedPosition = true;
// background.setSize(blockCountX() * scale, blockCountY() * scale);
// background.colour = "purple";
// background.script = () => {
// 	background.moveTo(engine.canvas.width / 2, engine.canvas.height / 2);
// };
// engine.addObject(background);

let world = new ComponentGroup;
world.moveBy(0, 0);
engine.addObject(world);

var dummyRect = new components.Rect;
dummyRect.colour = "purple";
dummyRect.setSize(100, 100);
engine.addObject(dummyRect);


var player = new components.Image;
engine.addObject(player);
player.cameraTracking = true;
player.setSize(scale, scale);
player.setCrop(0, 0, 16, 16);
player.source = "./demos/sit.png";
player.colour = "cyan";
player.moveTo(blockCountX() / 2, 0);

var screenCenterDot = new components.Circle;
screenCenterDot.colour = "orange";
screenCenterDot.radius = 5;
screenCenterDot.fixedPosition = true;
engine.addObject(screenCenterDot);
screenCenterDot.script = () => {
	screenCenterDot.moveTo(engine.canvas.width/2, engine.canvas.height/2)
};

player.script = function(){
	let speed = scale / 16;
	speed = Math.floor(speed);
	let delta = 100 * engine.stats.delta;

	let speedX = 0;
	let speedY = 0;

	if(keyboard.isPressed("w", "ArrowUp"))    speedY -= speed * delta;
	if(keyboard.isPressed("s", "ArrowDown"))  speedY += speed * delta;
	if(keyboard.isPressed("a", "ArrowLeft"))  speedX -= speed * delta;
	if(keyboard.isPressed("d", "ArrowRight")) speedX += speed * delta;

	speedX = Math.floor(speedX);
	speedY = Math.floor(speedY);

	let direction = speedX / Math.abs(speedX||1);

	if(direction) player.display.w = Math.abs(player.display.w) * direction;

	player.moveBy(speedX, speedY);
}

function setblock(x, y, value) {
	if (y < 0) {
		for (let i = 0; i < world.componentHashes.length; i ++) {
			let hash = world.componentHashes[i];
			let component = world.components[hash];
			let yValue = component.getAttribute("y");
			yValue -= y;
			component.setAttribute("y", yValue);
		}
		while (y < 0) {
			worldData.unshift([]);
			y += 1;
		}
	}
	if (x < 0) {
		for (let i = 0; i < world.componentHashes.length; i ++) {
			let hash = world.componentHashes[i];
			let component = world.components[hash];
			let xValue = component.getAttribute("x");
			xValue -= x;
			component.setAttribute("x", xValue);
		}
		while (x < 0) {
			for (let i = 0; i < worldData.length; i ++) {
				worldData[i].unshift("transparent");
			}
			// player.moveBy(scale, 0);
			x += 1;
		}
	}

	while (y > worldData.length-1) {
		worldData.push([]);
	}
	while (x > worldData[y].length-1) {
		worldData[y].push("transparent");
	}

	worldData[y][x] = value;
}
function updateRectDisplay(rect=new components.Rect) {

	let blockPosX = rect.getAttribute("x") || 0;
	let blockPosY = rect.getAttribute("y") || 0;

	if (
		blockPosX < 0 ||
		blockPosY < 0 ||
		blockPosY > worldData.length-1 ||
		blockPosX > worldData[blockPosY].length-1
	) {
		rect.colour = "rgba(255, 255, 255, 1)";
		return;
	}

	let blockIndexY = blockPosY % (worldData.length);
	let blockIndexX = blockPosX % (worldData[blockIndexY].length);

	rect.colour = worldData[blockIndexY][blockIndexX];
}
function rectWrapAround(rect=new components.Rect) {
	let blockPosX = rect.getAttribute("x") || 0;
	let blockPosY = rect.getAttribute("y") || 0;

	if (rect.displayOffset.x < engine.canvas.width / 2 - (blockCountX()+2) * scale / 2) {
		// Block is off to the left
		rect.moveBy( (blockCountX()+1) * scale, 0 );
		blockPosX += blockCountX() + 1;
		rect.setAttribute("x", blockPosX);
	} else if (rect.displayOffset.x > engine.canvas.width / 2 + blockCountX() * scale / 2) {
		// Block is off to the right
		rect.moveBy( -(blockCountX()+1) * scale, 0 );
		blockPosX -= blockCountX() + 1;
		rect.setAttribute("x", blockPosX);
	}

	if (rect.displayOffset.y < engine.canvas.height / 2 - (blockCountY()+2) * scale / 2) {
		// Block is off to the top
		rect.moveBy(0, (blockCountY()+1) * scale);
		blockPosY += blockCountY() + 1;
		rect.setAttribute("y", blockPosY);
	} else if (rect.displayOffset.y > engine.canvas.height / 2 + blockCountY() * scale / 2) {
		// Block is off to the bottom
		rect.moveBy(0, -(blockCountY()+1) * scale);
		blockPosY -= blockCountY() + 1;
		rect.setAttribute("y", blockPosY);
	}

	updateRectDisplay(rect);

	if(
		mouse.click_l &&
		isInRange(rect.displayOffset.x, mouse.position.x, rect.displayOffset.x + rect.displayOffset.w) &&
		isInRange(rect.displayOffset.y, mouse.position.y, rect.displayOffset.y + rect.displayOffset.h)
	) {
		let r = Math.round(Math.random() * 255);
		let g = Math.round(Math.random() * 255);
		let b = Math.round(Math.random() * 255);
		setblock(blockPosX, blockPosY, `rgb(${r}, ${g}, ${b})`);
		mouse.click_l = false;
	}

	// if(blockPosX < 0) { rect.colour = "black"; return; }
	// if(blockPosY < 0) { rect.colour = "black"; return; }
	
	// if(blockPosY > worldData.length-1) { rect.colour = "black"; return; }
	// if(blockPosX > worldData[blockPosY].length-1) { rect.colour = "black"; return; }

	// let blockIndexX = blockPosX % (worldData[0].length);
	// let blockIndexY = blockPosY % (worldData.length);

	// rect.colour = worldData[blockIndexY][blockIndexX];
	// rect.colour = `rgb(${blockPosX%255}, ${255-blockPosY%255}, ${(blockPosX*blockPosY)%255})`;
}

function resize(){
	let maxY = blockCountY() + 1;
	let maxX = blockCountX() + 1;
	world.components = {};
	world.componentHashes = [];

	for (let y = 0; y < maxY; y ++) {
		for (let x = 0; x < maxX; x ++) {
			let rect = new components.Rect;
			rect.fixedPosition = false;
			rect.script = rectWrapAround;
			rect.setAttribute("x", x - Math.floor(engine.camera.position.x / scale));
			rect.setAttribute("y", y - Math.floor(engine.camera.position.y / scale));
			rect.transform.set(0, 0);
			rect.moveTo(
				x * scale + engine.canvas.width / 2 - maxX * scale / 2 - engine.camera.position.x,
				y * scale + engine.canvas.height / 2 - maxY * scale / 2 - engine.camera.position.y
			);
			rect.setSize(scale, scale);
			// let colourX = Math.sin((x) / maxX * 255);
			// let colourY = Math.cos((y) / maxY * 255);
			// let colourZ = 255 - Math.tan((x*y) / (maxX * maxY) * 255);
			// rect.colour = `rgb(${colourX}, ${colourY}, ${colourZ})`;
			world.addObject(rect);
			updateRectDisplay(rect);
		}
	}
}
// resize();

// engine.canvas.onresize = resize;