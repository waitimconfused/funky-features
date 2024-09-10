export * from "./lib/keyboard.js";
export * as image from "./lib/image.js";
export * as controller from "./lib/controller.js";
export * as device from "./lib/device.js";
export * as canvas from "./lib/canvas.js";

export function toRange(min=0, value=0.5, max=1) {
	return Math.max( Math.min(value, max), min );

}
export function isInRange(min=0, value=0.5, max=1) {
	return value >= min && value <= max;
}

export function roundToNearest(number=3.14, nearest=1) {
	return Math.round(number / nearest) * nearest;
}

class Vector {
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
		if (!angle) angle = 0;
		if (!mode) mode = "deg";

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
		if (!x) x = 0;
		if (!y) y = 1;

		let radian = Math.atan(y / x);
		this.setAngle(radian);

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