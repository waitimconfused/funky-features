import { context, objects } from "./index.js";

export default class Rect {
	display = {
		x: 0,
		y: 0,
		w: 0,
		h: 0
	}

	constructor(x=0, y=0, width=0, height=0){
		this.display.x = x;
		this.display.y = y;
		this.display.w = width;
		this.display.h = height;

		objects.push(this);

		return this;
	}

	moveTo(x=0, y=0){
		this.display.x = x;
		this.display.y = y;

		return this;
	}

	setSize(width=0, height=0) {
		this.display.w = width;
		this.display.h = height;
		return this;
	}

	getDistance(originX=0, originY=0){
		let minX = Math.min(this.display.x, this.display.x + this.display.w);
		let maxX = Math.max(this.display.x, this.display.x + this.display.w);
		
		let minY = Math.min(this.display.y, this.display.y + this.display.h);
		let maxY = Math.max(this.display.y, this.display.y + this.display.h);

		var dx = Math.max(minX - originX, 0, originX - maxX);
		var dy = Math.max(minY - originY, 0, originY - maxY);

		let distance = Math.hypot(dx, dy);
		return distance;
	}

	render(){
		context.fillStyle = "black";
		context.fillRect(this.display.x, this.display.y, this.display.w, this.display.h);

		return this;
	}
}

// function distance(rect, p) {
// 	var dx = Math.max(rect.min.x - p.x, 0, p.x - rect.max.x);
// 	var dy = Math.max(rect.min.y - p.y, 0, p.y - rect.max.y);
// 	return Math.sqrt(dx*dx + dy*dy);
// }