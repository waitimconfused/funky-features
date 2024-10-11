import { draw as drawImage } from "../../toolbelt/lib/image.js";
import { toRange } from "../../toolbelt/toolbelt.js";
import { Component, Animation, engine, Point2, Point4 } from "../utils.js";

export class Image extends Component {
	#cameraTracking = false;
	#type = "Image";
	crop = new Point4(0, 0);
	colour = "white";
	opacity = 1;
	/**
	 * @type { String | Animation }
	 */
	source = "";
	/**
	 * @type { undefined | Animation }
	 */
	animation = undefined;

	getType(){ return this.#type }

	/**
	 * @param {String|Animation|undefined} hook
	 */
	constructor(hook){
		super();
		delete this.colour;
		
		if (hook instanceof Animation) {
			this.source = "Image-Animation";
			this.animation = hook.clone();
			this.#type = "Image-Animation";
			this.setSize(1, 1);
		}

		return this;
	}

	setSourcePath(path=""){
		if (this.source instanceof Animation) throw new Error("Cannot set source of image if image is of type Image-Animation.");
		this.source = path;
		return this;
	}

	setCrop(x=0, y=0, w=0, h=0){
		if (this.source instanceof Animation) throw new Error("Cannot crop image if image is of type Image-Animation.");
		this.crop.x = x;
		this.crop.y = y;
		this.crop.w = w;
		this.crop.h = h;
		return this;
	}

	render(context=new CanvasRenderingContext2D, defaultOffset=new Point2){
		
		if (!this.visibility) return this;

		this.transform.x = toRange(0, this.transform.x, 1);
		this.transform.y = toRange(0, this.transform.y, 1);

		let destinationW = this.display.w;
		let destinationH = this.display.h;

		if (this.source == "Image-Animation") {
			let currentFrame = this.animation.currentFrame();
			destinationW *= currentFrame.width;
			destinationH *= currentFrame.height;
		}

		let offset = { x: 0, y: 0 };
		
		offset.x += defaultOffset.x;
		offset.y += defaultOffset.y;

		offset.x -= destinationW * this.transform.x;
		offset.y -= destinationH * this.transform.y;

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

		let filters = {
			pixelated: (this.isPixelArt == true || (this.isPixelArt == "unset" && engine.isPixelArt)),
			alpha: this.opacity,
		};

		if (this.source != "Image-Animation") {
			drawImage(
				this.source,
				destinationX, destinationY, destinationW, destinationH,
				this.crop.x, this.crop.y, this.crop.w, this.crop.h,
				filters,
				engine.canvas
			);
		} else {
			let currentFrame = this.animation.currentFrame();
			drawImage(
				currentFrame.source,
				destinationX, destinationY, destinationW, destinationH,
				currentFrame.x, currentFrame.y, currentFrame.width, currentFrame.height,
				filters, engine.canvas
			);
		}

		context.restore();

		return this;
	}

}