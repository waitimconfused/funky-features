import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url"
import PYtoJS from "./convert.js";

function mkdir(dir=""){
	if(!fs.existsSync(dir)) fs.mkdirSync(dir);
}

function writeFile(file="", content=""){
	let dir = path.dirname(file)
	mkdir(dir);
	fs.writeFileSync(file, content);
}

export default function compile(){

	fs.readdir("./code/addons/source/", (err, files) => {
		files.forEach(file => {
			loadPlugin(file);
		});
	});
}

async function loadPlugin(pluginName=""){
	pluginName = pluginName.replace(/\.[^\/.]+$/, "");


	let pythonBuffer = fs.readFileSync(`./code/addons/source/${pluginName}.py`);

	let python = pythonBuffer.toString();

	let javascript = PYtoJS(python);

	writeFile(`./code/addons/comp/${pluginName}.js`, javascript);
	console.log("Compiled addon:", pluginName);
}



const __filename = fileURLToPath(import.meta.url);

let entryFile = process.argv?.[1];

if (entryFile === __filename) {
	compile();
}