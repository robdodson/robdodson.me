---
title: "HTML5 Template Tag: Introduction"
tags:
  - Web Components
  - Template
date: 2013-03-16T16:51:00.000Z
updated: 2014-12-31T01:25:08.000Z
---

## Our first template

There's a great [HTML5Rocks article](http://www.html5rocks.com/en/tutorials/webcomponents/template/) on the subject of the `template` tag and I'm going to steal some of their examples.

Let's start by making a template for an image placeholder.

```html
<template id="kitten-template">
  <img src="" alt="random kitten image">
  <h3 class="title"></h3>
</template>

<div id="kittens"></div>

<script>
  const template = document.querySelector('#kitten-template');
  template.content.querySelector('img').src = 'https://placekitten.com/400/400';
  template.content.querySelector('.title').textContent = 'Random image from placekitten.com';
  document.querySelector('#kittens').appendChild(document.importNode(template.content, true));
</script>
```

Which would render something like this:

<template id="kitten-template">
  <img src="" alt="random kitten image">
  <h3 class="title"></h3>
</template>

<div id="kittens"></div>

<script>
  const template = document.querySelector('#kitten-template');
  template.content.querySelector('img').src = 'https://placekitten.com/400/400';
  template.content.querySelector('.title').textContent = 'Random image from placekitten.com'
  document.querySelector('#kittens').appendChild(document.importNode(template.content, true));
</script>

If you've worked with client-side template libraries like underscore or handelbars the above should look familiar to you. Where underscore and handelbars take advantage of putting their templates inside of `<script>` tags and changing the `type` to something like `text/x-handlebars-template`, the `<template>` tag doesn't need to, because it's actually part of the HTML spec. There are pros and cons to this approach.

### Pros

- The content of the template is inert: scripts won't run, images won't load, audio won't play, etc. This means you can have `<img>` and `<script>` tags whose `src` attributes haven't been defined yet.
- The child nodes of a template are hidden from selectors like `document.getElementById()` and `querySelector()` so you won't accidentally select them.
- You can place the `<template>` pretty much anywhere on the page and grab it later.

### Cons

- You can't precompile the template into a JS function like you can with other libraries like handlebars.
- You can't preload the assets referenced by a template (images, sounds, css, js).
- You can't nest templates inside of one another and have them automagically work. If a template contains another template you'll have to activate the child, then activate the parent.
- There's no support for data interpolation (i.e. filling a template with values from a JS object).

Given that list of cons you might say "Well why would I ever bother with the `<template>` tag if something like handlebars gives me way more power?" That's a great question because by itself the `<template>` tag doesn't seem so impressive.

Its saving grace lies in the fact that it is part of the DOM, whereas all other template libraries are actually just pushing around Strings. That makes them vulnerable to XSS and requires weird hacks to prevent the browser from rendering their content.

While features like data interpolation are pretty crucial, they can be fixed by the next generation of template libraries, in fact [lit-html](https://lit-html.polymer-project.org/) has already added this back in. Which leads to the bigger point: combining templates with Shadow DOM and Custom Elements gives us the future component model for the web, and that's why I'm truly excited to use them.