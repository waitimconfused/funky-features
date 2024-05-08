import convert from "./convert.js";
import { Stylesheet, stylize } from "./style.js";

let response = await fetch("./main.plugin");
let original = await response.text();

let str = convert(original);

const PixJs_stylesheet = new Stylesheet;

PixJs_stylesheet.addRule(/(<=|>=|===|==|=|<|>|\||\|\||\&|\&\&|\+|-|\*|\/)/gm, "<span class='operator'>$1</span>");
PixJs_stylesheet.addRule(/# {0,}(.+)$/gm, "<span class='comment'># $1</span>");
PixJs_stylesheet.addRule(/^(\t{0,})(def)/gm, "$1<span class='mem-declare'>$2</span>");
PixJs_stylesheet.addRule(/^(\t{0,})(property)/gm, "$1<span class='mem-declare'>$2</span>");
PixJs_stylesheet.addRule(/^(\t{0,})(prop)/gm, "$1<span class='mem-declare'>$2</span>");
PixJs_stylesheet.addRule(/"(.+?)"|"()"/gm, "<span class='string'>\"$1\"</span>");
PixJs_stylesheet.addRule(/(\w+)( {0,})\(/gm, "<span class='mem-func'>$1$2(</span>");
PixJs_stylesheet.addRule(/([\(\)\[\]\{\}])/gm, "<span class='bracket'>$1</span>");
PixJs_stylesheet.addRule(/\breturn/gm, "<span class='operator'>return</span>");
PixJs_stylesheet.addRule(/\basync/gm, "<span class='operator'>async</span>");
PixJs_stylesheet.addRule(/\bawait/gm, "<span class='operator'>await</span>");
PixJs_stylesheet.addRule(/\bstop/gm, "<span class='operator'>stop</span>");
PixJs_stylesheet.addRule(/\s*@include +(\S+) +from +(\S+)/gm, "<span class='operator'>@include</span> $1 <span class='operator'>from</span> <span class='prop'>$2</span>");
PixJs_stylesheet.addRule(/\s*@include +(\S+) +as +(\S+) +from +(\S+)/gm, "<span class='operator'>@include</span> $1 <span class='operator'>as</span> $2 <span class='operator'>from</span> <span class='prop'>$3</span>");
PixJs_stylesheet.addRule(/:(\w*)/gm, ":<span class='prop'>$1</span>");
PixJs_stylesheet.addRule(/\b([0-9]+)([a-z]{0,})/g, "<span class='number'>$1$2</span>");

const JavaScript_stylesheet = new Stylesheet;

JavaScript_stylesheet.addRule(/(<=|>=|===|==|=|<|>|\||\|\||\&|\&\&|\+|-|\*)/gm, "<span class='operator'>$1</span>");
JavaScript_stylesheet.addRule(/\/\/ {0,}(.+)$/gm, "<span class='comment'>// $1</span>");
JavaScript_stylesheet.addRule(/export/gm, "<span class='export'>export</span>");
JavaScript_stylesheet.addRule(/function/gm, "<span class='mem-declare'>function</span>");
JavaScript_stylesheet.addRule(/^(\t{0,})(var|let|const)/gm, "$1<span class='mem-declare'>$2</span>");
JavaScript_stylesheet.addRule(/"(.+?)"|"()"/gm, "<span class='string'>\"$1\"</span>");
JavaScript_stylesheet.addRule(/(\w+)( {0,})\(/gm, "<span class='mem-func'>$1$2(</span>");
JavaScript_stylesheet.addRule(/([\(\)\[\]\{\}])/gm, "<span class='bracket'>$1</span>");
JavaScript_stylesheet.addRule(/return/gm, "<span class='return'>return</span>");
JavaScript_stylesheet.addRule(/async/gm, "<span class='async'>async</span>");
JavaScript_stylesheet.addRule(/await/gm, "<span class='await'>await</span>");
JavaScript_stylesheet.addRule(/\b([0-9]+)/g, "<span class='number'>$1</span>");
JavaScript_stylesheet.addRule(/\t/g, "<span class='indent'></span>");

let styledPIXJS = stylize(original, PixJs_stylesheet);
document.body.innerHTML += "<div>"+styledPIXJS+"</div>";
let styledJavaScript = stylize(str, JavaScript_stylesheet);
let javascriptDiv = document.createElement("div");
document.body.appendChild(javascriptDiv);
javascriptDiv.innerHTML = styledJavaScript;

async function doimport(contents="") {
	let b64moduleData = "data:text/javascript;base64," + btoa(contents);
	let module = await import(b64moduleData);
	return module;
}

let module = await doimport(str);
console.log(module);
console.log(str);
// module.build();