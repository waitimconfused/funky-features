# Asterisk

## Description

Hosting a local server, made easy.

Using no external Node modules, only bult in NodeJS functions.

Meaning, no dependencies with a small size

## Documentation

This documentation uses the following import(s)

` import * as Ast from "./Asterisk/index.js"; `

### `Ast.serverside.open(PORT);`

Open a port on the current machine, on any specified port number

### `Ast.serverside.api.createEndpoint(CALLBACK, NAME);`

Create an API endpoint

> CALLBACK: `function(data, IP)` This function is given input data, and outputs a JSON object
>  
> NAME: `string` Path to the endpoint

```js
Ast.serverside.api.createEndpoint( function(dataIn){
  return {"message": "You sent: " + JSON.stringify(dataIn)};
}, "/my_api");
```

This creates an endpoint at the path `localhost:<PORT>/api/my_api`, and outputs a JSON object

### `Ast.serverside.api.setPrefix(PREFIX)`

Ast.clearLogs();
Ast.serverside.open(1200);

Ast.files.regester404("./404.html");

Ast.serverside.api.createEndpoint(function(dataIn){
  return {"message": "You sent: " + JSON.stringify(dataIn)};
}, "/my_api");
