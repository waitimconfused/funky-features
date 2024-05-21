import { ComponentGroup, engine } from "./utils.js";
import * as components from "./components/index.js";

engine.isPixelArt = true;
engine.setBackground("black");
engine.setIcon("./assets/sit.png");

let scale = 16 * 4 * window.devicePixelRatio;

let world = new ComponentGroup;
world.moveBy(100, 100);
engine.addObject(world);

let background = new components.Rect;
background.colour = "#232323";
world.addObject(background);
background.fixedPosition = true;
background.script = () => {
	background.moveTo(engine.canvas.width/2 - scale*3/2, engine.canvas.height/2 - scale*3/2);
}
background.setSize(scale * 3, scale * 3);


let rect = new components.Rect;
world.addObject(rect);
rect.fixedPosition = false;
rect.moveTo(0, 0);
rect.setSize(scale, scale);

var player = new components.Rect;
engine.addObject(player);
player.cameraTracking = true;
player.moveTo(0, 0);
player.setSize(scale, scale);
// player.setCrop(0, 0, 16, 16);
// player.source = "./assets/sit.png";
player.colour = "cyan"

player.script = function(){
	let speed = scale / 16;
	speed = Math.floor(speed);
	let delta = 50 * engine.time.delta;

	let speedX = 0;
	let speedY = 0;

	if(engine.keyboard.isKeyPressed("w")) speedY -= speed * delta;
	if(engine.keyboard.isKeyPressed("s")) speedY += speed * delta;
	if(engine.keyboard.isKeyPressed("a")) speedX -= speed * delta;
	if(engine.keyboard.isKeyPressed("d")) speedX += speed * delta;

	speedX = Math.floor(speedX);
	speedY = Math.floor(speedY);

	let direction = speedX / Math.abs(speedX||1);

	// if(direction) player.display.w = Math.abs(player.display.w) * direction;

	player.moveBy(speedX, speedY);
}