import { Point2, Point4, unitConverter, image, mouse, range } from "../toolbelt-v2/index.js";

function isValidUrl(urlString) {
	try { 
		return Boolean(new URL(urlString)); 
	} catch(e) { 
		return false; 
	}
}

class Camera {
	position = new Point2(0, 0);

	get pos() { return this.position; }

	get x() { return this.position.x; }
	get y() { return this.position.y; }

	zoom = 1;
	defaultZoom = 1;

	minZoom = 0.1;
	maxZoom = 999;

	wheelZoomMultiplier = 0.01;
	keyZoomMultiplier = 0.1;

	ctrl0 = {
		resetZoom: true,
		resetPos: false
	};

	/** @type {Engine} */
	#engine;
	get engine() { return this.#engine; }

	/** @param {Engine} parentEngine */
	constructor(engine) {
		window.addEventListener("gesturestart", this.#preventDefaultEvent, {passive: false});
		window.addEventListener("gesturechange", this.#preventDefaultEvent, {passive: false});
		window.addEventListener("gestureend", this.#preventDefaultEvent, {passive: false});
		window.addEventListener("wheel", this.#customZoomEvent, {passive: false});
		window.addEventListener("keydown", this.#customZoomEvent);

		this.trackingTimingFunction.linear();

		this.#engine = engine;
	}

	/** @type { null | Component } */
	trackingObject = null;
	/** Duration in milliseconds (minimum 1ms) */
	trackingDuration = 1000;
	/** @type { null | Point2 } */
	#trackingOrigin = null;
	/** @type {number} `performance.now()` */
	#trackingStartTime = 0;

	/** @param { Component | null } component */
	trackObject(component) {
		this.trackingObject = component;
		this.#trackingStartTime = performance.now();
		this.#trackingOrigin = this.position.clone();
		if (component.cameraTracking == false) component.cameraTracking = true;
	}
	
	/**
	 * @type { {progression:number, time:number}[] }
	 */
	#trackingTimingFunctionPoints = [];
	/** 
	 * Used to set the timing-function of the camera tracking of an object.
	 * 
	 * Similar to: *[CSS easing functions](https://www.w3.org/TR/css-easing-1/)*
	 */
	trackingTimingFunction = {
		/** Remove any camera tracking interpolation (instant) */
		none: () => {
			this.#trackingTimingFunctionPoints = [];
		},
		/** Set the timing-function to linear */
		linear: () => {
			let start = { progression:0, time:0 };
			let end = { progression:1, time:1 };
			this.#trackingTimingFunctionPoints = [ start, end ];
		},

		/** Equivalent to: `cubicBezier(0.25, 0.1, 0.25, 1)` */
		ease: () => this.trackingTimingFunction.cubicBezier(0.25, 0.1, 0.25, 1),

		/** Equivalent to: `cubicBezier(0.42, 0, 1, 1)` */
		easeIn: () => this.trackingTimingFunction.cubicBezier(0.42, 0, 1, 1),

		/** Equivalent to: `cubicBezier(0, 0, 0.58, 1)` */
		easeOut: () => this.trackingTimingFunction.cubicBezier(0, 0, 0.58, 1),

		/** Equivalent to: `cubicBezier(0.42, 0, 0.58, 1)` */
		easeInOut: () => this.trackingTimingFunction.cubicBezier(0.42, 0, 0.58, 1),

		/**
		 * SEE: *[CSS cubic-bezier() timing function](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/cubic-bezier)*
		 * @param {number} progression1
		 * @param {number} time1
		 * @param {number} progression2
		 * @param {number} time2
		 */
		cubicBezier: (progression1,time1, progression2, time2) => {
			let start = { progression:0, time:0 };
			let p1 = { progression:progression1, time:time1 };
			let p2 = { progression:progression2, time:time2 };
			let end = { progression:1, time:1 };
			
			this.#trackingTimingFunctionPoints = [ start, p1, p2, end ];
		}
	}
	
	/**
	 * 
	 * @param {number | Point2 | Component | {x: number, y: number}} x
	 * @param {number | undefined} y
	 * @returns this
	 */
	moveTo(x, y) {
		if (x == null) x = this.position.x;
		if (y == null) y = this.position.y;
		if(x instanceof Point2 || x?.x && x?.y) {
			y = x.y;
			x = x.x;
		} else if ( x instanceof Component ) {
			y = x.display.y;
			x = x.display.x;
		}
		this.position.x = x;
		this.position.y = y;
		return this;
	}

	/**
	 * 
	 * @param {number | Point2 | {x: number, y: number}} x
	 * @param {number | undefined} y
	 * @returns this
	 */
	moveBy(x, y) {
		if (x == null) x = 0;
		if (y == null) y = 0;
		if(x instanceof Point2 || x?.x && x?.y) {
			y = x.y;
			x = x.x;
		}
		this.position.x += x;
		this.position.y += y;
		if (this.#engine.isPixelArt || this?.isPixelArt) {
			this.position.x = Math.round(this.position.x);
			this.position.y = Math.round(this.position.y);
		}
		return this;
	}

	/**
	 * 
	 * @param {boolean} resetDefaults Flag for resetting all values, including the defaults
	 */
	reset(resetDefaults) {
		if (resetDefaults) {
			this.defaultZoom = 1;
			this.minZoom = 0.1;
			this.maxZoom = 999;
			this.wheelZoomMultiplier = 0.01;
			this.keyZoomMultiplier = 0.1;
			this.ctrl0.resetZoom = true;
			this.ctrl0.resetPos = false;
			this.canZoom = false;
			this.canPan = false;
		}
		this.position.x = 0;
		this.position.y = 0;
		this.zoom = this.defaultZoom;
		this.trackingObject = null;
	}

	canZoom = false;
	canPan = false;

	/**
	 * 
	 * @param { WheelEvent | KeyboardEvent } e
	 */
	#customZoomEvent = (e) => {

		if (e instanceof WheelEvent) {
			if (e.target != this.engine.canvas) return;
			if (e.ctrlKey) {
				e.preventDefault();
				if (this.canZoom == false) return;

				this.zoom -= e.deltaY * this.wheelZoomMultiplier * this.zoom/2;
				this.zoom = range.clamp(this.minZoom, this.zoom, this.maxZoom);
			} else {
				e.preventDefault();
				if (this.canPan == false) return;
				this.moveBy(e.deltaX/this.zoom, e.deltaY/this.zoom);
			}
		} else if (e instanceof KeyboardEvent) {
			if (!e.ctrlKey) return;

			let scale = null;

			if (["+","="].includes(e.key)) scale = 1;
			if (["-","_"].includes(e.key)) scale = -1;
			if (["0"].includes(e.key)) scale = 0.0;

			if (scale != null) e.preventDefault(); else return;
			if (e.repeat) return;
			if (this.canZoom == false) return;

			this.zoom += scale * this.keyZoomMultiplier;
			if (e.key == "0") {
				if (this.ctrl0.resetZoom) this.zoom = this.defaultZoom;
				if (this.ctrl0.resetPos) this.moveTo(0, 0);
			}
			this.zoom = range.clamp(this.minZoom, this.zoom, this.maxZoom);
		}
	
	}
	/**
	 * 
	 * @param { MouseEvent | WheelEvent | KeyboardEvent } e
	 */
	#preventDefaultEvent = (e) => {
		if(e.ctrlKey && ["+","-","=","_"].includes(e.key)) e.preventDefault();
		if(e.target == this.engine.canvas) e.preventDefault();
	}

	/** @param {Camera} camera */
	script = (camera) => {}

	#trackDelay = 1;
	update() {
		this.script(this);
	}
}

function darkMode() {
	return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// var patternImage = new Image;
// patternImage.src = `./paper_bg.jpg`;
var pattern;

// patternImage.onload = () => {
// 	pattern = engine.canvas.getContext("2d").createPattern(patternImage, "repeat");
// }

export class Engine {
	camera = new Camera(this);

	/**
	 * @type {{
	 *	x: number,
	 *	y: number,
	 *	click_l: boolean,
	 *	click_r: boolean,
	 * 	toWorld: (x?:number, y?:number) => Point2,
	 * 	toObject: (object: Component, x:undefined|number, y:undefined|number) => Point2,
	 * 	hoverable: boolean,
	 * }}
	 */
	mouse = mouse.addHook({
		/**
		 * @param {?number} x
		 * @param {?number} y
		 * @returns {Point2}
		 */
		toWorld: (x, y) => {
			/** @type {x:number, y:number} */
			let mouseRelative;
			if (typeof x == "number" && typeof y == "number") {
				mouseRelative = {x, y};
			} else {
				mouseRelative = mouse.toElement(this.canvas);
			}
			let point2 = new Point2;
			point2.x = (mouseRelative.x - this.canvas.width/2) / this.camera.zoom + this.camera.position.x;
			point2.y = (mouseRelative.y - this.canvas.height/2) / this.camera.zoom + this.camera.position.y;
			return point2;
		},
		/**
		 * @param { Component } object
		 * @param {undefined|number} x Mouse X position (In worldspace)
		 * @param {undefined|number} y Mouse Y position (In worldspace)
		 * @returns {Point2}
		 */
		toObject: (object, x, y) => {
			let mousePos = mouse.toElement(this.canvas);
			if (typeof x == "number" && typeof y == "number") mousePos = { x, y };
			let point2 = new Point2;
			if (object.fixedPosition) {
				point2.x = mousePos.x - object.display.x + object.display.w * object.transform.x;
				point2.y = mousePos.y - object.display.y + object.display.h * object.transform.y;
			} else {
				point2.x = (mousePos.x - this.canvas.width/2) / this.camera.zoom + this.camera.position.x - object.display.x + object.display.w * object.transform.x;
				point2.y = (mousePos.y - this.canvas.height/2) / this.camera.zoom + this.camera.position.y - object.display.y + object.display.h * object.transform.y;
			}
			return point2;
		},
		updateFunc: (e) => {
			if (e.click_l && (this.canvas.matches(":active") || this.canvas.matches(":hover")) ) {
				e.stopPropagation();
				e.preventDefault();
			};
		},
		hoverable: true
	});

	canvas = document.createElement("canvas");

	/** @type {Object<string, Component>} */
	components = {
	};
	/** @type {string[]} */
	renderingHashes = [];
	isPixelArt = false;

	stats = {
		fps: 0,
		delta: 1000/60
	};

	/** @type {"back-front" | "front-back"} */
	scriptOrder = "front-back";
	/** @type {"back-front" | "front-back"} */
	renderOrder = "back-front";

	/** @type {?string} Value of `Component.hash` */
	activeObject = null;

	/** @type {boolean} Multiple components can be hovered, so a `boolean` */
	hoverObject = false;

	#lastCalledTime = performance.now();
	#previousData = { isPixelArt: false };
	#show_loadAsset_logs = true;
	#assetsLoaded = 0;
	#fullscreen = false;

	setSize(width=this.canvas.width, height=this.canvas.height) {
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style.width = `${width}px`;
		this.canvas.style.height = `${height}px`;
	}

	get fullscreen () {
		return this.#fullscreen;
	}
	/** @param {boolean} value */
	set fullscreen (value) {
		let prevValue = this.#fullscreen;
		this.#fullscreen = value;
		if (prevValue == false && value == true) {
			if (!this.background) {
				this.background = document.body.style.backgroundColor || "white";
			}
			this.#resizeCanvas();
		}
	}

	/**
	 * @param { string } source
	 * @param {{
	 * 	fontFamilyName?: string
	 * }} options
	 * @returns {Promise<void>}
	 */
	loadAsset(source, options) {
		if (!options) options = {};
		return new Promise((resolve, reject) => {
			fetch(source)
			.then((response) => {
				let type = response.headers.get("Content-Type");
				type = type.split(";")[0];
				let simpleType = "undefined";
				let consoleLogComment = "";
				if (type == "text/css") {
					simpleType = "CSS";
					if (document.head.querySelector(`link[rel="stylesheet"][href="${source}"]`)) {
						if (this.#show_loadAsset_logs) console.warn(`The loading of CSS from url "${source}" was cancled due to already being loaded.`);
						return;
					}
					let link = document.createElement("link");
					link.rel = "stylesheet";
					link.href = source;
					link.type = "text/css";
					document.head.appendChild(link);
					link.onload = () => resolve;
				} else if (type.includes("font")) {
					simpleType = "font";
					if (options.fontFamilyName == undefined) {
						options.fontFamilyName = `font_asset${this.#assetsLoaded}`;
					}
					const font = new FontFace(options.fontFamilyName, `url(${source})`);
					document.fonts.add(font);
					font.load().then( () => resolve );
					consoleLogComment = ` with font-family name "${options.fontFamilyName}"`;
				} else if (type.startsWith("image/")) {
					simpleType = "IMG";
					image.cacheImage(source)
					.then(resolve);
				} else {
					if (this.#show_loadAsset_logs) console.error(`Failed to load asset from url "${source}"${consoleLogComment}`)
					reject();
					return;
				}
				if (this.#show_loadAsset_logs) {
					if (this.#assetsLoaded >= 5) consoleLogComment += "\nYou can disable this message by using `engine.disableLoadAssetLogs()`";
					console.log(`Loaded ${simpleType} from url "${source}"${consoleLogComment}`);
				}
				this.#assetsLoaded += 1;
			});
		})
	}
	/**
	 * Disable all console messages when calling `engine.loadAsset()`
	 * 
	 * !WARNING! Suppresses all asset loading errors
	 */
	disableLoadAssetLogs() {
		this.#show_loadAsset_logs = false;
	}
	
	/**
	 * Enable all console messages when calling `engine.loadAsset()`
	 */
	enableLoadAssetLogs() {
		this.#show_loadAsset_logs = false;
	}

	preRenderingScript = () => {};
	postRenderingScript = () => {};

	/**
	 * @param { ""|"auto"|"default"|"none"|"context-menu"|"help"|"pointer"|"progress"|"wait"|"cell"|"crosshair"|"text"|"vertical-text"|"alias"|"copy"|"move"|"no-drop"|"not-allowed"|"grab"|"grabbing"|"all-scroll"|"col-resize"|"row-resize"|"n-resize"|"e-resize"|"s-resize"|"w-resize"|"ne-resize"|"nw-resize"|"se-resize"|"sw-resize"|"ew-resize"|"ns-resize"|"nesw-resize"|"nwse-resize"| "zoom-in"|"zoom-out" } cursor
	 */
	set cursor(cursor) {
		this.canvas.style.cursor = cursor ?? "auto";
	}
	get cursor() {
		return this.canvas.style.cursor;
	}

	/** @param {number} size */
	set width(size) {
		this.setSize(size, this.canvas.height);
	}
	get width() {
		return this.canvas.width;
	}
	/** @param {number} size */
	set height(size) {
		this.setSize(this.canvas.width, size);
	}
	get height() {
		return this.canvas.height;
	}
	get veiwportWidth() {
		return this.canvas.width / this.camera.zoom;
	}
	get veiwportHeight() {
		return this.canvas.height / this.camera.zoom;
	}

	#resizeCanvas() {
		
		if (this.fullscreen == false) return;
		
		let prevCanvasWidth = this.canvas.width;
		let prevCanvasHeight = this.canvas.height;
		
		let width = window.innerWidth;
		let height = window.innerHeight;
		
		this.canvas.width = width;
		this.canvas.height = height;
		
		this.canvas.style.width = "var(--width)";
		this.canvas.style.height = "var(--height)";
		this.canvas.style.setProperty('--width', `${width}px`);
		this.canvas.style.setProperty('--height', `${height}px`);
		
		this.canvas.style.position = "fixed";
		this.canvas.style.top = "0px";
		this.canvas.style.left = "0px";

		
		if(this.canvas.onresize) {
			if(this.canvas.width != prevCanvasWidth || this.canvas.height != prevCanvasHeight) this.canvas.onresize();
		}
	}
	#updateStats() {
		this.stats.timestamp = performance.now();
		this.stats.delta = (this.stats.timestamp - this.#lastCalledTime) / (1000/60);
		this.#lastCalledTime = performance.now();
		this.stats.fps = Math.round(1 / this.stats.delta);
	}

	/** @param {HTMLCanvasElement} canvas */
	constructor(canvas) {
		if (canvas) {
			this.canvas = canvas;
		} else {
			document.body.appendChild(this.canvas);
		}
		window.addEventListener("resize", () => {
			if (this.fullscreen) this.#resizeCanvas();
		});
		this.#resizeCanvas();
		this.#tick();

		document.addEventListener("visibilitychange", (event) => {
			if (document.visibilityState == "visible") {
				this.#lastCalledTime = performance.now();
			} else {
				// console.log("tab is inactive");
			}
		});
	}

	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	setCanvas(canvas) {
		this.canvas.remove();
		this.canvas = canvas;
		this.fullscreen = false;
	}

	/**
	 * 
	 * @param { ...Component } components
	 */
	addObject(...components) {
		for (let i = 0; i < components.length; i ++) {
			let component = components[i];

			if(component instanceof Component == false) throw new Error("Cannot add object to engine if object is not of type: Component");
			if(this.hasObject(component)) throw new Error("Cannot add object to engine if object was already added.");
			
			component.parent = this;
			component.engine = this;

			let randomToken = generateUUID();
			component.hash = randomToken;

			this.renderingHashes.push(randomToken);
			this.components[randomToken] = component;

			let fakeContext = document.createElement("canvas").getContext("2d")
			component.script(component);
			component.render(fakeContext, {x:0,y:0});
		}
		return this;
	}
	/**
	 * @param { Component } component
	 */
	hasObject(component) {
		if(component instanceof Component == false) throw new Error("Cannot find object in engine if object is not of type: Component");
		let indexOfComponent = this.renderingHashes.indexOf(component.hash);
		return indexOfComponent > -1;
	}
	/**
	 * 
	 * @param {string|number} hash
	 * @returns {Component}
	 */
	getObject(hash) {
		if(["string", "number"].includes( typeof(hash) ) == false) throw new Error("Cannot find object in engine if hash is not of type: String | Number");
		if (typeof hash == "number") hash = this.renderingHashes.at(hash);
		return this.components[hash];
	}
	/**
	 * @param { Component } component
	 */
	removeObject(component) {
		if(component instanceof Component == false) throw new Error("Cannot remove object to engine if object is not of type: Component");
		if(this.hasObject(component) == false) throw new Error("Cannot remove object from engine if object was never added");
		let hash = `${component.hash}`;
		let indexOfComponent = this.renderingHashes.indexOf(hash);
		delete this.components[hash];
		this.renderingHashes.splice(indexOfComponent, 1);
	}

	/**
	 * @param { string } background
	 */
	set background(background) {
		if (isValidUrl(background) || (/\.{1,2}\//gm).test(background)) {
			this.canvas.style.backgroundImage = `url(${background})`;
		} else {
			this.canvas.style.backgroundColor = background;
		}
	}
	get background() {
		return this.canvas.style.backgroundImage || this.canvas.style.backgroundColor || this.canvas.style.background;
	}
	/**
	 * @param { string } href
	 */
	setFavicon(href="") {
		let favicon = document.querySelector("link[rel=icon]");
		if (!favicon) {
			favicon = document.createElement("link");
			favicon.setAttribute("rel", "icon");
			document.head.appendChild(favicon);
		}
		favicon.href = href;
	}

	#tick() {

		this.mouse.hoverable = true;

		this.preRenderingScript();
		this.#updateStats();

		let context = this.canvas.getContext("2d");
		if (this.#previousData.isPixelArt != this.isPixelArt) {
			this.#previousData.isPixelArt = this.isPixelArt;
			if (this.isPixelArt) {
				this.canvas.style.imageRendering = "pixelated";
			} else {
				this.canvas.style.imageRendering = null;
			}
		}

		context.msImageSmoothingEnabled = this.isPixelArt;
		context.mozImageSmoothingEnabled = this.isPixelArt;
		context.webkitImageSmoothingEnabled = this.isPixelArt;
		context.imageSmoothingEnabled = this.isPixelArt;

		let mouse = {
			x: this.mouse.x,
			y: this.mouse.y,
			click_l: this.mouse.click_l,
			click_r: this.mouse.click_r
		}

		this.camera.update();

		context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if (pattern) {
			context.save();

			context.imageSmoothingQuality = "high";
			context.globalAlpha = 0.2;

			let offsetX = this.camera.position.x - this.veiwportWidth/2;
			let offsetY = this.camera.position.y - this.veiwportHeight/2;

			context.translate(this.width/2*this.camera.zoom, this.height/2*this.camera.zoom );
			context.scale(this.camera.zoom, this.camera.zoom);
			context.translate(-this.width/2, -this.height/2);

			
			context.translate(-offsetX, -offsetY);
			
			context.beginPath();
			context.fillStyle = pattern;
			context.rect(offsetX, offsetY, this.veiwportWidth, this.veiwportHeight);
			context.fill();
			context.closePath();

			context.restore();
		}


		for(let i = 0; i < this.renderingHashes.length; i ++) {
			let index;
			switch (this.scriptOrder) {
				case "back-front":
					index = i;
					break;
				case "back-front":
					index = this.renderingHashes.length -i -1;
					break;
				default:
					this.scriptOrder = "back-front";
					index = i;
					break;
			}
			let hash = this.renderingHashes[index];
			let component = this.components[hash];
			if (!component || component instanceof Component == false) {
				console.log("I can't render this:", component);
				continue;
			}
			component.script(component);
		}
		this.camera.update();

		let defaultOffset = new Point2(0, 0);
		for(let i = 0; i < this.renderingHashes.length; i ++) {
			let index;
			switch (this.renderOrder) {
				case "back-front":
					index = i;
					break;
				case "back-front":
					index = this.renderingHashes.length -i -1;
					break;
				default:
					this.renderOrder = "back-front";
					index = i;
					break;
			}
			let hash = this.renderingHashes[index];
			let component = this.components[hash];
			if (!component || component instanceof Component == false) {
				console.log("I can't render this:", component);
				continue;
			}
			component.render(context, defaultOffset);
		}
		this.postRenderingScript();

		this.canvas.style.cursor = (this.activeObject || this.hoverObject) ? "pointer" : "default";

		this.mouse.x = mouse.x;
		this.mouse.y = mouse.y;
		this.mouse.click_l = mouse.click_l;
		this.mouse.click_r = mouse.click_r;

		window.requestAnimationFrame(() => {
			this.#tick();
		});
	}

}

export class Component {
	hash = "";
	/** @type {Engine} */
	engine;

	/**
	 * @type { Engine|ComponentGroup }
	 */
	parent = null;
	display = new Point4(0, 0, 10, 10);
	visibility = true;
	show() { this.visibility = true; return this; }
	hide() { this.visibility = false; return this; }
	transform = new Point2(0.5, 0.5);
	setTransform(x=0.5, y=0.5) {
		this.transform.set(x, y);
		return this;
	}

	/**
	 * @type { boolean | "unset" }
	 */
	isPixelArt = "unset";

	/**
	 * @param {number} layer Layer `0` is back, layer `n | -1` is front
	 */
	setLayer(layer) {
		this.zIndex = layer;
		// engine.componentHashes.push(this.hash);
	}

	/**
	 * @param {number} layer Layer `0` is back, layer `n | -1` is front
	 */
	set zIndex(layer) {
		if (this.parent == null || this.parent.hasObject(this) == false) {
			console.error("Cannot set layer index if object does not have parent.");
			return;
		}
		if (layer < 0) layer += this.parent.componentHashes.length;
		let index = this.parent.componentHashes.indexOf(this.hash);
		this.parent.componentHashes.splice(index, 1);
		this.parent.componentHashes.splice(layer, 0, this.hash);
	}
	get zIndex() {
		let parentIndex = this.parent.componentHashes.indexOf(this.hash);
		return parentIndex;
	}

	/** @param {boolean} boolean */
	set cameraTracking(boolean) {
		if (boolean == true) engine.camera.trackObject(this);
		if (boolean == false && this.cameraTracking) engine.camera.trackObject(null);
	}

	/** @returns {boolean} */
	get cameraTracking() {
		return engine.camera.trackingObject?.hash == this.hash;
	}

	fixedPosition = false;
	setFixedPosition(fixedPosition=this.fixedPosition) {
		this.fixedPosition = fixedPosition;
		return this;
	}

	#attributes = {};

	get type() { return "Default Component"; }

	/**
	 * 
	 * @param {number | Point2 | Component | {x: number, y: number}} x
	 * @param {number | undefined} y
	 * @returns this
	 */
	moveTo(x, y) {
		if (typeof x?.y == "number" && typeof x?.x == "number") {
			y = x.y;
			x = x.x;
		} else if ( x instanceof Component ) {
			y = x.display.y;
			x = x.display.x;
		}
		if (x == null) x = this.display.x;
		if (y == null) y = this.display.y;
		this.display.x = x;
		this.display.y = y;
		if (this.engine.isPixelArt == true || this?.isPixelArt == true) {
			this.display.x = Math.round(this.display.x);
			this.display.y = Math.round(this.display.y);
		}
		return this;
	}
	/**
	 * 
	 * @param {number | Point2 | {x: number, y: number}} x
	 * @param {number | undefined} y
	 * @returns this
	 */
	moveBy(x, y) {
		if(x instanceof Point2 || typeof x.x == "number" && typeof x.y == "number") {
			y = x.y;
			x = x.x;
		}
		x = x ?? 0;
		y = y ?? 0;
		this.display.x += x;
		this.display.y += y;
		if (this.engine.isPixelArt || this?.isPixelArt) {
			this.display.x = Math.round(this.display.x);
			this.display.y = Math.round(this.display.y);
		}
		return this;
	}

	/**
	 * 
	 * @param { number | Point4 } w
	 * @param { number | undefined } h
	 */
	setSize(w, h) {
		if (w instanceof Point4 || (w?.w && w?.h)) {
			h = w.h;
			w = w.w;
		} else if (typeof w == "number" && typeof h == "undefined") {
			h = w;
		}
		this.display.w = w ?? this.display.w;
		this.display.h = h ?? this.display.h;
		return this;
	}

	/**
	 * @param {this} component 
	 */
	script = (component) => {}

	/**
	 * @param {(self:this) => {}} callback 
	 * @returns 
	 */
	setScript(callback) {
		if (typeof callback != "function") return this;
		this.script = callback;
		return this;
	}
	/**
	 * @param {CanvasRenderingContext2D} context 
	 * @param {Point2 | {x:number, y:number}} defaultOffset 
	 */
	render(context, defaultOffset) {}

	setAttribute(name="", value) {
		this.#attributes[name] = value;
		return this;
	}
	getAttribute(name="") {
		if (name in this.#attributes == false) return undefined;
		return this.#attributes[name];
	}
	removeAttribute(name="") {
		if (name in this.#attributes == false) return this;
		delete this.#attributes[name];
		return this;
	}

	/** @returns {this} */
	clone() {
		/** @type {Component} */
		let clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
		clone.hash = "";
		clone.parent = null;
		this.parent.addObject(clone);
		return clone;
	}

	remove() {
		this.parent.removeObject(this);
		return undefined;
	}
}

export class ComponentGroup extends Component {
	display = new Point4(0, 0, 0, 0);
	offset = new Point2(0, 0);

	componentHashes = [];
	components = {};

	get type() { return "ComponentGroup";}

	setSize() {
		throw new Error("The setSize() function is not supported with type ComponentGroup");
	}

	constructor() {
		super();
		delete this.setSize;
	}
	
	/**
	 * @param {Component} components
	 */
	addObject(...components) {
		for (let i = 0; i < components.length; i ++) {
			let component = components[i];

			if(component instanceof Component == false) throw new Error("Cannot add object to group if object is not of type: Component");
			if(this.hasObject(component)) throw new Error("Cannot add object to group if object was already added.");
			if(this.engine.hasObject(component)) this.engine.removeObject(component);

			component.parent = this;
			component.engine = this.engine;

			let randomToken = generateUUID();
			component.hash = randomToken;

			this.componentHashes.push(randomToken);
			this.components[randomToken] = component;

			let fakeContext = document.createElement("canvas").getContext("2d");
			component.render(fakeContext);
			component.script(component);
		}
		return this;
	}
	/**
	 * 
	 * @param {string|number} hash
	 * @returns {Component}
	 */
	getObject(hash) {
		if(["string", "number"].includes( typeof(hash) ) == false) throw new Error("Cannot find object in engine if hash is not of type: String | Number");
		if (typeof hash == "number") hash = this.componentHashes.at(hash);
		return this.components[hash];
	}
	hasObject(component=new Component) {
		if(component instanceof Component == false) throw new Error("Cannot find object in group if object is not of type: Component");
		let indexOfComponent = this.componentHashes.indexOf(component.hash);
		return indexOfComponent > -1;
	}
	removeObject(component=new Component) {
		if(component instanceof Component == false) throw new Error("Cannot remove object to group if object is not of type: Component");
		if(this.hasObject(component) == false) throw new Error("Cannot remove object from group if object was never added");
		let indexOfComponent = this.componentHashes.indexOf(component.hash);
		this.componentHashes.splice(indexOfComponent, 1);
		delete this.components[component.hash];
		return this;
	}

	/**
	 * 
	 * @param {CanvasRenderingContext2D} context 
	 * @param {Point2 | {x:number, y:number}} defaultOffset 
	 * @returns 
	 */
	render(context, defaultOffset) {
		
		if (!this.visibility) return this;

		let components = Object.values(this.components);

		// this.transform.x = Range.clamp(0, this.transform.x, 1);
		// this.transform.y = Range.clamp(0, this.transform.y, 1);

		// let minX = Math.min(...components.map(o => o.display.x - o.display.w * o.transform.x));
		// let minY = Math.min(...components.map(o => o.display.y - o.display.h * o.transform.y));

		// this.display.w = Math.max(...components.map(o => o.display.x + o.display.w * o.transform.x)) - minX;
		// this.display.h = Math.max(...components.map(o => o.display.y + o.display.h * o.transform.y)) - minY;

		// let destinationW = getValue( this.display.w, this.engine );
		// let destinationH = getValue( this.display.h, this.engine );
		// let destinationX = getValue( this.display.x, this.engine );
		// let destinationY = getValue( this.display.y, this.engine );

		// destinationX += defaultOffset?.x || 0;
		// destinationY += defaultOffset?.y || 0;

		// // destinationX -= destinationW * this.transform.x;
		// // destinationY -= destinationH * this.transform.y;
		
		// context.save();
		// if (!this.fixedPosition) {
		// 	if (this.isPixelArt == true || (this.isPixelArt == "unset" && this.engine.isPixelArt)) {
		// 		context.translate(Math.floor(this.engine.canvas.width / 2), Math.floor(this.engine.canvas.height / 2));
		// 		context.scale(Math.floor(this.engine.camera.zoom), Math.floor(this.engine.camera.zoom));
		// 		destinationX = Math.floor(destinationX);
		// 		destinationY = Math.floor(destinationY);
		// 		destinationW = Math.floor(destinationW);
		// 		destinationH = Math.floor(destinationH);
		// 	} else {
		// 		context.translate(this.engine.canvas.width / 2, this.engine.canvas.height / 2);
		// 		context.scale(this.engine.camera.zoom, this.engine.camera.zoom);
		// 	}
		// 	context.translate(-this.engine.camera.position.x, -this.engine.camera.position.y);
		// }
		// context.translate(destinationX + destinationW * this.transform.x, destinationY + destinationH * this.transform.y);
		// context.rotate(this.rotation * Math.PI / 180);
		// context.translate(-destinationX - destinationW * this.transform.x, - destinationY - destinationH * this.transform.y);

		// context.restore();

		for(let i = 0; i < components.length; i ++) {
			let component = components[i];
			component.script(component);
			component.render(context, defaultOffset);
		}
	}
}

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

unitConverter.defineUnit("vw", (number, engine) => {
	return number / 100 * engine.veiwportWidth;
});
unitConverter.defineUnit("w", (number, engine) => {
	return number / 100 * engine.width;
});

unitConverter.defineUnit("vh", (number, engine) => {
	return number / 100 * engine.veiwportHeight;
});
unitConverter.defineUnit("h", (number, engine) => {
	return number / 100 * engine.height;
});

unitConverter.defineUnit("cx", (number, engine) => {
	return number / 100 * engine.camera.position.x;
});
unitConverter.defineUnit("cy", (number, engine) => {
	return number / 100 * engine.camera.position.y;
});
unitConverter.defineUnit("cz", (number, engine) => {
	return number / 100 * engine.camera.zoom;
});