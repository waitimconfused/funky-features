import { getValue } from "../../toolbelt/lib/units.js";
import { parseColour, toRange } from "../../toolbelt/toolbelt.js";
import { Component, engine, Point2 } from "../utils.js";

export class Canvas extends Component {
	#cameraTracking = false;

	colour = "#FF00FF";
	outline = { colour: "black", size: 0 };
	shadow = { colour: "black", blur: 0, offset: { x: 0, y: 0 } };


	autoSizing = false;

	/** @type {HTMLCanvasElement} */
	documentElement;

	/** @type {CanvasRenderingContext2D} */
	#context;

	/** @returns { ?CanvasRenderingContext2D } */
	get context() {

		if (!this.documentElement) return null;

		if (!this.#context) {
			this.#context = this.documentElement.getContext("2d");
		}

		return this.#context;
	}

	getType(){ return "Canvas"; }

	/**
	 * @param {String|undefined} hook
	 */
	constructor(){
		super();

		this.display.set(0, 0, 100, 100);

		this.documentElement = document.createElement("canvas");
		this.documentElement.width = this.display.w;
		this.documentElement.height = this.display.h;

		return this;
	}

	render(context=new CanvasRenderingContext2D, defaultOffset=new Point2) {

		if (this.documentElement.width != this.display.w) this.documentElement.width = this.display.w;
		if (this.documentElement.height != this.display.h) this.documentElement.height = this.display.h;
		
		if (!this.visibility) return this;

		this.transform.x = toRange(0, this.transform.x, 1);
		this.transform.y = toRange(0, this.transform.y, 1);

		let destinationW = getValue(this.documentElement.width);
		let destinationH = getValue(this.documentElement.height);

		let destinationX = getValue(this.display.x);
		let destinationY = getValue(this.display.y);

		destinationX += defaultOffset.x;
		destinationY += defaultOffset.y;
		destinationX -= destinationW * this.transform.x;
		destinationY -= destinationH * this.transform.y;

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

		context.fillStyle = parseColour(this.colour);
		context.strokeStyle = parseColour(this.outline.colour);
		let lineWidth = getValue(this.outline.size);
		context.lineWidth = lineWidth;

		context.shadowColor = parseColour(this.shadow.colour);
		context.shadowOffsetX = getValue(this.shadow.offset.x);
		context.shadowOffsetY = getValue(this.shadow.offset.y);
		context.shadowBlur = getValue(this.shadow.blur);

		context.beginPath();
		context.rect(destinationX, destinationY, destinationW, destinationH);
		context.closePath();
		context.fill();
		context.shadowBlur = 0;

		context.drawImage(
			this.documentElement,

			destinationX, destinationY,
			destinationW, destinationH,
		);

		if (lineWidth > 0) {
			context.beginPath();
			context.rect(destinationX, destinationY, destinationW, destinationH);
			context.closePath();
			context.stroke();
		}

		context.restore();

		this.#context = null;

		return this;
	}

}