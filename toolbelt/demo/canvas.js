import * as toolbelt from "../toolbelt.js";

const canvas = (new toolbelt.canvas.Canvas)
	.enableSprites()
	.position("fixed")
	.moveTo(0, 0)
	.setSize("100%", "100%");

const sprite = new toolbelt.canvas.Rect;
sprite.moveTo(0, 0);
sprite.setSize(100, 100);

sprite.script = () => {
	let mouse = toolbelt.mouse.position.relative(canvas.dom);
	sprite.moveTo(mouse.x, mouse.y);
}