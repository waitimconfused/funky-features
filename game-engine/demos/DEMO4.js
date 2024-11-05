import { mouse } from "../../toolbelt/toolbelt.js";
import { engine, ComponentGroup } from "../utils.js";
import { Path, Rect, Text } from "../index.js";

engine.setFavicon("https://confusion.inputoverload.com/assets/favicon.png");
engine.background = "#e0e0e0";

const path = new Path;
engine.addObject(path);
path.outline.colour = "black";
path.outline.size = 25;
path.colour = "none";

const graph = new ComponentGroup;
engine.addObject(graph);
function newRect() {
	let rect = new Rect;
	rect.moveTo(Math.round(Math.random() * engine.width - engine.width/2), Math.round(Math.random() * engine.height - engine.height/2));
	rect.setSize(100, 100);
	rect.colour = "white";
	rect.radius = 10;
	rect.outline.size = 5;
	rect.outline.colour = "#E5E5E5";

	rect.connectTo = function(hash) {
		let connections = this.getAttribute("connections") || [];
		connections.push(hash);
		rect.setAttribute("connections", connections);
	};
	
	graph.addObject(rect);

	return rect;
}

const rect1 = newRect();
const rect2 = newRect();
const rect3 = newRect();
const rect4 = newRect();

rect1.connectTo(rect2.hash);
rect1.connectTo(rect3.hash);
rect3.connectTo(rect4.hash);

var graphHasDraggingRect = false;
var offsetX = null;
var offsetY = null;

path.script = () => {
	path.outline.size = Math.min(25 / engine.camera.zoom, 25);
	path.clearPath();

	let engineMouse = engine.mouse.toWorld();

	for (let graphHashIndex = 0; graphHashIndex < graph.componentHashes.length; graphHashIndex++) {
		let hash = graph.componentHashes[graphHashIndex];
		let rect1 = graph.getObject(hash);
		let rectConnections = rect1.getAttribute("connections") || [];

		// rect1.outline.size = 5 / engine.camera.zoom;

		if (
			rect1.getAttribute("isDragging") ||
			mouse.click_l && rect1.display.contains(engineMouse.x, engineMouse.y) && !graphHasDraggingRect
		) {
			if (!rect1.getAttribute("isDragging")) {
				offsetX = rect1.display.x - engineMouse.x;
				offsetY = rect1.display.y - engineMouse.y;
			}
			rect1.moveTo(engineMouse.x + offsetX, engineMouse.y + offsetY);
			rect1.setAttribute("isDragging", mouse.click_l);
			graphHasDraggingRect = mouse.click_l;
			if (!mouse.click_l) {
				offsetX = null;
				offsetY = null;
			}
		}

		for (let connectionHashIndex = 0; connectionHashIndex < rectConnections.length; connectionHashIndex++) {
			let hash = rectConnections[connectionHashIndex];
			let rect2 = graph.getObject(hash);

			let rect1X = rect1.display.x;
			let rect1Y = rect1.display.y;
			let rect2X = rect2.display.x;
			let rect2Y = rect2.display.y;

			let dx = Math.abs(rect2X - rect1X);
			let dy = Math.abs(rect2Y - rect1Y);

			if (dx < dy) {
				if (rect2Y < rect1Y - rect1.display.h / 2) {
					rect1Y -= rect1.display.h / 2;
					rect2Y += rect2.display.h / 2;
				} else if (rect2Y > rect1Y + rect1.display.h / 2) {
					rect1Y += rect1.display.h / 2;
					rect2Y -= rect2.display.h / 2;
				}
				path.pen.moveTo(rect1X, rect1Y);
				path.pen.cubicCurveTo(rect1X, (rect2Y + rect1Y) / 2, rect2X, (rect1Y + rect2Y) / 2, rect2X, rect2Y);
			} else {
				if (rect2X < rect1X - rect1.display.w / 2) {
					rect1X -= rect1.display.w / 2;
					rect2X += rect2.display.w / 2;
				} else if (rect2X > rect1X + rect1.display.w / 2) {
					rect1X += rect1.display.w / 2;
					rect2X -= rect2.display.w / 2;
				}
				path.pen.moveTo(rect1X, rect1Y);
				path.pen.cubicCurveTo((rect2X + rect1X) / 2, rect1Y, (rect1X + rect2X) / 2, rect2Y, rect2X, rect2Y);
			}
		}
	}
};