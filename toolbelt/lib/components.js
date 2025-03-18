var link = document.createElement("link");
link.type = "text/css";
link.rel = "stylesheet";
link.href = "./lib/components.css";
document.head.appendChild(link);

class Button extends HTMLElement {
	constructor() {
		super();

		for (let prop of Object.getOwnPropertyNames(this.constructor.prototype)) {
			if (prop.indexOf("on") === 0) {
				this.addEventListener(prop.substring(2).toLowerCase(), this.constructor.prototype[prop]);
			}
		}
	}
}
customElements.define("tb-button", Button);

class Switch extends HTMLElement {
	constructor() {
		super();

		for (let prop of Object.getOwnPropertyNames(this.constructor.prototype)) {
			if (prop.indexOf("on") === 0) {
				this.addEventListener(prop.substring(2).toLowerCase(), this.constructor.prototype[prop]);
			}
		}
	}

	onclick() {
		let value = this.getAttribute("value") ?? "off";
		value = value.toLowerCase();
		let newValue = (value == "on") ? "off" : "on";
		this.setAttribute("value", newValue);
	}
}
customElements.define("tb-switch", Switch);


class Checkbox extends HTMLElement {
	constructor() {
		super();

		for (let prop of Object.getOwnPropertyNames(this.constructor.prototype)) {
			if (prop.indexOf("on") === 0) {
				this.addEventListener(prop.substring(2).toLowerCase(), this.constructor.prototype[prop]);
			}
		}
	}

	onclick() {
		let value = this.getAttribute("value") ?? "off";
		value = value.toLowerCase();
		let newValue = (value == "on") ? "off" : "on";
		this.setAttribute("value", newValue);
	}
}
customElements.define("tb-checkbox", Checkbox);


class Radio extends HTMLElement {
	constructor() {
		super();

		for (let prop of Object.getOwnPropertyNames(this.constructor.prototype)) {
			if (prop.indexOf("on") === 0) {
				this.addEventListener(prop.substring(2).toLowerCase(), this.constructor.prototype[prop]);
			}
		}
	}

	onclick() {
		let value = this.getAttribute("value") ?? "off";
		value = value.toLowerCase();
		let newValue = (value == "on") ? "off" : "on";

		let name = this.getAttribute("name");

		if (name) {
			let others = document.querySelectorAll(`tb-radio[name="${name}"]`);
			for (let other of others) {
				other.removeAttribute("checked");
			}
		}

		this.setAttribute("checked", "");
	}
}
customElements.define("tb-radio", Radio);


class Input extends HTMLElement {
	/** @type {HTMLInputElement} */
	#realElement;

	constructor() {
		super();

		// Attaches a shadow root to your custom element.
		const shadowRoot = this.attachShadow({ mode: 'open' });

		// Defines the "real" input element.
		this.#realElement = document.createElement('input');
		this.#realElement.setAttribute("part", "input");
		this.#realElement.setAttribute('type', this.getAttribute('type') ?? "text");

		this.#realElement.addEventListener('focus', () => {
			console.log('focus on spot input');
		});

		this.addEventListener("input", (e) => {
			this.setAttribute("value", this.#realElement.value);
		})

		// Appends the input into the shadow root.
		shadowRoot.appendChild(this.#realElement);
	}

	static get observedAttributes() {
		return ["type"];
	}
	attributeChangedCallback(attrName, oldVal, newVal) {
		if (attrName != "type") return;
		this.#realElement.setAttribute("type", newVal);
	}
};

customElements.define('tb-input', Input);