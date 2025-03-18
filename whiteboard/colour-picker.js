import * as tb from "../toolbelt/toolbelt.js";

const colourPicker = document.getElementById("colour-picker");
const colourPickerHandle = document.body.querySelector("#colour-picker .popup-options .drag");
const colourPickerCollapseButton = document.body.querySelector("#colour-picker .popup-options .minimize-button");
const satLight = document.body.querySelector(`#colour-picker .sat-light`);
const satLightHandle = document.body.querySelector(`#colour-picker .sat-light .handle`);
const hue = document.body.querySelector(`#colour-picker .hue input`);
const colourCode = document.body.querySelector(`#colour-picker .colour-code`);
const colourCodeSelector = document.body.querySelector(`#colour-picker .colour-code-selector`);
const actionCopy = document.body.querySelector(`#colour-picker .actions .copy`);
const actionEyedropper = document.body.querySelector(`#colour-picker .actions .eye-dropper`);
const actionPreview = document.body.querySelector(`#colour-picker .actions .preview`);

actionEyedropper.onclick = () => {
	new EyeDropper().open().then(e => {
		let colour = e.sRGBHex;
		colourPicker.setAttribute("value", colour);
	});
}

colourPickerCollapseButton.addEventListener("keydown", (e) => {
	if (e.key != " ") return;

	colourPicker.classList.toggle("minimized");
	putColourPickerInScreen();
});

colourCodeSelector.addEventListener("click", () => {
	let lable = colourCodeSelector.querySelector("small");
	let options = lable.getAttribute("data-options").split(",");
	let optionIndex = options.indexOf(lable.innerText);
	optionIndex += 1;
	optionIndex %= options.length;
	lable.innerText = options[optionIndex];
	update();
});

hue.addEventListener("change", updateHue);
hue.addEventListener("input", updateHue);

actionCopy.addEventListener("click", () => {
	navigator.clipboard.writeText(colourPicker.getAttribute("value"));
});

satLight.addEventListener("pointerdown", move);
document.documentElement.addEventListener("pointermove", move);

colourPickerCollapseButton.addEventListener("click", () => {
	colourPicker.classList.toggle("minimized");
});

update();

function move(e) {
	if (satLight.matches(":hover") == false) return;
	if (tb.mouse.click_l == false && tb.mouse.pen.pressure == 0) return;
	let mousePos = tb.mouse.position.relative(satLight);
	let x = tb.Range.clamp(0, mousePos.x, 200);
	let y = tb.Range.clamp(0, mousePos.y, 200);

	satLightHandle.style.top = y + "px";
	satLightHandle.style.left = x + "px";

	update();
}

function updateHue() {
	satLight.style.backgroundColor = `hsl(${hue.value}deg 100% 50%)`;
	update();
}

function update() {
	let mode = colourCodeSelector.querySelector("small").innerText.toLowerCase();
	let x = parseInt(satLightHandle.style.left.replace(/[^0-9\.]/g, ""));
	let y = parseInt(satLightHandle.style.top.replace(/[^0-9\.]/g, ""));

	x = isNaN(x) ? 200 : Math.round(x);
	y = isNaN(y) ? 0 : Math.round(y);

	let hsv_value = 1 - (y / 200);
	let hsv_saturation = x / 200;

	let lightness = (hsv_value / 2) * (2 - hsv_saturation);
	let saturation = (hsv_value * hsv_saturation) / (1 - Math.abs(2 * lightness - 1));
	saturation = isNaN(saturation) ? 1 : saturation;

	let hsl = [hue.value / 360, saturation, lightness];
	let rgb = hslToRGB(hsl[0], hsl[1], hsl[2]);
	let hex = hslToHex(hsl[0] * 360, hsl[1] * 100, hsl[2] * 100).toUpperCase();

	let colour = "undefined";

	if (mode == "rgb") {
		colour = `rgb(${rgb.join(", ")})`;
	} else if (mode == "hsl") {
		colour = `hsl(${Math.round(hsl[0] * 360)}deg, ${Math.round(hsl[1] * 100)}%, ${Math.round(hsl[2] * 100)}%)`;
	} else if (mode == "hex") {
		colour = hex;
	}

	colourPicker.setAttribute("value", colour);

	colourCode.value = colour.replace(/^\w+\(|deg|%|\)$/g, "");
	satLightHandle.style.backgroundColor = colour;
	document.documentElement.style.setProperty('--colour-input-hue-selector-fill', `hsl(${Math.round(hsl[0] * 360)}deg, 100%, 50%)`);
	actionPreview.style.backgroundColor = colour;
}

colourCode.addEventListener("input", () => {
	console.log(colourCode.value);
});

function hslToRGB(h, s, l) {
	let r, g, b;

	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		let p = 2 * l - q;
		r = hueToRgb(p, q, h + 1 / 3);
		g = hueToRgb(p, q, h);
		b = hueToRgb(p, q, h - 1 / 3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];

	function hueToRgb(p, q, t) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	}
}

function hslToHex(hue, saturation, lightness) {
	lightness /= 100;
	let a = saturation * Math.min(lightness, 1 - lightness) / 100;
	function f(n) {
		let k = (n + hue / 30) % 12;
		let colour = lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * colour).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
	}
	return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

	var r = parseInt(result[1], 16);
	var g = parseInt(result[2], 16);
	var b = parseInt(result[3], 16);

	r /= 255, g /= 255, b /= 255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}

	s = s * 100;
	s = Math.round(s);
	l = l * 100;
	l = Math.round(l);
	h = Math.round(360 * h);

	return [h, s, l]
}