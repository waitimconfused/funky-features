import { engine } from "../game-engine/utils.js";
import { Canvas, Circle, Rect } from "../game-engine/components.js";

engine.fullscreen = true;

// await engine.loadAsset("./canvas_background.svg");

var playerCount = 4;
var tileCount = 15;

var colour = "red";

var size = Math.ceil( Math.sqrt( tileCount * playerCount ) );
var scale = Math.min(engine.veiwportWidth, engine.veiwportHeight) / size;
engine.camera.zoom = scale;

const fauxCanvas = new Canvas;
engine.addObject(fauxCanvas);
fauxCanvas.colour = "white";
fauxCanvas.shadow.colour = "color-mix(in srgb, transparent, black 20%)";
fauxCanvas.shadow.blur = "400 / 100cz";
fauxCanvas.shadow.offset.y = "40 / 100cz"

fauxCanvas.display.set(0, 0, size, size);


// engine.setCanvas(canvas);

const cursor = new Rect;
engine.addObject(cursor);
cursor.transform.set(0, 0);
cursor.setSize(1);
cursor.radius = 0.25;

var dot = new Circle;
engine.addObject(dot);
dot.radius = 0.5;
dot.cameraTracking = true;


function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms) );
}


var mousePressed = false;
engine.preRenderingScript = async () => {

	// let mousePos = engine.mouse.toWorld();

	// cursor.colour = `color-mix(in srgb, ${colour}, white 50%)`;
	// cursor.moveTo(mousePos.floor());

	// if (mousePressed == true && engine.mouse.click_l == false) {
	// 	let mouseInCanvas = engine.mouse.toObject(fauxCanvas).floor();
	// 	fauxCanvas.context.fillStyle = cursor.colour;
	// 	fauxCanvas.context.fillRect(mouseInCanvas.x, mouseInCanvas.y, 1, 1);
	// }
	// mousePressed = engine.mouse.click_l;
}

async function tick() {
	dot.moveTo(0, 0);
	await wait(800);
	dot.moveTo(1, 0);
	await wait(800);
	dot.moveTo(1, 1);
	await wait(800);
	dot.moveTo(0, 1);
	await wait(800);
	tick();
}

tick();