import { tileSize } from "./index.js";

export class Point2D {
	x = 0;
	y = 0;
	scale = 1;

	constructor(x, y, scale){
		this.x = x;
		this.y = y;
	}

	moveTo(x=0, y=0){
		this.x = x;
		this.y = y;
	}

	translate(x=0, y=0){
		this.x += x;
		this.y += y;
	}
}

export function XYZ_iso(x=0, y=0, z=0){
	let isoX = x * (85 / 2) + y * (85 / -2);
	let isoY = x * (85 / -2) + y * (85 / -2);
	isoY /= 1.75;
	let isoZ = -z * (85 / 2.25);

	return new Point2D(-isoX, -isoY + isoZ);
}