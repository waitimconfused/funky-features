import { animationConstructor as animation, engine, ComponentGroup } from "../utils.js";
import { Image, Rect } from "../components.js";
import { ceilToNearest, keyboard, Vector, Controller } from "../../toolbelt/toolbelt.js";

const xbox = new Controller(0);
xbox.applyLayout("Xbox");

engine.isPixelArt = true;
engine.camera.zoom = 6;
engine.camera.disableZoom();

const worldBoundingBox = new Rect;
engine.addObject(worldBoundingBox);
worldBoundingBox.colour = "none";
worldBoundingBox.outline.colour = "purple";
worldBoundingBox.outline.size = 1;
var zoom = 7;
worldBoundingBox.script = () => {
	worldBoundingBox.display.w = ceilToNearest(engine.canvas.width / zoom, 16);
	worldBoundingBox.display.h = ceilToNearest(engine.canvas.height / zoom, 16);
	worldBoundingBox.moveTo(engine.camera.position);
	worldBoundingBox.setLayer(-1);
}

const fantasy_ = await animation.fromFile("./demos/5/fantasy_/desert_.json");
const dinoSprite_doux = await animation.fromFile("./demos/5/dinoCharacters/DinoSprites - doux.json");

var worldTiles = [
	[
		[ "fountain:fountain" ],
		[ "resources:cactus[size=large]", "resources:cactus[size=medium]", "resources:cactus[size=small]" ],
		[ "resources:skull" ],
		[ null ],
		[ "resources:boulder", null, "resources:stone[count=1]", "resources:stone[count=2]" ],
		[ "resources:copper", "resources:gold", "resources:coal", "resources:diamond", ],
		[ "resources:chest[size=1]", "resources:chest[size=1,open]", null, "resources:chest[size=2]", null, "resources:chest[size=2,open]", null, "resources:chest[sunken]" ],
		[ "resources:fire", "resources:fire[off]" ],
		[ "resources:sign[wooden]", "resources:sign[size=small]", "resources:sign[size=medium]", "resources:sign[size=large]" ],
		[ null ],
		[ "resources:hill[top,left]", "resources:hill[top]", "resources:hill[top,right]" ],
		[ "resources:hill[center,left]", "resources:hill[center]", "resources:hill[center,right]" ]
	]
];

// for (let l = 0; l < world.length; l ++) {
// 	for (let y = 0; y < world[l].length; y++) {
// 		for (let x = 0; x < world[l][y].length; x++) {
// 			let tileType = world[l][y][x];
// 			if (!tileType) continue;
// 			const tile = new Image(fantasy_);
// 			engine.addObject(tile);
// 			tile.moveTo(x * 16, y * 16);
// 			tile.animation.playAnimation(tileType);
// 			let frame = tile.animation.currentFrame();
// 			tile.transform.set(0.5, 1);
// 		}
// 	}
// }

var worldBox = new ComponentGroup;
engine.addObject(worldBox);

let tileCountY = Math.floor(engine.canvas.height/zoom/16) + 2;
let tileCountX = Math.floor(engine.canvas.width/zoom/16) + 2;
for (let y = 0; y < tileCountY; y++) {
	for (let x = 0; x < tileCountX; x++) {
		const tile = new Image(fantasy_);
		tile.setSize(16, 16);
		worldBox.addObject(tile);
		tile.moveTo(x * 16, y * 16);
		tile.transform.set(0.5, 1);
		tile.setSize(1, 1);
		if (x >= 0 && y >= 0 && y < worldTiles[0].length && x < worldTiles[0][y].length && worldTiles[0][y][x]) {
			tile.animation.playAnimation(worldTiles[0][y][x]);
			// tile.show();
		} else {
			tile.animation.playAnimation("error");
			// tile.hide();
		}
		tile.script = () => {
			let update = false;	

			if (tile.display.x - tile.display.w*tile.transform.x >= worldBoundingBox.display.w/2 + worldBoundingBox.display.x) {
				tile.display.x -= worldBoundingBox.display.w + 16;
				update = true;
			}
			if (tile.display.x + tile.display.w*tile.transform.x <= -worldBoundingBox.display.w/2 + worldBoundingBox.display.x) {
				tile.display.x += worldBoundingBox.display.w + 16;
				update = true;
			}
			
			if (tile.display.y - tile.display.h*tile.transform.y >= worldBoundingBox.display.h/2 + worldBoundingBox.display.y) {
				tile.display.y -= worldBoundingBox.display.h + 16;
				update = true;
			}
			if (tile.display.y + tile.display.h*tile.transform.y <= -worldBoundingBox.display.h/2 + worldBoundingBox.display.y) {
				tile.display.y += worldBoundingBox.display.h + 16;
				update = true;
			}

			if (update) {
				let x = Math.floor(tile.display.x / 16);
				let y = Math.floor(tile.display.y / 16);

				if (x >= 0 && y >= 0 && y < worldTiles[0].length && x < worldTiles[0][y].length && worldTiles[0][y][x]) {
					tile.animation.playAnimation(worldTiles[0][y][x]);
					// tile.show();
				} else {
					tile.animation.playAnimation("error");
					// tile.hide();
				}

			}
		}

	}
}

