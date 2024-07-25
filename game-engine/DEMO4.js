import { ComponentGroup, engine, Point2 } from "./utils.js";
import * as components from "./components/index.js";
import { keyboard, mouse, toRange } from "../toolbelt/toolbelt.js";

engine.setBackground("black");

var tiles = [];
var tilesThatCanRedirectLight = [ "reflect" ];
const tileSize = 100;

// mouse.position.alwaysRelativeTo(engine.canvas);

var userSelectedComponentHash = "";

var mapWidth = 5;
var mapHeight = 5;

engine.camera.moveTo(mapWidth/2 * 100, mapHeight/2 * 100);

var mapBackgroundPadding = 20;

var mapBackground = new components.Rect();
engine.addObject(mapBackground);
mapBackground.display.set(mapWidth/2*100, mapHeight/2*100, mapWidth*100 + mapBackgroundPadding*2, mapHeight*100 + mapBackgroundPadding*2);
mapBackground.colour = "black";
mapBackground.outline.colour = "#343434";
mapBackground.outline.size = 10;
mapBackground.radius = 10 + mapBackgroundPadding;

let mapResizerRadius = 40;
var mapResizer = new components.Path();
// engine.addObject(mapResizer);
mapResizer.fixedPosition = true;
mapResizer.moveTo(engine.canvas.width / 2 + mapWidth/2 * 100, engine.canvas.height / 2 + mapHeight/2 * 100);
mapResizer.pen.moveTo(mapResizerRadius, 0);
mapResizer.pen.quadraticCurveTo(mapResizerRadius, mapResizerRadius, 0, mapResizerRadius);
mapResizer.colour = "transparent";
mapResizer.outline.colour = "#454545";
mapResizer.outline.size = 20;

mapResizer.script = () => {
	let isHovering = (
		mouse.position.x > mapResizer.display.x - mapResizerRadius - mapResizer.outline.size &&
		mouse.position.y > mapResizer.display.y - mapResizerRadius - mapResizer.outline.size &&
		
		mouse.position.x < mapResizer.display.x + mapResizerRadius + mapResizer.outline.size &&
		mouse.position.y < mapResizer.display.y + mapResizerRadius + mapResizer.outline.size
	);

	if (isHovering) {
		isHovering = Math.hypot(mouse.position.x - mapResizer.display.x, mouse.position.y - mapResizer.display.y) < mapResizerRadius;
	}

	if (
		mouse.click_l &&
		mapResizer.getAttribute("isResizing") == true &&
		userSelectedComponentHash == mapResizer.hash
	) {
		mapResizer.moveTo( mouse.position.x, mouse.position.y );
		mapResizer.setAttribute("isResizing", mouse.click_l);
		mapResizer.outline.colour = "white";
	} else {
		mapResizer.setAttribute("isResizing", isHovering && mouse.click_l && userSelectedComponentHash == "");
		if ( mapResizer.getAttribute("isResizing") ) userSelectedComponentHash = mapResizer.hash;
		mapResizer.outline.colour = "red";
		if (isHovering) {
			mapResizer.outline.colour = "pink";
		}
	
	}
	if (userSelectedComponentHash == mapResizer.hash && !mapResizer.getAttribute("isResizing") ) userSelectedComponentHash = "";
}

var lightRay = new components.Path();
engine.addObject(lightRay);
lightRay.colour = "transparent";
lightRay.outline.colour = "#fdd78b";
lightRay.outline.size = 50;

var lightRayEffect = new components.Path();
engine.addObject(lightRayEffect);
lightRayEffect.colour = "transparent";
lightRayEffect.outline.colour = "#FFE524";
lightRayEffect.outline.size = 25;

makeTile("source", Math.round(Math.random()) * 90, 0, 0);

makeTile("reflect", Math.round(Math.random()) * 90, 3, 2);
makeTile("reflect", Math.round(Math.random()) * 90, 2, 3);
makeTile("reflect", Math.round(Math.random()) * 90, 3, 4);
makeTile("reflect", Math.round(Math.random()) * 90, 4, 3);

makeTile("box", 0, 4, 4);

