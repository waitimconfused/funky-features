import { draw as drawImage } from "../../toolbelt/lib/image.js";
import { toRange } from "../../toolbelt/toolbelt.js";
import { Component, Animation, engine, Point2, Point4 } from "../utils.js";

export class Image extends Component {
	crop = new Point4(0, 0);
	colour = "white";
	isPixelArt = false;
	/**
	 * @type { String | Animation }
	 */
	source = "";
	/**
	 * @type { undefined | Animation }
	 */
	animation = undefined;

	getType(){ return "Image"; }

	/**
	 * @param {String|Animation|undefined} hook
	 */
	constructor(hook){
		super();
		delete this.colour;
		
		if (hook instanceof Animation) {
			this.source = "Image-Animation";
			this.animation = hook.clone();
			this.getType = function() { return "Image-Animation"; }
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
			if (engine.isPixelArt || this.isPixelArt) {
				context.translate(Math.round(engine.canvas.width / 2), Math.round(engine.canvas.height / 2));
				context.scale(Math.round(engine.camera.zoom), Math.round(engine.camera.zoom));
			} else {
				context.translate(engine.canvas.width / 2, engine.canvas.height / 2);
				context.scale(engine.camera.zoom, engine.camera.zoom);
			}
		}

		if (this.colour) {
			context.fillStyle = this.colour;
			context.fillRect(destinationX, destinationY, destinationW, destinationH);
		}

		if (this.source != "Image-Animation") {
			drawImage(
				this.source,
	
				destinationX,
				destinationY,
				destinationW,
				destinationH,
	
				this.crop.x,
				this.crop.y,
				this.crop.w,
				this.crop.h,

				{ pixelated: engine.isPixelArt || this.isPixelArt }, engine.canvas
			);
		} else {
			drawImage(
				this.animation.currentFrame().source,
	
				destinationX,
				destinationY,
				destinationW,
				destinationH,
	
				this.animation.currentFrame().x,
				this.animation.currentFrame().y,
				this.animation.currentFrame().width,
				this.animation.currentFrame().height,

				{ pixelated: engine.isPixelArt || this.isPixelArt }, engine.canvas
			);
		}

		context.restore();

		return this;
	}

}