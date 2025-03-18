export * from "./lib/keyboard.js";
export * as image from "./lib/image.js";
export { Controller } from "./lib/controller.js";
export * as device from "./lib/device.js";
export * as point from "./lib/points.js";
export * from "./lib/colours.js";
export * as units from "./lib/units.js";

export const Range = new class Range {

	/**
	 * 
	 * @param {number} min
	 * @param {number} number
	 * @param {number} max
	 * @returns {number}
	 */
	clamp(min, number, max) {
		return Math.max(Math.min(number, max), min);
	}

	/**
	 * Detect if any number is within the range [min, max]
	 * @param {number} min
	 * @param {number} number
	 * @param {number} max
	 * @returns  {boolean}
	 */
	fits(min, number, max) {
		return number >= min && number <= max;
	}

	/**
	 * Returns a random number in the range [min, max]
	 * @param {number} min
	 * @param {number} max
	 * @returns {number}
	 */
	random(min, max) {
		return Math.random() * (max - min) + min;
	}

	/**
	 * Returns the sine of a number, scaled to fit range
	 * @param {number} min
	 * @param {number} max
	 * @param {number} number
	 * @returns {number}
	 */
	sin(min, max, number) {
		if (min > max) max = [min, min = max][0];

		let scale = Math.abs( (max-min) / 2 );
		let offset = (max+min)/2;
		return scale * Math.sin(number) + offset;
	}

	/**
	 * Returns the cosine of a number, scaled to fit range
	 * @param {number} min
	 * @param {number} max
	 * @param {number} number
	 * @returns {number}
	 */
	cos(min, max, number) {
		if (min > max) max = [min, min = max][0];

		let scale = Math.abs( (max-min) / 2 );
		let offset = (max+min)/2;
		return scale * Math.cos(number) + offset;
	}
}

export const Round = new class Round {

	round = Math.round;
	floor = Math.floor;
	ceil = Math.ceil;

	roundToNearest(number=3.14, step=1) {
		let rounded = Math.round(number / step) * step;
		if (`${rounded}`.includes(".")) {
			let step_decimalNumbers = `${step}`.replace(/(\d*)\./, "").length;
			rounded = rounded.toFixed(step_decimalNumbers)
		}
		return rounded;
	}
	
	floorToNearest(number = 3.14, nearest = 1) {
		let rounded = Math.floor(number / step) * step;
		if (`${rounded}`.includes(".")) {
			let step_decimalNumbers = `${step}`.replace(/(\d*)\./, "").length;
			rounded = rounded.toFixed(step_decimalNumbers)
		}
		return rounded;
	}
	
	ceilToNearest(number = 3.14, nearest = 1) {
		let rounded = Math.ceil(number / step) * step;
		if (`${rounded}`.includes(".")) {
			let step_decimalNumbers = `${step}`.replace(/(\d*)\./, "").length;
			rounded = rounded.toFixed(step_decimalNumbers)
		}
		return rounded;
	}
}

/** @param {number} min @param {number} max @returns {Range} */

export function roundToNearest(number = 3.14, nearest = 1) {
	return Math.round(number / nearest) * nearest;
}

export function floorToNearest(number = 3.14, nearest = 1) {
	return Math.floor(number / nearest) * nearest;
}

export function ceilToNearest(number = 3.14, nearest = 1) {
	return Math.ceil(number / nearest) * nearest;
}

export function randomInRange(min, max) {
	return Math.random() * (max - min) + min;
}

export function lerp(a, b, t) {
	return a + (b - a) * t;
}

export class Vector {
	#deg = 90;
	#rad = 90 * (Math.PI / 180);

	/** @param {number} number */
	set deg(number) {
		this.#deg = number;
		this.#rad = number * (Math.PI / 180);
	}
	/** @param {number} number */
	set rad(number) {
		this.#deg = number * (180 / Math.PI);
		this.#rad = number;
	}
	get deg() { return this.#deg; }
	get rad() { return this.#rad; }
	mag = 1;

	/**
	 * 
	 * If: `a = number`, `b = number` it uses `setPos()`
	 * 
	 * If: `a = number`, `b = "deg" | "rad"` it uses `setAngle()`
	 * 
	 * @param { number } a
	 * @param { number | "deg" | "rad" } b
	 */
	constructor(a, b) {
		if (typeof a == "number" && typeof b == "number") {
			this.setPos(a, b);
		} else if (typeof a == "number" && typeof b == "string") {
			this.setAngle(a, b);
		}
		return this;
	}

	/**
	 * 
	 * @param { number } angle
	 * @param { "deg" | "rad" } mode
	 */
	setAngle(angle, mode) {
		angle = angle ?? 0;
		mode = mode ?? "deg";

		if (mode == "deg") {
			angle %= 360;
			if (angle < 0) angle += 360;
			this.deg = angle;
		} else if (mode == "rad") {
			angle %= Math.PI * 2;
			if (angle < 0) angle += Math.PI * 2;
			this.rad = angle;
		}

		return this;
	}

	/**
	 * @param { number } x
	 * @param { number } y
	 */
	setPos(x, y) {
		x = x ?? 0;
		y = y ?? 0;

		let radian = Math.atan(y / x) + Math.PI * (x < 0);
		this.rad = radian;

		this.mag = Math.hypot(x, y);

		return this;
	}

	xy() {
		return {
			x: Math.cos(this.rad) * this.mag,
			y: Math.sin(this.rad) * this.mag
		};
	}
}

/**
 * @param {string|null|undefined} colour 
 * @returns {string}
 */
export function parseColour(colour) {
	let output = colour;
	if (["", "none", null, undefined].includes(output)) {
		output = "transparent";
	}
	if (/^var\(.*\)$/gm.test(output)) {
		let cssVar = output.replace(/^var\(|\)$/g, "")
		output = window.getComputedStyle(document.documentElement).getPropertyValue(cssVar);
	}
	if (/^color-mix\(.*\)$/gm.test(output)) {
		let parameters = output.replace(/^color-mix\(|\)$/g, "").replace(/\s*,\s/g, ",").split(",");
	}

	return output;
}