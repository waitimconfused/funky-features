import { CashedBlockData } from "../render.js"
import { image } from "../image.js";
import { camera, currentWorld, delta, innerScreen } from "../main.js";
import getFrame, { speed } from "../behind/animations.js";

import { Menu } from "../../MenuCreator/menu.js";
import { Rect, Text } from "../../MenuCreator/elements.js"
import { player } from "./player.js";
import { blockTextures } from "../../texturepack.js";

export var EntityList = [];

export class Entity {
	title = "";
	position = {
		x: 0,
		y: 0
	};
	image = {
		source: "",
		animationLength: 0,
		width: 16,
		height: 16,
		tileCoords: {
			X: 0,
			Y: 0
		},
		
		flipX: false
	};
	apply(data=this.image){
		this.image = data;
	}
	everyTick = () => {};
	script = async () => {};
	loop = setInterval(async () => {
		await this.script();
	}, 75);

	constructor(title=""){
		this.title = title;
		EntityList.push(this);
		EntityList = EntityList.sort((a={position:{x:0,y:0}}, b={position:{x:0,y:0}}) => {
			return b.position.y - a.position.y;
		});
	}
	
	autoFixCollisions = true;

	standingOnBlock(){
		let world = JSON.parse(localStorage.getItem(`world.${currentWorld}`)).world;
	
		let blockX = Math.floor(this.position.x / 16);
		let blockY = Math.floor(this.position.y / 16);
	
		let standingBlocks = [];
		for(let layer = 0; layer < world.length; layer ++){
	
			if(blockY < world[layer].length && blockY >= 0){
				if(blockX < world[layer][blockY].length && blockX >= 0){
					standingBlocks[layer] = world[layer][blockY][blockX] || "air";
				}else{
					standingBlocks[layer] = "air";
				}
			}else{
				standingBlocks[layer] = "air";
			}
		}
	
		return(standingBlocks);
	}
	foundCollision(layerToCheck=1){

		let standingBlock = this.standingOnBlock()[layerToCheck-1];
	
		if(standingBlock == "air" || standingBlock == "" || standingBlock == undefined) return false;

		let standingBlockType = standingBlock.split(":")[0];
		let standingBlockVariant = standingBlock.split(":")[1] || "";

		if(standingBlockType in blockTextures == false) return false;
		if(standingBlockVariant in blockTextures[standingBlockType] == false) return false;
	
		let standingBlockBounds = blockTextures[standingBlockType][standingBlockVariant].aspects.bounds;
	
		if(standingBlockBounds == undefined) return(false);
	
	
		let innerBlockX = Math.floor(this.position.x % 16);
		let innerBlockY = Math.floor(this.position.y % 16);
	
		let innerY = Math.floor(innerBlockY / ( 16 / standingBlockBounds.length ));
		let innerX = Math.floor(innerBlockX / ( 16 / standingBlockBounds[innerY].length ));
	
		return standingBlockBounds[innerY][innerX] == "X";
	}
	fixCollisions(direction="", speed=1){

		direction = direction.toLowerCase();
	
		while(
			// this.foundCollision(1) ||
			this.foundCollision(2) ||
			this.foundCollision(3)
		){
			if(direction == "up"){
				this.position.y += speed;
			}else if(direction == "down"){
				this.position.y -= speed;
			}else if(direction == "left"){
				this.position.x += speed;
			}else if(direction == "right"){
				this.position.x -= speed;
			}else{
				console.error("The function (fixCollisions) requires the parameter \"direction\" to be UP DOWN LEFT or RIGHzT")
			}
		}
	}

