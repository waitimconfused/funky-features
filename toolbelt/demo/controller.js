import * as toolbelt from "../toolbelt.js";

var controller = new toolbelt.Controller;
controller.applyLayout("Xbox");

controller.on("XYZ", () => {});

controller.while("buttonA", (value) => {
	document.getElementById("buttonA").style.fill = `rgba(0, 0, 0, ${value})`;
});
controller.while("buttonB", (value) => {
	document.getElementById("buttonB").style.fill = `rgba(0, 0, 0, ${value})`;
});
controller.while("buttonX", (value) => {
	document.getElementById("buttonX").style.fill = `rgba(0, 0, 0, ${value})`;
});
controller.while("buttonY", (value) => {
	document.getElementById("buttonY").style.fill = `rgba(0, 0, 0, ${value})`;
});

controller.while("buttonView", (value) => {
	document.getElementById("buttonView").style.fill = `rgba(0, 0, 0, ${value})`;
	if(!value) document.getElementById("buttonView").style.fill = "";
});
controller.while("buttonMenu", (value) => {
	document.getElementById("buttonMenu").style.fill = `rgba(0, 0, 0, ${value})`;
});

controller.while("bumperL", (value) => {
	document.getElementById("bumperL").style.fill = `rgba(0, 0, 0, ${value})`;
});
controller.while("bumperR", (value) => {
	document.getElementById("bumperR").style.fill = `rgba(0, 0, 0, ${value})`;
});

controller.while("dpadUp", (value) => {
	document.getElementById("dpadUp").style.fill = `rgba(0, 0, 0, ${value})`;
});
controller.while("dpadDown", (value) => {
	document.getElementById("dpadDown").style.fill = `rgba(0, 0, 0, ${value})`;
});
controller.while("dpadLeft", (value) => {
	document.getElementById("dpadLeft").style.fill = `rgba(0, 0, 0, ${value})`;
});
controller.while("dpadRight", (value) => {
	document.getElementById("dpadRight").style.fill = `rgba(0, 0, 0, ${value})`;
});

controller.while("joystickClickL", (value) => {
	document.getElementById("joystickL").style.fill = `rgba(0, 0, 0, ${value})`;
});
controller.while("joystickClickR", (value) => {
	document.getElementById("joystickR").style.fill = `rgba(0, 0, 0, ${value})`;
});



controller.while("triggerL", (value) => {
	document.getElementById("triggerL").style.fill = `rgb(0, 0, 0, ${value})`;
});
controller.while("triggerR", (value) => {
	document.getElementById("triggerR").style.fill = `rgb(0, 0, 0, ${value})`;
});

controller.while("joystickL", (joystick={x:0,y:0}) => {
	document.getElementById("joystickL").style.translate = `${joystick.x * 20}px ${joystick.y * 20}px`;
});
controller.while("joystickR", (joystick={x:0,y:0}) => {
	document.getElementById("joystickR").style.translate = `${joystick.x * 20}px ${joystick.y * 20}px`;
});