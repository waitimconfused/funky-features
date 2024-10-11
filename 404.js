import { mouse } from "./toolbelt/toolbelt.js";
import { engine, Component, ComponentGroup } from "./game-engine/utils.js";
import { Circle, Path, Rect, Text } from "./game-engine/components/index.js";

engine.setFavicon("https://confusion.inputoverload.com/assets/favicon.png");
engine.background = "#e0e0e0";
engine.camera.zoom = 20;
await engine.loadAsset("https://fonts.googleapis.com/css2?family=Micro+5&display=swap");
// engine.loadAsset("https://fonts.gstatic.com/s/micro5/v1/H4cnBX2MkcfEngTr4n0a7YO5.woff2", { fontFamilyName: "WASD" });
const zerozero = new Circle;
engine.addObject(zerozero);
zerozero.radius = 1;

engine.addObject(
	(new Rect)
	.setSize(45, 12)
	.setColour("#1B001F")
	.setTransform(0, 0),

	(new Path)
	.setColour("#FFFFFF")
	.pen.setPath("M0 0H1V1H2V2H3V3H2V4H1V5H0V4H1V3H2V2H1V1H0V0Z")
	.moveTo(2, 5),

	(new Text)
	.setContent("TECH")
	.setFontFamily("WASD")
	.setTextBaseLine("top")
	.setTextAlign("left")
	.setColour("#4E3381")
	.setTextSize(11)
	.moveTo(6, 2.06),

	(new Text)
	.setContent("CREW")
	.setFontFamily("WASD")
	.setTextBaseLine("top")
	.setTextAlign("left")
	.setColour("#FFFFFF")
	.setTextSize(11)
	.moveTo(21, 2.06),

	(new Rect)
	.setSize(4, 1)
	.setColour("#FFFFFF")
	.setTransform(0, 0)
	.moveTo(39, 9),

	(new Rect)
	.setSize(45, 3)
	.setColour("#130115")
	.setTransform(0, 0),

	(new Rect)
	.setSize(3, 1)
	.setColour("#8E2B2B")
	.setTransform(0, 0)
	.moveTo(1, 1),

	(new Rect)
	.setSize(3, 1)
	.setColour("#D7BE1B")
	.setTransform(0, 0)
	.moveTo(5, 1),

	(new Rect)
	.setSize(3, 1)
	.setColour("#28AF07")
	.setTransform(0, 0)
	.moveTo(9, 1)
)