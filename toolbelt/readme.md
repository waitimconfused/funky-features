# Toolbelt

## About

A toolbelt has almost everything you need. That's the aim for this JavaScript library/module. No dependencies, cross platform, you can use it anywhere.

So far, it's got these features:

- All inputs
  - Keyboard
  - Mouse
  - Game Controllers
- Canvas automation

## Inputs

### Keyboard

Getting key inputs:

```js
import { keyboard } from "toolbelt";

// Get the state of the key "a" (boolean)
keyboard.isPressed("a");
```

Creating a keybind:

```js
import { keyboard } from "toolbelt";

// Create a keyboard keybind/shortcut for (ctrl + b).
// When pressed, console.log something
// Noting else you need to do. Toolbelts are simple
keyboard.setKeybind(() => {
  console.log(`Keybind [control + b] triggered`);
}, [ "control", "b" ]);
```

### Mouse

Getting mouse inputs:

```js
import { keyboard } from "toolbelt";

let position = mouse.position; // { x: 0, y: 0 }
let positionRelative = mouse.position.relatve(HTMLElement); // Relative to a specified HTML Element
let leftClick = mouse.click_l; // Is the left mouse button pressed?
let rightClick = mouse.click_r; // Is the right mouse button pressed?
```

### Game Controllers

There are 3 ways of adding event listeners to any game controller, with naming conventions that match the controller.

This example is for an Xbox Controller, with mulitple message for the (A) button being pressed, held, and unpressed:

```js
import { XboxController } from "toolbelt";

// Get the controller at index 0, with the Xbox-Controller layout
// By default, there are a max of 4 "slots" for controllers to connect to
var xboxController = new XboxController(0);

xboxController.listener.on("button.A", function(){
  console.log("Button A is pressed");
});

boxController.listener.while("button.A", function(){
  console.log("Button A is being held");
});

boxController.listener.stateChange("button.A", function(){
  console.log("Button A has changed");
});

boxController.listener.off("button.A", function(){
  console.log("Button A is no longer pressed");
});
```
