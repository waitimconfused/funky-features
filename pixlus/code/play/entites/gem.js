import { Entity, EntityList } from "./index.js";
import { speed } from "../behind/animations.js";
import { player } from "./player.js";

export class Gem extends Entity {
	#destinations = [];
	position = {
		x: 0,
		y: 0
	};
	image = {
		source: `../../code/assets/blocks/images/gem.png`,
		animationLength: 6,
		width: 16,
		height: 16,
		tileCoords: {
			X: 0,
			Y: 0
		}
	};

	#loopFunc = async() => {
		let distanceToPlayer = calcDistance(this, player);
		if(distanceToPlayer < 32){
			if(this.#destinations.length >= 1){
				this.teleportTo(this.#destinations[0].x, this.#destinations[0].y)
				this.#destinations.shift();
			}else{
				if(EntityList.includes(this) == false) return undefined;
				await this.teleportTo(0, 0);
				let indexOfThis = EntityList.indexOf(this);
				EntityList = EntityList.splice(indexOfThis, 1);
				delete this;
			}
		}else{
			await delay(6 * speed);
		}
	}

	#loop = setInterval(this.#loopFunc, 6 * speed);

	addDestination(posX=0, posY=0){
		this.#destinations.push({x: posX, y: posY});
	}

	async teleportTo(posX, posY){
		this.image.tileCoords.Y = 16;
		this.image.animationLength = 5;
		
		clearInterval(this.#loop);
		await delay(speed * 5);
		this.image.tileCoords.Y = 0;
		this.image.animationLength = 6;
		this.moveToBlock(posX, posY);
		this.image.tileCoords.Y = 0;
		this.animationLength = 6;
		this.#loop = setInterval(this.#loopFunc, 6 * speed);
	}
}



function delay(time=1000){
	return new Promise(resolve => setTimeout(resolve, time));
}
function calcDistance(currentEntity=(new Cat), entity=(new Entity)){
	let distanceX = currentEntity.position.x - entity.position.x;
	distanceX = Math.abs(distanceX);
	let distanceY = currentEntity.position.y - entity.position.y;
	distanceY = Math.abs(distanceY);
	let distance = Math.sqrt( Math.pow(distanceX, 2) + Math.pow(distanceY, 2) );
	distance = Math.floor(Math.abs(distance));

	return distance
}