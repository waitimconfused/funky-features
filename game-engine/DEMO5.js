import { engine } from "./utils.js";
import { Canvas, Circle } from "./components/index.js";
import { mouse } from "../toolbelt/toolbelt.js";

engine.camera.zoom = 6;

const canvas = new Canvas;
engine.addObject(canvas);
canvas.moveTo(0, 0);
canvas.setSize(200, 400);
canvas.context.fillStyle = "red";

const dot = new Circle;
engine.addObject(dot);
dot.radius = 10;
dot.colour = "black";
dot.outline.colour = "white";
dot.outline.size = 5;

console.log(engine.getObject(1));

var mouseDown = false;
var lastMousePos = engine.mouse.toWorld();

dot.script = () => {
	dot.moveTo( engine.mouse.toWorld() );
}

mouse.addHook({
	updateFunc: () => {
		let canvasMouse = engine.mouse.toWorld();
		if (mouseDown) {
			canvas.context.fillStyle = `rgb(${ Math.round( Math.random() * 255 ) }, ${ Math.round( Math.random() * 255 ) }, ${ Math.round( Math.random() * 255 ) })`
			canvas.context.beginPath();
			canvas.context.arc(canvasMouse.x + canvas.display.w/2, canvasMouse.y + canvas.display.h/2, 10, 0, 2 * Math.PI);
			canvas.context.closePath();
			canvas.context.fill();
		}
		mouseDown = engine.mouse.click_l;
		lastMousePos = engine.mouse;
	}
});