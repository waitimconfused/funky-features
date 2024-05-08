import Rect from "./display/custom/rect.js";
import { readFile } from "./files/index.js";
import { globalGraph } from "./index.js";

globalGraph.addTag(".md", {
	colour: "#2965F1",
	glyph: "md"
});
globalGraph.addTag(".js", {
	colour: "#F1E05A",
	glyph: "JS"
});
globalGraph.addTag(".py", {
	colour: "#3572A5",
	glyph: "JS"
});
globalGraph.addTag(".html", {
	colour: "#E34C26",
	glyph: "</>"
});
globalGraph.addTag(".css", {
	colour: "#563D7C",
	glyph: "CSS"
});
globalGraph.addTag(".json", {
	colour: "#563D7C",
	glyph: "{json}"
});
globalGraph.addTag(".txt", {
	colour: "#563D7C",
	glyph: "TXT"
});
globalGraph.addTag(".png", {
	colour: "#A8A8A8",
	glyph: "🖼️"
});
globalGraph.addTag(".svg", {
	colour: "#A8A8A8",
	glyph: "🖼️"
});
globalGraph.addTag(".jpg", {
	colour: "#A8A8A8",
	glyph: "🖼️"
});
globalGraph.addTag(".jpeg", {
	colour: "#A8A8A8",
	glyph: "🖼️"
});
globalGraph.addTag(".webp", {
	colour: "#A8A8A8",
	glyph: "🖼️"
});
globalGraph.addTag(".gif", {
	colour: "#A8A8A8",
	glyph: "🖼️"
});

// readFile("./index.html");

// readFile("/index.html");

readFile("/404.html");

readFile("/projects/demo.html");
readFile("/projects/view.html");

(new Rect)
	.setColour("#0000FF")
	.setTitle("RECTANGLE!");