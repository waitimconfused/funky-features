var canvases = [];

export class Canvas {
	dom = document.createElement("canvas");
	context = this.dom.getContext("2d");
	#canvasIndex = 0;

	#width = null;
	#height = null;
	
	constructor() {
		document.body.appendChild(this.dom);
		canvases.push(this);
		this.#canvasIndex = canvases.length - 1;
		console.log(this.#canvasIndex);
	}
	setWidth(width=0) {
		this.dom.width = width;
		return this;
	}
	setHeight(height=0) {
		this.dom.height = height;
		return this;
	}
	setSize(width=0, height=0) {
		if (typeof width == "string" && width.endsWith("%")) {
			this.dom.width = parseFloat(width) / 100 * window.innerWidth;
		} else {
			this.dom.width = width;
		}
		this.#width = width;

		if (typeof height == "string" && height.endsWith("%")) {
			this.dom.height = parseFloat(height) / 100 * window.innerHeight;
		} else {
			this.dom.height = height;
		}
		this.#height = height;

		return this;
	}
	position(cssPosition="") {
		this.dom.style.position = cssPosition;
		return this;
	}
	moveTo(x=0, y=0) {
		this.dom.style.top = `${y}px`;
		this.dom.style.left = `${x}px`;
		return this;
	}
	begin() {
		this.context.beginPath();
	}
	setFill(fill) {
		this.context.fillStyle = fill;
		return this;
	}
	rect(x=0, y=0, width=0, height=0){
		this.context.rect(x, y, width, height);
		return this;
	}
	fill() {
		this.context.fill();
		return this;
	}
	close() {
		this.context.closePath();
	}

	#spritesEnabled = false;
	#sprites = {};
	#spriteOrder = [];

	sprite = { Rect };

	enableSprites() {
		this.#spritesEnabled = true;
		window.requestAnimationFrame(() => {
			this.#renderSprites();
		});
		return this;
	}

	disableSprites() {
		this.#spritesEnabled = false;
		return this;
	}

	appendSprite(sprite) {
		if(sprite instanceof Sprite == false) throw new Error("Cannot add sprite of sprite is not of type Sprite")
		this.#sprites[sprite.hash] = sprite;
		this.#spriteOrder.push(sprite.hash);
		return this;
	}

	#renderSprites() {
		if(!this.#spritesEnabled) return;

		if (typeof this.#width == "string" && this.#width.endsWith("%")) {
			this.dom.width = parseFloat(this.#width) / 100 * window.innerWidth;
		}
		if (typeof this.#height == "string" && this.#height.endsWith("%")) {
			this.dom.height = parseFloat(this.#height) / 100 * window.innerHeight;
		}

		for (let i = 0; i < this.#spriteOrder.length; i ++) {
			let spriteHash = this.#spriteOrder[i];
			let sprite = this.#sprites[spriteHash];
			sprite.render();
		}

		window.requestAnimationFrame(() => {
			this.#renderSprites();
		})
	}
}

class Sprite {

	#canvasParentIndex = 0;
	#canvasParent = null;

	hash = "";

	constructor() {
		this.hash = Math.floor(Math.random() * 99999999).toString();
		while (this.hash.length < 8) this.hash = "0" + this.hash;
	}

	render(){}

	script = function(){}
}

export class Rect extends Sprite {
	#canvasParentIndex = 0;
	#canvasParent = null;

	hash = "";

	width = 0;
	height = 0;
	posX = 0;
	posY = 0;

	constructor() {
		super();
		this.hash = Math.floor(Math.random() * 99999999).toString();
		while (this.hash.length < 8) this.hash = "0" + this.hash;
		this.#canvasParentIndex = canvases.length - 1;
		this.#canvasParent = canvases[this.#canvasParentIndex];
		this.setParentCanvas(this.#canvasParent);
	}

	setParentCanvas(canvas = new Canvas) {
		this.#canvasParentIndex = canvases.indexOf(canvas);
		this.#canvasParent = canvas;
		canvas.appendSprite(this);
		return this;
	}

	setWidth(width=0) {
		this.width = width;
		return this;
	}
	setHeight(height=0) {
		this.height = height;
		return this;
	}
	setSize(width=0, height=0) {
		this.width = width;
		this.height = height;
		return this;
	}
	moveTo(x=0, y=0) {
		this.posX = x;
		this.posY = y;
		return this;
	}
	setLayer(layer=0) {
		return this;
	}

	render() {
		this.script();
		this.#canvasParent.setFill("red");
		this.#canvasParent.rect(this.posX, this.posY, this.width, this.height);
		this.#canvasParent.fill();
		this.#canvasParent.close();
	}
}