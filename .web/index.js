class PreferenceStruct {
	/**
	 * @type { string[] }
	 */
	options = [];
	/**
	 * @type { string }
	 */
	value = "";
	
	/**
	 * 
	 * @param  {...string} options 
	 */
	constructor(...options) {
		if (Array.isArray(options[0])) options = options[0];
		if (options[0].toLowerCase() == "bool") options = [ "true", "false" ];
		this.options = options;
	}

	/**
	 * 
	 * @param { string } value
	 * @returns { this }
	 */
	set(value) {
		if (typeof value != "string") {
			value = JSON.stringify(value);
		}
		this.value = value;
		return this;
	}
}
/**
	 * 
	 * @param  {...string} options 
	 */
function preferenceStruct(...options) {
	return new PreferenceStruct(options);
}

const preferences = new class Preferences {
	theme = preferenceStruct("light", "dark").set((() => {
		return localStorage.getItem("prefer.theme") || getPreferredColorScheme();
	})());

	constructor() {
		for (let key in this) {
			if (key in localStorage) {
				this[key].set( localStorage.getItem("prefer."+key) );
			}
			localStorage.setItem("prefer."+key, this[key].value);
			this[key].set( localStorage.getItem("prefer."+key) );
		}
	}
	set(key="", value="") {
		if (key in this == false) {
			console.error(`Cannot give user preference if preferences "${key}" does not exist`);
			return undefined;
		}
		localStorage.setItem("prefer."+key, value);
		this[key].set( localStorage.getItem("prefer."+key) );

		if (key == "theme") {
			let theme = this["theme"].value;
			document.documentElement.setAttribute("data-theme", theme);
		}
	}
	get(key="") {
		if (key in this == false) {
			console.error(`Cannot give user preference if preferences "${key}" does not exist`);
			return undefined;
		}

		return this[key].value;
	}
	getOptions(key="") {
		if (key in this == false) {
			console.error(`Cannot give user preference if "${key}" does not exist or have any options`);
			return undefined;
		}
		return this[key].options;
	}
}
window.preferences = preferences;

function getPreferredColorScheme() {
	if (window.matchMedia) {
		if(window.matchMedia('(prefers-color-scheme: dark)').matches){
			return 'dark';
		} else {
			return 'light';
		}
	}
	return 'light';
}

document.documentElement.setAttribute("data-theme", preferences.get("theme"));

const themeChangeButton = document.querySelector(".theme-change");
themeChangeButton.addEventListener("click", () => {
	let currentTheme = preferences.get("theme");
	let newTheme = (currentTheme == "light") ? "dark" : "light";
	preferences.set("theme", newTheme);
});

const headers = document.getElementsByTagName("h2");

for (let i = 0; i < headers.length; i ++) {
	let header = headers.item(i);
	let id = header.innerText.replace(/(\s)/, "_");
	id = id.replace(/([^\w])/, "");
	header.id = id;

	header.addEventListener("click", () => {
		window.location.href = "#" + header.id;
	});
}