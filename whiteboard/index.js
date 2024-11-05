import { ComponentGroup, engine, Point2 } from "../game-engine/utils.js";
import { Canvas, Circle, Image, Path, Rect, Text } from "../game-engine/components.js"
import { keyboard, toRange, Vector } from "../toolbelt/toolbelt.js";

const layersDiv = document.getElementById("layer-holder");
const newLayerButton = document.getElementById("add-layer");
const whiteboard = document.getElementById("whiteboard");

engine.setCanvas(whiteboard);
engine.setBackground("white");
engine.disableLoadAssetLogs();
engine.loadAsset("./assets/pens/pen.svg");
engine.loadAsset("./assets/pens/eraser.svg");
engine.loadAsset("./assets/layers.svg");
engine.enableLoadAssetLogs();

engine.fullscreen = true;

var width = 3840;
var height = 2160;

// width = 100;
// height = 100;

var scale = Math.min(engine.veiwportWidth, engine.veiwportHeight) / Math.min(width, height);
engine.camera.zoom = scale * 0.9;
engine.camera.defaultZoom = engine.camera.zoom;
engine.camera.resetZoomResetsPosition = true;

/** @type {Canvas[]} */
var layers = [];
/** @type {HTMLCanvasElement[]} */
var layerIcons = [];

var data = {
	/** @type {number} */
	layerNumber: 0,
	pen: {
		/** @type {"pen" | "erase"} */
		mode: "pen",
		/** @type {number} */
		size: 25,
		/** @type {number} */
		smoothing: 5,
		/** @type {number} */
		spacing: 5,
	}
}

function newLayer() {
	let newLayersIndex = layers.length;
	let canvas = new Canvas;
	engine.addObject(canvas);

	let layerDiv = document.createElement("div");
	layersDiv.appendChild(layerDiv);

	layerDiv.addEventListener("click", () => {
		document.querySelector(`#layers div.selected`).classList.remove("selected");
		layerDiv.classList.add("selected");
		data.layerNumber = newLayersIndex;
	})

	let layerIcon = document.createElement("canvas");
	layerDiv.appendChild(layerIcon);
	layerIcon.width = 100 * (width / height);
	layerIcon.height = 100;

	if (layers.length == 0) {
		canvas.colour = "white";
		canvas.outline.colour = "#D9D9D9";
		canvas.outline.size = 10;
		canvas.shadow.colour = "#0000001A";
		canvas.shadow.blur = 20;
		canvas.script = () => {
			canvas.outline.size = 1 / engine.camera.zoom;
			canvas.shadow.blur = 20 / engine.camera.zoom;
		};
		layerDiv.classList.add("selected");
	} else {
		canvas.colour = "transparent";
	}

	canvas.display.set(0, 0, width, height);
	layers.push(canvas.hash);
	layerIcons.push(layerIcon);

	return {
		canvas: canvas,
		div: layerDiv,
	}
}

newLayerButton.onclick = () => {
	let layerData = newLayer();
	layerData.div.click();
	// data.layerNumber = layers.length - 1;

};
newLayer();
// canvas.transform.set(0, 0);

const UI = new ComponentGroup;
engine.addObject(UI);
UI.fixedPosition = true;

const colourValue = new Circle;
UI.addObject(colourValue);
colourValue.fixedPosition = true;
colourValue.radius = data.pen.size;
colourValue.outline.colour = "black";
colourValue.outline.size = 3;

const colourValueIcon = new Image;
UI.addObject(colourValueIcon);
colourValueIcon.fixedPosition = true;
colourValueIcon.source = "./assets/pens/pen.svg";
colourValueIcon.display.set(0, 0, 25, 25);

const layerRect = new Rect;
UI.addObject(layerRect);
layerRect.fixedPosition = true;
layerRect.transform.set(0, 0);
layerRect.display.set(30, 80, 80, 35);
layerRect.radius = 10;

const layerIcon = new Image;
UI.addObject(layerIcon);
layerIcon.fixedPosition = true;
layerIcon.source = "./assets/layers.svg";
layerIcon.display.set(50, 100, 25, 25);

const layerNumber = new Text;
UI.addObject(layerNumber);
layerNumber.content = "0";
layerNumber.colour = "#e8eaed";
layerNumber.fontSize = 25;
layerNumber.fixedPosition = true;
layerNumber.textAlign = "left";
layerNumber.moveTo(65, 100);

