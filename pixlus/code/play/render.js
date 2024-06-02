import { innerScreen, UI_options, camera, canvas } from "./main.js";

import { player, renderPlayer } from "./entites/player.js";

import { image } from "./image.js";
import blocks from "../assets/blocks/blocks.json" with {type: "json"};
import block_actions from "./block_actions.js";
const blockActionRunner = new block_actions;

import getFrame from "./behind/animations.js";
import { KeyPressed, MousePositions, cancleKeyPress, keybinds } from "./behind/keyboard.js";
import { Entity, EntityList } from "./entites/index.js";
import { getBlockFromScreenPos } from "./ui/block_selection.js";
import { text } from "./ui/fonts.js";

import texturePack from "../assets/UI/ui.json" with {type: "json"};
import { blockTextures } from "../texturepack.js";
import { addon } from "../addons/cache.js";

export var CashedBlockData = {};
export var CashedBlockOptions = {};

var blockActionIndicator = {
	show: false
};

export default async function render(currentWorldName="", showIngameMenu=false){
	let context = innerScreen.getContext("2d");
	blockActionIndicator = {show: false};
	context.imageSmoothingEnabled = false;

	let currentWorld = localStorage.getItem(`world.${currentWorldName}`);
	currentWorld = JSON.parse(currentWorld);
	if(!currentWorld) return false;
	currentWorld = currentWorld.world;

	let myEntityList = EntityList.sort((a, b) => a.position.y-b.position.y);

	context.fillStyle = "#7a8ba1";
	context.fillRect(0, 0, innerScreen.width, innerScreen.height);

	await renderLayer(currentWorld, 0);
	await renderLayer(currentWorld, 1);
	await renderLayer(currentWorld, 2);

	myEntityList.forEach((CurrentEntity=(new Entity)) => {
		let block_topLeft = getBlockFromScreenPos(0, 0);
		let block_bottomRight = getBlockFromScreenPos(0, 0);

		if(CurrentEntity.position.x < block_topLeft.x && CurrentEntity.position.x > block_bottomRight.x) return undefined;
		if(CurrentEntity.position.y < block_topLeft.y && CurrentEntity.position.y > block_bottomRight.y) return undefined;

		CurrentEntity.render();
	});
	await renderLayer(currentWorld, 3);
	renderPlayer({
		alpha: 0.25,
		brightness: 1
	});

	if(blockActionIndicator.show == true){
		let actionIndicator = texturePack.UI.indicators.blocks.action;

		image(
			`../../code/assets/UI/images/${getFrame(actionIndicator.source)}`,

			player.position.x - camera.targetPos.x - (actionIndicator.width / 2),
			player.position.y - camera.targetPos.y - (16*1.5) - (actionIndicator.height / 2),

			actionIndicator.width,
			actionIndicator.height,
			
			0, 0, 16, 16
		);
		text(blockActionIndicator?.text, 0, 10, 16);
	}

	myEntityList.forEach((CurrentEntity=(new Entity)) => {
		CurrentEntity.everyTick();
	});

	if(UI_options.currentMenu == ""){
		myEntityList.forEach((CurrentEntity=(new Entity)) => {
			CurrentEntity.renderTag();
		});
	}

	let cursor = {
		x: MousePositions.global.X / canvas.width * innerScreen.width,
		y: MousePositions.global.Y / canvas.height * innerScreen.height
	}

	// cursor.x -= 8;
	// cursor.y -= 8;

	cursor.x = Math.floor(cursor.x / 16) * 16;
	cursor.y = Math.floor(cursor.y / 16) * 16;

	cursor.x -= Math.floor(camera.targetPos.x % 16);
	cursor.y -= Math.floor(camera.targetPos.y % 16);

	// cursor.x -= Math.floor(innerScreen.width / 2);
	// cursor.y -= Math.floor(innerScreen.height / 2);

	context.fillStyle = "red";
	context.fillRect(cursor.x, cursor.y, 16, 16);
}

async function renderLayer(currentWorld=0, worldLayerNumber=0){

	let offset = getBlockFromScreenPos(0, 0);

	// offset.x = 0;
	// offset.y = 0;

	let rows = Math.floor(innerScreen.height / 16);
	let columns = Math.floor(innerScreen.width / 16);
	for(let y = 0; y < rows + 2; y++){

		for(let x = 0; x < columns + 2; x++){

			await renderBlock(
				currentWorld,
				worldLayerNumber,
				x + offset.x,
				y + offset.y
			);

		}

	}

}

