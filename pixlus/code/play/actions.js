import PlaceBlock from "./behind/world_editor.js";
import { UI_options, currentWorld, switchWorldTo } from "./main.js";
import { player } from "./entites/player.js";
import { CashedBlockData } from "./render.js";
import worlds from "../worlds/index.json" with {type: "json"};

export default class {
	constructor(){

	}
	actions = {
		open: {
			page: (url="") => {
				window.location.href = url;
			},
			menu: (menuName="") => {
				UI_options.currentMenu = menuName;
			}
		},
		change: {
			world: {
				to: (url="") => {
					window.location.href = url;
				}
			},
			player: {
				speed: {
					to: () => {
						// ...
					},
					by: () => {
						// ...
					}
				}
			}
		},
		set: {
			block: (layer=1, x=0, y=0, value="") => {
				if(
					typeof layer == "number" &&
					typeof x == "number" &&
					typeof y == "number" &&
					typeof value == "string"
				){
					PlaceBlock(value, x, y, layer);
				}else if(typeof layer == "string"){
					value = layer;

					x = Math.floor( (player.position.x) / 16);
					y = Math.floor( (player.position.y-2) / 16);

					let worldData = localStorage.getItem(`world.${currentWorld}`);
					worldData = JSON.parse(worldData);

					for(let testingLayer = 0; testingLayer < worldData.world.length; testingLayer ++){
						let currentWorldLayer = worldData.world[testingLayer];

						if(y > currentWorldLayer.length) break;
						if(x > currentWorldLayer[y].length) break;

						let currentBlock = currentWorldLayer[y][x];
						let currentBlockData = CashedBlockData[currentBlock];

						if(typeof currentBlockData?.aspects?.action == "string") PlaceBlock(value, x, y, testingLayer + 1);
					}
				}else console.log("A Block-action was run without parameters")
			},
			world: switchWorldTo
		},

		add: {
			item: {
				to: {
					player: (itemName="") => {
						// console.log(itemName);	
					},
					block: (layer=1, x=0, y=0) => {
						// console.log(layer, x, y, itemName);
					}	
				}
			},
			effect: {
				to: {
					player: (itemName="") => {
						// console.log(itemName);	
					},
					entity: (entityName="", itemName="") => {
						// console.log(entityName, itemName);
					}	
				}
			}
		},
		wait: async (time=0) => {
			console.log(this.actions.wait, time);
			await delay(time);
		}
	}
}
function delay(time=1000){
	return new Promise(resolve => setTimeout(resolve, time));
}