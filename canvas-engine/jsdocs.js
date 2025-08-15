/**
 * @typedef Engine
 * @type {object}
 * 
 * @prop {Camera} camera
 * 
 * @prop {{
 *	x: number,
 *	y: number,
 *	click_l: boolean,
 *	click_r: boolean,
 * 	toWorld: (x?:number, y?:number) => Point2,
 * 	toObject: (object: Component, x:undefined|number, y:undefined|number) => Point2,
 * 	hoverable: boolean,
 * }} mouse
 * 
 * @prop {HTMLCanvasElement} canvas
 * 
 * @prop {Object<string, Component>} components
 * @prop {string[]} renderingHashes
 * 
 * @prop {boolean} isPixelArt
 * 
 * @prop {object} stats
 * @prop {number} stats.fps
 * @prop {number} stats.delta
 * 
 * @prop {"back-front" | "front-back"} scriptOrder
 * @prop {"back-front" | "front-back"} renderOrder
 * 
 * @prop {?string} activeObject
 * Value of `Component.hash`
 * 
 * @prop {boolean} hoverObject
 * ***!TO-DO!*** Multiple components can be hovered, so a `boolean`
 * 
 * @prop {(width?:number, height?:number) => void} setSize
 * Set the size (width *&* height) of the canvas element
 * 
 * @prop {boolean} fullscreen
 * Specifies if the canvas is fullscreen (ontop of html content, fit to window size)
 * 
 * @prop {(source:string, options?:{fontFamilyName?:string}) => Promise<void>} loadAsset
 * Load an asset (like an image, css, or a font) directly from a URL
 * 
 * @prop {() => void} enableLoadAssetLogs
 * Enable all console messages when calling `engine.loadAsset()`
 * @prop {() => void} disableLoadAssetLogs
 * Disable all console messages when calling `Engine.loadAsset()`.
 * 
 * ***!WARNING!*** Suppresses all asset loading errors
 * 
 * @prop {() => void} preRenderingScript
 * Will be ran *before* all the components are rendered
 * @prop {() => void} postRenderingScript
 * Will be ran *after* all the components are rendered
 * 
 * @prop {""|"auto"|"default"|"none"|"context-menu"|"help"|"pointer"|"progress"|"wait"|"cell"|"crosshair"|"text"|"vertical-text"|"alias"|"copy"|"move"|"no-drop"|"not-allowed"|"grab"|"grabbing"|"all-scroll"|"col-resize"|"row-resize"|"n-resize"|"e-resize"|"s-resize"|"w-resize"|"ne-resize"|"nw-resize"|"se-resize"|"sw-resize"|"ew-resize"|"ns-resize"|"nesw-resize"|"nwse-resize"| "zoom-in"|"zoom-out"} cursor
 * Specifies what style cursor will be used when hovering over the canvas
 * 
 * @prop {number} width
 * Specifies the width of the canvas
 * @prop {number} height
 * Specifies the height of the canvas
 * 
 * @prop {number} viewportWidth
 * Get the width of the viewport (AKA: `Engine.width / Engine.camera.zoom`)
 * @prop {number} viewportHeight
 * Get the height of the viewport (AKA: `Engine.height / Engine.camera.zoom`)
 * 
 * @prop {(canvas:HTMLCanvasElement) => void} setCanvas
 * Change where the engine renders the output, to a new/different canvas
 * 
 * @prop {(...components: Component[]) => this} addObject
 * Add an component to the rendering and script execution order at the highest index
 * 
 * @prop {(component:Component) => boolean} hasObject
 * Returns if the render/script execution includes the specified component
 * 
 * @prop {(hash:string) => Component} getObject
 * Retrieves a Component by its `Component.hash` value
 * 
 * @prop {(component:Component) => void} removeObject
 * Removes the object from the rendering/script execution, as well as from `Engine.components`
 * 
 * @prop {string} background
 * Specifies what the CSS background is for the canvas
 */

/**
 * @typedef Camera
 * @type {object}
 * 
 * @prop {Point2} position	The in-canvas location of the camera
 * @prop {Point2} pos	Reference to: `Camera.position`
 * @prop {number} x		Reference to: `Camera.position.x`
 * @prop {number} y		Reference to: `Camera.position.y`
 * 
 * @prop {number} zoom	Defines how zoomed in the camera is (usefull for pixel-art)
 * @prop {number} defaultZoom	Specifies what the `Camera.zoom` value should be reset to when using `Camera.reset()`, as well as `CTRL` + `0` *(optional, see `Camera.ctrl0`)*
 * 
 * @prop {number} minZoom	Specifies the minimum value of `Camera.zoom`, as `Camera.zoom == 0` results in nothing being rendered
 * @prop {number} maxZoom	Specifies the maximum value of `Camera.zoom`. Usefull for when users can zoom manually (see: `Camera.canZoom`)
 * 
 * @prop {number} wheelZoomMultiplier	Determines how fast/slow the zoom changes when the user scrolls (Disable user zooming with `Camera.canZoom`)
 * @prop {number} keyZoomMultiplier		Determines how fast/slow the zoom changes when the user uses `CTRL` + `+`/`-` (Disable user zooming with `Camera.canZoom`)
 * 
 * @prop {boolean} canZoom	Determines if the user can manually zoom in and out by scrollng and/or using `CTRL` + `+`/`-`.
 * @prop {boolean} canPan	Determines if the user can manually move the camera by scrollng left, right, up, or down.
 * 
 * @prop {object} ctrl0		Specifiy which camera properties are reset when the user presses `CTRL` + `0`.
 * @prop {boolean} ctrl0.resetZoom	Determines whether or not `CTRL` + `0` resets the cameras zoom level back to `Camera.defaultZoom`.
 * @prop {boolean} ctrl0.resetPos	Determines whether or not `CTRL` + `0` resets the cameras position back to `x:0` and `y:0`.
 * 
 * @prop {Engine} engine	A reference to the camera's parent engine
 */




/**
 * @constructor
 * @param {?HTMLCanvasElement} canvas
 * @implements {Engine} afag
 * @returns {Engine}
 */
export function E(canvas) {
	throw new TypeError("The Engine constructor you are using is a part of the canvas-engine types.\n\nPlease import/include the real library.");
}



/** @type {Engine} */
const beans = new E();