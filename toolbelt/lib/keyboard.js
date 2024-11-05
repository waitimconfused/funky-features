/**
 * @param { array } array 
 * @param { array } target 
 * @returns 
 */
function arrayIncludesArray(array, target) {
	return array.sort().join(',') === target.sort().join(',')
}

export var keyboard = new class Keyboard {

	#keybinds = [];
	#stopEvent = [];

	/**
	 * @type {string[]}
	 */
	list = [];
	/**
	 * @param  {...string} key 
	 * @returns {boolean}
	 */
	isPressed(...keys) {
		keys = this.#fixKeys(keys);
		return keys.some(r => this.list.includes(r));
	}
	constructor() {
		window.addEventListener("focus", (e) => {
			keyboard.list = [];
		});
		window.addEventListener("keydown", (e) => {
			let key = e.key.toLowerCase();
			if (!keyboard.list.includes(key)) {
				keyboard.setKey(key, true, e);
			}
			keyboard.setKey("control", e.ctrlKey, e);
			keyboard.setKey("shift", e.shiftKey, e);
			keyboard.setKey("alt", e.altKey, e);
		});
		window.addEventListener("keyup", (e) => {
			let key = e.key.toLowerCase();
			keyboard.setKey(key, false, e);
			keyboard.setKey("control", e.ctrlKey, e);
			keyboard.setKey("shift", e.shiftKey, e);
			keyboard.setKey("alt", e.altKey, e);
		});
	}
	/**
	 * @param { string } key 
	 * @param { boolean } value 
	 * @param { KeyboardEvent } keyboardEvent 
	 */
	setKey(key, value, keyboardEvent) {
		key = this.#fixKeys([key])[0];
		if (value == true && !this.isPressed(key)) {
			this.list.push(key);
			this.#runevent_ON(keyboardEvent);
		} else if (value == false && this.isPressed(key)) {
			while (this.isPressed(key)) {
				this.list.splice(this.list.indexOf(key), 1);
			}
			this.#runevent_OFF(keyboardEvent);
		}
	}
	/**
	 * @param { string[] } keys 
	 * @returns 
	 */
	#fixKeys(keys) {
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i].toLowerCase();
			if (key == "ctrl") key = "control";
			if (key == "space") key = " ";
			if (key.includes("up") && !key.includes("page")) key = "arrowup";
			if (key.includes("down") && !key.includes("page")) key = "arrowdown";
			if (key.includes("left")) key = "arrowleft";
			if (key.includes("right")) key = "arrowright";

			if (key.includes("up") && key.includes("page")) key = "pageup";
			if (key.includes("down") && key.includes("page")) key = "pagedown";

			keys[i] = key;
		}
		return keys;
	}

	#eventListener_ON = [];
	#eventListener_OFF = [];

	/**
	 * @param {string | string[]} keys 
	 * @param { (e:KeyboardEvent) => {} } callback 
	 * @param {{
	* 	passive: boolean
	* }} options 
	*/
	on(keys, callback, options = {}) {
		if (options.passive == undefined) options.passive = true;
		if (typeof keys == "string") keys = [keys];
		keys = this.#fixKeys(keys);
		this.#eventListener_ON.push({
			keys,
			callback,
			options
		});
	}
	/**
	 * @param {string | string[]} keys 
	 * @param {function} callback 
	 * @param {{
	* 	passive: boolean
	* }} options 
	*/
	off(keys, callback, options = {}) {
		if (options.passive == undefined) options.passive = true;
		if (typeof keys == "string") keys = [keys];
		this.#eventListener_OFF.push({
			keys,
			callback,
			options
		});
	}
	/**
	 * @param { KeyboardEvent } keyboardEvent
	 */
	#runevent_ON(keyboardEvent) {
		let clearKeys = false;
		for (let index = 0; index < this.#eventListener_ON.length; index++) {
			/**
			 * @type {{
			* 	callback: function
			* options: {
			* 	passive: boolean
			* }
			* }}
			*/
			let keybinding = this.#eventListener_ON[index];
			let hasMatch = arrayIncludesArray(this.list, keybinding.keys);
			if (hasMatch) {
				if (keybinding.options?.passive == false) keyboardEvent.preventDefault();
				keybinding.callback(keyboardEvent);
				clearKeys = clearKeys || !keybinding.options?.passive;
			}
		}
		if (clearKeys) this.list = [];
	}
	/**
	 * @param { KeyboardEvent } keyboardEvent
	 */
	#runevent_OFF(keyboardEvent) {
		let clearKeys = false;
		for (let index = 0; index < this.#eventListener_OFF.length; index++) {
			/**
			 * @type {{
			 * 	callback: function
			 * options: {
			 * 	passive: boolean
			 * }
			 * }}
			 */
			let keybinding = this.#eventListener_OFF[index];
			let hasMatch = arrayIncludesArray(this.list, keybinding.keys);
			if (hasMatch) {
				if (!keybinding.options?.passive) keyboardEvent.preventDefault();
				keybinding.callback(keyboardEvent);
				clearKeys = clearKeys || !keybinding.options?.passive;
			}
		}
		if (clearKeys) this.list = [];
	}
};

