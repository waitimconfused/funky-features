import { engine, Image } from "./game-engine/imports.js";
import { Toolbelt } from "./toolbelt-v2/index.js";
// import { keyboard } from "./toolbelt/toolbelt.js";

// var audio = new Audio('/CriticalTheme.wav');
// audio.loop = true;
// audio.volume = 0.25;

// keyboard.on("space", () => {
// 	audio.play();
// });

// document.addEventListener("visibilitychange", function() {
//     if (document.hidden){
//         audio.pause();
//     } else {
//         audio.play();
//     }
// });

const gifSource = "/game-engine/demos/5/dinoCharacters/DinoSprites%20-%20doux.gif";

const image = new Image;
engine.addObject(image);
image.source = gifSource;
image.animation.fps = 7;

console.log(image.animation.animations["main"].frames);