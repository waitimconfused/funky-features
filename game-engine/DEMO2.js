import { ComponentGroup, engine } from "./utils.js";
import * as components from "./components/index.js";
import * as toolbelt from "../toolbelt/toolbelt.js";

engine.setBackground("black");
engine.setIcon("./DEMO_assets/sit.png");
engine.disableZoom();

class DialogueBubble {
	icon = new components.Image;
	text = new components.Text;

	group = new ComponentGroup;

	constructor() {
		this.group.addObject(this.icon);
		this.group.addObject(this.text);
		engine.addObject(this.group);
		engine.addObject(this.text);
	}
}
var dialogueBubble = new DialogueBubble;

var dialogueBubbleIconPaths = [
	"./DEMO_assets/2/elephant-idle.png",
	"./DEMO_assets/2/elephant-awe.png",
	"./DEMO_assets/2/elephant-brows_down.png",
	"./DEMO_assets/2/elephant-brows_up.png",
	"./DEMO_assets/2/elephant-cry.png",
	"./DEMO_assets/2/elephant-eyes_down.png",
	"./DEMO_assets/2/elephant-eyes_up.png"
];

dialogueBubbleIconPaths.forEach((source) => {
	engine.loadAsset(source);
});

dialogueBubble.icon.setSourcePath(dialogueBubbleIconPaths[0]);
dialogueBubble.icon.setSize(591, 591);
dialogueBubble.icon.transform.set(0, 0);
dialogueBubble.icon.script = function() {

	let mouseX = toolbelt.mouse.position.relative(engine.canvas).x;
	let index = Math.floor(mouseX / engine.canvas.width * dialogueBubbleIconPaths.length );
	let path = dialogueBubbleIconPaths[index];

	dialogueBubble.icon.setSourcePath(path);
	dialogueBubble.text.content = dialogueBubbleIconPaths[index].replace(/.\/DEMO_assets\/2\/elephant-|\.png/g, "").toUpperCase();
}

dialogueBubble.text.moveTo(0, 0);
dialogueBubble.text.textSize = "50px";
dialogueBubble.text.styling = "bold";
dialogueBubble.text.textBaseLine = "top";
dialogueBubble.text.color = "#304c9a";