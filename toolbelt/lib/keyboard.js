function arrayIncludesArray(array=[], target=[]) {
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
	setKey(key="", value=true, keyboardEvent=KeyboardEvent) {
		key = this.#fixKeys([key])[0];
		if (value == true && !this.isPressed(key)) {
			this.list.push(key);
			this.#runevent_ON(keyboardEvent);
		} else if(value == false && this.isPressed(key)) {
			while (this.isPressed(key)) {
				this.list.splice( this.list.indexOf(key), 1);
			}
			this.#runevent_OFF(keyboardEvent);
		}
	}
	#fixKeys(keys=[""]) {
		for (let i = 0; i < keys.length; i ++) {
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
	 * @param {function} callback 
	 * @param {{
	* 	passive: boolean
	* }} options 
	*/
	on(keys, callback, options={}) {
		options.passive = options.passive || true;
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
	off(keys, callback, options={}) {
		options.passive = options.passive || true;
		if (typeof keys == "string") keys = [keys];
		this.#eventListener_OFF.push({
			keys,
			callback,
			options
		});
	}
	#runevent_ON(keyboardEvent=new KeyboardEvent){
		let clearKeys = false;
		for (let index = 0; index < this.#eventListener_ON.length; index ++) {
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
				if (!keybinding.options?.passive) keyboardEvent.preventDefault();
				keybinding.callback(keyboardEvent);
				clearKeys = clearKeys || !keybinding.options?.passive;
			}
		}
		if(clearKeys) this.list = [];
	}
	#runevent_OFF(keyboardEvent=new KeyboardEvent){
		let clearKeys = false;
		for(let index = 0; index < this.#eventListener_OFF.length; index ++){
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
			if(hasMatch) {
				if (!keybinding.options?.passive) keyboardEvent.preventDefault();
				keybinding.callback(keyboardEvent);
				clearKeys = clearKeys || !keybinding.options?.passive;
			}
		}
		if(clearKeys) this.list = [];
	}
};

export var mouse = new class Mouse {
	click_l = false;
	click_r = false;

	#hooks = [];

	/**
	 * 
	 * @param { object } options 
	 * @param { function } options.updateFunc
	 */
	addHook(options) {
		if (typeof options?.updateFunc != "function") options.updateFunc = new Function;
		let hook = new MouseHook({
			x: this.position.x,
			y: this.position.y,
			...options
		});
		this.#hooks.push(hook);
		return hook;
	}
	updateHooks() {
		for (let i = 0; i < this.#hooks.length; i ++) {
			let hook = this.#hooks[i];
			hook.x = this.position.x;
			hook.y = this.position.y;
			hook.updateFunc();
		}
	}

	touchDisabled = false;

	disableTouch(){
		this.touchDisabled = true;
	}
	ensableTouch(){
		this.touchDisabled = false;
	}

	position = {
		x: 0,
		y: 0,
		relative: function(element=new HTMLElement){
			let elementRect = element.getBoundingClientRect();
			let x = this.x - elementRect.left;
			let y = this.y - elementRect.top;
			var scaleX = elementRect.width / element.offsetWidth;
			var scaleY = elementRect.height / element.offsetHeight;
			x /= scaleX;
			y /= scaleY;
			return { x, y };
		},
	};
};
class MouseHook {
	x = 0;
	y = 0;

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

window.onfocus = (e) => {
	keyboard.list = [];
}

window.onkeydown = (e) => {
	let key = e.key.toLowerCase();
	if(!keyboard.list.includes(key)) {
		keyboard.setKey(key, true, e);
	}
	keyboard.setKey("control", e.ctrlKey, e);
	keyboard.setKey("shift", e.shiftKey, e);
	keyboard.setKey("alt", e.altKey, e);
}
window.onkeyup = (e) => {
	let key = e.key.toLowerCase();
	keyboard.setKey(key, false, e);
	keyboard.setKey("control", e.ctrlKey, e);
	keyboard.setKey("shift", e.shiftKey, e);
	keyboard.setKey("alt", e.altKey, e);
}

window.onmousedown = (e) => {
	mouse.click_l = true;
	mouse.updateHooks();
}
window.onmouseup = (e) => {
	mouse.click_l = false;
	mouse.click_r = false;
}
window.oncontextmenu = (e) => {
	e.preventDefault();
	mouse.click_r = true;
	mouse.updateHooks();
}
window.onmousemove = (e) => {
	mouse.position.x = e.clientX;
	mouse.position.y = e.clientY;
	mouse.updateHooks();
}