import playerController from "../../assets/entities/player/controller.json" with {type: "json"};
const playerData = playerController.player;
import { FPS, UI_options, currentWorld, delta } from "../main.js";

import { KeyPressed, keybinds, keysPressed } from "../behind/keyboard.js";

import reloadWorlds from "../../worlds/reload.js";
import { Entity } from "./index.js";
import getFrame from "../behind/animations.js";
reloadWorlds();
waitForCurrentWorld();

class Player extends Entity {
	position = {
		x: 0,
		y: 0
	}
	image = {
		source: "",
		animationLength: 0,
		animationStyle: "idle",
		animationDirection: "right",
		width: 16,
		height: 16,
		tileCoords: {
			X: 0,
			Y: 0
		}
	};

	speedX = 0;
	speedY = 0;
	maxSpeed = 1;
	autoFixCollisions = true;
	
	everyTick = this.ReloadPlayerMovement;
	script = () => {
		let playerImage = playerData.animations[this.image.animationStyle][this.image.animationDirection];

		let currentBlockAnimationFrameNumber = 0;
	
		if(playerImage.animationLength > 0){
			let arrayOfNumberedFrames = [];
			for(let i = 0; i < playerImage.animationLength; i++){
				arrayOfNumberedFrames.push(i);
			}
			currentBlockAnimationFrameNumber = getFrame(arrayOfNumberedFrames);
		}
		this.image.source = "../../code/assets/entities/player/images/"+playerImage.source;
		this.image.tileCoords.X = playerImage.tileCoords.X + (currentBlockAnimationFrameNumber) * playerImage.width;
		this.image.tileCoords.Y = playerImage.tileCoords.Y;
	
	};
	ReloadPlayerMovement(){

		this.maxSpeed = 100 * (delta);
	
		if(UI_options.currentMenu !== "") return undefined
	
		let keyUp = keybinds.movement.up;
		let keyDown = keybinds.movement.down;
		let keyLeft = keybinds.movement.left;
		let keyRight = keybinds.movement.right;


		if(KeyPressed(keyUp))   this.speedY = -this.maxSpeed;
		if(KeyPressed(keyDown)) this.speedY = this.maxSpeed;

		if(KeyPressed(keyLeft)){
			this.speedX = -this.maxSpeed;
		}
		if(KeyPressed(keyRight)) this.speedX = this.maxSpeed;

		if(Math.round(this.speedX) < 0){
			this.image.animationDirection = "left";
		}if(Math.round(this.speedX) > 0){
			this.image.animationDirection = "right";
		}

		let totalSpeedX = Math.floor( Math.abs(this.speedX) );
		let totalSpeedY = Math.floor( Math.abs(this.speedY) );
		if(totalSpeedX * 10 !== 0 || totalSpeedY * 10 !== 0){
			this.image.animationStyle = "walk";
		}else{
			this.image.animationStyle = "idle";
		}

		if( Math.abs(this.speedX) <= 0.5 ) this.speedX = 0;
		if( Math.abs(this.speedY) <= 0.5 ) this.speedY = 0;

		this.moveByPixel(Math.round(this.speedX), Math.round(this.speedY));

		let slowdown = 15 * delta;

		if(this.speedX < 0){
			this.speedX += slowdown;
		}else if(this.speedX > 0){
			this.speedX -= slowdown;
		}

		if(this.speedY < 0){
			this.speedY += slowdown;
		}else if(this.speedY > 0){
			this.speedY -= slowdown;
		}

		if(this.speedX < -this.maxSpeed){
			this.speedX = -this.maxSpeed;
		}else if(this.speedX > this.maxSpeed){
			this.speedX = this.maxSpeed;
		}

		if(this.speedY < -this.maxSpeed){
			this.speedY = -this.maxSpeed;
		}else if(this.speedY > this.maxSpeed){
			this.speedY = this.maxSpeed;
		}
	
		// if( (KeyPressed(keyUp) || KeyPressed(keyDown) || KeyPressed(keyLeft) || KeyPressed(keyRight)) == true && ControlKey == false){
	
		// 	if((
		// 		( KeyPressed(keyUp) && KeyPressed(keyDown) ) ||
		// 		( KeyPressed(keyLeft) && KeyPressed(keyRight) )
		// 	) == false){
		// 		this.image.animationStyle = "walk";
			
		// 		if(KeyPressed(keyUp))   this.moveByPixel(0, - Math.round(speed))
		// 		if(KeyPressed(keyDown)) this.moveByPixel(0, Math.round(speed))
	
		// 		if(KeyPressed(keyLeft)){
		// 			this.moveByPixel(- Math.round(speed), 0);
		// 			this.image.animationDirection = "left";
		// 		}
		// 		if(KeyPressed(keyRight)){
		// 			this.moveByPixel(Math.round(speed), 0);
		// 			this.image.animationDirection = "right";
		// 		}
	
		// 	}else{
		// 		this.image.animationStyle = "idle";
		// 	}
		// }else{
		// 	this.image.animationStyle = "idle";
		// }
	}
}
export var player = new Player;
export function renderPlayer(filters={}){
	player.render(filters);
}

function waitForCurrentWorld(){
	setTimeout(function(){
		if(currentWorld == undefined){
			waitForCurrentWorld();
		}else{
			player.position.x = JSON.parse(
				localStorage.getItem(`world.${currentWorld}`) ||
				JSON.stringify({spawnpoint: {X: 0}})
			).spawnpoint.X * 16 + 16/2;

			player.position.y = JSON.parse(
				localStorage.getItem(`world.${currentWorld}`) ||
				JSON.stringify({spawnpoint: {Y: 0}})
			).spawnpoint.Y * 16 + 16;	
		}
	}, 10);
}