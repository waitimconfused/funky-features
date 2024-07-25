import { Component, Point2, engine } from "../utils.js";

export class Path extends Component {
	display = new Point2(0, 0, 100, 100);
	displayOffset = new Point2(0, 0, 100, 100);
	radius = 100;
	colour = "purple";
	outline = { colour: "black", size: 0, lineCap: "round" };
	fixedPosition = false;
	cameraTracking = false;
	smooth = false;
	rotation = 0;

	path = "";
	clearPath() {
		this.path = "";
		return this;
	}

	pen = {
		moveTo: (x=0, y=0) => {
			this.path += `M ${x},${y} `;
			return this.pen;
		},
		lineTo: (x=0, y=0) => {
			this.path += `L ${x},${y} `;
			return this.pen;
		},
		quadraticCurveTo: (midPointX=0, midPointY=0, endPointX=0, endPointY=0) => {
			this.path += `Q ${midPointX},${midPointY} ${endPointX},${endPointY} `;
			return this.pen;
		},
		cubicCurveTo: (handle1X=0, handle1Y=0, handle2X=0, handle2Y=0, endPointX=0, endPointY=0) => {
			this.path += `C ${handle1X},${handle1Y} ${handle2X},${handle2Y} ${endPointX},${endPointY} `;
			return this.pen;
		}
	}

	getType(){ return "Path"; }

	render(context=new CanvasRenderingContext2D, defaultOffset={x:0,y:0}){

		let offset = { x: 0, y: 0 };

		offset.x += defaultOffset.x;
		offset.y += defaultOffset.y;

		// offset.x -= this.display.w * this.transform.x;
		// offset.y -= this.display.h * this.transform.y;

		if(this.cameraTracking) {
			engine.camera.moveTo(this.display.x, this.display.y);
			this.fixedPosition = false;
		}

		if(!this.fixedPosition) {
			offset.x -= engine.camera.position.x;
			offset.y -= engine.camera.position.y;
			offset.x += engine.canvas.width / 2;
			offset.y += engine.canvas.height / 2;
		}

		this.displayOffset.x = this.display.x + offset.x;
		this.displayOffset.y = this.display.y + offset.y;

		if(engine.isPixelArt){
			this.displayOffset.x = Math.floor(this.displayOffset.x);
			this.displayOffset.y = Math.floor(this.displayOffset.y);
			this.displayOffset.x = Math.floor(this.displayOffset.x);
		}


		context.save();
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