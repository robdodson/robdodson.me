---
title: "A Require.js multi-page shimmed site: How-To"
tags:
  - RequireJS
  - r.js
  - grunt
date: 2012-11-18T21:05:00.000Z
updated: 2015-01-02T08:51:19.000Z
---

I've been working with RequireJS a lot lately and found it really improves the way I manage my code. I had previous experience with Require in the context of some of my Backbone posts, but I'd never used it on a more traditional multi-page site before. The process of setting up Require on a multi-page site can be pretty confusing, so I thought I would put together this tutorial to help out others who might be stuck.

## Overview

*Note: This tutorial assumes you're already familiar with RequireJS and its configuration options. If not, I recommend you [check out the docs](http://requirejs.org/) before proceeding*

## [Grab the Boilerplate](https://github.com/robdodson/requirejs-multipage-shim-boilerplate)

When building single-page apps, many people choose to compile all of their JavaScript into one file before deploying to production. While this may make the initial download size of the page larger, the hope is that it reduces section-to-section http requests, thus making the overall experience feel snappier and more app-like.

When working with a *multi-page site*, compiling everything into one file is probably not a good idea. Since you have no guarantee that the user will visit every page, you may be loading unnecessary JavaScript and slowing down the experience. Do you really need to load all of the JavaScript for the **About** page if the user is just visiting the **Contact** page?

The ideal scenario is one in which each page has its own `main` file that contains page-specific instructions and then a separate (hopefully cached) file that contains all of the commonly used JavaScript libraries.

For example, if you have a page called **About** and a page called **Contact** you would have `main-about.js` and `main-contact.js`. Let's say `main-about.js` and `main-contact.js` both require `'jquery'` and `'underscore'`. We wouldn't want to compile `jquery` and `underscore` into each `main` file because then we're creating unnecessary bloat. Instead, we should create a `common.js` file which contains `jquery` and `underscore` and we'll make sure that this file loads before any of our `main-*` files. Take a look at this diagram to help it sink in:

**OPTIMIZED SCRIPTS**

```
common.js
----------------
js/vendor/jquery.js
js/vendor/underscore.js

About
----------------
js/common.js
js/app/main-about.js

Contact
----------------
js/common.js
js/app/main-contact.js
```

By compiling all of those libaries into `common.js` we're reducing the number of http requests per page. Also, after the first page has loaded, `common.js` should be available from the browser's cache. Now that you get the general concept, let's take a look at an example.

## Examples!

