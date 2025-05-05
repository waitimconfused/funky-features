var customMenuExistsInDOM = false;

/** @type {?CSSStyleSheet} */
var importedCSS;


var shouldImportCSS = true;

/**
 * 
 * If there is a `<custom-menu>` element present, the `./custom-menu.css` will be included by default. To disable this, use `CustomMenu.importCSS = false;`
 * 
 * Basic format: `<custom-menu kind="___">...</custom-menu>`
 * 
 * ## The `kind="___"` attribute
 * Specifies how the menu looks, and how the user can interact with it.
 * 
 * ### `kind="toolbar"` Allows the following attributes:
 *
 * - `draggable:boolean` Determines if it is draggable by the user. Defaults to `false`
 * - `drag-clamp:number` Used to specify the size of the gutter around the edge of the screen
 * - `drag-snapping-grid="x y"` Set the number of rows and columns that the toolbar snaps to when dragged. Defaults to `0 0` (none)
 * - `direction:"row"|"column"` Determines if the toolbar items flows vertically or horizontally. Defaults to `"row"`
 * 
 * ### `kind="dropdown"` Just a dropdown menu
 * 
 * The elements nested inside are still `<option value="___">...</option>`
 */
export class CustomMenu extends HTMLElement {

	static logInfo() {
		console.group("How to use the <custom-menu> element");
		console.log("- The \"kind\" attribute can have the value of \"toolbar\" or \"sidebar\"");
		console.groupEnd();
	}

	static set importCSS(boolean) {
		if (typeof boolean != "boolean") throw new TypeError("CustomMenu.useDefaultCSS must be of type boolean.");
		if (boolean == true && customMenuExistsInDOM && importedCSS) {
			document.adoptedStyleSheets.push(importedCSS)
			importedCSS.disabled = false;
		} else if (boolean == true && customMenuExistsInDOM && importedCSS == null) {
			let path = new URL("./custom-menu.css", import.meta.url);
			this.hidden = true;
			fetch(path)
			.then(response => response.text())
			.then((css) => {
				if (shouldImportCSS == false) return;
				importedCSS = new CSSStyleSheet;
				importedCSS.replaceSync(css);
				document.adoptedStyleSheets.push(importedCSS);
			});
		} else if (boolean == false && importedCSS) {
			document.adoptedStyleSheets.splice( document.adoptedStyleSheets.indexOf(importedCSS) );
			importedCSS.disabled = true;
			importedCSS = null;
		}
		shouldImportCSS = boolean;
	}
	static get importCSS() {
		return shouldImportCSS;
	}

	constructor() {
		super();
	}

	connectedCallback() {
		if (customMenuExistsInDOM == false && shouldImportCSS) {
			let path = new URL("./custom-menu.css", import.meta.url);
			fetch(path)
			.then(response => response.text())
			.then((css) => {
				if (shouldImportCSS == false) return;
				importedCSS = new CSSStyleSheet;
				importedCSS.replaceSync(css);
				document.adoptedStyleSheets.push(importedCSS);
			});
		}
		customMenuExistsInDOM = true;
		
		let kind = this.getAttribute("kind");

		if (kind == "toolbar") {
			this.#toolbar();
		} else if (kind == "dropdown") {
			this.#dropdown();
		}
	}

	#toolbar() {
		let self = this;
		let startX = 0;
		let startY = 0;

		let padding = parseFloat(self.getAttribute("drag-clamp")) ?? parseFloat(getComputedStyle(document.documentElement).fontSize);
		this.style.top = padding + "px";
		this.style.left = padding + "px";

		this.addEventListener("touchstart", dragMouseDown, {passive: true});
		this.addEventListener("mousedown", dragMouseDown);
		window.addEventListener("blur", closeDragElement);

		function dragMouseDown(e) {
			if (this.hasAttribute("draggable") == false) return;
			e.preventDefault();

			startX = (e.clientX ?? e.touches[0].clientX) - self.offsetLeft;
			startY = (e.clientY ?? e.touches[0].clientY) - self.offsetTop;
			

			if ( self.getAttribute("direction") == "row" || !self.hasAttribute("direction") ) {
				let paddingLeft = parseFloat( getComputedStyle(self).getPropertyValue("padding-left") );
				let thumbWidth = parseFloat( getComputedStyle(self, ":before").getPropertyValue("width") );
				if (startX > thumbWidth + paddingLeft) return;
			} else {
				let paddingTop = parseFloat( getComputedStyle(self).getPropertyValue("padding-top") );
				let thumbHeight = parseFloat( getComputedStyle(self, ":before").getPropertyValue("height") );
				if (startY > thumbHeight + paddingTop) return;
			}

			document.addEventListener("touchend", closeDragElement);
			document.addEventListener("touchmove", elementDrag);
			document.addEventListener("mouseup", closeDragElement);
			document.addEventListener("mousemove", elementDrag);
		}

