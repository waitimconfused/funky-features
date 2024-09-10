import { engine } from "./utils.js";
import { Path } from "./components/index.js";
import { toRange } from "../toolbelt/toolbelt.js";

engine.camera.zoom = 1;

engine.camera.minZoom = 0.1;
engine.camera.maxZoom = 10;

engine.camera.moveTo(2, 0);

const leg = new Path;
leg.fixedPosition = false;
engine.addObject(leg);
leg.outline.size = 10;
leg.outline.colour = "black";
leg.colour = "none";

let jointStart = { x: 0, y: 0 };
let joints = [];
let jointCount = 3;

for (let i = 0; i < jointCount; i ++) {
	joints.push({x: Math.random()*100-50, y: Math.random()*100-50});
}

engine.preRenderingScript = () => {
	let jointEnd = engine.mouse.toWorld();
	leg.clearPath();
	leg.pen.moveTo(jointStart);
	
	for (let i = 0; i < jointCount; i ++) {
		let joint = joints[i];
		leg.pen.lineTo(joint);
	}

	leg.pen.lineTo(jointEnd);
}