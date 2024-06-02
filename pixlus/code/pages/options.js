import * as fonts from "./web_fonts.js";
import Options from "../../options/index.json" assert {type: "json"};

const ground = document.getElementById("ground");
const content = document.getElementsByClassName("content")[0];

ground.onclick = () => {
	if(( window.scrollY +window.innerHeight / 2) <= window.innerHeight){
		ground.scrollIntoView({
			behavior: "smooth",
			alignToTop: true
		});
	}
}

window.onbeforeunload = () => {
	window.scrollTo(0, 0);
}

generateElements(Options);

function generateElements(obj={}, div=HTMLDivElement){
	let objKeys = Object.keys(obj);

	for(let i = 0; i < objKeys.length; i++){
		let currentKey = objKeys[i];
		let currentValue = obj[currentKey];

		if(typeof currentValue == "object"){
			let childDiv = document.createElement("div");
			content.appendChild(childDiv);

			let childDivTitle = document.createElement("h1");
			childDivTitle.innerText = currentKey.replaceAll("_", " ");
			childDivTitle.id = currentKey;
			childDiv.appendChild(childDivTitle);

			generateElements(currentValue, childDiv);
		}else{
			let valueElement = document.createElement("h1");
			valueElement.style.textAlign = "left";
			valueElement.style.scale = "0.5";
			valueElement.style.padding = "0px";
			valueElement.style.margin = "-30px";
			div.appendChild(valueElement);

			if(typeof currentValue == "boolean"){
				valueElement.innerHTML = `${currentKey} "${currentValue}"`;
			}
			valueElement.innerText = `${currentKey} "${currentValue}"`;
		}
	}
}

window.onbeforeunload = () => {
	window.scrollTo(0, 0);
}