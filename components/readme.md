...
link: none
...

# Components

## Description

Adding more features to the HTML `<template>` element.

## How

To be able to use these components, first add this to the html

```html
<script src="/components/template.js" defer></script>
```

Example:

Inside a `components.html` file,

```html
<body>
    <template id="my_id">
        <h1>This is my header1</h1>
    </template>
</body>
```

And, inside an `index.html` file,

```html
<body>
    <template from="components.html" id="my_id"></template>
    <!--
        Turns into:
        <h1>This is my header1</h1>
    -->

    <script src="/components/template.js" defer></script>
</body>
```

With importing from a template, the `from=""` attribute determins what file contains the component to be imported. The `id=""` attribute determins which template is imported. AKA: Where and What.
