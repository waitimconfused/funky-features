import { engine } from "./utils.js";
import { Path, Circle } from "./components/index.js";
import { Point2 } from "./points.js";

engine.camera.zoom = 100;
engine.camera.defaultZoom = engine.camera.zoom;

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

const startCircle = new Circle;
engine.addObject(startCircle);
startCircle.radius = 10;
startCircle.colour = "rgba(45, 112, 179, 1)";
startCircle.outline.colour = "rgba(45, 112, 179, 0.5)";
startCircle.outline.size = 10;
startCircle.moveTo(points.start);

const endCircle = new Circle;
engine.addObject(endCircle);
endCircle.radius = 10;
endCircle.colour = "rgba(199, 68, 64, 1)";
endCircle.outline.colour = "rgba(199, 68, 64, 0.5)";
endCircle.outline.size = 10;
endCircle.moveTo(points.end);

var hasHoveringDot = false;
function draggableDotScript(dot) {
	dot.radius = 10 / engine.camera.zoom;
	dot.outline.size = 10 / engine.camera.zoom;

	let mouse = engine.mouse.toWorld();

	let distanceToMouse = Math.hypot(dot.display.x - mouse.x, dot.display.y - mouse.y);
	let hovering = distanceToMouse <= dot.radius;

	if (
		dot.getAttribute("dragging") == true ||
		(engine.mouse.click_l && hovering && hasHoveringDot == false)
	) {
		dot.moveTo(mouse.x, mouse.y);
		dot.setAttribute("dragging", engine.mouse.click_l);
		hasHoveringDot = engine.mouse.click_l;
	}

	if (typeof startCircle.display.x != "number") {
		console.log("BROKEN!", {
			dot: dot.display,
			mouse
		});
		dot.display.y = dot.display.x.y;
		dot.display.x = dot.display.x.x;
	}

	// start.set(dot.display.x, dot.display.y);
}
engine.postRenderingScript = () => {
	engine.cursor = (hasHoveringDot) ? "pointer" : "default";
};
startCircle.script = draggableDotScript;
endCircle.script = draggableDotScript;

const path = new Path;
engine.addObject(path);
path.colour = "none";
path.outline.colour = "#6042A6";
path.outline.size = 10;
path.zIndex = 0;

var armLength = 1;
var tailLength = 3;
var offset = tailLength;
var radOffset = pi / 2;

var lastA = { x: null, y: null };
var lastC = { x: null, y: null };

path.script = () => {

	path.outline.size = 10 / engine.camera.zoom;

	let A = endCircle.display;
	let C = startCircle.display;

	if (lastA.x == A.x && lastA.y == A.y && lastC.x == C.x && lastC.y == C.y) return;

	console.log("Tick!");

	lastA.x = A.x;
	lastA.y = A.y;
	lastC.x = C.x;
	lastC.y = C.y;

	let rad = Math.atan((A.y - C.y) / (A.x - C.x));
	if (C.x > A.x) rad += pi;
	rad %= 2 * pi;
	let cosRad = cos(rad);
	let sinRad = sin(rad);

	let p1 = {
		x: C.x + armLength * cos(rad + radOffset) + offset * cosRad,
		y: C.y + armLength * sin(rad + radOffset) + offset * sinRad
	};

	let p2 = {
		x: C.x + (armLength + offset) * cosRad,
		y: C.y + (armLength + offset) * sinRad
	};

	let p3 = {
		x: C.x + armLength * cos(rad - radOffset) + offset * cosRad,
		y: C.y + armLength * sin(rad - radOffset) + offset * sinRad
	};

	let p4 = {
		x: p2.x - tailLength * cosRad,
		y: p2.y - tailLength * sinRad
	};

	path.clearPath();
	path.pen.moveTo(p1);
	path.pen.lineTo(p2);
	path.pen.lineTo(p3);
	path.pen.moveTo(p2);
	path.pen.lineTo(p4.x, p4.y);
}