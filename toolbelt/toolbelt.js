export * from "./lib/keyboard.js";
export * as image from "./lib/image.js";
export * as controller from "./lib/controller.js";
export * as device from "./lib/device.js";
export * as canvas from "./lib/canvas.js";

export function toRange(min=0, value=0.5, max=1) {
	return Math.max( Math.min(value, max), min );

}
export function isInRange(min=0, value=0.5, max=1) {
	return value >= min && value <= max;
}

export function roundToNearest(number=3.14, nearest=1) {
	return Math.round(number / nearest) * nearest;
}