		function elementDrag(e) {
			let x = (e.clientX ?? e.touches[0].clientX) - startX;
			let y = (e.clientY ?? e.touches[0].clientY) - startY;

			let padding = parseFloat(self.getAttribute("drag-clamp")) ?? parseFloat(getComputedStyle(document.documentElement).fontSize);

			x = Math.max(padding, x);
			x = Math.min(window.innerWidth - self.offsetWidth - padding, x);
			y = Math.max(padding, y);
			y = Math.min(window.innerHeight - self.offsetHeight - padding, y);

			self.style.top = y + "px";
			self.style.left = x + "px";

			document.documentElement.setAttribute("custom-menu-dragging", "");
		}

		function closeDragElement() {
			document.removeEventListener("touchend", closeDragElement);
			document.removeEventListener("touchmove", elementDrag);
			document.removeEventListener("mouseup", closeDragElement);
			document.removeEventListener("mousemove", elementDrag);

			if (self.hasAttribute("drag-snapping-grid")) snap();
			document.documentElement.removeAttribute("custom-menu-dragging");
		}

		function snap() {
			let snappingGridSize = [-1, -1];
			if (self.getAttribute("drag-snapping-grid").includes("x")) snappingGridSize = self.getAttribute("drag-snapping-grid").split("x");
			if (self.getAttribute("drag-snapping-grid").includes(",")) snappingGridSize = self.getAttribute("drag-snapping-grid").split(",");
			if (self.getAttribute("drag-snapping-grid").includes(" ")) snappingGridSize = self.getAttribute("drag-snapping-grid").split(" ");
			let snappingGridSizeX = snappingGridSize[0];
			let snappingGridSizeY = snappingGridSize[1] ?? snappingGridSize[0];

			snappingGridSizeX -= 1;
			snappingGridSizeY -= 1;

			let xPercentage = (self.offsetLeft + self.offsetWidth / 2) / window.innerWidth;
			let xRoundedPercentage = Math.round(xPercentage * snappingGridSizeX) / snappingGridSizeX;
			let x = window.innerWidth * xRoundedPercentage;

			let yPercentage = (self.offsetTop + self.offsetHeight / 2) / window.innerHeight;
			let yRoundedPercentage = Math.round(yPercentage * snappingGridSizeY) / snappingGridSizeY;
			let y = window.innerHeight * yRoundedPercentage;

			let padding = parseFloat(self.getAttribute("drag-clamp")) ?? parseFloat(getComputedStyle(document.documentElement).fontSize);

			x -= self.offsetWidth / 2;
			x = Math.max(padding, x);
			x = Math.min(window.innerWidth - self.offsetWidth - padding, x);

			y -= self.offsetHeight / 2;
			y = Math.max(padding, y);
			y = Math.min(window.innerHeight - self.offsetHeight - padding, y);

			let distance = Math.hypot(self.offsetLeft - x, self.offsetTop - y);

			let duration = 1000 / distance;

			let easing = "cubic-bezier(0.38, 1.64, 0.48, 0.8)";
			self.style.transition = `top 300ms ${easing}, left 300ms ${easing}`;

			self.style.top = y + "px";
			self.style.left = x + "px";

			setTimeout(() => {
				self.style.transition = "";
			}, 300);
		}

		window.addEventListener("resize", () => {
			let x = parseInt(self.style.left);
			let y = parseInt(self.style.top);

			x = Math.max(padding, x);
			x = Math.min(window.innerWidth - self.offsetWidth - padding, x);
			y = Math.max(padding, y);
			y = Math.min(window.innerHeight - self.offsetHeight - padding, y);

			self.style.top = y + "px";
			self.style.left = x + "px";

			if (self.hasAttribute("drag-snapping-grid")) {
				self.style.transition = "";
				snap();
			}
		});
	}

	#dropdown() {
		let options = Array.from(this.getElementsByTagName("option"));
		
		let unselectedDiv = document.createElement("div");
		
		let selected = document.createElement("option");
		if (this.querySelector("option[selected]") || this.hasAttribute("value")) {
			let selectedElement = this.querySelector("option[selected]") || this.hasAttribute("value");
			selected.innerText = selectedElement.innerText;
			this.setAttribute("value", selectedElement.getAttribute("value"));
		} else {
			selected = document.createElement("option");
			selected.innerText = "Select Option";
			this.removeAttribute("value");
		}
		
		unselectedDiv.append(...options);
		
		this.innerHTML = "";
		this.appendChild(selected);
		this.appendChild(unselectedDiv);
		
		selected.addEventListener("click", (e) => { this.classList.toggle("open"); });
		// this.addEventListener("click", (e) => { this.classList.toggle("open"); });
		
		for (let option of options) {
			option.addEventListener("click", () => {
				this.setAttribute("value", option.getAttribute("value"));
				selected.innerText = option.innerText;
				this.classList.remove("open");
				options.forEach((o) => {o.removeAttribute("selected")});
				option.setAttribute("selected", "");
			});
		}
	}
}

customElements.define("custom-menu", CustomMenu);