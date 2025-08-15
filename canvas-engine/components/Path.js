import { Point2, Point4 } from "../../toolbelt-v2/lib/Points.js";
import Colour from "../../toolbelt-v2/lib/Colour.js";
import units from "../../toolbelt-v2/lib/Units.js";
import { Component } from "../utils.js";

export class Path extends Component {
	#cameraTracking = false;
	display = new Point4(0, 0, 100, 100);
	transform = new Point2(0.5, 0.5);
	displayOffset = new Point2(0, 0, 100, 100);
	radius = 100;
	colour = "#FF00FF";
	/**
	 * 
	 * @param { string } colour
	 */
	setColour(colour) {
		this.colour = colour;
		return this;
	}
	/**
	 * @type {{
	 * colour: string,
	 * size: number,
	 * lineCap: "butt" | "round" | "square",
	 * lineJoin: "miter" | "round" | "bevel" | "miter-clip" | "arcs",
	 * }}
	 */
	outline = { colour: "black", size: "5 / 100cz", lineCap: "round", lineJoin: "round" };
	cameraTracking = false;
	/** @type { number } In Degrees */
	rotation = 0;

	#path = "";

	/** @param {string} path */
	set path(path) {
		this.#path = path;
		let instructions = path.split(/([a-zA-Z](?:[\d\.-]+(?:,| ){0,1})+)/gm);
		instructions = instructions.filter((item) => !!item);
		let topLeft = new Point2;
		let bottomRight = new Point2;
		for (let i = 0; i < instructions.length; i ++) {
			let instruction = instructions[i];
			let coords = instruction.split(/([\d\.-]+)(?:,| )([\d\.-]+)/gm);
			coords = coords.filter((item) => (!(/[a-zA-Z]| /).test(item)) && item.length > 0);
			for (let idx = 0; idx < coords.length / 2; idx += 2) {
				let x = coords[idx];
				let y = coords[idx+1];
				topLeft.x = Math.min(topLeft.x, x);
				topLeft.y = Math.min(topLeft.y, y);
				bottomRight.x = Math.max(bottomRight.x, x);
				bottomRight.y = Math.max(bottomRight.y, y);
			}
		}
		topLeft.translate(bottomRight); // `topLeft` is now == `{ x: width, y: height }`
		this.display.w = topLeft.x;
		this.display.h = topLeft.y;
	}
	get path() {
		return this.#path;
	}
	
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
			if (typeof x?.y == "number" && typeof x?.x == "number") {
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
		},
		clearPath: () => {
			this.path = "";
			return this;
		}
	}

	getType(){ return "Path"; }

	/**
	 * 
	 * @param { CanvasRenderingContext2D } context
	 * @param { Point2 } defaultOffset
	 */
	render(context, defaultOffset){

		let colour = Colour.parseColour(this.colour);
		let outlineColour = Colour.parseColour(this.outline.colour);
		
		if (!this.visibility) return this;

		this.transform.x = range.clamp(0, this.transform.x, 1);
		this.transform.y = range.clamp(0, this.transform.y, 1);

		let destinationW = units.getValue(this.display.w, this.engine);
		let destinationH = units.getValue(this.display.h, this.engine);
		let destinationX = units.getValue(this.display.x, this.engine);
		let destinationY = units.getValue(this.display.y, this.engine);

		destinationX += defaultOffset?.x ?? 0;
		destinationX -= destinationW * this.transform.x;
		destinationY += defaultOffset?.y ?? 0;
		destinationY -= destinationH * this.transform.y;

		if(this.isPixelArt == true || (this.isPixelArt == "unset" && this.engine.isPixelArt)){
			this.displayOffset.x = Math.floor(this.displayOffset.x);
			this.displayOffset.y = Math.floor(this.displayOffset.y);
			this.displayOffset.x = Math.floor(this.displayOffset.x);
		}


		context.save();
		if (!this.fixedPosition) {
			if (this.isPixelArt == true || (this.isPixelArt == "unset" && this.engine.isPixelArt)) {
				context.translate(Math.floor(this.engine.canvas.width / 2), Math.floor(this.engine.canvas.height / 2));
				context.scale(Math.floor(this.engine.camera.zoom), Math.floor(this.engine.camera.zoom));
			} else {
				context.translate(this.engine.canvas.width / 2, this.engine.canvas.height / 2);
				context.scale(this.engine.camera.zoom, this.engine.camera.zoom);
			}
			context.translate(-this.engine.camera.position.x, -this.engine.camera.position.y);
		}
		context.translate(destinationX + destinationW * this.transform.x, destinationY + destinationH * this.transform.y);
		context.rotate(this.rotation * Math.PI / 180);
		context.translate(-destinationX - destinationW * this.transform.x, - destinationY - destinationH * this.transform.y);

		context.beginPath();

		context.fillStyle = Colour.parseColour(colour);
		context.strokeStyle = Colour.parseColour(outlineColour);
		context.lineWidth = units.getValue(this.outline.size, this.engine);
		context.lineCap = this.outline.lineCap || "round";
		context.lineJoin = this.outline.lineJoin || "round";
		var path = new Path2D(this.path);

		context.translate(destinationX, destinationY);
		context.fill(path);
		if(context.lineWidth > 0) context.stroke(path);

		context.closePath();
		context.restore();
	}
}