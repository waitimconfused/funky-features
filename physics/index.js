import { engine, Point2, Point4 } from "../canvas-engine/utils.js";
import { Circle, Rect } from "../canvas-engine/components.js";

class Vector {
	#x = 0;
	#y = 0;
	#angle = 0;
	#magnitude = 0;

	/**
	 * @param {number} a
	 * @param {number} b
	 * 
	 * @param {"pos" | "ang-mag"} mode
	*/
	constructor(a, b, mode) {
		mode = mode ?? "pos";

		if (mode == "pos") {
			this.#x = a;
			this.y = b;
		} else if (mode == "ang-mag") {
			this.#angle = a;
			this.magnitude = b;
		}
	}

	/** @type {Vector} vector */
	add(vector) {
		this.#x += vector.x;
		this.y += vector.y;
		return this;
	}

	/** @param {number} x */
	set x(x) {
		this.#x = x;

		this.#angle = Math.atan2(this.#y, this.#x);
		this.#magnitude = Math.hypot(this.#x, this.#y);
	}

	/** @param {number} y */
	set y(y) {
		this.#y = y;

		this.#angle = Math.atan2(this.#y, this.#x);
		this.#magnitude = Math.hypot(this.#x, this.#y);
	}

	/** @param {number} angle In radians */
	set angle(angle) {
		this.#angle = angle;
		
		this.#x = this.#magnitude * Math.cos(this.#angle);
		this.#y = this.#magnitude * Math.sin(this.#angle);
	}

	/** @param {number} magnitude */
	set magnitude(magnitude) {
		this.#magnitude = magnitude;
		
		this.#x = this.#magnitude * Math.cos(this.#angle);
		this.#y = this.#magnitude * Math.sin(this.#angle);
	}

	get x() { return this.#x; }
	get y() { return this.#y; }
	get angle() { return this.#angle; }
	get magnitude() { return this.#magnitude; }

	scale(factor) {
		this.#x *= factor;
		this.y *= factor;
		return this;
	}

	clone() {
		return new Vector(this.x, this.y, "pos")
	}
}

var velocity = new Vector(0, 0, "pos");
var acceleration = new Vector(0, 0.98, "pos");

const circle = new Circle;
engine.addObject(circle);
circle.moveTo(0, -100);
circle.radius = 10;
circle.transform.set(0, 0);

circle.mode = "arc";

circle.startAngle = 0;
circle.endAngle = Math.PI * 1.75;

const rect = new Rect;
rect.display.set(0, 10, 100, 100);
engine.addObject(rect);
rect.transform.set(0, 0);

engine.preRenderingScript = () => {

	engine.preRenderingScript = () => {};
	return;

	rect.moveTo( engine.mouse.toWorld() )

	velocity.x += acceleration.x * engine.stats.delta;
	velocity.y += acceleration.y * engine.stats.delta;

	circle.moveBy(velocity);

	let distance = distanceToRect(circle.display, rect.display);
	
	// \sqrt{\max\left(\min\left(S_{1}.x,S_{2}.x\right)-P_{1}.x,0,P_{1}.x-\max\left(S_{1}.x,S_{2}.x\right)\right)^{2}+\max\left(\min\left(S_{1}.y,S_{2}.y\right)-P_{1}.y,0,P_{1}.y-\max\left(S_{1}.y,S_{2}.y\right)\right)^{2}}

	if (distance.y < circle.radius && distance.x <= 50) {
		circle.display.y = rect.display.y - circle.radius;
		velocity.y *= -0.5;
	}

	if (circle.display.y > -circle.radius) {
		circle.display.y = -circle.radius;
		velocity.y *= -0.5;
	}
}



/**
 * @param {Point2} point
 * @param {Point4} rect
 */
function distanceToRect(point, rect) {

	let x = Math.max( rect.x - point.x, point.x - (rect.x + rect.w) );
	let y = Math.max( point.y - (rect.y + rect.h), point.y - rect.y );

	let hypot = Math.hypot(x, y);

	return { x, y, distance: hypot };
}