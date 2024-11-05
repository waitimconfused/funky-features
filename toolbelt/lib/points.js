import { isInRange } from "../toolbelt.js";

export class Point2 {
	x = 0;
	y = 0;

	constructor(x=this.x, y=this.y) {
		this.x = x;
		this.y = y;
	}

	set(x=this.x, y=this.y) {
		this.x = x;
		this.y = y;
		return this;
	}
	/**
	 * 
	 * @param {number | Point2} x
	 * @param {number | undefined} y 
	 */
	translate(x, y) {
		if (typeof x == "object" && typeof x?.x == "number" && typeof x?.y == "number") {
			y = x.y;
			x = x.x;
		}
		this.x += x;
		this.y += y;
		return this;
	}
	scale(x=1, y=1) {
		this.x *= x;
		this.y *= y;
		return this;
	}

	/**
	 * 
	 * @param {number | Point2} x 
	 * @param {number | undefined} y 
	 * @returns 
	 */
	equals(x=0,y=0) {
		if (x instanceof Point2) { y = x.x; x = x.x; }
		return this.x == x && this.y == y;
	}

	toObject() {
		return {
			x: this.x,
			y: this.y
		}
	}
	clone() {
		return new Point2(this.x, this.y);
	}
}

export class Point3 extends Point2 {
	x = 0;
	y = 0;
	z = 0;

	constructor(x=0, y=0, z=0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	set(x=0, y=0, z=0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	translate(x=0, y=0, z=0) {
		this.x += x;
		this.y += y;
		this.z += z;
	}
	scale(x=1, y=1, z=1) {
		this.x *= x;
		this.y *= y;
		this.z *= z;
	}

	/**
	 * 
	 * @param {number | Point2} x
	 * @param {number | undefined} y
	 * @param {number | undefined} z
	 * @returns 
	 */
	equals(x=0, y=0, z=0) {
		if (x instanceof Point3) { y = x.x; z = x.z; x = x.x; }
		return this.x == x && this.y == y && this.z == z;
	}

	toObject() {
		return {
			x: this.x,
			y: this.y,
			z: this.z
		}
	}
}

export class Point4 {
	x = 0;
	y = 0;
	w = 0;
	h = 0;

	constructor(x=0, y=0, w=0, h=0) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	/**
	 * 
	 * @param { number | Point4 } x
	 * @param { number | undefined } y
	 * @param { number | undefined } w
	 * @param { number | undefined } h
	 */
	set(x, y, w, h) {
		if (x instanceof Point4 || (x?.w && x?.h)) {
			y = x.y;
			w = x.w;
			h = x.h;
			x = x.x;
		}
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}
	translate(x=0, y=0, w=0, h=0){
		this.x += x;
		this.y += y;
		this.w += w;
		this.h += h;
	}
	scale(x=1, y=1, w=1, h=1) {
		this.x *= x;
		this.y *= y;
		this.w *= w;
		this.h *= h;
	}

	/**
	 * 
	 * @param {number | Point2 | {x:number, y:number}} x
	 * @param {number | undefined} y
	 * @param {number | undefined} z
	 * @returns {boolean}
	 */
	contains(x=0, y=0) {
		if (typeof x == "object" && x.x && x.y) { y = x.y; x = x.x; }
		return isInRange(this.x, x, this.x+this.w) && isInRange(this.y, y, this.y+this.h);
	}

	/**
	 * @param {Point4} point4
	 * @returns {boolean}
	 */
	intersectingWith(point4) {
		let r1_left = this.x - this.w / 2;
		let r1_right = this.x + this.w / 2;
		let r1_up = this.y - this.h / 2;
		let r1_down = this.y + this.h / 2;
		
		let r2_left = point4.x - point4.w / 2;
		let r2_right = point4.x + point4.w / 2;
		let r2_up = point4.y - point4.h / 2;
		let r2_down = point4.y + point4.h / 2;

		let r1IntersectingX = isInRange(r2_left, r1_left, r2_right) || isInRange(r2_left, r1_left, r2_right);
		let r1IntersectingY = isInRange(r2_up, r1_up, r2_down) || isInRange(r2_up, r1_down, r2_down);

		let r2IntersectingX = isInRange(r1_left, r2_left, r1_right) || isInRange(r1_left, r2_left, r1_right);
		let r2IntersectingY = isInRange(r1_up, r2_up, r1_down) || isInRange(r2_up, r1_down, r2_down);

		let intersecting = (
			(r1IntersectingX && r1IntersectingY) ||
			(r2IntersectingX && r2IntersectingY) ||
			(r1IntersectingX && r2IntersectingY) ||
			(r1IntersectingY && r2IntersectingX)
		);
		
		return intersecting;
	}

	toObject() {
		return {
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h
		}
	}
}