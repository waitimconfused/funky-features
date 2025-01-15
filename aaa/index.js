import { Circle, Path, Rect } from "../game-engine/components.js";
import { Component, engine, Point2, Point4 } from "../game-engine/utils.js";
import { getValue } from "../toolbelt/lib/units.js";
import { keyboard } from "../toolbelt/toolbelt.js";
engine.fullscreen = true;
engine.camera.zoom = 20;

const { abs, cos, sin, tan, atan, atan2, PI, random, round, floor, ceil } = Math;

var rect = new Point4(0, 0, 10, 10);
var hasHoveredAnchor = false;

const path = new Path;
engine.addObject(path);
path.colour = "#00000044";
path.outline.colour = "#000000";
path.outline.size = "5 / 100cz";

/** @type {Circle[]} */
var anchors = [];
/**
 * @type {{
 * 	"1": Circle,
 * 	"2": Circle,
 *  radiusModifier: number
 *  directionModifier: number
 * }[]}
 */
var handles = [];

const ANCHOR1 = newAnchor();      ANCHOR1.colour = "#C74440"; ANCHOR1.outline.colour = "#C7444044";
const ANCHOR2 = newAnchor();      ANCHOR2.colour = "#2D70B3"; ANCHOR2.outline.colour = "#2D70B344";
const ANCHOR3 = newAnchor();      ANCHOR3.colour = "#388C46"; ANCHOR3.outline.colour = "#388C4644";
const ANCHOR4 = newAnchor();      ANCHOR4.colour = "#FA7E19"; ANCHOR4.outline.colour = "#FA7E1944";

ANCHOR1.moveTo(-5, -5);
ANCHOR2.moveTo(5, -5);
ANCHOR3.moveTo(5, 5);
ANCHOR4.moveTo(-5, 5);

for (let i = 0; i < anchors.length; i ++) {
	let h1 = newAnchor(false);
	let h2 = newAnchor(false);

	h1.colour = "red";
	h2.colour = "blue";

	handles.push({
		"1": h1,
		"2": h2,
		radiusModifier: randomInRange(1, 3),
		directionModifier: randomInRange(-PI/4, PI/4),
	});
}


/** @type {?string} */
var draggingAnchorHash = null;
function newAnchor(draggable=true) {
	let anchor = new Circle;
	anchor.radius = "10 / 100cz";
	anchor.outline.size = "10 / 100cz";
	anchor.outline.colour = "#88000044";
	anchor.colour = "#880000";
	engine.addObject(anchor);

	if (draggable) {
		anchor.radius = "10 / 100cz";
		anchor.outline.size = "10 / 100cz";
		anchor.outline.colour = "#88000044";
		anchor.colour = "#880000";
		anchors.push(anchor);
	} else {
		anchor.radius = "5 / 100cz";
		anchor.outline.size = 0;
		anchor.outline.colour = "transparent";
	}

	anchor.setAttribute("dragging", draggable);

	let dragging = false;
	var hasDraggingAnchor = false;
	anchor.script = () => {
		if (anchor.getAttribute("dragging") == false) return;
		let mouse = engine.mouse.toWorld();
		let distanceToMouse = Math.hypot(anchor.display.x - mouse.x, anchor.display.y - mouse.y);
		let hovering = distanceToMouse <= getValue(anchor.radius);
		if (hovering) hasHoveredAnchor = hovering;
		if (
			dragging == true ||
			(engine.mouse.click_l && hovering && [null, anchor.hash].includes(draggingAnchorHash))
		) {
			anchor.moveTo(mouse.x, mouse.y);
			dragging = engine.mouse.click_l;
			if (engine.mouse.click_l) draggingAnchorHash = anchor.hash;
			else draggingAnchorHash = false;
		}
	}

	return anchor;
}

engine.preRenderingScript = () => {
	hasHoveredAnchor = false;
}

engine.postRenderingScript = () => {
	engine.cursor = hasHoveredAnchor ? "pointer" : "default";
}

setInterval(() => {
	path.clearPath();
	let anchorPoints = [];
	for (let i = 0; i < anchors.length; i ++) {
		anchorPoints.push(anchors[i].display);
	}
	let pathValue = generateHandrawnPath(...anchorPoints);
	path.path = pathValue;
}, 1000);



function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

/** @param { {x:number, y:number}[] | Point2[] } points */
function generateHandrawnPath(...points) {
	let path = new Path;

	/**
	 * @type {{
	 * 	"1": Point2,
	 * 	"2": Point2,
	 *  radiusModifier: number
	 *  directionModifier: number
	 * }[]}
	 */
	let handles = [];

	for (let i = 0; i < points.length; i ++) {
		let h1 = new Point2(points[i].x, points[i].y);
		let h2 = new Point2(points[i].x, points[i].y);
	
		handles.push({
			"1": h1,
			"2": h2,
			radiusModifier: randomInRange(1, 3),
			directionModifier: randomInRange(-PI/4, PI/4),
		});
	}

	for (let i = 0; i < points.length; i ++) {
		let a0 = points.at(i-1);
		let a1 = points[i];
		let h1 = handles[i]["1"];
		let h2 = handles[i]["2"];
		let a2 = points[(i+1)%points.length];

		let radiusModifier = handles[i].radiusModifier;
		let directionModifier = handles[i].directionModifier;

		let dirToA0 = atan2(a0.y-a1.y, a0.x-a1.x);
		let dirToA2 = atan2(a2.y-a1.y, a2.x-a1.x);

		let dir = (dirToA0+dirToA2)/2 + PI * (abs( dirToA2-dirToA0 ) > PI) + directionModifier;

		let handleX = cos(dir + PI/2) * radiusModifier;
		let handleY = sin(dir + PI/2) * radiusModifier;

		h1.set(a1.x, a1.y);
		h2.set(a1.x, a1.y);

		h1.translate(handleX, handleY);
		h2.translate(-handleX, -handleY);
	}

	for (let i = 0; i < points.length; i ++) {
		let a1 = points[i];
		let h1 = handles[i]["1"];
		let h2 = handles[i]["2"];
		let h3 = handles[(i+1)%points.length]["1"];
		let h4 = handles[(i+1)%points.length]["2"];
		let a2 = points[(i+1)%points.length];

		let B;
		let C;

		if ( Math.hypot(a2.x-h1.x, a2.y-h1.y) < Math.hypot(a2.x-h2.x, a2.y-h2.y) ) {
			B = h1;
		} else {
			B = h2;
		}

		if ( Math.hypot(a1.x-h3.x, a1.y-h3.y) < Math.hypot(a1.x-h4.x, a1.y-h4.y) ) {
			C = h3;
		} else {
			C = h4;
		}

		if (i == 0) path.pen.moveTo(a1.x, a1.y);
		else path.pen.lineTo(a1.x, a1.y);
		path.pen.cubicCurveTo( B.x,B.y, C.x,C.y, a2.x,a2.y );
	}

	return path.path;
}