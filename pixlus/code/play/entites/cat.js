import { Entity } from "./index.js";
import { speed } from "../behind/animations.js";

const catStyles = {
	orange_tabby: {
		sleep: "orange_tabby/sleep.png",
		sit: "orange_tabby/sit.png",
		lick: "orange_tabby/lick.png",
		walk: "orange_tabby/walk.png"
	},
	tabby: {
		sleep: "tabby/sleep.png",
		sit: "tabby/sit.png",
		lick: "tabby/lick.png",
		walk: "tabby/walk.png"
	},
	moochy: {
		sleep: "moochy/sleep.png",
		sit: "moochy/sit.png",
		lick: "moochy/lick.png",
		walk: "moochy/walk.png"
	}
}

export class Cat extends Entity {
	catStyle = "orange_tabby";
	image = {
		source: `../../code/assets/entities/cats/${catStyles[this.catStyle].sleep}`,
		animationLength: 4,
		width: 16,
		height: 16,
		tileCoords: {
			X: 0,
			Y: 0
		},
		
		flipX: false
	};
	constructor(title=""){
		super(title);
		if(title.toLowerCase() == "moochy"){
			this.catStyle = "moochy";
			this.image.source = `../../code/assets/entities/cats/${catStyles["moochy"].sleep}`;
		}
	}

	animations = {
		sit: async () => {
			this.image.source = `../../code/assets/entities/cats/${catStyles[this.catStyle].sit}`;
			this.image.animationLength = 4;
			await this.delay(speed * 4);
		},
		lick: async () => {
			this.image.source = `../../code/assets/entities/cats/${catStyles[this.catStyle].lick}`;
			this.image.animationLength = 4;
			await this.delay(speed * 4);
		},
		walk: async () => {
			this.image.source = `../../code/assets/entities/cats/${catStyles[this.catStyle].walk}`;
			this.image.animationLength = 8;
			await this.delay(speed * 8);
		},
		sleep: async () => {
			this.image.source = `../../code/assets/entities/cats/${catStyles[this.catStyle].sleep}`;
			this.image.animationLength = 4;
			await this.delay(speed * 4);
		}
	};
}



function delay(time=1000){
	return new Promise(resolve => setTimeout(resolve, time));
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}