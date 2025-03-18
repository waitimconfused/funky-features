import * as tb from "../toolbelt/toolbelt.js";

const sidenavs = document.querySelectorAll(".sidenav");

for (let i = 0; i < sidenavs.length; i++) {
	/** @type {HTMLElement} */
	let sidenav = sidenavs[i];
	/** @type {HTMLElement} */
	let popupOptions = sidenav.querySelector(".popup-options");
	/** @type {HTMLElement} */
	let popupOptions_drag = popupOptions.querySelector(".drag");

	let side = "";
	if (sidenav.classList.contains("right")) side = "right";
	if (sidenav.classList.contains("left")) side = "left";
	if (sidenav.classList.contains("float")) side = "float";

	let collapsed = sidenav.classList.contains("open");

	/**
	 * @type {{pos?: {x: number, y: number}, handle?: {y: number, side: "left"|"right"} collapsed: boolean}}
	 */
	let options = JSON.parse( localStorage.getItem(`sidenav.${sidenav.id}.options`) || "{}" );

	if (typeof options.collapsed == "undefined") options.collapsed = collapsed;

	if (side == "float") {
		if (typeof options?.pos != "object") options.pos = {x: 8, y: 8};
		sidenav.style.top = options.pos.y + "px";
		sidenav.style.left = options.pos.x + "px";
	} else {
		side = options?.handle?.side || side;
		if (!options?.handle) options.handle = {y: 25, side: side};
		popupOptions.style.top = options.handle.y + "px";
		
		if (side == "right") {
			sidenav.classList.remove("left")
			sidenav.classList.add("right")
		} else if (side == "left") {
			sidenav.classList.add("left")
			sidenav.classList.remove("right")
		}

	}

	if (options.collapsed == true) {
		sidenav.classList.remove("open");
	} else {
		sidenav.classList.add("open");
	}

	localStorage.setItem(`sidenav.${sidenav.id}.options`, JSON.stringify(options));

	dragElement(popupOptions, popupOptions_drag);
}

/**
 * @param {HTMLElement} elmnt
 * @param {HTMLElement} handle
 */
function dragElement(elmnt, handle) {
	let startX = 0;
	let startY = 0;
	if (handle) {
		// if present, the header is where you move the DIV from:
		handle.onpointerdown = dragMouseDown;
	} else {
		// otherwise, move the DIV from anywhere inside the DIV:
		elmnt.onpointermove = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		document.onpointerup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onpointermove = elementDrag;

		startX = e.clientX;
		startY = e.clientY;

		setTimeout(() => {
			elmnt.parentNode.setAttribute("dragging", "true");
		}, 100);
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		let parentRect = elmnt.parentElement.getBoundingClientRect();
		let elmntHandleRect = handle.getBoundingClientRect();

		tb.mouse.click_l = false;

		/**
		 * @type {{pos?: {x: number, y: number}, handle?: {y: number, side: "left"|"right"} collapsed: boolean}}
		 */
		let options = JSON.parse(localStorage.getItem(`sidenav.${elmnt.parentElement.id}.options`));


		let side = "";

		if (elmnt.parentNode.classList.contains("right")) side = "right";
		if (elmnt.parentNode.classList.contains("left")) side = "left";
		if (elmnt.parentNode.classList.contains("float")) side = "float";

		if (["left", "right"].includes(side)) {
			let top = tb.Range.clamp(25, e.clientY - handle.offsetTop - elmntHandleRect.height / 2, window.innerHeight - elmntHandleRect.height - 75);
			elmnt.style.top = top + "px";
			options.handle.y = top;
		} else if (side == "float") {
			let top = tb.Range.clamp(8, e.clientY - handle.offsetTop - elmntHandleRect.height / 2, window.innerHeight - parentRect.height - 8);
			let left = tb.Range.clamp(8, e.clientX - handle.offsetLeft - elmntHandleRect.width / 2, window.innerWidth - parentRect.width - 8);
			elmnt.parentNode.style.top = top + "px";
			elmnt.parentNode.style.left = left + "px";

			options.pos.y = top;
			options.pos.x = left;
		}

		if (side == "right" && e.clientX < window.innerWidth / 2) {
			elmnt.parentNode.classList.remove("right");
			elmnt.parentNode.classList.add("left");
			options.handle.side = "left";
		} else if (side == "left" && e.clientX > window.innerWidth / 2) {
			elmnt.parentNode.classList.add("right");
			elmnt.parentNode.classList.remove("left");
			options.handle.side = "right";
		}

		if (
			elmnt.parentNode.classList.contains("open") == false &&
			(side == "right" && e.clientX < window.innerWidth - parentRect.width / 2) ||
			(side == "left" && e.clientX > parentRect.width / 2)
		) {
			openSidenav(elmnt.parentNode);
			options.collapsed = false;
		} else if (
			elmnt.parentNode.classList.contains("open") &&
			(side == "right" && e.clientX > window.innerWidth - parentRect.width / 2) ||
			(side == "left" && e.clientX < parentRect.width / 2)
		) {
			closeSidenav(elmnt.parentNode);
			options.collapsed = true;
		}

		localStorage.setItem(`sidenav.${elmnt.parentElement.id}.options`, JSON.stringify(options));
	}

	function closeDragElement(e) {
		// stop moving when mouse button is released:
		document.onpointerup = null;
		document.onpointermove = null;

		if (startX == e.clientX && startY == e.clientY) {
			let isOpen = elmnt.parentNode.classList.contains("open");
			if (isOpen) closeSidenav(elmnt.parentNode);
			else openSidenav(elmnt.parentNode);
		}
	}
}

function openSidenav(sidenav) {
	let side = sidenav.classList.contains("right") ? "right" : "left";
	let openTabs = document.querySelectorAll(`.sidenav.${side}.open`);
	for (let i = 0; i < openTabs.length; i++) {
		let openTab = openTabs[i];
		openTab.classList.remove("open");
	}
	sidenav.classList.add("open");
}

function closeSidenav(sidenav) {
	sidenav.classList.remove("open");
}

window.addEventListener("resize", putFloatingSidenavsInScreen);

function putFloatingSidenavsInScreen() {
	let floatingSidenavs = document.querySelectorAll(".sidenav.float");
	
	for (let i = 0; i < floatingSidenavs.length; i ++) {
		let floatingSidenav = floatingSidenavs[i];
		let rect = floatingSidenav.getBoundingClientRect();

		floatingSidenav.style.top = tb.Range.clamp(8, floatingSidenav.offsetTop, window.innerHeight - rect.height - 8) + "px";
		floatingSidenav.style.left = tb.Range.clamp(8, floatingSidenav.offsetLeft, window.innerWidth - rect.width - 8) + "px";
	}
}