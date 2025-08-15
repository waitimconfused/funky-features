const variables = {
	"x": 3,
	"y": 10,
	"true": 1,
	"false": 0,
};

console.log("VARIABLES:")
for (let key in variables) console.log("    ",key, "=", variables[key]);
console.log("");

class MathExpression {
	/** @type {number|MathExpression} */
	left = 0;
	/** @type {"+"|"-"|"*"|"/"|"^"} */
	operator = "+";
	/** @type {number|MathExpression} */
	right = 0;

	constructor(operator, left, right) {
		this.operator = operator;
		this.left = left;
		this.right = right;

	}

	/** @returns {MathExpression} */
	static fromString(string) {
		let tokens = string.match(/[\w.]+|[-+*=/^()]/g);
		return MathExpression.#parse(tokens);
	}

	static #parse(tokens) {
		let index = 0;

		function parsePrimary() {
			let token = tokens[index++];
			if (token === "(") {
				let node = parseAdditionSubtraction();
				index++; // consume ")"
				return node;
			} else if (!isNaN(token)) {
				return parseFloat(token);
			} else if (/[a-zA-Z][\w]?/.test(token))return token;
			throw new Error("Unexpected token: " + token);
		}

		function parseUnary() {
			if (tokens[index] == "-" || tokens[index] == "+") {
				let operator = tokens[index++];
				return new MathExpression(
					operator,
					0,
					parsePrimary()
				);
			}
			return parsePrimary();
		}

		function parseExponentiation() {
			let left = parseUnary();
			while (index < tokens.length && tokens[index] == "^") {
				let operator = tokens[index++];
				left = new MathExpression(
					operator,
					left,
					parseUnary()
				);
			}
			return left;
		}

		function parseMultiplicationDivision() {
			let left = parseExponentiation();
			while (index < tokens.length && ["*", "/", "="].includes(tokens[index])) {
				let operator = tokens[index++];
				left = new MathExpression(
					operator,
					left,
					parseExponentiation()
				);
			}
			return left;
		}

		function parseAdditionSubtraction() {
			let left = parseMultiplicationDivision();
			while (index < tokens.length && ["+", "-"].includes(tokens[index])) {
				let operator = tokens[index++];
				left = new MathExpression(
					operator,
					left,
					parseMultiplicationDivision()
				);
			}
			return left;
		}

		return parseAdditionSubtraction();
	}

	/**
	 * Evaluates the entire expression, with variable substitution.
	 * @returns {?number}
	 */
	eval() {
		let left = (this.left instanceof MathExpression) ? this.left.eval() : this.left;
		let right = (this.right instanceof MathExpression) ? this.right.eval() : this.right;

		if (left in variables) left = variables[left];
		if (right in variables) right = variables[right];

		switch (this.operator) {
			case "+": return left + right;
			case "-": return left - right;
			case "*": return left * right;
			case "/": return left / right;
			case "^": return left ** right;
		}
		return NaN;
	}

	toString() {
		let left = (this.left instanceof MathExpression) ? `(${this.left.toString()})` : this.left;
		let right = (this.right instanceof MathExpression) ? `(${this.right.toString()})` : this.right;

		switch (this.operator) {
			case "+": return `${left} + ${right}`;
			case "-": return `${left} - ${right}`;
			case "*": return `${left}\\cdot ${right}`;
			case "/": return `\\frac{${left}}{${right}}`;
			case "^": return `${left}^{${right}}`;
		}

		return `(${left} ${this.operator} ${right})`;
	}

	/** Simplifies the expression as much as possible, without variable substitution. @returns {MathExpression|number} */
	collapse() {
		let left = (this.left instanceof MathExpression) ? this.left.collapse() : this.left;
		let right = (this.right instanceof MathExpression) ? this.right.collapse() : this.right;

		if (typeof left == "number" && typeof right == "number") {
			switch (this.operator) {
				case "+": return left + right;
				case "-": return left - right;
				case "*": return left * right;
				case "/": return left / right;
				case "^": return left ** right;
				default: return NaN;
			}
		} else {
			this.left = left;
			this.right = right;
			return this;
		}
	}
}

let expression = "2^x^y";
console.log("EXPRESSION:", expression);

let parsed = MathExpression.fromString(expression);
console.log("PARSED:", parsed.toString());

// let collapsed = parsed.collapse();
// if (collapsed instanceof MathExpression) collapsed = collapsed.toString();
// console.log("COLLAPSED:", collapsed);

let answer = parsed.eval();
console.log("SOLVED:", answer);