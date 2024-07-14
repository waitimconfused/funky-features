import * as toolbelt from "../toolbelt.js";
toolbelt.controller.initialize();

var xboxController = toolbelt.controller.XBOX.fromIndex(0);

xboxController.while("buttonA", (value) => {
	document.getElementById("buttonA").style.fill = `rgba(0, 0, 0, ${value})`;
});
xboxController.while("buttonB", (value) => {
	document.getElementById("buttonB").style.fill = `rgba(0, 0, 0, ${value})`;
});
xboxController.while("buttonX", (value) => {
	document.getElementById("buttonX").style.fill = `rgba(0, 0, 0, ${value})`;
});
xboxController.while("buttonY", (value) => {
	document.getElementById("buttonY").style.fill = `rgba(0, 0, 0, ${value})`;
});

xboxController.while("buttonView", (value) => {
	document.getElementById("buttonView").style.fill = `rgba(0, 0, 0, ${value})`;
	if(!value) document.getElementById("buttonView").style.fill = "";
});
xboxController.while("buttonMenu", (value) => {
	document.getElementById("buttonMenu").style.fill = `rgba(0, 0, 0, ${value})`;
});

xboxController.while("bumperL", (value) => {
	document.getElementById("bumperL").style.fill = `rgba(0, 0, 0, ${value})`;
});
xboxController.while("bumperR", (value) => {
	document.getElementById("bumperR").style.fill = `rgba(0, 0, 0, ${value})`;
});

xboxController.while("dpadUp", (value) => {
	document.getElementById("dpadUp").style.fill = `rgba(0, 0, 0, ${value})`;
});
xboxController.while("dpadDown", (value) => {
	document.getElementById("dpadDown").style.fill = `rgba(0, 0, 0, ${value})`;
});
xboxController.while("dpadLeft", (value) => {
	document.getElementById("dpadLeft").style.fill = `rgba(0, 0, 0, ${value})`;
});
xboxController.while("dpadRight", (value) => {
	document.getElementById("dpadRight").style.fill = `rgba(0, 0, 0, ${value})`;
});

xboxController.while("joystickClickL", (value) => {
	document.getElementById("joystickL").style.fill = `rgba(0, 0, 0, ${value})`;
});
xboxController.while("joystickClickR", (value) => {
	document.getElementById("joystickR").style.fill = `rgba(0, 0, 0, ${value})`;
});



xboxController.while("triggerL", (value) => {
	document.getElementById("triggerL").style.fill = `rgb(0, 0, 0, ${value})`;
});
xboxController.while("triggerR", (value) => {
	document.getElementById("triggerR").style.fill = `rgb(0, 0, 0, ${value})`;
});

xboxController.while("joystickL", (joystick={x:0,y:0}) => {
	document.getElementById("joystickL").style.translate = `${joystick.x * 20}px ${joystick.y * 20}px`;
});
xboxController.while("joystickR", (joystick={x:0,y:0}) => {
	document.getElementById("joystickR").style.translate = `${joystick.x * 20}px ${joystick.y * 20}px`;
});