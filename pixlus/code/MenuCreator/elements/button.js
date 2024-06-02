import { KeyPressed, MousePositions, cancleKeyPress } from "../../play/behind/keyboard.js";
import { canvas, innerScreen } from "../../play/main.js";
import { Menu } from "../menu.js";
import { Text } from "./text.js";

export class Button {
	text = "";
	isClicked = false;
	onclick = () => {};
	onhover = () => {
		let textMenu = new Menu;
		let text = new Text;
		text.text = this.text;
		textMenu.addElement(text);
		textMenu.shift(MousePositions.X, MousePositions.Y);
		textMenu.render();
	};
	style = {
		size: 0,

		width: 100,
		height: 100,

		outlineColour: "#333333",
		outlineSize: 1,
		insetColour: "#00000080",
		insetSize: 1,

		position: {
			X: 0,
			Y: 0
		}
	};
	constructor(text=""){
		this.text = text;
	}
	setSize(width=100, height=100){
		this.style.width = width;
		this.style.height = height;
	}
	setOutlineSize(size=16){
		this.style.outlineSize = size;
	}
	setInsetSize(size=16){
		this.style.insetSize = size;
	}
	setClickEvent(callback=()=>{alert("Button has been clicked!")}){
		this.onclick = callback;
	}
	setEvent(event="", callback=()=>{alert("Button has been clicked!")}){
		this["on"+event] = callback;
	}
	moveTo(X=0, Y=0){
		this.style.position.X = X;
		this.style.position.Y = Y;
	}
	render(shiftX=0, shiftY=0){
		let context = canvas.getContext("2d");

		context.fillStyle = this.style.outlineColour;
		context.fillRect(
			Math.floor(this.style.position.X - this.style.outlineSize + shiftX),
			Math.floor(this.style.position.Y + shiftY),

			Math.floor(this.style.width + this.style.outlineSize * 2), Math.floor(this.style.height)
		);

		context.fillRect(
			Math.floor(this.style.position.X + shiftX),
			Math.floor(this.style.position.Y - this.style.outlineSize + shiftY),
			
			Math.floor(this.style.width), Math.floor(this.style.height + this.style.outlineSize * 2)
		);

		if(
			MousePositions.global.X >= this.style.position.X + shiftX &&
			MousePositions.global.Y >= this.style.position.Y + shiftY &&
			MousePositions.global.X <= this.style.position.X + shiftX + this.style.width &&
			MousePositions.global.Y <= this.style.position.Y + shiftY + this.style.height
		){

			context.fillStyle = "#f2f2f0";
			context.fillRect(
				Math.floor(this.style.position.X + shiftX),
				Math.floor(this.style.position.Y + shiftY),
				
				Math.floor(this.style.width), Math.floor(this.style.height)
			);

			this?.onhover();

			if(KeyPressed("MouseClick")){
				cancleKeyPress("mouseclick");
				this?.onclick();
			}
		}else{
			context.fillStyle = "#7a8ba1";
			context.fillRect(
				Math.floor(this.style.position.X + shiftX),
				Math.floor(this.style.position.Y + shiftY),
				
				Math.floor(this.style.width), Math.floor(this.style.height)
			);
		}
		context.fillStyle = this.style.insetColour;
		context.fillRect(
			Math.floor(this.style.position.X + shiftX),
			Math.floor(this.style.position.Y + this.style.height - this.style.insetSize + shiftY),

			Math.floor(this.style.width), Math.floor(this.style.insetSize)
		);
		context.fillRect(
			Math.floor(this.style.position.X + this.style.width - this.style.insetSize + shiftX),
			Math.floor(this.style.position.Y + shiftY),
			
			Math.floor(this.style.insetSize), Math.floor(this.style.height)
		);
	}
}

Array.prototype.removeAll = (item) => {
	let NewArray = Array.prototype.filter(function(x) {
		return x !== item;
	});
	return(NewArray);
}