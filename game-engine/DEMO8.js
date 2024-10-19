import { engine } from "./utils.js";
import { Path, Circle, Image, Text, Rect } from "./components/index.js";
import { Point2, Point4 } from "./points.js";
import { isInRange, Vector } from "../toolbelt/toolbelt.js";

// engine.camera.zoom = 100;
// engine.camera.defaultZoom = engine.camera.zoom;
// engine.isPixelArt = true;
engine.camera.maxZoom = Infinity;


engine.loadAsset("https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap");
engine.loadAsset("https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap");
engine.loadAsset("https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap");
engine.loadAsset("https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap");
engine.loadAsset("https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap");
engine.loadAsset("https://fonts.gstatic.com/s/jetbrainsmono/v20/tDbX2o-flEEny0FZhsfKu5WU4xD-Cw6nSHrV.woff2");
const pi = Math.PI;
const abs = Math.abs;
const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;
const asin = Math.asin;
const acos = Math.acos;
const atan = Math.atan;

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
demoLable.content = "// Rotation\ncomponent.rotation = <deg>";
demoLable.textSize = 30;
demoLable.colour = "black";
demoLable.outline.colour = "white";
demoLable.outline.size = 10;
engine.addObject(demoLable);
demoLable.script = () => {
	let isIntersecting = player.display.intersectingWith(immovableBlock.display);
	demoLable.content = "var intersecting = " + isIntersecting + ";";
	demoLable.moveTo(10, engine.height - demoLable.display.h);
}