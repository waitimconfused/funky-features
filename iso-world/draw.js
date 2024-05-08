import { camera, canvas, tileSize } from "./index.js";
import { image } from "./image.js";
import { Point2D, XYZ_iso } from "./points.js";
import { getBlock, indexFromXYZ, world, worldHeight } from "./world.js";

const tileOffsets = {
	"tree_round-big": new Point2D(-18, -22),
	"tree_round-small": new Point2D(-28, -24),
	"tree_pointy-big": new Point2D(-24, -20),
	"tree_pointy-small": new Point2D(-33, -22),
}

export function drawBlock(x=0, y=0, z=0){
	let block = getBlock(x, y, z);

	if(block == "empty") return;

	let offset = new Point2D(0, 0);
	if(block in tileOffsets) offset = tileOffsets[block];
	let screenPos = XYZ_iso(x, y, z);

	screenPos.x += offset.x;
	screenPos.y += offset.y;

	let sway = Math.sin( performance.now() / 250 ) * tileSize / 8;
	// screenPos.y += sway;

	let svg = document.querySelector(`div#assets>img[src="./assets/${block}.svg"]`);
	let spriteWidth = tileSize;
	let spriteHeight = tileSize;
	if(svg){
		spriteWidth = svg.width;
		spriteHeight = svg.height;
	}

	let posX = screenPos.x * camera.scale + canvas.width / 2 - (spriteWidth - tileSize / 2) * camera.scale;
	let posY = screenPos.y * camera.scale + canvas.height / 2 - (spriteHeight - tileSize / 2) * camera.scale;

	image(
		"./assets/"+block+".svg",
		posX + camera.x,
		posY + camera.y,
		spriteWidth * camera.scale,
		spriteHeight * camera.scale,
		0,
		0, spriteWidth, spriteHeight, {}
	);
}