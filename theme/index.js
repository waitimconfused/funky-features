var selects = document.getElementsByTagName("select");
selects = Array.prototype.slice.call(selects);
for (let x = 0; x < selects.length; x ++) {
	let select = selects[x];

	if (select.hasAttribute("no-convert")) continue;
	let value = select.getAttribute("value") || "";

	let options = select.getElementsByTagName("option");
	options = Array.prototype.slice.call(options);
	let isMultiple = select.hasAttribute("multiple");
	let isChip = select.classList.contains("chip");
	
	let div = document.createElement("div");
	for (let attribute of select.attributes) {
		div.setAttribute(attribute.name, attribute.value);
	}
	if (isMultiple) div.classList.add("select-options");
	else div.classList.add("select-option");

	div.tabIndex = 0;

	div.addEventListener("keydown", (e) => {
		if (e.key == "enter") console.log("TOGGLE!");
	})

	let unselectedDiv;
	if (isMultiple == false && isChip == false) {
		unselectedDiv = document.createElement("div");
		unselectedDiv.classList.add("unselected");
		let fixedOption = document.createElement("span");
		fixedOption.classList.add("option");
		fixedOption.classList.add("fixed");
		fixedOption.innerHTML = "Select Option";
		fixedOption.addEventListener("click", () => { div.classList.toggle("open"); })
		div.appendChild(fixedOption);
	}

	for (let y = 0; y < options.length; y ++) {
		let option = options[y];
		let span = document.createElement("span");

		span.innerHTML = option.innerHTML;
		span.classList.add("option");

		if (isMultiple) span.addEventListener("click", () => { selectOptions(span) });
		else span.addEventListener("click", () => { selectOption(span) });

		if (value.split(",").includes(option.value)) span.setAttribute("selected", "");

		for (let attribute of option.attributes) {
			span.setAttribute(attribute.name, attribute.value);
		}
		if (unselectedDiv) unselectedDiv.appendChild(span);
		else div.appendChild(span);
	}

	select.replaceWith(div);

	if (!unselectedDiv) continue;

	div.appendChild(unselectedDiv);

	if (!div.querySelector("span.option[selected]")) {
		let selectedOption = div.querySelector("span.option");
		selectedOption.setAttribute("selected", "");
		let fixedOption = div.querySelector("span.option.fixed");
		fixedOption.innerHTML = selectedOption.innerHTML;
	}

	let selectedOption = div.querySelector("span.option[selected]");
	let fixedOption = div.querySelector("span.option.fixed");
	fixedOption.innerHTML = selectedOption.innerHTML;

	let unselectedOptions = div.querySelectorAll(".unselected .option:not([selected])");

	for (let i = 0; i < unselectedOptions.length; i ++) {
		let unselectedOption = unselectedOptions[i];
		unselectedDiv.appendChild(unselectedOption);
	}
}

/** @param { HTMLSpanElement } option */
function selectOptions(option) {
	option.toggleAttribute("selected");

	let isSelected = option.hasAttribute("selected");
	let value = option.getAttribute("value");
	let selectedValues = option.parentNode.getAttribute("selected") || "";

	selectedValues = selectedValues.split(",");
	selectedValues = selectedValues.filter((a) => !!a);

	if (selectedValues.includes(value) && isSelected == false) {
		let index = selectedValues.indexOf(value);
		selectedValues.splice(index, 1);
	} else if (selectedValues.includes(value) == false && isSelected) {
		selectedValues.push(value);
	}

	selectedValues = selectedValues.sort();
	option.parentNode.setAttribute("selected", selectedValues.join(","));
}

/** @param { HTMLSpanElement } option */
function selectOption(option) {
	let isNowSelected = !option.hasAttribute("selected");
	let isChip = option.parentElement.classList.contains("chip");
	let fixedOption = option.parentElement.parentElement.querySelector(".option.fixed");

	console.log({isChip});

	if (isChip == false) {
		if (isNowSelected) {
			let previousSelectedOption = option.parentElement.querySelector(".option[selected]");
			if (previousSelectedOption) previousSelectedOption.removeAttribute("selected");
		}
	
		fixedOption.innerHTML = option.innerHTML;
	
		if (isNowSelected) option.setAttribute("selected", "");
		else option.removeAttribute("selected");
	
		option.parentElement.parentElement.classList.remove("open");
		option.parentElement.parentElement.setAttribute("value", option.getAttribute("value"));
		option.parentElement.parentElement.classList.remove("reverse");
	} else {
		if (isNowSelected) {
			let previousSelectedOption = option.parentElement.querySelector(".option[selected]");
			if (previousSelectedOption) previousSelectedOption.removeAttribute("selected");
		}
	
		if (isNowSelected) option.setAttribute("selected", "");
		else option.removeAttribute("selected");
	
		option.parentElement.parentElement.setAttribute("value", option.getAttribute("value"));
	}
}

const themeChangeButton = document.getElementById("theme-switch");
const root = document.getElementsByTagName("html")[0];

if (themeChangeButton) themeChangeButton.onclick = () => {
	let currentTheme = document.documentElement.getAttribute("data-theme") || "light";
	let newTheme = (currentTheme == "light") ? "dark" : "light";
	document.documentElement.setAttribute("data-theme", newTheme);
}

document.onscroll =  () => {
	let rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
	if (window.scrollY > rem) {
		root.classList.add("scroll");
	} else {
		root.classList.remove("scroll");
	}
};