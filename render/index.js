import Rect from "./rect.js";
import camera from "./camera.js";
import * as tk from "../toolbelt/toolbelt.js";
import Circle from "./circle.js";

export const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.style.position = "fixed";
canvas.style.top = 0;
canvas.style.left = 0;

export const context = canvas.getContext("2d");

export var objects = [];

var rect = (new Rect)
.moveTo(100, 100)
.setSize(100, 100);

var circle = (new Circle)
.moveTo(500, 500)
.setRadius(50);

var spaceKeyPressed = false;


function getClosestDistance(originX=0, originY=0){
	let closestDistance = Infinity;

	for(let i = 0; i < objects.length; i ++){
		let object = objects[i];
		// object.render();
		let distanceToObject = object.getDistance(originX, originY);
		if(distanceToObject < closestDistance) closestDistance = distanceToObject;
	}
	return closestDistance;
}

var cameraDirection = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function render(){

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	camera
	.moveTo(canvas.width / 2, canvas.height / 2);

	for(let i = 0; i < objects.length; i ++){
		let object = objects[i];
		object.render();
	}

	let mousePos = tk.mouse.position;

	let arrayOfCollisions = [];

	for(let angle = 0; angle < 360/10; angle ++){
		let dot = {x: mousePos.x, y: mousePos.y};
		console.log(dot);

		context.beginPath();
		context.arc(dot.x, dot.y, 20, 0, 2 * Math.PI);
		context.fillStyle = "blue";
		context.fill();

		let distance = getClosestDistance(dot.x, dot.y);
		let interestedWithObject = false;
		let outOfBounds = false;
		while(
			!interestedWithObject && !outOfBounds
		){

			context.beginPath();
			context.arc(dot.x, dot.y, distance, 0, 2 * Math.PI);
			context.strokeStyle = "rgba(127.5, 127.5, 127.5, 0.1)";
			context.lineWidth = 10;
			context.stroke();
			console.log(angle, dot);

			let newPoint = rotatePoint(dot.x, dot.y, distance, angle*10+cameraDirection);
			dot.x = newPoint.x;
			dot.y = newPoint.y;
			distance = getClosestDistance(dot.x, dot.y);

			interestedWithObject = distance < 1;
			outOfBounds = (dot.x < 0 || dot.y < 0 || dot.x > canvas.width || dot.y > canvas.height);

			context.beginPath();
			context.arc(dot.x, dot.y, 5, 0, 2 * Math.PI);
			context.fillStyle = "yellow";
			context.fill();
			console.log(angle, dot);
		}
		context.beginPath();
		context.arc(dot.x, dot.y, 10, 0, 2 * Math.PI);
		context.fillStyle = "red";
		context.fill();
		console.log(angle, dot);
	}
	spaceKeyPressed = tk.keyboard.isPressed("j");

	// let mousePos = tk.mouse.position;
	// for(let angle = 0; angle < 90; angle ++) {
	// }

	// context.beginPath();
	// context.arc(camera.pos.x, camera.pos.y, closestDistance, 0, 2 * Math.PI);
	// context.fillStyle = "rgb(0, 0, 255, 0.01)";
	// context.fill();
	// context.lineWidth = 4;
	// context.strokeStyle = "blue";
	// context.stroke();

	window.requestAnimationFrame(render);
}
render();

function rotatePoint(centerX=0, centerY=0, radius=100, angle=0){
	let radian = angle * (Math.PI / 180);
	let pointX = radius * Math.sin(radian) + centerX;
	let pointY = radius * Math.cos(radian) + centerY;

	return { x: pointX, y: pointY };
}

function bellCurve(x=0, a=0, b=1){
	return Math.E * (-Math.pow(x-a, 2) / b )
}