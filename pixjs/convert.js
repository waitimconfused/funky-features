export default function(input=""){
	let str = `${input}`;
	str = str.replaceAll("  ", "\t");
	str = str.replaceAll("\n\n\t", "\n\t");
	str = str.replaceAll(/(\s*)$/g, "");

	while(str.endsWith("\n") || str.endsWith("\t")){
		while(str.endsWith("\n")) str = str.slice(0, -1); 
		while(str.endsWith("\t")) str = str.slice(0, -1);
	}

	while(str.includes("\n\n")){
		str = str.replaceAll("\n\n", "\n");
	}
	while(str.startsWith("\n") || str.startsWith("\t")){
		while(str.startsWith("\n")) str = str.replace("\n", "")
		while(str.startsWith("\t")) str = str.replace("\t", "")
	}

	str += "\n";

	str = str.split("\n");

	let nestedLevel = 0;
	str.forEach((line, lineNumber) => {
		if( (/^(\s+?)$/g).test(line) ) return;

		line = line.replaceAll(/# {0,}(.*)$/g, "// $1");
		line = line.replaceAll(/if (.*):/g, "if ($1)");
		if(!(/\.(\w+) {0,}== {0,}(.*)/gm).test(line)) line = line.replaceAll(/\.(\w+) {0,}= {0,}(\S*)/gm, ".set(\"$1\", $2)");
		line = line.replaceAll(/([a-zA-Z\.]*) has ([a-zA-Z\."]*)/g, "$1.includes($2)");
		line = line.replaceAll(/( ?)default/gm, "$1\"default\"");
		line = line.replaceAll(/property {1,}([a-zA-Z\_]{1,}) {0,}\((.*){0,}\):/g, "export function $1($2)");
		line = line.replaceAll(/property {1,}async {1,}([a-zA-Z\_]{1,}) {0,}\((.*){0,}\):/g, "export async function $1($2)");
		line = line.replaceAll(/prop {1,}([a-zA-Z\_]{1,}) {0,}\((.*){0,}\):/g, "export function $1($2)");
		line = line.replaceAll(/prop {1,}async {1,}([a-zA-Z\_]{1,}) {0,}\((.*){0,}\):/g, "export async function $1($2)");
		line = line.replaceAll(/def {1,}([a-zA-Z\_]{1,}) {0,}\((.*){0,}\):/g, "function $1($2)");
		line = line.replaceAll(/def {1,}async {1,}([a-zA-Z\_]{1,}) {0,}\((.*){0,}\):/g, "async function $1($2)");
		if(!(/"([a-zA-Z]+):([a-zA-Z]+)"/gm).test(line)) line = line.replaceAll(/( ?)=( ?)([a-zA-Z]+):([a-zA-Z]+)/gm, "$1=$2$3.get(\"$4\")");
		if(!(/"([a-zA-Z]+):([a-zA-Z]+)/gm).test(line)) line = line.replaceAll(/([a-zA-Z]*):([a-zA-Z]*)/gm, "$1.get(\"$2\")");
		line = line.replaceAll(/def {1,}(\w+) {0,}= {0,} (.+)/g, "var $1 = $2");
		line = line.replaceAll(/def {1,}\{ {0,}(\w+)  {0,}\} {0,}= {0,} (.+)/g, "var { $1 } = $2");
		line = line.replaceAll(/\s*@include (\w+) as (\w+) from (\w+)/g, "const { $1: $2 } = await get(\"./$3.js\")");
		line = line.replaceAll(/\s*@include (\w+) from (\w+)/g, "const { default: $1 } = await get(\"./$2.js\")");
		line = line.replaceAll(/import {1,}([\w, {}]*) {1,}from {0,}runtime/g, "const { $1 } = await get(\"./runtime.js\")");
		line = line.replaceAll(/import {1,}(\w*) {1,}from {0,}([\w\.\/]*)/g, "import { $1 } from \"$2\"");
		line = line.replaceAll(/def {1,}(\w+)/g, "var $1 = {};");
		line = line.replaceAll(/([0-9]+)ms/g, "$1");
		line = line.replaceAll(/([0-9]+)s/g, "$1000");
		line = line.replaceAll(/\bschedule {1,}([\S ]+?) {1,}([0-9]+)/g, "setTimeout($1, $2);");
		line = line.replaceAll(/alert\((.*)\)/g, "game.log($1)");
		line = line.replaceAll(/\bstop\b/g, "return");


		let indents = line.split(/^(\t*| *)/g)[1]?.split("")?.length || Math.max(nestedLevel - 1, 0);
		if(indents > nestedLevel) {
			nestedLevel += Math.abs(nestedLevel - indents);

			let lastLine = lineNumber - 1;
			while( (/^(\s+)$/).test(str[lastLine]) ) lastLine -= 1;
			str[lastLine] += "{";
		}else if(indents < nestedLevel) {
			nestedLevel -= Math.abs(nestedLevel - indents);

			let lastLine = lineNumber - 1;
			while( (/^(\s+)$/).test(str[lastLine]) ) lastLine -= 1;

			str[lastLine] += "\n";
			for(let i = 0; i < nestedLevel; i++){
				str[lastLine] += "\t";
			}
			str[lastLine] += "}";
		}

		str[lineNumber] = line;
	});

	str = str.join("\n");

	return str;
}