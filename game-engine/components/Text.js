import { Component, engine } from "../utils.js";

export class Text extends Component {
	content = "Text Object";

	textColour = "purple";
	textSize = 48 | "48px";
	fontFamily = "sans-serif";
	textAlign = "start";
	textBaseLine = "alphabetic";
	letterSpacing = 0 || "0px";
	direction = "inherit";
	styling = "normal";
	
	outline = { colour: "black", size: 0 };

	fixedPosition = true;

	getType(){ return "Text"; }

	render(context=new CanvasRenderingContext2D){

		if (typeof this.textSize == "number") this.textSize += "px";
		if (typeof this.letterSpacing == "number") this.letterSpacing += "px";

		context.font = `${this.styling} ${this.textSize} ${this.fontFamily}`;
		context.fillStyle = this.textColour;
		context.textAlign = this.textAlign;
		context.textBaseline = this.textBaseLine;
		context.direction = this.direction;
		context.letterSpacing = this.letterSpacing;

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

		context.strokeStyle = this.outline.colour;
		context.lineWidth = this.outline.size;

		for (var i = 0; i < lines.length; i++) {
			if (this.outline.size > 0) context.strokeText(lines[i], destinationX, destinationY + (i * this.display.h * 1.25) );
			context.fillText(lines[i], destinationX, destinationY + (i * this.display.h * 1.25) );
		}
	
		return this;
	}

}