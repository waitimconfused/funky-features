export class AnimationCluster {
	playback = "loop";

	onchange = () => { };

	/** @type {Object<string,Animation>}} */
	animations = {};
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

	/**
	 * @type {{
	 * 	source: string|HTMLCanvasElement|HTMLImageElement,
	 * 	x: number,
	 * 	y: number,
	 * 	width: number,
	 * 	height: number
	 * }}
	 */
	currentFrame = {};
	#locked = false;

	#startingTimestamp = 0;
	playState = false;

	onfinish = () => { };

	/**
	 * 
	 * @param { "loop" | "playonce" | "pingpong" } playbackType
	 * @param {Animation[]} animations
	 * @param { { singleRef: boolean } } options
	 * @param { number } fps
	 */
	constructor(playbackType, animations, fps, options) {
		if (playbackType && animations && fps) this.#locked = true;
		this.playback = playbackType ?? "loop";
		this.animations = animations ?? {};
		this.fps = fps ?? 1;
		if (animations) {
			this.currentAnimation = Object.keys(animations)[0];
			this.currentFrame = this.animations[this.currentAnimation].frames[0];
		}
		this.options = options;
		this.#tick()
	}

	/** @param {boolean|true} loop (defaults to `true`) */
	#tick(loop = true) {

		if (this.playState == false) {
			if (loop) window.requestAnimationFrame(() => this.#tick());
			return;
		}

		if (this.currentAnimation in this.animations == false) throw new Error(`Cannot get frame "${this.currentAnimation}" from animation "${this.currentAnimation}" if it does not exist.`);

		let maxFrameNumber = this.animations[this.currentAnimation].frames.length - 1;

		if (maxFrameNumber < 0) throw new Error(`Cannot play animation "${this.currentAnimation}" if animation contains 0 frames.`);

		let timeDifference = (performance.now() * (this.playState != "play" ? 2 : 1)) - this.#startingTimestamp;
		let frameNumber = timeDifference / (1000 / this.fps);
		frameNumber = Math.floor(frameNumber);

		if (this.playback == "loop") {
			if (frameNumber >= maxFrameNumber) {
				let currentAnimation = this.currentAnimation;
				this.onfinish();
				if (this.currentAnimation != currentAnimation) {
					this.#tick();
				}
			}
			frameNumber = frameNumber % (maxFrameNumber + 1);

		} else if (this.playback == "playonce") {
			if (frameNumber >= maxFrameNumber) {
				frameNumber = maxFrameNumber;
				if (this.playState == "play") {
					this.playState = "stop";
					this.onchange();
					this.onfinish();
					this.#tick()
				}
			}
		}

		if (isNaN(frameNumber)) frameNumber = 0;

		this.currentFrame = this.animations[this.currentAnimation].frames[frameNumber];
		if (loop) window.requestAnimationFrame(() => this.#tick());
	}

	play() {
		if (this.playState == "stop") this.#startingTimestamp = performance.now();
		this.playState = "play";
		if (this.currentFrame.length == 1) this.playState = "pause";
		this.onchange();
		return this;
	}

	playAnimation(name = "") {
		if (name in this.animations == false) throw new Error(`Animation "${name}" does not exist.`);
		this.currentAnimation = name;
		this.currentFrame = this.animations[this.currentAnimation][0];
		this.#startingTimestamp = performance.now();
		this.playState = "play";
		this.#tick(false);
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
		return new AnimationCluster(this.playback, this.animations, this.fps, this.options);
	}

	toJSON() {
		return {
			playback: this.playback,
			fps: this.fps,
			animations: this.animations
		}
	}

	/**
	 * @returns {Animation}
	 */
	createAnimation(name = "") {
		if (this.#locked) throw new Error("Cannot add animation timelines to a locked animation.");
		if (!name) throw new Error("Animation timeline must have a name.");

		if (Object.keys(this.animations).length == 0) {
			this.currentAnimation = Object.keys(this.animations)[0];
		}

		this.animations[name] = new Animation;
		return this.animations[name];
	}
}
class Animation {
	/** @type {{
	 * 	source: String | HTMLCanvasElement | HTMLImageElement | AnimationCluster,
	 * 	x: number,
	 * 	y: number,
	 * 	width: number,
	 * 	height: number
	 * }[]}
	 */
	frames = [];

	/**
	 * @param {{
	 * 	source: string | HTMLCanvasElement | HTMLImageElement,
	 * 	x: number,
	 * 	y: number,
	 * 	width: number,
	 * 	height: number
	 * }} data
	 * 
	 * Reference to: `Animation.pushFrame()`
	 */
	push(data) {
		this.pushFrame(data);
	}

	/**
	 * @param {{
	* 	source: string | HTMLCanvasElement | HTMLImageElement,
	* 	x: number,
	* 	y: number,
	* 	width: number,
	* 	height: number
	* }} data
	*/
	pushFrame(data) {
		let compiledData = {
			source: data.source ?? "",
			x: data.x ?? 0,
			y: data.y ?? 0,
			width: data.width ?? 0,
			height: data.height ?? 0
		};
		this.frames.push(compiledData);
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

		let animation = new AnimationCluster;

		let timelineNames = Object.keys(json.animations);

		for (let i = 0; i < timelineNames.length; i++) {
			let timeline = animation.createTimeline(timelineNames[i]);
			let timeline_json = json.animations[timelineNames[i]];

			for (let frame = 0; frame < timeline_json.length; frame++) {
				let frameData = timeline_json[frame];
				let source = new URL(frameData.source, url);
				source = source.href;
				timeline.push(source);
				if (source != "") imageTop.cacheImage(source);
			}
		}

		return new AnimationCluster(json.playback, json.animations, json.fps);
	}

	blankTemplate() {
		return new AnimationCluster;
	}
}