import { animation, engine, Point2 } from "../utils.js";
import * as components from "../components/index.js";
import { keyboard, mouse, toRange } from "../../toolbelt/toolbelt.js";

const output = document.getElementById("output");

var imageSize = new Point2(0, 0);

engine.setBackground("#e0e0e0");
engine.fullscreen = false;

engine.setSize(500, 500);
engine.canvas.style.position = "fixed";
engine.canvas.style.border = "3px solid black";
engine.canvas.style.top = "10px";
engine.canvas.style.left = null;
engine.canvas.style.right = "10px";

mouse.ensableTouch();

engine.canvas.addEventListener('wheel', (e) => {

	if (e.ctrlKey) {
		if(e.target != engine.canvas) return undefined;
		e.preventDefault();
		// if (imageSize.equals(0, 0)) return;
		engine.camera.zoom -= e.deltaY * 0.01;
		engine.camera.zoom = toRange(0.0000000000001, engine.camera.zoom, 100);
	} else {
		if(e.target != engine.canvas) return undefined;
		e.preventDefault();
		// if (imageSize.equals(0, 0)) return;
		engine.camera.moveBy(e.deltaX / engine.camera.zoom, e.deltaY / engine.camera.zoom);
	}

}, {passive: false});

keyboard.on(["arrowleft"], (e) => {
	e.preventDefault();
	cursor1.moveBy(-1, 0);
	cursor2.moveBy(-1, 0);
});

keyboard.on(["arrowright"], () => {
	cursor1.moveBy(1, 0);
	cursor2.moveBy(1, 0);
});

keyboard.on(["arrowup"], () => {
	cursor1.moveBy(0, -1);
	cursor2.moveBy(0, -1);
});

keyboard.on(["arrowdown"], () => {
	cursor1.moveBy(0, 1);
	cursor2.moveBy(0, 1);
});

keyboard.on(["control", "arrowleft"], () => {
	cursor1.moveBy(-selectedRect.display.w, 0);
	cursor2.moveBy(-selectedRect.display.w, 0);
});

keyboard.on(["control", "arrowright"], () => {
	cursor1.moveBy(selectedRect.display.w, 0);
	cursor2.moveBy(selectedRect.display.w, 0);
});

keyboard.on(["control", "arrowup"], () => {
	cursor1.moveBy(0, -selectedRect.display.h);
	cursor2.moveBy(0, -selectedRect.display.h);
});

keyboard.on(["control", "arrowdown"], () => {
	cursor1.moveBy(0, selectedRect.display.h);
	cursor2.moveBy(0, selectedRect.display.h);
});

keyboard.on(["shift", "arrowleft"], () => {
	cursor1.display.set(selectedRect.display.x, selectedRect.display.y);
	cursor2.display.set(selectedRect.display.x+selectedRect.display.w, selectedRect.display.y+selectedRect.display.h);

	if (selectedRect.display.w <= 0) return;

	cursor2.moveBy(-1, 0);
});

keyboard.on(["shift", "arrowright"], () => {
	cursor1.display.set(selectedRect.display.x, selectedRect.display.y);
	cursor2.display.set(selectedRect.display.x+selectedRect.display.w, selectedRect.display.y+selectedRect.display.h);

	cursor2.moveBy(1, 0);
});

keyboard.on(["shift", "arrowup"], () => {
	cursor1.display.set(selectedRect.display.x, selectedRect.display.y);
	cursor2.display.set(selectedRect.display.x+selectedRect.display.w, selectedRect.display.y+selectedRect.display.h);

	if (selectedRect.display.h <= 0) return;

	cursor2.moveBy(0, -1);
});

keyboard.on(["shift", "arrowdown"], () => {
	cursor1.display.set(selectedRect.display.x, selectedRect.display.y);
	cursor2.display.set(selectedRect.display.x+selectedRect.display.w, selectedRect.display.y+selectedRect.display.h);

	cursor2.moveBy(0, 1);
});


const input = new components.Text;
input.content = "Drag Image";
input.fixedPosition = false;
input.textColour = "black";
input.styling = "bold";
engine.addObject(input);

const importedImage = new components.Image;
importedImage.colour = "white";
importedImage.setSize(0, 0);
engine.addObject(importedImage);
importedImage.hide();

const selectedRect = new components.Rect;
selectedRect.colour = "rgba(0, 0, 0, 0.25)";
selectedRect.transform.set(0, 0);
engine.addObject(selectedRect);

const cursor1 = new components.Circle;
cursor1.radius = 10 * engine.camera.zoom;
engine.addObject(cursor1);
cursor1.moveTo(-50, -50);

const cursor2 = new components.Circle;
cursor2.radius = 10 * engine.camera.zoom;
engine.addObject(cursor2);
cursor2.moveTo(50, 50);

function copyTextToClipboard(text) {
	var textArea = document.createElement("textarea");
	textArea.value = text;
  
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
  
	try {
	  var successful = document.execCommand('copy');
	  var msg = successful ? 'successful' : 'unsuccessful';
	  console.log('Copying text command was ' + msg);
	} catch (err) {
	  console.log('Oops, unable to copy');
	}
  
	document.body.removeChild(textArea);
  }

