import { Component, Point2, engine } from "../utils.js";

export class Polygon extends Component {
	display = new Point2(0, 0, 100, 100);
	displayOffset = new Point2(0, 0, 100, 100);
	radius = 100;
	colour = "purple";
	outline = { colour: "black", size: 0 };
	fixedPosition = true;
	cameraTracking = false;
	smooth = false;

	positions = [];

	addPoint(point=new Point2) {
		if(point instanceof Point2 == false) {
			if(!point.x || !point.y) throw new Error;
			point = new Point2(point.x, point.y);
		}

		this.positions.push(point.toObject());
	}

	getType(){ return "Polygon"; }

	render(context=new CanvasRenderingContext2D, defaultOffset=new Point2){
		
		if (!this.visibility) return this;

		if( this.positions.length == 0 ) return;

		let offset = { x: 0, y: 0 };

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
			context.translate(engine.canvas.width / 2, engine.canvas.height / 2);
			context.scale(engine.camera.zoom, engine.camera.zoom);
		}
		context.beginPath();
		context.fillStyle = this.colour;
		context.strokeStyle = this.outline.colour;
		context.lineWidth = this.outline.size;

		// move to the first point
		context.moveTo(
			this.positions[0].x + this.displayOffset.x,
			this.positions[0].y + this.displayOffset.y
		);

		if(this.smooth) {

			for (var i = 1; i < this.positions.length - 2; i++) {
				let xc = (this.positions[i].x + this.positions[i + 1].x) / 2;
				let yc = (this.positions[i].y + this.positions[i + 1].y) / 2;
				context.quadraticCurveTo(
					this.positions[i].x + this.displayOffset.x,
					this.positions[i].y + this.displayOffset.y,

					xc + this.displayOffset.x,
					yc + this.displayOffset.y
				);
			}
			// curve through the last two points
			context.quadraticCurveTo(
				this.positions[i].x + this.displayOffset.x,
				this.positions[i].y + this.displayOffset.y,
				
				this.positions[i+1].x  + this.displayOffset.x,
				this.positions[i+1].y  + this.displayOffset.y
			);
		}else {
			for (let i = 1; i < this.positions.length; i ++) {
				context.lineTo(
					this.positions[i].x + this.displayOffset.x,
					this.positions[i].y + this.displayOffset.y
				);
			}
		}

		context.fill();
		if(this.outline.size > 0) context.stroke();
		context.closePath();
	}
}