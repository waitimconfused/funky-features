import * as Ast from "../Asterisk/index.js";
import * as fs from "node:fs";
import * as path from "node:path";

Ast.clearLogs();
Ast.serverside.open(1201);
Ast.message.disable();
Ast.files.regester404("./404.html");
Ast.serverside.api.lock();

function mkdir(dir=""){
	if(!fs.existsSync(dir)) fs.mkdirSync(dir);
}

function writeFile(file="", content=""){
	let dir = path.dirname(file)
	mkdir(dir);
	fs.writeFileSync(file, content);
}

Ast.api.createEndpoint(function(dataIn, IP){
	let fileName = dataIn.title.replace(/\.py$/, "");
	writeFile(`./plugins/compiled/${fileName}.js`, dataIn.content);
	return {status: 200};
}, "/plugin/save");

var faker_banker = {}

if(fs.existsSync("./faker_banker.json")){
	faker_banker = JSON.parse( fs.readFileSync("./faker_banker.json") )
}

class BankAccount {

	money = 100;

	constructor(name){
		faker_banker[name] = this;
	}

}

function save(){
	fs.writeFileSync("./faker_banker.json", JSON.stringify(faker_banker, null, 4));
}

Ast.api.createEndpoint(function(dataIn, IP){
	let accName = dataIn.name;
	if(Object.keys(faker_banker).includes(accName)) return {status: 400};

	new BankAccount(accName);
	save();

	console.log(" > Created account: \""+ accName+"\"");

	return {status: 200};
}, "/faker_banker/create");

Ast.api.createEndpoint(function(dataIn, IP){
	let accName = dataIn.name;
	let amount = dataIn.amount;
	if(!Object.keys(faker_banker).includes(accName)) return {status: 400};

	faker_banker[accName].money = amount;
	save();

	console.log(" > Set account: \""+ accName+"\" to $"+amount);

	return {status: 200};
}, "/faker_banker/set");

Ast.api.createEndpoint(function(dataIn, IP){
	let accName = dataIn.name;
	if(!Object.keys(faker_banker).includes(accName)) return {status: 400};

	return {
		account: faker_banker[accName]
	};
}, "/faker_banker/get");

Ast.api.createEndpoint(function(dataIn, IP){
	return {
		accounts: faker_banker,
	};
}, "/faker_banker/get_all");

Ast.api.createEndpoint(function(dataIn, IP){
	let accFromName = dataIn.from;
	let accToName = dataIn.to;
	let amount = dataIn.amount;
	if(!Object.keys(faker_banker).includes(accFromName)) return {status: 400};
	if(!Object.keys(faker_banker).includes(accToName)) return {status: 400};

	faker_banker[accFromName].money -= amount;
	faker_banker[accToName].money += amount;
	save();

	console.log(" > Traded $"+amount+" from: \""+accFromName+"\" to: \""+accToName+"\"");

	return {status: 200};
}, "/faker_banker/trade");