import { Colour, getValue, range, Point2 } from "../../toolbelt-v2/index.js";
import { Component } from "../utils.js";

const degToRad = Math.PI / 180;

export class Circle extends Component {
	display = new Point2(0, 0);
	displayOffset = new Point2(0, 0);
	radius = 100;
	colour = "#FF00FF";
	/**
	 * @type {{
	 * colour: string,
	 * size: number,
	 * lineCap: "butt" | "round" | "square",
	 * lineJoin: "miter" | "round" | "bevel" | "miter-clip" | "arcs",
	 * }}
	 */
	outline = { colour: "black", size: "5 / 100cz", lineCap: "round", lineJoin: "round" };
	/**
	 * @type {{
	 * colour: string,
	 * blur: number|string,
	 * offset: { x: number|string, y: number|string }
	 * }}
	 */
	shadow = { colour: "black", blur: 0, offset: { x: 0, y: 0 } };

	/** @type {"disc" | "pie" | "ring" | "arc"} Default value is `"disc"`*/
	kind = "disc";

	/** @type {number} Applies when `mode` is `"pie"` or `"arc"`. Starting angle of circle, in degrees */
	startAngle = 0;

	/** @type {number} Applies when `mode` is `"pie"` or `"arc"`. Ending angle of circle, in degrees */
	endAngle = 360;

	/** @type {?number} Applies when `mode` is `"ring"`  `"angle"`. If `null`, `innerRadius` will be `radius / 2` */
	innerRadius = null;

	// /** @type {?Engine} */
	// engine = null;

	getType(){ return "Circle"; }

	/**
	 * @param {CanvasRenderingContext2D} context
	 * @param {{x: 0, y: 0}} defaultOffset
	 */
	render(context, defaultOffset) {

		if (!defaultOffset) defaultOffset = {x: 0, y: 0};
		
		if (!this.visibility) return this;

		let colour = Colour.parseColour(this.colour);
		let outlineColour = Colour.parseColour(this.outline.colour);

		let destinationX = getValue( this.display.x, this.engine );
		let destinationY = getValue( this.display.y, this.engine );
		let radius = getValue( this.radius, this.engine );
		let innerRadius = getValue(this.innerRadius, this.engine) ?? radius/2;
		let outlineSize = getValue(this.outline.size, this.engine);
		destinationX += defaultOffset?.x ?? 0;
		destinationY += defaultOffset?.y ?? 0;

		innerRadius = range.clamp(0, innerRadius, radius);

		innerRadius = radius / 2;

		if(this.engine.isPixelArt){
			destinationX = Math.floor(destinationX);
			destinationY = Math.floor(destinationY);
		}
		
		context.save();
		if (!this.fixedPosition) {
			destinationX -= this.engine.camera.position.x;
			destinationY -= this.engine.camera.position.y;
			if (this.isPixelArt == true || (this.isPixelArt == "unset" && this.engine.isPixelArt)) {
				context.translate(Math.round(this.engine.canvas.width / 2), Math.round(this.engine.canvas.height / 2));
				context.scale(Math.round(this.engine.camera.zoom), Math.round(this.engine.camera.zoom));
			} else {
				context.translate(this.engine.canvas.width / 2, this.engine.canvas.height / 2);
				context.scale(this.engine.camera.zoom, this.engine.camera.zoom);
			}
		}

		let startAngle = 0;
		let endAngle = Math.PI * 2;
		let counterClockwise = false;

		if (this.kind == "pie" || this.kind == "arc") {
			startAngle = this.startAngle * degToRad;
			endAngle = this.endAngle * degToRad;
			counterClockwise = (endAngle < startAngle);
		}

		let isHollow = (this.kind == "ring" || this.kind == "arc");

		context.beginPath();
		context.fillStyle = colour;
		context.strokeStyle = outlineColour;
		context.lineWidth = outlineSize;
		context.lineCap = this.outline.lineCap;
		context.lineJoin = this.outline.lineJoin;
		if (this.kind == "pie") {
			context.moveTo(destinationX, destinationY);
		}
		context.arc(destinationX, destinationY, radius, startAngle, endAngle, counterClockwise);
		if (isHollow) {
			context.lineTo(destinationX, destinationY);
			context.closePath();
			context.fill();

			context.globalCompositeOperation = "destination-out";
			context.beginPath();
			context.arc(destinationX, destinationY, innerRadius, 0, Math.PI*2, counterClockwise);
			// context.lineTo(destinationX, destinationY);
		}
		context.closePath();

		context.fill();
		context.globalCompositeOperation = "source-over";
		
		if (outlineSize > 0) {
			context.beginPath();
			context.arc(destinationX, destinationY, radius, startAngle, endAngle, counterClockwise);
			if (this.kind == "ring") {
				context.moveTo(
					destinationX + Math.cos(endAngle) * innerRadius,
					destinationY + Math.sin(endAngle) * innerRadius
				);
				context.arc(destinationX, destinationY, innerRadius, endAngle, startAngle, !counterClockwise);
			} else if (this.kind == "arc") {
				context.arc(destinationX, destinationY, innerRadius, endAngle, startAngle, !counterClockwise);
				context.lineTo(
					destinationX + Math.cos(startAngle) * radius,
					destinationY + Math.sin(startAngle) * radius
				);
			} else if (this.kind == "pie" && (startAngle-endAngle) % (Math.PI * 2) != 0) {
				context.lineTo(destinationX, destinationY);
				context.lineTo(
					destinationX + Math.cos(startAngle) * radius,
					destinationY + Math.sin(startAngle) * radius
				);
			}
			context.stroke();
		}

		context.restore();
	}
}


