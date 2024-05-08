import { globalGraph, calcDistance, camera, applyFocus, cameraGlideTo, delta, lerp, hexToRgb, nodeTransitionSpeed } from "../index.js";
import { keyboard, mouse } from "../../toolkit/keyboard.js";
import { nodeIsShiftClicked } from "./graph.js";

export default class Node {
	token = "";
	display = {
		x: 0,
		y: 0,
		radius: 10,
		title: "Untitled Node",
		tags: [],
		colour: {
			r: undefined,
			g: undefined,
			b: undefined
		},
		glyph: "?"
	};
	children = [];
	parents = [];
	isClicked = false;
	isHovered = false;
	constructor(title=this.display.title){

		let randomToken = "";
		while(globalGraph.nodeIndexes.includes(randomToken) || randomToken.length < 14){
			randomToken = `${Math.floor(Math.random() * 9999)}`;
			while(randomToken.length < 10) randomToken += Math.floor(Math.random() * 10);
			randomToken = btoa(randomToken).replace(/==$/, "");
		}
		this.token = randomToken;

		globalGraph.addNode(this);

		this.display.title = title;

		this.moveTo(
			(Math.random() * globalGraph.canvas.width / 2 - globalGraph.canvas.width / 4),
			(Math.random() * globalGraph.canvas.height / 2 - globalGraph.canvas.height / 4)
		);
		this.events.shiftclick = () => {
			nodeIsShiftClicked(this);
		};
		return this;
	}
	setTitle(title=this.display.title){
		this.display.title = title || this.display.title;
		return this;
	}
	addTag(tag=""){
		if(this.display.tags.includes(tag) == false) this.display.tags.push(tag);
		return this;
	}
	removeTag(tag=""){
		let indexOfTag = this.display.tags.indexOf(tag);
		if(indexOfTag != -1) this.display.tags.splice(indexOfTag, 1);
		return this;
	}
	setGlyph(glyph=this.display.glyph){
		this.display.glyph = glyph;
		return this;
	}
	setColour(colour=""){
		if(colour.startsWith("#")){
			let rgb = hexToRgb(colour);
			this.display.colour.r = rgb.r;
			this.display.colour.g = rgb.g;
			this.display.colour.b = rgb.b;
		}else if(colour.startsWith("rgb(")){
			let rgbArray = colour.split(/rgb\((\d*), *(\d*), *(\d*)\)/gm);
			this.display.colour.r = rgbArray[1];
			this.display.colour.g = rgbArray[2];
			this.display.colour.b = rgbArray[3];
		}
		return this;
	}
	getStyling(){
		let bgColour = {r: 0, b: 0, g: 255};
		if(globalGraph.getTag(this.display.tags[0])?.colour) {
			let tagData = globalGraph.getTag(this.display.tags[0]).colour;
			bgColour.r = tagData.r;
			bgColour.g = tagData.g;
			bgColour.b = tagData.b;
		}
		if(this.display.colour.r){
			bgColour.r = this.display.colour.r;
			bgColour.g = this.display.colour.g;
			bgColour.b = this.display.colour.b;
		}
		return {
			background: bgColour
		}
	}
	connectTo(node=new Node){
		if(node.token == this.token){
			throw Error("Cannot connect node to self.");
			return this;
		}
		this.children.push(node.token);
		node.parents.push(this.token);
		return this;
	}
	removeConnectionTo(node=new Node){
		let indexOfChild = this.children.indexOf(node.token);
		if(indexOfChild != -1) this.children.splice(indexOfChild, 1);
		let indexOfParent = this.parents.indexOf(node.token);
		if(indexOfParent != -1) this.parents.splice(indexOfParent, 1);
	}
	moveTo(screenX=0, screenY=0){
		this.display.x = screenX / camera.zoom;
		this.display.y = screenY / camera.zoom;
		return this;
	}
	focus(){
		cameraGlideTo(this);
		return this;
	}
	isHovering(){

		let displayX = globalGraph.canvas.width / 2 + (this.display.x - camera.x) * camera.zoom;
		let displayY = globalGraph.canvas.height / 2 + (this.display.y - camera.y) * camera.zoom;
		let radius = Math.abs(this.display.radius * camera.zoom) + lerp(0, 10, this.lerp.radius);

		let hovering = calcDistance({
			x: displayX,
			y: displayY
		}, mouse.position.relative(globalGraph.canvas)) < radius;

		return hovering;
	}
	click(type="single"){

		let returnValue = false;

		if(type == "single"){
			if(mouse.click_l == true && this.isClicked == false){
				this.isClicked = this.isHovering();
				if(this.isClicked) applyFocus(this);
			}
	
			if(this.isClicked && keyboard.isPressed("control")){
				cameraGlideTo(this);
				this.isClicked = false;
				keyboard.setKey("control", false);
				mouse.click_l = false;
			}
			if(this.isClicked && keyboard.isPressed("shift")){
				this.events.shiftclick();
				this.isClicked = false;
				mouse.click_l = false;
			}
			returnValue = this.isClicked;
		}else if(type == "double"){
			if(this.isHovering()){
				this.events.dblclick();
				returnValue = true;
			}
		}
		return returnValue;
	}
	events = {
		shiftclick: function(){},
		click: function(){},
		dblclick: function(){},
	}

