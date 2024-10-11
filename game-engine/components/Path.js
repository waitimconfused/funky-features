import { Component, Point2, engine } from "../utils.js";

export class Path extends Component {
	#cameraTracking = false;
	display = new Point2(0, 0, 100, 100);
	displayOffset = new Point2(0, 0, 100, 100);
	radius = 100;
	colour = "purple";
	/**
	 * 
	 * @param { string } colour
	 */
	setColour(colour) {
		this.colour = colour;
		return this;
	}
	outline = { colour: "black", size: 0, lineCap: "round" };
	cameraTracking = false;
	rotation = 0;

	path = "";
	clearPath() {
		this.path = "";
		return this;
	}

	pen = {
		/**
		 * 
		 * @param { number | Point2 } x
		 * @param { number | undefined } y
		 */
		moveTo: (x, y) => {
			if (x?.y && x?.x) {
				y = x.y;
				x = x.x;
			} if (x instanceof Component) {
				y = x.display.y;
				x = x.display.x;
			}
			this.path += `M ${x},${y} `;
			return this;
		},
		/**
		 * 
		 * @param { number | Point2 } x
		 * @param { number | undefined } y
		 */
		lineTo: (x, y) => {
			if (x?.y && x?.x) {
				y = x.y;
				x = x.x;
			} if (x instanceof Component) {
				y = x.display.y;
				x = x.display.x;
			}
			this.path += `L ${x},${y} `;
			return this;
		},
		quadraticCurveTo: (midPointX=0, midPointY=0, endPointX=0, endPointY=0) => {
			this.path += `Q ${midPointX},${midPointY} ${endPointX},${endPointY} `;
			return this;
		},
		cubicCurveTo: (handle1X=0, handle1Y=0, handle2X=0, handle2Y=0, endPointX=0, endPointY=0) => {
			this.path += `C ${handle1X},${handle1Y} ${handle2X},${handle2Y} ${endPointX},${endPointY} `;
			return this;
		},
		setPath: (path) => {
			this.path = path;
			return this;
		}
	}

	getType(){ return "Path"; }

	render(context=new CanvasRenderingContext2D, defaultOffset=new Point2){

		if (this.colour == "none") this.colour = "transparent";
		if (this.colour == null) this.colour = "transparent";
		
		if (!this.visibility) return this;

		let offset = { x: 0, y: 0 };

		offset.x += defaultOffset.x;
		offset.y += defaultOffset.y;

		// offset.x -= this.display.w * this.transform.x;
		// offset.y -= this.display.h * this.transform.y;

		if(!this.fixedPosition) {
			offset.x -= engine.camera.position.x;
			offset.y -= engine.camera.position.y;
		}

		this.displayOffset.x = this.display.x + offset.x;
		this.displayOffset.y = this.display.y + offset.y;

		if(this.isPixelArt == true || (this.isPixelArt == "unset" && engine.isPixelArt)){
			this.displayOffset.x = Math.floor(this.displayOffset.x);
			this.displayOffset.y = Math.floor(this.displayOffset.y);
			this.displayOffset.x = Math.floor(this.displayOffset.x);
		}


		context.save();
		if (!this.fixedPosition) {
			context.translate(engine.canvas.width / 2, engine.canvas.height / 2);
			context.scale(engine.camera.zoom, engine.camera.zoom);
		}
		context.beginPath();
		
		context.fillStyle = this.colour;
		context.strokeStyle = this.outline.colour;
		context.lineWidth = this.outline.size;
		context.lineCap = this.outline.lineCap;
		context.lineJoin = "round";

		var path = new Path2D(this.path);

		let angle = (this.rotation * Math.PI) / 180;

		context.translate(this.displayOffset.x, this.displayOffset.y);
		context.rotate(angle);
		// context.translate(-this.displayOffset.x, -this.displayOffset.y);

		context.fill(path);
		if(this.outline.size > 0) context.stroke(path);

		context.closePath();
		context.restore();
	}
}