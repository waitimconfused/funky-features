import * as toolbelt from "./toolbelt.js";

function print(...msg) {
	msg = msg.join(" ");

	let messageElement = document.createElement("p");
	messageElement.innerText = msg;
	document.body.appendChild(messageElement);

	if(document.body.childElementCount > 10) {
		document.body.removeChild(document.body.firstChild);
	}

	console.log(msg);
}

let alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

alphabet.forEach((char) => {
	if(char == "r") return;
	if(char == "i") return;
	if(char == "w") return;
	toolbelt.keyboard.setKeybind(() => {
		print(`Keybind [control + ${char}] triggered`);
	}, [ "control", char ]);
});

var xboxController = toolbelt.controller.XBOX.fromIndex(0);

xboxController.on("buttonA", () => print("> Button (A) down!") );
xboxController.on("buttonB", () => print("> Button (B) down!") );
xboxController.on("buttonX", () => print("> Button (X) down!") );
xboxController.on("buttonY", () => print("> Button (Y) down!") );

xboxController.on("buttonView", () => print("> Button (View) down!") );
xboxController.on("buttonMenu", () => print("> Button (Menu) down!") );

xboxController.on("bumperL", () => print("> Bumper (L) down!") );
xboxController.on("bumperR", () => print("> Bumper (R) down!") );


xboxController.on("triggerL", () => print("> Trigger (L) down!") );
xboxController.on("triggerR", () => print("> Trigger (R) down!") );


xboxController.on("dpadUp", () => print("> Dpad (U) down!") );
xboxController.on("dpadDown", () => print("> Dpad (D) down!") );
xboxController.on("dpadLeft", () => print("> Dpad (L) down!") );
xboxController.on("dpadRight", () => print("> Dpad (R) down!") );

xboxController.on("joystickClickL", () => print("> Joystick click (L) down!") );
xboxController.on("joystickClickR", () => print("> Joystick click (R) down!") );


xboxController.off("buttonA", () => print("> Button (A) up!") );
xboxController.off("buttonB", () => print("> Button (B) up!") );
xboxController.off("buttonX", () => print("> Button (X) up!") );
xboxController.off("buttonY", () => print("> Button (Y) up!") );

xboxController.off("buttonView", () => print("> Button (View) up!") );
xboxController.off("buttonMenu", () => print("> Button (Menu) up!") );

xboxController.off("bumperL", () => print("> Bumper (L) up!") );
xboxController.off("bumperR", () => print("> Bumper (R) up!") );


xboxController.off("triggerL", () => print("> Trigger (L) up!") );
xboxController.off("triggerR", () => print("> Trigger (R) up!") );


xboxController.off("dpadUp", () => print("> Dpad (U) up!") );
xboxController.off("dpadDown", () => print("> Dpad (D) up!") );
xboxController.off("dpadLeft", () => print("> Dpad (L) up!") );
xboxController.off("dpadRight", () => print("> Dpad (R) up!") );

xboxController.off("joystickClickL", () => print("> Joystick click (L) up!") );
xboxController.off("joystickClickR", () => print("> Joystick click (R) up!") );