	moveToBlockRelative(blockX=0, blockY=0){

		let worldData = localStorage.getItem(`world.${currentWorld}`);
		worldData = JSON.parse(worldData);

		this.position.x = worldData.spawnpoint.X * 16 + blockX * 16 + 16 / 2;
		this.position.y = worldData.spawnpoint.Y * 16 + blockY * 16 + 16;
	}
	moveToBlockFixed(blockX=0, blockY=0){

		let worldData = localStorage.getItem(`world.${currentWorld}`);
		worldData = JSON.parse(worldData);

		this.position.x = worldData.spawnpoint.X * 16 + blockX * 16 + 16 / 2;
		this.position.y = worldData.spawnpoint.Y * 16 + blockY * 16 + 16;
	}
	moveToPixel(pixelX=0, pixelY=0){
		this.position.x = pixelX;
		this.position.y = pixelY;
	}
	moveByBlock(blockX=0, blockY=0){

		if(this.autoFixCollisions == true){
			for(let i = 0; i < Math.abs(blockX) * 16; i++){
				this.position.x += blockX / Math.abs(blockX);
				if(blockX < 0){
					this.fixCollisions("left");
				}else if(blockX > 0){
					this.fixCollisions("right");
				}
			}
			for(let i = 0; i < blockY * 16; i++){
				this.position.y += blockY / Math.abs(blockY);
				if(blockY < 0){
					this.fixCollisions("up");
				}else if(blockY > 0){
					this.fixCollisions("down");
				}
			}
		}else{
			this.position.x += blockX * 16;
			this.position.y += blockY * 16;
		}
	}
	moveByPixel(pixelX=0, pixelY=0){
		if(this.autoFixCollisions == true){
			this.position.x += pixelX;
			this.position.x = Math.round(this.position.x);

			if(pixelX < 0){
				this.fixCollisions("left");
			}else if(pixelX > 0){
				this.fixCollisions("right");
			}
			this.position.y += pixelY;
			this.position.y = Math.round(this.position.y);

			if(pixelY < 0){
				this.fixCollisions("up");
			}else if(pixelY > 0){
				this.fixCollisions("down");
			}
		}else{
			this.position.x += pixelX;
			this.position.y += pixelY;
		}
		this.position.x = Math.round(this.position.x);
		this.position.y = Math.round(this.position.y);
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

		animation();
		this.animation = animation;
		this.#animationInterval = setInterval(() => {

			this.animation();
		}, speed * 4 * this.animationLength);
	}

	animations = {
		sit: async () => {
			this.image.source = `../../code/assets/entities/cats/${catStyles[this.catStyle].sit}`;
			this.image.animationLength = 4;
			await delay(speed * 4);
		},
		lick: async () => {
			this.image.source = `../../code/assets/entities/cats/${catStyles[this.catStyle].lick}`;
			this.image.animationLength = 4;
			await delay(speed * 4);
		},
		walk: async () => {
			this.image.source = `../../code/assets/entities/cats/${catStyles[this.catStyle].walk}`;
			this.image.animationLength = 8;
			await delay(speed * 8);
		},
		sleep: async () => {
			this.image.source = `../../code/assets/entities/cats/${catStyles[this.catStyle].sleep}`;
			this.image.animationLength = 4;
			await delay(speed * 4);
		}
	};

	#hiddenScript = () => {};
	#hiddenScriptLoop = setInterval(() => {
		this.#hiddenScript();
	}, 60);

	timeHasBeenSittingFor = 0;
	sleepiness = this.getRandomInt(100, 200)
	speed = Math.round(Math.random() * 10) / 10 + 75;
	min_proximity = this.getRandomInt(32, 64);
	max_proximity = this.getRandomInt(this.min_proximity, this.min_proximity * 2);

	followEntity(entity=(new Entity)){
		this.title = "";
		this.#hiddenScript = function(){

			let distanceToEntity = this.distanceTo(entity);

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

				let radianAngle = Math.atan(dx / dy) + Math.PI * (this.position.y > entity.position.y);

				let speed = this.speed * delta;
				if(distanceToEntity > this.max_proximity) speed *= 2;
				if(distanceToEntity > Math.max(innerScreen.width, innerScreen.height)) this.moveToPixel(entity.position.x, entity.position.y);

				let changeX = speed * Math.sin(radianAngle);
				let changeY = speed * Math.cos(radianAngle);

				this.moveByPixel(changeX, changeY);

			}else{
				this.timeHasBeenSittingFor += 1;
				if(this.timeHasBeenSittingFor > this.sleepiness){
					this.timeHasBeenSittingFor = 130;
					this.animations.sleep();
				}else{
					if(this.getRandomInt(0, 80) == 1){
						this.animations.lick();
					}else{
						this.animations.sit();
					}
				}
			}
		}
		this.#hiddenScript();
	}

	forever(callback=()=>{}){
		this.script = callback;
	}
	render(filters={}){

		let screenPosX = this.position.x - camera.targetPos.x/*  - 16 / 2 */;
		let screenPosY = this.position.y - camera.targetPos.y/*  - 16 */;

		let currentAnimationFrameNumber = 0;

		if(this.image.animationLength > 0){
			let arrayOfNumberedFrames = [];
			for(let i = 0; i < this.image.animationLength; i++){
				arrayOfNumberedFrames.push(i);
			}
			currentAnimationFrameNumber = getFrame(arrayOfNumberedFrames);
		}

		if(screenPosX > -16 && screenPosX < innerScreen.width + 16){
			if(screenPosY > -16 && screenPosY < innerScreen.height + 16){

				image(
					this.image.source,
		
					screenPosX - (16 / 2),
					screenPosY - 15,
					16,
					16,
		
					this.image.tileCoords.X + (currentAnimationFrameNumber) * this.image.width,
					this.image.tileCoords.Y,
					this.image.width,
					this.image.height,
					filters, this.image.flipX
				);
			}
		}
	}
	renderTag(){
		if(this.distanceTo(player) > 32) return false;
		let tagMenu = new Menu;

		let textElement = new Text;
		textElement.setContent(this.title);
		textElement.moveTo(-10, -8);

		let backgroundElement = new Rect;
		backgroundElement.setFill("black");
		backgroundElement.setSize(textElement.style.width, 16);

		tagMenu.addElement(backgroundElement);
		tagMenu.addElement(textElement);
		tagMenu.shift(innerScreen.width / 2 - textElement.style.width / 2, 8)
		tagMenu.render();
	}

	distanceTo(entity=(new Entity)){
		let distanceX = this.position.x - entity.position.x;
		let distanceY = this.position.y - entity.position.y;
		let distance = Math.floor(Math.hypot( distanceX, distanceY));
	
		return distance;
	}
	startCameraTrack(){
		camera.trackEntity(this);
	}
	stopCameraTrack(){
		camera.trackPos(camera.targetPos.x, camera.targetPos.y);
	}

	delay(time=1000){
		return new Promise(resolve => setTimeout(resolve, time));
	}
	getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

}