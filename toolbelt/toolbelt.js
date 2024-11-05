export * from "./lib/keyboard.js";
export * as image from "./lib/image.js";
export * as controller from "./lib/controller.js";
export * as device from "./lib/device.js";
export * as point from "./lib/points.js";

export class Range {
	#min = 0;
	#max = 1;
	
	/** @param {number} number */
	set min(number) {
		this.#min = number;
		if (this.#min > this.#max) {
			this.#min = [this.#max, this.#max = this.#min][0];
		}
	}

	/** @returns {number} */
	get min() {
		return this.#min;
	}
	
	/** @param {number} number */
	set max(number) {
		this.#max = number;
		if (this.#max < this.#min) {
			this.#max = [this.#min, this.#min = this.#max][0];
		}
	}

	/** @returns {number} */
	get max() {
		return this.#max;
	}

	constructor(min, max) {
		this.#min = Math.min(min, max);
		this.#max = Math.max(min, max);
	}

	/**
	 * @param { function | undefined } func 
	 * @returns {number[]}
	 */
	select(func) {
		if (!func) func = ( (x) => x );
		let array = [];
		for (let i = this.#min; i <= this.#max; i ++) {
			let item = func(i);
			if (typeof item == "number") array.push(item);
			if (typeof item == "boolean" && item) array.push(i);
		}
		return array;
	}

	/**
	 * @param {number} number
	 * @returns {boolean}
	 */
	clamp(number) {
		return Math.max( Math.min(number, this.max), this.min );
	}
	/**
	 * 
	 * @param {number} min
	 * @param {number} number
	 * @param {number} max
	 * @returns {number}
	 */
	static clamp(min, number, max) {
		return Math.max( Math.min(number, max), min );
	}

	/**
	 * @param {number} number
	 * @returns  {boolean}
	 */
	contains(number) {
		return number >= this.min && number <= this.max;
	}
	/**
	 * 
	 * @param {number} min
	 * @param {number} number
	 * @param {number} max
	 * @returns {boolean}
	 */
	static isInRange(min, number, max) {
		return value >= min && number <= max;
	}
}

/** @param {number} min @param {number} max @returns {Range} */
export function range(min, max) { return new Range(min, max); }
export const toRange = Range.clamp
export const isInRange = Range.isInRange

export function roundToNearest(number=3.14, nearest=1) {
	return Math.round(number / nearest) * nearest;
}

export function floorToNearest(number=3.14, nearest=1) {
	return Math.floor(number / nearest) * nearest;
}

export function ceilToNearest(number=3.14, nearest=1) {
	return Math.ceil(number / nearest) * nearest;
}

export function randomInRange(min, max) {
	return Math.random() * (max - min + 1) + min;
}

export function lerp(a, b, t) {
	return a + (b - a) * t;
}

export class Vector {
	#deg = 90;
	#rad = 90 * (Math.PI/180);

	/** @param {number} number */
	set deg(number) {
		this.#deg = number;
		this.#rad = number * (Math.PI/180);
	}
	/** @param {number} number */
	set rad(number) {
		this.#deg = number * (180/Math.PI);
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