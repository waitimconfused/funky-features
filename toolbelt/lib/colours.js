export class HEXcolour {
	value = "#FFFFFF";

	/** @param {string} colour */
	constructor(colour) {
		this.value = `${colour}`;
	}

	/**
	 * @returns {{
	 * 	r: number | undefined,
	 * 	g: number | undefined,
	 * 	b: number | undefined
	 * }}
	 */
	toRGB() {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.value);
		if (!result) return { r: undefined, g: undefined, b: undefined };
		let r = parseInt(result[1], 16);
		let g = parseInt(result[2], 16);
		let b = parseInt(result[3], 16);
		return { r, g, b };
	}
	
	/**
	 * @returns {{
	 * 	h: number | undefined,
	 * 	s: number | undefined,
	 * 	l: number | undefined
	 * }}
	 */
	toHSL() {
		// Convert hex to RGB first
		let { r, g, b } = this.toRGB();
		if (r == undefined || g == undefined || b == undefined) {
			return { h: undefined, s: undefined, l: undefined }
		}
		// Then to HSL
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b);
		let cmax = Math.max(r, g, b);
		let delta = cmax - cmin;
		let h = 0;
		let s = 0;
		let l = 0;

		if (delta == 0) h = 0;
		else if (cmax == r) h = ((g - b) / delta) % 6;
		else if (cmax == g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		if (h < 0) h += 360;

		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return { h, s, l };
	}
}

export class RGBcolour {
	value = { r: 255, g: 255, b: 255 };

	/**
	 * @param {number} r
	 * @param {number} g
	 * @param {number} b
	 */
	constructor(r, g, b) {
		this.value = { r, g, b };
	}

	toHEX() {
		let r = this.value.r.toString(16).padStart(2, "0");
		let g = this.value.g.toString(16).padStart(2, "0");
		let b = this.value.b.toString(16).padStart(2, "0");
		let hex = "#" + [r, g, b].join("");
		hex = hex.toUpperCase();
		return hex;
	}

}