const player = new Image(dinoSprite_doux);
engine.addObject(player);
player.moveTo(0, 0);
player.transform.set(0.5, 1);
player.animation.playAnimation("idle");
player.cameraTracking = true;

var keys = ["w", "a", "s", "d", "arrowUp", "arrowDown", "arrowLeft", "arrowRight"];
player.animation.onfinish = () => {
	let moving = false;
	if (Math.abs(xbox.values.joystick.left.x) > 0.5) moving = true;
	if (Math.abs(xbox.values.joystick.left.y) > 0.5) moving = true;
	if (keyboard.isPressed(...keys)) moving = true;

	if (moving != (player.animation.currentAnimation != "idle")) {

		let animation = "idle";

		if (animation == "walk" && !moving) animation = "idle";
		if (moving) animation = "walk";
		player.animation.playAnimation(animation);
	}
}

engine.preRenderingScript = () => {

	// engine.componentHashes.sort((hashA, hashB) => {
	// 	let componentA = engine.getObject(hashA);
	// 	let componentB = engine.getObject(hashB);
	// 	return componentA.display.y - componentB.display.y;
	// });

	let speedX = 0;
	let speedY = 0;

	if (keyboard.isPressed("w", "arrowUp")) speedY -= 1;
	if (keyboard.isPressed("s", "arrowDown")) speedY += 1;
	if (keyboard.isPressed("a", "arrowLeft")) speedX -= 1;
	if (keyboard.isPressed("d", "arrowRight")) speedX += 1;

	if (xbox.values.joystick.left.x < -0.5) speedX -= 1;
	if (xbox.values.joystick.left.x > 0.5) speedX += 1;
	if (xbox.values.joystick.left.y < -0.5) speedY -= 1;
	if (xbox.values.joystick.left.y > 0.5) speedY += 1;

	if (keyboard.isPressed("space")) {
		player.animation.playAnimation("hurt");
	}

	if (player.animation.currentAnimation == "hurt") return;
	if (speedX == 0 && speedY == 0) return;

	if (speedX != 0) {
		player.display.w = (speedX < 0) * -2 + 1;
	}

	let vector = new Vector;
	vector.setPos(speedX, speedY);
	vector.mag = engine.stats.delta * 100;

	let shrunk = vector.xy();

	player.moveBy(Math.round(shrunk.x), Math.round(shrunk.y));
	engine.camera.moveTo(player.display);
}
engine.postRenderingScript = () => {
	player.opacity = 0.25;
	player.render(engine.canvas.getContext("2d"));
	player.opacity = 1;
}


























class AnimationCompiler {
	#playback = "loop";
	#fps = 1;

	#animations = {};
	/**
	 * 
	 * @param {string} name 
	 * @returns {AnimationTimelineGenerator}
	 */
	addAnimation(name) {
		let timeline = new AnimationTimelineGenerator;
		this.#animations[name] = timeline;
		return timeline;
	}

	/**
	 * @param {"loop"|"playonce"|"bounce"} playback 
	 */
	setPlayback(playback) {
		this.#playback = playback;
		return this;
	}
	/**
	 * @param {number} fps 
	 */
	setFPS(fps) {
		this.#fps = Math.round(fps);
		return this;
	}
	clear() {
		this.#playback = "loop";
		this.#fps = 1;
		this.#animations = {};
		return this;
	}

	generate() {
		let animations = {};
		let animationTitles = Object.keys(this.#animations);
		for (let i = 0; i < animationTitles.length; i ++) {
			let timelineName = animationTitles[i];
			let timelineData = this.#animations[timelineName].generate();
			animations[timelineName] = timelineData;
		}
		return {
			playback: this.#playback,
			fps: this.#fps,

			animations: animations
		}
	}
}

class AnimationTimelineGenerator {
	#frames = [];

	/**
	 * 
	 * @param {{
	 *	source: ""
	 *	x: 0
	 *	y: 0
	 *	width: 0
	 *	height: 0
	 * }} data 
	 */
	addFrame(data) {
		this.#frames.push(data);
	}
	generate() {
		let generated = [];
		for (let i = 0; i < this.#frames.length; i ++) {
			let frame = this.#frames[i];
			generated.push({
				source: frame.source,
				x: frame.x,
				y: frame.y,
				width: frame.width,
				height: frame.height
			})
		}
		return this.#frames;
	}

}