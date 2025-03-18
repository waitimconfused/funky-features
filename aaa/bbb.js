import { mouse, Range } from "../toolbelt/toolbelt.js";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const s60 = Math.sin(60 * (Math.PI / 180));
const s30 = Math.sin(30 * (Math.PI / 180));

const imageTop = new Image;
imageTop.src = "./red_tile.png";

const leftSide = new Image;
leftSide.src = "./green_tile.png";

const rightSide = new Image;
rightSide.src = "./blue_tile.png";


var rotation = 0;

var cameraPos = { x: 0, y: 0 };

var zoom = 10;

function rad(deg) {
	return deg * Math.PI / 180;
}

const topTransform = [0.9, 0.5, -0.9, 0.5, 0, -16];
const leftTransform = [-0.9, -0.5, 0, 1, 0, 0];
const rightTransform = [0.9, -0.5, 0, 1, 0, 0];

var blocks = [
	{ x: 0, y: 0, z: 0 },
	// {x: 1, y: 0, z: 0},
	// {x: 2, y: 0, z: 0},

	// {x: 0, y: 2, z: 0},
	// {x: 1, y: 2, z: 0},
	// {x: 2, y: 2, z: 0},

	// {x: 0, y: 1, z: 0},
	// {x: 1, y: 1, z: 0},
	// {x: 2, y: 1, z: 0},
];

function tick() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.imageSmoothingEnabled = false;

	if (!imageTop.complete || !leftSide.complete || !rightSide.complete) {
		window.requestAnimationFrame(tick);
		return;
	}

	blocks.sort((block1, block2) => {
		return block1.y - block2.y || block1.x - block2.x || block1.z - block2.z;
	});

	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i];
		renderBlock(block.x, block.y, block.z);
	}

	ctx.save();
	ctx.fillStyle = "red";
	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.scale(zoom, zoom);
	ctx.arc(0, 0, 1, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();

	// rotation = Math.sin( performance.now() / 5000 ) * Math.PI;

	window.requestAnimationFrame(tick);
}
tick();

function renderBlock(x, y, z) {

	let M = topTransform;

	y -= z;
	x -= z;

	x *= 16;
	y *= 16;

	let isoX = M[0] * x + M[4] + M[2] * y;
	let isoY = M[3] * y + M[5] + M[1] * x;


	// (M[0]x, M[3]y) + (M[4], M[5]) + (M[2]y, M[1]x )

	ctx.save();
	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.scale(zoom, zoom);
	ctx.translate(-cameraPos.x, -cameraPos.y);
	ctx.translate(isoX, isoY);
	ctx.transform(...topTransform);
	ctx.drawImage(imageTop, 0, 0, 16, 16);
	ctx.restore();


	ctx.save();
	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.scale(zoom, zoom);
	ctx.translate(isoX, isoY);
	ctx.translate(-cameraPos.x, -cameraPos.y);
	ctx.transform(...leftTransform);
	ctx.drawImage(leftSide, 0, 0, 16, 16);
	ctx.restore();

	ctx.save();
	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.scale(zoom, zoom);
	ctx.translate(isoX, isoY);
	ctx.translate(-cameraPos.x, -cameraPos.y);
	ctx.transform(...rightTransform);
	ctx.drawImage(rightSide, 0, 0, 16, 16);
	ctx.restore();
}


function customZoomEvent(e) {

	if (e instanceof WheelEvent) {
		if (e.ctrlKey) {
			e.preventDefault();

			zoom -= e.deltaY * 0.01 * zoom / 2;
			// this.zoom = Range.clamp(this.minZoom, this.zoom, this.maxZoom);
		} else {
			e.preventDefault();

			cameraPos.x += e.deltaX / zoom;
			cameraPos.y += e.deltaY / zoom;
		}
	} else if (e instanceof KeyboardEvent) {
		if (!e.ctrlKey) return;

		let scale = null;

		if (["+", "="].includes(e.key)) scale = 1;
		if (["-", "_"].includes(e.key)) scale = -1;
		if (["0"].includes(e.key)) scale = 0.0;

		if (scale != null) e.preventDefault(); else return;
		if (e.repeat) return;

		zoom += scale * 0.1;
		if (["0"].includes(e.key)) {
			cameraPos.x = 0;
			cameraPos.y = 0;
			zoom = 10;
		}
		// this.zoom = Range.clamp(this.minZoom, this.zoom, this.maxZoom);
	}

}

window.addEventListener("wheel", customZoomEvent, { passive: false });
window.addEventListener("keydown", customZoomEvent);




const credInit = {
	id: "1234",
	name: "Serpentina",
	origin: "https://example.org",
	password: "the last visible dog",
};

document.onclick = async () => {
	const cred = await navigator.credentials.create({
		password: credInit,
	});
	console.log(cred.name);
	// Serpentina
	console.log(cred.password);
	// the last visible dog

	document.onclick = () => {};
};

navigator.credentials.get