keyboard.on(["control", "c"], () => {
	copyTextToClipboard(JSON.stringify({
		source: "<REPLACE_ME>",
		x: selectedRect.display.x,
		y: selectedRect.display.y,
		width: selectedRect.display.w,
		height: selectedRect.display.h
	}, null, 1).replace(/^ {1}/gm, "\t"));
})

function cursorCornersDragScript() {

	if (imageSize.equals(0, 0)) {
		cursor1.moveTo(0, 0);
		cursor2.moveTo(0, 0);
		cursor1.hide();
		cursor2.hide();
		selectedRect.hide();
		return;
	}

	let now = performance.now();

	let speed = 250;

	let r = Math.sin(now / speed) * 127 + 128;
    let g = Math.sin(now / speed + 2 * Math.PI / 3) * 127 + 128;
    let b = Math.sin(now / speed + 4 * Math.PI / 3) * 127 + 128;

    cursor1.colour = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
	cursor2.colour = cursor1.colour;
	selectedRect.outline.colour = cursor1.colour;

	cursor1.radius = 10 / engine.camera.zoom;
	cursor2.radius = 10 / engine.camera.zoom;
	selectedRect.outline.size = 10 / 4 / engine.camera.zoom;

	let canvasMouse = {
		x: mouse.position.relative(engine.canvas).x - engine.canvas.width/2,
		y: mouse.position.relative(engine.canvas).y - engine.canvas.height/2
	};

	canvasMouse.x /= engine.camera.zoom;
	canvasMouse.y /= engine.camera.zoom;

	canvasMouse.x += engine.camera.position.x;
	canvasMouse.y += engine.camera.position.y;

	canvasMouse.x = Math.round(canvasMouse.x);
	canvasMouse.y = Math.round(canvasMouse.y);

	if (
		cursor1.getAttribute("clicking") ||
		(
			canvasMouse.x > cursor1.display.x - cursor1.radius*2 &&
			canvasMouse.x < cursor1.display.x + cursor1.radius*2 &&
			canvasMouse.y > cursor1.display.y - cursor1.radius*2 &&
			canvasMouse.y < cursor1.display.y + cursor1.radius*2 &&
			!cursor2.getAttribute("clicking") && !selectedRect.getAttribute("clicking") &&
			mouse.click_l
		)
	) {
		cursor1.moveTo( Math.round(canvasMouse.x), Math.round(canvasMouse.y) );
		cursor1.setAttribute("clicking", mouse.click_l);
	}
	
	if (
		cursor2.getAttribute("clicking") ||
		(
			canvasMouse.x > cursor2.display.x - cursor2.radius*2 &&
			canvasMouse.x < cursor2.display.x + cursor2.radius*2 &&
			canvasMouse.y > cursor2.display.y - cursor2.radius*2 &&
			canvasMouse.y < cursor2.display.y + cursor2.radius*2 &&
			!cursor1.getAttribute("clicking") && !selectedRect.getAttribute("clicking") &&
			mouse.click_l
		)
	) {
		cursor2.moveTo( Math.round(canvasMouse.x), Math.round(canvasMouse.y) );
		cursor2.setAttribute("clicking", mouse.click_l);
	}
	
	if (
		selectedRect.getAttribute("clicking") ||
		(
			canvasMouse.x > selectedRect.display.x &&
			canvasMouse.x < selectedRect.display.x + selectedRect.display.w &&
			canvasMouse.y > selectedRect.display.y &&
			canvasMouse.y < selectedRect.display.y + selectedRect.display.h &&
			!cursor2.getAttribute("clicking") && !cursor1.getAttribute("clicking") &&
			mouse.click_l
		)
	) {
		selectedRect.moveTo(
			Math.round(canvasMouse.x - selectedRect.display.w/2),
			Math.round(canvasMouse.y - selectedRect.display.h/2)
		);
		
		cursor1.moveTo( selectedRect.display.x, selectedRect.display.y );
		cursor2.moveTo( selectedRect.display.x + selectedRect.display.w, selectedRect.display.y + selectedRect.display.h );

		selectedRect.setAttribute("clicking", mouse.click_l);
	}

	selectedRect.moveTo(Math.min(cursor1.display.x, cursor2.display.x), Math.min(cursor1.display.y, cursor2.display.y));
	selectedRect.setSize(Math.abs(cursor1.display.x - cursor2.display.x), Math.abs(cursor1.display.y - cursor2.display.y));

	let outputText = JSON.stringify(selectedRect.display, null, 5).replace(/^ {5}/gm, "<a style='margin-left: 1rem'></a>").replaceAll("\n", "<br>");
	output.innerHTML = outputText;
}

engine.preRenderingScript = cursorCornersDragScript;

