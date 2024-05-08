import Graph from "./display/graph.js";
import Node from "./display/nodes.js";
import { keyboard, mouse } from "../toolkit/keyboard.js";
import { Pane } from 'https://cdn.skypack.dev/tweakpane';

export var globalGraph = new Graph;

export var camera = new class {
	zoom = 3;
	x = 0;
	y = 0;
	setDefaultZoom(zoom=this.zoom){
		this.zoom = zoom;
		initalCameraZoom = zoom;
	}
}
export var initalCameraZoom = structuredClone(camera.zoom);

var lastCalledTime = 0;
export var fps = 0;
export var delta;
export var nodeTransitionSpeed = 5;

export var redraw = true;
var escapePressed = false;

graphUpdate();

var optionsPane = new Pane({ title: 'Node Options' });
export var optionsPaneVisibility = true;
var focusedNode = null;
var focusedNode_prev = null;

var customScript = function(){}

keyboard.setScript((e) => {
	let key = e.key.toLowerCase();

	if(globalGraph.canvas.matches(':hover') == false) return;

	if(e.type == "keydown") {
		if(key == "escape" && !escapePressed){
			redraw = !redraw;
			escapePressed = true;
		}
		if(e.ctrlKey == false) return;

		if(key == "+" || key == "=") {
			e.preventDefault();
			changeZoom(camera.zoom / 10);
		}else if(key == "-" || e.key == "_") {
			e.preventDefault();
			changeZoom(camera.zoom / -10);
		}else if(key == "0") {
			e.preventDefault();
			setZoom(initalCameraZoom);
			cameraTo(0, 0);
		}
	}else if(e.type == "keyup"){
		if(key == "escape"){
			escapePressed = false;
		}
	}
});
mouse.setScript((e) => {
	if(e.type != "mousedown") return;
	
	if(e.target == globalGraph.canvas) globalGraph.tryClick();
});

export function setCustomScript(callback=()=>{}){
	customScript = callback;
}

function graphUpdate(){
	
	if(focusedNode != focusedNode_prev && focusedNode != null) {
		veiwNode(focusedNode);
	}
	focusedNode_prev = focusedNode;

	if(!lastCalledTime) {
		lastCalledTime = Date.now();
		fps = 0;
	}
	delta = (Date.now() - lastCalledTime)/1000;
	lastCalledTime = Date.now();
	fps = 1/delta;

	
	camera.zoom = Math.max(camera.zoom, 0.1);

	cameraGlide();
	if(customScript){
		customScript();
	}
	globalGraph.render();
	setTimeout(() => {
		window.requestAnimationFrame(graphUpdate);
	}, 1000 / 60);
	// alert(delta);
}

export function changeZoom(factor=0){
	setZoom(camera.zoom + factor);
}
export function setZoom(factor=camera.zoom){
	camera.zoom = Math.max(factor, 0);
}
var glideTo = null;
export function cameraTo(x=0, y=0){
	camera.x = x;
	camera.y = y;
}
export function cameraMoveby(x=0, y=0){
	camera.x -= x / camera.zoom;
	camera.y -= y / camera.zoom;
}

export function cameraGlideTo(node=new Node){
	glideTo = node;
}

function cameraGlide(){
	if(!glideTo) return;

	let distanceX = camera.x - glideTo.display.x;
	let distanceY = camera.y - glideTo.display.y;

	if(Math.abs(distanceX) < 1 && Math.abs(distanceY) < 1){
		glideTo = null;
		return;
	}

	let speedMultiplier = 5 * delta * camera.zoom;
	
	cameraMoveby(
		distanceX * speedMultiplier,
		distanceY * speedMultiplier
	)

}

export function calcDistance(start={x:0,y:0}, end={x:0,y:0}){
	return Math.hypot(
		start.x - end.x,
		start.y - end.y
	);
}
export function getRegexGroups(regex=new RegExp(), string=""){
	return [...string.matchAll(regex)];
}

window.addEventListener('wheel', (e) => {

	if (e.ctrlKey) {
		if(e.target != globalGraph.canvas) return undefined;
		e.preventDefault();
		camera.zoom -= e.deltaY * 0.01;
	} else {
		if(e.target != globalGraph.canvas) return undefined;
		e.preventDefault();
		cameraMoveby(-e.deltaX, -e.deltaY);
	}

}, {passive: false});

window.addEventListener("gesturestart", (e) => e.preventDefault(), {passive: false});
window.addEventListener("gesturechange", (e) => e.preventDefault(), {passive: false});
window.addEventListener("gestureend", (e) => e.preventDefault(), {passive: false});

