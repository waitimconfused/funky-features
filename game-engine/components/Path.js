import { toRange } from "../../toolbelt/toolbelt.js";
import { Component, Point2, Point4, engine } from "../utils.js";

export class Path extends Component {
	#cameraTracking = false;
	display = new Point4(0, 0, 100, 100);
	transform = new Point2(0, 0);
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
	/**
	 * @type {{
	 * colour: string,
	 * size: number,
	 * lineCap: "butt" | "round" | "square"
	 * }}
	 */
	outline = { colour: "black", size: 0, lineCap: "round" };
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

		let colour = "";
		let outlineColour = "";
		if(["", "none"].includes(this.colour)) colour = "transparent";
		if(["", "none"].includes(this.outline.colour)) outlineColour = "transparent";
		if (this.colour == null) colour = "transparent";
		if (this.outline.colour == null) outlineColour = "transparent";
		if (/^var\(.*\)$/gm.test(this.colour)) {
			let cssVar = this.colour.replace(/^var\(|\)$/g, "")
			colour = getComputedStyle(engine.canvas).getPropertyValue(cssVar);
		}
		if (/^var\(.*\)$/gm.test(this.outline.colour)) {
			let cssVar = this.outline.colour.replace(/^var\(|\)$/g, "")
			outlineColour = getComputedStyle(engine.canvas).getPropertyValue(cssVar);
		}
		
		if (!this.visibility) return this;

		this.transform.x = toRange(0, this.transform.x, 1);
		this.transform.y = toRange(0, this.transform.y, 1);

		let destinationW = this.display.w;
		let destinationH = this.display.h;

		let offset = { x: 0, y: 0 };

		offset.x += defaultOffset?.x;
		offset.y += defaultOffset?.y;

		offset.x -= destinationW * this.transform.x;
		offset.y -= destinationH * this.transform.y;

		let destinationX = this.display.x + offset.x;
		let destinationY = this.display.y + offset.y;

		if(this.isPixelArt == true || (this.isPixelArt == "unset" && engine.isPixelArt)){
			this.displayOffset.x = Math.floor(this.displayOffset.x);
			this.displayOffset.y = Math.floor(this.displayOffset.y);
			this.displayOffset.x = Math.floor(this.displayOffset.x);
		}


		context.save();
		if (!this.fixedPosition) {
			context.translate(engine.canvas.width / 2, engine.canvas.height / 2);
			context.scale(engine.camera.zoom, engine.camera.zoom);
			context.translate(-engine.camera.position.x, -engine.camera.position.y);
		}
		context.translate(destinationX + destinationW * this.transform.x, destinationY + destinationH * this.transform.y);
		context.rotate(this.rotation * Math.PI / 180);
		context.translate(-destinationX - destinationW * this.transform.x, - destinationY - destinationH * this.transform.y);

		context.beginPath();

		context.fillStyle = colour;
		context.strokeStyle = outlineColour;
		context.lineWidth = this.outline.size;
		context.lineCap = this.outline.lineCap || "round";
		var path = new Path2D(this.path);

		context.translate(destinationX, destinationY);
		context.fill(path);
		if(this.outline.size > 0) context.stroke(path);

		context.closePath();
		context.restore();
	}
}