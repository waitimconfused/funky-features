import { engine } from "../utils.js";
import { Path, Circle, Image, Text, Rect } from "../components.js";
import { Point2 } from "../points.js";
import { Vector } from "../../toolbelt/toolbelt.js";

engine.camera.zoom = 100;
engine.camera.defaultZoom = engine.camera.zoom;
engine.camera.maxZoom = Infinity;

engine.loadAsset("https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap");
const pi = Math.PI;
const abs = Math.abs;
const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;
const asin = Math.asin;
const acos = Math.acos;
const atan = Math.atan;

var points = {
	start: new Point2(0, 0),
	end: new Point2(2, 0),
}

var colours = [ "#C74440", "#2D70B3", "#388C46", "#FA7E19", "#6042A6", "#000000" ]

var componentPoint2_hasHoveredDot = false;
class ComponentPoint2 extends Circle {
	point2 = new Point2

	/**
	 * 
	 * @param { number } x
	 * @param { number } y
	 */
	constructor(x, y) {
		super();
		this.point2.x = x;
		this.point2.y = y;

		this.radius = 10;
		this.colour = colours[ Math.floor(Math.random()*colours.length) ];
		this.outline.colour = `color-mix(in srgb, ${this.colour}, transparent 50%)`;
		this.outline.size = 10;
	}

	#dragging = false;
	render(context=new CanvasRenderingContext2D, defaultOffset={x:0,y:0}) {
		this.radius = 10 / engine.camera.zoom;
		this.outline.size = 10 / engine.camera.zoom;

		let mouse = engine.mouse.toWorld();

		let distanceToMouse = Math.hypot(this.display.x - mouse.x, this.display.y - mouse.y);
		let hovering = distanceToMouse <= this.radius;

		if (
			this.#dragging == true ||
			(engine.mouse.click_l && hovering && componentPoint2_hasHoveredDot == false)
		) {
			this.moveTo(mouse.x, mouse.y);
			this.#dragging = engine.mouse.click_l;
			componentPoint2_hasHoveredDot = engine.mouse.click_l;
		}

		if (!this.visibility) return this;

		let offset = { x: 0, y: 0 };

		if(["", "none"].includes(this.colour)) this.colour = "transparent";

		offset.x += defaultOffset.x;
		offset.y += defaultOffset.y;

		if(!this.fixedPosition) {
			offset.x -= engine.camera.position.x;
			offset.y -= engine.camera.position.y;
		}

		this.displayOffset.x = this.display.x + offset.x;
		this.displayOffset.y = this.display.y + offset.y;

		if(engine.isPixelArt){
			this.displayOffset.x = Math.floor(this.displayOffset.x);
			this.displayOffset.y = Math.floor(this.displayOffset.y);
			this.displayOffset.x = Math.floor(this.displayOffset.x);
		}
		
		context.save();
		if (!this.fixedPosition) {
			if (this.isPixelArt == true || (this.isPixelArt == "unset" && engine.isPixelArt)) {
				context.translate(Math.round(engine.canvas.width / 2), Math.round(engine.canvas.height / 2));
				context.scale(Math.round(engine.camera.zoom), Math.round(engine.camera.zoom));
			} else {
				context.translate(engine.canvas.width / 2, engine.canvas.height / 2);
				context.scale(engine.camera.zoom, engine.camera.zoom);
			}
		}

		context.beginPath();
		context.fillStyle = this.colour;
		context.strokeStyle = this.outline.colour;
		context.lineWidth = this.outline.size;
		context.arc(this.displayOffset.x, this.displayOffset.y, this.radius, 0, 2 * Math.PI);
		context.fill();
		if(this.outline.size > 0) context.stroke();
		context.closePath();

		context.restore();
	}
}

const startCircle = new ComponentPoint2;
engine.addObject(startCircle);
startCircle.moveTo(points.start);

const endCircle = new ComponentPoint2;
engine.addObject(endCircle);
endCircle.moveTo(points.end);

const path = new Path;
engine.addObject(path);
path.colour = "none";
path.outline.colour = "#6042A6";
path.outline.size = 10;
path.zIndex = 0;

var armLength = 1;
var tailLength = 3;
var radOffset = pi / 2;

let rad = 2 * Math.PI
let cosRad = Math.cos(rad);
let sinRad = Math.sin(rad);

let p1 = {
	x: armLength * Math.cos(rad + radOffset),
	y: armLength * Math.sin(rad + radOffset)
};

let p2 = {
	x: armLength * cosRad,
	y: armLength * sinRad
};

let p3 = {
	x: armLength * Math.cos(rad - radOffset),
	y: armLength * Math.sin(rad - radOffset)
};

let p4 = {
	x: p2.x - tailLength * cosRad,
	y: p2.y - tailLength * sinRad
};

path.pen.moveTo(p1);
path.pen.lineTo(p2);
path.pen.lineTo(p3);
path.pen.moveTo(p2);
path.pen.lineTo(p4.x, p4.y);

const gear1 = new Image;
gear1.source = "./demos/gear.svg";
gear1.display.set(0, 0, 1.25, 1.25);
engine.addObject(gear1);
gear1.zIndex = 0;
gear1.script = () => { gear1.rotation = ( performance.now() / 10 ) % 360; }

const gear2 = new Image;
gear2.source = "./demos/gear.svg";
gear2.display.w = 1.25;
gear2.display.h = 1.25;
gear2.moveTo(1, 0);
engine.addObject(gear2);
gear2.zIndex = 0;
gear2.script = () => { gear2.rotation = ( performance.now() / -10 + 30 ) % 360; }

const gear3 = new Image;
gear3.source = "./demos/gear.svg";
gear3.display.w = 1.25;
gear3.display.h = 1.25;
gear3.moveTo(1, -1);
engine.addObject(gear3);
gear3.zIndex = 0;
gear3.script = () => { gear3.rotation = ( performance.now() / 10 ) % 360; }

const rect = new Rect;
rect.transform.set(0, 0);
rect.display.set(0, 0, 1, 3);
rect.moveTo(1, -1);
engine.addObject(rect);
rect.zIndex = 0;
rect.script = () => { rect.rotation = ( performance.now() / 10 ) % 360; }

path.script = () => {
	path.outline.size = 10 / engine.camera.zoom;
	path.moveTo(startCircle);
	let vector = new Vector;
	vector.setPos(endCircle.display.x - startCircle.display.x, endCircle.display.y - startCircle.display.y);
	path.rotation = vector.deg;
}

const demoLable = new Text;
demoLable.fixedPosition = true;
demoLable.textAlign = "left";
demoLable.textBaseLine = "bottom";
demoLable.fontFamily = "JetBrains Mono";
demoLable.content = "// Rotation\ncomponent.rotation = <deg>";
demoLable.fontSize = 30;
demoLable.colour = "black";
demoLable.outline.colour = "white";
demoLable.outline.size = 10;
engine.addObject(demoLable);
demoLable.script = () => {
	demoLable.moveTo(10, engine.height - demoLable.display.h);
}