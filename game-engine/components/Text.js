import { Component, engine, Point2, Point4 } from "../utils.js";

export class Text extends Component {
	crop = new Point4(0, 0);

	content = "Text Object";

	color = "black";
	textSize = "10px";
	font = "sans-serif";
	textAlign = "start";
	textBaseLine = "alphabetic";
	direction = "inherit";
	styling = "normal";

	fixedPosition = true;

	getType(){ return "Text"; }

	constructor(){
		super();
		delete this.colour;
		return this;
	}

	setCrop(x=0, y=0, w=0, h=0){
		this.crop.x = x;
		this.crop.y = y;
		this.crop.w = w;
		this.crop.h = h;
		return this;
	}

	render(context=new CanvasRenderingContext2D){

		context.font = `${this.styling} ${this.textSize} ${this.font}`;
		context.fillStyle = this.color;
		context.textAlign = this.textAlign;
		context.textBaseline = this.textBaseLine;
		context.direction = this.direction;

		let metrics = context.measureText(this.content);
		this.display.w = metrics.width;
		this.display.h = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

		let offset = { x: 0, y: 0 };
		if(this.cameraTracking) {
			engine.camera.moveTo(this.display.x, this.display.y);
			this.fixedPosition = false;
		}
		if(this.fixedPosition == false) {
			offset.x -= engine.camera.position.x;
			offset.y -= engine.camera.position.y;
			offset.x += engine.canvas.width / 2;
			offset.y += engine.canvas.height / 2;
		}

		let destinationX = this.display.x + offset.x;
		let destinationY = this.display.y + offset.y;

		// context.fillText(this.content, destinationX, destinationY);

		var lines = this.content.split('\n');

		for (var i = 0; i < lines.length; i++) {
			context.fillText(lines[i], destinationX, destinationY + (i * this.display.h * 1.25) );
		}
	
		return this;
	}

}