const assetDIV = loadAssets();

const errorImage = document.createElement("img");
errorImage.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV/TSqVUHewg4pChOlkQLeIoVSyChdJWaNXB5NIvaGJIUlwcBdeCgx+LVQcXZ10dXAVB8APE1cVJ0UVK/F9SaBHjwXE/3t173L0DhGaNqWZgAlA1y8gkE2K+sCIGXxFCAP2Iwy8xU09lF3LwHF/38PH1LsazvM/9OfqUoskAn0g8y3TDIl4nnt60dM77xBFWkRTic+Jxgy5I/Mh12eU3zmWHBZ4ZMXKZOeIIsVjuYrmLWcVQiePEUUXVKF/Iu6xw3uKs1uqsfU/+wnBRW85yneYIklhECmmIkFFHFTVYiNGqkWIiQ/sJD/+w40+TSyZXFYwc89iACsnxg//B727N0tSkmxROAD0vtv0xCgR3gVbDtr+Pbbt1AvifgSut499oAjOfpDc6WvQIGNgGLq47mrwHXO4AQ0+6ZEiO5KcplErA+xl9UwEYvAVCq25v7X2cPgA56mrpBjg4BMbKlL3m8e7e7t7+PdPu7wdhVHKgRoo0GwAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAd0SU1FB+cKBA8WIsDjvWIAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAJklEQVQoz2P8z/CfARtgZGDEKs7EQCIY1UAMYMQlgSt+RoOVJhoAKAMEHdElw9AAAAAASUVORK5CYII=";
assetDIV.appendChild(errorImage);

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

/**
 * 
 * @param {string} imgSource 
 * @param {number} destinationXPos 
 * @param {number} destinationYPos 
 * @param {number} destinationWidth 
 * @param {number} destinationHeight 
 * @param {number} cropXPos 
 * @param {number} cropYPos 
 * @param {number} cropWidth 
 * @param {number} cropHeight 
 * @param { { pixelated: boolean, alpha: number } } filters 
 * @param {HTMLCanvasElement} canvas 
 * @param {boolean} saveAsset 
 */
export function draw(
	imgSource="",
	destinationXPos, destinationYPos, destinationWidth, destinationHeight,
	cropXPos, cropYPos, cropWidth, cropHeight,
	filters, canvas, saveAsset=true
){

	let context = canvas.getContext("2d");
	context.globalAlpha = 1;
	context.globalAlpha = filters.alpha ?? 1;

	if(filters.pixelated ?? false){
		context.msImageSmoothingEnabled = false;
		context.mozImageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;
		context.imageSmoothingEnabled = false;
		destinationXPos = Math.floor(destinationXPos);
		destinationYPos = Math.floor(destinationYPos);
		destinationWidth = Math.floor(destinationWidth);
		destinationHeight = Math.floor(destinationHeight);
	}

	context.save();
	if(destinationWidth < 0){
		destinationWidth *= -1;
		context.scale(-1, 1);
		context.translate(
			0 - canvas.width,
			0
		);
		destinationXPos = canvas.width - destinationXPos;
	}

	if(cropXPos == -1) cropXPos = 0;
	if(cropYPos == -1) cropYPos = 0;

	if(cropWidth == -1) cropWidth = undefined;
	if(cropHeight == -1) cropHeight = undefined;

	try {
		if(cropWidth && cropHeight){
			context.drawImage(
				saveAsset?cacheImage(imgSource):imgSource,
	
				cropXPos || 0, cropYPos || 0,
				cropWidth, cropHeight,
	
				destinationXPos, destinationYPos,
				destinationWidth, destinationHeight,
			);
		}else{
			context.drawImage(
				saveAsset?cacheImage(imgSource):imgSource,
	
				destinationXPos, destinationYPos,
				destinationWidth, destinationHeight,
			);
		}
	}catch {
		context.drawImage(
			errorImage,

			0, 0, 16, 16,

			Math.floor(destinationXPos), Math.floor(destinationYPos),
			Math.floor(destinationWidth), Math.floor(destinationHeight),
		);
	}
	context.restore();
	context.globalAlpha = 1;
}

export function cacheImage(imgSource=""){
	if (imgSource == "") imgSource = errorImage.src;
	else if (imgSource.endsWith("/")) imgSource = errorImage.src;
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