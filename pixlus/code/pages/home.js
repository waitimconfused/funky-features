import { speed } from "./web_fonts.js";

const playButton = document.getElementById("play");
const ground = document.getElementById("ground");

if(playButton){
	playButton.onclick = goToGame;
	playButton.removeAttribute("href");
}
ground.onclick = () => {
	if(( window.scrollY +window.innerHeight / 2) <= window.innerHeight){
		ground.scrollIntoView({
			behavior: "smooth",
			alignToTop: true
		});
	}
}

function goToGame(){
	let playButton = document.getElementById("play");

	let title = document.getElementsByClassName("title")[0];
	let letters = title.getElementsByClassName("letter");
	let ground = document.getElementById("ground");
	let content = document.getElementsByClassName("content")[0]
	for(let i = 0; i < letters.length; i++){
		let currentLetter = letters[i];
		let currentDelay = (speed / letters.length) * i;
		setTimeout(() => {
			currentLetter.style.animation = "letter-out 0.4s linear forwards";
			currentLetter.style.animationDelay = `${currentDelay}ms`;
			setTimeout(() => {
				currentLetter.style.opacity = 0;
			}, currentDelay + 400);
		}, 400);
	}
	document.body.style.overflow = "hidden";

	playButton.style.transition = "opacity 400ms";
	playButton.style.opacity = 0;

	ground.style.transition = "opacity 400ms";
	ground.style.opacity = 0;

	content.style.transition = "opacity 400ms";
	content.style.opacity = 0;

	setTimeout(() => {
		window.location.href = "./play/";
	}, speed + 400);
}

window.onbeforeunload = () => {
	window.scrollTo(0, 0);
}