export var mouse = new class Mouse {
	click_l = false;
	click_r = false;

	#hooks = [];

	constructor() {
		window.addEventListener("mousedown", (e) => {
			mouse.click_l = true;
			mouse.updateHooks(e);
		});
		window.addEventListener("mouseup", (e) => {
			mouse.click_l = false;
			mouse.click_r = false;
			mouse.updateHooks(e);
		});
		window.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			mouse.click_r = true;
			mouse.updateHooks(e);
		});
		window.addEventListener("mousemove", (e) => {
			mouse.position.x = e.clientX;
			mouse.position.y = e.clientY;
			mouse.updateHooks(e);
		});
	}

	/**
	 * 
	 * @param { object } options 
	 * @param { (e: MouseEvent, mouse: Mouse) => {} } options.updateFunc
	 */
	addHook(options) {
		if (typeof options?.updateFunc != "function") options.updateFunc = new Function;
		let hook = new MouseHook({
			x: this.position.x,
			y: this.position.y,
			click_l: this.click_l,
			click_r: this.click_r,
			...options
		});
		this.#hooks.push(hook);
		return hook;
	}
	/**
	 * 
	 * @param {MouseEvent} e
	 */
	updateHooks(e) {
		for (let i = 0; i < this.#hooks.length; i++) {
			/**
			 * @type { MouseHook }
			 */
			let hook = this.#hooks[i];
			hook.x = this.position.x;
			hook.y = this.position.y;
			hook.click_l = this.click_l;
			hook.click_r = this.click_r;
			hook.updateFunc(e, this);
		}
	}

	touchDisabled = false;

	disableTouch() {
		this.touchDisabled = true;
	}
	ensableTouch() {
		this.touchDisabled = false;
	}

	position = {
		x: 0,
		y: 0,
		/**
		 * @param { HTMLElement } element
		*/
		relative: function (element) {
			let elementRect = element.getBoundingClientRect();

			let x = this.x - elementRect.left;
			let y = this.y - elementRect.top;

			let renderedWidth = elementRect.width;
			let renderedHeight = elementRect.height;

			renderedWidth = element.offsetWidth;

			let actualWidth = element.getAttribute("width") || element.clientWidth;
			let actualHeight = element.getAttribute("height") || element.clientWidth;
			if (element.nodeName.toLowerCase() == "svg") {
				let veiwbox = element.getAttribute("viewBox").split(" ");
				actualWidth = veiwbox[2];
				actualHeight = veiwbox[3];
			}

			var scaleX = renderedWidth / actualWidth;
			var scaleY = renderedHeight / actualHeight;

			x /= scaleX;
			y /= scaleY;
			return { x, y };
		},
	};
	get pos() {
		return this.position;
	}
};
class MouseHook {
	x = 0;
	y = 0;
	click_l = false;
	click_r = false;

	/**
	 * 
	 * @param { object} options
	 * @param { function } options.
	 */
	constructor(options) {
		for (let key in options) {
			if (["x", "y"].includes(key)) continue;
			this[key] = options[key];
		}
	}
}