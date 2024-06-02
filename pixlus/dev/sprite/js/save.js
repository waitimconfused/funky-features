// import { sendData } from "../../../Asterisk/serverside/client.js";
const apiLocation_save = "/dev/tile/save";

// function Tile
// Make a function!

export class Tile {
	type = `${Math.floor(Math.random() * 9999)}`;
	varient = "default";
	source = "./path/to/image.png";
	image = "";

	crop = {
		x: 0,
		y: 0,
		width: 16,
		height: 16
	};

	animation;

	constructor(options={
		type: "",
		varient: "",
		imageSource: "",
		imageData: "",

		crop: { x: 0, y: 0, width: 16, height: 16 },
		animation: { length: 0, spacing: 16, direction: "horizontal" },
	}){
		this.type = options.type;
		this.varient = options.varient;
		this.source = options.imageSource;
		this.image = options.imageData;

		this.crop.x = options.crop.x;
		this.crop.y = options.crop.y;
		this.crop.width = options.crop.width;
		this.crop.height = options.crop.height;

		if(options.animation.length > 1) {
			this.animation = {};
			this.animation.length = options.animation.length;
			this.animation.spacing = options.animation.spacing;
			this.animation.direction = options.animation.direction;
		}else{
			this.animation = false;
		}
	}

}

export default async function(tile=new Tile){

	// sendData(tile, apiLocation_save).then(() => {
	// 	alert("Saved!");
	// });

}