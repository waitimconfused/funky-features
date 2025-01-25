import * as components from "../components.js";
import { engine } from "../utils.js";

let kinds = Object.keys(components);

console.log(...kinds);

for (let i = 0; i < kinds.length; i ++) {
	let kind = kinds[i];
	let object = new components[kind];
	engine.addObject(object);

	object.moveTo(i * 100, 0);

	if (object?.radius) {
		object.radius = 50;
	} else {
		object.setSize(100, 100);
	}

	let label = new components.Text;
	engine.addObject(label);
	label.moveTo(i * 100, 100);
	label.content = `Type: "${kind}"`;
	label.fontSize = 16
	label.rotation = 45;
}