function makeTile(type="", direction=90, x=0, y=0) {

	x = toRange(0, x, mapWidth);
	y = toRange(0, y, mapHeight);

	direction = Math.round(direction / 90) * 90

	direction %= 360;
	if(direction < 0) direction = 360 + direction;

	let tile = new ComponentGroup();
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

	tileBackground.colour = "#232323";
	tileBackground.radius = 10;
	tileBackground.transform.set(0, 0);
	tileBackground.display.set(12.5, 12.5, 75, 75);
	if (type == "box") tileBackground.display.set(0, 0, 100, 100);

	tileSymbol.outline.colour = "#343434";
	tileSymbol.colour = "#600";
	tileSymbol.outline.size = 20;

	tileDragHandle.colour = "none";
	tileDragHandle.outline.colour = "#360";
	tileDragHandle.outline.size = 0;
	tileDragHandle.radius = 25;
	tileDragHandle.display.set(50, 50);

	tileRotateHandle.colour = "none";
	tileRotateHandle.outline.colour = "#360";
	tileRotateHandle.outline.size = 0;
	tileRotateHandle.radius = 12.5;

	let radian = direction * Math.PI/180;
	tileRotateHandle.display.set( Math.cos(radian) * tileSize/2 + 50, Math.sin(radian) * tileSize/2 + 50);

	tile.script = (tile) => {
		dragTile(tile);
		updateSymbol(tile);
	}

	let tileOptions = {
		dragLock: false,
		rotationLock: false
	};

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


lightRay.script = () => {

	lightRay.clearPath();

	if (userSelectedComponentHash != "") {
		lightRayEffect.clearPath();
		return;
	}

	for (let i = 0; i < tiles.length; i ++) {
		let tile = tiles[i];
		if (tile.getAttribute("type") != "source") continue;

		let symbol = tiles[i].getObject( tiles[i].componentHashes[1] );
		let background = tiles[i].getObject( tiles[i].componentHashes[0] );
		let degree = Math.round( tiles[i].getAttribute("rotation") / 90 ) * 90;
		degree %= 360;
		let radian = degree * (Math.PI / 180);

		let posX = Math.round(tiles[i].display.x / tileSize) * tileSize + 50;
		let posY = Math.round(tiles[i].display.y / tileSize) * tileSize + 50;
		let stepSize = 10;

		function moveUntilIntersection(radian=0, lightRay=new components.Path(), rect=new components.Rect()) {
			let hasIntersected = false;
			while (!hasIntersected) {
				posX += Math.round(Math.cos(radian) * stepSize);
				posY += Math.round(Math.sin(radian) * stepSize);
		
				if (
					posX - engine.camera.position.x < -mapWidth/2*100  ||
					posX - engine.camera.position.x > mapWidth/2*100  ||
					posY - engine.camera.position.y < -mapHeight/2*100 ||
					posY - engine.camera.position.y > mapHeight/2*100
				) {
					hasIntersected = { getAttribute: () => "edge" };
				}
		
				for (let i = 1; i < tiles.length; i ++) {
					let tile = tiles[i];
					
					let roundedTilePosX = Math.round(tile.display.x / tileSize) * tileSize;
					let roundedTilePosY = Math.round(tile.display.y / tileSize) * tileSize;
					if (
						Math.round(posX) == roundedTilePosX + tileSize/2 &&
						Math.round(posY) == roundedTilePosY + tileSize/2
					) hasIntersected = tile;
				}
			}
			lightRay.pen.lineTo(
				posX,
				posY
			);
			return hasIntersected;
		}
		lightRay.pen.moveTo(posX, posY);
		let intersectedObject = moveUntilIntersection(radian, lightRay, background);
		while (tilesThatCanRedirectLight.includes( intersectedObject.getAttribute("type") )) {
			let angle = radian * (180 / Math.PI);
			angle %= 360;

			if (angle < 0) {
				angle = 360 + angle;
			}

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
					break;
				}
			} else if (intersectedObjectType == "source") {
				throw new Error("Collided with tile:source")
			}
			intersectedObject = moveUntilIntersection(radian, lightRay, background);
		}

	}
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
		if (tileType == "source") {
			if (tileDirection == 0) {
				tileSymbol.pen.moveTo(100, 0);
				tileSymbol.pen.lineTo(100, 100);
				tileSymbol.pen.cubicCurveTo(
					0, 100,
					0, 0,
					100, 0
				);
			} else if (tileDirection == 90) {
				tileSymbol.pen.moveTo(0, 100);
				tileSymbol.pen.lineTo(100, 100);
				tileSymbol.pen.cubicCurveTo(
					100, 0,
					0, 0,
					0, 100
				);
			} else if (tileDirection == 180) {
				tileSymbol.pen.moveTo(0, 0);
				tileSymbol.pen.lineTo(0, 100);
				tileSymbol.pen.cubicCurveTo(
					100, 100,
					100, 0,
					0, 0
				);
			} else if (tileDirection == 270) {
				tileSymbol.pen.moveTo(0, 0);
				tileSymbol.pen.lineTo(100, 0);
				tileSymbol.pen.cubicCurveTo(
					100, 100,
					0, 100,
					0, 0
				);
			}
		} else if (tileType == "reflect") {
			if (tileDirection == 0 || tileDirection == 180) {
				tileDirection == 0
				tileSymbol.pen.moveTo(0, 0);
				tileSymbol.pen.lineTo(100, 100);
			} else if (tileDirection == 90 || tileDirection == 270) {
				tileDirection == 90;
				tileSymbol.pen.moveTo(100, 0);
				tileSymbol.pen.lineTo(0, 100);
			}
		}
		tileSymbol.setAttribute("rotation", tileDirection);
	}
	let radian = tileDirection * Math.PI/180;
	tileRotateHandle.display.set( Math.cos(radian) * tileSize/2 + 50, Math.sin(radian) * tileSize/2 + 50);
}

