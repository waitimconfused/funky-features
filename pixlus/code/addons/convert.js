export function upload(input = new HTMLInputElement){
	if (input.files && input.files[0]){
		console.log("Uploaded File");
		var reader = new FileReader();
		reader.onload = function (e) {
			console.log("Read file contents");
			let python = e.target.result;
			document.body.innerText = py_to_js(python);
		};
		reader.readAsText(input.files[0]);
	}
}

function isBlankString(str=""){
	return str.trim() == "";
}

export default function py_to_js(python=""){
	var imports = {};
	var replacements = [];

	python = python.replaceAll("    ", "\t");
	python = python.replaceAll("\r", "");

	var nestedLevel = 0;
	var pythonLines = python.split("\n");
	var variableScope = [
		[]
	];

	let isInClass = false;
	let classNestedLevel = nestedLevel;

	pythonLines.forEach((line, index) => {

		if(line.trim().startsWith("#")){
			line = line.replace(/#( *)(.*)$/, "//$1$2");
			pythonLines[index] = line;
			return;
		}

		let indents = line.split(/^(\t*| *)/g)[1]?.split("")?.length || Math.max(nestedLevel - 1, 0);
		let nextLine = index+1;
		while(isBlankString(pythonLines[nextLine])){
			if(nextLine > pythonLines.length - 1) break;
			nextLine += 1;
		}
		let indents_nextLine = pythonLines[nextLine]?.split(/^(\t*| *)/g)[1]?.split("")?.length || Math.max(nestedLevel - 1, 0);
		if(indents > nestedLevel) {
			nestedLevel += Math.abs(nestedLevel - indents);
	
			let lastLine = index - 1;
			while( (/^(\s+)$/).test(pythonLines[lastLine]) ) lastLine -= 1;
			pythonLines[lastLine] += " {";
			variableScope.push([]);
		}else if(indents < nestedLevel && indents_nextLine < nestedLevel) {
			nestedLevel -= Math.abs(nestedLevel - indents);

			let lastLine = index - 1;
			while( (/^(\s+)$/).test(pythonLines[lastLine]) ) lastLine -= 1;
	
			pythonLines[lastLine] += "\n";
			for(let i = 0; i < nestedLevel; i++){
				pythonLines[lastLine] += "\t";
			}
			pythonLines[lastLine] += "}";
			variableScope.pop();
		}

		if(isInClass && indents < classNestedLevel) {
			isInClass = false;
			classNestedLevel = 0;
		}

		let variableDeclarationRegex = /^(\s*)(\w*) = (.*)$/gm
		if(variableDeclarationRegex.test(line)){
			let variableName = line.split(variableDeclarationRegex)[2];
			let variableHasBeenDeclared = false
			variableScope.forEach((variables) => {
				if(variables.includes(variableName)) variableHasBeenDeclared = true
			});
			if(!variableHasBeenDeclared){
				variableScope[indents].push(variableName);
				let type = "var";
				if(variableName.toUpperCase() == variableName) type = "const";
				if(indents == 0){
					type = "export " + type;
				}else{
					type = "let";
				}
				type += " ";
				if(isInClass && indents == classNestedLevel) type = "";
				line = line.replace(/(^|[^.])\b(\S*)\b *= */, `$1${type}$2 = `);
			}
		}

		let importRegex_one = /from (\S*) import ([\S ]*)/;
		let importRegex_all = /import (\S*)/;
		let builtinRegex = /import (math)/;
		if(builtinRegex.test(line)){
			let importParts = line.split(builtinRegex);
			let libName = importParts[1];
			replacements.push(libName);
			line = "";
		}else if(importRegex_one.test(line)){
			let importParts = line.split(importRegex_one);
			let moduleName = importParts[2];
			let path = importParts[1];
			if(!imports[path]) imports[path] = [];
			imports[path].push(moduleName);
			imports[path].sort();
			variableScope[0].push(moduleName);
			line = "";
		}else if( importRegex_all.test(line) ){
			let importParts = line.split(importRegex_all);
			let path = importParts[1];
			let moduleName = importParts[2];
			if(!imports[path]) imports[path] = "*";
			variableScope[0].push(moduleName);
			line = "";
		}

		line = line.replace(/def (\S+?)\((.*)\) *-> *(\S+?):/gm, "def $1($2):");

		if(line.trim().startsWith('class')){
			// Replace Python class definitions with JavaScript class definitions
			if(nestedLevel == 0){
				line = line.replace(/class (.*?) *\((\w+)\):/g, "export class $1 extends $2")
				line = line.replace(/class (.*?):/g, 'export class $1');
			}else{
				line = line.replace(/class (.*?) *\((\w+)\):/g, "class $1 extends $2")
				line = line.replace(/class (.*?):/g, 'class $1');
			}
			isInClass = true;
			classNestedLevel = nestedLevel + 1;
		}else if(isInClass && line.trim().startsWith('def __init__(self')){
			// Replace Python class constructors with JavaScript class constructors
			line = line.replace(/def __init__\(self, *(.*?)\):/g, 'constructor($1)');
		}else if(isInClass && line.trim().startsWith('def __init__')){
			// Replace Python class constructors with JavaScript class constructors
			line = line.replace(/def __init__\((.*?)\):/g, 'constructor($1)');
		}else if(isInClass && line.trim().startsWith('def')) {
			// Replace Python method definitions with JavaScript method definitions
			line = line.replace(/def (.*?) *\((.*)\):/g, '$1($2)');
		}else if(isInClass && line.trim().startsWith('self.')){
			// Replace Python's self with JavaScript's this
			line = line.replace(/self\./g, 'this.');
		}else if(isInClass == false){
			line = line.replace(/^async def {1,}([a-zA-Z\_]{1,}) {0,}\((.*)+?\):/g, "export async function $1($2)");
			line = line.replace(/^def {1,}([a-zA-Z\_]{1,}) {0,}\((.*)+?\):/g, "export function $1($2)");
			line = line.replace(/async def {1,}([a-zA-Z\_]{1,}) {0,}\((.*)+?\):/g, "async function $1($2)");
			line = line.replace(/def {1,}([a-zA-Z\_]{1,}) {0,}\((.*)+?\):/g, "function $1($2)");
		}

		line = line.replace(/if *\(([\S\s]+?)\):|if *([\S\s]+?):/, "if($1)");
		if((/\belse\b/).test(line)){
			if(pythonLines[index-1].trim() == "") line = line.replace(/else:/, "else");
			else line = line.replace(/else:/, "} else {");
		}
		line = line.replace(/\bFalse\b/, "false");
		line = line.replace(/\bTrue\b/, "true");
		line = line.replace(/#( *)(.*)$/, "//$1$2");
		line = line.replace(/print\((.+?)\)/, "console.log($1)");
		line = line.replace(/\bpass\b/g, '/* ... */');
	
		pythonLines[index] = line;
	});

	Object.keys(imports).forEach(() => pythonLines.shift())
	Object.keys(imports).reverse().forEach((path) => {
		let modules = imports[path];
		let importString = "";
		path = path.replaceAll(".", "/");
		path = path.replaceAll("//", "../");
		// if((/^\w/).test(path)) path = "./" + path;

		if(modules == "*"){
			importString = `import * as ${path} from "${(/^\w/).test(path)?"../lib/"+path:path}.js"`;
		}else{
			importString = `import { ${ modules.join(", ") } } from "${path}.js"`;
		}
		pythonLines.unshift(importString);
	});

	pythonLines = pythonLines.join("\n");
	pythonLines = pythonLines.replace(/}([\s]*)else {/gm, "} else {");
	while(nestedLevel > 0) {
		pythonLines += "\n" + "\t".repeat(nestedLevel-1) + "}";
		nestedLevel -= 1;
	}
	pythonLines = pythonLines.split("\n");

	let javascript = pythonLines.join("\n");
	javascript = javascript.replaceAll("\nfunction", "\n\nfunction");

	javascript = javascript
	.replaceAll(/(^|[^.])\babs\b/g, "$1Math.abs")
	.replaceAll(/(^|[^.])\bmin\b/g, "$1Math.min")
	.replaceAll(/(^|[^.])\bmax\b/g, "$1Math.max")

	if(replacements.includes("math")){
		javascript = javascript
		.replaceAll(/(^|[^.])\bmath\b/g, "$1Math")
		.replaceAll(/(^|[^.])\bround\b/g, "$1Math.round");
	}

	return javascript;
}