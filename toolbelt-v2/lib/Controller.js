// import { XboxController } from "./controllers/xbox.js";

var initialized = false;

export var controllers = [];

export class DefaultController {

	/** @type {?number} */
	index = null;

	/** @type {?Gamepad} */
	gamepad = null;

	get vibrator() {
		return this.gamepad.vibrationActuator;
	}

	get supportsVibration() { return this.gamepad.vibrationActuator }

	values = {
		axes: [ 0, 0, 0, 0 ],
		buttons: [
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
			{ pressed: false, value: 0 },
		]
	}
	#eventListenersOn = {}
	#eventListenersWhile = {}
	#eventListenersOff = {}

	constructor(index=0) {
		this.index = index;
		controllers.push(this);
		DefaultController.initialize();
	}

	/**
	 * 
	 * @param {string} eventName 
	 * @param {(value:number) => void} callback 
	 */
	on(eventName, callback) {
		if (typeof eventName != "string") throw TypeError("Unexpected type of parameter. The parameter eventName must be of type string");
		if (typeof callback != "function") throw TypeError("Unexpected type of parameter. The parameter callback must be of type funcion");
		this.#eventListenersOn[eventName] = callback;
	}
	/**
	 * 
	 * @param {string} eventName 
	 * @param {(value:number) => void} callback 
	 */
	while(eventName, callback) {
		if (typeof eventName != "string") throw TypeError("Unexpected type of parameter. The parameter eventName must be of type string");
		if (typeof callback != "function") throw TypeError("Unexpected type of parameter. The parameter callback must be of type funcion");
		this.#eventListenersWhile[eventName] = callback;
	}
	/**
	 * 
	 * @param {string} eventName 
	 * @param {(value:number) => void} callback 
	 */
	off(eventName, callback) {
		if (typeof eventName != "string") throw TypeError("Unexpected type of parameter. The parameter eventName must be of type string");
		if (typeof callback != "function") throw TypeError("Unexpected type of parameter. The parameter callback must be of type funcion");
		this.#eventListenersOff[eventName] = callback;
	}