// export class ComponentPoint2 extends Circle {
// 	point2 = new Point2

// 	/**
// 	 * 
// 	 * @param { number } x
// 	 * @param { number } y
// 	 */
// 	constructor(x, y) {
// 		this.point2.x = x;
// 		this.point2.y = y;

// 		this.radius = 10;
// 		this.colour = "rgba(199, 68, 64, 1)";
// 		this.outline.colour = "rgba(199, 68, 64, 0.5)";
// 		this.outline.size = 10;
// 	}

// 	render() {
// 		this.radius = 10 / this.engine.camera.zoom;
// 		this.outline.size = 10 / this.engine.camera.zoom;

// 		let mouse = this.engine.mouse.toWorld();

// 		let distanceToMouse = Math.hypot(this.display.x - mouse.x, this.display.y - mouse.y);
// 		let hovering = distanceToMouse <= this.radius;

// 		if (
// 			this.getAttribute("dragging") == true ||
// 			(this.engine.mouse.click_l && hovering && hasHoveringDot == false)
// 		) {
// 			this.moveTo(mouse.x, mouse.y);
// 			this.setAttribute("dragging", this.engine.mouse.click_l);
// 			// hasHoveringDot = this.engine.mouse.click_l;
// 		}

// 		if (typeof startCircle.display.x != "number") {
// 			console.log("BROKEN!", {
// 				dot: this.display,
// 				mouse
// 			});
// 			this.display.y = this.display.x.y;
// 			this.display.x = this.display.x.x;
// 		}

// 		if (!this.visibility) return this;

// 		let offset = { x: 0, y: 0 };

// 		if(["", "none"].includes(this.colour)) this.colour = "transparent";

// 		offset.x += defaultOffset.x;
// 		offset.y += defaultOffset.y;

// 		if(!this.fixedPosition) {
// 			offset.x -= this.engine.camera.position.x;
// 			offset.y -= this.engine.camera.position.y;
// 		}

// 		this.displayOffset.x = this.display.x + offset.x;
// 		this.displayOffset.y = this.display.y + offset.y;

// 		if(this.engine.isPixelArt){
// 			this.displayOffset.x = Math.floor(this.displayOffset.x);
// 			this.displayOffset.y = Math.floor(this.displayOffset.y);
// 			this.displayOffset.x = Math.floor(this.displayOffset.x);
// 		}
		
// 		context.save();
// 		if (!this.fixedPosition) {
// 			if (this.isPixelArt == true || (this.isPixelArt == "unset" && this.engine.isPixelArt)) {
// 				context.translate(Math.round(this.engine.canvas.width / 2), Math.round(this.engine.canvas.height / 2));
// 				context.scale(Math.round(this.engine.camera.zoom), Math.round(this.engine.camera.zoom));
// 			} else {
// 				context.translate(this.engine.canvas.width / 2, this.engine.canvas.height / 2);
// 				context.scale(this.engine.camera.zoom, this.engine.camera.zoom);
// 			}
// 		}

// 		context.beginPath();
// 		context.fillStyle = this.colour;
// 		context.strokeStyle = this.outline.colour;
// 		context.lineWidth = this.outline.size;
// 		context.arc(this.displayOffset.x, this.displayOffset.y, this.radius, 0, 2 * Math.PI);
// 		context.fill();
// 		if(this.outline.size > 0) context.stroke();
// 		context.closePath();

// 		context.restore();
// 	}
// }