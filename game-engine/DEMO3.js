import { engine, Point2 } from "./utils.js";
import * as components from "./components/index.js";
import { mouse, toRange } from "../toolbelt/toolbelt.js";

engine.setIcon("./DEMO_assets/4/favicon.svg");

var gamePaused = false;

var tiles = [];
const tileSize = 100;
var userSelectedComponentHash = "";

const colours = {

	background: "#000000",

	outline: "#343434",
	fill: "#232323",

	custom: {
		absorb_fill: "#660000",
		action: "#336600",
	},

	lightRay1: "#FDD78B",
	lightRay2: "#FFE524",
};

engine.setBackground(colours.background);
// engine.camera.disableZoom();

var mapBackgroundPadding = 40;
var mapBackground = new components.Rect();
engine.addObject(mapBackground);
mapBackground.colour = "transparent";
mapBackground.outline.colour = colours.outline;
mapBackground.outline.size = 20;
mapBackground.radius = 10 + mapBackgroundPadding;

var lightRay = new components.Path();
engine.addObject(lightRay);
lightRay.colour = "transparent";
lightRay.outline.colour = colours.lightRay1;
lightRay.outline.size = 50;

var lightRayEffect = new components.Path();
engine.addObject(lightRayEffect);
lightRayEffect.colour = "transparent";
lightRayEffect.outline.colour = colours.lightRay2;
lightRayEffect.outline.size = 25;

var levelTitle = new components.Text();
levelTitle.fixedPosition = false;
engine.addObject(levelTitle);
levelTitle.content = "";
levelTitle.textColour = "yellow";
levelTitle.textBaseLine = "middle";
levelTitle.font = "Inter";
levelTitle.styling = "bold";
levelTitle.outline.colour = colours.background;
levelTitle.outline.size = 10;
levelTitle.letterSpacing = 10;
levelTitle.textAlign = "center";
levelTitle.textSize = 50;
levelTitle.moveTo(0, 0);
levelTitle.script = () => {
	levelTitle.moveTo(map.width*tileSize/2, -tileSize/3);
}

