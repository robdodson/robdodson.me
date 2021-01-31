---
title: Getting Familiar with Backbone Boilerplate
tags:
  - Chain
  - Backbone
  - Backbone Boilerplate
  - Grunt
  - Node
  - RequireJS
date: 2012-05-17T14:47:00.000Z
updated: 2014-12-30T07:29:46.000Z
---

I have an upcoming project which uses [Backbone](http://documentcloud.github.com/backbone/) and [Node.js](http://nodejs.org/) so I thought it would be good to blog about the topics (particularly Backbone) for a while to make sure I'm well up to speed.

We're using the [Backbone Boilerplate](https://github.com/tbranyen/backbone-boilerplate) to get us started since it includes a bit of file structure and a build process. As they mention in the docs you have to install [Grunt](https://github.com/cowboy/grunt) if you want to use the build process they've stubbed out. Grunt is a javascript build tool which uses Node (think Rake in JS).

As a refresher course I'm going to dig into the open-source [Backbone Fundamentals book](http://addyosmani.github.com/backbone-fundamentals/) by [Addy Osmani](http://addyosmani.github.com/backbone-fundamentals/).

First thing's first though, after we have nodejs and grunt installed we need to also install the bbb (backbone boilerplate build, I guess?) tool. You can [grab it here.](https://github.com/backbone-boilerplate/grunt-bbb)

We'll create a new folder for our project and run `bbb init`. If all goes well it should stub out some project directories and files for us.

### The Backbone Boilerplate templates

I'll start with the index.html file. It seems like your standard HTML5 doc with the noteable exception that it includes [require.js](http://requirejs.org/) at the bottom of the page.

    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
      <meta name="viewport" content="width=device-width,initial-scale=1">
    
      <title>Backbone Boilerplate</title>
    
      <!-- Application styles -->
      <link rel="stylesheet" href="/assets/css/index.css">
    </head>
    
    <body>
      <!-- Main container -->
      <div role="main" id="main"></div>
    
      <!-- Application source -->
      <script data-main="app/config" src="/assets/js/libs/require.js"></script>
    </body>
    </html>
    

Require.js is a module and file loader which will help us manage our AMD modules. AMD (which stands for Asynchronous Module Definition) is a specification which details how to break JS down into modules that are loaded in, as needed, at runtime. [Again we turn to Addy Osmani for a good explanation.](http://addyosmani.com/writing-modular-js/)

If you notice this block:

    <!-- Application source -->
      <script data-main="app/config" src="/assets/js/libs/require.js"></script>
    

the `data-main` attribute in the script tag is telling require.js what to load first. In this case it's the `app/config.js` file. If you omit the `js` require will add it for you. If you add the `.js` require will respect the path exactly as it was given. This distinction seems kind of trivial here but later on when you start configuring require with baseUrls and whatnot, it becomes more important.

Let's look at that confg file, shall we?

    // Set the require.js configuration for your application.
    require.config({
      // Initialize the application with the main application file
      deps: ["main"],
    
      paths: {
        // JavaScript folders
        libs: "../assets/js/libs",
        plugins: "../assets/js/plugins",
    
        // Libraries
        jquery: "../assets/js/libs/jquery",
        underscore: "../assets/js/libs/underscore",
        backbone: "../assets/js/libs/backbone",
    
        // Shim Plugin
        use: "../assets/js/plugins/use"
      },
    
      use: {
        backbone: {
          deps: ["use!underscore", "jquery"],
          attach: "Backbone"
        },
    
        underscore: {
          attach: "_"
        }
      }
    });
    

One of the first things you can do with Require is to pass it a configuration object. The config object [can be used for a ton of bootstrap options](http://requirejs.org/docs/api.html#config) like setting paths, requiring other scripts, setting timeouts, etc. The first option we see here is `deps: ["main"]`. We can infer this is telling require to load our main.js file first. But how does it get the path to main.js? From the docs we see that since we haven't defined a `baseUrl` property require is using the path from our `data-main` attribute.

> If no baseUrl is explicitly set in the configuration, the default value will be the location of the HTML page that loads require.js. If a data-main attribute is used, that path will become the baseUrl.

So we know that our baseUrl is `app/` and anything we require will be relative to that.

Next up we have this block:

    paths: {
        // JavaScript folders
        libs: "../assets/js/libs",
        plugins: "../assets/js/plugins",
    
        // Libraries
        jquery: "../assets/js/libs/jquery",
        underscore: "../assets/js/libs/underscore",
        backbone: "../assets/js/libs/backbone",
    
        // Shim Plugin
        use: "../assets/js/plugins/use"
      },
    

The paths property defines paths relative to `baseUrl`. If we say

    require(["libs/module"])
    

require.js will look for this `libs` path and find it in our config file. Most of these make sense till we hit the last line which creates a path for the `use` plugin.

[It seems like `use` was created by Tim Branyen, the author of the Backbone Boilerplate, to help with loading libraries that are non-AMD compliant.](http://tbranyen.com/post/amdrequirejs-shim-plugin-for-loading-incompatible-javascript) Most of the big libraries are currently not AMD compliant (underscore and backbone itself) so this makes sense. So instead of creating a shim for each of those libraries the `use` plugin *should* take care of things for us. We can see how it's used further in the config file:

    use: {
        backbone: {
          deps: ["use!underscore", "jquery"],
          attach: "Backbone"
        },
    
        underscore: {
          attach: "_"
        }
      }
    

Let's start at the bottom so we can see that underscore is defined and mapped to "_". `attach` is going to take whatever library we're defining and attach it to `window`. So underscore will be attached as `window._`. Next we see that backbone is defined and depends on our version of underscore and jquery. Since jquery is AMD compliant we don't need the call to `use!` but we will need it for underscore. Finally backbone is attached to the window as `window.Backbone`.

That covers the configuration file. I'll move on to main.js in the next post.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Awake, Tired, Lazy
- Sleep: 7
- Hunger: 4
- Coffee: 0
