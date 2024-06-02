import UI_file from "../assets/UI/ui.json" with {type: "json"};
import options from "../../options/index.json" with {type: "json"};
const fonts = UI_file.fonts;

export const speed = 1000;

const rootURL = "/confusion-projects/pixlus";

let URL = window.location.href;
let Path = URL.split("/");
Path.shift(); // Remove HTTP
Path.shift(); // Remove ""
Path.shift(); // Remove LOCALHOST

reloadTexts();

export default async function reloadTexts(){

	document.body.style.fontFamily = `${options.web.font}, "PIXLUS_black-white", sans-serif`;

	let chosenFont = options.web.font?.toLowerCase();

	if(chosenFont?.includes("pixlus") == true){
		document.body.style.fontFamily = `"PIXLUS_black-white", sans-serif`;
	}

	if(chosenFont == "pixlus-block"){

		let headers = document.getElementsByTagName("h1");
		let paragraph = document.getElementsByTagName("p");

		for(let index = 0; index < headers.length; index++){
			await replaceText(headers[index]);
		}
		for(let index = 0; index < paragraph.length; index++){
			await replaceText(paragraph[index]);
		}

	}

}

async function replaceText(element=HTMLElement){
	let text = element.innerText.toLowerCase();
	element.innerHTML = "";
	while(text.includes(`"`)){
		text = text.replace(`"`, "«");
		text = text.replace(`"`, "»");
	}
	let lengthOfText = text.length;

	for(let i = 0; i < lengthOfText; i++){
		let currentDelay = (speed / lengthOfText) * i;
		let currentLetter = text[i];

		let source = fonts.icons[" "].img;
		let imageType = "icon";
		if(currentLetter in fonts.letters){
			source = fonts.letters[currentLetter].img;
			imageType = "letter";
		}else if(currentLetter in fonts.numbers){
			source = fonts.numbers[currentLetter].img;
			imageType = "number";
		}else if(currentLetter in fonts.icons){
			source = fonts.icons[currentLetter].img;
			imageType = "icon";
		}else if(currentLetter == "\n"){
			let lineBreak = document.createElement("br");
			element.appendChild(lineBreak);
			continue;
		}else if(currentLetter == "\t"){
			continue;
		}else{
			console.error(`Unknown character "${currentLetter}"\n\tCharacter "${currentLetter}" does not exist inside font JSON`, "../".repeat(Path.length-1)+"code/assets/UI/ui.json");
		}
		
		let letterElement = document.createElement("div");
		letterElement.id = "web_fonts";
		letterElement.className = imageType;

		letterElement.setAttribute("style", `--x: ${source.tileCoords.X}; --y: ${source.tileCoords.Y}`);
		letterElement.style.backgroundImage = `url("${"../".repeat(Path.length - rootURL.replace(/$\//,"").split("/").length)}code/assets/UI/images/fonts/${source.source}")`;

		if(element.getAttribute("class")?.includes("title")){
			letterElement.style.transformOrigin = "center center";
			letterElement.style.opacity = 0;
			letterElement.style.animation = "letter-in 0.4s linear forwards";
			letterElement.style.animationDelay = `${currentDelay}ms`;
			setTimeout(() => {
				letterElement.style.opacity = "";
				letterElement.style.animation = "";
				letterElement.style.animationDelay = "";
			}, currentDelay + 400)
		}
		element.appendChild(letterElement);
	}
}

window.addEventListener("keydown", (e) => {
    if(e.ctrlKey){
		let key = e.key.toLowerCase();
		if (key == "f") { 
			e.preventDefault();
		}
		if(key == "p"){
			e.preventDefault();
		}
	}
});