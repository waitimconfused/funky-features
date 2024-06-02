import { Menu } from "../../MenuCreator/menu.js";
import { Background, Image, Button, Text } from "../../MenuCreator/elements.js";

import { UI_options, canvas } from "../../play/main.js";
import Settings from "../../../options/index.json" with {type: "json"};
import PackageJSON from "../../../package.json" with {type: "json"};

import reloadWorlds from "../../worlds/reload.js";
import { reloadAddons } from "../../addons/cache.js";

const menu = new Menu;
let buttonSize = 64;

menu.addElement(
	(new Background)
		.setSource("code/assets/blocks/images/Tiles/dirt.png")
		.setTileSize(buttonSize * 2, buttonSize * 2)
);

const image = new Image;
image.setSource(`code/assets/entities/player/images/idle/left.png`);
image.setAnimationLength(3);

let imageSize = canvas.height * 0.75;
image.moveTo(canvas.width - imageSize, canvas.height / 2 - imageSize / 2);
image.setSize(imageSize, imageSize);
menu.addElement(image);

const playButton = new Button;
playButton.moveTo(buttonSize * 1.5, buttonSize * 1.5);
playButton.setSize(buttonSize * 3.25, buttonSize);
playButton.setOutlineSize(buttonSize / 16);
playButton.setInsetSize(buttonSize / 16);
playButton.setClickEvent( function(){
	UI_options.currentMenu = "";
} );
menu.addElement(playButton);

const text = new Text;
text.setContent("Play");
text.moveTo(buttonSize, buttonSize);
text.setSize(buttonSize);
menu.addElement(text);


const quitButton = new Button;
quitButton.moveTo(buttonSize * 1.5, buttonSize * 3);
quitButton.setSize(buttonSize * 3.25, buttonSize);
quitButton.setOutlineSize(buttonSize / 16);
quitButton.setInsetSize(buttonSize / 16);
quitButton.setClickEvent( function(){
	window.location.href = "../";
} );
menu.addElement(quitButton);

const quitText = new Text;
quitText.setContent("Quit");
quitText.moveTo(buttonSize, buttonSize * 2.5);
quitText.setSize(buttonSize);
menu.addElement(quitText);

let versionText = new Text;
versionText.setSize(buttonSize);
versionText.setContent(PackageJSON.version);

let resetButton = new Button;
resetButton.setSize(buttonSize * 9.25, buttonSize);
resetButton.setOutlineSize(buttonSize / 16);
resetButton.setInsetSize(buttonSize / 16);
resetButton.setClickEvent( function(){
	reloadWorlds(true);
} );

let resetText = new Text;
resetText.setContent("Reset Worlds");
resetText.setSize(buttonSize);

if(Settings.advanced.show_version == true){
	menu.addElement(versionText);
	menu.addElement(resetButton);
	menu.addElement(resetText);
}


export default async function(){
	image.moveTo(canvas.width - imageSize, canvas.height / 2 - imageSize / 2);
	image.setSize(imageSize, imageSize);

	versionText.moveTo(buttonSize, canvas.height - buttonSize * 3.25 );
	resetButton.moveTo(buttonSize * 1.5, canvas.height - buttonSize * 1.5);
	resetText.moveTo(buttonSize, canvas.height - buttonSize * 2);

	return(menu);
}