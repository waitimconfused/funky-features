import messageData from "./index.json" assert {type: "json"};

const styles = {
	reset: "\x1b[0m",

	foreground: {
		Black: "\x1b[30m",
		Red: "\x1b[31m",
		Green: "\x1b[32m",
		Yellow: "\x1b[33m",
		Blue: "\x1b[34m",
		Magenta: "\x1b[35m",
		Cyan: "\x1b[36m",
		White: "\x1b[37m",
		Gray: "\x1b[90m"
	},
	background: {
		Black: "\x1b[40m",
		Red: "\x1b[41m",
		Green: "\x1b[42m",
		Yellow: "\x1b[43m",
		Blue: "\x1b[44m",
		Magenta: "\x1b[45m",
		Cyan: "\x1b[46m",
		White: "\x1b[47m",
		Gray: "\x1b[100m"
	}
};
/**
 * SERVER-SIDE
 * 
 * Create a terminal log
 * 
 * @param { string } header The desired header of the log (anything)
 * @param { string } message The content of the message
*/
export function write(header="", message){

	let timestamp = Date.now();

	let messageTitle = " "+timestamp+" - "+header+" ";

	let terminalWidth = process.stdout.columns;

	let titleLength = messageTitle.length % terminalWidth;

	let beforeTitle = " ".repeat( Math.floor(terminalWidth / 2 - titleLength / 2) );
	let afterTitle = " ".repeat( Math.floor(terminalWidth / 2 - titleLength / 2) );
	let headerSection = beforeTitle + messageTitle + afterTitle;
	while(headerSection.length < terminalWidth) headerSection += " ";
	let end = " ".repeat(terminalWidth);

	console.log(styles.background.Green+styles.foreground.Black + headerSection + styles.reset);

	if(typeof message == "string") message = message.split("\n");

	message.forEach((line) => {
		let extra = terminalWidth - (line.length % terminalWidth);
		console.log(styles.background.Cyan + styles.foreground.Black + line + " ".repeat(extra));
	});
	console.log(end + styles.reset + "\n");
}

/**
 * SERVER-SIDE
 * 
 * Like `write()` but with preset messages, and using data to "fill in the blanks" 

 * @param { string } code The desired type of the log (see: `/Asterisk/messages/index.json`)
 * @param { string } data Message data
*/
export function code(code="", data){
	let message = messageData[code].replaceAll("%d", data);
	write(code, message);
	return message;
}