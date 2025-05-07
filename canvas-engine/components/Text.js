import { getValue, Colour, Point2 } from "../../toolbelt-v2/index.js";
import { Component } from "../utils.js";

export class Text extends Component {
	content = "Text Object";

	setContent(content="") {
		this.content = content;
		return this;
	}

	colour = "black";
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

	/** @type {number | string} */
	letterSpacing = "auto";

	/**
	 * @type {"ltr" | "rtl" | "inherit"}
	 */
	direction = "inherit";

	/**
	 * @type {"normal", "bold", "italic"}
	 */
	styling = "normal";

	/**
	 * @type {number} Angle of rotation (degrees)
	 */
	rotation = 0;

	/**
	 * @type {{
	* colour: string,
	* size: number,
	* lineCap: "butt" | "round" | "square",
	* lineJoin: "miter" | "round" | "bevel" | "miter-clip" | "arcs",
	* }}
	*/
	outline = { colour: "black", size: 0, lineCap: "round", lineJoin: "round" };
	shadow = { colour: "black", blur: 0, offset: { x: 0, y: 0 } };

	getType(){ return "Text"; }

	render(context=new CanvasRenderingContext2D, defaultOffset=new Point2){

		this.content = `${this.content}`;

		if (!this.visibility) return this;

		let fontSize = getValue(this.fontSize);
		if (typeof this.letterSpacing == "number") this.letterSpacing += "px";

		context.font = `${this.styling} ${fontSize}px "${this.fontFamily}", Arial`;
		context.fillStyle = this.colour;
		context.textAlign = this.textAlign;
		context.textBaseline = this.textBaseLine;
		context.direction = this.direction;
		context.letterSpacing = this.letterSpacing;

		let destinationX = this.display.x;
		let destinationY = this.display.y;

		destinationX += defaultOffset?.x ?? 0;
		destinationY += defaultOffset?.y ?? 0;

		if (this.isPixelArt) {
			destinationX = Math.floor(destinationX);
			destinationY = Math.floor(destinationY);
		}

		context.save();
		if (this.fixedPosition == false) {
			if (this.isPixelArt == true || (this.isPixelArt == "unset" && this.engine.isPixelArt)) {
				context.translate(Math.floor(this.engine.canvas.width / 2), Math.floor(this.engine.canvas.height / 2));
				context.scale(Math.floor(this.engine.camera.zoom), Math.floor(this.engine.camera.zoom));
			} else {
				context.translate(this.engine.canvas.width / 2, this.engine.canvas.height / 2);
				context.scale(this.engine.camera.zoom, this.engine.camera.zoom);
			}
			context.translate(-this.engine.camera.position.x, -this.engine.camera.position.y);
		}
		context.beginPath();
		context.translate(destinationX, destinationY);
		context.rotate(this.rotation * Math.PI / 180);

		context.fillStyle = Colour.parseColour(this.colour);
		context.strokeStyle = Colour.parseColour(this.outline.colour);
		context.lineWidth = getValue(this.outline.size);
		context.lineCap = this.outline.lineCap || "round";
		context.lineJoin = this.outline.lineJoin || "round";

		var lines = this.content.split('\n');

		this.display.w = 0;
		this.display.h = 0;

		let lineY = 0;
		for (var i = 0; i < lines.length; i++) {
			let metrics = context.measureText(lines[i]);
			if (metrics.width > this.display.w) this.display.w = metrics.width;
			lineY += metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
			lineY += 2;

			context.text
			// context.strokeText(lines[i], 0, lineY);
			context.fillText(lines[i], 0, lineY);
		}
		this.display.h = lineY;

		context.closePath();
		context.fill();
		context.stroke();
		context.restore();
	
		return this;
	}

}