const penSizeRect = new Rect;
UI.addObject(penSizeRect);
penSizeRect.fixedPosition = true;
penSizeRect.transform.set(0, 0);
penSizeRect.display.set(30, 120, 80, 35);
penSizeRect.radius = 10;

const penSizeIcon = new Image;
UI.addObject(penSizeIcon);
penSizeIcon.fixedPosition = true;
penSizeIcon.source = "./assets/pen_size.svg";
penSizeIcon.display.set(50, 135, 25, 25);

const penSizeNumber = new Text;
UI.addObject(penSizeNumber);
penSizeNumber.content = "0";
penSizeNumber.colour = "#e8eaed";
penSizeNumber.fontSize = 25;
penSizeNumber.fixedPosition = true;
penSizeNumber.textAlign = "left";
penSizeNumber.moveTo(65, 135);

const cursor = new Circle;
engine.addObject(cursor);
cursor.radius = 10;
cursor.colour = "none";
cursor.outline.colour = "black";
cursor.outline.size = 1;

const cursor2 = new Circle;
engine.addObject(cursor2);
cursor2.radius = 10;
cursor2.colour = "none";
cursor2.outline.colour = "black";
cursor2.outline.size = 1;

keyboard.on(["]"], () => {
	data.pen.size += 5;
}, { passive: false });
keyboard.on(["["], () => {
	data.pen.size -= 5;
	if (data.pen.size < 0) data.pen.size = 0;
}, { passive: false });


keyboard.on(["e"], () => {
	data.pen.mode = "erase";
}, { passive: false });
keyboard.on(["p"], () => {
	data.pen.mode = "pen";
}, { passive: false });

keyboard.on(["alt", "["], () => {
	data.layerNumber -= 1;
	if (data.layerNumber < 0) data.layerNumber = layers.length - 1;
}, { passive: false });
keyboard.on(["alt", "]"], () => {
	data.layerNumber += 1;
	data.layerNumber %= layers.length;
}, { passive: false });

keyboard.on(["ctrl", "e"], () => {
	let canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	let context = canvas.getContext("2d");
	for (let i = 0; i < layers.length; i ++) {
		let engineCanvasHash = layers[i];
		/** @type {Canvas} */
		let engineCanvas = engine.getObject(engineCanvasHash);

		context.drawImage(engineCanvas.documentElement, 0, 0);
	}

	let d = new Date();

    let year = d.getFullYear();
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();

    let hour = d.getHours();
    let minute = d.getMinutes().toString().padStart(2, "0");

    if (month.length < 2)  month = '0' + month;
    if (day.length < 2)  day = '0' + day;

    let fileName = [year, month, day].join('-') + "__" + [hour, minute].join(':') + ".png";

	let downloadLink = document.createElement("a");
    downloadLink.setAttribute("download", fileName);
    let dataURL = canvas.toDataURL("image/png");
    let url = dataURL.replace(/^data:image\/png/, "data:application/octet-stream");
    downloadLink.setAttribute('href', url);
    downloadLink.click();

}, { passive: false });


keyboard.on(["ctrl", "s"], () => {}, { passive: false });
keyboard.on(["ctrl", "p"], () => {}, { passive: false });
keyboard.on(["ctrl", "u"], () => {}, { passive: false });
keyboard.on(["ctrl", "l"], () => {}, { passive: false });

engine.cursor = "pointer";

