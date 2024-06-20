import { mouse } from "./toolbelt/toolbelt.js";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.style.position = "fixed";
canvas.style.top = 0;
canvas.style.left = 0;

var mousePressed = false;
var nodeBeingPressed = null;

class Vec2 {
	x = 0;
	y = 0;

	constructor(x=this.x, y=this.y){
		this.x = x;
		this.y = y;
	}
	plot(context=new CanvasRenderingContext2D){
		context.fillStyle = "green";
		context.fillRect(this.x, this.y, 1, 1);
	}
}
var accuracy = 100;
function cubicBezier(p0=new Vec2, p1=new Vec2, p2=new Vec2, p3=new Vec2, context=new CanvasRenderingContext2D){
	context.moveTo(p0.x, p0.y);
	for (let t = 0; t < 1; t += 1/accuracy) {
		let l1 = lerp_vec2(p0, p1,t);
		let l2 = lerp_vec2(p1, p2,t);
		let l3 = lerp_vec2(p2, p3,t);
		let c1 = lerp_vec2(l1, l2,t);
		let c2 = lerp_vec2(l2, l3,t);
		let l = lerp_vec2(c1, c2,t)
		context.lineTo(l.x, l.y, 1, 1);

		context.fillStyle = "cyan";
		context.fillRect(l.x - 10, l.y - 10, 20, 20);

	}
	context.lineTo(p3.x, p3.y);
}

var nodeIds = [];
var nodeList = {};

class Node {
	id = "";
	display = new Vec2;
	isBeingClicked = false;
	edges = [];

	#mouseDX = 0;
	#mouseDY = 0;

	constructor(){
		this.id = `${Math.random(Math.random() * 99999)}`;
		while(this.id/length < 5){
			this.id = "0" + this.id;
		}
		nodeIds.push(this.id);
		nodeList[this.id] = this;

		return this;
	}

	connectTo(node = new Node){
		let edge = new Edge;
		edge.setStart(this);
		edge.setEnd(node);
		this.edges.push(edge);

		return this;
	}

	moveTo(x, y) {
		this.display.x = x;
		this.display.y = y;
	}

	update(){
		let isIntersectingWithMouse = mouse.position.x > this.display.x - boxSize/2 && mouse.position.x < this.display.x + boxSize/2 && mouse.position.y > this.display.y - boxSize/2 && mouse.position.y < this.display.y + boxSize/2;

		if (mousePressed || mouse.click_l) {
			if ((!nodeBeingPressed || nodeBeingPressed == this.id) && (this.isBeingClicked || isIntersectingWithMouse)) {

				if(!this.#mouseDX || !this.#mouseDY) {
					this.#mouseDX = mouse.position.x - this.display.x;
					this.#mouseDY = mouse.position.y - this.display.y;
				}

				nodeBeingPressed = this.id;
				this.isBeingClicked = true;
				this.moveTo(mouse.position.x - this.#mouseDX, mouse.position.y - this.#mouseDY);
			}
		} else {
			this.isBeingClicked = false;
			nodeBeingPressed = null;
			this.#mouseDX = 0;
			this.#mouseDY = 0;
		}
	}

	render(context = new CanvasRenderingContext2D){

		// context.fillStyle = "blue";
		// context.fillRect(this.display.x - boxSize/2, this.display.y - boxSize/2, boxSize, boxSize);

		context.beginPath();
		context.strokeStyle = "white";
		context.lineWidth = 5;
		context.fillStyle = "blue";
		context.roundRect(this.display.x - boxSize/2, this.display.y - boxSize/2, boxSize, boxSize, 10);
		context.fill();
		context.stroke();
		context.closePath();

		return this;
	}
}

class Edge {
	start = "";
	handle1 = new Vec2;
	handle2 = new Vec2;
	end = "";

	setStart(node=new Node){
		this.start = node.id;
		this.setHandlePositions();
	}

	setEnd(node=new Node){
		this.end = node.id;
		this.setHandlePositions();
	}

	setHandlePositions(){

		if(!this.start || !this.end) return this;

		let start = nodeList[this.start];
		let end = nodeList[this.end];

		let dx = Math.abs(end.display.x - start.display.x);
		let dy = Math.abs(end.display.y - start.display.y);
		let horizontal = isInRange(-dx, dy, dx);

		if(horizontal) {
			this.handle1.x = (start.display.x + end.display.x) / 2;
			this.handle1.y = start.display.y;

			this.handle2.x = (start.display.x + end.display.x) / 2;
			this.handle2.y = end.display.y;
		} else {
			this.handle1.x = start.display.x;
			this.handle1.y = (start.display.y + end.display.y) / 2;

			this.handle2.x = end.display.x;
			this.handle2.y = (start.display.y + end.display.y) / 2;
		}
	}