document.ondrop = (ev) => {
	ev.preventDefault();
	let item = (ev.dataTransfer.items || ev.dataTransfer.files)[0];
	let file = item.getAsFile();

	let reader = new FileReader;

	reader.onload = function (e) {
		let dataUrl = e.target.result;

		let fakeImage = document.createElement("img");
		document.body.appendChild(fakeImage);
		fakeImage.style.display = "none";

		fakeImage.onload = () => {

			importedImage.setSourcePath(dataUrl);
			importedImage.transform.set(0, 0);
			imageSize.set(fakeImage.width, fakeImage.height);

			let scaleWidth = engine.canvas.width / imageSize.x;
			let scaleHeight = engine.canvas.height / imageSize.y;

			let scale = Math.min(scaleWidth, scaleHeight);

			engine.camera.zoom = scale*0.9;
			engine.camera.moveTo(imageSize.x/2, imageSize.y/2);

			cursor1.moveTo(0, 0);
			cursor2.moveTo(Math.round(imageSize.x), Math.round(imageSize.y));

			cursor1.show();
			cursor2.show();
			selectedRect.show();
			importedImage.show();
			input.hide();

			fakeImage.remove();
		}

		fakeImage.src = dataUrl;
	};

	reader.readAsDataURL(file);

}

document.ondragover = (e) => {
	e.preventDefault();
	input.content = "DROP IMAGE!!!";
}

importedImage.script = () => {
	importedImage.setSize(imageSize.x, imageSize.y);
}









class AnimationCompiler {
	#playback = "loop";
	#fps = 1;

	animations = new AnimationGenerator;

	/**
	 * @param {"loop"|"playonce"|"bounce"} playback 
	 */
	setPlayback(playback) {
		this.#playback = playback;
		return this;
	}
	/**
	 * @param {number} fps 
	 */
	setFPS(fps) {
		this.#fps = Math.round(fps);
		return this;
	}
	clear() {
		this.#playback = "loop";
		this.#fps = 1;
		this.animations = new AnimationGenerator;
		return this;
	}

	generate() {
		return {
			playback: this.#playback,
			fps: this.#fps,

			animations: this.animations.generate()
		}
	}
}

class AnimationGenerator {
	#timeline = {};
	/**
	 * 
	 * @param {string} name 
	 * @returns {AnimationTimelineGenerator}
	 */
	addTimeline(name) {
		let timeline = new AnimationTimelineGenerator;
		this.#timeline[name] = timeline;
		return timeline;
	}
	generate() {
		let generated = {};
		for (let i = 0; i < Object.keys(this.#timeline).length; i++) {
			let timelineName = Object.keys(this.#timeline)[i];
			let timelineData = this.#timeline[timelineName].generate();
			generated[timelineName] = timelineData;
		}
		return generated;
	}
}


class AnimationTimelineGenerator {
	#frames = [];

	/**
	 * 
	 * @param {{
	 *	source: ""
	 *	x: 0
	 *	y: 0
	 *	width: 0
	 *	height: 0
	 * }} data 
	 */
	addFrame(data) {
		this.#frames.push(data);
	}
	generate() {
		let generated = [];
		for (let i = 0; i < this.#frames.length; i++) {
			let frame = this.#frames[i];
			generated.push({
				source: frame.source,
				x: frame.x,
				y: frame.y,
				width: frame.width,
				height: frame.height
			})
		}
		return this.#frames;
	}

}

const animationJSON = new AnimationCompiler;
animationJSON.setPlayback("playonce");
animationJSON.setFPS(5);

let sleepTimeline = animationJSON.animations.addTimeline("sleep");

sleepTimeline.addFrame({
	"source": "./DEMO_assets/sleep.png",
	"x": 0,
	"y": 0,

	"width": 16,
	"height": 16
});

sleepTimeline.addFrame({
	"source": "./DEMO_assets/sleep.png",
	"x": 16,
	"y": 0,

	"width": 16,
	"height": 16
});

sleepTimeline.addFrame({
	"source": "./DEMO_assets/sleep.png",
	"x": 32,
	"y": 0,

	"width": 16,
	"height": 16
});

sleepTimeline.addFrame({
	"source": "./DEMO_assets/sleep.png",
	"x": 48,
	"y": 0,

	"width": 16,
	"height": 16
});

let lickTimeline = animationJSON.animations.addTimeline("lick");

lickTimeline.addFrame({
	"source": "./DEMO_assets/lick.png",
	"x": 0,
	"y": 0,

	"width": 16,
	"height": 16
});

lickTimeline.addFrame({
	"source": "./DEMO_assets/lick.png",
	"x": 16,
	"y": 0,

	"width": 16,
	"height": 16
});

lickTimeline.addFrame({
	"source": "./DEMO_assets/lick.png",
	"x": 32,
	"y": 0,

	"width": 16,
	"height": 16
});

lickTimeline.addFrame({
	"source": "./DEMO_assets/lick.png",
	"x": 48,
	"y": 0,

	"width": 16,
	"height": 16
});

let animationJSON_string = JSON.stringify(animationJSON.generate());