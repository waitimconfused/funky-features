import { player } from "../lib/runtime.js"

export function place() {
	console.log("PLACED!")
}

export function interact() {
	player.moveToWorld()
}