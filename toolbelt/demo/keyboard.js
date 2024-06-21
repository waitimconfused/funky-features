import { keyboard } from "../toolbelt.js";

keyboard.on("b", () => {
	console.log("You pressed (b)");
}, { passive: true });
keyboard.off("b", () => {
	console.log("You unpressed (b)");
});

keyboard.on(["control", "b"], () => {
	console.log("You pressed (ctrl + b)");
});