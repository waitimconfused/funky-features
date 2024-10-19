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

	reload(gamepad=new Gamepad) {

		if(gamepad instanceof Gamepad == false) throw new Error("Error at object Xbox: function 'reload()' requires the parameter 'gamepad:Gamepad'");

		this.gamepad = gamepad;

		// Button-Down events
		if(!this.values.button.A && gamepad.buttons[0].value) this.triggerEvent("on:buttonA", 1);
		if(!this.values.button.B && gamepad.buttons[1].value) this.triggerEvent("on:buttonB", 1);
		if(!this.values.button.X && gamepad.buttons[2].value) this.triggerEvent("on:buttonX", 1);
		if(!this.values.button.Y && gamepad.buttons[3].value) this.triggerEvent("on:buttonY", 1);

		if(!this.values.bumper.left && gamepad.buttons[4].value) this.triggerEvent("on:bumperL", 1);
		if(!this.values.bumper.right && gamepad.buttons[5].value) this.triggerEvent("on:bumperR", 1);

		if(this.values.trigger.left < 1 && gamepad.buttons[6].value == 1) this.triggerEvent("on:triggerL", gamepad.buttons[6].value);
		if(this.values.trigger.right < 1 && gamepad.buttons[7].value == 1) this.triggerEvent("on:triggerR", gamepad.buttons[7].value);

		if(!this.values.button.view && gamepad.buttons[8].value) this.triggerEvent("on:buttonView", 1);
		if(!this.values.button.menu && gamepad.buttons[9].value) this.triggerEvent("on:buttonMenu", 1);

		if(!this.values.joystick.left.click && gamepad.buttons[10].value) this.triggerEvent("on:joystickClickL", 1);
		if(!this.values.joystick.right.click && gamepad.buttons[11].value) this.triggerEvent("on:joystickClickR", 1);

		if( Math.max(Math.abs(this.values.joystick.left.x), Math.abs(this.values.joystick.left.y)) <= 0.1 && Math.max(Math.abs(gamepad.axes[0]), Math.abs(gamepad.axes[1])) > 0.1)  this.triggerEvent("on:joystickL", {x: gamepad.axes[0], y: gamepad.axes[1]});
		if( Math.max(Math.abs(this.values.joystick.right.x), Math.abs(this.values.joystick.right.y)) <= 0.1 && Math.max(Math.abs(gamepad.axes[2]), Math.abs(gamepad.axes[3])) > 0.1)  this.triggerEvent("on:joystickR", {x: gamepad.axes[2], y: gamepad.axes[3]});

		if(!this.values.dpad.up && gamepad.buttons[12].value) this.triggerEvent("on:dpadUp", 1);
		if(!this.values.dpad.down && gamepad.buttons[13].value) this.triggerEvent("on:dpadDown", 1);
		if(!this.values.dpad.left && gamepad.buttons[14].value) this.triggerEvent("on:dpadLeft", 1);
		if(!this.values.dpad.right && gamepad.buttons[15].value) this.triggerEvent("on:dpadRight", 1);

		// Button-Up events
		if(this.values.button.A && !gamepad.buttons[0].value) {
			this.triggerEvent("while:buttonA", 0);
			this.triggerEvent("off:buttonA", 0);
		}
		if(this.values.button.B && !gamepad.buttons[1].value) {
			this.triggerEvent("while:buttonB", 0);
			this.triggerEvent("off:buttonB", 0);
		}
		if(this.values.button.X && !gamepad.buttons[2].value) {
			this.triggerEvent("while:buttonX", 0);
			this.triggerEvent("off:buttonX", 0);
		}
		if(this.values.button.Y && !gamepad.buttons[3].value) {
			this.triggerEvent("while:buttonY", 0);
			this.triggerEvent("off:buttonY", 0);
		}

		if(this.values.bumper.left && !gamepad.buttons[4].value) {
			this.triggerEvent("while:bumperL", 0);
			this.triggerEvent("off:bumperL", 0);
		}
		if(this.values.bumper.right && !gamepad.buttons[5].value) {
			this.triggerEvent("while:bumperR", 0);
			this.triggerEvent("off:bumperR", 0);
		}

		if(this.values.trigger.left > 0 && gamepad.buttons[6].value == 0) {
			this.triggerEvent("while:triggerL", 0);
			this.triggerEvent("off:triggerL", 0);
		}
		if(this.values.trigger.right > 0 && gamepad.buttons[7].value == 0) {
			this.triggerEvent("while:triggerR", 0);
			this.triggerEvent("off:triggerR", 0);
		}
		
		if(this.values.button.view && !gamepad.buttons[8].value) {
			this.triggerEvent("while:buttonView", 0);
			this.triggerEvent("off:buttonView", 0);
		}
		if(this.values.button.menu && !gamepad.buttons[9].value) {
			this.triggerEvent("while:buttonMenu", 0);
			this.triggerEvent("off:buttonMenu", 0);
		}

		if(this.values.joystick.left.click && !gamepad.buttons[10].value) {
			this.triggerEvent("while:joystickClickL", 0);
			this.triggerEvent("off:joystickClickL", 0);
		}
		if(this.values.joystick.right.click && !gamepad.buttons[11].value) {
			this.triggerEvent("while:joystickClickR",0);
			this.triggerEvent("off:joystickClickR",0);
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
			this.triggerEvent("while:dpadUp", 0);
			this.triggerEvent("off:dpadUp", 0);
		}
		if(this.values.dpad.down && !gamepad.buttons[13].value) {
			this.triggerEvent("while:dpadDown", 0);
			this.triggerEvent("off:dpadDown", 0);
		}
		if(this.values.dpad.left && !gamepad.buttons[14].value) {
			this.triggerEvent("while:dpadLeft", 0);
			this.triggerEvent("off:dpadLeft", 0);
		}
		if(this.values.dpad.right && !gamepad.buttons[15].value) {
			this.triggerEvent("while:dpadRight", 0);
			this.triggerEvent("off:dpadRight", 0);
		}

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
		if(this.values.button.A) this.triggerEvent("while:buttonA", 1);
		if(this.values.button.B) this.triggerEvent("while:buttonB", 1);
		if(this.values.button.X) this.triggerEvent("while:buttonX", 1);
		if(this.values.button.Y) this.triggerEvent("while:buttonY", 1);

		if(this.values.bumper.left) this.triggerEvent("while:bumperL", 1);
		if(this.values.bumper.right) this.triggerEvent("while:bumperR", 1);

		if(this.values.trigger.left) this.triggerEvent("while:triggerL", this.values.trigger.left);
		if(this.values.trigger.right) this.triggerEvent("while:triggerR", this.values.trigger.right);

		if(this.values.button.view) this.triggerEvent("while:buttonView", 1);
		if(this.values.button.menu) this.triggerEvent("while:buttonMenu", 1);

		if(this.values.dpad.up) this.triggerEvent("while:dpadUp", 1);
		if(this.values.dpad.down) this.triggerEvent("while:dpadDown", 1);
		if(this.values.dpad.left) this.triggerEvent("while:dpadLeft", 1);
		if(this.values.dpad.right) this.triggerEvent("while:dpadRight", 1);

		
		if(this.values.joystick.left.click) this.triggerEvent("while:joystickClickL", 1);
		if(this.values.joystick.right.click) this.triggerEvent("while:joystickClickR", 1);
		
		if( Math.max(Math.abs(this.values.joystick.left.x), Math.abs(this.values.joystick.left.y)) > 0.1 )  this.triggerEvent("while:joystickL", this.values.joystick.left);
		if( Math.max(Math.abs(this.values.joystick.right.x), Math.abs(this.values.joystick.right.y)) > 0.1 )  this.triggerEvent("while:joystickR", this.values.joystick.right);
	}
}