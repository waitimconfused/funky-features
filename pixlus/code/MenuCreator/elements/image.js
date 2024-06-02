import { image } from "../../play/image.js";
import getFrame from "../../play/behind/animations.js";
import { canvas } from "../../play/main.js";

export class Image {
	
	img = {
		source: "",
		animationLength: 0,
		width: 16,
		height: 16,
		X: 0,
		Y: 0,

		tileData: {
			X: 0,
			Y: 0,
			width: 16,
			height: 16
		}
	};

	setSource(source="", sourceX=0, sourceY=0, sourceWidth=this.img.tileData.width||16, sourceHeight=this.img.tileData.height||16){
		this.img.source = source;

		this.img.tileData.X = sourceX;
		this.img.tileData.Y = sourceY;

		this.img.tileData.width = sourceWidth;
		this.img.tileData.height = sourceHeight;

		return source
	}
	setAnimationLength(length=0){
		this.img.animationLength = length;
	}
	setSize(width=0, height=0){
		this.img.width = width;
		this.img.height = height;

		return {
			width: width,
			height: height
		}
	}
	setRawSize(width=0, height=0){
		this.img.tileData.width = width;
		this.img.tileData.height = height;

		return {
			width: width,
			height: height
		}
	}
	scaleBy(factor=1){
		this.img.width = this.img.tileData.width * factor;
		this.img.height = this.img.tileData.height * factor;
	}
	moveTo(X=0, Y=0){
		this.img.X = X;
		this.img.Y = Y;

		return {
			X: X,
			Y: Y
		}
	}
	render(shiftX=0, shiftY=0){

		let currentBlockAnimationFrameNumber = 0;

		if(this.img.animationLength > 0){
			let arrayOfNumberedFrames = [];
			for(let i = 0; i < this.img.animationLength; i++){
				arrayOfNumberedFrames.push(i);
			}
			currentBlockAnimationFrameNumber = getFrame(arrayOfNumberedFrames);
		}

		image(
			"../../"+this.img.source,

			this.img.X + shiftX,
			this.img.Y + shiftY,
			this.img.width,
			this.img.height,

			this.img.tileData.X + (currentBlockAnimationFrameNumber * this.img.tileData.width), this.img.tileData.Y,
			this.img.tileData.width, this.img.tileData.height,
			{}, false, canvas
		);
	}
}