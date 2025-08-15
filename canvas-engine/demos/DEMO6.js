import { Engine } from "../utils.js";
import { Text, Rect } from "../components.js";

const engine = new Engine;

engine.fullscreen = true;
engine.camera.maxZoom = Infinity;
engine.camera.canZoom = true;
engine.camera.canPan = true;

engine.loadAsset("https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap");
engine.loadAsset("https://fonts.gstatic.com/s/jetbrainsmono/v20/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw6nSHrV.woff2");

const immovableBlock = new Rect;
immovableBlock.display.set(0, 0, 100, 200);
engine.addObject(immovableBlock);

const player = new Rect;
engine.addObject(player);
player.colour = "orange";
player.moveTo(-150, 0);
// player.rotation = 45;
player.script = () => {
	let mouse = engine.mouse.toWorld();
	player.moveTo( Math.round(mouse.x), Math.round(mouse.y) );
}

const demoLable = new Text;
demoLable.fixedPosition = true;
demoLable.textAlign = "left";
demoLable.textBaseLine = "bottom";
demoLable.fontFamily = "JetBrains Mono";
demoLable.content = "var intersecting;";
demoLable.fontSize = 30;
demoLable.colour = "black";
demoLable.outline.colour = "white";
demoLable.outline.size = 10;
engine.addObject(demoLable);
demoLable.script = () => {
	let isIntersecting = player.display.intersectingWith(immovableBlock.display);
	demoLable.content = "// rect.display.intersectingWith\nvar intersecting = " + isIntersecting + ";";
	demoLable.moveTo(10, engine.height - demoLable.display.h);
}