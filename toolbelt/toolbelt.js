export * from "./lib/keyboard.js";
export * as image from "./lib/image.js";
export * as controller from "./lib/controller.js";
export * as device from "./lib/device.js";

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
	 * @param {number} number
	 * @returns  {boolean}
	 */
	contains(number) {
		return number >= this.min && number <= this.max;
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
}
/** @param {number} min @param {number} max @returns {Range} */
export function range(min, max) { return new Range(min, max); }

export function toRange(min=0, value=0.5, max=1) {
	return Math.max( Math.min(value, max), min );
}
export function isInRange(min=0, value=0.5, max=1) {
	return value >= min && value <= max;
}

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
	deg = 90;
	rad = 90 * (Math.PI/180);
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
		angle = angle ?? "deg";

		if (mode == "deg") {
			angle %= 360;
			if (angle < 0) angle += 360;
			this.deg = angle;
			this.rad = angle * (Math.PI/180);
		} else if (mode == "rad") {
			angle %= Math.PI * 2;
			if (angle < 0) angle += Math.PI * 2;
			this.deg = angle * (180/Math.PI);
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
		this.setAngle(radian, "rad");

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