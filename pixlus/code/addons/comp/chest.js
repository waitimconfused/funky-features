import { game, player } from "../lib/runtime.js"

export function place() {
	console.log("PLACED!")
}

export function interact() {
	let this_block = game.block.getBlock()

	if(this_block.type == "chest") {
		player.inventory.give("diamond", 1)
		console.log(game.block.getBlock())
		game.block.setBlock("chest:opened")
		console.log("Opened Chest")
	} else {
		console.log(game.block.getBlock())
		game.block.setBlock("chest")
		console.log("Closed Chest")
	}
}