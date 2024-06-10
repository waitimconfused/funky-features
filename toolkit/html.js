import * as toolkit from "./";

toolkit.keyboard.setKeybind((event) => {
	console.log(event);
}, [ "a", "s" ]);