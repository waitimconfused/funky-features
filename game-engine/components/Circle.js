import { Component, Point2, engine } from "../utils.js";

export class Circle extends Component {
	display = new Point2(0, 0, 100, 100);
	displayOffset = new Point2(0, 0, 100, 100);
	radius = 100;
	colour = "purple";
	outline = { colour: "black", size: 0 };
	fixedPosition = false;
	cameraTracking = false;

	getType(){ return "Circle"; }

	render(context=new CanvasRenderingContext2D, defaultOffset={x:0,y:0}){
		
		if (!this.visibility) return this;

		let offset = { x: 0, y: 0 };

		if(["", "none"].includes(this.colour)) this.colour = "transparent";

		offset.x += defaultOffset.x;
		offset.y += defaultOffset.y;

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

		if(engine.isPixelArt){
			this.displayOffset.x = Math.floor(this.displayOffset.x);
			this.displayOffset.y = Math.floor(this.displayOffset.y);
			this.displayOffset.x = Math.floor(this.displayOffset.x);
		}
		
		context.save();
		if (!this.fixedPosition) {
			if (engine.isPixelArt || this.isPixelArt) {
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
		context.arc(this.displayOffset.x, this.displayOffset.y, this.radius, 0, 2 * Math.PI);
		context.fill();
		if(this.outline.size > 0) context.stroke();
		context.closePath();

		context.restore();
	}
}