import { animation, engine } from "./utils.js";
import { Image } from "./components/index.js";
import { keyboard, roundToNearest } from "../toolbelt/toolbelt.js";
import { apiCall } from "../Asterisk/client/index.js";

engine.isPixelArt = true;
engine.camera.disableZoom();
engine.camera.zoom = 7;

var myHash;
var players = {};

// const catAnimation = await animation.fromFile("./DEMO_assets/5/fantasy_.json");
// catAnimation.playAnimation("desert_fountain");

const fantasy_ = await animation.fromFile("./DEMO_assets/5/fantasy_/desert_.json");
const dinoSprite_doux = await animation.fromFile("./DEMO_assets/5/dinoCharacters/DinoSprites - doux.json");

// const cat = new components.Image(catAnimation);
// cat.isPixelArt = true;
// cat.cameraTracking = true;
// engine.addObject(cat);
// cat.transform.set(0.5, 1);
// cat.moveTo(100, 100);
// cat.setSize(100, 100);

const tile = new Image(fantasy_);
engine.addObject(tile);
tile.animation.playAnimation("resources:cactus[size=large]");

const tile2 = new Image(fantasy_);
engine.addObject(tile2);
tile2.moveTo(0, 0);
tile2.animation.playAnimation("resources:fire");

const player = new Image(dinoSprite_doux);
engine.addObject(player);
player.moveTo(3, 0);
player.transform.set(0.5, 1);
player.cameraTracking = true;
player.animation.playAnimation("idle");

player.animation.onchange = () => {
	apiCall({
		hash: myHash || "NEW",
		timestamp: Date.now()
	}, "/api/game-engine/online")
	.then((response) => {
		players = response.crowd;
		myHash = response.hash;
		console.log(response);
	});
}

player.animation.onfinish = () => {
	if (keyboard.isPressed("w", "a", "s", "d") != (player.animation.currentAnimation != "idle")) {
		let animation = "idle";
		if (keyboard.isPressed("w", "a", "s", "d")) animation = "walk";
		if (animation == "walk" && keyboard.isPressed("w") && keyboard.isPressed("s")) animation = "idle";
		if (animation == "walk" && keyboard.isPressed("a") && keyboard.isPressed("d")) animation = "idle";
		player.animation.playAnimation(animation);
	}
}
const baseSpeed = 50;
engine.preRenderingScript = () => {
	let speedX = 0;
	let speedY = 0;

	if (keyboard.isPressed("w")) speedY -= baseSpeed * engine.stats.delta;
	if (keyboard.isPressed("s")) speedY += baseSpeed * engine.stats.delta;
	if (keyboard.isPressed("a")) speedX -= baseSpeed * engine.stats.delta;
	if (keyboard.isPressed("d")) speedX += baseSpeed * engine.stats.delta;

	if (keyboard.isPressed("space")) {
		player.animation.playAnimation("hurt");
	}

	speedX = roundToNearest(speedX, 0.25);
	speedY = roundToNearest(speedY, 0.25);

	if (speedX != 0) {
		player.display.w = (speedX < 0) * -2 + 1;
	}

	player.moveBy(speedX, speedY);
}
// catAnimation.onfinish = function() {

// 	if (keyboard.isPressed("w", "a", "s", "d")) {
// 		catAnimation.playAnimation("walk");
// 	} else if ( keyboard.isPressed(" ") ) {
// 		catAnimation.playAnimation("sleep");
// 	} else {
// 		catAnimation.playAnimation("sit");
// 	}

// }













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

const animationJSON = new AnimationCompiler;
animationJSON.setPlayback("playonce");
animationJSON.setFPS(5);

let sleepAnimation = animationJSON.addAnimation("sleep");

sleepAnimation.addFrame({
	"source": "./DEMO_assets/sleep.png",
	"x": 0,
	"y": 0,

	"width": 16,
	"height": 16
});

sleepAnimation.addFrame({
	"source": "./DEMO_assets/sleep.png",
	"x": 16,
	"y": 0,

	"width": 16,
	"height": 16
});

sleepAnimation.addFrame({
	"source": "./DEMO_assets/sleep.png",
	"x": 32,
	"y": 0,

	"width": 16,
	"height": 16
});

sleepAnimation.addFrame({
	"source": "./DEMO_assets/sleep.png",
	"x": 48,
	"y": 0,

	"width": 16,
	"height": 16
});

let lickAnimation = animationJSON.addAnimation("lick");

lickAnimation.addFrame({
	"source": "./DEMO_assets/lick.png",
	"x": 0,
	"y": 0,

	"width": 16,
	"height": 16
});

lickAnimation.addFrame({
	"source": "./DEMO_assets/lick.png",
	"x": 16,
	"y": 0,

	"width": 16,
	"height": 16
});

lickAnimation.addFrame({
	"source": "./DEMO_assets/lick.png",
	"x": 32,
	"y": 0,

	"width": 16,
	"height": 16
});

lickAnimation.addFrame({
	"source": "./DEMO_assets/lick.png",
	"x": 48,
	"y": 0,

	"width": 16,
	"height": 16
});

let animationJSON_string = JSON.stringify(animationJSON.generate());