import * as Ast from "../asterisk/index.js";

Ast.clearLogs();

Ast.serverside.open(1234);
Ast.serverside.api.setPrefix("/game/");
Ast.serverside.api.createEndpoint(() => {

}, "/set");