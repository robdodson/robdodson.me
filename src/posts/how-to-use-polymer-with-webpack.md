---
title: How to use Polymer with Webpack
date: 2017-07-17T18:28:54.000Z
updated: 2017-07-17T18:30:02.000Z
---

## Introduction

Over the last year I've had a number of discussions with mid to large sized companies who are interested in creating common UI libraries that all of their teams can share. Often these teams are on different stacks (React, Vue, Angular, etc.) so using something like Web Components and Polymer makes sense, as all of these frameworks can consume and communicate with Web Components.

Most frameworks tend to rely on ES Modules or CommonJS and tools like Webpack to bundle their code. Polymer, on the other hand, uses HTML Imports. This means developers who want to use the two together will need to reconcile how things get bundled and the order in which they’re loaded.

But Webpack can already understand multiple file formats (.css, .tsx, etc). So could it be extended to understand HTML imports? Sure, why not! Today I'm really excited to show off [polymer-webpack-loader](https://github.com/webpack-contrib/polymer-webpack-loader), a new tool which consumes HTML Imports and outputs modules ready for Webpack. Not only does this make it much easier to use Polymer with other frameworks, but it also adds interesting new features to Polymer like the ability to use ES Module `import` syntax to pull in code installed via npm.

Before I get too ahead of myself I want to point out that this is not an official Polymer project—Polymer isn’t “going all in on Webpack” or anything like that—this is just an awesome tool created by two community members, [Bryan Coulter](https://github.com/bryandcoulter) and [Chad Killingsworth](https://github.com/ChadKillingsworth), that solves a pain point a number of developers have encountered. Although the project is still in a beta phase, I thought it would be cool to do a short write up so members of the Polymer community can kick the tires and give it some feedback.

## Who is this for?

Before jumping into the nitty gritty, I wanted to first identify which users would benefit the most from this tool. If you're already using the Polymer CLI or polymer-build, and you're happy with your project, then by all means stick with them! They're great tools that do awesome stuff 😁

polymer-webpack-loader will be most beneficial for anyone who:

- Is integrating Polymer elements as part of a larger project that uses a different framework.
- Wants to use `import` syntax to leverage npm packages in their Polymer elements.
- Wants to use TypeScript, JSX, emojiscript, [insert yr FancyScript of choice].

## How does it work?

polymer-webpack-loader takes an HTML Import file and converts the entire thing into a JavaScript module. It does this in three steps:

![Diagram of three loader phases. Steps are explained below.](/images/2017/07/Blog---7-1.png)

### Step 1. Convert `<link>`'s

All `<link>` elements are converted to ES Module `import` statements. For example `<link rel="import" href="paper-button.html">` becomes `import ‘paper-button.html’;` That might seem a little weird but remember, everything is a module in Webpack, even HTML and CSS files. By converting `<link>` elements to `import` statements, Webpack is able to crawl the rest of our dependency graph.

### Step 2. Turn `<dom-module>`’s into string templates

Polymer's `<dom-module>` is a Custom Element which captures its contained template and places it inside of a global map. Whenever a Polymer element is created, the first thing it does is find its template in this map and stamp it out. The polymer-webpack-loader just takes the contents of your `<dom-module>` and converts them into a string template which will get imported when the bundle is executed. Essentially it achieves the same end—a global map is created so the element’s template is accessible—but does so in a slightly different fashion.

### Step 3. Separate out `<script>` elements

Finally any `<script>` tags which contain a valid `src` attribute are converted to `'import'` statements. Inline scripts are separated out and made available to other loaders in the chain (like babel-loader or ts-loader). Finally, they get tossed into the `bundle.js` along with everything else.

At the end of all this we should end up with a `bundle.js` with all of our elements and any other dependencies compiled into it.

## Let's do a hello world!

[I've created a tiny demo project so you can follow along](https://github.com/webpack-contrib/polymer-webpack-loader/tree/master/demo).

To get started with the loader, install it from npm.

```bash
npm install --save-dev polymer-webpack-loader
```

Or if you’re using the demo project, `cd` into the demo directory and run `npm i` and <br>`bower i`.

Next, drop the loader into your `webpack.config.js`, here's the full config file from the demo. I've done my best to comment each section so if you're new to Webpack you can grok what's going on.

<script src="https://gist.github.com/robdodson/977773a05f6fad370314021a20d9da7b.js"></script>

The key thing to note is the `module` section where we define the `rules` array. The first rule tests to see if a file ends in `.html`, if so, it gets sent to a set of chained loaders. Loaders transform a file in some way, similar to "tasks" in other build tools. Here we're saying "run everything through polymer-webpack-loader, take the output from that and give it to babel-loader."

Next we'll need to give our app a starting point, so create an `index.js` file and include an `import` statement to pull in an HTML Import.

```js
/* src/index.js */

import './my-element.html';
```

And here’s the actual definition for `my-element.html`.

`my-element.html`, is a fairly plain Polymer element with one interesting feature. In the `<script>` element I'm importing the [date-fns](https://date-fns.org/) library. Webpack will resolve this to the version in my `node_modules` directory and compile it into my bundle, which is pretty sweet. Finally we can leverage properly scoped modules in our element definitions!

The last thing we need to do is throw together an `index.ejs` which will be served by the Webpack dev server.

The `index.ejs` loads the Custom Elements ES5 adapter, Web Components polyfills, and the `bundle.js` created by Webpack. It also contains an instance of `<my-element>` in the `<body>`.

Not sure what that Custom Elements ES5 Adapter is all about? Check out [this clip](https://youtu.be/Ucq9F-7Xp8I?t=7m56s) for the full explanation.

Note the line that says `<%= htmlWebpackPlugin.files.js[0] %>`, as this is where our `bundle.js` will end up.

Finally, in the terminal run `npm start` to kickoff the Webpack dev server which will open a browser window for you. You should see something like this:

![A new browser window which says Hello, World and today's date](/images/2017/07/Screen-Shot-2017-07-13-at-4.38.28-PM.png)

Success! You’ve now got Polymer bundling with Webpack and leveraging imports from your `node_modules` directory.

## Open questions

### Can I publish elements I create using the loader to WebComponents.org?

It depends. If you’re taking advantage of ES Module `import` syntax to pull in npm packages, then no. Otherwise anyone who wants to use your element would be required to also use Webpack. I think this tool is best used for handling code in your *own* application and for elements that you don’t intend to share.

### Does this mean I don’t have to use bower anymore?

Not really. The primary reason Polymer, and Web Components in general, rely on bower is because Custom Element tag names are global. This means you can’t have multiple conflicting versions of an element trying to be registered at once. Bower enforces deduplicating version conflicts at install time so you *always* end up with one version of a dependency. npm does not support this same feature, so for the time being it’s probably best to continue using bower to install your Web Components. If you’re curious to learn more about this [check out this clip from one of my recent I/O talks](https://www.youtube.com/watch?v=Ucq9F-7Xp8I&amp;feature=youtu.be&amp;t=31m16s).

### What about PRPL / code splitting?

One of my favorite features of HTML Imports is that it encourages you to colocate all of the HTML, CSS, and JavaScript for a component into a single file. This makes it easy to separate components that are critical for first render, from those that can come later in the process. You can then use a tool like Polymer CLI to bundle your critical and noncritical components into separate “fragments”, and lazy load them with Polymer's `importHref` method.

We can achieve the same effect in Webpack using a feature called [Code Splitting](https://webpack.js.org/guides/code-splitting/). The authors of the polymer-webpack-loader have put together a nice [Polymer Starter Kit example](https://github.com/Banno/polymer-2-starter-kit-webpack) which demonstrates [how to setup your Webpack configuration for code splitting](https://github.com/Banno/polymer-2-starter-kit-webpack/blob/master/webpack.config.js#L9), and how to swap out Polymer's `importHref` method for Webpack's [dynamic `import()`](https://github.com/Banno/polymer-2-starter-kit-webpack/blob/master/src/my-app.html#L127-L138).

## Conclusion

I think Custom Elements built with Polymer should absolutely work in any library or framework. But too often we hit bumps along the way, sometimes related to build tools, and it makes the entire process feel like more trouble than it's worth. I'm really excited about polymer-webpack-loader because it addresses a major pain point I've experienced and I can't wait to see more folks use it to bring Custom Elements into their project and share them across their teams.

Big thanks to Bryan Coulter and Chad Killingsworth for creating polymer-webpack-loader and Sean Larkin for reviewing this post.
