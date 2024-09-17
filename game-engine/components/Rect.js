import { Component, Point2, Point4, engine } from "../utils.js";

export class Rect extends Component {
	display = new Point4(0, 0, 100, 100);
	displayOffset = new Point4(0, 0, 100, 100);
	colour = "purple";
	setColour(colour="") { this.colour = colour; return this; }
	outline = { colour: "black", size: 0 };
	radius = 0;
	setBorderRadius(radius=this.radius) { this.radius = radius; return this; }
	cameraTracking = false;

	getType(){ return "Rect"; }

	render(context=new CanvasRenderingContext2D, defaultOffset=new Point2){
		
		if (!this.visibility) return this;

		let offset = { x: 0, y: 0 };

		if(["", "none"].includes(this.colour)) this.colour = "transparent";

		offset.x += defaultOffset.x;
		offset.y += defaultOffset.y;

		offset.x -= this.display.w * this.transform.x;
		offset.y -= this.display.h * this.transform.y;

		if(this.cameraTracking) {
			engine.camera.moveTo(this.display.x, this.display.y);
			this.fixedPosition = false;
		}

		if(!this.fixedPosition) {
			offset.x -= engine.camera.position.x;
			offset.y -= engine.camera.position.y;
		}

		this.displayOffset.x = this.display.x + offset.x;
		this.displayOffset.y = this.display.y + offset.y;
		this.displayOffset.w = this.display.w;
		this.displayOffset.h = this.display.h;

		if(this.isPixelArt == true || (this.isPixelArt == "unset" && engine.isPixelArt)){
			this.displayOffset.x = Math.floor(this.displayOffset.x);
			this.displayOffset.y = Math.floor(this.displayOffset.y);
			this.displayOffset.x = Math.floor(this.displayOffset.x);
			this.displayOffset.w = Math.floor(this.displayOffset.w);
			this.displayOffset.h = Math.floor(this.displayOffset.h);
		}

		context.save();
		if (!this.fixedPosition) {
			if (this.isPixelArt == true || (this.isPixelArt == "unset" && engine.isPixelArt)) {
				context.translate(Math.round(engine.canvas.width / 2), Math.round(engine.canvas.height / 2));
				context.scale(Math.round(engine.camera.zoom), Math.round(engine.camera.zoom));
			} else {
				context.translate(engine.canvas.width / 2, engine.canvas.height / 2);
				context.scale(engine.camera.zoom, engine.camera.zoom);
			}
		}
		context.beginPath();
		context.fillStyle = this.colour;
		context.strokeStyle = this.outline.colour;
		context.lineWidth = this.outline.size;
		context.roundRect(
			this.displayOffset.x,
			this.displayOffset.y,
			this.displayOffset.w,
			this.displayOffset.h,
			this.radius
		);
		context.fill();
		if(this.outline.size > 0) context.stroke();
		context.closePath();
		context.restore();
	}
}