import { UI_options } from "../play/main.js";
import { Image } from "./elements.js";

export class Menu {

	#elements = [];

	#shift = {
		x: 0,
		y: 0,
	}

	addElement(element){
		this.#elements.push(element);
	}

	shift(shiftX=0, shiftY=0){
		this.#shift.x = shiftX;
		this.#shift.y = shiftY;
	}

	async render(){
		for(let i = 0; i < this.#elements.length; i++){
			if("render" in this.#elements[i]){
				this.#elements[i].render(this.#shift.x, this.#shift.y);
			}else{
				console.error("Failed to render unknown element");
			}
		}
	}
}