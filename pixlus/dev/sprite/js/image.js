const assetDIV = loadAssets();
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
export function image(
	imgSource="",

	DestinationXPos=0, DestinationYPos=0,
	DestinationWidth=0, DestinationHeight=0,

	CropXPos=0, CropYPos=0,
	CropWidth=16, CropHeight=16,

	filters={alpha: 1, brightness: 1},
	flipX=false,

	drawDestination=HTMLCanvas
){

	let context = drawDestination.getContext("2d");
	context.globalAlpha = 1;
	context.globalAlpha = filters?.alpha;

	context.msImageSmoothingEnabled = false;
	context.mozImageSmoothingEnabled = false;
	context.webkitImageSmoothingEnabled = false;
	context.imageSmoothingEnabled = false;

	context.save();
	if(flipX == true){
		context.scale(-1, 1);
		context.translate(
		0 - drawDestination.width,
		0
		);
		DestinationXPos = drawDestination.width - DestinationXPos - DestinationWidth;
	}

	context.filter = "blur(0px)";
	context.drawImage(
		CacheImage(imgSource),

		Math.floor(CropXPos), Math.floor(CropYPos),
		Math.floor(CropWidth), Math.floor(CropHeight),

		Math.floor(DestinationXPos), Math.floor(DestinationYPos),
		Math.floor(DestinationWidth), Math.floor(DestinationHeight),
	);
	context.restore();
	context.globalAlpha = 1;
}
export function CacheImage(imgSource=""){
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