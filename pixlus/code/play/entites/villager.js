import { Entity } from "./index.js";
import { speed } from "../behind/animations.js";
import { actualPlayer, calculateEntitySpeed } from "./player.js";

export class Villager extends Entity {
	catStyle = "orange";
	image = {
		source: `../../code/assets/entities/cats/${styles[this.catStyle].sleep}`,
		animationLength: 4,
		width: 16,
		height: 16,
		tileCoords: {
			X: 0,
			Y: 0
		},
		
		flipX: false
	};

	#everyTick = () => {};
	#loop = setInterval(() => {
		this.#everyTick();
	}, 60);

	timeHasBeenSittingFor = 0;
	sleepiness = getRandomInt(100, 200)
	min_proximity = getRandomInt(32, 64);
	max_proximity = getRandomInt(this.min_proximity, this.min_proximity * 2);

	followEntity(entity=(new Entity)){
		this.title = "";
		this.#everyTick = function(){

			let distanceToEntity = calcDistance(this, entity);

			this.animation = () => {};
			this.script = () => {};
			if(distanceToEntity > this.min_proximity){

				if(entity.position.x < this.position.x){
					this.image.flipX = true;
				}else if(entity.position.x > this.position.x){
					this.image.flipX = false;
				}

				this.timeHasBeenSittingFor = 0;
				this.animations.walk();

				let dx = entity.position.x - this.position.x;
				let dy = entity.position.y - this.position.y;

				let angle = Math.atan(dx / dy) + 180 * (this.position.y > entity.position.y);

				let speed = calculateEntitySpeed();
				if(distanceToEntity > this.max_proximity) speed *= 2;

				let changeX = Math.round(speed * Math.sin(angle));
				let changeY = Math.round(speed * Math.cos(angle));

				this.position.y += changeY;
				this.position.x += changeX;

				// if(changeX < 0) this.fixCollisions("left")
				// if(changeY > 0) this.fixCollisions("right")

				// if(Math.abs(changeY) > Math.abs(changeX)){
				// 	if(changeY < 0){
				// 		this.fixCollisions("up");
				// 	}else{
				// 		this.fixCollisions("down");
				// 	}
				// 	if(changeX < 0){
				// 		this.fixCollisions("left");
				// 	}else{
				// 		this.fixCollisions("right");
				// 	}
				// }
				// if(Math.abs(changeX) > Math.abs(changeY)){
				// 	if(changeX < 0){
				// 		this.fixCollisions("left");
				// 	}else{
				// 		this.fixCollisions("right");
				// 	}
				// 	if(changeY < 0){
				// 		this.fixCollisions("up");
				// 	}else{
				// 		this.fixCollisions("down");
				// 	}
				// }
			}else{
				this.timeHasBeenSittingFor += 1;
				if(this.timeHasBeenSittingFor > this.sleepiness){
					this.timeHasBeenSittingFor = 130;
					this.animations.sleep();
				}else{
					if(getRandomInt(0, 80) == 1){
						this.animations.lick();
					}else{
						this.animations.sit();
					}
				}
			}
		}
		this.#everyTick();
	}
	animation = () => {};
	animationLength = 3;
	#animationInterval = setInterval(() => {
		this.animation();
	}, speed * 4 * this.animationLength);
	setAnimationLength(length=0){
		this.animationLength = Math.max(0, length);

		this.#animationInterval = setInterval(() => {
			this.animation();
		}, speed * 4 * this.animationLength);
	}
	setAnimation(animation=async()=>{
		await this.animations.sit();
		await this.animations.sit();
		await this.lick();
	}){

		let distanceX = this.position.x - actualPlayer.position.x;
		distanceX = Math.abs(distanceX);
		let distanceY = this.position.y - actualPlayer.position.y;
		distanceY = Math.abs(distanceY);
		let distance = Math.sqrt( Math.pow(distanceX, 2) + Math.pow(distanceY, 2) );
		distance = Math.abs(distance);

		animation(distance);
		this.animation = animation;
		this.#animationInterval = setInterval(() => {

			this.animation({
				distanceToPlayer: calcDistance(this)
			});
		}, speed * 4 * this.animationLength);
	}

	animations = {
		sit: async () => {
			this.image.source = `../../code/assets/entities/cats/${styles[this.catStyle].sit}`;
			this.image.animationLength = 4;
			await delay(speed * 4);
		},
		lick: async () => {
			this.image.source = `../../code/assets/entities/cats/${styles[this.catStyle].lick}`;
			this.image.animationLength = 4;
			await delay(speed * 4);
		},
		walk: async () => {
			this.image.source = `../../code/assets/entities/cats/${styles[this.catStyle].walk}`;
			this.image.animationLength = 8;
			await delay(speed * 8);
		},
		sleep: async () => {
			this.image.source = `../../code/assets/entities/cats/${styles[this.catStyle].sleep}`;
			this.image.animationLength = 4;
			await delay(speed * 4);
		}
	}
}



function delay(time=1000){
	return new Promise(resolve => setTimeout(resolve, time));
}
function calcDistance(cat=(new Cat), entity=(new Entity)){
	let distanceX = cat.position.x - entity.position.x;
	distanceX = Math.abs(distanceX);
	let distanceY = cat.position.y - entity.position.y;
	distanceY = Math.abs(distanceY);
	let distance = Math.sqrt( Math.pow(distanceX, 2) + Math.pow(distanceY, 2) );
	distance = Math.floor(Math.abs(distance));

	return distance
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}