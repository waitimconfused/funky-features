import { canvas, innerScreen } from "../../play/main.js";

export class Rect {

	#position = {
		x: 0,
		y: 0
	};
	#size = {
		width: 0,
		height: 0
	}
	#style = {
		fill: "red.",
		stroke: "transparent",
		strokeWidth: 0
	}

	constructor(){}

	setSize(rectWidth=0, rectHeight=0){
		this.#size.width = rectWidth;
		this.#size.height = rectHeight;
		return(this);
	}
	moveTo(posX=0, posY=0){
		this.#position.x = posX;
		this.#position.y = posY;
	}
	setFill(colour){
		this.#style.fill = colour;
	}
	setStroke(colour="", size=1){
		this.#style.stroke = colour;
		this.#style.strokeWidth = size;
	}
	async render(shiftX=0, shiftY=0){
		let context = canvas.getContext("2d");

		context.lineWidth = this.#style.strokeWidth;
		context.strokeStyle = this.#style.stroke;
		context.fillStyle = this.#style.fill;
		
		context.fillRect(
			Math.floor(this.#position.x + shiftX),
			Math.floor(this.#position.y + shiftY),
			Math.floor(this.#size.width),
			Math.floor(this.#size.height)
		);
	}
}