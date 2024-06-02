import { canvas } from "../../play/main.js";
import { text } from "../../play/ui/fonts.js";

export class Text {
	#text = "";
	style = {
		size: 16,

		position: {
			X: 0,
			Y: 0
		}
	};
	setContent(text){
		this.#text = text;
		this.style.width = this.#text.length * (this.style.size * 0.75);
	}
	setSize(size=0){
		this.style.size = Math.max(size, 16);
		this.style.width = this.#text.length * (this.style.size * 0.75);
	}
	moveTo(X=0, Y=0){
		this.style.position.X = X;
		this.style.position.Y = Y;
	}
	render(shiftX=0, shiftY=0){
		text(
			this.#text,
			this.style.position.X + this.style.size / 2 + shiftX,
			this.style.position.Y + this.style.size / 2 + shiftY,
			this.style.size,
			canvas
		);
	}
}