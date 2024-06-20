import { draw as drawImage } from "../../toolbelt/lib/image.js";
import { Component, engine, Point4 } from "../utils.js";

export class Image extends Component {
	crop = new Point4(0, 0);
	isPixelArt = false;
	source = "";

	getType(){ return "Image"; }

	constructor(){
		super();
		delete this.colour;
	}

	setCrop(x=0, y=0, w=0, h=0){
		this.crop.x = x;
		this.crop.y = y;
		this.crop.w = w;
		this.crop.h = h;
	}

	render(context=new CanvasRenderingContext2D){
		this.script(this);

		let offset = { x: 0, y: 0 };
		offset.x -= this.display.w / 2;
		offset.y -= this.display.h / 2;
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
		drawImage(
			this.source,

			destinationX,
			destinationY,
			this.display.w,
			this.display.h,

			this.crop.x,
			this.crop.y,
			this.crop.w,
			this.crop.h,
			{ pixelated: engine.isPixelArt || this.isPixelArt }, engine.canvas
		)
	}
}