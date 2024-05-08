import * as toolkit from "./index.js";

toolkit.keyboard.setKeybind((event) => {
	console.log(event);
}, [ "a", "s" ]);