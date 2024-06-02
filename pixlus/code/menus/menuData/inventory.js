import { Menu } from "../../MenuCreator/menu.js";
import { Background, Image, Button, Rect } from "../../MenuCreator/elements.js";
import getFrame from "../../play/behind/animations.js"
import { UI_options, canvas, scale } from "../../play/main.js";
import { KeyPressed, cancleKeyPress } from "../../play/behind/keyboard.js";

import { blockTextures } from "../../texturepack.js";

var selectedBlockType = "";

var blockSize = 64;

export default async function(){

	let menu = new Menu;

	menu.addElement(
		(new Background)
			.setSource("code/assets/blocks/images/Tiles/dirt.png")
			.setTileSize(128, 128)
	);
	
	let backdrop = new Rect;

	let backdropWidth = canvas.width / 4 * 3;
	let backdropHeight = canvas.height / 4 * 3;
	let backdropPosX = canvas.width / 2 - backdropWidth / 2;
	let backdropPosY = 36;

	backdrop.setSize(
		backdropWidth,
		backdropHeight
	);
	backdrop.moveTo(backdropPosX, backdropPosY);

	backdrop.setFill("#333333");
	menu.addElement(backdrop);

	let tabs = await blockTabs(canvas.width / 2, canvas.height / 2);
	let scale = blockSize * 1.25;
	tabs.shift(scale, scale * 1.5);
	menu.addElement(tabs);

	let blocks = await makeBlocks(selectedBlockType, backdropWidth / (blockSize * 1.75));
	blocks.shift(backdropPosX + 10, backdropPosY + 10);

	menu.addElement(blocks);

	return(menu);
}

async function blockTabs(){

	let menu = new Menu;

	let numberOfBlockTypes = Object.keys(blockTextures).length;
	let scale = blockSize * 1.25;

	let rect = new Rect;
	rect.setSize( numberOfBlockTypes * scale - 2, blockSize / 4 );
	rect.moveTo(-1, blockSize - (blockSize / 4) + 1);
	rect.setFill("#333333");

	menu.addElement(rect);

	let tabX = -scale;
	let tabY = 0

	for(let index = 0; index < numberOfBlockTypes; index++){
		let currentBlockTypeName = Object.keys(blockTextures)[index];
		let currentBlockType = blockTextures[currentBlockTypeName][""];
		tabX += scale;

		if(tabX >= scale * 3){
			tabX = 0;
			tabY += scale;
		}

		tabX = Math.floor(tabX);
		tabY = Math.floor(tabY);

		let itemButton = new Button;
		itemButton.setClickEvent(() => {
			selectedBlockType = currentBlockTypeName;
		});
		itemButton.setSize(blockSize, blockSize);
		itemButton.moveTo(tabX, tabY);
		itemButton.style.outlineSize = 8;
		itemButton.style.insetSize = 0;

		menu.addElement(itemButton);

		if(currentBlockType.img.source !== ""){
			let itemImage = new Image;
			itemImage.setSource(
				`./code/assets/blocks/images/${currentBlockType.img.source}`,
	
				(currentBlockType.img?.tileCoords?.X || 0) + currentBlockType.img.width * getFrame(currentBlockType.img.animationLength),
				(currentBlockType.img?.tileCoords.Y || 0),
				
				currentBlockType.img.width,
				currentBlockType.img.height
			);
			itemImage.setSize(blockSize, blockSize);
			itemImage.moveTo(tabX, tabY);
			menu.addElement(itemImage);
		}
	}

	return menu;
}

async function makeBlocks(blocktype="", maxNumberOfBlocksX=1){

	maxNumberOfBlocksX = Math.floor(maxNumberOfBlocksX);
	let menu = new Menu;

	if(blocktype.startsWith(":") || blocktype == undefined) return menu;

	if(blocktype in blockTextures == false) return(menu);

	let blockVariants = blockTextures[blocktype];
	let blockVariantNames = Object.keys(blockVariants);
	for(let index = 0; index < blockVariantNames.length; index++){
		let currentBlockVariant = blockVariants[blockVariantNames[index]];

		let blockX = (index % maxNumberOfBlocksX) * blockSize * 1.75;
		let blockY = Math.floor( index / maxNumberOfBlocksX ) * blockSize * 1.75;


		let itemVariantButton = new Button(blocktype+":"+blockVariantNames[index]);
		itemVariantButton.setEvent("click", () => {
			localStorage.setItem("currentBlock", blocktype+":"+blockVariantNames[index]);
			UI_options.closeMenu();
		});
		itemVariantButton.setSize(blockSize, blockSize);
		itemVariantButton.moveTo(blockX, blockY);
		itemVariantButton.style.outlineColour = "black";
		itemVariantButton.style.outlineSize = 1;
		itemVariantButton.style.insetSize = 0;
		menu.addElement(itemVariantButton);

		if(currentBlockVariant.img.source == "") continue;

		let itemVariantImage = new Image;
		itemVariantImage.setSource(
			`./code/assets/blocks/images/${currentBlockVariant.img.source}`,


			currentBlockVariant.img?.tileCoords?.X + currentBlockVariant?.img?.width * getFrame(currentBlockVariant?.img?.animationLength),
			currentBlockVariant.img?.tileCoords?.Y,
			
			currentBlockVariant.img.width,
			currentBlockVariant.img.height,
		);
		itemVariantImage.setSize(blockSize, blockSize);
		itemVariantImage.moveTo(blockX, blockY);
		menu.addElement(itemVariantImage);

	}
	return(menu);
}