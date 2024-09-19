import { toRange } from "../../toolbelt/toolbelt.js";
import { Component, Animation, engine, Point2 } from "../utils.js";

export class Canvas extends Component {

	colour = "purple";

	documentElement = document.createElement("canvas");

	/** @type { CanvasRenderingContext2D } */
	context;

	getType(){ return "Canvas"; }

	/**
	 * @param {String|Animation|undefined} hook
	 */
	constructor(){
		super();

		this.documentElement.width = 100;
		this.documentElement.height = 100;

		this.context = this.documentElement.getContext("2d");

		return this;
	}

	render(context=new CanvasRenderingContext2D, defaultOffset=new Point2){

		if (this.documentElement.width != this.display.w) this.documentElement.width = this.display.w;
		if (this.documentElement.height != this.display.h) this.documentElement.height = this.display.h;
		
		if (!this.visibility) return this;

		this.transform.x = toRange(0, this.transform.x, 1);
		this.transform.y = toRange(0, this.transform.y, 1);

		let destinationW = this.documentElement.width;
		let destinationH = this.documentElement.height;

		let offset = { x: 0, y: 0 };
		
		offset.x += defaultOffset.x;
		offset.y += defaultOffset.y;

		offset.x -= destinationW * this.transform.x;
		offset.y -= destinationH * this.transform.y;

		if(this.cameraTracking) {
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
		}

		if (this.colour) {
			context.fillStyle = this.colour;
			context.fillRect(destinationX, destinationY, destinationW, destinationH);
		}

		context.drawImage(
			this.documentElement,

			destinationX, destinationY,
			destinationW, destinationH,
		);

		context.restore();

		return this;
	}

}