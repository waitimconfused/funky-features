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

	toObject() {
		return {
			x: this.x,
			y: this.y
		}
	}
}

export class Point3 {
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

	set(x=0, y=0, w=0, h=0) {
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

	toObject() {
		return {
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h
		}
	}
}