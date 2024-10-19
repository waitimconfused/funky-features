export { XboxController as Xbox, XboxController } from "./controllers/xbox.js";

export var controllers = [];

export class Controller {
	index = null;
	gamepad = null;
	values = {}
	#eventListenersOn = {}
	#eventListenersWhile = {}
	#eventListenersOff = {}

	constructor(index=0) {
		this.index = index;
		controllers.push(this);
		initialize();
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
}

export function initialize() {

	console.log("To connect any controller, press any button");
	window.addEventListener("gamepadconnected", (e) => {

		let gamepadListeners = controllers.filter((elem) => !!elem).filter((listener=new Xbox, index) => {
			return listener.index == index;
		});
		for(let i = 0; i < gamepadListeners.length; i ++){
			let gamepadListener = gamepadListeners[i];
			gamepadListener.triggerEvent("connect");
		}

		console.log(
			"Gamepad connected at index %d:\n\t- %s\n\t- %d buttons\n\t- %d axes",
			e.gamepad.index,
			e.gamepad.id,
			e.gamepad.buttons.length,
			e.gamepad.axes.length,
		);
	});


	window.addEventListener("gamepaddisconnected", (e) => {

		let gamepadListeners = controllers.filter((elem) => !!elem).filter((listener=new Xbox) => {
			return listener.index == e.gamepad.index;
		});
		for(let i = 0; i < gamepadListeners.length; i ++){
			let gamepadListener = gamepadListeners[i];
			gamepadListener.triggerEvent("disconnect");
		}

		console.log(
			"Gamepad disconnected from index %d:\n\t- %s",
			e.gamepad.index,
			e.gamepad.id,
		);
	});

	function tick() {

		let gamepads = navigator.getGamepads();

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
	tick();

}