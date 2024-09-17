import { Component, engine, Point2 } from "../utils.js";

export class Text extends Component {
	content = "Text Object";

	setContent(content="") {
		this.content = content;
		return this;
	}

	textColour = "purple";
	setColour(colour=this.textColour) {
		this.textColour = colour;
		return this;
	}

	/**
	 * @type {number | string}
	 */
	textSize = 48 | "48px";
	/**
	 * 
	 * @param {number | string} size
	 */
	setTextSize(size) {
		this.textSize = size;
		return this;
	}

	fontFamily = "sans-serif";
	setFontFamily(string="") {
		this.fontFamily = string;
		return this;
	}
	/**
	 * @type {"left" | "right" | "center" | "start" | "end"}
	 */
	textAlign = "center";

	/**
	 * @type {"top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom"}
	 */
	textBaseLine = "middle";
	setTextBaseLine(textBaseLine=this.textBaseLine) {
		this.textBaseLine = textBaseLine;
		return this;
	}

	letterSpacing = 0 || "0px";

	/**
	 * @type {"ltr" | "rtl" | "inherit"}
	 */
	direction = "inherit";

	styling = "normal";
	
	outline = { colour: "black", size: 0 };

	getType(){ return "Text"; }

	render(context=new CanvasRenderingContext2D, defaultOffset=new Point2){
		
		if (!this.visibility) return this;

		if (typeof this.textSize == "number") this.textSize += "px";
		if (typeof this.letterSpacing == "number") this.letterSpacing += "px";

		context.font = `${this.styling} ${this.textSize} ${this.fontFamily}, Arial`;
		context.fillStyle = this.textColour;
		context.textAlign = this.textAlign;
		context.textBaseline = this.textBaseLine;
		context.direction = this.direction;
		context.letterSpacing = this.letterSpacing;

		let metrics = context.measureText(this.content);
		this.display.w = metrics.width;
		this.display.h = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

		let offset = { x: 0, y: 0 };

		offset.x += defaultOffset.x;
		offset.y += defaultOffset.y;

		if(this.cameraTracking == true) {
			engine.camera.moveTo(this.display.x, this.display.y);
			this.fixedPosition = false;
		}
		if(this.fixedPosition == false) {
			offset.x -= engine.camera.position.x;
			offset.y -= engine.camera.position.y;
		}

		let destinationX = this.display.x + offset.x;
		let destinationY = this.display.y + offset.y;

		context.save();
		if (!this.fixedPosition) {
			context.translate(engine.canvas.width / 2, engine.canvas.height / 2);
			context.scale(engine.camera.zoom, engine.camera.zoom);
		}
		context.beginPath();

		context.strokeStyle = this.outline.colour;
		context.lineWidth = this.outline.size;

		context.translate(this.display.x + offset.x, this.display.y + offset.y);
		// context.rotate(angle);
		// context.translate(-this.displayOffset.x, -this.displayOffset.y);

		var lines = this.content.split('\n');

		for (var i = 0; i < lines.length; i++) {
			if (this.outline.size > 0) context.strokeText(lines[i], destinationX, destinationY + (i * this.display.h * 1.25) );
			context.fillText(lines[i], 0, (i * this.display.h * 1.25) );
		}

		context.closePath();
		context.restore();
	
		return this;
	}

}