function dragTile(tile=new ComponentGroup) {

	let tileType = tile.getAttribute("type");
	let tileOptions = tile.getAttribute("options") || { dragLock: false, rotateLock: false };

	let tileBackground = tile.getObject( tile.componentHashes[0] );
	let tileSymbol = tile.getObject( tile.componentHashes[1] );
	let tileDragHandle = tile.getObject( tile.componentHashes[2] );
	let tileRotateHandle = tile.getObject( tile.componentHashes[3] );


	let isDragHandleHovering = (
		mouse.position.x > tileDragHandle.displayOffset.x - tileDragHandle.radius &&
		mouse.position.y > tileDragHandle.displayOffset.y - tileDragHandle.radius &&
		
		mouse.position.x < tileDragHandle.displayOffset.x + tileDragHandle.radius &&
		mouse.position.y < tileDragHandle.displayOffset.y + tileDragHandle.radius
	);

	let isRotateHandleHovering = (
		mouse.position.x > tileRotateHandle.displayOffset.x - tileRotateHandle.radius - tileRotateHandle.outline.size/2 &&
		mouse.position.y > tileRotateHandle.displayOffset.y - tileRotateHandle.radius - tileRotateHandle.outline.size/2 &&
		
		mouse.position.x < tileRotateHandle.displayOffset.x + tileRotateHandle.radius + tileRotateHandle.outline.size/2 &&
		mouse.position.y < tileRotateHandle.displayOffset.y + tileRotateHandle.radius + tileRotateHandle.outline.size/2
	);

	if (isDragHandleHovering) {
		isDragHandleHovering = Math.hypot(mouse.position.x - tileDragHandle.displayOffset.x, mouse.position.y - tileDragHandle.displayOffset.y) < tileDragHandle.radius;
	}

	if (isRotateHandleHovering) {
		isRotateHandleHovering = Math.hypot(mouse.position.x - tileRotateHandle.displayOffset.x, mouse.position.y - tileRotateHandle.displayOffset.y) < tileRotateHandle.radius + tileRotateHandle.outline.size/2;
	}

	if(tileOptions.rotationLock) isRotateHandleHovering = false;
	if(tileOptions.dragLock) isDragHandleHovering = false;

	if(
		mouse.click_l == true &&
		tile.getAttribute("isDragging") == true &&
		tile.getAttribute("isRotating") == false &&
		userSelectedComponentHash == tile.hash
	) {
		let dx = tile.getAttribute("offsetX");
		let dy = tile.getAttribute("offsetY");

		if(!dx) dx = mouse.position.x - tile.display.x; tile.setAttribute("offsetX", dx);
		if(!dy) dy = mouse.position.y - tile.display.y; tile.setAttribute("offsetY", dy);

		tile.moveTo(toRange(0, mouse.position.x - dx, (mapWidth-1)*100), toRange(0, mouse.position.y - dy, (mapHeight-1)*100));
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