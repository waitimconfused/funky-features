export const range = new class TBRange {

	/**
	 * 
	 * @param {number} min
	 * @param {number} number
	 * @param {number} max
	 * @returns {number}
	 */
	clamp(min, number, max) {
		return Math.max(Math.min(number, max), min);
	}

	/**
	 * Detect if any number is within the range [min, max]
	 * @param {number} min
	 * @param {number} number
	 * @param {number} max
	 * @returns  {boolean}
	 */
	fits(min, number, max) {
		return number >= min && number <= max;
	}

	/**
	 * Returns a random number in the range [min, max]
	 * @param {number} min
	 * @param {number} max
	 * @param {?boolean} asInt
	 * @returns {number}
	 */
	random(min, max, asInt) {
		let value = Math.random() * (max - min) + min;
		if (asInt) value = Math.round(value);
		return value;
	}

	/**
	 * Returns the sine of a number, scaled to fit range
	 * @param {number} min
	 * @param {number} max
	 * @param {number} number
	 * @returns {number}
	 */
	sin(min, max, number) {
		if (min > max) max = [min, min = max][0];

		let scale = Math.abs( (max-min) / 2 );
		let offset = (max+min)/2;
		return scale * Math.sin(number) + offset;
	}

	/**
	 * Returns the cosine of a number, scaled to fit range
	 * @param {number} min
	 * @param {number} max
	 * @param {number} number
	 * @returns {number}
	 */
	cos(min, max, number) {
		if (min > max) max = [min, min = max][0];

		let scale = Math.abs( (max-min) / 2 );
		let offset = (max+min)/2;
		return scale * Math.cos(number) + offset;
	}
}

export const round = new class TBRound {

	round = Math.round;
	floor = Math.floor;
	ceil = Math.ceil;

	roundToNearest(number=3.14, step=1) {
		let rounded = Math.round(number / step) * step;
		if (`${rounded}`.includes(".")) {
			let step_decimalNumbers = `${step}`.replace(/(\d*)\./, "").length;
			rounded = rounded.toFixed(step_decimalNumbers)
		}
		return rounded;
	}
	
	floorToNearest(number = 3.14, nearest = 1) {
		let rounded = Math.floor(number / step) * step;
		if (`${rounded}`.includes(".")) {
			let step_decimalNumbers = `${step}`.replace(/(\d*)\./, "").length;
			rounded = rounded.toFixed(step_decimalNumbers)
		}
		return rounded;
	}
	
	ceilToNearest(number = 3.14, nearest = 1) {
		let rounded = Math.ceil(number / step) * step;
		if (`${rounded}`.includes(".")) {
			let step_decimalNumbers = `${step}`.replace(/(\d*)\./, "").length;
			rounded = rounded.toFixed(step_decimalNumbers)
		}
		return rounded;
	}
}