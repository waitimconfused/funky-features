import { selectedBlock } from "../ui/block_selection.js";

import { currentWorld } from "../main.js";
import { Entity, EntityList } from "../entites/index.js";
import { cacheBlock } from "../render.js";

export var currentEditingLayer = 3;

export default async function PlaceBlock(
	blockData="grass_block",
	positionX=selectedBlock.position.X,
	positionY=selectedBlock.position.Y,
	blockLayer = currentEditingLayer
){
	currentEditingLayer = blockLayer
	let worldData = localStorage.getItem(`world.${currentWorld}`);
	worldData = JSON.parse(worldData);

	cacheBlock(blockData).then((json) => {
		console.log(json);
	})

	if(positionY >= 0){
		if(positionY > worldData.world[blockLayer-1].length - 1){
			while(positionY > worldData.world[blockLayer-1].length - 1){
				worldData.world[blockLayer-1].push([""]);
			}
		}
	}else{
		let unchangedPositionY = JSON.parse(JSON.stringify(positionY));
		while(positionY < 0){
			for (let layer = 0; layer < worldData.world.length; layer++) {
				worldData.world[layer].unshift([""]);
			}
			positionY += 1
		}
		positionY = 0;

		EntityList.forEach((entity=(new Entity)) => {
			entity.moveByBlock(0, Math.abs(unchangedPositionY));
		});

		worldData.spawnpoint.Y += Math.abs(unchangedPositionY);
	}

	if(positionX >= 0){
		if(positionX > worldData.world[blockLayer-1][positionY].length - 1){
			while(positionX > worldData.world[blockLayer-1][positionY].length - 1){
				worldData.world[blockLayer-1][positionY].push("");
			}
		}
	}else{
		let unchangedPositionX = JSON.parse(JSON.stringify(positionX));
		while(positionX < 0){
			for (let layer = 0; layer < worldData.world.length; layer++) {
				for(let layerX = 0; layerX < worldData.world[layer].length; layerX++){
					worldData.world[layer][layerX].unshift("");
				}
			}
			positionX += 1
		}
		positionX = 0;

		EntityList.forEach((entity=(new Entity)) => {
			entity.moveByBlock(Math.abs(unchangedPositionX), 0);
		});

		worldData.spawnpoint.X += Math.abs(unchangedPositionX);
	}

	let newBlockData = {
		position: {
			X: positionX,
			Y: positionY,
		},
		blockData: {
			new: blockData,
			old: worldData.world[blockLayer-1][positionY][positionX]/* [positionY][positionX] */,
		}
	};
	worldData.world[blockLayer-1][positionY][positionX] = blockData;

	localStorage.setItem(`world.${currentWorld}`, JSON.stringify(worldData));
}


export function setEditingLayer(layer=1){
	currentEditingLayer = layer;
}