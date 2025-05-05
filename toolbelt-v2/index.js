import { Colour } from "./lib/Colour.js";
import { DefaultController, XboxController } from "./lib/Controller.js";
import { TBDatabase } from "./lib/Database.js";
import { files } from "./lib/Files.js";
import { range, round } from "./lib/Range.js";
import { Vector } from "./lib/Vector.js";

import { keyboard } from "./lib/Keyboard.js";
import { mouse } from "./lib/Mouse.js";

import { CustomMenu } from "./lib/CustomMenu.js";

window.toolbelt = {
	keyboard, mouse,
	DefaultController, XboxController,
	Database: TBDatabase,
	Colour, Color: Colour,
	range, round, Vector,
	files,
	CustomMenu
}

export {
	keyboard, mouse,
	DefaultController, XboxController,
	TBDatabase as Database,
	Colour, Colour as Color,
	range, round,
	Vector,
	files,
	CustomMenu
};