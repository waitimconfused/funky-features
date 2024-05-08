import { drawBlock } from "./draw.js";
import { Point2D, XYZ_iso } from "./points.js";
import { worldHeight, worldLength, worldWidth } from "./world.js";

export const canvas = document.getElementById("screen");

export var tileSize = 90;

export var camera = new Point2D(0, 0);
let worldCenter = XYZ_iso(worldWidth, worldLength, worldHeight);
camera.moveTo(-worldCenter.x, -worldCenter.y)
camera.scale = 2;
const originalScale = JSON.parse(JSON.stringify(camera.scale));

function tick(){

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	for(let z = 0; z < worldHeight; z++){
		for(let y = 0; y < worldLength; y++){
			for(let x = 0; x < worldWidth; x++){
				drawBlock(x, y, z);
			}
		}
	}

	window.requestAnimationFrame(tick);
}
tick();

window.addEventListener('wheel', (e) => {

	if (e.ctrlKey) {
		e.preventDefault();
		if(e.target !== canvas) return undefined;
		camera.scale = Math.max(camera.scale - e.deltaY / 25, 0.5);
	} else {
		if(e.target !== canvas) return undefined;
		e.preventDefault();
		camera.translate(-e.deltaX, -e.deltaY);
	}

}, {passive: false});

document.onkeydown = (e) => {
	if(e.ctrlKey && (e.key == "-" || e.key == "_")) {
		e.preventDefault();
		camera.scale -= 0.5;
		camera.scale = Math.max(camera.scale, 0.5);
	}
	if(e.ctrlKey && (e.key == "=" || e.key == "+")) {
		e.preventDefault();
		camera.scale += 0.5;
		camera.scale = Math.max(camera.scale, 0.5);
	}
	if(e.ctrlKey && (e.key == "0")) {
		e.preventDefault();
		camera.scale = originalScale;
		camera.moveTo(-worldCenter.x, -worldCenter.y)
	}
};