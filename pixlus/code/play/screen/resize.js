import { canvas, innerScreen, scale } from "../main.js";

export default async function resizeCanvas(){

	if(canvas.width !== window.innerWidth || canvas.height !== window.innerHeight){
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	innerScreen.width = calculateSize(canvas.width);
	innerScreen.height = calculateSize(canvas.height);
}

export function calculateSize(length=0){
	let value = Math.floor( length / (16 * scale) );
	return(value);
}

// Number of blocks
// Math.floor(canvas.width / (16 * (scale)))