async function renderBlock(currentWorld=[], worldLayerNumber=1, x=0, y=0){
	x = Math.floor(x);
	y = Math.floor(y);

	if(y < 0) return undefined;
	if(x < 0) return undefined;

	if(y > (currentWorld[worldLayerNumber]?.length || y-1)) return undefined;
	if(x > (currentWorld[worldLayerNumber][y]?.length || x-1) ) return undefined;

	let currentBlock = currentWorld[worldLayerNumber][y][x];

	if(currentBlock == "air" || currentBlock == "" || currentBlock == undefined) return undefined;

	let currentBlockType = currentBlock.split(":")[0];
	let currentBlockVariant = currentBlock.split(":")[1] || "";

	let blockPositionX = (x * 16) - camera.targetPos.x;
	let blockPositionY = (y * 16) - camera.targetPos.y;

	if(currentBlockType in blockTextures == false) return false;
	if(currentBlockVariant in blockTextures[currentBlockType] == false) return false;

	cacheBlock(currentBlock);

	let currentBlockData = blockTextures[currentBlockType][currentBlockVariant];

	if(
		worldLayerNumber == 2 &&
		currentBlockData?.aspects?.standing?.img?.source !== undefined &&
		Math.floor( (player.position.x) / 16) == x &&
		Math.floor( (player.position.y-2) / 16) == y
	){

		image(
			`../../code/assets/blocks/images/${currentBlockData.aspects.standing.img.source}`,

			blockPositionX,
			blockPositionY,

			16, 16,

			currentBlockData.aspects.standing.img.tileCoords?.X + (getFrame(currentBlockData.aspects.standing.img.animationLength)) * currentBlockData.aspects.standing.img.width,
			currentBlockData.aspects.standing.img.tileCoords?.Y,

			currentBlockData.aspects.standing.img?.width,
			currentBlockData.aspects.standing.img?.height,
		);
	}else{
		if(!currentBlockData?.img?.source) return false

		image(
			`../../code/assets/blocks/images/${currentBlockData.img.source}`,

			blockPositionX,
			blockPositionY,

			16, 16,

			currentBlockData.img?.tileCoords?.X + (getFrame(currentBlockData.img?.animationLength)) * currentBlockData.img?.width,
			currentBlockData.img?.tileCoords?.Y,

			currentBlockData.img?.width,
			currentBlockData.img?.height,
		);
	}
	if(
		(
			currentBlockData.aspects?.action !== undefined ||
			isEmptyObject(CashedBlockOptions[currentBlockType]?.addon) == false
		) &&
		Math.floor( (player.position.x) / 16) == x &&
		Math.floor( (player.position.y-2) / 16) == y
	){
		blockActionIndicator = currentBlockData.aspects;
		blockActionIndicator.show = true;

		if(KeyPressed(keybinds.action)){
			cancleKeyPress(keybinds.action);
			if(CashedBlockOptions[currentBlockType].addon){
				let addonName = CashedBlockOptions[currentBlockType].addon;
				addonName = addonName.replace(/^addons\//g, "");
				addon(addonName, {
					block: {
						type: currentBlock,
						pos: {
							x: x,
							y: y,
							layer: worldLayerNumber+1
						}
					}
				}).then((addon) => {
					addon.interact();
				});
			}else if(blockActionIndicator?.action){
				let blockFunction = blockActionRunner.interpert(
					blockActionIndicator.action
				);
				blockFunction.run();
			}
		}
	}
	// Finnished drawing block that is onscreen
}

export async function cacheBlock(currentBlock=""){

	if(currentBlock in CashedBlockData) return CashedBlockData[currentBlock];
	
	let blockType = currentBlock.split(":")[0];
	let blockVariant = currentBlock.split(":")[1] || "";

	if((blockType in blocks.types) == false) return false;

	let {default: currentData} = await import(`../../code/assets/blocks/${blocks.types[blockType]}`, {
		with: { type: "json"}
	});

	let variantData = {};

	if(blockVariant in currentData.block){
		variantData = currentData.block[blockVariant];
	}else{
		variantData = currentData.block[""];
	}

	CashedBlockData[currentBlock] = variantData;
	CashedBlockOptions[blockType] = currentData?.options || {};
	
	return currentData || false;
}

function isEmptyObject(obj){
	if(!obj) return true;
	return Object.keys(obj).length === 0 && obj.constructor === Object;
}