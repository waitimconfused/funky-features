function arrayIncludesArray(array=[], target=[]){
	return array.sort().join(',') === target.sort().join(',')
}

export var keyboard = new class {

	#keybinds = [];

	list = [];
	isPressed(key=""){
		return this.list.includes(key);
	}
	setKey(key="", value=true, keyboardEvent=KeyboardEvent){
		if(value == true && !this.isPressed(key)){
			this.list.push(key);
		}else if(value == false && this.isPressed(key)){
			while(this.isPressed(key)){
				this.list.splice( this.list.indexOf(key), 1 );
			}
		}
		if(value == true) this.#testKeybinds(keyboardEvent);
	}
	script = function(e=new KeyboardEvent){}
	setScript(callback=this.script){
		this.script = callback;
	}

	setKeybind(callback=function(){}, keys=["control", "b"]){
		this.#keybinds.push({
			keys,
			callback,
		})
	}
	#testKeybinds(keyboardEvent=new KeyboardEvent){
		let keybindMatch = false;
		for(let index = 0; index < this.#keybinds.length; index ++){
			let keybinding = this.#keybinds[index];
			let hasMatch = arrayIncludesArray(this.list, keybinding.keys);
			if(hasMatch) {
				keyboardEvent.preventDefault();
				keybinding.callback(keyboardEvent);
				keybindMatch = true;
			}
		}
		if(keybindMatch) this.list = [];
		(arr, target) => target.every(v => arr.includes(v))
	}
};

export var mouse = new class {
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

	script = function(e=new KeyboardEvent){};
	setScript(callback=this.script){
		this.script = callback;
	};
};

window.onfocus = (e) => {
	keyboard.list = [];
}

document.onkeydown = (e) => {
	let key = e.key.toLowerCase();
	keyboard.setKey(key, true, e);
	keyboard.script(e);
}
document.onkeyup = (e) => {
	keyboard.setKey(e.key, false, e);
	keyboard.setKey("control", e.ctrlKey, e);
	keyboard.setKey("shift", e.shiftKey, e);
	keyboard.script(e);
}

document.onmousedown = (e) => {
	mouse.click_l = true;
	mouse.script(e);
}
document.onmouseup = (e) => {
	mouse.click_l = false;
	mouse.click_r = false;
	mouse.script(e);
}
document.oncontextmenu = (e) => {
	e.preventDefault();
	mouse.click_r = true;
	mouse.script(e);
}
document.onmousemove = (e) => {
	mouse.position.x = e.clientX;
	mouse.position.y = e.clientY;
	mouse.script(e);
}