import * as tb from "../toolbelt/toolbelt.js";

const sidenavs = document.querySelectorAll(".sidenav");

for (let i = 0; i < sidenavs.length; i++) {
	let sidenav = sidenavs[i];
	let popupOptions = sidenav.querySelector(".popup-options");
	let popupOptions_drag = popupOptions.querySelector(".drag");
	dragElement(popupOptions, popupOptions_drag);
}

function dragElement(elmnt, handle) {
	let startX = 0;
	let startY = 0;
	if (handle) {
		// if present, the header is where you move the DIV from:
		handle.onmousedown = dragMouseDown;
	} else {
		// otherwise, move the DIV from anywhere inside the DIV:
		elmnt.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;

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

		let side = "";

		if (elmnt.parentNode.classList.contains("right")) side = "right";
		if (elmnt.parentNode.classList.contains("left")) side = "left";
		if (elmnt.parentNode.classList.contains("float")) side = "float";

		if (["left", "right"].includes(side)) {
			elmnt.style.top = tb.toRange(25, e.clientY - handle.offsetTop - elmntHandleRect.height / 2, window.innerHeight - 25) + "px";
		} else if (side == "float") {
			elmnt.parentNode.style.top = tb.toRange(8, e.clientY - handle.offsetTop - elmntHandleRect.height / 2, window.innerHeight - parentRect.height - 8) + "px";
			elmnt.parentNode.style.left = tb.toRange(8, e.clientX - handle.offsetLeft - elmntHandleRect.width / 2, window.innerWidth - parentRect.width - 8) + "px";
		}

		if (side == "right" && e.clientX < window.innerWidth / 2) {
			elmnt.parentNode.classList.remove("right");
			elmnt.parentNode.classList.add("left");
		} else if (side == "left" && e.clientX > window.innerWidth / 2) {
			elmnt.parentNode.classList.add("right");
			elmnt.parentNode.classList.remove("left");
		}

		if (
			elmnt.parentNode.classList.contains("open") == false &&
			(side == "right" && e.clientX < window.innerWidth - parentRect.width / 2) ||
			(side == "left" && e.clientX > parentRect.width / 2)
		) {
			openSidenav(elmnt.parentNode);
		} else if (
			elmnt.parentNode.classList.contains("open") &&
			(side == "right" && e.clientX > window.innerWidth - parentRect.width / 2) ||
			(side == "left" && e.clientX < parentRect.width / 2)
		) {
			closeSidenav(elmnt.parentNode);
		}
	}

	function closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
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

	for (let i = 0; i < floatingSidenavs.length; i++) {
		let floatingSidenav = floatingSidenavs[i];
		let rect = floatingSidenav.getBoundingClientRect();

		floatingSidenav.style.top = tb.toRange(8, floatingSidenav.offsetTop, window.innerHeight - rect.height - 8) + "px";
		floatingSidenav.style.left = tb.toRange(8, floatingSidenav.offsetLeft, window.innerWidth - rect.width - 8) + "px";
	}
}