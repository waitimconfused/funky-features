import { innerScreen } from "../main.js";

export default class Camera {
	targetType = "position";
	EntityTarget = [];
	targetPos = {
		x: 0,
		y: 0
	}

	trackEntity(...entities){
		this.targetType = "entity";
		this.EntityTarget = entities;
	}
	trackPos(posX=0,posY=0){
		this.targetType = "position";
		this.targetPos.x = posX;
		this.targetPos.y = posY;
	}

	update(){
		if(this.targetType == "entity"){
			let entityPosX = 0;
			let entityPosY = 0;
			
			this.EntityTarget.forEach((entity) => {
				entityPosX += entity.position.x;
				entityPosY += entity.position.y;
			});

			entityPosX /= this.EntityTarget.length;
			entityPosY /= this.EntityTarget.length;

			entityPosX -= innerScreen.width / 2;
			entityPosY -= innerScreen.height / 2;
	
			this.targetPos = {x: Math.floor(entityPosX), y: Math.floor(entityPosY)};
		}else if(this.targetType == "position"){
			return(undefined);
		}else{
			this.targetPos = {x: 0, y: 0};
			this.targetPos.x -= innerScreen.width / 2;
			this.targetPos.y -= innerScreen.height / 2;
		}
	}
}

function lerp(a=0, b=0, t=0.5){
	return a + (b - a) * t;
}