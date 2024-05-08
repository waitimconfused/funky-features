import { calcDistance, camera, delta, globalGraph, lerp, nodeTransitionSpeed } from "../../index.js";
import { mouse } from "../../../toolkit/keyboard.js";
import Node from "../nodes.js";

export default class Rect extends Node {
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
		let radiusConst = Math.abs(this.display.radius * camera.zoom);
		let radius = radiusConst + lerp(0, 10, this.lerp.radius);

		// Fill
		context.shadowBlur = 0;
		context.shadowColor = 'black';
		context.strokeStyle = "black";
		context.fillStyle = "black";
		context.beginPath();
		// context.arc(displayX, displayY, radius + lerp(0, 10, this.lerp.radius) + 1, 0, Math.PI * 2);
		context.roundRect(displayX - radius-1, displayY - radius-1, radius*2+2, radius*2+2, 3);
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
		// context.arc(displayX, displayY, radius + lerp(0, 10, this.lerp.radius), 0, Math.PI * 2);
		context.roundRect(displayX - radius, displayY - radius, radius*2, radius*2, 3);
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
		let textY = displayY + radiusConst + lerp(0, 10, this.lerp.textOffset) + 10;
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
		context.lineWidth = this.display.radiusConst * camera.zoom / 10;
		context.strokeText(text, displayX, displayY);
		context.fillText(text, displayX, displayY);
		context.closePath();

		return this;
	}
}