var map = new class Map {
	width = 5;
	height = 5;

	targetsHit = 0;
	targetsRequired = NaN;

	#level = 0;
	#unlockedLevels = [];
	
	constructor() {
		Object.keys(localStorage).forEach((item) => {
			if( (/^level#(\d*?)$/).test(item) == false ) return;
			let achievedLevel =  parseInt(item.split(/^level#(\d*?)$/)[1]) ;
			this.#unlockedLevels.push(achievedLevel);
		});
	}

	loadLevel(level=this.#level, delay=400) {
		if(level > this.levels.length) level = 1;
		if(level < 0) level = this.levels.length + level + 1;
		this.#level = level;
		let generateMap = this.levels[level-1];

		localStorage.setItem(`level#${this.#level}`, "");
		
		gamePaused = true;

		setTimeout( () => {
			tiles.forEach( (tile) => {
				tile.remove();
			} )
			tiles = [];
			this.targetsHit = 0;
			this.targetsRequired = 0;
			generateMap();
			gamePaused = false;
		}, delay );
	}

	nextLevel(delay=400) {
		if(this.#level + 1 > this.levels.length) return;
		this.loadLevel(this.#level + 1, delay);
	}

	reload() {
		engine.camera.moveTo(this.width/2 * 100, this.height/2 * 100);

		mapBackground.display.set(this.width/2*100, this.height/2*100, this.width*100 + mapBackgroundPadding*2, this.height*100 + mapBackgroundPadding*2);

		engine.removeObject(lightRay);
		engine.removeObject(lightRayEffect);

		engine.addObject(lightRay);
		engine.addObject(lightRayEffect);
	}

	levels = [
		() => {
			this.width = 5;
			this.height = 5;

			this.reload();
			levelTitle.content = "REFLECT";

			makeTile("start", 90, 0, 0, {dragLock: true, rotationLock: true});
			makeTile("reflect", 90, 2, 2);
			makeTile("end", 180, 4, 4, {dragLock: true, rotationLock: true});
		},
		() => {
			this.width = 5;
			this.height = 5;

			this.reload();
			levelTitle.content = "BOX";

			makeTile("start", 90, 0, 0, {dragLock: true, rotationLock: true});
			makeTile("reflect", 0, 0, 4);
			makeTile("reflect", 0, 2, 2);
			makeTile("box", 0, 3, 4, {dragLock: true, rotationLock: true});
			makeTile("end", -90, 4, 4, {dragLock: true, rotationLock: true});
		},
		() => {
			this.width = 5;
			this.height = 5;

			this.reload();
			levelTitle.content = "SPLIT";

			makeTile("start", 90, 2, 0, {dragLock: true, rotationLock: true});
			makeTile("reflect", 0, 0, 2);
			makeTile("reflect", 0, 4, 2);
			makeTile("end", -90, 0, 4, {dragLock: true, rotationLock: true});
			makeTile("end", -90, 4, 4, {dragLock: true, rotationLock: true});
			makeTile("split", 90, 2, 4);
		},
		() => {
			let padding = 200;
			let buttonCount = 0;
			this.width = Math.floor((engine.canvas.width-padding*2) / tileSize) - 1;
			this.height = Math.floor(engine.canvas.height / tileSize) - 1;

			this.reload();

			engine.camera.moveBy(-padding, 0);
			levelTitle.content = "DEMO COMPLETE";

			setTimeout( () => {
				levelTitle.content = "";
			}, 2000 );

			makeTile("start", 90, 0, 0);
			makeTile("reflect", 0, 0, 2);
			makeTile("reflect", 0, 4, 2);
			makeTile("end", -90, 0, 4);
			makeTile("end", -90, 4, 4);
			makeTile("split", 90, 2, 4);

			makeButton("Light Source", "start");

			function makeButton(title="", type="") {
				let button = new components.ComponentGroup;
				let background = new components.Rect;
				let text = new components.Text;

				button.fixedPosition = true;
				background.fixedPosition = true;
				text.fixedPosition = true;

				engine.addObject(button);
				button.addObject(background);
				button.addObject(text);

				button.moveTo(mapBackgroundPadding/2, mapBackgroundPadding/2 + buttonCount*100);

				background.colour = "red";
				background.display.set(0, 0, 0, 0);
				background.transform.set(0, 0);
				background.radius = 10 + mapBackgroundPadding/2;
				
				text.content = title.toUpperCase();
				text.textColour = colours.custom.action;
				text.textAlign = "left";
				text.textBaseLine = "top";
				text.styling = "bold";
				text.moveTo(mapBackgroundPadding, mapBackgroundPadding);

				background.script = () => {
					background.setSize(text.display.w + mapBackgroundPadding, text.display.h + mapBackgroundPadding);

					if(
						mouse.position.x > background.displayOffset.x &&
						mouse.position.y > background.displayOffset.y &&
						mouse.position.x < background.displayOffset.x + background.displayOffset.w &&
						mouse.position.y < background.displayOffset.y + background.displayOffset.h
					) {
						background.colour = colours.outline;
						if (mouse.click_l && userSelectedComponentHash == "") {
							background.setAttribute("click", true);
							userSelectedComponentHash = button.hash;
						}
					} else {
						background.colour = colours.fill;
					}

					if (!mouse.click_l && background.getAttribute("click") && userSelectedComponentHash == button.hash) {
						let posX = Math.round( (mouse.position.x - engine.camera.position.x) / tileSize );
						let posY = Math.round( (mouse.position.y - engine.camera.position.y) / tileSize );
						console.log(posX, posY);
						makeTile(type, 0, posX, posY);
						background.setAttribute("click", false);
						userSelectedComponentHash = "";
					}
				};

				buttonCount += 1;
			}
		}
	]
}

map.loadLevel(1, 0);

function makeTile(type="", direction=90, x=0, y=0, tileOptions={ dragLock: false, rotationLock: false }) {

	if (type == "end") map.targetsRequired += 1;

	x = toRange(0, x, map.width-1);
	y = toRange(0, y, map.height-1);

	direction = Math.round(direction / 90) * 90

	direction %= 360;
	if(direction < 0) direction = 360 + direction;

	let tile = new components.ComponentGroup();
	let tileBackground = new components.Rect();
	let tileSymbol = new components.Path();
	var tileDragHandle = new components.Circle();
	var tileRotateHandle = new components.Circle();

	tile.moveTo( x * 100, y * 100 );

	engine.addObject(tile);
	tile.addObject(tileBackground);
	tile.addObject(tileSymbol);
	tile.addObject(tileDragHandle);
	tile.addObject(tileRotateHandle);

	tileBackground.colour = colours.fill;
	tileBackground.radius = tileSize/10;
	tileBackground.transform.set(0, 0);
	tileBackground.display.set(tileSize/8, tileSize/8, tileSize*0.75, tileSize*0.75);
	if (type == "box") tileBackground.display.set(0, 0, tileSize, tileSize);

	tileSymbol.outline.colour = colours.outline;
	tileSymbol.colour = colours.custom.absorb_fill;
	tileSymbol.outline.size = 20;

	tileDragHandle.colour = "none";
	tileDragHandle.outline.colour = colours.custom.action;
	tileDragHandle.outline.size = 0;
	tileDragHandle.radius = tileSize/4;
	tileDragHandle.display.set(tileSize*0.5, tileSize*0.5);

	tileRotateHandle.colour = "none";
	tileRotateHandle.outline.colour = colours.custom.action;
	tileRotateHandle.outline.size = 0;
	tileRotateHandle.radius = tileSize/8;

	let radian = direction * Math.PI/180;
	tileRotateHandle.display.set( Math.cos(radian) * tileSize/2 + 50, Math.sin(radian) * tileSize/2 + 50);

	tile.script = (tile) => {
		if(!gamePaused) dragTile(tile);
		if(!gamePaused) updateSymbol(tile);
	}

	if (type == "box") tileOptions.rotationLock = true;
	
	updateSymbol(tile);

	tileSymbol.setAttribute("rotation", -1);

	tile.setAttribute("type", type);
	tile.setAttribute("rotation", direction);
	tile.setAttribute("options", tileOptions);

	tile.setAttribute("isDragging", false);
	tile.setAttribute("isRotating", false);

	tiles.push(tile);
}


function moveUntilIntersection(lightRay=new components.Path(), radian=0, posX=0, posY=0) {
	let intersection = null;
	let stepSize = tileSize / 10;
	while (!intersection) {
		posX += Math.round(Math.cos(radian) * stepSize);
		posY += Math.round(Math.sin(radian) * stepSize);

		if (
			posX < 0 ||
			posX > map.width*tileSize ||
			posY < 0 ||
			posY > map.height*tileSize
		) {
			intersection = { getAttribute: () => "edge" };
		}

		for (let i = 1; i < tiles.length; i ++) {
			let tile = tiles[i];
			
			let roundedTilePosX = Math.round(tile.display.x / tileSize) * tileSize;
			let roundedTilePosY = Math.round(tile.display.y / tileSize) * tileSize;
			if (
				Math.round(posX) == roundedTilePosX + tileSize/2 &&
				Math.round(posY) == roundedTilePosY + tileSize/2
			) intersection = tile;
		}
	}
	lightRay.pen.lineTo(
		posX,
		posY
	);
	return intersection;
}

function marchRay(startingTile=new components.ComponentGroup, degree=0) {
	let posX = Math.round(startingTile.display.x / tileSize) * tileSize + tileSize/2;
	let posY = Math.round(startingTile.display.y / tileSize) * tileSize + tileSize/2;
	lightRay.pen.moveTo(posX, posY);

	degree %= 360;
	if(degree < 0) degree = 360 + degree;
	let radian = degree * (Math.PI / 180);

	let intersectedObject = moveUntilIntersection(lightRay, radian, posX, posY);
	let angle = radian * (180 / Math.PI);
	angle %= 360;
	if (angle < 0) angle = 360 + angle;

	let intersectedObjectRotation = intersectedObject.getAttribute("rotation");
	intersectedObjectRotation = Math.round(intersectedObjectRotation / 90) * 90;
	intersectedObjectRotation %= 360;
	if(intersectedObjectRotation < 0) intersectedObjectRotation = 360 + intersectedObjectRotation;

	let intersectedObjectType = intersectedObject.getAttribute("type");

	if (intersectedObjectType == "reflect") {
		if (intersectedObjectRotation == 0 || intersectedObjectRotation == 180) {
			if(angle == 0) radian += (90 * Math.PI) / 180;
			if(angle == 90) radian -= (90 * Math.PI) / 180;
			if(angle == 180) radian += (90 * Math.PI) / 180;
			if(angle == 270) radian -= (90 * Math.PI) / 180;
		} else if(intersectedObjectRotation == 90 || intersectedObjectRotation == 270) {
			if(angle == 0) radian -= (90 * Math.PI) / 180;
			if(angle == 90) radian += (90 * Math.PI) / 180;
			if(angle == 180) radian -= (90 * Math.PI) / 180;
			if(angle == 270) radian += (90 * Math.PI) / 180;
		} else {
			return;
		}
		marchRay(intersectedObject, radian * (180 / Math.PI));
	} else if (intersectedObjectType == "split") {
		let oppositeAngle = intersectedObjectRotation + 180;
		oppositeAngle %= 360;
		if (oppositeAngle < 0) oppositeAngle = 360 + angle;
		if (angle != oppositeAngle) return;
		marchRay(intersectedObject, angle - 90);
		marchRay(intersectedObject, angle + 90);
	} else if (intersectedObjectType == "end") {
		let oppositeAngle = intersectedObjectRotation + 180;
		oppositeAngle %= 360;
		if (oppositeAngle < 0) oppositeAngle = 360 + angle;
		if (angle == oppositeAngle && !intersectedObject.getAttribute("hit")) {
			intersectedObject.setAttribute("hit", true);
			map.targetsHit += 1;
		}
	}
}

lightRay.script = () => {

	if(gamePaused) return;

	lightRay.clearPath();
	lightRayEffect.clearPath();

	if (userSelectedComponentHash != "") return;

	for (let i = 0; i < tiles.length; i ++) {
		let tile = tiles[i];
		if (tile.getAttribute("type") != "start") continue;

		let degree = Math.round( tile.getAttribute("rotation") / 90 ) * 90;
		degree %= 360;
		if(degree < 0) degree = 360 + degree;
		marchRay(tile, degree);
	}

	if (map.targetsHit == map.targetsRequired) map.nextLevel();

	lightRayEffect.path = lightRay.path;
}

function updateSymbol(tile) {

	let tileSymbol = tile.getObject( tile.componentHashes[1] );
	let tileDirection = Math.round( tile.getAttribute("rotation") / 90 ) * 90;
	let tileType = tile.getAttribute("type");
	let symbolDirection = tileSymbol.getAttribute("rotation");
	let tileRotateHandle = tile.getObject( tile.componentHashes[3] );

	tileDirection %= 360;

	if (symbolDirection != tileDirection) {
		tileSymbol.clearPath();
		if (tileType == "start") {
			if (tileDirection == 0) {
				tileSymbol.pen.moveTo(tileSize, 0);
				tileSymbol.pen.lineTo(tileSize, tileSize);
				tileSymbol.pen.cubicCurveTo(
					0, tileSize,
					0, 0,
					tileSize, 0
				);
			} else if (tileDirection == 90) {
				tileSymbol.pen.moveTo(0, tileSize);
				tileSymbol.pen.lineTo(tileSize, tileSize);
				tileSymbol.pen.cubicCurveTo(
					tileSize, 0,
					0, 0,
					0, tileSize
				);
			} else if (tileDirection == 180) {
				tileSymbol.pen.moveTo(0, 0);
				tileSymbol.pen.lineTo(0, tileSize);
				tileSymbol.pen.cubicCurveTo(
					tileSize, tileSize,
					tileSize, 0,
					0, 0
				);
			} else if (tileDirection == 270) {
				tileSymbol.pen.moveTo(0, 0);
				tileSymbol.pen.lineTo(tileSize, 0);
				tileSymbol.pen.cubicCurveTo(
					tileSize, tileSize,
					0, tileSize,
					0, 0
				);
			}
		} else if (tileType == "end") {
			if (tileDirection == 0) {
				tileSymbol.pen.moveTo(tileSize, 0);
				tileSymbol.pen.lineTo(tileSize, tileSize*0.25);
				tileSymbol.pen.cubicCurveTo(
					tileSize*0.75, tileSize*0.25,
					tileSize*0.75, tileSize*0.75,
					tileSize, tileSize*0.75
				);
				tileSymbol.pen.lineTo(tileSize, tileSize);
				tileSymbol.pen.cubicCurveTo(
					tileSize*0.25, tileSize,
					tileSize*0.25, 0,
					tileSize, 0
				);
			} else if (tileDirection == 90) {
				tileSymbol.pen.moveTo(0, tileSize);
				tileSymbol.pen.lineTo(tileSize*0.25, tileSize);
				tileSymbol.pen.cubicCurveTo(
					tileSize*0.25, tileSize*0.75,
					tileSize*0.75, tileSize*0.75,
					tileSize*0.75, tileSize
				);
				tileSymbol.pen.lineTo(tileSize, tileSize);
				tileSymbol.pen.cubicCurveTo(
					tileSize, tileSize*0.25,
					0, tileSize*0.25,
					0, tileSize
				);
			} else if (tileDirection == 180) {
				tileSymbol.pen.moveTo(0, 0);
				tileSymbol.pen.lineTo(0, tileSize*0.25);
				tileSymbol.pen.cubicCurveTo(
					tileSize*0.25, tileSize*0.25,
					tileSize*0.25, tileSize*0.75,
					0, tileSize*0.75
				);
				tileSymbol.pen.lineTo(0, tileSize);
				tileSymbol.pen.cubicCurveTo(
					tileSize*0.75, tileSize,
					tileSize*0.75, 0,
					0, 0
				);
			} else if (tileDirection == 270) {
				tileSymbol.pen.moveTo(0, 0);
				tileSymbol.pen.lineTo(tileSize*0.25, 0);
				tileSymbol.pen.cubicCurveTo(
					tileSize*0.25, tileSize*0.25,
					tileSize*0.75, tileSize*0.25,
					tileSize*0.75, 0
				);
				tileSymbol.pen.lineTo(tileSize, 0);
				tileSymbol.pen.cubicCurveTo(
					tileSize, tileSize*0.75,
					0, tileSize*0.75,
					0, 0
				);
			}
		} else if (tileType == "reflect") {
			if (tileDirection == 0 || tileDirection == 180) {
				tileDirection = 0;
				tileSymbol.pen.moveTo(0, 0);
				tileSymbol.pen.lineTo(tileSize, tileSize);
			} else if (tileDirection == 90 || tileDirection == 270) {
				tileDirection = 270;
				tileSymbol.pen.moveTo(tileSize, 0);
				tileSymbol.pen.lineTo(0, tileSize);
			}
		} else if (tileType == "split") {
			if (tileDirection == 0) {
				tileSymbol.pen.moveTo(tileSize, tileSize/2);
				tileSymbol.pen.lineTo(tileSize*0.25, tileSize/2);
				tileSymbol.pen.moveTo(tileSize*0.25, 0);
				tileSymbol.pen.lineTo(tileSize*0.25, tileSize);
			} else if (tileDirection == 90) {
				tileSymbol.pen.moveTo(tileSize/2, tileSize);
				tileSymbol.pen.lineTo(tileSize/2, tileSize*0.25);
				tileSymbol.pen.moveTo(0, tileSize*0.25);
				tileSymbol.pen.lineTo(tileSize, tileSize*0.25);
			} else if (tileDirection == 180) {
				tileSymbol.pen.moveTo(0, tileSize/2);
				tileSymbol.pen.lineTo(tileSize*0.75, tileSize/2);
				tileSymbol.pen.moveTo(tileSize*0.75, 0);
				tileSymbol.pen.lineTo(tileSize*0.75, tileSize);
			} else if (tileDirection == 270) {
				tileSymbol.pen.moveTo(tileSize/2, 0);
				tileSymbol.pen.lineTo(tileSize/2, tileSize*0.75);
				tileSymbol.pen.moveTo(0, tileSize*0.75);
				tileSymbol.pen.lineTo(tileSize, tileSize*0.75);
			}
		}
		tileSymbol.setAttribute("rotation", tileDirection);
	}
	let radian = tileDirection * Math.PI/180;
	tileRotateHandle.display.set( Math.cos(radian) * tileSize/2 + 50, Math.sin(radian) * tileSize/2 + 50);
}

function dragTile(tile=new components.ComponentGroup) {

	let tileType = tile.getAttribute("type");
	let tileOptions = tile.getAttribute("options") || { dragLock: false, rotateLock: false };

	let tileBackground = tile.getObject( tile.componentHashes[0] );
	let tileSymbol = tile.getObject( tile.componentHashes[1] );
	let tileDragHandle = tile.getObject( tile.componentHashes[2] );
	let tileRotateHandle = tile.getObject( tile.componentHashes[3] );

	let isDragHandleHovering = (
		mouse.position.x > tile.displayOffset.x + tileDragHandle.display.x - tileDragHandle.radius &&
		mouse.position.y > tile.displayOffset.y + tileDragHandle.display.y - tileDragHandle.radius &&
		
		mouse.position.x < tile.displayOffset.x + tileDragHandle.display.x + tileDragHandle.radius &&
		mouse.position.y < tile.displayOffset.y + tileDragHandle.display.y + tileDragHandle.radius
	);
	

	let isRotateHandleHovering = (
		mouse.position.x > tile.displayOffset.x + tileRotateHandle.display.x - tileRotateHandle.radius &&
		mouse.position.y > tile.displayOffset.y + tileRotateHandle.display.y - tileRotateHandle.radius &&
		
		mouse.position.x < tile.displayOffset.x + tileRotateHandle.display.x + tileRotateHandle.radius &&
		mouse.position.y < tile.displayOffset.y + tileRotateHandle.display.y + tileRotateHandle.radius
	);

	if (isDragHandleHovering) {
		isDragHandleHovering = Math.hypot(mouse.position.x - tile.displayOffset.x - tileDragHandle.display.x, mouse.position.y - tile.displayOffset.y - tileDragHandle.display.y) < tileDragHandle.radius;
	}

	if (isRotateHandleHovering) {
		isRotateHandleHovering = Math.hypot(mouse.position.x - tile.displayOffset.x - tileRotateHandle.display.x, mouse.position.y - tile.displayOffset.y - tileRotateHandle.display.y) < tileRotateHandle.radius;
	}

	if(tileOptions.rotationLock) isRotateHandleHovering = false;
	if(tileOptions.dragLock) isDragHandleHovering = false;

	if(
		mouse.click_l == true &&
		tile.getAttribute("isDragging") == true &&
		tile.getAttribute("isRotating") == false
		// userSelectedComponentHash == tile.hash
	) {
		let dx = tile.getAttribute("offsetX");
		let dy = tile.getAttribute("offsetY");

		if(!dx) dx = mouse.position.x - tile.display.x; tile.setAttribute("offsetX", dx);
		if(!dy) dy = mouse.position.y - tile.display.y; tile.setAttribute("offsetY", dy);

		tile.moveTo(toRange(0, mouse.position.x - dx, (map.width-1)*100), toRange(0, mouse.position.y - dy, (map.height-1)*100));
		tile.setAttribute("isDragging", mouse.click_l);
		tileDragHandle.colour = tileDragHandle.outline.colour;
		userSelectedComponentHash = tile.hash;
	} else {
		tile.moveTo( Math.round(tile.display.x / tileSize) * tileSize, Math.round(tile.display.y / tileSize) * tileSize );

		tile.setAttribute("isDragging", isDragHandleHovering && mouse.click_l && !tile.getAttribute("isRotating") && userSelectedComponentHash == "");
		tile.setAttribute("offsetX", null);
		tile.setAttribute("offsetY", null);
		tileDragHandle.colour = "none";
		if ( tile.getAttribute("isDragging") ) userSelectedComponentHash = tile.hash;
	}

	if(
		mouse.click_l == true &&
		tile.getAttribute("isRotating") == true &&
		tile.getAttribute("isDragging") == false &&
		userSelectedComponentHash == tile.hash
	) {

		let dx = mouse.position.x - (tile.displayOffset.x + tileSize/2);
		let dy = mouse.position.y - (tile.displayOffset.y + tileSize/2);

		let radian = Math.atan( dy / dx );
		let degree = radian * 180/Math.PI;

		if(dx < 0) degree -= 180;

		degree %= 360;
		if(degree < 0) degree = 360 + degree;
		degree = Math.round(degree);

		tile.setAttribute("isRotating", mouse.click_l);
		tile.setAttribute("rotation", degree);
		tileRotateHandle.colour = tileRotateHandle.outline.colour;
	} else {

		tile.setAttribute("rotation", Math.round(tile.getAttribute("rotation") / 90) * 90 );

		tile.setAttribute("isRotating", isRotateHandleHovering && mouse.click_l && !tile.getAttribute("isDragging") && userSelectedComponentHash == "");
		tileRotateHandle.colour = "none";
		if ( tile.getAttribute("isRotating") ) userSelectedComponentHash = tile.hash;
	}
	if (userSelectedComponentHash == tile.hash && !tile.getAttribute("isDragging") && !tile.getAttribute("isRotating") ) userSelectedComponentHash = "";



	let showHandles = (
		mouse.position.x > tile.displayOffset.x &&
		mouse.position.y > tile.displayOffset.y &&
		
		mouse.position.x < tile.displayOffset.x + tileSize &&
		mouse.position.y < tile.displayOffset.y + tileSize
	);

	showHandles = showHandles || isRotateHandleHovering || tile.getAttribute("isDragging") || tile.getAttribute("isRotating");
	showHandles = showHandles && ["", tile.hash].includes(userSelectedComponentHash)

	if(!tileOptions.rotationLock) tileRotateHandle.outline.size = showHandles * 10;
	if(!tileOptions.dragLock) tileDragHandle.outline.size = showHandles * 10;

}