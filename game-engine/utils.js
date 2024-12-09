import { ceilToNearest, image, mouse, toRange, Vector } from "../toolbelt/toolbelt.js";
import { Point2, Point3, Point4 } from "../toolbelt/lib/points.js";
import { getValue, unitConverter } from "../toolbelt/lib/units.js";
export { Point2, Point3, Point4 };

function isValidUrl(urlString) {
	try { 
		return Boolean(new URL(urlString)); 
	} catch(e) { 
		return false; 
	}
}

export class Camera {
	position = new Point2(0, 0);

	zoom = 1;
	defaultZoom = 1;

	minZoom = 0.1;
	maxZoom = 999;

	wheelZoomMultiplier = 0.01;
	keyZoomMultiplier = 0.1;

	resetZoomResetsPosition = false;

	constructor() {
		window.addEventListener("gesturestart", this.#preventDefaultEvent, {passive: false});
		window.addEventListener("gesturechange", this.#preventDefaultEvent, {passive: false});
		window.addEventListener("gestureend", this.#preventDefaultEvent, {passive: false});
		window.addEventListener("wheel", this.#customZoomEvent, {passive: false});
		window.addEventListener("keydown", this.#customZoomEvent);
	}

	trackingDelay = 0;
	/**
	 * @type { null | Component }
	 */
	trackingObject = null;
	/**
	 * 
	 * @param { Component | null } component
	 */
	trackObject(component) {
		this.trackingObject = component;
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
		if (engine.isPixelArt || this?.isPixelArt) {
			this.position.x = Math.round(this.position.x);
			this.position.y = Math.round(this.position.y);
		}
		return this;
	}

	reset(resetDefaults) {
		if (resetDefaults) {
			this.defaultZoom = 1;

			this.minZoom = 0.1;
			this.maxZoom = 999;

			this.wheelZoomMultiplier = 0.01;
			this.keyZoomMultiplier = 0.1;

			this.resetZoomResetsPosition = false;
		}
		this.position.x = 0;
		this.position.y = 0;
		this.zoom = this.defaultZoom;
	}

	canZoom = true;
	canPan = true;

	/**
	 * 
	 * @param { WheelEvent | KeyboardEvent } e
	 */
	#customZoomEvent = (e) => {

		if (e instanceof WheelEvent) {
			if (e.ctrlKey) {
				if (e.target != engine.canvas) return;
				e.preventDefault();
				if (this.canZoom == false) return;
				this.zoom -= e.deltaY * this.wheelZoomMultiplier * this.zoom/2;
				this.zoom = toRange(this.minZoom, this.zoom, this.maxZoom);
			} else {
				if (e.target != engine.canvas) return;
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
			if (["0"].includes(e.key)) {
				if (this.resetZoomResetsPosition) this.moveTo(0, 0);
				this.zoom = this.defaultZoom;
			}
			this.zoom = toRange(this.minZoom, this.zoom, this.maxZoom);
		}
	
	}
	/**
	 * 
	 * @param { MouseEvent | WheelEvent | KeyboardEvent } e
	 */
	#preventDefaultEvent = (e) => {
		if(e.ctrlKey && ["+","-","=","_"].includes(e.key)) e.preventDefault();
		if(e.target == engine.canvas) e.preventDefault();
	}

	script() {}

	update() {
		if (this.trackingObject) {
			this.trackingDelay = Math.max(this.trackingDelay, 1);
			if (this.trackingDelay == 1) {
				this.moveTo(this.trackingObject);
			} else {
				let vector = new Vector;
				vector.setPos(
					this.trackingObject.display.x - this.position.x,
					this.trackingObject.display.y - this.position.y
				);
				if (vector.mag > 0) {
					vector.mag /= this.trackingDelay;
					let xy = vector.xy();
					this.moveBy(xy);
				}
			}
		}
		this.script(this);
	}
}

export class EngineClass {
	camera = new Camera;

	/**
	 * @type {{
	 *	x: number,
	 *	y: number,
	 *	click_l: boolean,
	 *	click_r: boolean,
	 * 	toWorld: () => { x: number, y: number }
	 * 	toObject: (object: Component, x:undefined|number, y:undefined|number) => { x: number, y: number }
	 * }}
	 */
	mouse = mouse.addHook({
		/**
		 * @returns { x: number, y: number }
		 */
		toWorld: () => {
			let mouseRelative = mouse.position.relative(this.canvas);
			return {
				x: (mouseRelative.x - this.canvas.width/2) / this.camera.zoom + this.camera.position.x,
				y: (mouseRelative.y - this.canvas.height/2) / this.camera.zoom + this.camera.position.y,
			}
		},
		/**
		 * @param { Component } object
		 * @param {undefined|number} x Mouse X position (In worldspace)
		 * @param {undefined|number} y Mouse Y position (In worldspace)
		 * @returns { x: number, y: number }
		 */
		toObject: (object, x, y) => {
			let mousePos = mouse.position.relative(this.canvas);
			if (typeof x == "number" && typeof y == "number") mousePos = { x, y };
			return {
				x: (mousePos.x - this.canvas.width/2) / this.camera.zoom + this.camera.position.x - object.display.x + object.display.w * object.transform.x,
				y: (mousePos.y - this.canvas.height/2) / this.camera.zoom + this.camera.position.y - object.display.y + object.display.h * object.transform.y,
			}
		},
		updateFunc: (e, beans) => {
			if (e.click_l && this.canvas.matches(":active")) {
				e.stopPropagation();
				e.preventDefault();
			};
		}
	});

	canvas = document.createElement("canvas");
	setSize(width=this.canvas.width, height=this.canvas.height) {
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style.width = `${width}px`;
		this.canvas.style.height = `${height}px`;
	}

	components = {};
	componentHashes = [];
	isPixelArt = false;
	
	#fullscreen = false;
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

	stats = {
		fps: 0,
		delta: 0
	}
	#lastCalledTime = 0;

	#previousData = {
		isPixelArt: true,
	};

	#show_loadAsset_logs = true;
	#assetsLoaded = 0;
	/**
	 * 
	 * @param { string } source
	 * @param {{
	 * 	fontFamilyName?: string
	 * }} options
	 */
	async loadAsset(source, options) {
		if (!options) options = {};
		let response = await fetch(source);
		let type = response.headers.get("Content-Type");
		type = type.split(";")[0];
		console.log(source, type);
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
		} else if (type.includes("font")) {
			simpleType = "font";
			if (options.fontFamilyName == undefined) {
				options.fontFamilyName = `font_asset${this.#assetsLoaded}`;
			}
			const font = new FontFace(options.fontFamilyName, `url(${source})`);
			await font.load();
			document.fonts.add(font);
			consoleLogComment = ` with font-family name "${options.fontFamilyName}"`;
		} else if (type.startsWith("image/")) {
			simpleType = "IMG";
			image.cacheImage(source);
		} else {
			if (this.#show_loadAsset_logs) console.error(`Failed to load asset from url "${source}"${consoleLogComment}`)
			return;
		}
		if (this.#show_loadAsset_logs) {
			if (this.#assetsLoaded >= 5) consoleLogComment += "\nYou can disable this message by using `engine.disableLoadAssetLogs()`";
			console.log(`Loaded ${simpleType} from url "${source}"${consoleLogComment}`);
		}
		this.#assetsLoaded += 1;
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
		this.canvas.style.cursor = cursor || "default";
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
		
		if(this.canvas.onresize) {
			if(width != prevCanvasWidth || height != prevCanvasHeight) this.canvas.onresize();
		}

		if (this.fullscreen == false) return;

		let width = window.innerWidth;
		let height = window.innerHeight;

		let prevCanvasWidth = this.canvas.width;
		let prevCanvasHeight = this.canvas.height;

		this.canvas.width = width;
		this.canvas.height = height;

		this.canvas.style.width = "var(--width)";
		this.canvas.style.height = "var(--height)";
		this.canvas.style.setProperty('--width', `${width}px`);
		this.canvas.style.setProperty('--height', `${height}px`);

		this.canvas.style.position = "fixed";
		this.canvas.style.top = "0px";
		this.canvas.style.left = "0px";
	}
	#updateStats() {
		this.stats.timestamp = Date.now();
		this.stats.delta = (this.stats.timestamp - this.#lastCalledTime) / 1000;
		this.#lastCalledTime = this.stats.timestamp;
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
		this.camera.canZoom = true;
		this.camera.canPan = true;
		this.#resizeCanvas();
		this.#tick();
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
			let randomToken = "";
			while(this.componentHashes.includes(randomToken) || randomToken.length < 14) {
				randomToken = `${Math.floor(Math.random() * 9999)}`;
				while(randomToken.length < 10) randomToken += Math.floor(Math.random() * 10);
				randomToken = btoa(randomToken).replace(/==$/, "");
			}
			component.hash = randomToken;
			this.componentHashes.push(randomToken);
			this.components[randomToken] = component;
			let fakeContext = document.createElement("canvas").getContext("2d");
			component.render(fakeContext);
			component.script(component);
			component.parent = this;
		}
		return this;
	}
	/**
	 * @param { Component } component
	 */
	hasObject(component) {
		if(component instanceof Component == false) throw new Error("Cannot find object in engine if object is not of type: Component");
		let indexOfComponent = this.componentHashes.indexOf(component.hash);
		return indexOfComponent > -1;
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
	/**
	 * @param { Component } component
	 */
	removeObject(component) {
		if(component instanceof Component == false) throw new Error("Cannot remove object to engine if object is not of type: Component");
		if(this.hasObject(component) == false) throw new Error("Cannot remove object from engine if object was never added");
		let indexOfComponent = this.componentHashes.indexOf(component.hash);
		this.componentHashes.splice(indexOfComponent, 1);
		delete this.components[component.hash];
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

		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		let components = Object.values(this.components);
		for(let i = 0; i < components.length; i ++) {
			let component = components[i];
			if (!component) continue;
			component.script(component);
		}
		this.camera.update();
		let defaultOffset = new Point2(0, 0);
		for(let i = 0; i < components.length; i ++) {
			let component = components[i];
			if (!component) continue;
			component.render(context, defaultOffset);
		}
		this.postRenderingScript();
		window.requestAnimationFrame(() => {
			this.#tick();
		});
	}

}
export const engine = new EngineClass;

export class Component {
	hash = "";
	/**
	 * @type { null | EngineClass | ComponentGroup }
	 */
	parent = null;
	display = new Point4(0, 0, 100, 100);
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
		if (this.parent == null || this.parent.hasObject(this) == false) {
			console.error("Cannot set layer index if object does not have parent.");
			return;
		}
		if (layer < 0) layer += this.parent.componentHashes.length;
		let index = this.parent.componentHashes.indexOf(this.hash);
		this.parent.componentHashes.splice(index, 1);
		this.parent.componentHashes.splice(layer, 0, this.hash);
		// engine.componentHashes.push(this.hash);
	}

	/**
	 * @param {number} layer Layer `0` is back, layer `n | -1` is front
	 */
	set zIndex(layer) {
		this.setLayer(layer);
	}
	get zIndex() {
		let parentIndex = this.parent.componentHashes.indexOf(this.hash);
		return parentIndex;
	}

	/** @param {boolean} boolean */
	set cameraTracking(boolean) {
		if (boolean == true) engine.camera.trackObject(this);
		if (boolean == false && engine.camera.trackingObject.hash == this.hash) engine.camera.trackObject(null);
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
		if (engine.isPixelArt == true || this?.isPixelArt == true) {
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
		if (x == null) x = 0;
		if (y == null) y = 0;
		if(x instanceof Point2 || x?.x && x?.y) {
			y = x.y;
			x = x.x;
		}
		this.display.x += x;
		this.display.y += y;
		if (engine.isPixelArt || this?.isPixelArt) {
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
		}
		this.display.w = w || this.display.w;
		this.display.h = h || this.display.h;
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
	 * 
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
			if(engine.hasObject(component)) engine.removeObject(component);
			if(component instanceof Component == false) throw new Error("Cannot add object to group if object is not of type: Component");
			if(this.hasObject(component)) throw new Error("Cannot add object to group if object was already added.");
			let randomToken = "";
			while(this.componentHashes.includes(randomToken) || randomToken.length < 14) {
				randomToken = `${Math.floor(Math.random() * 9999)}`;
				while(randomToken.length < 10) randomToken += Math.floor(Math.random() * 10);
				randomToken = btoa(randomToken).replace(/==$/, "");
			}
			component.hash = randomToken;
			this.componentHashes.push(randomToken);
			this.components[randomToken] = component;
			let fakeContext = document.createElement("canvas").getContext("2d");
			component.render(fakeContext);
			component.script(component);
			component.parent = this;
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

		this.transform.x = toRange(0, this.transform.x, 1);
		this.transform.y = toRange(0, this.transform.y, 1);

		let minX = Math.min(...components.map(o => o.display.x - o.display.w * o.transform.x));
		let minY = Math.min(...components.map(o => o.display.y - o.display.h * o.transform.y));

		this.display.w = Math.max(...components.map(o => o.display.x + o.display.w * o.transform.x)) - minX;
		this.display.h = Math.max(...components.map(o => o.display.y + o.display.h * o.transform.y)) - minY;

		// this.display.y = Math.min(...array.map(o => o.display.y));
		// console.log( Math.max(...array.map(o => o.x)) );

		let destinationW = getValue( this.display.w );
		let destinationH = getValue( this.display.h );
		let destinationX = getValue( this.display.x );
		let destinationY = getValue( this.display.y );

		destinationX += defaultOffset?.x || 0;
		destinationY += defaultOffset?.y || 0;

		destinationX -= destinationW * this.transform.x;
		destinationY -= destinationH * this.transform.y;
		
		context.save();
		if (!this.fixedPosition) {
			if (this.isPixelArt == true || (this.isPixelArt == "unset" && engine.isPixelArt)) {
				context.translate(Math.floor(engine.canvas.width / 2), Math.floor(engine.canvas.height / 2));
				context.scale(Math.floor(engine.camera.zoom), Math.floor(engine.camera.zoom));
				destinationX = Math.floor(destinationX);
				destinationY = Math.floor(destinationY);
				destinationW = Math.floor(destinationW);
				destinationH = Math.floor(destinationH);
			} else {
				context.translate(engine.canvas.width / 2, engine.canvas.height / 2);
				context.scale(engine.camera.zoom, engine.camera.zoom);
			}
			context.translate(-engine.camera.position.x, -engine.camera.position.y);
		}
		context.translate(destinationX + destinationW * this.transform.x, destinationY + destinationH * this.transform.y);
		context.rotate(this.rotation * Math.PI / 180);
		context.translate(-destinationX - destinationW * this.transform.x, - destinationY - destinationH * this.transform.y);

		let lineDash = 100 / engine.camera.zoom;
		let size = 10 / engine.camera.zoom;
		size = 0;

		context.restore();

		for(let i = 0; i < components.length; i ++) {
			let component = components[i];
			component.script(component);
			component.render(context, { x: destinationX, y: destinationY });
		}
	}
}

var animations = [];
export class Animation {
	playback = "loop";

	onchange = () => {};

	animations = [];
	fps = 1;

	options = {
		/**
		 * `false`: Enables cloning. `this.clone()` returns new instance of class `Animation`
		 * 
		 * `true`: Disable cloning. `this.clone()` returns reference to `this`
		 */
		singleRef: false
	}

	currentAnimation = "";
	currentFrameData = {};
	#locked = false;

	#startingTimestamp = 0;
	playState = false;

	onfinish = () => {};

	/**
	 * 
	 * @param { "loop" | "playonce" | "pingpong" } playbackType
	 * @param { { string: [ { source: string, x: number, y: number, width: number, height: number } ] } } animations
	 * @param { { singleRef: boolean } } options
	 * @param { number } fps
	 */
	constructor(playbackType, animations, fps, options) {
		if (playbackType && animations && fps) this.#locked = true;
		this.playback = playbackType ?? "loop";
		this.animations = animations;
		this.fps = fps ?? 1;
		this.currentAnimation = Object.keys(animations)[0] || "";
		this.currentFrameData = this.animations[this.currentAnimation][0] || {};
		this.options = options;
	}
	/**
	 * 
	 * @returns {{ source: string, x: number, y: number, width: number, height: number }}
	 */
	currentFrame() {
		if (this.currentAnimation in this.animations == false) throw new Error(`Cannot get frame "${this.currentAnimation}" from animation "${this.currentAnimation}" if it does not exist.`);
		
		let maxFrameNumber = this.animations[this.currentAnimation].length-1;
		
		if (maxFrameNumber < 0) throw new Error(`Cannot play animation "${this.currentAnimation}" if animation contains 0 frames.`);
		
		let timeDifference = (performance.now() * (this.playState != "play"?2:1)) - this.#startingTimestamp;
		let frameNumber = timeDifference / (1000/this.fps);
		frameNumber = Math.floor(frameNumber);

		if(this.playback == "loop") {
			if (frameNumber >= maxFrameNumber) {
				let currentAnimation = this.currentAnimation;
				this.onfinish();
				if (this.currentAnimation != currentAnimation) {
					return this.currentFrame();
				}
			}
			frameNumber = frameNumber % (maxFrameNumber+1);

		} else if(this.playback == "playonce") {
			if (frameNumber >= maxFrameNumber) {
				frameNumber = maxFrameNumber;
				if (this.playState == "play") {
					this.playState = "stop";
					this.onchange();
					this.onfinish();
					return this.currentFrame();
				}
			}
		}

		this.currentFrameData = this.animations[this.currentAnimation][frameNumber];
		return this.currentFrameData;
	}

	play() {
		if (this.playState == "stop") this.#startingTimestamp = performance.now();
		this.playState = "play";
		if (this.currentFrameData.length == 1) this.playState = "pause";
		this.onchange();
		return this;
	}

	playAnimation(name="") {
		if (name in this.animations == false) throw new Error(`Animation "${name}" does not exist.`);
		this.currentAnimation = name;
		this.currentFrameData = this.animations[this.currentAnimation][0];
		this.#startingTimestamp = performance.now();
		this.playState = "play";
		if (this.currentFrameData.length == 1) this.playState = "pause";
		this.onchange();
		return this;
	}

	pause() {
		this.playState = "pause";
		this.onchange();
		return this;
	}

	stop() {
		this.playState = "stop";
		this.onchange();
		return this;
	}

	clone() {
		return new Animation(this.playback, this.animations, this.fps, this.options);
	}

	toJSON() {
		return {
			playback: this.playback,
			fps: this.fps,
			animations: this.animations
		}
	}

	/**
	 * @returns {string[]}
	 */
	addTimeline(name="") {
		if (this.#locked) throw new Error("Cannot add animation timelines to a locked animation.");
		if (!name) throw new Error("Animation timeline must have a name.");
		this.animations[name] = [];
		return this.animations[name];
	}
}

export const animationConstructor = new class AnimationConstructor {

	/**
	 * 
	 * @param { string } url 
	 * @returns 
	 */
	async fromFile(url) {
		url = (new URL(url, location.href)).href
		let response = await fetch(url);
		let json = await response.json();

		let timelineNames = Object.keys(json.animations);

		for (let i = 0; i < timelineNames.length; i++) {
			let timeline = json.animations[ timelineNames[i] ];

			for (let frame = 0; frame < timeline.length; frame ++) {
				let frameData = timeline[frame];
				let source = new URL(frameData.source, url);
				source = source.href;
				json.animations[timelineNames[i]][frame].source = source;
				if (source != "") image.cacheImage(source);
			}
		}

		return new Animation(json.playback, json.animations, json.fps);
	}

	blankTemplate() {
		return new Animation;
	}
}

unitConverter.defineUnit("vw", (number) => {
	return number / 100 * engine.veiwportWidth;
});
unitConverter.defineUnit("w", (number) => {
	return number / 100 * engine.width;
});

unitConverter.defineUnit("vh", (number) => {
	return number / 100 * engine.veiwportHeight;
});
unitConverter.defineUnit("h", (number) => {
	return number / 100 * engine.height;
});

unitConverter.defineUnit("cx", (number) => {
	return number / 100 * engine.camera.position.x;
});
unitConverter.defineUnit("cy", (number) => {
	return number / 100 * engine.camera.position.y;
});
unitConverter.defineUnit("cz", (number) => {
	return number / 100 * engine.camera.zoom;
});

engine.fullscreen