import { getValue } from "../../toolbelt/lib/units.js";
import { parseColour } from "../../toolbelt/toolbelt.js";
import { Component, engine, Point2 } from "../utils.js";

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

		destinationX += defaultOffset.x;
		destinationY += defaultOffset.y;
		

		context.save();
		if (this.fixedPosition == false) {
			if (this.isPixelArt == true || (this.isPixelArt == "unset" && engine.isPixelArt)) {
				context.translate(Math.floor(engine.canvas.width / 2), Math.floor(engine.canvas.height / 2));
				context.scale(Math.floor(engine.camera.zoom), Math.floor(engine.camera.zoom));
			} else {
				context.translate(engine.canvas.width / 2, engine.canvas.height / 2);
				context.scale(engine.camera.zoom, engine.camera.zoom);
			}
			context.translate(-engine.camera.position.x, -engine.camera.position.y);
		}
		context.beginPath();
		context.translate(destinationX, destinationY);
		context.rotate(this.rotation * Math.PI / 180);


		context.fillStyle = parseColour(this.colour);
		context.strokeStyle = parseColour(this.outline.colour);
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