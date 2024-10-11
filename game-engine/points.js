import { isInRange } from "../toolbelt/toolbelt.js";

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
	}
	translate(x=0, y=0) {
		this.x += x;
		this.y += y;
	}
	scale(x=1, y=1) {
		this.x *= x;
		this.y *= y;
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
	 * @returns 
	 */
	contains(x=0, y=0) {
		if (typeof x == "object" && x.x && x.y) { y = x.y; x = x.x; }
		return isInRange(this.x, x, this.x+this.w) && isInRange(this.y, y, this.y+this.h);
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