	render(context=new CanvasRenderingContext2D){

		let start = nodeList[this.start];
		let end = nodeList[this.end];

		let dx = Math.abs(end.display.x - start.display.x);
		let dy = Math.abs(end.display.y - start.display.y);
		let horizontal = isInRange(-dx, dy, dx);

		let speed = 0.25;

		if(horizontal) {
			let handle1X = (start.display.x + end.display.x) / 2;
			let handle1Y = start.display.y;
			this.handle1.x = lerp(this.handle1.x, handle1X, speed);
			this.handle1.y = lerp(this.handle1.y, handle1Y, speed);

			
			let handle2X = (start.display.x + end.display.x) / 2;
			let handle2Y = end.display.y;
			this.handle2.x = lerp(this.handle2.x, handle2X, speed);
			this.handle2.y = lerp(this.handle2.y, handle2Y, speed);
		} else {
			let handle1X = start.display.x;
			let handle1Y = (start.display.y + end.display.y) / 2;
			this.handle1.x = lerp(this.handle1.x, handle1X, speed);
			this.handle1.y = lerp(this.handle1.y, handle1Y, speed);

			let handle2X = end.display.x;
			let handle2Y = (start.display.y + end.display.y) / 2;
			this.handle2.x = lerp(this.handle2.x, handle2X, speed);
			this.handle2.y = lerp(this.handle2.y, handle2Y, speed);
		}

		context.beginPath();
		context.lineCap = "round";

		let accuracy = Math.hypot(end.display.x - start.display.x, end.display.y - start.display.y);

		accuracy /= 20;

		accuracy = Math.floor(accuracy);

		context.moveTo(start.display.x, start.display.y);
		for (let t = 0; t < 1; t += 1/accuracy) {
			let l1 = lerp_vec2(start.display, this.handle1, t);
			let l2 = lerp_vec2(this.handle1, this.handle2, t);
			let l3 = lerp_vec2(this.handle2, end.display, t);
			let c1 = lerp_vec2(l1, l2, t);
			let c2 = lerp_vec2(l2, l3, t);
			let l = lerp_vec2(c1, c2, t);

			context.lineTo(l.x, l.y, 1, 1);

			// context.fillStyle = "cyan";
			// context.fillRect(l.x - 10, l.y - 10, 20, 20);

		}
		context.lineTo(end.display.x, end.display.y);

		context.strokeStyle = "white";
		context.lineWidth = 20;
		context.stroke();

		context.strokeStyle = "red";
		context.lineWidth = 5;
		context.stroke();
		context.closePath();
	}
}

function randomInRange(min=0, max=10){
	return Math.random() * (max - min) + min
}

var node1 = new Node;
node1.moveTo(randomInRange(0, window.innerWidth), randomInRange(0, window.innerHeight));
var node2 = new Node;
node2.moveTo(randomInRange(0, window.innerWidth), randomInRange(0, window.innerHeight));
node1.connectTo(node2);
var node3 = new Node;
node3.moveTo(randomInRange(0, window.innerWidth), randomInRange(0, window.innerHeight));
node2.connectTo(node3);

var node4 = new Node;
node4.moveTo(randomInRange(0, window.innerWidth), randomInRange(0, window.innerHeight));
node4.connectTo(node2);

var node5 = new Node;
node5.moveTo(randomInRange(0, window.innerWidth), randomInRange(0, window.innerHeight));
node4.connectTo(node5);

function lerp(A=0, B=1, t=0.5) {
	// t = Math.max(Math.min(t, 1), 0);
	return A + (B - A) * t;
}

function lerp_vec2(A=new Vec2, B=new Vec2, t=0.5) {
	let x = lerp(A.x, B.x, t);
	let y = lerp(A.y, B.y, t);
	return new Vec2(x, y);
}

function isInRange(min, num, max) {
	return num >= Math.min(min, max) && num <= Math.max(min, max);
}

var boxSize = 100;

function render() {

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	let context = canvas.getContext("2d");

	nodeIds = nodeIds.sort((nodeToken1, nodeToken2) => {
		let node1 = nodeList[nodeToken1];
		let node2 = nodeList[nodeToken2];
		return node2.display.y - node1.display.y;
	});

	for (let i = 0; i < nodeIds.length; i ++) {
		let nodeID = nodeIds[i];
		let node = nodeList[nodeID];
		node.update();
	}

	for (let n = 0; n < nodeIds.length; n ++) {
		let nodeId = nodeIds[n];
		let node = nodeList[nodeId];

		for (let c = 0; c < node.edges.length; c ++) {
			let edge = node.edges[c];

			edge.render(context);
		}
	}

	for (let i = 0; i < nodeIds.length; i ++) {
		let nodeID = nodeIds[i];
		let node = nodeList[nodeID];
		node.render(context);
	}

	mousePressed = mouse.click_l;

	if(mousePressed && !nodeBeingPressed) {
		nodeBeingPressed = true;
	}

	window.requestAnimationFrame(render);
}
render();