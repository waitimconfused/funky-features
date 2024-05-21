export class Point2 {
	x = 0;
	y = 0;

	constructor(x=this.x, y=this.y){
		this.x = x;
		this.y = y;
	}

	set(x=this.x, y=this.y) {
		this.x = x;
		this.y = y;
	}
	translate(x=0, y=0){
		this.x += x;
		this.y += y;
	}
}

export class Point3 {
	x = 0;
	y = 0;
	z = 0;

	constructor(x=0, y=0, z=0){
		this.x = x;
		this.y = y;
		this.z = z;
	}

	set(x=0, y=0, z=0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	translate(x=0, y=0, z=0){
		this.x += x;
		this.y += y;
		this.z += z;
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
}