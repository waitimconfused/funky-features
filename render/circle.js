import { context, objects } from "./index.js";

export default class Circle {
	display = {
		x: 0,
		y: 0,
		r: 0
	}

	constructor(x=0, y=0, radius=0){
		this.display.x = x;
		this.display.y = y;
		this.display.r = radius;

		objects.push(this);

		return this;
	}

	moveTo(x=0, y=0){
		this.display.x = x;
		this.display.y = y;

		return this;
	}

	setRadius(radius=0) {
		this.display.r = radius;
		return this;
	}

	getDistance(originX=0, originY=0){

		let dx = this.display.x - originX;
		let dy = this.display.y - originY;
		let distance = Math.hypot(dx, dy) - this.display.r;
		distance = Math.max(distance, 0);
		return Math.max(distance, 0);
	}

	render(){
		context.beginPath();
		context.arc(this.display.x, this.display.y, this.display.r, 0, 2 * Math.PI);
		context.fillStyle = "black";
		context.fill();

		return this;
	}
}

// function distance(rect, p) {
// 	var dx = Math.max(rect.min.x - p.x, 0, p.x - rect.max.x);
// 	var dy = Math.max(rect.min.y - p.y, 0, p.y - rect.max.y);
// 	return Math.sqrt(dx*dx + dy*dy);
// }