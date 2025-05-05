import { keyboard, mouse, Database } from "./index.js";

mouse.preventContextMenu = true;
mouse.preventScroll = true;

const mouseDot = document.getElementById("mouse-cursor");

mouse.on("move", () => {
	mouseDot.style.top = mouse.y + "px";
	mouseDot.style.left = mouse.x + "px";
});

mouse.on("lclick", () => {
	mouseDot.style.setProperty("--r", "255");
});

mouse.off("lclick", () => {
	mouseDot.style.setProperty("--r", "0");
});


mouse.on("rclick", () => {
	mouseDot.style.setProperty("--g", "255");
});

mouse.off("rclick", () => {
	mouseDot.style.setProperty("--g", "0");
});


mouse.on("wclick", () => {
	mouseDot.style.setProperty("--b", "255");
});

mouse.off("wclick", () => {
	mouseDot.style.setProperty("--b", "0");
});