var penDown = false;
var lastMousePos = new Point2(-1, -1);
var lastClickedMousePos = new Point2(-1, -1);
engine.preRenderingScript = () => {

	let canvasHash = layers[data.layerNumber];
	/** @type {Canvas} */
	let canvas = engine.getObject(canvasHash);

	let mousePos = engine.mouse.toWorld();
	// let canvasMouse = engine.mouse.toObject(canvas);
	let canvasMouse = cursor.display.clone()
		.translate(-canvas.display.x + canvas.display.w * canvas.transform.x, 0)
		.translate(0, -canvas.display.y + canvas.display.h * canvas.transform.y);
	let clicking = engine.mouse.click_l && engine.canvas.matches(":active");

	if (!clicking) cursor.moveTo(mousePos);

	layerNumber.content = (data.layerNumber+1) + "/" + layers.length;
	penSizeNumber.content = data.pen.size;

	if (keyboard.isPressed("shift") && lastClickedMousePos.equals(-1, -1)) {
		lastClickedMousePos.set(canvasMouse);
	}

	cursor.radius = data.pen.size;
	cursor.outline.size = 5 / engine.camera.zoom;
	cursor.outline.size = Math.min(5, cursor.outline.size);
	cursor2.outline.size = cursor.outline.size;

	cursor2.zIndex = -1;
	cursor.zIndex = -1;

	cursor2.visibility = keyboard.isPressed("shift");
	if (cursor.visibility) {
		cursor2.radius = data.pen.size;
		cursor2.outline.size = cursor.outline.size;
		cursor2.moveTo(lastClickedMousePos.x - canvas.display.w * canvas.transform.x, lastClickedMousePos.y - canvas.display.h * canvas.transform.y);
	}

	colourValue.moveTo(50, 50);
	colourValueIcon.moveTo(colourValue);

	// let rgb = [];
	// let time = performance.now() / 5000;
	// rgb[0] = Math.sin(time) * 127.5 + 127.5;
	// rgb[1] = Math.sin(time + 2/3 * Math.PI) * 127.5 + 127.5;
	// rgb[2] = Math.sin(time + 4/3 * Math.PI) * 255 + 127.5;

	// let hsl = `hsl(${ (performance.now() / 100) % 360 }deg, 100%, 50%)`;

	// var colour = `rgb(${rgb.join(", ")})`;
	// colour = hsl;
	var colour = document.getElementById("colour-picker").getAttribute("value");
	colourValue.colour = colour;

	if (data.pen.mode == "erase") {
		canvas.context.globalCompositeOperation = "destination-out";
		colourValueIcon.source = "./assets/pens/eraser.svg";
	} else {
		canvas.context.globalCompositeOperation = "source-over";
		colourValueIcon.source = "./assets/pens/pen.svg";
	}

	if (clicking && data.pen.size > 0) {

		let vector = new Vector;
		vector.setPos(mousePos.x - cursor.display.x, mousePos.y - cursor.display.y);
		vector.mag /= data.pen.smoothing + 1;
		if (vector.mag > 1) cursor.moveBy(vector.xy());
		else cursor.moveTo(mousePos);

		let p1 = lastMousePos;
		let p2 = canvasMouse;
		if (keyboard.isPressed("shift")) {
			if (lastClickedMousePos.x == -1 && lastClickedMousePos.y == -1) lastClickedMousePos.set(canvasMouse);
			p2 = lastClickedMousePos;
		}

		canvas.context.beginPath();
		canvas.context.fillStyle = "transparent";
		canvas.context.strokeStyle = colour;
		canvas.context.lineWidth = data.pen.size * 2;
		canvas.context.lineCap = "round";
		canvas.context.moveTo(p1.x, p1.y);
		canvas.context.lineTo(p2.x, p2.y);
		canvas.context.closePath();
		canvas.context.stroke();

		canvas.context.beginPath();
		canvas.context.fillStyle = colour;
		canvas.context.strokeStyle = "transparent";
		canvas.context.lineWidth = 0;
		canvas.context.arc(p1.x, p1.y, data.pen.size, 0, 2 * Math.PI);
		canvas.context.arc(p2.x, p2.y, data.pen.size, 0, 2 * Math.PI);
		canvas.context.closePath();
		canvas.context.fill();
		lastClickedMousePos.set(canvasMouse.x, canvasMouse.y);
	}
	if (penDown && !clicking) {
		let layerIcon = layerIcons[data.layerNumber];
		let layerIconContext = layerIcon.getContext("2d");
		layerIconContext.clearRect(0, 0, layerIcon.width, layerIcon.height);
		layerIconContext.drawImage(canvas.documentElement, 0, 0, layerIcon.width, layerIcon.height);
	}

	penDown = clicking && data.pen.size > 0;
	lastMousePos.set(canvasMouse.x, canvasMouse.y);
}

window.addEventListener("load", function () {
	let loadingScreen = document.getElementById("loading");
	loadingScreen.classList.add("hide");
	loadingScreen.onanimationend = () => {
		document.getElementById("loading").remove();
	}
});