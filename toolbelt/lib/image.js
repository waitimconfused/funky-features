const assetDIV = loadAssets();

const ErrorImage = document.createElement("img");
ErrorImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV/TSqVUHewg4pChOlkQLeIoVSyChdJWaNXB5NIvaGJIUlwcBdeCgx+LVQcXZ10dXAVB8APE1cVJ0UVK/F9SaBHjwXE/3t173L0DhGaNqWZgAlA1y8gkE2K+sCIGXxFCAP2Iwy8xU09lF3LwHF/38PH1LsazvM/9OfqUoskAn0g8y3TDIl4nnt60dM77xBFWkRTic+Jxgy5I/Mh12eU3zmWHBZ4ZMXKZOeIIsVjuYrmLWcVQiePEUUXVKF/Iu6xw3uKs1uqsfU/+wnBRW85yneYIklhECmmIkFFHFTVYiNGqkWIiQ/sJD/+w40+TSyZXFYwc89iACsnxg//B727N0tSkmxROAD0vtv0xCgR3gVbDtr+Pbbt1AvifgSut499oAjOfpDc6WvQIGNgGLq47mrwHXO4AQ0+6ZEiO5KcplErA+xl9UwEYvAVCq25v7X2cPgA56mrpBjg4BMbKlL3m8e7e7t7+PdPu7wdhVHKgRoo0GwAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+cKBA8WIsDjvWIAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAJklEQVQoz2P8z/CfARtgZGDEKs7EQCIY1UAMYMQlgSt+RoOVJhoAKAMEHdElw9AAAAAASUVORK5CYII=";
assetDIV.appendChild(ErrorImage);

export function loadAssets(){
	if(document.querySelectorAll("div#assets").length == 0){
		let assetDIV = document.createElement("div");
		assetDIV.setAttribute("id", "assets");
		assetDIV.setAttribute("style", "display:none;");
		document.body.appendChild(assetDIV);
		return(assetDIV);
	}
	return document.querySelector("div#assets");
}

export function draw(
	imgSource="",

	DestinationXPos=0, DestinationYPos=0,
	DestinationWidth=0, DestinationHeight=0,

	CropXPos=-1, CropYPos=-1,
	CropWidth=-1, CropHeight=-1,
	
	filters={
		alpha: 1,
		brightness: 1,
		pixelated: false
	},
	drawDestination=new HTMLCanvasElement
){

	let context = drawDestination.getContext("2d");
	context.globalAlpha = 1;
	context.globalAlpha = filters?.alpha;

	if(filters.pixelated){
		context.msImageSmoothingEnabled = false;
		context.mozImageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;
		context.imageSmoothingEnabled = false;
		DestinationXPos = Math.floor(DestinationXPos);
		DestinationYPos = Math.floor(DestinationYPos);
		DestinationWidth = Math.floor(DestinationWidth);
		DestinationHeight = Math.floor(DestinationHeight);
	}

	context.save();
	if(DestinationWidth < 0){
		DestinationWidth = Math.abs(DestinationWidth);
		context.scale(-1, 1);
		context.translate(
			0 - drawDestination.width,
			0
		);
		DestinationXPos = drawDestination.width - DestinationXPos;
	}

	if(CropXPos == -1) CropXPos = 0;
	if(CropYPos == -1) CropYPos = 0;

	if(CropWidth == -1) CropWidth = undefined;
	if(CropHeight == -1) CropHeight = undefined;

	try {
		if(CropWidth && CropHeight){
			context.drawImage(
				cacheImage(imgSource),
	
				CropXPos || 0, CropYPos || 0,
				CropWidth, CropHeight,
	
				DestinationXPos, DestinationYPos,
				DestinationWidth, DestinationHeight,
			);
		}else{
			context.drawImage(
				cacheImage(imgSource),
	
				DestinationXPos, DestinationYPos,
				DestinationWidth, DestinationHeight,
			);
		}
	}catch {
		context.drawImage(
			ErrorImage,

			0, 0, 16, 16,

			Math.floor(DestinationXPos), Math.floor(DestinationYPos),
			Math.floor(DestinationWidth), Math.floor(DestinationHeight),
		);
	}
	context.restore();
	context.globalAlpha = 1;
}

export function cacheImage(imgSource=""){
	let loadedImage = document.querySelector(`div#assets>img[src="${imgSource}"]`);
	if(loadedImage == null){
		let newlyLoadedImage = document.createElement("img");
		newlyLoadedImage.src = imgSource;
		assetDIV.appendChild(newlyLoadedImage);
		return(newlyLoadedImage);
	}else{
		return(loadedImage);
	}
}