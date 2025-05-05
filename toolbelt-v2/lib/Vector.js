const radToDeg = 180 / Math.PI;
const degToRad = Math.PI / 180;

export class Vector {
	#deg = 0;
	#rad = 0;
	#mag = 1;
	#x = 1;
	#y = 0;

	/** @param {number} number */
	set deg(number) {
		this.#deg = number;
		this.#rad = number * degToRad;
		this.#x = this.#mag * Math.cos( this.#rad );
		this.#y = this.#mag * Math.sin( this.#rad );
	}
	get deg() { return this.#deg; }


	/** @param {number} number */
	set rad(number) {
		this.#deg = number * radToDeg;
		this.#rad = number;
		this.#x = this.#mag * Math.cos(number);
		this.#y = this.#mag * Math.sin(number);
	}
	get rad() { return this.#rad; }


	/** @param {number} number */
	set mag(number) {
		this.#mag = number;
		this.#x = this.#mag * Math.cos( this.#rad );
		this.#y = this.#mag * Math.sin( this.#rad );
	}
	get mag() { return this.#mag; }


	/** @param {number} number */
	set x(number) {
		this.#x = number;
		this.#mag = Math.hypot(number, this.#y);
		this.#rad = Math.atan2(this.#y, number);
		this.#deg = this.#rad * radToDeg;
	}
	get x() { return this.#x; }

	/** @param {number} number */
	set y(number) {
		this.#y = number;
		this.#mag = Math.hypot(this.#x, number);
		this.#rad = Math.atan2(number, this.#x);
		this.#deg = this.#rad * radToDeg;
	}
	get y() { return this.#y; }

	/**
	 * When `mode="xy"`, `a` represents the *X-position*, and `b` represents the *Y-position*
	 * 
	 * When `mode="deg"`, `a` represents the *magnitude*, and `b` represents the *angle* (***in degrees***)
	 * 
	 * When `mode="rad"`, `a` represents the *magnitude*, and `b` represents the *angle* (***in radians***)
	 * 
	 * @param {"xy"|"deg"|"rad"} mode
	 * @param {number} a 
	 * @param {number} b 
	 */
	constructor(mode, a, b) {
		if (mode == "xy") {
			this.#x = a;
			this.y = b;
		} else if (mode == "deg") {
			this.#mag = a;
			this.deg = b;
		} else if (mode == "rad") {
			this.#mag = a;
			this.rad = b;
		} else {
			throw new Error("Unknown Vector constructor mode of: \""+mode+"\"");
		}
	}


	/** @param {...Vector} vectors */
	add(...vectors) {
		let newVector = Vector.sumOf(this, ...vectors);
		this.#x = newVector.x;
		this.#y = newVector.y;
		this.#deg = newVector.deg;
		this.#rad = newVector.rad;
		this.#mag = newVector.mag;
		return this;
	}


	/**
	 * @param {number} x
	 * @param {number} y
	 */
	static fromPos(x, y) {
		let vector = new Vector;
		vector.x = x;
		vector.y = y;
		return vector;
	}

	/** @param {number} deg */
	static fromDeg(deg) {
		let vector = new Vector;
		vector.deg = deg;
		return vector;
	}

	/** @param {number} rad */
	static fromRad(rad) {
		let vector = new Vector;
		vector.rad = rad;
		return vector;
	}

	static averageRad(rad1, rad2) {
		rad1 %= 2 * Math.PI;
		rad2 %= 2 * Math.PI;

		let angle = (rad1 + rad2) / 2;

		if (Math.abs(rad2 - rad1) > Math.PI) angle += Math.PI;

		return angle;
	}

	/** @param {...Vector} vectors */
	static sumOf(...vectors) {
		let sum = { x: 0, y: 0 };

		for (let vector of vectors) {
			sum.x += vector.x;
			sum.y += vector.y;
		}

		let vector = new Vector;
		vector.x = sum.x;
		vector.y = sum.y;
		return vector;
	}

	/** @param {Vector} vector1 @param {Vector} vector2 */
	static dotProductOf(vector1, vector2) {
		let dx = vector1.x - vector2.x;
		let dy = vector1.y - vector2.y;

		let magnitude = Math.hypot(dx, dy);
		let angle = Math.atan2(dy, dx);

		return new Vector("rad", magnitude, angle);
	}
}