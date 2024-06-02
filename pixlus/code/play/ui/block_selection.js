import { MousePositions } from "../behind/keyboard.js";
import { currentEditingLayer } from "../behind/world_editor.js";

import { camera, currentWorld as currentWorldName, innerScreen, scale } from "../main.js";
import { calculateSize } from "../screen/resize.js";

export var selectedBlockX;
export var selectedBlockY;
export var selectedBlock = {
	position: {
		X: 0,
		Y: 0
	},
	block: ""
};

export async function blockSelecter(){

	let blockCoordsFromScreen = getBlockFromScreenPos(
		MousePositions.X,
		MousePositions.Y
	);

	let imagePositionX = (blockCoordsFromScreen.x * 16 * scale ) - camera.targetPos.x;
	let imagePositionY = (blockCoordsFromScreen.y * 16 * scale ) - camera.targetPos.y;

	return {
		x: imagePositionX,
		y: imagePositionY
	};
}

/**
 * Get a block from any specified coord, in screen-space
 * @param {number} screenX Position relative to camera position (0 being left)
 * @param {number} screenY Position relative to camera position (0 being top)
 * @returns  {object} { x: number, y: number, block: string }
 */
export function getBlockFromScreenPos(screenX=0, screenY=0){

	let selectedBlockX = calculateSize(screenX);
	let selectedBlockY = calculateSize(screenY);

	selectedBlockX += calculateSize(camera.targetPos.x / 16 / scale);
	selectedBlockY += calculateSize(camera.targetPos.y / 16 / scale);

	let currentWorld = localStorage.getItem(`world.${currentWorldName}`);
	currentWorld = JSON.parse(currentWorld);
	currentWorld = currentWorld.world;

	selectedBlock.position.X = selectedBlockX;
	selectedBlock.position.Y = selectedBlockY;

	let WorldCurrentLayer = currentWorld[currentEditingLayer-1]
	if(selectedBlockY > -1 && selectedBlockX > -1){
		if(selectedBlockY < WorldCurrentLayer.length){
			if(selectedBlockX < WorldCurrentLayer[selectedBlockY].length){
				selectedBlock.block = WorldCurrentLayer[selectedBlockY][selectedBlockX] || "air";
			}else{
				selectedBlock.block = "air";
			}
		}else{
			selectedBlock.block = "air";
		}
	}else{
		selectedBlock.block = "air";
	}

	return {
		x: selectedBlockX,
		y: selectedBlockY,
		block: selectedBlock.block
	};
}