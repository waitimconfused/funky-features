export class Stylesheet {
	rules = [];
	addRule(regex=new RegExp, replacement=""){
		let rule = { regex, replacement };
		this.rules.push(rule);
	}
}

export function stylize(str="", stylesheet=new Stylesheet){
	let lines = str.split("\n");
	lines.forEach((line, lineNumber) => {
		stylesheet.rules.forEach((rule) => {
			line = line.replaceAll(rule.regex, rule.replacement);
		});
		lines[lineNumber] = line;
	});
	return lines.join("\n");
}