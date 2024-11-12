import { Component, engine, Point2 } from "../utils.js";

export class Text extends Component {
	content = "Text Object";

	setContent(content="") {
		this.content = content;
		return this;
	}

	colour = "purple";
	setColour(colour=this.colour) {
		this.colour = colour;
		return this;
	}

	/**
	 * @type {number | string}
	 */
	fontSize = 48 | "48px";
	/**
	 * 
	 * @param {number | string} size
	 */
	setTextSize(size) {
		this.fontSize = size;
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
	setTextAlign(string="") {
		this.textAlign = string;
		return this;
	}

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

	/**
	 * @type {"normal", "bold", "italic"}
	 */
	styling = "normal";

	outline = { colour: "black", size: 0 };
	shadow = { colour: "black", blur: 0, offset: { x: 0, y: 0 } };

	getType(){ return "Text"; }

	render(context=new CanvasRenderingContext2D, defaultOffset=new Point2){

		this.content = `${this.content}`;

		if (!this.visibility) return this;

		if (typeof this.fontSize == "number") this.fontSize += "px";
		if (typeof this.letterSpacing == "number") this.letterSpacing += "px";

		context.font = `${this.styling} ${this.fontSize} ${this.fontFamily}, Arial`;
		context.fillStyle = this.colour;
		context.textAlign = this.textAlign;
		context.textBaseline = this.textBaseLine;
		context.direction = this.direction;
		context.letterSpacing = this.letterSpacing;

		let offset = { x: 0, y: 0 };

		offset.x += defaultOffset.x;
		offset.y += defaultOffset.y;

		let destinationX = this.display.x + offset.x;
		let destinationY = this.display.y + offset.y;
		

		context.save();
		if (this.fixedPosition == false) {
			if (this.isPixelArt == true || (this.isPixelArt == "unset" && engine.isPixelArt)) {
				context.translate(Math.floor(engine.canvas.width / 2), Math.floor(engine.canvas.height / 2));
				context.scale(Math.floor(engine.camera.zoom), Math.floor(engine.camera.zoom));
			} else {
				context.translate(engine.canvas.width / 2 - engine.camera.position.x, engine.canvas.height / 2);
				context.scale(engine.camera.zoom, engine.camera.zoom);
			}
			context.translate(-engine.camera.position.x, -engine.camera.position.y);
		}
		context.beginPath();


		context.strokeStyle = this.outline.colour;
		context.lineWidth = this.outline.size;

		context.translate(this.display.x + offset.x, this.display.y + offset.y);

		// context.fillStyle = "gray";
		// context.fillRect(0, 0, this.display.w, this.display.h);
		// context.fillStyle = this.textColour;

		// context.rotate(angle);
		// context.translate(-this.displayOffset.x, -this.displayOffset.y);

		var lines = this.content.split('\n');

		this.display.w = 0;
		this.display.h = 0;
		for (var i = 0; i < lines.length; i++) {
			let metrics = context.measureText(lines[i]);
			if (metrics.width > this.display.w) this.display.w = metrics.width;
			let lineHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
			lineHeight *= 1.25;
			this.display.h += lineHeight;

			if (this.outline.size > 0) context.strokeText(lines[i], destinationX, destinationY + (i * lineHeight) );
			context.strokeText(lines[i], 0, (i * lineHeight) );
			context.fillText(lines[i], 0, (i * lineHeight) );
		}

		context.closePath();
		context.restore();
	
		return this;
	}

}