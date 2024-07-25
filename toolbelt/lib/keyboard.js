function arrayIncludesArray(array=[], target=[]) {
	return array.sort().join(',') === target.sort().join(',')
}

export var keyboard = new class Keyboard {

	#keybinds = [];

	list = [];
	isPressed(key="") {
		return this.list.includes(key);
	}
	setKey(key="", value=true, keyboardEvent=KeyboardEvent) {
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

	#eventListener_ON = [];
	#eventListener_OFF = [];

	on(keys=["control", "b"], callback=function(){}, options={}) {
		if (typeof keys == "string") keys = [keys];
		this.#eventListener_ON.push({
			keys,
			callback,
			options
		})
	}
	off(keys=["control", "b"], callback=function(){}, options={}) {
		if (typeof keys == "string") keys = [keys];
		this.#eventListener_OFF.push({
			keys,
			callback,
			options
		})
	}
	#runevent_ON(keyboardEvent=new KeyboardEvent){
		let clearKeys = false;
		for (let index = 0; index < this.#eventListener_ON.length; index ++) {
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

window.onfocus = (e) => {
	keyboard.list = [];
}

document.onkeydown = (e) => {
	let key = e.key.toLowerCase();
	if(!keyboard.list.includes(key)) {
		keyboard.setKey(key, true, e);
	}
}
document.onkeyup = (e) => {
	keyboard.setKey(e.key, false, e);
	keyboard.setKey("control", e.ctrlKey, e);
	keyboard.setKey("shift", e.shiftKey, e);
}

document.onmousedown = (e) => {
	mouse.click_l = true;
}
document.onmouseup = (e) => {
	mouse.click_l = false;
	mouse.click_r = false;
}
document.oncontextmenu = (e) => {
	e.preventDefault();
	mouse.click_r = true;
}
document.onmousemove = (e) => {
	mouse.position.x = e.clientX;
	mouse.position.y = e.clientY;
}