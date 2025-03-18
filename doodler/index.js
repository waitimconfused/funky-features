import { getValue } from "../toolbelt/lib/units.js";
import { lerp, randomInRange, Range, Round } from "../toolbelt/toolbelt.js";
import { Component, engine, Point2, Point4 } from "../canvas-engine/utils.js";
import { Path, Text } from "../canvas-engine/components.js";

class HTMLInput extends Component {
	/** @type {"button" | "slider" | "toggle"} */
	type = "button";

	style = {
		fontFamily: "Arial",
		slider: {
			min: 0,
			max: 100,
			step: 1,
			backgroundColour: "#EEEEEE",
			valueColour: "#AAAAFF",
			handleColour: "#7777FF",
			handleSize: 40,
			insetAmount: 10,
			radius: 20,
		},
		button: {
			radius: 20,
			normal: {
				backgroundColour: "#DDDDFF"
			},
			hover: {
				backgroundColour: "#AAAAFF"
			},
			active: {
				backgroundColour: "#7777FF"
			}
		}
	}

	/** @type {?String} If `null`, this will render the input-type */
	label = null;
	value = 0;
	#valueAsPercentage = 0;


	/**
	 * @param {CanvasRenderingContext2D} context 
	 * @param {Point2 | {x:number, y:number}} defaultOffset 
	 */
	render(context, defaultOffset) {
		if (!defaultOffset) defaultOffset = {x: 0, y: 0};
				
		if (!this.visibility) return this;

		let destinationX = getValue( this.display.x );
		let destinationY = getValue( this.display.y );
		let destinationW = getValue( this.display.w );
		let destinationH = getValue( this.display.h );
		destinationX += defaultOffset.x;
		destinationY += defaultOffset.y;
		destinationX -= destinationW * this.transform.x;
		destinationY -= destinationH * this.transform.y;

		if(engine.isPixelArt){
			destinationX = Math.floor(destinationX);
			destinationY = Math.floor(destinationY);
		}
		
		context.save();
		if (!this.fixedPosition) {
			destinationX -= engine.camera.position.x;
			destinationY -= engine.camera.position.y;
			if (this.isPixelArt == true || (this.isPixelArt == "unset" && engine.isPixelArt)) {
				context.translate(Math.round(engine.canvas.width / 2), Math.round(engine.canvas.height / 2));
				context.scale(Math.round(engine.camera.zoom), Math.round(engine.camera.zoom));
				destinationX = Math.floor(destinationX);
				destinationY = Math.floor(destinationY);
				destinationW = Math.floor(destinationW);
				destinationH = Math.floor(destinationH);
			} else {
				context.translate(engine.canvas.width / 2, engine.canvas.height / 2);
				context.scale(engine.camera.zoom, engine.camera.zoom);
			}
		}

		let validCursor = [this.hash, null].includes(engine.activeObject);

		let mouse = engine.mouse.toObject(this);
		this.#hovering = Range.fits(0, mouse.x, destinationW) && Range.fits(0, mouse.y, destinationH);
		this.#hovering = ( validCursor && this.#hovering );
		if (this.#hovering) {
			engine.hoverObject = true;
		}

		if (
			this.#active == true ||
			(engine.mouse.click_l && this.#hovering && validCursor)
		) {
			this.#active = engine.mouse.click_l;
			engine.activeObject = engine.mouse.click_l ? this.hash : null;
			if (this.#active) engine.mouse.click_l = false;
		}

		let renderFunction = this.#rendering[ this.type ];
		renderFunction(context, new Point4(destinationX, destinationY, destinationW, destinationH));

		context.restore();
	}

	#active = false;
	#hovering = false;

	#rendering = {
		/**
		 * 
		 * @param {CanvasRenderingContext2D} context
		 * @param {Point4} dest Output destination
		 */
		button: (context, dest) => {

			context.beginPath();
			context.roundRect(dest.x, dest.y, dest.w, dest.h, this.style.button.radius);
			if (this.#active) {
				context.fillStyle = this.style.button.active.backgroundColour;
				this.value = true;
				this.#valueAsPercentage = 1;
			} else if (this.#hovering) {
				context.fillStyle = this.style.button.hover.backgroundColour;
				this.value = false;
				this.#valueAsPercentage = 0;
			} else {
				context.fillStyle = this.style.button.normal.backgroundColour;
				this.value = false;
				this.#valueAsPercentage = 0;
			}
			context.fill();
			context.closePath();

			context.beginPath();
			context.textBaseline = "middle";
			context.fillStyle = "black";
			context.textAlign = "middle";
			context.font = `16px ${this.style.fontFamily}, Arial`;
			context.fillText(
				this.label ?? this.type,
				dest.x + dest.w/2,
				dest.y + dest.h/2
			);
			context.closePath();

		},

		/**
		 * 
		 * @param {CanvasRenderingContext2D} context
		 * @param {Point4} destination
		 */
		slider: (context, destination) => {

			
			let innerWidth = destination.w - this.style.slider.insetAmount * 2;
			let innerHeight = destination.h - this.style.slider.insetAmount * 2;

			let mouse = engine.mouse.toObject(this);
			let percentage = (mouse.x-this.style.slider.insetAmount-innerHeight/2) / (innerWidth-innerHeight)

			if (this.#active) {
				this.#valueAsPercentage = Range.clamp(0, percentage, 1);
				this.value = lerp(this.style.slider.min, this.style.slider.max, this.#valueAsPercentage);
				this.value = Round.roundToNearest(this.value, this.style.slider.step);
			}

			context.beginPath();
			context.fillStyle = this.style.slider.backgroundColour;
			context.roundRect(destination.x, destination.y, destination.w, destination.h, this.style.slider.radius);
			context.fill();
			context.closePath();

			let displayPercentage = (this.value - this.style.slider.min) / (this.style.slider.max - this.style.slider.min);
			let valueDisplayWidth = lerp(innerHeight, innerWidth,  displayPercentage );

			context.beginPath();
			context.fillStyle = this.style.slider.valueColour;
			context.roundRect(
				destination.x + this.style.slider.insetAmount,
				destination.y + this.style.slider.insetAmount,
				valueDisplayWidth,
				innerHeight,
				Math.max(this.style.slider.radius - this.style.slider.insetAmount, 0)
			);
			context.fill();
			context.closePath();

			context.beginPath();
			context.fillStyle = this.style.slider.handleColour;
			let handleX = destination.x - this.style.slider.insetAmount/2 + valueDisplayWidth - this.style.slider.handleSize/2;
			let handleY = destination.y + destination.h/2 - this.style.slider.handleSize/2;
			let radius = this.style.slider.radius - (handleY-destination.y);
			radius = Math.max(radius, 0);
			context.roundRect(
				handleX,
				handleY,
				this.style.slider.handleSize,
				this.style.slider.handleSize,
				radius
			)
			context.fill();
			context.closePath();

			if (this.#hovering || this.#active) {
				context.beginPath();
				context.textBaseline = "top";
				context.fillStyle = "black";
				context.textAlign = "left";
				context.font = `16px ${this.style.fontFamily}, Arial`;
				context.fillText(this.value.toString(), destination.x, destination.y + destination.h);
			}
		}
	}
}

String.prototype.toTitleCase = function() {
	let string = this.valueOf();

	return string.replace(
		/\w\S*/g,
		text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
	);
}

// engine.camera.maxZoom = 1;

let inputTypes = [ "button", "slider" ];

for (let i = 0; i < inputTypes.length; i ++) {
	let type = inputTypes[i];

	let typeLabel = new Text;
	typeLabel.content = type.toTitleCase();
	typeLabel.textBaseLine = "bottom";
	typeLabel.fontFamily = "Preahvihear";
	typeLabel.moveTo(i * 225, -75);
	engine.addObject(typeLabel);

	let input = new HTMLInput;
	input.type = type;
	input.label = "I am an input!";
	input.display.w = 150;
	input.display.h = 50;
	input.style.fontFamily = "Indie Flower";
	input.moveTo(i * 225, 0);
	engine.addObject(input);
}


// let path = new Path;
// engine.addObject(path);
// path.path = generateHandrawnPath( new Point2(0, 0), new Point2(100, 0), new Point2(100, 100), new Point2(0, 100) );

















/** @param {...Point2} points */
function generateHandrawnPath(...points) {
	let path = new Path;

	/**
	 * @type {{
	 * 	"1": Point2,
	 * 	"2": Point2,
	 *  radiusModifier: number
	 *  directionModifier: number
	 * }[]}
	 */
	let handles = [];

	for (let i = 0; i < points.length; i ++) {
		let h1 = new Point2(points[i].x, points[i].y);
		let h2 = new Point2(points[i].x, points[i].y);
	
		handles.push({
			"1": h1,
			"2": h2,
			radiusModifier: randomInRange(1, 20),
			directionModifier: randomInRange(-Math.PI/4, Math.PI/4),
		});
	}

	for (let i = 0; i < points.length; i ++) {
		let a0 = points.at(i-1);
		let a1 = points[i];
		let h1 = handles[i]["1"];
		let h2 = handles[i]["2"];
		let a2 = points[(i+1)%points.length];

		let radiusModifier = handles[i].radiusModifier;
		let directionModifier = handles[i].directionModifier;

		let dirToA0 = Math.atan2(a0.y-a1.y, a0.x-a1.x);
		let dirToA2 = Math.atan2(a2.y-a1.y, a2.x-a1.x);

		let dir = (dirToA0+dirToA2)/2 + Math.PI * (Math.abs( dirToA2-dirToA0 ) > Math.PI) + directionModifier;

		let handleX = Math.cos(dir + Math.PI/2) * radiusModifier;
		let handleY = Math.sin(dir + Math.PI/2) * radiusModifier;

		h1.set(a1.x, a1.y);
		h2.set(a1.x, a1.y);

		h1.translate(handleX, handleY);
		h2.translate(-handleX, -handleY);
	}

	for (let i = 0; i < points.length; i ++) {
		let a1 = points[i];
		let h1 = handles[i]["1"];
		let h2 = handles[i]["2"];
		let h3 = handles[(i+1)%points.length]["1"];
		let h4 = handles[(i+1)%points.length]["2"];
		let a2 = points[(i+1)%points.length];

		let B;
		let C;

		if ( Math.hypot(a2.x-h1.x, a2.y-h1.y) < Math.hypot(a2.x-h2.x, a2.y-h2.y) ) {
			B = h1;
		} else {
			B = h2;
		}

		if ( Math.hypot(a1.x-h3.x, a1.y-h3.y) < Math.hypot(a1.x-h4.x, a1.y-h4.y) ) {
			C = h3;
		} else {
			C = h4;
		}

		if (i == 0) path.pen.moveTo(a1.x, a1.y);
		else path.pen.lineTo(a1.x, a1.y);
		path.pen.cubicCurveTo( B.x,B.y, C.x,C.y, a2.x,a2.y );
	}

	return path.path;
}