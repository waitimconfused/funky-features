import { keyboard } from "../toolbelt.js";

keyboard.on("b", () => {
	console.log("Pressing (b)");
}, { passive: true });

keyboard.off("b", () => {
	console.log("Not Pressing (b)");
}, { passive: true });

keyboard.on(["control", "b"], () => {
	console.log("Pressing (ctrl + b)");
});
keyboard.off(["control", "b"], () => {
	console.log("Not Pressing (ctrl + b)");
});