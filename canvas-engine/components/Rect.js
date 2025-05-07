import { getValue, range, Point2, Point4 } from "../../toolbelt-v2/index.js";
import { Component } from "../utils.js";

/**
 * 
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 * @returns { (x:number) => number }
 */
function cubicBezier(x1, y1, x2, y2) {
    return (t) => {
		const cubicBezierPoint = (p0, p1, p2, p3, t) => {
			const invT = 1 - t;
			return invT ** 3 * p0 + 3 * invT ** 2 * t * p1 + 3 * invT * t ** 2 * p2 + t ** 3 * p3;
		};
		const x = cubicBezierPoint(0, x1, x2, 1, t);
		const y = cubicBezierPoint(0, y1, y2, 1, x); // use `x` to get correct `y`
		return y;
    };
}

class AnimationKeyframe {
	display = {x: null, y: null, w: null, h: null};
	colour = "";
	outline = { colour: "", size: null };
	rotation = null;
	/** Removes the current keyframe from the amnimated list */
	remove() {}
}
class AnimationKeyframeValue {
	type = "";
	values = {};
}

class AnimationLib {
	looping = false;
	keyframeDuration = 1000;
	/** @type { (x:number) => number } */
	#easingFunction = ((t) => t) // Default is linear
	/**
	 * @type {AnimationKeyframe[]}
	 */
	#keyframes = [];
	playState = false;
	
	#frame = 0;
	/** @type {number | null}*/
	#frameStartTime = null;
	/** @type {number | null} */
	#frameEndTime = null;

	constructor(loop, duration) {
		this.looping = loop;
		this.duration = duration ?? 1000;
	}

	easing(x1, y1, x2, y2) {
		this.#easingFunction = cubicBezier(x1, y1, x2, y2);
		return this;
	}

	play() {
		this.playState = "go";
		this.#frameStartTime = performance.now();
		this.#frameEndTime = performance.now() + this.keyframeDuration;
	}
	stop() { this.playState = "nogo"; }