[James Burke](https://twitter.com/jrburke), author of RequireJS, has done a great job putting together some example projects which show how to effectively structure your project so it can be run through the [r.js optimization tool](http://requirejs.org/docs/optimization.html). The one I typically refer to is the [example-multipage-shim.](https://github.com/requirejs/example-multipage-shim) There's also an [example-multipage](https://github.com/requirejs/example-multipage), but I tend to use the shim version because it seems like there's always a few non-AMD scripts that end up in a project.

I've put together my own boilerplate, using Bootstrap 3 and GruntJS, which you guys are free to grab [here.](https://github.com/robdodson/requirejs-multipage-shim-tutorial) The rest of this post will walk through this boilerplate.

## Learn you a boilerplate!

If you've worked with RequireJS on a single page site, you're probably used to defining a script tag that looks like this:

```html
<!--This sets the baseUrl to the "scripts" directory, and
    loads a script that will have a module ID of 'main'-->
<script data-main="scripts/main.js" src="scripts/require.js"></script>
```

The `data-main` attribute is a convenience feature of RequireJS which sets Require's [baseUrl property.](http://requirejs.org/docs/api.html#config-baseUrl) You usually put some configuration options in the `main` file as well, for instance, if you're loading a 3rd party library you might create a [path](http://requirejs.org/docs/api.html#config-paths) so you can easily reference it. Since our boilerplate has different `main-*` files for each page, we're going to put that configuration data into our `common.js` file instead.

*Hold on, I thought you said common.js was where we were going to compile all of our libraries?*

Indeed, you are correct astute reader. But since `common.js` is going to be loaded before any other required modules, why not put our configuration options in it as well? Here's what the `common.js` file from our boilerplate looks like:

```js
//The build will inline common dependencies into this file.

requirejs.config({
  baseUrl: './js',
  paths: {
    'jquery': 'vendor/jquery',
    'bootstrap': 'vendor/bootstrap'
  },
  shim: {
    'bootstrap': ['jquery']
  }
});
```

You'll note that we're using [Twitter Bootstrap](http://twitter.github.com/bootstrap/), which is not AMD compliant out of the box, so we have to `shim` it. In this case it depends on `jquery`, so we list that as its only dependency and we're good.

Aside from `common.js`, you should probably take a look in the `app/models` directory. I've created two models that extend a `BasicModel` in order to illustrate that the `common.js` file isn't only for 3rd party code. `common.js` is really for any code that's going to be used over and over on your site. We'll toss the `BasicModel` into `common.js` during the build process.

## Just hit build already...

O.K., O.K. I can tell you're ready to see some fireworks. Before we hit build, I want to point out the `options.js` file. This is where we tell `r.js` which modules to compile and what each module should include or exclude.

```js
module.exports = {
  appDir: 'www',
  baseUrl: 'js/',
  mainConfigFile: 'www/js/common.js',
  dir: 'www-release',
  modules: [
    {
      name: 'common',
      include: [
        'app/models/basicModel',
        'jquery',
        'bootstrap'
      ]
    },
    {
      name: 'app/main-about',
      exclude: ['common']
    },
    {
      name: 'app/main-contact',
      exclude: ['common']
    }
  ]
};
```

You'll note that first we put together our common module, then we tell the subsequent modules to exclude it. When you tell `r.js` to exclude a module it will find all of the nested dependencies in that module and exclude those as well. This is why we don't need to tell `main-about` and `main-contact` to exclude `bootstrap`. It sees that `bootstrap` is already in `common`, so it knows to exclude it.

If you haven't done so already, now is a good time to do an `npm install`. That should pull down all of the `grunt` dependencies. Speaking of `grunt`, you'll need to install that as well if you've never used it `npm install -g grunt-cli`. You might notice in our `Gruntfile.js`, we are using a number of tasks from the [grunt-contrib](https://github.com/gruntjs/grunt-contrib) library. `grunt-contrib` is a great resource, and I encourage you to spend some time looking through all of the tasks that fall under its umbrella.

O.K. Ready to rock. Just type `grunt` to build, or `grunt.cmd` if you're on Windows (thanks [@stevensacks](http://twitter.com/stevensacks)). When you're finished, you should have a new folder called `www-release`. Check out the `build.txt` file to see where everything ended up.

```
css/bootstrap-responsive.css
----------------
css/bootstrap-responsive.css

css/bootstrap.css
----------------
css/bootstrap.css

css/style.css
----------------
css/style.css

js/common.js
----------------
js/common.js
js/app/models/basicModel.js
js/vendor/bootstrap.js

js/app/main-about.js
----------------
js/app/models/aboutModel.js
js/app/main-about.js

js/app/main-contact.js
----------------
js/app/models/contactModel.js
js/app/main-contact.js
```

If you take a look at the `common.js` file in `www-release`, it should look like a big blob of minified code. That's what we want to see. In this case it contains our `BasicModel`, Twitter Bootstrap, jQuery, and our original configuration code. If you refer to about.html you can see how we control the load order:

```html
<script src="./js/vendor/require.js"></script>
<script type="text/javascript">
// Load common code that includes config,
// then load the app logic for this page.
require(['./js/common'], function (common) {
  // ./js/common.js sets the baseUrl to be ./js/
  // You can ask for 'app/main-about' here instead
  // of './js/app/main-about'
  require(['app/main-about']);
});
</script>
```

First, we bring in RequireJS. Then we load `common.js`, and only *after*`common.js` is loaded do we request the page specific code in `main-about`. If you stick to this structure, you should be able to layer your code so it's easy to manage.

**[Grab the Example Source](https://github.com/robdodson/requirejs-multipage-shim-tutorial)**