	triggerEvent(eventName="", params) {
		let eventType = eventName.split(":")[0];
		eventName = eventName.split(":")[1] || null;
		if(!eventName) {
			eventName = eventType;
			eventType = "on";
		}
		eventType = eventType.toLowerCase();
		if(eventType == "on" && this.#eventListenersOn[eventName]) this.#eventListenersOn[eventName](params);
		if(eventType == "while" && this.#eventListenersWhile[eventName]) this.#eventListenersWhile[eventName](params);
		if(eventType == "off" && this.#eventListenersOff[eventName]) this.#eventListenersOff[eventName](params);
	}

	/**
	 * 
	 * @param {"Xbox"} layoutName
	 */
	applyLayout(layoutName) {
		if (layoutName == "Xbox") {
			let blankController = new XboxController(this.index);
			this.values = blankController.values;
			this.reload = blankController.reload;
		}
	}

	reload(gamepad=new Gamepad) {

		for (let i = 0; i < gamepad.buttons.length; i ++) {
			/** @type {{ pressed: boolean, value: number }} */
			let object = gamepad.buttons[i];
			let newValue = object.value;
			let oldValue = this.values.buttons[i].value;
			if(oldValue < 0.5 && newValue >= 0.5) this.triggerEvent(`on:button${i}`, newValue);
			if(oldValue >= 0.5 && newValue >= 0.5) this.triggerEvent(`while:button${i}`, newValue);
			if(oldValue >= 0.5 && newValue < 0.5) this.triggerEvent(`off:button${i}`, newValue);
			this.values.buttons[i].value = newValue;
			this.values.buttons[i].pressed = (newValue >= 0.5);
		}

		if( Math.max(Math.abs(this.values.axes[0]), Math.abs(this.values.axes[1])) <= 0.1 && Math.max(Math.abs(gamepad.axes[0]), Math.abs(gamepad.axes[1])) > 0.1)  this.triggerEvent("on:axes0_1", {x: gamepad.axes[0], y: gamepad.axes[1]});
		if( Math.max(Math.abs(this.values.axes[2]), Math.abs(this.values.axes[3])) <= 0.1 && Math.max(Math.abs(gamepad.axes[2]), Math.abs(gamepad.axes[3])) > 0.1)  this.triggerEvent("on:axes2_3", {x: gamepad.axes[2], y: gamepad.axes[3]});

		this.values.axes = gamepad.axes;
		this.values.buttons = gamepad.buttons;
	}

	/**
	 * Initialize the event listeners, and start the update ticker
	 * 
	 * Can/will only be ran once
	 */
	static initialize() {
		if (initialized) return;
		initialized = true;
	
		console.log("To connect a controller, press any button");
		window.addEventListener("gamepadconnected", (e) => {
	
			let gamepadListeners = controllers.filter((elem) => !!elem).filter((listener=new Xbox) => {
				return listener.index == e.gamepad.index;
			});
			for(let i = 0; i < gamepadListeners.length; i ++){
				let gamepadListener = gamepadListeners[i];
				gamepadListener.triggerEvent("connect");
			}
	
			console.info("Gamepad connected with id: "+e.gamepad.id);
		});
	
	
		window.addEventListener("gamepaddisconnected", (e) => {
	
			let gamepadListeners = controllers.filter((elem) => !!elem).filter((listener=new Controller) => {
				return listener.index == e.gamepad.index;
			});
			for(let i = 0; i < gamepadListeners.length; i ++){
				let gamepadListener = gamepadListeners[i];
				gamepadListener.triggerEvent("disconnect");
			}
	
			console.info("Gamepad disconnected: "+e.gamepad.id);
		});
	
		tick();
	}
}

function tick() {

	let gamepads = navigator.getGamepads().filter((obj) => !!obj);

	for (let i = 0; i < gamepads.length; i ++) {
		let gamepad = gamepads[i];
		if(!gamepad) continue;
		let gamepadListeners = controllers.filter((listener=new Xbox) => {
			return listener.index == i;
		});
		for(let idx = 0; idx < gamepadListeners.length; idx ++){
			let gamepadListener = gamepadListeners[idx];
			gamepadListener.reload(gamepad);
		}
	}

	window.requestAnimationFrame(tick);
}



export class XboxController extends DefaultController {

	values = {
		joystick: {
			left: { x: 0, y: 0, click: false },
			right: { x: 0, y: 0, click: false }
		},
		button: {
			A: false,
			B: false,
			X: false,
			Y: false,
			menu: false,
			view: false
		},
		bumper: {
			left: 0,
			right: 0
		},
		trigger: {
			left: false,
			right: false
		},
		dpad: {
			up: false,
			down: false,
			left: false,
			right: false
		}
	}

	reload(gamepad=new Gamepad) {

		if(gamepad instanceof Gamepad == false) throw new Error("Error at object Xbox: function 'reload()' requires the parameter 'gamepad:Gamepad'");

		this.gamepad = gamepad;

		// Button-Down events
		if(!this.values.button.A && gamepad.buttons[0].value) this.triggerEvent("on:buttonA", true);
		if(!this.values.button.B && gamepad.buttons[1].value) this.triggerEvent("on:buttonB", true);
		if(!this.values.button.X && gamepad.buttons[2].value) this.triggerEvent("on:buttonX", true);
		if(!this.values.button.Y && gamepad.buttons[3].value) this.triggerEvent("on:buttonY", true);

		if(!this.values.bumper.left && gamepad.buttons[4].value) this.triggerEvent("on:bumperL", true);
		if(!this.values.bumper.right && gamepad.buttons[5].value) this.triggerEvent("on:bumperR", true);

		if(this.values.trigger.left < 1 && gamepad.buttons[6].value == 1) this.triggerEvent("on:triggerL", gamepad.buttons[6].value);
		if(this.values.trigger.right < 1 && gamepad.buttons[7].value == 1) this.triggerEvent("on:triggerR", gamepad.buttons[7].value);

		if(!this.values.button.view && gamepad.buttons[8].value) this.triggerEvent("on:buttonView", true);
		if(!this.values.button.menu && gamepad.buttons[9].value) this.triggerEvent("on:buttonMenu", true);

		if(!this.values.joystick.left.click && gamepad.buttons[10].value) this.triggerEvent("on:joystickClickL", true);
		if(!this.values.joystick.right.click && gamepad.buttons[11].value) this.triggerEvent("on:joystickClickR", true);

		if( Math.max(Math.abs(this.values.joystick.left.x), Math.abs(this.values.joystick.left.y)) <= 0.1 && Math.max(Math.abs(gamepad.axes[0]), Math.abs(gamepad.axes[1])) > 0.1)  this.triggerEvent("on:joystickL", {x: gamepad.axes[0], y: gamepad.axes[1]});
		if( Math.max(Math.abs(this.values.joystick.right.x), Math.abs(this.values.joystick.right.y)) <= 0.1 && Math.max(Math.abs(gamepad.axes[2]), Math.abs(gamepad.axes[3])) > 0.1)  this.triggerEvent("on:joystickR", {x: gamepad.axes[2], y: gamepad.axes[3]});

		if(!this.values.dpad.up && gamepad.buttons[12].value) this.triggerEvent("on:dpadUp", true);
		if(!this.values.dpad.down && gamepad.buttons[13].value) this.triggerEvent("on:dpadDown", true);
		if(!this.values.dpad.left && gamepad.buttons[14].value) this.triggerEvent("on:dpadLeft", true);
		if(!this.values.dpad.right && gamepad.buttons[15].value) this.triggerEvent("on:dpadRight", true);

		// Button-Up events
		if(this.values.button.A && !gamepad.buttons[0].value) {
			this.triggerEvent("while:buttonA", false);
			this.triggerEvent("off:buttonA", false);
		}
		if(this.values.button.B && !gamepad.buttons[1].value) {
			this.triggerEvent("while:buttonB", false);
			this.triggerEvent("off:buttonB", false);
		}
		if(this.values.button.X && !gamepad.buttons[2].value) {
			this.triggerEvent("while:buttonX", false);
			this.triggerEvent("off:buttonX", false);
		}
		if(this.values.button.Y && !gamepad.buttons[3].value) {
			this.triggerEvent("while:buttonY", false);
			this.triggerEvent("off:buttonY", false);
		}

		if(this.values.bumper.left && !gamepad.buttons[4].value) {
			this.triggerEvent("while:bumperL", false);
			this.triggerEvent("off:bumperL", false);
		}
		if(this.values.bumper.right && !gamepad.buttons[5].value) {
			this.triggerEvent("while:bumperR", false);
			this.triggerEvent("off:bumperR", false);
		}

		if(this.values.trigger.left > 0 && gamepad.buttons[6].value == 0) {
			this.triggerEvent("while:triggerL", false);
			this.triggerEvent("off:triggerL", false);
		}
		if(this.values.trigger.right > 0 && gamepad.buttons[7].value == 0) {
			this.triggerEvent("while:triggerR", false);
			this.triggerEvent("off:triggerR", false);
		}
		
		if(this.values.button.view && !gamepad.buttons[8].value) {
			this.triggerEvent("while:buttonView", false);
			this.triggerEvent("off:buttonView", false);
		}
		if(this.values.button.menu && !gamepad.buttons[9].value) {
			this.triggerEvent("while:buttonMenu", false);
			this.triggerEvent("off:buttonMenu", false);
		}

		if(this.values.joystick.left.click && !gamepad.buttons[10].value) {
			this.triggerEvent("while:joystickClickL", false);
			this.triggerEvent("off:joystickClickL", false);
		}
		if(this.values.joystick.right.click && !gamepad.buttons[11].value) {
			this.triggerEvent("while:joystickClickR", false);
			this.triggerEvent("off:joystickClickR", false);
		}

		if( Math.max(Math.abs(this.values.joystick.left.x), Math.abs(this.values.joystick.left.y)) > 0.1 && Math.max(Math.abs(gamepad.axes[0]), Math.abs(gamepad.axes[1])) <= 0.1) {
			this.triggerEvent("while:joystickL", {x: 0, y: 0});
			this.triggerEvent("off:joystickL", {x: 0, y: 0});
		}
		if( Math.max(Math.abs(this.values.joystick.right.x), Math.abs(this.values.joystick.right.y)) > 0.1 && Math.max(Math.abs(gamepad.axes[2]), Math.abs(gamepad.axes[3])) <= 0.1) {
			this.triggerEvent("while:joystickR", {x: 0, y: 0});
			this.triggerEvent("off:joystickR", {x: 0, y: 0});
		}

		if(this.values.dpad.up && !gamepad.buttons[12].value) {
			this.triggerEvent("while:dpadUp", false);
			this.triggerEvent("off:dpadUp", false);
		}
		if(this.values.dpad.down && !gamepad.buttons[13].value) {
			this.triggerEvent("while:dpadDown", false);
			this.triggerEvent("off:dpadDown", false);
		}
		if(this.values.dpad.left && !gamepad.buttons[14].value) {
			this.triggerEvent("while:dpadLeft", false);
			this.triggerEvent("off:dpadLeft", false);
		}
		if(this.values.dpad.right && !gamepad.buttons[15].value) {
			this.triggerEvent("while:dpadRight", false);
			this.triggerEvent("off:dpadRight", false);
		}

		this.values.button.A = gamepad.buttons[0].value == true;
		this.values.button.B = gamepad.buttons[1].value == true;
		this.values.button.X = gamepad.buttons[2].value == true;
		this.values.button.Y = gamepad.buttons[3].value == true;

		this.values.bumper.left = gamepad.buttons[4].value == true;
		this.values.bumper.right = gamepad.buttons[5].value == true;

		this.values.trigger.left = gamepad.buttons[6].value;
		this.values.trigger.right = gamepad.buttons[7].value;

		this.values.button.view = gamepad.buttons[8].value == true;
		this.values.button.menu = gamepad.buttons[9].value == true;

		this.values.joystick.left.click = gamepad.buttons[10].value == true;
		this.values.joystick.right.click = gamepad.buttons[11].value == true;

		this.values.dpad.up = gamepad.buttons[12].value == true;
		this.values.dpad.down = gamepad.buttons[13].value == true;
		this.values.dpad.left = gamepad.buttons[14].value == true;
		this.values.dpad.right = gamepad.buttons[15].value == true;

		this.values.joystick.left.x = gamepad.axes[0];
		this.values.joystick.left.y = gamepad.axes[1];

		this.values.joystick.right.x = gamepad.axes[2];
		this.values.joystick.right.y = gamepad.axes[3];

		// Button-While events
		if(this.values.button.A) this.triggerEvent("while:buttonA", true);
		if(this.values.button.B) this.triggerEvent("while:buttonB", true);
		if(this.values.button.X) this.triggerEvent("while:buttonX", true);
		if(this.values.button.Y) this.triggerEvent("while:buttonY", true);

		if(this.values.bumper.left) this.triggerEvent("while:bumperL", true);
		if(this.values.bumper.right) this.triggerEvent("while:bumperR", true);

		if(this.values.trigger.left) this.triggerEvent("while:triggerL", this.values.trigger.left);
		if(this.values.trigger.right) this.triggerEvent("while:triggerR", this.values.trigger.right);

		if(this.values.button.view) this.triggerEvent("while:buttonView", true);
		if(this.values.button.menu) this.triggerEvent("while:buttonMenu", true);

		if(this.values.dpad.up) this.triggerEvent("while:dpadUp", true);
		if(this.values.dpad.down) this.triggerEvent("while:dpadDown", true);
		if(this.values.dpad.left) this.triggerEvent("while:dpadLeft", true);
		if(this.values.dpad.right) this.triggerEvent("while:dpadRight", true);

		
		if(this.values.joystick.left.click) this.triggerEvent("while:joystickClickL", true);
		if(this.values.joystick.right.click) this.triggerEvent("while:joystickClickR", true);
		
		if( Math.max(Math.abs(this.values.joystick.left.x), Math.abs(this.values.joystick.left.y)) > 0.1 )  this.triggerEvent("while:joystickL", this.values.joystick.left);
		if( Math.max(Math.abs(this.values.joystick.right.x), Math.abs(this.values.joystick.right.y)) > 0.1 )  this.triggerEvent("while:joystickR", this.values.joystick.right);
	}


	/**
	 * 
	 * @param {"buttonA"|"buttonB"|"buttonX"|"buttonY"|"bumperL"|"bumperR"|"triggerL"|"triggerR"} eventName 
	 * @param {(value:number) => void} callback 
	 */
	on = (eventName, callback) => {}
}