	#lastValues = {};
	getCurrentFrame() {
		if (this.playState == false) { return this.#lastValues }
		let time = performance.now();
		if (time > this.#frameEndTime) {
			this.#frame += 1;
			if (this.looping) this.#frame %= this.#keyframes.length;
			if (this.#frame <= this.#keyframes.length) this.play();
		}
		let startTime = this.#frameStartTime;
		let endTime = this.#frameEndTime;
		let t = (time-startTime) / (endTime - startTime);
		t = range.clamp(0, t, 1);
		let interpolationValue = this.#easingFunction(t);

		let thisFrame = this.#keyframes[this.#frame];

		if (this.#frame == this.#keyframes.length-1 && this.looping == false) {
			console.log("Finished!");
			this.playState = false;
			this.#lastValues = this.#keyframes[this.#frame];
			return this.#lastValues;
		}

		let nextFrame;
		if (this.#frame+1 < this.#keyframes.length) nextFrame = this.#keyframes[this.#frame+1];
		else nextFrame = this.#keyframes[this.#frame];

		if (this.looping && this.#frame+1 >= this.#keyframes.length) nextFrame = this.#keyframes[0];

		let interpolatedValues = new AnimationKeyframe;
		interpolatedValues.display.x = range.lerp(thisFrame.display.x, nextFrame.display.x, interpolationValue);
		interpolatedValues.display.y = range.lerp(thisFrame.display.y, nextFrame.display.y, interpolationValue);
		interpolatedValues.display.w = range.lerp(thisFrame.display.w, nextFrame.display.w, interpolationValue);
		interpolatedValues.display.h = range.lerp(thisFrame.display.w, nextFrame.display.w, interpolationValue);
		interpolatedValues.rotation = range.lerp(thisFrame.rotation, nextFrame.rotation, interpolationValue);

		this.#lastValues = interpolatedValues;
		return interpolatedValues;
	}

	/**
	 * @param  {...AnimationKeyframeValue} values 
	 * @returns {AnimationKeyframe}
	 */
	keyframe(...values) {
		let newKeyframe = new AnimationKeyframe;
		for (let i = 0; i < values.length; i ++) {
			let value = values[i];
			if (value instanceof AnimationKeyframeValue == false) {
				console.error("Cannot set a keyframe value if the type is not of `AnimationKeyframeValue`.");
				continue;
			}

			if (value.type == "size") {
				newKeyframe.display.w = value.values.w;
				newKeyframe.display.h = value.values.h;
			} else if (value.type == "pos") {
				newKeyframe.display.x = value.values.x;
				newKeyframe.display.y = value.values.y;
			} else if (value.type == "rot") {
				newKeyframe.rotation = value.values.angle;
			}
		}
		if (this.#keyframes.length == 0) this.#lastValues = newKeyframe;
		this.#keyframes.push(newKeyframe);
		let index = this.#keyframes.length - 1;
		newKeyframe.remove = () => {
			this.#keyframes.splice(index, 1);
		}
		return newKeyframe;
	}

	/**
	 * @param {number} w
	 * @param {number} h
	 * @returns {AnimationKeyframeValue}
	 */
	setSize(w, h) {
		let keyframeValue = new AnimationKeyframeValue;
		keyframeValue.type = "size";
		keyframeValue.values = { w, h };
		return keyframeValue;
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {AnimationKeyframeValue}
	 */
	moveTo(x, y) {
		let keyframeValue = new AnimationKeyframeValue;
		keyframeValue.type = "pos";
		keyframeValue.values = { x, y };
		return keyframeValue;
	}
	/**
	 * @param {string} colour
	 * @returns {AnimationKeyframeValue}
	 */
	colour(colour) {
		let keyframeValue = new AnimationKeyframeValue;
		keyframeValue.type = "colour";
		keyframeValue.values = { colour };
		return keyframeValue;
	}
	/**
	 * @param {string} colour
	 * @param {number} size 
	 * @returns {AnimationKeyframeValue}
	 */
	outline(colour, size) {
		let keyframeValue = new AnimationKeyframeValue;
		keyframeValue.type = "colour";
		keyframeValue.values = { colour };
		return keyframeValue;
	}

	/**
	 * @param {number} angle Angle in degrees
	 * @returns {AnimationKeyframeValue}
	 */
	rotation(angle) {
		let keyframeValue = new AnimationKeyframeValue;
		keyframeValue.type = "rot";
		keyframeValue.values = { angle };
		return keyframeValue;
	}
}

export class Rect extends Component {
	#cameraTracking = false;
	display = new Point4(0, 0, 100, 100);
	displayOffset = new Point4(0, 0, 100, 100);
	colour = "#FF00FF";
	setColour(colour="") { this.colour = colour; return this; }
	outline = { colour: "black", size: "5 / 100cz" };
	shadow = { colour: "black", blur: 0, offset: { x: 0, y: 0 } };

	/**
	 * A number or list specifying the radii of the circular arc
	 * to be used for the corners of the rectangle. The number and
	 * order of the radii function in the same way as the
	 * border-radius CSS property when width and height are positive:
	 * 
	 * - `all-corners`
	 * - `[all-corners]`
	 * - `[top-left-and-bottom-right, top-right-and-bottom-left]`
	 * - `[top-left, top-right-and-bottom-left, bottom-right]`
	 * - `[top-left, top-right, bottom-right, bottom-left]`
	 * 
	 * **Source: *[MDN docs | Canvas roundRect()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/roundRect#radii)***
	 * 
	 * @type {number|number[]}
	*/
	radius = 0;
	/** @type { number } Angle of rotation (degrees or radians depending on `Rect.rotationMode`) */
	rotation = 0;
	/** @type {"deg"|"rad"} Any value other than `"deg"` or `"rad"` defaults to no rotation */
	rotationMode = "deg";
	setBorderRadius(radius=this.radius) { this.radius = radius; return this; }
	cameraTracking = false;

	// /** @type {AnimationLib | undefined} */
	// #animation;
	// /**
	//  * 
	//  * @param {boolean} loop Loop animation on end
	//  * @param {number} duration Duration of each keyframe in ms 
	//  * @returns 
	//  */
	// animation(loop, duration) {
	// 	if (typeof duration == "number" && duration < 1) duration = 1;
	// 	this.#animation = new AnimationLib(loop, duration ?? 1000);
	// 	return this.#animation;
	// }

	constructor() {
		super();
		this.display.contains = (x=0, y=0) => {
			if (typeof x == "object" && x.x && x.y) { y = x.y; x = x.x; }
			let myPosX = this.display.x - this.display.w * this.transform.x;
			let myPosY = this.display.y - this.display.h * this.transform.y;
			return range.fits(
				myPosX,
				x,
				myPosX + this.display.w
			) &&
			range.fits(
				myPosY,
				y,
				myPosY + this.display.h
			);
		}
	}

	getType(){ return "Rect"; }

	/**
	 * 
	 * @param {CanvasRenderingContext2D} context 
	 * @param {Point2} defaultOffset 
	 * @returns {this}
	 */
	render(context, defaultOffset){

		if(["", "none"].includes(this.colour)) this.colour = "transparent";

		if (!this.visibility) return this;

		// if (this.#animation) {
		// 	let currentFrame = this.#animation.getCurrentFrame();
		// 	this.display.x = currentFrame.display.x;
		// 	this.display.y = currentFrame.display.y;
		// 	this.display.w = currentFrame.display.w;
		// 	this.display.h = currentFrame.display.h;
		// 	this.rotation = currentFrame.rotation;
		// }

		this.transform.x = range.clamp(0, this.transform.x, 1);
		this.transform.y = range.clamp(0, this.transform.y, 1);

		let destinationW = getValue( this.display.w, this.engine );
		let destinationH = getValue( this.display.h, this.engine );
		let destinationX = getValue( this.display.x, this.engine );
		let destinationY = getValue( this.display.y, this.engine );

		destinationX += defaultOffset?.x ?? 0;
		destinationX -= destinationW * this.transform.x;
		destinationY += defaultOffset?.y ?? 0;
		destinationY -= destinationH * this.transform.y;
		
		context.save();
		if (!this.fixedPosition) {
			if (this.isPixelArt == true || (this.isPixelArt == "unset" && this.engine.isPixelArt)) {
				context.translate(Math.floor(this.engine.canvas.width / 2), Math.floor(this.engine.canvas.height / 2));
				context.scale(Math.floor(this.engine.camera.zoom), Math.floor(this.engine.camera.zoom));
				destinationX = Math.floor(destinationX);
				destinationY = Math.floor(destinationY);
				destinationW = Math.floor(destinationW);
				destinationH = Math.floor(destinationH);
			} else {
				context.translate(this.engine.canvas.width / 2, this.engine.canvas.height / 2);
				context.scale(this.engine.camera.zoom, this.engine.camera.zoom);
			}
			context.translate(-this.engine.camera.position.x, -this.engine.camera.position.y);
		}
		context.translate(destinationX + destinationW * this.transform.x, destinationY + destinationH * this.transform.y);
		if (this.rotationMode == "deg") context.rotate(this.rotation * Math.PI / 180);
		else if (this.rotationMode == "rad") context.rotate(this.rotation);
		context.translate(-destinationX - destinationW * this.transform.x, - destinationY - destinationH * this.transform.y);

		context.beginPath();
		context.fillStyle = this.colour || "#FF00FF";

		let mousePos = this.engine.mouse.toObject(this);
		if (range.fits(0, mousePos.x, this.display.w) && this.engine.mouse.hoverable) {
			// context.fillStyle = "red";
			this.engine.mouse.hoverable = false;
		}

		context.strokeStyle = this.outline.colour;
		let lineWidth = getValue(this.outline.size, this.engine);
		context.lineWidth = lineWidth;
		context.roundRect(
			destinationX,
			destinationY,
			destinationW,
			destinationH,
			this.radius
		);
		context.fill();
		if(lineWidth > 0) context.stroke();
		context.closePath();

		context.restore();

		return this;
	}
}