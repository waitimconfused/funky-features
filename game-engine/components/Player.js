import { engine } from "../utils.js";
import { Image } from "./Image.js";

export class Player extends Image {
	colour = "cyan";
	fixedPosition = false;
	script(){
		let speed = (16 * 6) / 16;
		if(engine.keyboard.isKeyPressed("w")) this.display.y -= speed;
		if(engine.keyboard.isKeyPressed("s")) this.display.y += speed;
		if(engine.keyboard.isKeyPressed("a")){
			this.display.x -= speed;
			this.display.w = Math.abs(this.display.w) * -1;
		}
		if(engine.keyboard.isKeyPressed("d")){
			this.display.x += speed;
			this.display.w = Math.abs(this.display.w);
		}
	}
}