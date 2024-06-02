import play from "./index.json" with {type: "json"};
import { player } from "../play/entites/player.js";

import { UI_options, currentWorld as startingWorldName } from "../play/main.js"

export default async function(forceReload=false){
	let numberOfWorlds = play.worlds.length;

	if(forceReload == true) localStorage.clear();

	for(let i = 0; i < numberOfWorlds; i++){
		let currentWorldName = play.worlds[i].title;


		if( localStorage.getItem(`world.${currentWorldName}`) == null || forceReload == true){

			localStorage.setItem(`world.${currentWorldName}`, JSON.stringify({
				spawnpoint: {
					X: 0,
					Y: 0
				},
				world: [
					[[""],[""],[""],[""]],
					[[""],[""],[""],[""]],
					[[""],[""],[""],[""]],
					[[""],[""],[""],[""]]
				]}
			));

			let {default: currentWorld} = await import(`../worlds/${play.worlds[i].path}`, {
				assert: {
					type: "json",
				},
			});
		
			let stringifiedWorldData = JSON.stringify(currentWorld);

			localStorage.setItem(`world.${currentWorldName}`, stringifiedWorldData);
			location.reload();
		}
	}
}