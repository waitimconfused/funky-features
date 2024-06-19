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
// Get the state of the key "a"
// Returns a bool
toolbelt.keyboard.isPressed("a");
```

Creating a keybind:

```js
// Create a keyboard keybind/shortcut for (ctrl + b).
// When pressed, console.log something
// Noting else you need to do. Toolbelts are simple
toolbelt.keyboard.setKeybind(() => {
  console.log(`Keybind [control + b] triggered`);
}, [ "control", "b" ]);
```

### Mouse

Getting mouse inputs:

```js
let position = toolbelt.mouse.position; // { x: 0, y: 0 }
let positionRelative = toolbelt.mouse.position.relatve(HTMLElement); // Relative to a specified HTML Element
let leftClick = toolbelt.mouse.click_l; // Is the left mouse button pressed?
let rightClick = toolbelt.mouse.click_r; // Is the right mouse button pressed?
```

### Game Controllers

There are 3 ways of adding event listeners to any game controller, with naming conventions that match the controller.

This example is for an Xbox Controller, with mulitple message for the (A) button being pressed, held, and unpressed:

```js
// Get the controller at index 0
// By default, there are a max of 4 "slots" for controllers to connect to
// Using "controller.XBOX" for the standard Xbox Controller
var xboxController = toolbelt.controller.XBOX.fromIndex(0);

xboxController.on("buttonA", function(){
  console.log("Button A is pressed");
});

boxController.while("buttonA", function(){
  console.log("Button A is being held");
});

boxController.off("buttonA", function(){
  console.log("Button A is no longer pressed");
});
```