	addEventListener(eventName="", callback=function(){}){
		eventName = eventName.toLowerCase();
		this.events[eventName] = callback;
		return this;
	}

	lerp = {
		radius: 0,
		textOffset: 0,
		nothovered:0
	}

	#value = "";
	setValue(value=""){
		this.#value = (value);
		return this;
	}
	getValue(){
		return (this.#value);
	}

	script(){

		if(this.isClicked){
			this.moveTo(
				mouse.position.relative(globalGraph.canvas).x - globalGraph.canvas.width / 2 + camera.x * camera.zoom,
				mouse.position.relative(globalGraph.canvas).y - globalGraph.canvas.height / 2 + camera.y * camera.zoom
			);
			applyFocus(this);

			if(mouse.click_l == false){
				this.isClicked = false;
			}
		}
		return this;
	}
	hasParent(node=new Node){
		return this.parents.includes(node.token);
	}
	hasChild(node=new Node){
		return this.children.includes(node.token);
	}
	hasSibling(node=new Node){
		let isSibling = false;
		for(let parentIndex = 0; parentIndex < this.parents.length; parentIndex ++){
			let parentToken = this.parents[parentIndex];
			let parent = globalGraph.getNode(parentToken);
			if(parent.hasChild(node)) isSibling = true;
		}
		return isSibling;
	}
	render(){

		if(isNaN(this.display.x)) this.display.x = 0;
		if(isNaN(this.display.y)) this.display.y = 0;

		if(this.isClicked && mouse.click_l == false) this.isClicked = false;

		let mouseHovering = this.isHovering();

		if(mouseHovering){
			this.lerp.radius += nodeTransitionSpeed * delta;
			this.lerp.textOffset += nodeTransitionSpeed * delta;
			globalGraph.canvas.style.cursor = "pointer";
		}else{
			this.lerp.radius -= nodeTransitionSpeed * delta;
			this.lerp.textOffset -= nodeTransitionSpeed * delta;
		}
		this.lerp.radius = Math.max(Math.min(this.lerp.radius, 1), 0);
		this.lerp.textOffset = Math.max(Math.min(this.lerp.textOffset, 1), 0);

		if(mouseHovering == false && globalGraph.hasHoveredNode == true){
			this.lerp.nothovered += nodeTransitionSpeed * delta;
			if(this.hasChild(globalGraph.hoveredNode) || this.hasParent(globalGraph.hoveredNode)){
				this.lerp.nothovered = Math.min(this.lerp.nothovered, 0.1)
			}
		}else{
			this.lerp.nothovered -= nodeTransitionSpeed * delta;
		}
		this.lerp.nothovered = Math.max(Math.min(this.lerp.nothovered, 0.9), 0);

		if(mouseHovering && !this.isHovered) {
			globalGraph.setHoveredNode(true, this);
		}else if(!mouseHovering && this.isHovered && globalGraph.hasHoveredNode) {
			globalGraph.setHoveredNode(false, this);
		}

		this.isHovered = mouseHovering;

		let context = globalGraph.canvas.getContext("2d");
		let bgColour = this.getStyling().background;

		let displayX = globalGraph.canvas.width / 2 + (this.display.x - camera.x) * camera.zoom;
		let displayY = globalGraph.canvas.height / 2 + (this.display.y - camera.y) * camera.zoom;
		let radius = Math.abs(this.display.radius * camera.zoom);

		// Fill
		context.shadowBlur = 0;
		context.shadowColor = 'black';
		context.strokeStyle = "black";
		context.fillStyle = "black";
		context.beginPath();
		context.arc(displayX, displayY, radius + lerp(0, 10, this.lerp.radius) + 1, 0, Math.PI * 2);
		context.fill();

		let r = lerp(bgColour.r, globalGraph.styles.bg.r, this.lerp.nothovered);
		let g = lerp(bgColour.g, globalGraph.styles.bg.g, this.lerp.nothovered);
		let b = lerp(bgColour.b, globalGraph.styles.bg.b, this.lerp.nothovered);
		context.fillStyle = `rgb(${r}, ${g}, ${b})`;
		// context.fillStyle = `purple`;
		context.lineWidth = 5;
		context.shadowBlur = 0;
		context.beginPath();
		context.fillStyle = `rgb(${r}, ${g}, ${b})`;
		context.arc(displayX, displayY, radius + lerp(0, 10, this.lerp.radius), 0, Math.PI * 2);
		context.stroke();
		context.fill();
		context.closePath();

		context.closePath();

		// Title and Glyph
		context.beginPath();
		let t = (camera.zoom - globalGraph.styles.text.minimumZoom / 2);
		t = Math.min(t, 1-this.lerp.nothovered);
		t = Math.max(t, this.lerp.radius);
		// t = camera.zoom - 0.5;
		let a = lerp(0, 1, t);
		// Title
		context.fillStyle = `rgba(255, 255, 255, ${a})`;
		context.font = "15px 'JetBrains Mono'";
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		let textX = displayX;
		let textY = displayY + radius + lerp(0, 10, this.lerp.textOffset) + 10;
		context.fillText(this.display.title, textX, textY);
		// context.fillText(this.token, textX, textY);
		context.closePath();

		// Glyph
		context.beginPath();
		let text = globalGraph.getTag(this.display.tags[0])?.glyph || this.display.glyph;
		context.shadowColor = `rgba(0, 0, 0, ${a})`;
		context.strokeStyle = `rgba(0, 0, 0, ${a})`;
		context.fillStyle = `rgba(255, 255, 255, ${a})`;
		context.font = `bold ${this.display.radius * camera.zoom / 1.5 + lerp(0, 10, this.lerp.radius)}px 'JetBrains Mono', 'Noto Emoji'`;
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.lineWidth = this.display.radius * camera.zoom / 10;
		context.strokeText(text, displayX, displayY);
		context.fillText(text, displayX, displayY);
		context.closePath();

		return this;
	}
	remove(){

		for(let childIndex = 0; childIndex < this.children.length; childIndex ++){
			let childToken = this.children[childIndex];
			globalGraph.getNode(childToken).removeConnectionTo(this);
		}

		for(let parentIndex = 0; parentIndex < this.parents.length; parentIndex ++){
			let parentToken = this.parents[parentIndex];
			globalGraph.getNode(parentToken).removeConnectionTo(this);
		}

		globalGraph.removeNode(this);

		delete this;
		return undefined;
	}
}

function getRegexGroups(regex=new RegExp(), string="", groups=1){
	let regexGroups = [];
	let item;

	while (item = regex.exec(string)){
		for(let group = 0; group < groups; group ++){
			regexGroups.push(item[group]);
		}
	}

	return regexGroups;
}