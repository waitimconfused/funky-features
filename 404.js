import { engine, Component, ComponentGroup } from "./game-engine/utils.js";
import { Circle, Path, Rect, Text } from "./game-engine/components.js";
import { getValue } from "./toolbelt/lib/units.js";

engine.fullscreen = true;
engine.camera.zoom = 1;

engine.setFavicon("https://confusion.inputoverload.com/assets/favicon.png");
// engine.background = "white";
engine.camera.defaultZoom = engine.camera.zoom;

const handle = new Circle;
engine.addObject(handle);
handle.radius = "10 / 100cz";
handle.outline.size = "5 / 100cz";
handle.colour = "#222266";

var handleDragging = false;

handle.script = () => {
	handle.zIndex = -1;
	let mouse = engine.mouse.toWorld();
	let distance = Math.hypot( mouse.x - handle.display.x, mouse.y - handle.display.y );

	if (handleDragging || distance < getValue( handle.radius ) && engine.mouse.click_l) {
		handle.moveTo(mouse);
		handleDragging = engine.mouse.click_l;
	}
}

const group = new ComponentGroup;
engine.addObject(group);

group.script = () => {
	group.display.set(handle.display.x, handle.display.y);
	let s = Math.sin( performance.now() / 1000 );
	s = (s * Math.SQRT2 + 1) / 2;
	let c = Math.cos( performance.now() / 1000 );
	c = (c * Math.SQRT2 + 1) / 2;
	group.transform.set(c, s);
}

/** @type {string | null} */
var groupDraggedObject=  null;

// const text = new Text;
// text.content = "ABCDEFGHIJKLMNOPQRSTUVWXYZ\n1234567890\n~`!@#$%^&*()-_=+{}[]\\|;:'\",<.>/?";
// text.fontFamily = "EEP";
// text.colour = "#000088";
// text.outline.colour = "black";
// text.fontSize = 3;
// text.outline.size = 1;
// text.textBaseLine = "bottom";

// group.addObject(text);

const rect1 = new Rect;
rect1.moveTo(0, 0);
group.addObject(rect1);
rect1.script = tryDragRect

const rect2 = new Rect;
rect2.moveTo(150, 100);
rect1.setSize(150, 150);
group.addObject(rect2);

// rect2.script = tryDragRect;

/** @param {Rect} rect */
function tryDragRect(rect) {
	if ([null, rect.hash].includes(groupDraggedObject) == false) return;
	if (engine.mouse.click_l == false) {
		groupDraggedObject = null;
		return;
	}

	let mouse = engine.mouse.toWorld();

	if (
		groupDraggedObject == rect.hash ||
		(
			mouse.x > rect.display.x - rect.display.w * rect.transform.x &&
			mouse.x < rect.display.x + rect.display.w * rect.transform.x &&
			mouse.y > rect.display.y - rect.display.h * rect.transform.y &&
			mouse.y < rect.display.y + rect.display.h * rect.transform.y
		)
	) {
		rect.moveTo(engine.mouse.toWorld());
		groupDraggedObject = rect.hash;
	}
}

const fpsLabel = new Text;
fpsLabel.fontFamily = "EEP";
fpsLabel.colour = "#000088";
fpsLabel.outline.colour = "black";
fpsLabel.fontSize = 48;
fpsLabel.outline.size = 1;
fpsLabel.textBaseLine = "top";
fpsLabel.textAlign = "left";
fpsLabel.fixedPosition = true;
fpsLabel.moveTo(10, 10);

engine.addObject(fpsLabel);

fpsLabel.script = () => {
	fpsLabel.content = engine.stats.fps;
}
