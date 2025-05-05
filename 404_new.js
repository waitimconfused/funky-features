import { Engine, Image } from "./canvas-engine/imports.js";
const engine = new Engine;
engine.fullscreen = true;
engine.camera.canZoom = true;
engine.camera.canPan = true;

const gifSource = "/canvas-engine/demos/5/dinoCharacters/DinoSprites%20-%20doux.gif";

const image = new Image;
engine.addObject(image);
image.source = gifSource;
image.animation.fps = 7;

console.log(image.animation.animations["main"].frames);