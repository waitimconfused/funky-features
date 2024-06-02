// import { sendData } from "../../../Asterisk/serverside/client.js";

const saveButton = document.getElementById("save");

saveButton.onclick =() => {
	let sending = {
		title: "My First Plugin",
		type: "block",
		content: "export function build() {\n\tconsole.log(\"Hello World!\");\n}"
	};
	// sendData(sending, "/plugin/register").then((data) => {
	// 	console.log(data);
	// 	if(data.status !== 200) alert("Something went wrong.");
	// })
}