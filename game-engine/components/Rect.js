import { isInRange, toRange } from "../../toolbelt/toolbelt.js";
import { Component, Point2, Point4, engine } from "../utils.js";

export class Rect extends Component {
	#cameraTracking = false;
	display = new Point4(0, 0, 100, 100);
	displayOffset = new Point4(0, 0, 100, 100);
	colour = "purple";
	setColour(colour="") { this.colour = colour; return this; }
	outline = { colour: "black", size: 0 };
	radius = 0;
	/** @type { number } In Degrees */
	rotation = 0;
	setBorderRadius(radius=this.radius) { this.radius = radius; return this; }
	cameraTracking = false;

	constructor() {
		super();
		this.display.contains = (x=0, y=0) => {
			if (typeof x == "object" && x.x && x.y) { y = x.y; x = x.x; }
			let myPosX = this.display.x - this.display.w * this.transform.x;
			let myPosY = this.display.y - this.display.h * this.transform.y;
			return isInRange(
				myPosX,
				x, myPosX + this.display.w
			) &&
			isInRange(
				myPosY,
				y,
				myPosY + this.display.h
			);
		}
	}

	getType(){ return "Rect"; }

	render(context=new CanvasRenderingContext2D, defaultOffset=new Point2){

		if(["", "none"].includes(this.colour)) this.colour = "transparent";

		if (!this.visibility) return this;

		this.transform.x = toRange(0, this.transform.x, 1);
		this.transform.y = toRange(0, this.transform.y, 1);

		let destinationW = this.display.w;
		let destinationH = this.display.h;

		let offset = { x: 0, y: 0 };
		
		offset.x += defaultOffset.x;
		offset.y += defaultOffset.y;

		offset.x -= destinationW * this.transform.x;
		offset.y -= destinationH * this.transform.y;
		let destinationX = this.display.x + offset.x;
		let destinationY = this.display.y + offset.y;
		
		context.save();
		if (!this.fixedPosition) {
			if (this.isPixelArt == true || (this.isPixelArt == "unset" && engine.isPixelArt)) {
				context.translate(Math.floor(engine.canvas.width / 2), Math.floor(engine.canvas.height / 2));
				context.scale(Math.floor(engine.camera.zoom), Math.floor(engine.camera.zoom));
				destinationX = Math.floor(destinationX);
				destinationY = Math.floor(destinationY);
				destinationW = Math.floor(destinationW);
				destinationH = Math.floor(destinationH);
			} else {
				context.translate(engine.canvas.width / 2, engine.canvas.height / 2);
				context.scale(engine.camera.zoom, engine.camera.zoom);
			}
			context.translate(-engine.camera.position.x, -engine.camera.position.y);
		}
		context.translate(destinationX + destinationW * this.transform.x, destinationY + destinationH * this.transform.y);
		context.rotate(this.rotation * Math.PI / 180);
		context.translate(-destinationX - destinationW * this.transform.x, - destinationY - destinationH * this.transform.y);

		context.beginPath();
		context.fillStyle = this.colour || "purple";
		context.strokeStyle = this.outline.colour;
		context.lineWidth = this.outline.size;
		context.roundRect(
			destinationX,
			destinationY,
			destinationW,
			destinationH,
			this.radius
		);
		context.fill();
		if(this.outline.size > 0) context.stroke();
		context.closePath();

		context.restore();

		return this;
	}
}