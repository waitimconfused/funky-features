import { controllers } from "../controller.js";

export class XboxController {

	index = null;
	gamepad = null;

	values = {
		joystick: {
			left: { x: 0, y: 0, click: 0 },
			right: { x: 0, y: 0, click: 0 }
		},
		button: {
			A: 0,
			B: 0,
			X: 0,
			Y: 0,
			menu: 0,
			view: 0
		},
		bumper: {
			left: 0,
			right: 0
		},
		trigger: {
			left: 0,
			right: 0
		},
		dpad: {
			up: 0,
			down: 0,
			left: 0,
			right: 0
		}
	}

	#eventListenersOn = {}
	#eventListenersWhile = {}
	#eventListenersOff = {}

	constructor(index=0) {
		this.index = index;
		controllers.push(this);
	}

	on(eventName="", callback=function(){}) {
		this.#eventListenersOn[eventName] = callback;
	}

	while(eventName="", callback=function(){}) {
		this.#eventListenersWhile[eventName] = callback;
	}

	off(eventName="", callback=function(){}) {
		this.#eventListenersOff[eventName] = callback;
	}

	triggerEvent(eventName="") {
		let eventType = eventName.split(":")[0];
		eventName = eventName.split(":")[1] || null;
		if(!eventName) {
			eventName = eventType;
			eventType = "on";
		}
		eventType = eventType.toLowerCase();
		if(eventType == "on" && this.#eventListenersOn[eventName]) this.#eventListenersOn[eventName]();
		if(eventType == "while" && this.#eventListenersWhile[eventName]) this.#eventListenersWhile[eventName]();
		if(eventType == "off" && this.#eventListenersOff[eventName]) this.#eventListenersOff[eventName]();
	}

	reload(gamepad=new Gamepad) {

		if(gamepad instanceof Gamepad == false) throw new Error("Error at object Xbox: function 'reload()' requires the parameter 'gamepad:Gamepad'");

		this.gamepad = gamepad;

		// Button-Down events
		if(!this.values.button.A && gamepad.buttons[0].value) this.triggerEvent("on:buttonA", gamepad.buttons[0].value);
		if(!this.values.button.B && gamepad.buttons[1].value) this.triggerEvent("on:buttonB", gamepad.buttons[1].value);
		if(!this.values.button.X && gamepad.buttons[2].value) this.triggerEvent("on:buttonX", gamepad.buttons[2].value);
		if(!this.values.button.Y && gamepad.buttons[3].value) this.triggerEvent("on:buttonY", gamepad.buttons[3].value);

		if(!this.values.bumper.left && gamepad.buttons[4].value) this.triggerEvent("on:bumperL", gamepad.buttons[4].value);
		if(!this.values.bumper.right && gamepad.buttons[5].value) this.triggerEvent("on:bumperR");

		if(this.values.trigger.left < 1 && gamepad.buttons[6].value == 1) this.triggerEvent("on:triggerL");
		if(this.values.trigger.right < 1 && gamepad.buttons[7].value == 1) this.triggerEvent("on:triggerR");
		
		if(!this.values.button.view && gamepad.buttons[8].value) this.triggerEvent("on:buttonView");
		if(!this.values.button.menu && gamepad.buttons[9].value) this.triggerEvent("on:buttonMenu");

		if(!this.values.joystick.left.click && gamepad.buttons[10].value) this.triggerEvent("on:joystickClickL");
		if(!this.values.joystick.right.click && gamepad.buttons[11].value) this.triggerEvent("on:joystickClickR");

		if(!this.values.dpad.up && gamepad.buttons[12].value) this.triggerEvent("on:dpadUp");
		if(!this.values.dpad.down && gamepad.buttons[13].value) this.triggerEvent("on:dpadDown");
		if(!this.values.dpad.left && gamepad.buttons[14].value) this.triggerEvent("on:dpadLeft");
		if(!this.values.dpad.right && gamepad.buttons[15].value) this.triggerEvent("on:dpadRight");

		// Button-Up events
		if(this.values.button.A && !gamepad.buttons[0].value) this.triggerEvent("off:buttonA");
		if(this.values.button.B && !gamepad.buttons[1].value) this.triggerEvent("off:buttonB");
		if(this.values.button.X && !gamepad.buttons[2].value) this.triggerEvent("off:buttonX");
		if(this.values.button.Y && !gamepad.buttons[3].value) this.triggerEvent("off:buttonY");

		if(this.values.bumper.left && !gamepad.buttons[4].value) this.triggerEvent("off:bumperL");
		if(this.values.bumper.right && !gamepad.buttons[5].value) this.triggerEvent("off:bumperR");

		if(this.values.trigger.left > 0 && gamepad.buttons[6].value == 0) this.triggerEvent("off:triggerL");
		if(this.values.trigger.right > 0 && gamepad.buttons[7].value == 0) this.triggerEvent("off:triggerR");
		
		if(this.values.button.view && !gamepad.buttons[8].value) this.triggerEvent("off:buttonView");
		if(this.values.button.menu && !gamepad.buttons[9].value) this.triggerEvent("off:buttonMenu");

		if(this.values.joystick.left.click && !gamepad.buttons[10].value) this.triggerEvent("off:joystickClickL");
		if(this.values.joystick.right.click && !gamepad.buttons[11].value) this.triggerEvent("off:joystickClickR");

		if(this.values.dpad.up && !gamepad.buttons[12].value) this.triggerEvent("off:dpadUp");
		if(this.values.dpad.down && !gamepad.buttons[13].value) this.triggerEvent("off:dpadDown");
		if(this.values.dpad.left && !gamepad.buttons[14].value) this.triggerEvent("off:dpadLeft");
		if(this.values.dpad.right && !gamepad.buttons[15].value) this.triggerEvent("off:dpadRight");

		this.values.button.A = gamepad.buttons[0].value;
		this.values.button.B = gamepad.buttons[1].value;
		this.values.button.X = gamepad.buttons[2].value;
		this.values.button.Y = gamepad.buttons[3].value;

		this.values.bumper.left = gamepad.buttons[4].value;
		this.values.bumper.right = gamepad.buttons[5].value;

		this.values.trigger.left = gamepad.buttons[6].value;
		this.values.trigger.right = gamepad.buttons[7].value;

		this.values.button.view = gamepad.buttons[8].value;
		this.values.button.menu = gamepad.buttons[9].value;

		this.values.joystick.left.click = gamepad.buttons[10].value;
		this.values.joystick.right.click = gamepad.buttons[11].value;

		this.values.dpad.up = gamepad.buttons[12].value;
		this.values.dpad.down = gamepad.buttons[13].value;
		this.values.dpad.left = gamepad.buttons[14].value;
		this.values.dpad.right = gamepad.buttons[15].value;

		this.values.joystick.left.x = gamepad.axes[0];
		this.values.joystick.left.y = gamepad.axes[1];

		this.values.joystick.right.x = gamepad.axes[2];
		this.values.joystick.right.y = gamepad.axes[3];

		// Button-While events
		if(this.values.button.A) this.triggerEvent("while:buttonA");
		if(this.values.button.B) this.triggerEvent("while:buttonB");
		if(this.values.button.X) this.triggerEvent("while:buttonX");
		if(this.values.button.Y) this.triggerEvent("while:buttonY");

		if(this.values.bumper.left) this.triggerEvent("while:bumperL");
		if(this.values.bumper.right) this.triggerEvent("while:bumperR");

		if(this.values.trigger.left) this.triggerEvent("while:triggerL");
		if(this.values.trigger.right) this.triggerEvent("while:triggerR");

		if(this.values.dpad.up) this.triggerEvent("while:dpadUp");
		if(this.values.dpad.down) this.triggerEvent("while:dpadDown");
		if(this.values.dpad.left) this.triggerEvent("while:dpadLeft");
		if(this.values.dpad.right) this.triggerEvent("while:dpadRight");
	}
}
export class XboxConstructor {
	/**
	 * Method for "linking" an Xbox controller 
	 * 
	 * @param {number} index Index of controller (see console after first button input) 
	 * @returns Xbox
	 */
	fromIndex(index=0){
		return new XboxController(index);
	}
}