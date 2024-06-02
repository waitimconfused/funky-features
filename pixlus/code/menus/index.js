import { Menu } from "../MenuCreator/menu.js";
import { Image, Rect, Text } from "../MenuCreator/elements.js";

import { blockSelecter, getBlockFromScreenPos } from "../play/ui/block_selection.js";
import UI from "../assets/UI/ui.json" with {type: "json"};
import { UI_options, FPS, scale, currentWorld, canvas, camera, innerScreen, actualScale } from "../play/main.js";
import { currentEditingLayer, setEditingLayer } from "../play/behind/world_editor.js";
import { CashedBlockData, cacheBlock } from "../play/render.js";
import { KeyPressed, MousePositions } from "../play/behind/keyboard.js";
import { calculateSize } from "../play/screen/resize.js";

const menu = new Menu;

const blockSelector = new Menu;

let blockSelecterImage = new Image;
blockSelecterImage.setSource(`../../code/assets/UI/images/${UI.UI.blockSelection.img.source}`);
blockSelecterImage.setSize(16, 16);
blockSelecterImage.moveTo(0, 0);
blockSelector.addElement(blockSelecterImage);
menu.addElement(blockSelector);

let worldEditing_layerIcon = new Image;
worldEditing_layerIcon.setSource("../../code/assets/UI/images/layers.png");
worldEditing_layerIcon.setRawSize(16, 25);
worldEditing_layerIcon.scaleBy(4);
worldEditing_layerIcon.moveTo(canvas.width - (16*4) - 44, 36);

let selectedBlockIcon = new Image;
selectedBlockIcon.setSource("../../code/assets/blocks/images/grass_block.png");
selectedBlockIcon.img.tileData.X = 16;
selectedBlockIcon.img.tileData.Y = 16;
menu.addElement(selectedBlockIcon);

let selectedBlockIconBorder = new Image;
selectedBlockIconBorder.setSource(`../../code/assets/UI/images/${UI.UI.blockSelection.img.source}`);
menu.addElement(selectedBlockIconBorder);

menu.addElement(worldEditing_layerIcon);

let text = new Text;

text.setContent(`FPS: NULL`);
text.setSize(64);
text.moveTo(0, 0);

menu.addElement(text);

export default async function(){
	// let blockSelecterData = await blockSelecter(JSON.parse(localStorage.getItem("worldNumber")));
	let blockselectorPosition = getBlockFromScreenPos(MousePositions.global.X, MousePositions.global.Y);
	blockSelector.shift(
		blockselectorPosition.x * scale,
		blockselectorPosition.y * 16 * scale * 16
	);

	if(KeyPressed("1")){
		setEditingLayer(1)
	}
	if(KeyPressed("2")){
		setEditingLayer(2)
	}
	if(KeyPressed("3")){
		setEditingLayer(3)
	}
	if(KeyPressed("4")){
		setEditingLayer(4)
	}

	if(UI_options.currentMenu !== ""){
		blockSelecterImage.setSize(0, 0);
		worldEditing_layerIcon.scaleBy(0);
		selectedBlockIconBorder.scaleBy(0);
		selectedBlockIcon.setSize(0, 0);
	}else{
		blockSelecterImage.setSize(scale * 16 * 16, scale * 16 * 16);

		worldEditing_layerIcon.scaleBy(4);
		worldEditing_layerIcon.moveTo(canvas.width - (16*4) - 44, 36);
		worldEditing_layerIcon.img.tileData.X = (currentEditingLayer - 1) * 16;

		selectedBlockIconBorder.scaleBy(4);
		selectedBlockIconBorder.moveTo(canvas.width - (16*4) - 44, 144);

		selectedBlockIcon.moveTo(canvas.width - (16*4) - 32, 144+12);

		let currentBlock = localStorage.getItem("currentBlock") || "grass_block";

		if(currentBlock in CashedBlockData == false) cacheBlock(currentBlock);

		if(currentBlock in CashedBlockData){

			let currentBlockData = CashedBlockData[currentBlock];

			selectedBlockIcon.setSource(`../../code/assets/blocks/images/${currentBlockData.img.source}`);
			selectedBlockIcon.setSize(16 * scale * 11, 16 * scale * 11);
			selectedBlockIcon.setRawSize(currentBlockData.img.width, currentBlockData.img.height, 16);
			if(currentBlockData.img.tileCoords){
				selectedBlockIcon.img.tileData.X = currentBlockData.img.tileCoords.X;
				selectedBlockIcon.img.tileData.Y = currentBlockData.img.tileCoords.Y;
			}
		}
	}

	text.setContent(`FPS: ${UI_options.getFPS()}`);

	return(menu);
}