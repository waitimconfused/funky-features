import { animationConstructor as animation, engine, ComponentGroup } from "../game-engine/utils.js";
import { Image, Rect, Text } from "../game-engine/components/index.js";
import { keyboard, roundToNearest, Vector } from "../toolbelt/toolbelt.js";

import { XboxController } from "../toolbelt/lib/controller.js";
const controller = XboxController.fromIndex(0);

engine.isPixelArt = true;
engine.camera.disableZoom();
engine.camera.zoom = 5;
engine.camera.trackingDelay = 10;

const playerAnimation = await animation.fromFile("./assets/player/animation.json");
const blocks = {
	"grass_block": await animation.fromFile("./assets/blocks/grass_block.json")
};

const player = new Image(playerAnimation);
player.animation.playAnimation("idle");
player.transform.set(0.5, 0.5);
player.moveTo(16/2, 16/2);
engine.camera.moveTo(player);
player.setAttribute("z-index", 1);
engine.addObject(player);
player.cameraTracking = true;

const worldLayers = [];
/**
 * 
 * @param { number } x
 * @param { number } y
 * @param { number } z
 * @param { string } block eg: `"grass_block:top-left"`
 */
function placeBlock(x, y, z, block) {
	if (z + 1 > worldLayers.length) {
		let group = new ComponentGroup;
		engine.addObject(group);
		worldLayers.push(group);
	}
	let typeAndVariant = block.split(":");
	let type = typeAndVariant[0];
	let variant = typeAndVariant[1];

	let blockRect = new Image(blocks[type]);
	blockRect.animation.playAnimation(variant);
	blockRect.transform.set(0, 0);
	let myLayer = worldLayers[z];
	myLayer.addObject(blockRect);
	blockRect.moveTo(x * 16, y * 16);
}
/**
 * 
 * @param { number } x
 * @param { number } y
 * @param { number } z
 */
function getBlock(x, y, z) {
	return save.world.find((block) => {
		return 	block.position.x == x && block.position.y == y && block.position.z == z;
	}) || { position: { x: null, y: null }, block: "null", options: {} };
}

/**
 * @type {{ world: { position: { x: number, y: number, z: number }, block: string }[] }}
 */
var save = localStorage.getItem("pixlus.save");
if (save) {
	save = JSON.parse(save);
} else {
	save = await import("./save.json", { with: { type: "json" } });
	save = save.default;
	// localStorage.setItem("pixlus.save", JSON.stringify(save));
}
for (let index = 0; index < save.world.length; index++) {
	const blockData = save.world[index];
	placeBlock(blockData.position.x, blockData.position.y, blockData.position.z, blockData.block);
}

const selecteBlock = new Image;
engine.addObject(selecteBlock);
selecteBlock.source = "./assets/block_selection.png";
selecteBlock.setSize(16, 16);
selecteBlock.transform.set(0, 0);

const zIndexLable = new Text;
engine.addObject(zIndexLable);
zIndexLable.fixedPosition = true;
zIndexLable.textBaseLine = "top";
zIndexLable.textAlign = "left";
zIndexLable.moveTo(10, 10);

engine.preRenderingScript = () => {
	let velocityX = 0;
	let velocityY = 0;

	if (keyboard.isPressed("a", "leftArrow")) velocityX -= 1;
	if (keyboard.isPressed("d", "rightArrow")) velocityX += 1;

	if (keyboard.isPressed("w", "upArrow")) velocityY -= 1;
	if (keyboard.isPressed("s", "downArrow")) velocityY += 1;

	let mouse = engine.mouse.toWorld();
	let x = roundToNearest(mouse.x - 8, 16);
	let y = roundToNearest(mouse.y - 8, 16);
	let z = player.zIndex;
	let blockData = getBlock(x/16, y/16, z/16);
	selecteBlock.moveTo(x, y);
	player.zIndex = 2;
	zIndexLable.content = "X: " + x + "\nY: " + y + "\nZ: " + z + "\nBlock: " + blockData.block;
	zIndexLable.zIndex = -1;

	if ( velocityX == 0 && velocityY == 0 ) {
		if (player.animation.currentAnimation != "idle") player.animation.playAnimation("idle");
		return;
	}
	
	if (player.animation.currentAnimation != "run") player.animation.playAnimation("run");

	if (velocityX != 0) player.display.w = (velocityX > 0) * 2 - 1;

	let vector = new Vector(velocityX, velocityY);
	vector.mag = roundToNearest(engine.stats.delta * 50, 1);
	let xy = vector.xy();
	player.moveBy(xy.x, xy.y);
	console.log({xy, display: player.display});
}

keyboard.on("tab", () => {
	console.log("Cancled TAB keyboard shortcut.");
}, {passive: false});

keyboard.on(["ctrl", "s"], () => {
	console.log("Cancled CTRL+S keyboard shortcut.");
}, {passive: false});

keyboard.on(["ctrl", "p"], () => {
	console.log("Cancled CTRL+P keyboard shortcut.");
}, {passive: false});

keyboard.on(["ctrl", "f"], () => {
	console.log("Cancled CTRL+F keyboard shortcut.");
}, {passive: false});

keyboard.on(["ctrl", "g"], () => {
	console.log("Cancled CTRL+G keyboard shortcut.");
}, {passive: false});

keyboard.on(["ctrl", "d"], () => {
	console.log("Cancled CTRL+D keyboard shortcut.");
}, {passive: false});