var lastTouchX = null;
var lastTouchY = null;
var lastZoomDistance = null;
var hoveredNode = null;
var numberOfTouches = 0;
document.addEventListener("touchstart", function(e){
	numberOfTouches == e.touches.length;
	if(e.touches.length == 1){
		var touch = e.touches[0];
		lastTouchX = touch.pageX;
		lastTouchY = touch.pageY;
		mouse.position.x = lastTouchX;
		mouse.position.y = lastTouchY;
		mouse.click_l = true;
	}else if(e.touches.length == 2){
		lastZoomDistance = calcDistance({
			x: e.touches[0].pageX,
			y: e.touches[0].pageY
		}, {
			x: e.touches[1].pageX,
			y: e.touches[2].pageY
		});
	}
});
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
	if(globalGraph.hasHoveredNode){
		hoveredNode = globalGraph.hoveredNode;
	}
	if(e.touches.length > numberOfTouches) numberOfTouches = e.touches.length;
    if(e.touches.length == 1 && numberOfTouches == 1){
		var touch = e.touches[0];
		mouse.position.x = touch.pageX;
		mouse.position.y = touch.pageY;
		mouse.click_l = true;
		if(!hoveredNode){
			cameraMoveby(
				-(lastTouchX - touch.pageX),
				-(lastTouchY - touch.pageY)
			);
		}else{
			hoveredNode.moveTo(
				touch.pageX - globalGraph.canvas.width / 2 + camera.x * camera.zoom,
				touch.pageY - globalGraph.canvas.height / 2 + camera.y * camera.zoom
			);
		}
		lastTouchX = touch.pageX;
		lastTouchY = touch.pageY;
	}else if(e.touches.length == 2  && numberOfTouches == 2){
		let currentZoomDistance = calcDistance({
			x: e.touches[0].pageX,
			y: e.touches[0].pageY
		}, {
			x: e.touches[1].pageX,
			y: e.touches[1].pageY
		});
		if(!lastZoomDistance) lastZoomDistance = currentZoomDistance;
		camera.zoom -= (lastZoomDistance - currentZoomDistance) * 0.01;
		lastZoomDistance = currentZoomDistance;
	}
}, false);
document.addEventListener("touchend", function(e){
	if(e.touches.length == 0){
		hoveredNode = null;
		mouse.click_l = false;
		lastZoomDistance = null;
		numberOfTouches = 0;
	}
});

export function applyFocus(node){
	focusedNode = node;
}

export function showOptionsPane(){
	optionsPaneVisibility = true;
}
export function hideOptionsPane(){
	optionsPaneVisibility = false;
	if(optionsPane.containerElem_ != null) optionsPane?.dispose();
}
function veiwNode(node=new Node){

	if(!optionsPaneVisibility) return;
	if(optionsPane.containerElem_ != null) optionsPane?.dispose();
	optionsPane = new Pane({ title: 'Node Options' });

	if(!node) throw Error("The `viewNode` function was called without parameter: Node");

	let options = structuredClone(node.display);

	let optionKeys = Object.keys(options);

	for(let optionIndex = 0; optionIndex < optionKeys.length; optionIndex ++){
		let item = optionKeys[optionIndex];

		if(typeof options[item] == "function") continue;
		if(typeof options[item] == "object") continue;
		if(item == "x" || item == "y") continue;

		let title = `${item}`;
		title = title.replaceAll("_", " ");
		title = title.toLowerCase();
		title = title.split(" ");
		title = title.map(word => word.charAt(0).toUpperCase() + word.slice(1));
		title = title.join(" ");

		optionsPane.addBinding(options, item, { label: title });
	}

	optionsPane.addBlade({
		view: 'separator',
	});

	const saveButton = optionsPane.addButton({
		title: 'Save'
	});
	saveButton.on('click', () => {
		options.x = node.display.x;
		options.y = node.display.y;
		node.display = options;
		focusedNode = null;
		veiwNode(node);
	});

	optionsPane.addButton({
		title: 'Remove Node'
	}).on('click', () => {
		node.remove();
		if(optionsPane.containerElem_ != null) optionsPane?.dispose();
		console.log(globalGraph);
	});
}

export function lerp(a, b, t) {
	t = Math.max(Math.min(t, 1), 0);
	return a + (b - a) * t
}

export function hexToRgb(hex="") {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
	  r: parseInt(result[1], 16),
	  g: parseInt(result[2], 16),
	  b: parseInt(result[3], 16)
	} : null;
  }
  