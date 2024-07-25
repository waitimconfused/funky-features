import { engine, Point2 } from "./utils.js";
import * as components from "./components/index.js";
import * as toolbelt from "../toolbelt/toolbelt.js";

function radian(deg=90) {
	return deg * Math.PI / 180
}

engine.setBackground("black");
engine.disableZoom();

var bodyColour = "#3A7CA5";
var finColour = "#81C3D7";

var circles = [];
var circleDisplayRadius = [68, 81, 84, 83, 77, 64, 51, 38, 32, 19];
var circleCount = circleDisplayRadius.length;

var text = new components.Text;
text.textSize = "20px"
text.styling = "bold";
text.textAlign = "right";
text.textBaseLine = "top";
text.color = bodyColour;
text.script = function() {
	text.moveTo(engine.canvas.width - 10, 10);
}

var polygon = new components.Polygon;
polygon.smooth = true;
polygon.outline.size = 10;
polygon.outline.colour = "white";
polygon.colour = bodyColour;
polygon.script = function() {
	polygon.positions = [];
	for (let i = 0; i < circles.length; i ++) {
		let circle = circles[i];
		let leftSide = circle.getAttribute("leftSide");
		polygon.addPoint(leftSide);
	}
	for (let i = circles.length-1; i > -1; i --) {
		let circle = circles[i];
		let leftSide = circle.getAttribute("rightSide");
		polygon.addPoint(leftSide);
	}
}

function chainLinkUpdate(circle=new components.Circle) {
	let index = circle.getAttribute("index");

	if(index == 0) {
		// circle.moveTo(toolbelt.mouse.position);
	}

	let radius = circle.getAttribute("spacing");

	let self = circle.display;
	let forwards = circles[index-1]?.display || null;
	let backwards = circles[index+1]?.display || null;

	let dx_forwards = forwards?.x - self.x;
	let dy_forwards = forwards?.y - self.y;
	let dx_backwards = self.x - backwards?.x;
	let dy_backwards = self.y - backwards?.y;

	let angleForwards = Math.atan(dy_forwards / dx_forwards);
	angleForwards += Math.PI * (self.x > forwards?.x);
	angleForwards += radian(90);
	angleForwards *= -1;

	let angleBackwards = Math.atan(dy_backwards / dx_backwards);
	angleBackwards += Math.PI * (self.x < backwards?.x);
	angleBackwards += radian(90);
	angleBackwards *= -1;

	if(index == 0) {
		let positionX = Math.sin( performance.now() / 1000) * engine.canvas.width/8*3 + engine.canvas.width / 2;
		let positionY = Math.cos( performance.now() / 1000) * engine.canvas.height/8*2 + engine.canvas.height / 2;

		let ghostCircle = new components.Circle;
		ghostCircle.moveTo(positionX, positionY);
		engine.addObject(ghostCircle);
		ghostCircle.render(engine.canvas.getContext("2d"));
		engine.removeObject(ghostCircle);

		// let positionX = toolbelt.mouse.position.x;
		// let positionY = toolbelt.mouse.position.y;
		let dx_forwards = positionX - self.x;
		let dy_forwards = positionY - self.y;

		let angleForwards = Math.atan(dy_forwards / dx_forwards);
		angleForwards += Math.PI * (self.x > positionX);
		angleForwards -= radian(90);
		angleForwards *= -1;
		let distance = Math.hypot(dx_forwards, dy_forwards);
		let speedX = Math.sin(angleForwards);
		let speedY = Math.cos(angleForwards);
		// circle.moveBy( speedX * distance/50, speedY * distance/50 );
		// circle.moveBy( speedX, speedY );
		circle.moveTo( positionX, positionY );
		// circle.moveBy( engine.stats.delta * speedX, engine.stats.delta * speedY );
	}

	let leftSide = new Point2;
	let rightSide = new Point2;

	if(index > 0 && angleForwards) {
		if(angleForwards && angleBackwards) {
			let angleLimit = radian(45);
			// if (Math.abs(angleForwards - angleBackwards) < angleLimit) {
			// 	angleForwards = angleForwards;
			// } else if (angleForwards > angleBackwards) {
			// 	angleForwards =  angleBackwards + angleLimit;
			// } else {
			// 	angleForwards = angleBackwards - angleLimit;
			// }
		}
		leftSide = mapToCircle(self, circle.radius, angleForwards - radian(90));
		rightSide = mapToCircle(self, circle.radius, angleForwards + radian(90));
	}
	if(index == 0 && angleBackwards) {
		leftSide = mapToCircle(self, circle.radius, angleBackwards - radian(90));
		rightSide = mapToCircle(self, circle.radius, angleBackwards + radian(90));
	}

	if(index > 0) {
		let newPosition = mapToCircle(forwards, radius, angleForwards);
		circle.moveTo(newPosition);
	}

	circle.setAttribute("leftSide", leftSide);
	circle.setAttribute("rightSide", rightSide);

}

function mapToCircle(position=new Point2, radius=10, radian=0) {
	return new Point2(radius * Math.sin(radian) + position.x, radius * Math.cos(radian) + position.y);
}

for (let i = 0; i < circleCount; i ++) {
	let circle = new components.Circle;

	circle.setAttribute("index", i);

	circle.moveTo(window.innerWidth / 2, window.innerHeight / 2);

	circle.radius = circleDisplayRadius[i] / 2;
	circle.setAttribute("spacing", circleDisplayRadius[i] / 2);
	circle.colour = "transparent";
	if(i == 0 || i == circleCount - 1) {
		circle.colour = bodyColour;
	}
	// circle.outline.colour = "#787878";
	// circle.outline.size = 10;

	circle.script = function() {
		chainLinkUpdate(circle);
	}

	engine.addObject(circle);
	circles.push(circle);
}

engine.addObject(text);
engine.addObject(polygon);