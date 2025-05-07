import { getValue, Point2, range } from "../../toolbelt-v2/index.js";
import * as components from "../components.js";
import { ComponentGroup, Engine } from "../utils.js";

const engine = new Engine;

class Window extends ComponentGroup {

	/** Note that the view will only be filled when the overflow is not "shown" */
	colour = "#FF00FF";
	outline = { colour: "black", size: "5 / 100cz" };
	shadow = { colour: "black", blur: 0, offset: { x: 0, y: 0 } };
	radius = 0;
	setBorderRadius(radius=this.radius) { this.radius = radius; return this; }

	/** @type {"hidden" | "shown" | "scroll"} *WARNING: overflow scroll is experimantal* */
	overflow = "hidden";

	scrollY = 0;

	constructor() {
		super();
	}
	/**
	 * 
	 * @param {CanvasRenderingContext2D} context 
	 * @param {Point2} defaultOffset 
	 * @returns {this}
	 */
	render(context, defaultOffset) {
		
		let scrollY = Math.sin(performance.now() / 1000) * 100;

		defaultOffset = new Point2 ?? defaultOffset;

		if (!this.visibility) return this;

		this.transform.x = range.clamp(0, this.transform.x, 1);
		this.transform.y = range.clamp(0, this.transform.y, 1);

		let destinationW = getValue(this.display.w, this.engine);
		let destinationH = getValue(this.display.h, this.engine);
		let destinationX = getValue(this.display.x, this.engine);
		let destinationY = getValue(this.display.y, this.engine);

		destinationX += defaultOffset.x;
		destinationY += defaultOffset.y;

		context.beginPath();
		let components = Object.values(this.components);
		for(let i = 0; i < components.length; i ++) {
			let component = components[i];
			component.script(component);
			component.render(context, { x: destinationX, y: destinationY - scrollY });
		}
		context.closePath();
		
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
		context.translate(destinationX + destinationW * this.transform.x, destinationY + destinationH * this.transform.y);
		context.rotate(this.rotation * Math.PI / 180);
		context.translate(-destinationX - destinationW * this.transform.x, - destinationY - destinationH * this.transform.y);

		if (this.overflow != "shown") {
			context.beginPath();
			context.globalCompositeOperation = "destination-in";
			context.roundRect(
				destinationX,
				destinationY,
				destinationW,
				destinationH,
				this.radius
			);
			context.fill();
			context.closePath();

			context.beginPath();
			context.globalCompositeOperation = "destination-over";
			context.fillStyle = this.colour;
			context.roundRect(
				destinationX,
				destinationY,
				destinationW,
				destinationH,
				this.radius
			);
			context.fill();
			context.closePath();
		}

		context.restore();

		return this;
	}
}

const view = new Window;
engine.addObject(view);
view.display.set(0, 0, 100, 100);
view.radius = 10;

const circle = new components.Circle;
view.addObject(circle);
circle.moveTo(-50, 0);