import { Camera, engine } from "./utils.js";
import { Path, Text, Rect } from "./components/index.js";
import * as tb from "../toolbelt/toolbelt.js";

engine.setBackground("#FBFBFE");

engine.camera.zoom = 0.75;
engine.camera.defaultZoom = 0.75;

engine.camera.minZoom = 0.1;
engine.camera.maxZoom = Infinity;

const anchor = new Path;
anchor.fixedPosition = true;
anchor.outline.colour = "#DDDBFF";
anchor.outline.size = 3;
engine.addObject(anchor);

var lastCameraZoom = null;
var lastCameraX = null;
var lastCameraY = null;
var lastCanvasW = null;
var lastCanvasH = null;

anchor.script = () => {
	if (
		engine.camera.position.x == lastCameraX &&
		engine.camera.position.y == lastCameraY &&
		engine.camera.zoom == lastCameraZoom &&
		engine.canvas.width == lastCanvasW &&
		engine.canvas.height == lastCanvasH
	) {
		return;
	}

	lastCameraX = engine.camera.position.x;
	lastCameraY = engine.camera.position.y;
	lastCameraZoom = engine.camera.zoom;
	lastCanvasW = engine.canvas.width;
	lastCanvasH = engine.canvas.height;

	anchor.setLayer(0);

	anchor.clearPath();
	let centerX = engine.canvas.width/2 - lastCameraX * lastCameraZoom;
	let centerXToRange = tb.toRange(-anchor.outline.size/2, centerX, engine.canvas.width + anchor.outline.size/2);
	let centerY = engine.canvas.height/2 - lastCameraY * lastCameraZoom;
	let centerYToRange = tb.toRange(-anchor.outline.size/2, centerY, engine.canvas.height + anchor.outline.size/2);

	anchor.pen.moveTo(centerXToRange, 0);
	anchor.pen.lineTo(centerXToRange, engine.canvas.height);
	
	anchor.pen.moveTo(0, centerYToRange);
	anchor.pen.lineTo(engine.canvas.width, centerYToRange);
}