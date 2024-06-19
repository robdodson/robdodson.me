---
title: 'A RequireJS multi-page shimmed site: How-To'
description: |
  The process of setting up Require on a multi-page site can be pretty confusing, so I thought I would put together this tutorial to help out others who might be stuck.
tags:
  - RequireJS
  - r.js
  - grunt
date: 2012-11-18T21:05:00.000Z
updated: 2015-01-02T08:51:19.000Z
---

I've been working with RequireJS a lot lately and found it really improves the way I manage my code. I had previous experience with Require in the context of some of my Backbone posts, but I'd never used it on a more traditional multi-page site before. The process of setting up Require on a multi-page site can be pretty confusing, so I thought I would put together this tutorial to help out others who might be stuck.

## Overview

_Note: This tutorial assumes you're already familiar with RequireJS and its configuration options. If not, I recommend you [check out the docs](http://requirejs.org/) before proceeding_

## [Grab the Boilerplate](https://github.com/robdodson/requirejs-multipage-shim-boilerplate)

When building single-page apps, many people choose to compile all of their JavaScript into one file before deploying to production. While this may make the initial download size of the page larger, the hope is that it reduces section-to-section http requests, thus making the overall experience feel snappier and more app-like.

When working with a _multi-page site_, compiling everything into one file is probably not a good idea. Since you have no guarantee that the user will visit every page, you may be loading unnecessary JavaScript and slowing down the experience. Do you really need to load all of the JavaScript for the **About** page if the user is just visiting the **Contact** page?

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

_Hold on, I thought you said common.js was where we were going to compile all of our libraries?_

Indeed, you are correct astute reader. But since `common.js` is going to be loaded before any other required modules, why not put our configuration options in it as well? Here's what the `common.js` file from our boilerplate looks like:

```js
//The build will inline common dependencies into this file.

requirejs.config({
  baseUrl: './js',
  paths: {
    jquery: 'vendor/jquery',
    bootstrap: 'vendor/bootstrap'
  },
  shim: {
    bootstrap: ['jquery']
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
      include: ['app/models/basicModel', 'jquery', 'bootstrap']
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
  require(['./js/common'], function(common) {
    // ./js/common.js sets the baseUrl to be ./js/
    // You can ask for 'app/main-about' here instead
    // of './js/app/main-about'
    require(['app/main-about']);
  });
</script>
```

First, we bring in RequireJS. Then we load `common.js`, and only _after_`common.js` is loaded do we request the page specific code in `main-about`. If you stick to this structure, you should be able to layer your code so it's easy to manage.

**[Grab the Example Source](https://github.com/robdodson/requirejs-multipage-shim-tutorial)**


---
title: Asynchronous Grunt Tasks
tags:
  - grunt
date: 2012-11-29T16:15:00.000Z
updated: 2014-12-31T00:45:31.000Z
---

_Update: Thanks to [@waynemoir](https://twitter.com/waynemoir) for updating the example source to work with Grunt ~0.4._

After my last post [@stevensacks](https://twitter.com/stevensacks) tweeted at me that he was having issues getting node FileSystem commands to work in grunt. After a bit of poking around I noticed that there was no call to grunt's `async` method, which was probably preventing the process from finishing properly. So today's post is a primer on async grunt processes, and how to make sure your node and grunt syntax is setup correctly.

## [Grab the Example Source](https://github.com/robdodson/async-grunt-tasks)

I've provided a simple grunt project at the link above. Take a look at the `tasks` folder and you should see two custom tasks, `grunt-read-write-local.js` and `grunt-read-write-web.js`. The former will read a local file and write its contents to a new file. The latter will request a webpage and write its contents to a static file.

There are two asynchronous APIs at play here (Node's and Grunt's) and it's important to understand both.

In Node an async operation will usually provide a callback, such is the case for [fs.readFile](http://nodejs.org/api/fs.html#fs_fs_readfile_filename_encoding_callback), or it will use an event dispatch, for instance in an http request we listen for the [data event.](http://nodejs.org/api/http.html#http_event_data)

Grunt, on the other hand, uses a token or a kind of promise. You grab a reference to grunt's `done` function and you wait till your node process has finished before calling it. If you take a look at `grunt-read-write-local.js` you can see that we first call the async method to let grunt know it needs to wait:

```js
var done = this.async();
```

and as we finish writing our file we tell grunt that everything completed succesfully and it's ok to carry on:

```js
// Write the contents of the target file to the new location
fs.writeFile(pathToWrite, data, function(err) {
  if (err) throw err;
  console.log(pathToWrite + ' saved!');
  // Tell grunt the async task is complete
  done();
});
```

We do something similar in our `grunt-read-write-web` task but this time we work with [Stream events.](http://nodejs.org/api/stream.html#stream_stream)

```js
// Tell grunt this task is asynchronous.
var done = this.async();

http
  .get(pathToRead, function(res) {
    // Pipe the data from the response stream to
    // a static file.
    res.pipe(fs.createWriteStream(pathToWrite));
    // Tell grunt the async task is complete
    res.on('end', function() {
      console.log(pathToWrite + ' saved!');
      done();
    });
  })
  .on('error', function(e) {
    console.log('Got error: ' + e.message);
    // Tell grunt the async task failed
    done(false);
  });
```

The response returned by an http request implements the [ReadableStream](http://nodejs.org/api/stream.html#stream_readable_stream) interface so it will emit `data` and `end` events. Node Streams have a great feature called [pipes](http://nodejs.org/api/stream.html#stream_stream_pipe_destination_options) which handle the work of consuming data events and writing them to a destination. Sexy :) We still listen for the `end` event coming from our request so we can notify grunt that the process has finished and it can move on.

## [Grab the Example Source](https://github.com/robdodson/async-grunt-tasks)

If you want to test it all out make sure you run `npm install` first to pull down any dependencies. Then kick things off by running `grunt`. I'm thinking my next post might be all about [Streams](http://nodejs.org/api/stream.html#stream_stream) in node since they're such a cool concept. Thanks to [@maxogden](https://twitter.com/maxogden) and [@dominictarr](https://twitter.com/dominictarr) for their great posts on the subject of streams.

- [Node Streams: How do they work? -- Max Ogden](http://maxogden.com/node-streams.html)
- [High Level Style in JavaScript -- Dominic Tarr](https://gist.github.com/2401787)


---
title: "@font-face doesn't work in Shadow DOM"
tags:
  - Web Components
  - Shadow DOM
date: 2013-11-19T17:27:00.000Z
updated: 2015-01-10T17:21:38.000Z
---

I was building custom elements with Polymer the other day, and I thought it would be cool to include Font Awesome for some sweet icon goodness. Everything was going great, until I switched over to Chrome to check my work.

![A screenshot of glyphs showing rectangles instead of the expected icons.](/images/2015/01/polymer-fonts-busted.png 'Something tells me this is not right...')

I did some digging and manged to turn up [this thread](https://groups.google.com/d/msg/polymer-dev/UUwew3x82EU/m9x2qWPi9ZoJ) on the Polymer mailing list.

## The Fix

I had a bit of an "aha moment" when I remembered that the Shadow DOM is encapsulating those styles in a shadow boundary. A workaround is to pull your `@font-face` rules out of the stylesheet for your element, and move them to the top of your import.

_Note to readers: This is old Polymer code but the idea is essentially the same. Move your @ rules into the global scope instead of putting them in the Shadow DOM._

```html
<style>
  @font-face {
    font-family: 'FontAwesome';
    src: url('../fonts/fontawesome-webfont.eot?v=4.0.3');
    src: url('../fonts/fontawesome-webfont.eot?#iefix&v=4.0.3') format('embedded-opentype'), url('../fonts/fontawesome-webfont.woff?v=4.0.3')
        format('woff'), url('../fonts/fontawesome-webfont.ttf?v=4.0.3') format('truetype'), url('../fonts/fontawesome-webfont.svg?v=4.0.3#fontawesomeregular')
        format('svg');
    font-weight: normal;
    font-style: normal;
  }
</style>

<polymer-element name="semantic-ui-icon" noscript>
  <template>
    <link rel="stylesheet" href="./icon.css" />
    <content></content>
  </template>
</polymer-element>
```

I found this approach [in the Polymer documentation](http://www.polymer-project.org/docs/polymer/styling.html#making-styles-global), so I'm hoping it's considered a best practice. **You'll also need to do this if you're using `@-webkit-keyframes` rules**.

I hope that clears things up for some of you who may have been stuck. I know it took me a couple days to come up with this solution, so I thought it best to go ahead and post about it :)


---
title: 'Backbone Boilerplate: Playing with RequireJS'
tags:
  - Chain
  - Backbone
  - Backbone Boilerplate
  - RequireJS
date: 2012-05-18T15:07:00.000Z
updated: 2015-01-02T09:02:26.000Z
---

I want to keep playing with require.js and AMD modules today so I can really internalize the concepts around them. I'm going to go through the examples in [the require documentation](http://requirejs.org/docs/api.html#jsfiles) starting with loading regular scripts and then defining modules and loading those.

Here is our boilerplate HTML. It's a standard HTML5 file which just includes require.js at the bottom of the page.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />

    <title>Require.js Sandbox</title>

    <!-- Application styles -->
    <link rel="stylesheet" href="/assets/css/index.css" />
  </head>

  <body>
    <!-- Main container -->
    <div role="main" id="main"></div>

    <!-- Application source -->
    <script src="/assets/js/libs/require.js"></script>
  </body>
</html>
```

I'm also going to define a file called foo.js which will just console log "Hello World!". To update our HTML we'll add the following script tag after the call to include require.js

```html
<script>
  require(['foo']);
</script>
```

And as expected the console outputs 'Hello World!'. Let's step it up a notch and define a module. Our first module will just return an object literal [like in this example.](http://requirejs.org/docs/api.html#defsimple) It will be a `Person` module with our name and city. We'll place it in an `app` folder in the root of our project. So our stucture looks like this:

```
index.html
|
|_ app/
  |
  |_ person.js
|
|_ assets/
  |
  |_ js/
    |
    |_ libs/
      |
      |_ require.js
```

The `Person` module just needs to implement a define function which takes an object as an argument. It looks like this:

```js
define({
  name: 'Rob Dodson',
  city: 'San Francisco'
});
```

And in our updated index.html we're going to require that module.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />

    <title>Require.js Sandbox</title>

    <!-- Application styles -->
    <link rel="stylesheet" href="/assets/css/index.css" />
  </head>

  <body>
    <!-- Main container -->
    <div role="main" id="main"></div>

    <!-- Application source -->
    <script src="/assets/js/libs/require.js"></script>
    <script>
      require(['app/person'], function(person) {
        console.log(person.name);
        console.log(person.city);
      });
    </script>
  </body>
</html>
```

Opening up that page in the browser should give us the proper output in the console.

### AMD modules for dummies

Let's stop here for a moment to understand what's going on. In one file we implemented a `define` function and in another place we implemented a `require` function. In the most basic sense this is all we really need to do to start using AMD. I think the concept of javascript modules is really weird for most folks but if you're coming from a language like Java or Flash just think of define and require as two different interfaces that have to be implemented in order to recreate the `import` functionality that you're used to. Require.js is going to make sure everything loads properly so long as we stick to this convention.

If you're coming from more of a design background and you're used to having one big javascript file think of these modules as a way to break off pieces of code which you might otherwise put into separate script files. And I'm not talking one or two script files, I'm talking like 20 or 30. You could try to manage loading all of those dependencies yourself but that will be challenging. If you are building a blog then this probably isn't a big deal for you. In that case a few included js files is fine. But if you're trying to build a responsive web app for mobile then you're going to want to only load the bits of code you absolutely need. If a page doesn't require 90% of your JS then don't waste the time downloading it over a shitty AT&T connection.

Ok let's write a module that's a bit more realistic. We'll use a function to return our object so it's kind of like a constructor.

```js
'use strict';

define(function() {
  var estimated_age = 99 + 1;
  var spookySaying = 'I vant to suck your blooood!';

  return {
    name: 'Dracula',
    home: 'Florida',
    age: estimated_age,
    saySomethingSpooky: function() {
      console.log(spookySaying);
    }
  };
});
```

This is a simple monster object. Notice that we build a variable called `estimated_age` right before defining our object literal. We then return this variable. If we ask for the monster's age it will return this value. It's worth noting that this makes the `estimated_age` variable private since it only lives in the scope of the anonymous function returning our object literal. We've also got a method, `saySomethingSpooky` which will print out another private variable `spookySaying`. Wow it's _almost_ the JavaScript classes I've always dreamed of! Before you go thinking that remember that modules are not instanceable, meaning, when you load in a module it works like a [Singleton](http://en.wikipedia.org/wiki/Singleton_pattern) almost. You can't go monster.new() all over the place.. it just doesn't work that way. Don't get disouraged though, this is still pretty cool so let's continue...

Next up is a module with dependencies. We'll make the monster depend on his coffin.

```js
'use strict';

define(function() {
  var color = 'Blackest black';

  return {
    color: color,
    open: function() {
      console.log('*creeeeeek*');
    }
  };
});

('use strict');

define(['./coffin'], function(coffin) {
  var estimated_age = 99 + 1;
  var spookySaying = 'I vant to suck your blooood!';

  return {
    name: 'Dracula',
    home: 'Florida',
    age: estimated_age,
    saySomethingSpooky: function() {
      console.log(spookySaying);
    },
    goToSleep: function() {
      console.log('Time for bed!');
      coffin.open();
    }
  };
});
```

```html
<script data-main="" src="/assets/js/libs/require.js"></script>
<script>
  require(['app/monster'], function(monster) {
    monster.saySomethingSpooky();
    monster.goToSleep();
  });
</script>
```

You can see that we've created a dependency for our monster, it has to load the coffin module before it's ready to be loaded itself. Otherwise it won't be able to run `goToSleep()` properly. Require.js will sort all of this out so long as we declare our dependencies as the first argument to the `define` function.

We aren't limited to objects though, we can also return functions (which are objects in their own right). For instance if we wanted to define a helper module that greets people we could do something like this:

```js
'use strict';

define(function() {
  return function(name) {
    return 'Why hello, ' + name;
  };
});
```

then in our index we'll just use the `greet` function as if it were globally available.

```js
require(['app/greet'], function(greet) {
  console.log(greet('Rob'));
});
```

bear in mind that each module requires an http request to load it so you don't want to go overboard defining helper function modules. Note the extra http request in the profiler which loads greet.js.

Ok that's it for today. I'll try to continue on Saturday!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)


---
title: 'Backbone Events: Adding Views to the DOM'
tags:
  - Chain
  - Backbone
  - Backbone Events
  - jQuery
  - jQuery Plugins
date: 2012-05-24T14:23:00.000Z
updated: 2015-01-02T09:00:51.000Z
---

Today I want to figure out what kind of events to use when one of my views is added to the DOM. This can have a lot of ramifications for positioning elements around the view and setting up properties on the view itself.

### View Events and the DOM

After looking around for a bit I've found this [list of the events that Backbone can dispatch.](http://documentcloud.github.com/backbone/#FAQ-events) Nothing in there about render or adding elements to the DOM :(

More searching reveals that almost everyone points to the [livequery plugin for jQuery.](http://docs.jquery.com/Plugins/livequery) Livequery seems like a mostly deprecated plugin since jQuery has both `.live()` and `.delegate()` methods now. The one exception is that livequery will fire a callback when an element is created.

Another alternative is to fire a custom event from my View's render method. While this does seem cleaner than using a plugin unfortunately we might call render over and over again. A middle of the road solution would be to use `.one()` to bind to the first render event.

In my mind I would like every Backbone View to extend a base class which dispatches a custom `addedToDOM` event and `removedFromDOM` event. I'm not sure what the performance cost of using livequery to do this is but let's write it up and maybe we can do a jsPerf later.

### Load a jQuery plugin with AMD

Let's download livequery [from the git repo.](https://github.com/brandonaaron/livequery) Now that we have it we're in another little dilemma. The boilerplate loads jQuery like an AMD module...so how do you use a jQuery plugin with AMD?

It's very possible this is not the intended method but here's how I've gone about solving the problem. Since require.js is only going to load stuff if we specify it as a dependency then we'll need to request the plugin just like any other module. If we put the plugin in our `assets/js/plugins` folder then we'll already have a path to `plugins` provided by `config.js`.

```js
require.config({
  // Initialize the application with the main application file
  deps: ['main'],

  paths: {
    // JavaScript folders
    libs: '../assets/js/libs',
    plugins: '../assets/js/plugins', // <---- !!! look here!

    // Libraries
    jquery: '../assets/js/libs/jquery',
    underscore: '../assets/js/libs/underscore',
    backbone: '../assets/js/libs/backbone',

    // Shim Plugin
    use: '../assets/js/plugins/use'
  },

  use: {
    backbone: {
      deps: ['use!underscore', 'jquery'],
      attach: 'Backbone'
    },

    underscore: {
      attach: '_'
    }
  }
});
```

Then we can load livequery as if it were any other module. This might seem odd because a dependency gets passed to our pseudo-constructor as an argument:

```js
define([
  "namespace",

  // Libs
  "use!backbone",

  // Modules

  // Plugins
  "plugins/jquery.livequery"
],

function(namespace, Backbone, livequery) { // <-- see how livequery is passed
  ...
}
```

But we're not going to use that argument. It's just there to make sure that `jquery.livequery.js` gets added to the page. We'll ignore it and use livequery via jquery instead, like so:

```js
$('#sections').livequery(
  function() {
    console.log('sections added to DOM!');
  },
  function() {
    console.log('sections removed from DOM!');
  }
);
```

Keep in mind that require.js and AMD are just tacking the script elements onto the page. Requiring our plugin in this fashion is no different than tacking a `script` onto the HTML at runtime.

Here's my example.js file [from the last post](http://robdodson.me/blog/2012/05/23/how-do-you-switch-between-views-in-backbone/), now using livequery to listen for when the element is added to and removed from the DOM.

```js
define([
  'namespace',

  // Libs
  'use!backbone',

  // Modules

  // Plugins
  'plugins/jquery.livequery'
], function(namespace, Backbone, livequery) {
  // Create a new module
  var Example = namespace.module();

  // Example extendings
  Example.Model = Backbone.Model.extend({
    /* ... */
  });
  Example.Collection = Backbone.Collection.extend({
    /* ... */
  });
  Example.Router = Backbone.Router.extend({
    /* ... */
  });

  // This will fetch the tutorial template and render it.
  Example.Views.Tutorial = Backbone.View.extend({
    template: 'app/templates/example.html',

    render: function(done) {
      var view = this;

      // Fetch the template, render it to the View element and call done.
      namespace.fetchTemplate(this.template, function(tmpl) {
        view.el.innerHTML = tmpl();

        // If a done function is passed, call it with the element
        if (_.isFunction(done)) {
          done(view.el);
        }
      });
    }
  });

  Example.Views.Left = Backbone.View.extend({
    tagName: 'div',
    id: 'left-container',
    className: 'container'
  });

  Example.Views.Middle = Backbone.View.extend({
    tagName: 'div',
    id: 'middle-container',
    className: 'container'
  });

  Example.Views.Right = Backbone.View.extend({
    tagName: 'div',
    id: 'right-container',
    className: 'container'
  });

  Example.Views.Sections = Backbone.View.extend({
    tagName: 'div',
    id: 'sections',

    leftView: undefined,
    middleView: undefined,
    rightView: undefined,

    events: {
      'click .container': 'onChildClicked'
    },

    initialize: function() {
      this.leftView = new Example.Views.Left();
      this.middleView = new Example.Views.Middle();
      this.rightView = new Example.Views.Right();

      this.$el.append(this.leftView.render().el);
      this.$el.append(this.middleView.render().el);
      this.$el.append(this.rightView.render().el);

      $('#sections').livequery(
        function() {
          console.log('sections added to DOM!');
        },
        function() {
          console.log('sections removed from DOM!');
        }
      );
    },

    // We should do this work with events instead of methods
    setInitialPosition: function() {
      this.$el.css({left: $(window).width() / 2 - this.$el.width() / 2});
    },

    onChildClicked: function($e) {
      var $target = $($e.target);

      switch ($e.target.id) {
        case 'left-container':
          this.$el.animate({
            left: $(window).width() / 2 - $target.width() / 2
          });
          break;

        case 'middle-container':
          this.$el.animate({
            left: $(window).width() / 2 - this.$el.width() / 2
          });
          break;

        case 'right-container':
          this.$el.animate({
            left: $(window).width() / 2 - this.$el.width() + $target.width() / 2
          });
          break;
      }
    }
  });

  // Required, return the module for AMD compliance
  return Example;
});
```

I tried this out by adding and removing the `Example.Sections` view from the DOM and both console logs fired, so yeah, awesome! In lieu of creating a base class and adding an addedToDOM and removedFromDOM event we can do something like this to achieve that effect:

```js
initialize: function() {
  this.leftView = new Example.Views.Left();
  this.middleView = new Example.Views.Middle();
  this.rightView = new Example.Views.Right();

  this.$el.append(this.leftView.render().el);
  this.$el.append(this.middleView.render().el);
  this.$el.append(this.rightView.render().el);

  _.bindAll(this); // make sure all the methods of our object have the right 'this'

  $('#sections').livequery(this.onAddedToDOM, this.onRemovedFromDOM);
},

onAddedToDOM: function() {
  console.log('added to DOM!');
},

onRemovedFromDOM: function() {
  console.log('removed from DOM!');
},
```

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Awake, Hot
- Sleep: 5
- Hunger: 5
- Coffee: 0


---
title: 'Backbone Events: Framework Communication'
tags:
  - Chain
  - Backbone
  - Backbone Events
date: 2012-05-25T15:01:00.000Z
updated: 2014-12-30T07:53:27.000Z
---

I want to figure out how to communicate on a framework level within Backbone. Coming from Flash and [RobotLegs](http://www.robotlegs.org/) I'm used to a few MVC conventions that work very well as far as event dispatching goes. In RobotLegs you typically have a framework wide eventDispatcher that anyone can tune into. In a nutshell your View will trigger an event, for instance a user clicking a button, and that will get dispatched to interested framework actors. These can be other Views or, more likely, they can be Commands. The Commands are like single use actions tied directly to events. Think of it like binding every public method of your controller to an event. The Commands will typically effect models, changing them in some way, and the Models will dispatch an event that the Views listen for to update themselves.

Backbone works differently in that Views are often tied directly to their models like so:

```js
// This is a Model object
var doc = Documents.first();

// This is a View object with model reference
new DocumentRow({
  model: doc,
  id: 'document-row-' + doc.id
});
```

When you use this approach it's trivial to tell the view to listen to the model's change event and then call `view.render()`. Essentially you are munging some of a Controller's responsibilities into the View. That's all well and good but let's say we want to dispatch an event from one view which will affect other views and actors. This event has nothing to do with a model, maybe it's just an animation of some kind that others need to know about. So how do we go about this?

### Communicating between Views in Backbone

To facilitate this communication we're going to use the `app` object that [Backbone Boilerplate](https://github.com/tbranyen/backbone-boilerplate) creates for us. If you look in the `namespace.js` file that comes with the boilerplate you should see a line like this way down at the bottom:

```js
app: _.extend({}, Backbone.Events);
```

If you're not familiar with [Underscore.js's extend method](http://underscorejs.org/#extend) it basically takes all of the properties and functions of one object and copies them onto another. If you're coming from a language that supports classical inheritence this should feel familiar. In the above example it's creating a new empty object (app), and extending/inheriting from the Backbone.Events object. This means that the `app` property of the `namespace` module is basically one big event dispatcher.

So let's create two very simple views in a module called `Chatty`. One will be `Subject` and the other `Observer`. When we click the Subject we want it to dispatch an event that any framework actor can tune into. We'll call this event `clicked:subject`. When the Observer hears the `clicked:subject` event we want it to replace its html content with whatever message is sent along.

```js
define([
  "namespace", // <-- see I'm bringing in the namespace module

  // Libs
  "use!backbone"

  // Modules

  // Plugins

],

function(namespace, Backbone) { // <-- make sure to pass namespace as an argument

  // Create a new module
  var Chatty = namespace.module();

  Chatty.Views.Subject = Backbone.View.extend({
    tagName: 'div',
    className: 'subject',
    events: {
      'click': 'onClick'
    },
    initialize: function() {
      this.render();
      this.$el.html("I'm the Subject. Everyone listen up!");
    },
    onClick: function(e) {
      namespace.app.trigger('clicked:subject', 'watch it, buster!'); // <-- trigger a framework event
    }
  });

  Chatty.Views.Observer = Backbone.View.extend({
    tagName: 'div',
    className: 'observer',
    initialize: function() {
      this.render();
      this.$el.html("I'm the Observer. Quietly waiting...");

      namespace.app.on('clicked:subject', this.onSubjectClicked, this); <-- listen for framework events
    },
    onSubjectClicked: function(message) {
      this.$el.html("I heard the Subject say... " + message);
    }
  });

  // Required, return the module for AMD compliance
  return Chatty;

});
```

In our main.js file we're just going to append those two views to the DOM whenever someone hits our route:

```js
require([
  "namespace",

  // Libs
  "jquery",
  "use!backbone",

  // Modules
  "modules/chatty"
],

function(namespace, $, Backbone, Chatty) {
  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "chatty": "chatty"
    },

    chatty: function() {
      var subject = new Chatty.Views.Subject();
      var observer = new Chatty.Views.Observer();
      $("#main").append(subject.el);
      $("#main").append(observer.el);
    }
  });
...
}
```

And there you have it. When we click on `Subject` it should replace the content in `Observer` like so:
![The Observer hears the Subject](/images/2014/12/subject_observer.png)

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Excited, Rested
- Sleep: 6
- Hunger: 4
- Coffee: 0


---
title: Building a Countdown Timer with Socket.io pt. 2
tags:
  - Chain
  - Node
  - Express
  - Socket.io
date: 2012-06-06T14:47:00.000Z
updated: 2015-01-02T08:57:08.000Z
---

[Continuing from yesterday's post](http://robdodson.me/blog/2012/06/05/building-a-countdown-timer-with-socket-dot-io/) we started out with a rather crude timer and today I want to upgrade it to a full fledged model, `Stopwatch`, which dispatches events for the view to hook on to.

- [Getting Started](http://robdodson.me/blog/2012/06/04/deploying-your-first-node-dot-js-and-socket-dot-io-app-to-heroku/)
- [Click here for part 1.](http://robdodson.me/blog/2012/06/05/building-a-countdown-timer-with-socket-dot-io/)
- [Click here for part 3.](http://robdodson.me/blog/2012/06/07/building-a-countdown-timer-with-socket-dot-io-pt-3/)

### Extend Node's EventEmitter

We want to extend Node's EventEmitter object in order for our Stopwatch to dispatch its tick events. [Following this great article by Jan Van Ryswyck](http://elegantcode.com/2011/02/21/taking-baby-steps-with-node-js-implementing-events/) I've arrived at something that looks like this:

```js
var util = require('util'),
  events = require('events');

function Stopwatch() {
  if (false === this instanceof Stopwatch) {
    return new Stopwatch();
  }

  events.EventEmitter.call(this);

  var self = this;
  setInterval(function() {
    self.emit('tick');
  }, 1000);
}

util.inherits(Stopwatch, events.EventEmitter);
module.exports = Stopwatch;
```

In our app.js we'll need to `require` our new Stopwatch module, create an instance of it, and add a listener for the tick event. Here's the abbreviated version:

```js
var Stopwatch = require('./models/stopwatch');

...

var stopwatch = new Stopwatch();
stopwatch.on('tick', function() {
    console.log('stopwatch tick!');
});
```

If all goes well when you restart your server you should see 'stopwatch tick!' arriving every second.

### Add to the prototype the RIGHT way

This next part is what tripped me up the other night and since it was rather late in the evening I was too out of it to figure out what was going wrong.

To recap, we've created a model called `Stopwatch`, we gave it a constructor function and we told it to extend `events.EventEmitter`.

Now I want to add a new method to my stopwatch but here's where you might run into a real gotcha. If you're like me you'd probably add it like this:

```js
var util = require('util'),
  events = require('events');

function Stopwatch() {
  if (false === this instanceof Stopwatch) {
    return new Stopwatch();
  }

  events.EventEmitter.call(this);
}

Stopwatch.prototype.foobar = function() {
  console.log('foobar!');
};

util.inherits(Stopwatch, events.EventEmitter);

module.exports = Stopwatch;
```

Aaaand your app would explode like this:

```
[ERROR] TypeError
TypeError: Object #<Stopwatch> has no method 'foobar'
```

That's because we can only add new methods **after calling `util.inherits`.** The proper way would look like this:

```js
var util = require('util'),
  events = require('events');

function Stopwatch() {
  if (false === this instanceof Stopwatch) {
    return new Stopwatch();
  }

  events.EventEmitter.call(this);
}

util.inherits(Stopwatch, events.EventEmitter);

Stopwatch.prototype.foobar = function() {
  console.log('foobar!');
};

module.exports = Stopwatch;
```

This is also the approach [taken in the documentation.](http://nodejs.org/api/util.html#util_util_inherits_constructor_superconstructor) Guess it pays to rtfm :D

Here's what my final `Stopwatch` looks like:

```js
var util = require('util'),
  events = require('events');
_ = require('underscore');

// ---------------------------------------------
// Constructor
// ---------------------------------------------
function Stopwatch() {
  if (false === this instanceof Stopwatch) {
    return new Stopwatch();
  }

  this.hour = 3600000;
  this.minute = 60000;
  this.second = 1000;
  this.time = this.hour;
  this.interval = undefined;

  events.EventEmitter.call(this);

  // Use Underscore to bind all of our methods
  // to the proper context
  _.bindAll(this, 'start', 'stop', 'reset', 'onTick');
}

// ---------------------------------------------
// Inherit from EventEmitter
// ---------------------------------------------
util.inherits(Stopwatch, events.EventEmitter);

// ---------------------------------------------
// Methods
// ---------------------------------------------
Stopwatch.prototype.start = function() {
  console.log('Starting Stopwatch!');
  // note the use of _.bindAll in the constructor
  // with bindAll we can pass one of our methods to
  // setInterval and have it called with the proper 'this' value
  this.interval = setInterval(this.onTick, this.second);
  this.emit('start');
};

Stopwatch.prototype.stop = function() {
  console.log('Stopping Stopwatch!');
  if (this.interval) {
    clearInterval(this.interval);
    this.emit('stop');
  }
};

Stopwatch.prototype.reset = function() {
  console.log('Resetting Stopwatch!');
  this.time = this.hour;
  this.emit('reset');
};

Stopwatch.prototype.onTick = function() {
  var remainder = this.time,
    numHours,
    numMinutes,
    numSeconds,
    output = '';

  if (this.time === 0) {
    this.stop();
    return;
  }

  numHours = String(parseInt(remainder / this.hour, 10));
  remainder -= this.hour * numHours;

  numMinutes = String(parseInt(remainder / this.minute, 10));
  remainder -= this.minute * numMinutes;

  numSeconds = String(parseInt(remainder / this.second, 10));

  output = _.map([numHours, numMinutes, numSeconds], function(str) {
    if (str.length === 1) {
      str = '0' + str;
    }
    return str;
  }).join(':');

  this.emit('tick', output);
  this.time -= this.second;
};

// ---------------------------------------------
// Export
// ---------------------------------------------
module.exports = Stopwatch;
```

And here's how I'm using it in `app.js`

```js
var Stopwatch = require('./models/stopwatch');

...

var stopwatch = new Stopwatch();
stopwatch.on('tick', function(time) {
    console.log('tick: ' + time);
});
stopwatch.start();
```

Running the above should give you something like this in your console:

```
tick: 01:00:00
tick: 00:59:59
tick: 00:59:58
tick: 00:59:57
```

Ok that's it for today. Tomorrow we'll connect all this goodness to a View. If you have questions or feedback feel free to leave a comment. Thanks! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired
- Sleep: 6
- Hunger: 4
- Coffee: 0


---
title: Building a Countdown Timer with Socket.io pt. 3
tags:
  - Chain
  - Node
  - Express
  - Socket.io
date: 2012-06-08T02:41:00.000Z
updated: 2015-01-02T08:56:38.000Z
---

Today's the day we wrap up our countdown timer and deploy it to Heroku. But before we launch this puppy we need to clean house a little and spice up the visual appeal.

- [Getting Started](http://robdodson.me/blog/2012/06/04/deploying-your-first-node-dot-js-and-socket-dot-io-app-to-heroku/)
- [Click here for part 1.](http://robdodson.me/blog/2012/06/05/building-a-countdown-timer-with-socket-dot-io/)
- [Click here for part 2.](http://robdodson.me/blog/2012/06/06/building-a-countdown-timer-with-socket-dot-io-pt-2/)

### Refactoring the Stopwatch

While the Stopwatch from our last post worked OK there are a spots that can be improved. For starters I'd like to separate the formatting of the time from the `onTick` method. Mainly because I want to be able to pull the current time out whenever someone hits reset or a new connection is made. Here's how I updated Stopwatch to accomodate these changes:

```js
var util = require('util'),
  events = require('events');
_ = require('underscore');

// ---------------------------------------------
// Constructor
// ---------------------------------------------
function Stopwatch() {
  if (false === this instanceof Stopwatch) {
    return new Stopwatch();
  }

  this.hour = 3600000;
  this.minute = 60000;
  this.second = 1000;
  this.time = this.hour;
  this.interval = undefined;

  events.EventEmitter.call(this);

  // Use Underscore to bind all of our methods
  // to the proper context
  _.bindAll(this);
}

// ---------------------------------------------
// Inherit from EventEmitter
// ---------------------------------------------
util.inherits(Stopwatch, events.EventEmitter);

// ---------------------------------------------
// Methods
// ---------------------------------------------
Stopwatch.prototype.start = function() {
  if (this.interval) {
    return;
  }

  console.log('Starting Stopwatch!');
  // note the use of _.bindAll in the constructor
  // with bindAll we can pass one of our methods to
  // setInterval and have it called with the proper 'this' value
  this.interval = setInterval(this.onTick, this.second);
  this.emit('start:stopwatch');
};

Stopwatch.prototype.stop = function() {
  console.log('Stopping Stopwatch!');
  if (this.interval) {
    clearInterval(this.interval);
    this.interval = undefined;
    this.emit('stop:stopwatch');
  }
};

Stopwatch.prototype.reset = function() {
  console.log('Resetting Stopwatch!');
  this.time = this.hour;
  this.emit('reset:stopwatch', this.formatTime(this.time));
};

Stopwatch.prototype.onTick = function() {
  this.time -= this.second;

  var formattedTime = this.formatTime(this.time);
  this.emit('tick:stopwatch', formattedTime);

  if (this.time === 0) {
    this.stop();
  }
};

Stopwatch.prototype.formatTime = function(time) {
  var remainder = time,
    numHours,
    numMinutes,
    numSeconds,
    output = '';

  numHours = String(parseInt(remainder / this.hour, 10));
  remainder -= this.hour * numHours;

  numMinutes = String(parseInt(remainder / this.minute, 10));
  remainder -= this.minute * numMinutes;

  numSeconds = String(parseInt(remainder / this.second, 10));

  output = _.map([numHours, numMinutes, numSeconds], function(str) {
    if (str.length === 1) {
      str = '0' + str;
    }
    return str;
  }).join(':');

  return output;
};

Stopwatch.prototype.getTime = function() {
  return this.formatTime(this.time);
};

// ---------------------------------------------
// Export
// ---------------------------------------------
module.exports = Stopwatch;
```

I also namespaced the events so they would be easier to read when mixed in with the socket.io events. During the refactoring I noticed there were a lot of actors listening to, emitting or calling something like `start`. I'm not sure if there are common socket.io namespacing patterns but I based what I did on Backbone events and I think it works out well enough.

### Cleaning up app.js

These changes to `Stopwatch` also require us to update the `app.js` that uses it.

```js
var stopwatch = new Stopwatch();
stopwatch.on('tick:stopwatch', function(time) {
  io.sockets.emit('time', {time: time});
});

stopwatch.on('reset:stopwatch', function(time) {
  io.sockets.emit('time', {time: time});
});

stopwatch.start();

io.sockets.on('connection', function(socket) {
  io.sockets.emit('time', {time: stopwatch.getTime()});

  socket.on('click:start', function() {
    stopwatch.start();
  });

  socket.on('click:stop', function() {
    stopwatch.stop();
  });

  socket.on('click:reset', function() {
    stopwatch.reset();
  });
});
```

I've made it so whenever a user resets or connects to the page they get the latest time. And of course whenever the stopwatch ticks they'll get an update as well. I think it might also be nice if pressing start dispatched the latest time, I should probably add that... ;)

### Tweaking the views

Lastly I've updated the view by adding some more buttons to correspond to the start/stop and reset methods. I've also wrapped everything in a container to make it easier to position:

```html
<div id="wrapper">
  <div id="countdown"></div>
  <button id="start" class="thoughtbot">Start</button>
  <button id="stop" class="thoughtbot">Stop</button>
  <button id="reset" class="thoughtbot">Reset</button>
</div>
```

```js
var socket = io.connect(window.location.hostname);

socket.on('time', function(data) {
  $('#countdown').html(data.time);
});

$('#start').click(function() {
  socket.emit('click:start');
});

$('#stop').click(function() {
  socket.emit('click:stop');
});

$('#reset').click(function() {
  socket.emit('click:reset');
});
```

Also notice that the socket events coming from the view have been namespaced as well.

### Improving the type

Next up I want to enhance the type using [one of Google's webfonts.](http://www.google.com/webfonts) I chose a font called `Black Ops One` which seemed appropriately militaristic. Setting it up was as easy as adding one line to my `layout.ejs`

```html
<link
  href="http://fonts.googleapis.com/css?family=Black+Ops+One"
  rel="stylesheet"
  type="text/css"
/>
```

and my `main.css` file:

```css
#countdown {
  font-family: 'Black Ops One', cursive;
  font-size: 90px;
}
```

Finally I chose to use some funky buttons from [Chad Mazzola's CSS3 Buttons project.](https://github.com/ubuwaits/css3-buttons) I went with the Thoughtbot buttons since they were red and awesome. The styles are pretty long so I'm just going to post my entire `main.css` for you to see:

```css
#wrapper {
  width: 475px;
  height: 171px;
  margin: 100px auto;
}

#countdown {
  font-family: 'Black Ops One', cursive;
  font-size: 90px;
}

button.thoughtbot {
  background-color: #ee432e;
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, #ee432e),
    color-stop(50%, #c63929),
    color-stop(50%, #b51700),
    color-stop(100%, #891100)
  );
  background-image: -webkit-linear-gradient(
    top,
    #ee432e 0%,
    #c63929 50%,
    #b51700 50%,
    #891100 100%
  );
  background-image: -moz-linear-gradient(top, #ee432e 0%, #c63929 50%, #b51700 50%, #891100 100%);
  background-image: -ms-linear-gradient(top, #ee432e 0%, #c63929 50%, #b51700 50%, #891100 100%);
  background-image: -o-linear-gradient(top, #ee432e 0%, #c63929 50%, #b51700 50%, #891100 100%);
  background-image: linear-gradient(top, #ee432e 0%, #c63929 50%, #b51700 50%, #891100 100%);
  border: 1px solid #951100;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  -webkit-box-shadow: inset 0px 0px 0px 1px rgba(255, 115, 100, 0.4), 0 1px 3px #333333;
  -moz-box-shadow: inset 0px 0px 0px 1px rgba(255, 115, 100, 0.4), 0 1px 3px #333333;
  box-shadow: inset 0px 0px 0px 1px rgba(255, 115, 100, 0.4), 0 1px 3px #333333;
  color: #fff;
  font: bold 20px 'helvetica neue', helvetica, arial, sans-serif;
  line-height: 1;
  padding: 12px 0 14px 0;
  text-align: center;
  text-shadow: 0px -1px 1px rgba(0, 0, 0, 0.8);
  width: 150px;
}

button.thoughtbot:hover {
  background-color: #f37873;
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, #f37873),
    color-stop(50%, #db504d),
    color-stop(50%, #cb0500),
    color-stop(100%, #a20601)
  );
  background-image: -webkit-linear-gradient(
    top,
    #f37873 0%,
    #db504d 50%,
    #cb0500 50%,
    #a20601 100%
  );
  background-image: -moz-linear-gradient(top, #f37873 0%, #db504d 50%, #cb0500 50%, #a20601 100%);
  background-image: -ms-linear-gradient(top, #f37873 0%, #db504d 50%, #cb0500 50%, #a20601 100%);
  background-image: -o-linear-gradient(top, #f37873 0%, #db504d 50%, #cb0500 50%, #a20601 100%);
  background-image: linear-gradient(top, #f37873 0%, #db504d 50%, #cb0500 50%, #a20601 100%);
  cursor: pointer;
}

button.thoughtbot:active {
  background-color: #d43c28;
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, #d43c28),
    color-stop(50%, #ad3224),
    color-stop(50%, #9c1500),
    color-stop(100%, #700d00)
  );
  background-image: -webkit-linear-gradient(
    top,
    #d43c28 0%,
    #ad3224 50%,
    #9c1500 50%,
    #700d00 100%
  );
  background-image: -moz-linear-gradient(top, #d43c28 0%, #ad3224 50%, #9c1500 50%, #700d00 100%);
  background-image: -ms-linear-gradient(top, #d43c28 0%, #ad3224 50%, #9c1500 50%, #700d00 100%);
  background-image: -o-linear-gradient(top, #d43c28 0%, #ad3224 50%, #9c1500 50%, #700d00 100%);
  background-image: linear-gradient(top, #d43c28 0%, #ad3224 50%, #9c1500 50%, #700d00 100%);
  -webkit-box-shadow: inset 0px 0px 0px 1px rgba(255, 115, 100, 0.4);
  -moz-box-shadow: inset 0px 0px 0px 1px rgba(255, 115, 100, 0.4);
  box-shadow: inset 0px 0px 0px 1px rgba(255, 115, 100, 0.4);
}
```

![Defcon final](/images/2014/12/defcon_final.png)

SWEEEEEEET! I'll go ahead and host it on Heroku but first I have to find out what the cost of leaving Node.js/Socket.io running indefinitely would be. Till then you should be able to get a local version of all this working or [just clone the Github repo](https://github.com/robdodson/defcon) and now you too can have your very own Defcon stopwatch. enjoy! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Lazy
- Sleep: 6
- Hunger: 3
- Coffee: 1


---
title: Building a Countdown Timer with Socket.io
tags:
  - Chain
  - Node
  - Express
  - Socket.io
date: 2012-06-05T15:07:00.000Z
updated: 2015-01-02T08:57:25.000Z
---

Yesterday I put together a very simple Node/Socket.io application and showed how to deploy it to Heroku. Today I'm going to keep going with that app to see if I can get the functionality that I want. The app is a basic stopwatch so that shouldn't be too hard. If you want to catch up [checkout yesterday's article](http://robdodson.me/blog/2012/06/04/deploying-your-first-node-dot-js-and-socket-dot-io-app-to-heroku/) which explains setting everything up.

- [Getting Started](http://robdodson.me/blog/2012/06/04/deploying-your-first-node-dot-js-and-socket-dot-io-app-to-heroku/)
- [Click here for part 2.](http://robdodson.me/blog/2012/06/06/building-a-countdown-timer-with-socket-dot-io-pt-2/)
- [Click here for part 3.](http://robdodson.me/blog/2012/06/07/building-a-countdown-timer-with-socket-dot-io-pt-3/)

### Countdown

Just to get the ball rolling I'm going to write a little code in my `app.js` file right at the bottom to setup a very crude counter.

```js
var countdown = 1000;
setInterval(function() {
  countdown--;
  io.sockets.emit('timer', {countdown: countdown});
}, 1000);

io.sockets.on('connection', function(socket) {
  socket.on('reset', function(data) {
    countdown = 1000;
    io.sockets.emit('timer', {countdown: countdown});
  });
});
```

Elsewhere in my client-side js I'm going to listen for the `timer` event and update my DOM elements.

```js
var socket = io.connect(window.location.hostname);

socket.on('timer', function(data) {
  $('#counter').html(data.countdown);
});

$('#reset').click(function() {
  socket.emit('reset');
});
```

You'll also need to update your index.ejs file so it reads like this:

```html
<div id="counter"></div>
<button id="reset">Reset!</button>
```

Every second we'll decrement our countdown variable and broadcast its new value. If a client sends us a `reset` event we'll restart the timer and immediately broadcast the update to anyone connected. I noticed that since I'm using `xhr-polling` it can sometimes take a while for the timer to show up in my browser so keep that in mind.

While this implementation isn't pretty it does get us a little bit further down the road. Unfortunately I've been tripped up by a bunch of Node's module issues so I have to cut tonight's post short :\

Hopefully better luck tomorrow. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Sedate, Sleepy
- Sleep: 5
- Hunger: 4
- Coffee: 0


---
title: Building a Responsive Grid with Foundation
tags:
  - Chain
  - CSS
  - Foundation
date: 2012-06-11T03:24:00.000Z
updated: 2014-12-30T23:37:32.000Z
exclude: true
---

Yesterday I introduced [SMACSS](http://smacss.com/) and did my best to give a high level overview of its main ideas. I'm using it on my current project and I'm really enjoying it so far. There's just something about having things codified by someone with more experience that gives me immense comfort. When I feel confused I can refer back to those docs and sort out what would be the best path. Standing on the shoulders of giants and all that jazz ;)

Today I want to talk about a CSS framework called [Foundation](http://foundation.zurb.com/), written by the team at [ZURB.](http://www.zurb.com/) Unlike SMACSS, Foundation is an actual library of modular code ready to help you quickly prototype your project. The two aren't mutually exclusive. You might think of Foundation as a shiny new toolbox but SMACSS is going to be your 'How To' manual, helping you implement all the new goodes that Foundation has to offer.

I'm sure many of you have heard of [Bootstrap](http://twitter.github.com/bootstrap/) which is very similar and somewhat more popular than Foundation. I chose to use Foundation for this post because Bootstrap feels bloated to me, and I also didn't want to have to do everything in [LESS.](http://lesscss.org/) Don't get me wrong, I loves me some LESS and some [SASS](http://sass-lang.com/), but not everyone is comfortable with those tools and it's already a big ask to ramp up on a new CSS framework.

Since it's a little late in the evening I'm just going to dip my toe into some of what Foundation has to offer by quickly mocking up a very simple layout using their responsive grids.

![Our very basic responsive layout](/images/2014/12/responsive_mockup.png)

Obviously nothing fancy, the main bits I want to explore are how easy it is to lay items out using the grid and how does it react on the iPhone.

## Everything in its place

The first thing you should do, if you haven't already is to go to [the Foundation site](http://foundation.zurb.com/) and download the package.

Let's make a new folder with an index.html file and bring over the javascripts and stylesheets folders from the Foundation package. Just to start out your new index.html file should look something like this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />

    <!-- Set the viewport width to device width for mobile -->
    <meta name="viewport" content="width=device-width" />

    <title>Responsive Grid Prototype</title>

    <!-- Included CSS Files -->
    <link rel="stylesheet" href="stylesheets/foundation.css" />
    <link rel="stylesheet" href="stylesheets/app.css" />

    <script src="javascripts/modernizr.foundation.js"></script>
  </head>
  <body>
    <!-- container -->
    <div class="container">
      <div class="row">
        <header class="twelve columns">
          <p>HEADER</p>
        </header>
      </div>
    </div>
    <!-- container -->

    <!-- Included JS Files -->
    <script src="javascripts/jquery.min.js"></script>
    <script src="javascripts/foundation.js"></script>
  </body>
</html>
```

Couple that with the `app.css` file, like so:

```css
html,
body {
  color: #fff;
  font-family: Helvetica, sans-serif;
  font-size: 30px;
}

header {
  background: #ccc;
  height: 100px;
  text-align: center;
}
```

That should give us our roughed out grey header area. If we examine our HTML a few items should jump out. Mainly that we're using classes like `.container`, `.row` and `.twelve .columns`. These are all part of Foundation's grid system which seperates major sections into subcategories to help with organization and layout. The documentation explains it better than I can:

> The grid is built around three key elements: containers, rows, and columns. Containers create base padding for the page; rows create a max-width and contain the columns; and columns create the final structure.

Since Foundation uses a twelve column grid system, specifying that an item is `.twelve .columns` means it will stretch to be the full width of its row. By default a row's maximum width is 980px but we can change this if we want in the `foundation.css` file.

```css
.row {
  width: 100%;
  max-width: 980px;
  min-width: 727px;
  margin: 0 auto;
}
/* To fix the grid into a certain size, set max-width to width */
```

With that knowledge we can go ahead and quickly mock up the other sections of our page.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />

    <!-- Set the viewport width to device width for mobile -->
    <meta name="viewport" content="width=device-width" />

    <title>Responsive Grid Prototype</title>

    <!-- Included CSS Files -->
    <link rel="stylesheet" href="stylesheets/foundation.css" />
    <link rel="stylesheet" href="stylesheets/app.css" />

    <script src="javascripts/modernizr.foundation.js"></script>
  </head>
  <body>
    <!-- container -->
    <div class="container">
      <div class="row">
        <header class="twelve columns">
          <p>HEADER</p>
        </header>
      </div>
      <div class="row">
        <div class="main eight columns">
          <p>MAIN</p>
        </div>
        <aside class="four columns hide-on-phones">
          <p>ASIDE</p>
        </aside>
      </div>
      <div class="row">
        <footer class="twelve columns">
          <p>FOOTER</p>
        </footer>
      </div>
    </div>
    <!-- container -->

    <!-- Included JS Files -->
    <script src="javascripts/jquery.min.js"></script>
    <script src="javascripts/foundation.js"></script>
  </body>
</html>
```

And we'll need to update the CSS to match.

```css
html,
body {
  color: #fff;
  font-family: Helvetica, sans-serif;
  font-size: 30px;
}

header,
.main,
aside,
footer {
  margin-top: 20px;
  background: #ccc;
  height: 100px;
  text-align: center;
}
```

![Our basic layout](/images/2014/12/responsive_layout_basic.png)

That wasn't so hard was it?

Let's throw in some dummy copy to make our columns expand so we can get closer to our original comp. For that we'll turn to [Bacon Ipsum](http://baconipsum.com)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />

    <!-- Set the viewport width to device width for mobile -->
    <meta name="viewport" content="width=device-width" />

    <title>Responsive Grid Prototype</title>

    <!-- Included CSS Files -->
    <link rel="stylesheet" href="stylesheets/foundation.css" />
    <link rel="stylesheet" href="stylesheets/app.css" />

    <script src="javascripts/modernizr.foundation.js"></script>
  </head>
  <body>
    <!-- container -->
    <div class="container">
      <div class="row">
        <header class="twelve columns"></header>
      </div>
      <div class="row">
        <div class="main eight columns">
          <p>
            Tri-tip prosciutto drumstick ham hock chicken t-bone, pastrami salami boudin shankle.
            Short ribs pastrami pancetta bresaola drumstick tail. Meatloaf turducken fatback pork
            loin, ribeye bresaola t-bone capicola tenderloin drumstick pancetta. Kielbasa jerky
            pastrami shank andouille leberkas drumstick. Sirloin pastrami shankle cow. Kielbasa
            hamburger meatball shoulder jowl pork loin. Short ribs bacon t-bone, chuck jerky turkey
            ham hock salami leberkas ham speck.
          </p>

          <p>
            Tri-tip prosciutto drumstick ham hock chicken t-bone, pastrami salami boudin shankle.
            Short ribs pastrami pancetta bresaola drumstick tail. Meatloaf turducken fatback pork
            loin, ribeye bresaola t-bone capicola tenderloin drumstick pancetta. Kielbasa jerky
            pastrami shank andouille leberkas drumstick. Sirloin pastrami shankle cow. Kielbasa
            hamburger meatball shoulder jowl pork loin. Short ribs bacon t-bone, chuck jerky turkey
            ham hock salami leberkas ham speck.
          </p>

          <p>
            Tri-tip prosciutto drumstick ham hock chicken t-bone, pastrami salami boudin shankle.
            Short ribs pastrami pancetta bresaola drumstick tail. Meatloaf turducken fatback pork
            loin, ribeye bresaola t-bone capicola tenderloin drumstick pancetta. Kielbasa jerky
            pastrami shank andouille leberkas drumstick. Sirloin pastrami shankle cow. Kielbasa
            hamburger meatball shoulder jowl pork loin. Short ribs bacon t-bone, chuck jerky turkey
            ham hock salami leberkas ham speck.
          </p>

          <p>
            Tri-tip prosciutto drumstick ham hock chicken t-bone, pastrami salami boudin shankle.
            Short ribs pastrami pancetta bresaola drumstick tail. Meatloaf turducken fatback pork
            loin, ribeye bresaola t-bone capicola tenderloin drumstick pancetta. Kielbasa jerky
            pastrami shank andouille leberkas drumstick. Sirloin pastrami shankle cow. Kielbasa
            hamburger meatball shoulder jowl pork loin. Short ribs bacon t-bone, chuck jerky turkey
            ham hock salami leberkas ham speck.
          </p>
        </div>
        <aside class="four columns">
          <ul>
            <li><a href="#">First Item</a></li>
            <li><a href="#">Second Item</a></li>
            <li><a href="#">Third Item</a></li>
            <li><a href="#">Fourth Item</a></li>
          </ul>
        </aside>
      </div>
      <div class="row">
        <footer class="twelve columns"></footer>
      </div>
    </div>
    <!-- container -->

    <!-- Included JS Files -->
    <script src="javascripts/jquery.min.js"></script>
    <script src="javascripts/foundation.js"></script>
  </body>
</html>
```

While that expands everything nicely I'd like to add some padding to the mix. But as soon as I try to pad my `.main` div everything explodes! Turns out we need to make sure we're using `box-sizing: border-box` otherwise the padding will expand our columns and destroy our grid. For a deeper explanation of `box-sizing: border-box` checkout [this great post by Paul Irish.](http://paulirish.com/2012/box-sizing-border-box-ftw/) With that addition our CSS should now look like this:

```css
* {
  box-sizing: border-box;
}

html,
body {
  font-family: Helvetica, sans-serif;
}

header,
.main,
aside,
footer {
  margin-top: 20px;
  background: #ccc;
}

header,
footer {
  height: 100px;
}

.main,
aside {
  padding: 50px;
}
```

![Responsive layout with lorem ipsum](/images/2014/12/responsive_layout_ipsum.png)

## Making friends with mobile

Well I'm sure if you've made it to this point you're ready to see how this all works on an iPhone. A quick test you can perform is to just narrow your browser window until it is only about 300px wide (the iPhone has a roughly 320px display area, I believe). As you do so the columns should narrow, reflowing their content as they do so. Eventually our `aside` will _pop_ from its current position and line up underneath our `.main` content.

![Linear flow with Foundation](/images/2014/12/responsive_linear.png)

But what if we don't want the sidebar to appear on a mobile phone? Perhaps we just want to show the `.main` content if the screen is too narrow. Easy! Foundation provides [some nice helper classes](http://foundation.zurb.com/docs/layout.php) which we can use to toggle elements on or off depending on the device. We'll just add a `.hide-on-phones` class to our aside

```html
<aside class="four columns hide-on-phones"></aside>
```

and..._voila!_ The `aside` disappears on small screens!

![Hiding the aside](/images/2014/12/responsive_hide_on_phones.png)

Nice and simple, yeah? If you'd like to checkout the project running live you can [follow this link](http://robdodson.s3-website-us-east-1.amazonaws.com/tutorials/building-a-responsive-grid-with-foundation/index.html). Resize your browser or hit it with an iPhone to see it do its magic. Also you can [grab the source code off of Github.](https://github.com/robdodson/foundation-grid-tutorial) Enjoy! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Relaxed
- Sleep: 7
- Hunger: 0
- Coffee: 0


---
title: Building a Simple Scraper with Nokogiri in Ruby
tags:
  - Ruby
  - Chain
  - Nokogiri
date: 2012-05-06T04:08:00.000Z
updated: 2014-12-30T06:50:26.000Z
---

Since I've been talking so much about [D3.js](http://d3js.org/) lately I thought it might be fun to start a little project which combines D3 and Ruby. The idea is to build a very simple page scraper that counts how often certain words are used in each post. I've also decided to start adding a little block of metadata at the end of each post so I can graph that over time as well.

So how do we get started? Well first we'll need to build a page scraper of some kind. This program will have to consume the contents of an HTML page, find the node that contains our blog post and count up how often each word reoccurs. For right now that should be more than enough to get us started. We'll look at grabbing the metadata and drawing graphs in future posts. I should point out that this idea was inspired by the wonderful site [750words.com](http://smarterware.org/5359/taking-on-the-750-words-march-challenge) which creates [a beautiful exploration section](http://smarterware.org/5359/taking-on-the-750-words-march-challenge) any time you write a new journal entry. Definitely check out that site, it's amazing.

### Hello Noko

I decided early on that I wanted the scraper to use [Nokogiri](http://nokogiri.org/) because I've heard so much about it. As the authors describe it:

> Nokogiri (鋸) is an HTML, XML, SAX, and Reader parser. Among Nokogiri’s many features is the ability to search documents via XPath or CSS3 selectors.

Using CSS selectors means that working with Nokogiri is a lot like working with jQuery. Here's a quick demonstration:

```ruby
require 'open-uri'
require 'nokogiri'

doc = Nokogiri::HTML(open('https://www.google.com/search?q=unicorns'))

doc.css('h3.r a').each do |link|
  puts link.content
end
```

Easy enough, right? Taking it a step further let's iterate over each element on the page and place them into a `Hash`.

```ruby
require 'open-uri'
require 'nokogiri'

@counts = Hash.new(0)

def words_from_string(string)
  string.downcase.scan(/[\w']+/)
end

def count_frequency(word_list)
  for word in word_list
    @counts[word] += 1
  end
  @counts
end

doc = Nokogiri::HTML(open('http://robdodson.me'))

####
# Search for nodes by css
entries = doc.css('div.entry-content')
puts "Parsing #{entries.length} entries"
entries.each do |entry|
  words = words_from_string(entry.content)
  count_frequency(words)
end

sorted  = @counts.sort_by { |word, count| count }
puts sorted.map { |word, count| "#{word}: #{count}"}
```

The output from this script should look (kind of) like this:

```
...
ruby: 66
rvm: 66
our: 68
can: 71
3: 75
if: 77
for: 82
your: 88
2: 88
is: 91
this: 91
s: 94
we: 95
that: 106
i: 118
in: 119
it: 125
1: 128
and: 149
of: 170
a: 231
you: 233
to: 342
the: 382
```

It looks like our regex could use a bit of work so it doesn't grab singular letters like 's' or numbers, but it's definitely a good start. Tomorrow we'll put everything into a `Module` and back it with tests.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Relaxed, Tired
- Sleep: 6.5
- Hunger: 5
- Coffee: 1


---
title: Building better accessibility primitives
date: 2016-06-11T14:43:09.000Z
updated: 2016-06-12T00:31:09.000Z
---

As the sites we build increasingly become more app-like it's important that the platform keep up and give component authors the tools they need to build rich accessible experiences.

Recently I've run into two situations where it was extremely difficult for me to add proper keyboard support to the components I was building. After a lot of experimentation and research it became clear that maybe there were some missing primitives in the web platform that would have made my work a bit easier. I'll explain the two scenarios here and cover some ideas for how to solve them.

## Problem 1: Modals

A modal window is a dialog that appears above the page, often obscuring content behind it with an overlay. The idea is that if a modal is displaying the user should not be able to interact with anything else on the page.

![A modal window with a warning asking the user to save their work](/images/2016/06/modal.jpg)

For anyone who has ever tried to make a modal accessible you know that even though they seem pretty innocuous, **modals are actually the boss battle at the end of web accessibility**. They will chew you up and spit you out. For instance, a proper modal will need to have the following features:

- Keyboard focus should be moved inside of the modal and restored to the previous `activeElement` when the modal is closed
- Keyboard focus should be trapped inside of the modal, so the user does not accidentally tab outside of the modal (a.k.a. "escaping the modal")
- Screen readers should also be trapped inside of the modal to prevent accidentally escaping

Nailing the above three points can be pretty difficult and requires a lot of contortions using combinations of `aria-hidden` to trap the screen reader and managing focus to trap `TAB`. [Here's one of the best examples I've found](https://github.com/gdkraus/accessible-modal-dialog/blob/master/modal-window.js). Note that this example assumes your modal is a sibling to the rest of your main content so you can easily apply `aria-hidden` to main. If, however, your modal is mixed in with the rest of your main content (maybe for positioning reasons) then you are seriously screwed. You'll need to find a way to put `aria-hidden` on everything in main that isn't your modal (or a parent of your modal). It definitely _feels_ harder than it should be.

### What about `<dialog>`?

The HTML spec does [mention the idea of a `<dialog>` element](https://html.spec.whatwg.org/multipage/forms.html#the-dialog-element) which would magically solve all of the above issues. The problem is that so far only Chrome has implemented it, and other browsers seem disinterested. Furthermore, `<dialog>` may not be the right solution. Let's consider another example:

![A mobile phone showing an offscreen responsive drawer menu](/images/2016/06/phone.jpg)

Offscreen drawer menus are an extremely popular UI pattern in responsive sites. But is an offscreen drawer menu the same as a `<dialog>`? The drawer also needs to comply with the three bullet points listed above but calling it a dialog feels like a stretch. My hunch is many developers might not think to reach for `<dialog>` when they're building a drawer.

### Possible solution: `blockingElements`

Rather than contort `<dialog>` to do our bidding, why not expose a JavaScript API that gives us all the same magical goodies. Then we could create our own custom elements and leverage the API as we see fit. This idea has been discussed over on the whatwg/html GitHub repo, under the thread ["Expose a stack of blocking elements"](https://github.com/whatwg/html/issues/897#issuecomment-198265076).

The proposed API could look something like this:

```js
// put element at the top of the blocking elements stack
document.blockingElements.push(element);
document.blockingElements.pop();
// see https://github.com/whatwg/html/issues/897#issuecomment-198565716
document.blockingElements.remove(element);
document.blockingElements.top; // or .current or .peek()
```

Putting an element at the top of the stack effectively means everything else on the page is inert (so no risk of the keyboard or screen reader "escaping"). And when an element is popped off of the stack, focus naturally returns to the previous `activeElement`. This allows us to explain the behavior of `<dialog>` so component authors can use it to build whatever they like, which dovetails really well with the whole [extensible web movement.](https://extensiblewebmanifesto.org/) A natural side effect of doing this is we get tons of accessibility features for free. Developers wouldn't need to sprinkle the page with `aria-hidden` attributes or write keyboard traps, instead **they would use the best API for building a dialog and good accessibility would naturally come out of that**. It's a total win.

At the moment `blockingElements` is still a new idea, and new ideas are fragile, so please resist the urge to hop on that GitHub issue and bikeshed the heck out of it 😊 Our next step is to move `blockingElements` into a [Web Platform Incubator Community Group (WICG)](https://www.w3.org/blog/2015/07/wicg/) so we can continue to iterate on the idea. When we move to the WICG I will be sure to update this blog and let you all know!

## Problem 2: Disabling tabindex

Let's go back to that offscreen drawer example for a second. In order to animate that drawer on screen, and achieve a 60fps animation, I'm going to need to promote the drawer to its own layer using something like `will-change: transform`. Now I can `transform` the drawer on screen and I shouldn't trigger unnecessary paints or layouts. This technique is explained really well by [Paul Lewis in his I/O presentation.](https://youtu.be/thNyy5eYfbc?t=7m55s)

{% youtube id="thNyy5eYfbc", title="High performance web user interfaces - Google I/O 2016", time="475" %}

One problem: to do this we must leave the drawer in the DOM at all times. Meaning its focusable children are just sitting there offscreen, and as the user is tabbing through the page eventually their focus will just disappear into the drawer and they won't know where it went. I see this on responsive websites **all the time**. This is just one example but I've also run into the need to disable tabindex when I'm animating between elements with `opacity: 0`, or temporarily disabling large lists of custom controls, and as others have pointed out, you'd hit if you tried to build something like [coverflow](http://cdn.cultofmac.com/wp-content/uploads/2010/10/post-61758-image-221f26e399e464c71248d2528ef2eeaf.jpg) where you can see a preview of the next element but can't actually interact with it yet.

### What about aria-hidden?

Using `aria-hidden` it's possible to remove an element _and all of its children_ from the accessibility tree. This is awesome and solves the problem for screen readers (_[Marcy Sutton pointed out that](https://robdodson.me/building-better-accessibility-primitives/#comment-2725171222) it doesn't completely solve the issue for screen readers and can even lead to "ghost controls" which are focusable but lacking a11y information_). Unfortunately ARIA is forbidden from affecting page behavior, it only deals with semantics, and there is no similar concept for `tabindex`. This is important because there are sighted users with motor impairments who rely on the tab key to navigate the page. If you have a complex tree of interactive elements and you need to remove all of them from the tab order your only option is to recursively walk the tree (or write [a pretty heinous `querySelectorAll` string](https://github.com/robdodson/Detabinator/blob/master/detabinator.js#L16)) and set every focusable element to `tabindex="-1"`. You also need to remember any explict `tabindex` values they may already have and restore those when the element is back on screen. Again, it _feels_ harder than it should be.

### What about pointer-events: none?

Settings `pointer-events: none` will make it so you can't click on an element but it doesn't remove it from the tab order and [you can still interact with it using the keyboard](https://output.jsbin.com/fuyuba).

### What about setting the drawer to display: none?

When the drawer is offscreen we could set it to `display: none` or `visibility: hidden`. That would remove the focusable children from the tab order. Unfortunately that will also destroy our GPU layer which kind of negates the whole animation technique. On a simple enough drawer we can actually get away with recreating the layer right when the user opens it, but for a more complex drawer (like the kind on [m.facebook.com](m.facebook.com)) all of that painting would probably cause our animation to jank. I don't think developers should have to choose between 60fps animations and good accessibility.

### Possible solution: `inert=""`

Previously there [was some discussion](https://www.w3.org/Bugs/Public/show_bug.cgi?id=24983) around adding an `inert` attribute to HTML. The basic idea is you could set the `inert` attribute on an element, and its entire tree of descendants would become non-interactive. This is perfect for our drawer example as it means we could paint something offscreen, set it to `inert`, and not have to worry about a keyboard user accidentally interacting with it.

Unfortunately the original use cases cited for `inert` seem to orbit mainly around dialogs and since there was already a `<dialog>` proposal floating around at the time, it was punted.

My feeling is this is perhaps backwards. I think the proposed `blockingElements` API would be a better way of letting developers build accessible dialogs because it says "everyone else BUT ME is inert". Whereas `inert=""` would be useful for the animation example above where I need something to be painted and in the DOM but also be non-interactive (in other words, "I AM inert"). And for anyone doing accessibility work it becomes like a more powerful `aria-hidden` because presumably it would not only remove an element from the tab order but also from the accessibility tree. **Developers would use the best API to build their component and they'd get good accessibility for free**. ZOMG SO FULL OF WIN!

I should add that others on [the discussion thread](https://www.w3.org/Bugs/Public/show_bug.cgi?id=24983) mention that maybe this would be better solved with a new CSS property. I'd be cool with that as well but to my (very limited) knowledge no proposal has come forward and [this is a legitimate pain point for developers](https://twitter.com/briankardell/status/741389741417861120). So I've filed [a chromium bug](https://bugs.chromium.org/p/chromium/issues/detail?id=618746#c2) to see if the Chrome team will explore restarting the process of implementing `inert`. I hope by documenting these use cases we can convince others of its utility. If there's progress I'll be sure to write a follow up post to let you all know 🐝


---
title: Chrome/Blink devs discuss setImmediate
tags:
  - JavaScript
  - Chrome
  - Blink
  - WebKit
date: 2013-07-29T16:05:00.000Z
updated: 2015-01-02T08:50:12.000Z
exclude: true
---

Really interesting discussion of the pros and cons of the `setImmediate` function. For a little backstory checkout [this post](http://www.nczonline.net/blog/2013/07/09/the-case-for-setimmediate/) by [Nicholas Zakas](http://www.nczonline.net/blog/) ([@slicknet](http://twitter.com/slicknet))

Here's a nice tidbit from one of the Chrome devs:

> To perform work immediately before the next display - for example to batch up graphical updates as data is streamed in off the network - just make a one-off `requestAnimationFrame()` call. To perform work immediately -after- a display, just call `setTimeout()` from inside the `requestAnimationFrame()` handler.

[The full thread is available here.](https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/Hn3GxRLXmR0)


---
title: Command palettes for the web
tags:
  - Accessibility
description: Can focus management lead to a better experience for all of our users?
date: 2019-09-03T15:00:00.000Z
updated: 2019-09-03T18:16:55.000Z
---

{% youtube id="srLRSQg6Jgg", title="a11ycasts: Managing Focus" %}

A while back I was working with a fellow Googler to try and improve the accessibility for one of our apps. In the scenario, a user needed to click some UI, which then opened a panel, where the user needed to click _more_ UI to perform an action.

Helping a screen reader navigate these various UI states is a tricky technique known as **focus management**.Focus management is when you manually direct the user's keyboard and screen reader cursor as they use the app. For example, if clicking a piece of UI loads more content into the page, then you need to tell the screen reader that this new content is available.

Because the web does not have a built-in tool for doing focus management, this is often left as a design exercise involving clever uses of `tabindex`, the `focus()` method, and a lot of guesswork.

## Look up

As my teammate and I were discussing how to move focus into the next panel, he mentioned something that got me thinking. He said that he wished web apps had menu bars like desktop apps.

> You know, like the File and Edit menus in Outlook. I can do anything I want with those!

It had never occurred to me how much I take the OS menu bar for granted and how powerful of an accessibility tool it can be. Instead of forcing the user to learn a bunch of UI states—which are different for each app—the menu bar is a common affordance for executing commands.

![The menu bar for Evernote, showing the Note submenu](/images/2019/01/Screen-Shot-2019-01-10-at-10.50.54-PM.png "The menu bar for the macOS app Evernote")

So why don't web apps have menu bars? Especially if they could improve the accessibility for our users?

There might be a few reasons for this:

- The OS menu bar is presented separately from the app, which lives in a window. Web apps don't have this capability because they run inside of a browser which already has a menu bar.
- In addition to the browser's menu bar, there's also a URL bar and associated controls. Adding _another_ menu bar may feel cluttered.
- Every website would have to solve this for themselves. It would be hard to create the consistent experience of OS menu bars.

It's worth noting that some web apps do support their own menu bar—Google Docs for example—but I think that's because they're following in the well worn footprints of their native counterparts.

![The Google Docs menu bar](/images/2019/01/Screen-Shot-2019-01-19-at-9.13.28-AM.png "Google Docs' menu bar is inspired by desktop word processors")

In general the menu bar is not a common pattern across the web. Instead, we tend to hide controls behind hamburger menus or cryptic settings icons. So if it's design prohibitive to add menu bars to every web app, is there a better alternative?

## Help!

One of the most interesting and (literally) helpful buttons in the menu bar is **Help**. In particular, the **Search** field in the Help menu which acts as a **command palette**. Start typing in a command, and it will find it for you.

![Using Evernote's Help menu to find the New Notebook command](/images/2019/01/Screen-Shot-2019-01-10-at-11.03.43-PM-2.png)

You can reach commands that do not have an associated keyboard shortcuts this way. And fuzzy search lets you guess the name of the command if you're unsure.

![Using fuzzy search to find the Attach Files... command which does not have a shortcut](/images/2019/01/Screen-Shot-2019-01-10-at-11.14.42-PM-1.png)

On the Mac you press `CMD + SHIFT + /` to open the Help menu. This means a user only needs to know one shortcut to access most of the functionality of **any** desktop app!

Thinking about this made a little lightbulb go off in my head 💡

> Why don't web apps use command palettes to emulate the best parts of the OS menu bar? They're a simple UI—just a modal autocomplete—that could have a big impact for users!

## An example

As a Googler, I live inside of the Gmail web app. Because the app has so much functionality, the Gmail team has provided a large set of keyboard shortcuts.

![A partial list of Gmail's many shortcuts](/images/2019/01/Screen-Shot-2019-01-10-at-11.48.30-PM.png)

But shortcuts can be difficult to remember and typically only cover a subset of the functionality of an app.

Adding a Gmail filter is a task I do occasionally, but not frequently enough to remember a keyboard shortcut (btw, there isn't one). And I always forget which settings menu it lives in. As it turns out, the command to add a filter is buried a few screens deep, creating a focus management conundrum. Wouldn't it be a better experience if I could type `CMD + SHIFT + P` and `"filter"` to go straight there?

Could this improve the experience for users of assistive technology by giving them direct access to all of the commands an app supports—especially those tucked away in hard to discover modals and submenus?

While it's important to still do the work of managing focus between states; providing a command palette **as an additional affordance** might have a big impact on UX.

## Has this been tried before?

Sort of.

[Alice Boxhall](https://twitter.com/sundress) showed me both the [command](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/command) and [menuitem](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/menuitem) elements which were designed for creating custom context menus. Similarly there is the `contextmenu` event which you can use today to create your own custom menu—but the event only fires if the user right-clicks or presses the context menu key.

I think the context menu route is not the path we want to take.

I think what we want is closer to what VS Code and other editors provide. A fuzzy search text field that can be summoned by a single command.

![Visual Studio Code's command palette showing a list of commands](/images/2019/01/commands.png)

How we go about doing this is an open question. My naive guess is that we might want browsers to standardize a command palette keyboard shortcut, like `CMD/CTRL + SHIFT + P` that triggers a `commandpalette` event. Triggering this event could also be done directly through assistive technology in whatever way is most efficient for the user.

It would be nice if there was a built-in, easy to style HTML element for handling the fuzzy text input, but designing that is its own can of worms 😅

## Closing thoughts

Focus management is hard and there's no agreed upon way to do it. While it is important to ensure that every UI state in your app is keyboard and screen reader accessible, it feels like command palettes could be a nice, additional UI affordance that all users would benefit from.

I'm curious to know if this idea resonates with folks. [Let me know your thoughts on twitter](https://twitter.com/rob_dodson) and thanks for reading!


---
title: Crawling pages with Mechanize and Nokogiri
tags:
  - Ruby
  - Chain
  - Nokogiri
  - Mechanize
date: 2012-06-20T07:09:00.000Z
updated: 2014-12-31T00:07:12.000Z
exclude: true
---

Short post tonight because I spent so much time figuring out the code. It's late and my brain is firing on about 1 cylinder so it took longer than I expected to get everything working.

The scraper that I'm building is supposed to work like a spider and crawl of the pages of my blog. I wasn't sure what the best way to do that was so I started Googling and came up with [Mechanize.](http://mechanize.rubyforge.org/) There are other tools built on top of Mechanize, like [Wombat](https://github.com/felipecsl/wombat), but since my task is so simple I figured I could just write everything I needed with Mechanize and Nokogiri. It's usually a better idea to work with simple tools when you're first grasping concepts so you don't get lost in the weeds of some high powered framework.

Since it's late I'll let the code do the talking:

```ruby
require 'mechanize'

# Create a new instance of Mechanize and grab our page
agent = Mechanize.new
page = agent.get('http://robdodson.me/blog/archives/')

# Find all the links on the page that are contained within
# h1 tags.
post_links = page.links.find_all { |l| l.attributes.parent.name == 'h1' }

# Click on one of our post links and store the response
post = post_links[1].click
doc = page.parser # Same as Nokogiri::HTML(page.body)
p doc
```

This code is hopefully easy enough to digest. After I get the page I find all of the links which are wrapped inside of an `h1`. Just as an example I `click` a link from the list using Array syntax and store the response in another var. You _could_ click all of the links by iterating through the post_links object, and that's what we'll tackle tomorrow. For now I just follow 1 link and use a convenience method to parse the page with Nokogiri. After that we have a Nokogiri `doc` ready to be manipulated however we see fit.

[Here's a link to the Gist](https://gist.github.com/2958538) if you'd like to tweak or play with the code. Pop it into `irb` and give it a shot. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Introspective
- Sleep: 4.5
- Hunger: 2
- Coffee: 1


---
title: Creating a Markdown Tag with Polymer
tags:
  - Web Components
  - Custom Elements
  - Polymer
date: 2013-10-02T15:05:00.000Z
updated: 2015-01-01T21:16:04.000Z

exclude: true
---

Ah Markdown... Such an amazing tool. I honestly would not be writing this blog post if Markdown did not exist. I tried many times to get in to blogging but I always found the writing experience, whether it be in a GUI or WordPress' HTML mode, too limiting. Markdown changed all of that for me and I think it's high time we make it a full fledged member of our developer toolbox.

So today I'm going to show you how to build a Markdown tag using [Polymer, a Web Components framework from Google.](http://www.polymer-project.org/)

## Github

[If you'd like to follow along you can grab the code from Github.](https://github.com/robdodson/mark-down)

## The Setup

First things first, we need to download the latest version of Polymer. I like to do this with [bower](http://bower.io) and I would encourage you to do so as well. Although it hasn't been discussed much, I think bower is going to be as important to web components as npm and the node_modules folder is to Node.js. When developers can assume the location and version of a dependency then they're able to remove extra work from the consumer's plate. But that's a discussion for another day! For now let's just run

```bash
bower init
```

to create our `bower.json` file.

![Create a bower.json with bower init](/images/2015/01/bower-init.jpg)

And we'll want to install our Polymer and Markdown dependencies so

```bash
bower install Polymer/polymer marked --save
```

Lastly we'll setup a test page for our element. I'm going to assume that the element lives in a folder called (creatively) `elements` so we'll import from there.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Markdown Polymer Element</title>
    <!-- Include webcomponents.js to polyfill web components in old browsers -->
    <script src="bower_components/webcomponentsjs/webcomponents.js"></script>

    <!-- Import our polymer element -->
    <link rel="import" href="elements/mark-down.html" />
  </head>
  <body>
    <!-- Test our awesome new tag -->
    <mark-down></mark-down>
  </body>
</html>
```

## The Element

We'll start with a very basic skeleton in our `elements/mark-down.html` file.

```html
<link rel="import" href="../polymer/polymer.html" />
<polymer-element name="mark-down">
  <template>
    <div id="markdown"></div>
  </template>
  <script>
    Polymer({});
  </script>
</polymer-element>
```

Let's walk through this a bit.

```html
<polymer-element name="mark-down"></polymer-element>
```

This line tells Polymer that we'd like to define a new element and its tag name should be `mark-down`.

```html
<template>
  <div id="markdown"></div>
</template>
```

This is our template which Polymer will convert to [Shadow DOM.](/blog/2013/08/26/shadow-dom-introduction/) All of the Markdown that we write inside of the `<mark-down>` tag will be parsed and end up here.

```html
<script>
  Polymer({});
</script>
```

Finally, we call the Polymer constructor and pass in a prototype object. This makes our new tag available so we can start using it in the document. But first we'll need to parse our Markdown into HTML!

## Markdown

We'll use Polymer's [`ready` callback](http://www.polymer-project.org/docs/polymer/polymer.html#lifecyclemethods) to grab the `textContent` of our tag and convert it all to Markdown. To define behaviors for our element we'll modify our prototype object (the object passed to the Polymer constructor).

```js
Polymer({
  ready: function() {
    var content = this.trim(this.textContent);
    var parsed = markdown.toHTML(content);
    this.$.markdown.innerHTML = parsed;
  },
  // Remove excess white space
  trim: function() { ... }
});
```

The first thing we do is to grab everything inside of the `<mark-down>` tag and remove any extra white space. Here I'm using a trim method that I borrowed from [Ryan Seddon's Markdown element.](https://github.com/ryanseddon/markdown-component) Big thanks to Ryan :D

```js
ready: function() {
  var content = this.trim(this.textContent);
  ...
},
```

Next we convert the content into Markdown using the `toHTML` method of our Markdown library. Then we take this new, more presentational markup, and add it to the `#markdown` div inside of our `template`.

```js
ready: function() {
  ...
  var parsed = markdown.toHTML(content);
  this.$.markdown.innerHTML = parsed;
}
```

### Node Finding

You might notice the funny use of `$` and think I'm doing something clever with jQuery. What's actually happening is that Polymer creates a map of any element inside of our template with an `id`. It then stores this map in a `$` property. So if you're using ids you can quickly access elements with the use of `this.$.someId`. In the Polymer docs this is referred to as [automatic node finding.](http://www.polymer-project.org/getting-started.html#automatic-node-finding)

_But aren't ids an anti-pattern?_

Although the traditional document model only allows for one id per page, the Shadow DOM creates a kind of clean slate where each element has its own id sandbox. This means we can use an id of `#markdown` in our element and not worry if the parent document also contains an element with id `#markdown`. Pretty nifty!

## Test

The only thing left is for us to throw some Markdown into our tag to test it out.

```html
<mark-down>
  # This is a heading ## This is a subheading Here is **more** _Markdown!_ `This is some codez` This
  [is a link](http://robdodson.me)
</mark-down>
```

![Markdown rendering in our custom element](/images/2015/01/markdown-example.jpg)

Piece O' Cake!

## Moar!

There's a lot more that we could do, for instance, using something like `contenteditable` to allow us to toggle back and forth between the source and the rendered content. [I've posted the code on Github](https://github.com/robdodson/mark-down) so fork it and go crazy.

Be sure to leave a comment if you want to share your experiments!

Till next time!


---
title: 'CSS Semantics: Best Practices'
tags:
  - Chain
  - CSS
  - OOCSS
  - SMACSS
date: 2012-06-09T14:19:00.000Z
updated: 2015-01-02T08:55:53.000Z
---CSS is, for me, one of the most challenging and nerve wracking aspects of my job. With most programming languages there are frameworks and guides and heuristics that all make up a suite of best practices. CSS doesn't _really_ have anything like this and as a result it's kind of a mish-mash of good rules to follow, definite don'ts, and lots and lots of grey area. Since I'm starting a new CSS heavy project, and because I want to further my own understanding in this realm, I'm going to spend a few posts exploring the topic of what makes good, maintainable CSS. Along the way I'm also going to point out a few frameworks that I've been looking at, in particular [OOCSS](http://oocss.org/) and [SMACSS.](http://smacss.com/) But lets kick things off with a discussion of what it means to write good, semantic CSS selectors and we'll follow up with frameworks in our next post.

## Define Semantic

When I was trolling the interwebs for talks on writing large-scale maintainable CSS I somehow managed to come across [this article on css-tricks comparing the semantics of various css selectors.](http://css-tricks.com/semantic-class-names/) After reading it I had this weird feeling like maybe I haven't been putting as much thought into my css selectors as I should. My selectors need to be highly semantic, but what does that really _mean?_

Trying to look up the definition of "semantic" is kind of a fun, albeit a slightly annoying task since most definitions look like this:

_Of, relating to, or according to the science of semantics._

Well...thanks. [The wonderful Wordnik site has a great list of definitions](http://www.wordnik.com/words/semantic) the most useful of which is probably this:

_Reflecting intended structure and meaning._

So a semantic CSS selector should reflect the intended structure or meaning of the element it is applied to. Hmm...that's still a rather broad definition but at least we have a starting point. If I have a `div` that holds a bunch of news articles there's probably a gradient of increasingly more semantic names I could use for it.

```html
<div class="container"></div>

<div class="article-box"></div>

<div class="newsstand"></div>
```

On the far end of the spectrum, `container` is about as generic as you can get and basically restates that something is a `div`. While I've been guilty of doing this in the past, if you're saying a containing HTML Element is a 'container' you're restating the obvious and should probably work on improving the name.

`article-box` is much more descriptive than just `container` so I'd say it has a higher semantic "score". But there is the potential for some semantic weirdness here, for instance, if we decide at a later date that we want our articles to be contained in a horizontal list it might make less sense to call it an "article-_box_". So maybe `article-container` is semantically similar but also a bit more flexible?

Finally we have `newsstand` which is highly semantic and probably my favorite of the bunch. `newsstand` describes what our element _is_ but it doesn't bother delving into how our element works. As a result `newsstand` can work however we want, it can be list like, or grid like, tabular, etc and it won't matter. You might argue that this would be a good place to use an ID instead of a class but that decision should be weighed carefully. You have to make sure that 3 months or a year from now there isn't the potential of having two newsstands on the same page.

### If we only worked on contrived examples...

Of course there's a litany of cases where highly semantic naming just doesn't quite cut it. Often times we're given a layout which has a few primary areas (columns, headers, footer) and the designer is putting all sorts of content into those divisions. On one page it could be news articles, then a list of search results, then a directory of users, and so on. I would argue that for major layout elements it's ok to use less semantic names, and in fact this is probably a good idea. So things like `column_1`, `flex-box`, `constrained-container`, are all specifying, at varying degrees, what the element is doing. They are less semantically rich than, say, `rolodex` or `id-badge`, but that's because their very intention is to be generic.

### What about helpers?

_Preface: I know about SASS and LESS. Let's pretend they don't exist for a moment :D_

Here is an area where I recently got very tripped up and I'm still not entirely sure what the best approach might be. Let's say you have a brand color, something like Facebook's blue, and you need to apply it to all sorts of different and unrelated elements. If you're like me then your brain starts thinking, "Well, that blue value is essentially a variable that I'd like to reuse. Maybe I should just make a helper style for it..." and so you produce something like this in a helpers.css file:

```css
.light-blue {
    #00C
}
```

Now our HTML has little `light-blue`s sprinkled on top of it and we don't have to worry about declaring that same blue value over and over again in our styles. But what happens when our company decides to rebrand and now our primary color is a bright red? Uh oh...You definitely don't want to have to change HTML _and_ CSS just to update a color.

[Neal G on CSS-Tricks made a very good comment regarding this scenario:](http://css-tricks.com/semantic-class-names/#comment-102571)

> Perhaps an easier way to explain semantic CSS is simply, don't name your classes or ids anything related to a CSS property. A property could be color, font-family, float, border, background etc.

[Also from the Web Designer Depot](http://www.webdesignerdepot.com/2009/05/10-best-css-practices-to-improve-your-code/)

> Name your elements based on what they are, not what they look like. For example, .comment-blue is much less versatile than .comment-beta, and .post-largefont is more limiting than .post-title.

Perhaps a better helper would have been `.brand-color` but again this is a contrived example. What about all the _other_ colors on the site. And what about helpers that wrap commonly used styles like `float: left` and `clear: both`?

The debate is pretty hot and heavy [on the css-tricks article.](http://css-tricks.com/semantic-class-names) Just seach for the word 'float' and you'll see some pretty interesting discussions on it. My opinion is that you probably don't want to tack a bunch of `.bright-red` or `.larger` classes everywhere but at the same time something like `.float-right` can be extremely useful and [in some cases forcing semantics into a design can actually make things worse](http://css-tricks.com/semantic-class-names/#comment-102906) especially for [less technically inclined clients.](http://css-tricks.com/semantic-class-names/#comment-103076)

As a bit of a homework assignment I would recommend looking into a few of the resources I'm posting below. Obviouslyl take everything with a grain of salt, there isn't any true gospel for CSS so do what works best for you. I'll cover OOCSS and SMACSS in my next post, till then, thanks for reading! - Rob

[What Makes For a Semantic Class Name?](http://css-tricks.com/semantic-class-names/)

[Our Best Practices Are Killing Us](http://www.stubbornella.org/content/2011/04/28/our-best-practices-are-killing-us/)

[Github CSS Style Guide](https://github.com/styleguide/css)

[CSS Wizardry: CSS Guidelines](https://github.com/csswizardry/CSS-Guidelines/blob/master/CSS%20Guidelines.md)


---
title: Custom Domain with Octopress and Github Pages
tags:
  - Octopress
  - Writing
  - Chain
date: 2012-04-30T13:52:00.000Z
updated: 2014-12-30T06:14:12.000Z
exclude: true
---

_I'm going to try to write this as a bit of a lightening post to see if I can bring down the time it takes me to produce something._

[Octopress](http://octopress.org/) is a blogging framework written by [Brandon Mathis](http://brandonmathis.com/) ([@imathis](https://twitter.com/#!/imathis)) which sits on top of [Jekyll](https://github.com/mojombo/jekyll). Jekyll is a static site generator, meaning there's no database associated with your blog. Instead of writing everything in a WSYWIG linked to MySQL (like Wordpress or Blogger) you produce text files using Markdown which are then converted to static HTML. There are 3 huge benefits to this approach. First, writing in Markdown is awesome. Once you learn the syntax it's incredibly fast and you don't have to spend time playing with a tiny little editor window just to add\*some**\*style** to your posts. Second, writing in your favorite text editor is also awesome. I produce everything in [Sublime Text 2](http://www.sublimetext.com/2) and every day I discover new tricks to make the process better. If you've ever had to write a blog post using one of those horrible little TinyMCE editors you will appreciate this feature. And lastly, static HTML is _fast_.

Octopress takes what Jekyll has started and adds some useful tasks and templates which make setting up your own blog a breeze. I'm going to quickly cover the steps needed to set everything up on Github Pages using a custom domain since that's something I struggled with when first starting out.

If you don't already have RVM installed you can [refer back to my previous post on getting setup](http://robdodson.me/blog/2011/09/23/how-to-use-rvm-for-rails3/). If you're unexperienced I highly recommend going the RVM route, though there's also [an explanation for setting up rbenv if you would prefer](https://github.com/sstephenson/rbenv#section_2). I should point out that I'm going to pretty much mirror [the Octopress setup guide](http://octopress.org/docs/setup/) but I'll add some tips toward the end for setting up a custom domain.

### Setup Octopress

You'll need at least Ruby 1.9.2 to install and run Octopress. As of right now the current version of Ruby is up to 1.9.3. I'd also recommend setting up a new RVM gemset just for your blog.

```bash
rvm install 1.9.3   # This will take a while
rvm gemset create octopress
rvm 1.9.3@octopress   # This will tell RVM to use our new gemset.
```

Next you'll need to clone and `bundle install` Octopress. When you `cd` into the directory it'll ask you to approve the .rvmrc file. An .rvmrc file basically tells RVM which ruby and gemset to use in a particular folder. Type `yes` and you'll probably get an error saying you're not using Ruby 1.9.2. This is ok, we're going to change what's in that file so ignore it for now.

```bash
git clone git://github.com/imathis/octopress.git octopress
cd octopress    # If you use RVM, You'll be asked if you trust the .rvmrc file (say yes).
```

Now let's tell RVM to use Ruby 1.9.3 with our custom Octopress gemset.

```bash
> .rvmrc    # This will empty the .rvmrc file
echo "rvm use 1.9.3@octopress" > .rvmrc
```

The next time you `cd` into the octopress directory you'll have to approve the new .rvmrc file. Next let's use [Bundler](http://gembundler.com/) to install our dependencies.

```bash
gem install bundler
bundle install
```

Finally we'll tell Octopress to setup its default theme.

```bash
rake install
```

If you get an error that looks like this:

```bash
rake aborted!
You have already activated rake 0.9.2.2, but your Gemfile requires rake 0.9.2. Using bundle exec may solve this.
```

then you already have a version of Rake in your global gemset. You can use `bundle exec rake install` which will use the version of Rake that bundler just installed in our gemset.

### Octopress on Github Pages

I prefer to host Octopress on [Github](http://github.com) pages because it's extemely easy (and free) to setup. The first step is to go to [Github](http://github.com) and create a new repository. The repository should be called "your_user_name.github.com". My name on Github is [robdodson](https://github.com/robdodson) so my repo is: [robdodson.github.com](https://github.com/robdodson/robdodson.github.com). Here's a quick explanation from the [Octopress deployment guide](http://octopress.org/docs/deploying/github/).

> Github Pages for users and organizations uses the master branch like the public directory on a web server, serving up the files at your Pages url `http://username.github.com`. As a result, you’ll want to work on the source for your blog in the source branch and commit the generated content to the master branch. Octopress has a configuration task that helps you set all this up.

Here's the task, let's run it:

```bash
rake setup_github_pages
```

This will setup your git branches and remotes to work with Github Pages. Basically Octopress uses 2 branches to manage your blog. The source branch contains all of our octopress files. The master branch contains only the generated blog posts and theme. This way when Github looks at the master branch of our repository it'll see a bunch of static HTML and serve it up as our website. As a result we use the built in octopress rake tasks to commit to master instead of pushing to it manually. Let's set that up now.

```bash
rake generate
rake deploy
```

This will generate your blog, copy the generated files into \_deploy/, add them to git, commit and push them up to the master branch. We still need to manually commit to our source branch though so lets do that next.

```bash
git add .
git commit -am 'Initial commit!'
git push origin source
```

### Octopress: Deploying a Blog Post

I won't go into too much detail here since [there's already a pretty comprehensive write up on the Octopress site for getting started](http://octopress.org/docs/blogging/). But let's do a quick post to get you familiar with everything.

You'll use Rake tasks to generate your blog posts, like so:

```bash
rake new_post["Hello World: The First of Many New Blog Posts"]
```

_Remember if rake cries just use `bundle exec` in front of your rake command._

This will spit out a markdown file for us in the `source/_posts` directory. Open up the new file using your favorite text editor. You should see a little block of [YAML Front Matter](https://github.com/mojombo/jekyll/wiki/yaml-front-matter) at the top which generates some useful metadata about our post. If you need to change a blog post's title in Octopress you'll have to update this YAML as well as the post's filename.

As I mentioned earlier your posts should be written in Markdown. [Here's a good Markdown cheat sheet to get you started](http://support.mashery.com/docs/customizing_your_portal/Markdown_Cheat_Sheet). _Tip: When you're writing in markdown you're also free to mix in HTML tags as they are ignored by the processor._ Write a quick block of text like "Hey, here's my first blog post!" and save it.

You can use `bundle exec rake preview` to fire up a local instance of your blog at `http://localhost:4000`. I usually leave this process running while I write so I can preview any of the markdown that I'm adding to the page. When you're done writing you'll need to generate and deploy the site to Github.

```bash
bundle exec rake generate
bundle exec rake deploy
```

And don't forget to commit your changes to source.

```bash
git add .
git commit -am 'Add my first blog post'
git push origin source
```

Now that we're all deployed you should be able to see your blog at "your_user_name.github.com".

### Setting up your Custom Domain with Octopress and Github

If you're cool using the Github subdomain then feel free to stick with it. However if you'd like to point a custom domain at your blog then here's how to go about it.

Create a new file in the `source` folder named `CNAME`. Add your domain name to this file. In my case the only contents of my CNAME are `robdodson.me`. If you're trying to use nested domains or subdomains you may need to [refer back to the Octopress documentation](http://octopress.org/docs/deploying/github/).

Now lets go through the familiar steps for deploying...

```bash
bundle exec rake generate
bundle exec rake deploy

git add .
git commit -am 'Create a CNAME record for my custom domain'
git push origin source
```

If you visit your repo you should see the CNAME record in the root of the master branch now (Octopress has copied it over for us as part of the generate task).

Next you'll need to update the DNS for your domain. Head over to your domain registrar and fire up their DNS manager. For a top level domain like `robdodson.me` we need to create an A record which points to the address for Github Pages: `204.232.175.78`. Save that change and now...we wait... Unfortunately, DNS can take several hours to update. If all goes according to plan then in a few hours "your_name.github.com" should resolve to "your_custom_domain.com".

A few quick gotchas...

If you're using Dreamhost then you may need to set the hosting preferences for the domain to DNS only. [See this thread for more explanation.](https://github.com/imathis/octopress/issues/518)

If adding `www` to the beginning of your domain seems to break things then make sure that your domain registrar has a CNAME record for www which points to your A record. I'm not a DNS expert but I _think_ this is the proper way to set that up.

Make sure you spelled your domain name correctly in the CNAME record that you pushed to Github. I spent almost an hour wondering why `robodson.me` wasn't resolving :\

If all else fails checkout the docs from [Github Pages](http://help.github.com/pages/) and [Octopress](http://octopress.org/docs/deploying/github/) on setting up a custom domain.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)


---
title: 'D3 Basics: An Introduction To Scales'
tags:
  - Chain
  - D3
date: 2012-05-03T17:04:00.000Z
updated: 2014-12-30T06:42:24.000Z
---

## Heads up!

I wrote this post a few years ago when I was on Octopress. The code no longer works now that I've migrated to Ghost, but I'm keeping the post up in case any of it is useful for those who come along after -- Rob

```css
.chart {
  font-family: Arial, sans-serif;
  font-size: 10px;
}

.bar {
  fill: steelblue;
}

.axis path,
.axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}
```

```js
var data = [1, 1, 2, 3, 5, 8];

var margin = { top: 40, right: 40, bottom: 40, left: 40 },
  width = $('.entry-content').width(),
  height = 300;

$(window).resize(function () {
  width = $('.entry-content').width();
});
```

After selections, scales are probably the most frequently used element in D3 because they faciliate such great control over data and screen space. I want to spend several posts documenting how scales work to help out anyone who is struggling with the concept. We'll start with a high level overview of what a scale is in D3 and then explore the individual objects to learn their nuances.

### What Are D3 Scales?

Essentially a scale is a convenience function for mapping input data to an output range, typically x/y positions or width/height. Scales can also be used to link data to arbitrary values like categories or days of the week, or to quantize data into "buckets".

There are two universal properties for any scale: the `domain` and the `range`. The `domain` serves as the input for your graph while the `range` represents the output.

#### Domain

Since the `domain` corresponds to our graph's input it can be either _continuous_ or _discrete_. You might think of a continous data set as any number from 1 to infinity while a discrete set would be every `Date` from January 1, 2012 to January 10, 2012. The takeaway is that continous data is essentially unbounded and discrete data is finite and easily quantified.

#### Range

The `range` defines the potential output that the scale can generate. Values from the domain are mapped to values in the range. Let's look at two examples to help clarify.

Say you have an _identity scale_, meaning whatever value you use for input will also be returned as the output. We'll call the scale `x`. If `x` has an input `domain` of 0 - 100 and an output `range` of 0 - 100, then your `scale of 1` will be 1. Your `scale of 50` will be 50. Here's another way to write it:

```js
x(50); // returns 50
```

Now let's change the scale a bit. Let's say that `x` still has an input `domain` of 0 - 100 but now it has an output `range` of `0 - 10`. What do you think our `scale of 50` will return? ... If you guessed 5 then you are the smart! Because we limited our potential output down to any number between 0 and 10 it narrowed the mapping from our `domain` to our `range`. Being able to expand or contract this mapping is the main value in using a D3 scale. If it's still not quite sinking in check out this great visual from [Jerome Cukier](http://www.jeromecukier.net/) ([@jcukier](https://twitter.com/#!/jcukier)).

![An example of how scales work](/images/2014/12/d3scale1.png)

Jerome has [an excelent blog post](http://www.jeromecukier.net/blog/2011/08/11/d3-scales-and-color/) covering scales in D3 which inspired me to write my own post. Definitely read his as well! I feel like a great way to learn something is to not only read about it a bunch but to write about it. Hearing different views on the same topic often helps me solidify a concept.

### Class Work Time

```js
var x = d3.scale.linear().domain([0, 100]).range([0, 10]);
```

I've included `d3` on the page so you can play around with it. Go ahead, bust open your developer tools or firebug and type `d3` into the console. It should return an Object full of methods.

Let's do some experiments with our `x` scale from earlier. Type the following to see what you get.

```js
x(0);
x(25);
x(99);
x(100);
```

In D3 a scale is both a `Function` and an `Object`. You can invoke a scale by using parenthesis: `x(100)` or you can set a property to change its behavior: `x.range([0, 1000])`. Let's try that! In the console type:

```js
x.range([0, 1000]);
```

Our scale's range used to be 0 - 10. Now that we've changed it to 0 - 1000, what do you think `x(100)` will equal? Keep in mind that 100 is the highest value in our domain. If you're not sure try it in the console. Actually try it in the console regardless of how sure you are! The console is cool as shit!

### To Be Continued...

Scales are a huge topic so we'll stop here for now. In the next post we'll talk about `linear`, `time` and `ordinal` scales; once you've mastered them everything else becomes a lot easier. Stay tuned :)

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)


---
title: 'D3 Basics: The Linear Scale'
tags:
  - Chain
  - D3
date: 2012-05-04T14:21:00.000Z
updated: 2014-12-30T06:48:52.000Z
---

## Heads up!

I wrote this post a few years ago when I was on Octopress. The code no longer works now that I've migrated to Ghost, but I'm keeping the post up in case any of it is useful for those who come along after -- Rob

```js
.chart {
  font-family: Arial, sans-serif;
  font-size: 10px;
}

.bar {
  fill: steelblue;
}

.axis path, .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}

.label {
  font-size: 12 px;
  fill: #FFF;
}

.point {
  stroke: #666;
  fill: red;
}
```

In [the last post](http://localhost:4000/blog/2012/05/03/d3-basics-an-introduction-to-scales/) we did a basic introduction to the concept of scales in [D3.js](http://d3js.org/). Today we'll look at our first scale and write some code to visualize it.

### Linear Scales

The most basic scale in D3 is the `linear scale` which maps a continous `domain` to an output range. To define a linear domain we'll need to first come up with a data set. Fibonacci numbers work well, so let's declare a variable `data` like so:

```js
var data = [1, 1, 2, 3, 5, 8];
```

The data set will represent our scale's input domain. The next step is defining an output range. Since we're going to be graphing these numbers we want our range to represent screen coordinates. Let's go ahead and declare a `width` and a `height` variable and set them to 320 by 150.

```js
var width = 320,
  height = 150;
```

We now have everything we need to create our first scale.

```js
var x = d3.scale
  .linear()
  .domain([0, d3.max(data)])
  .range([0, width]);
```

D3 methods often return a value of `self` meaning you can chain method calls onto one another. If you're used to jQuery this should be a common idiom for you. You'll notice that both the domain and the range functions accept arrays as parameters. Typically the domain only receives two values, the minimum and maximum of our data set. Likewise the range will be given the minimum and maximum of our output space. You could pass in multiple values to create a polylinear scale but that's outside the scope of our dicussion today.

In the domain function we're using a helper called `d3.max`. Similar to `Math.max`, it looks at our data set and figures out what is the largest value. While `Math.max` only works on two numbers, `d3.max` will iterate over an entire `Array` for us.

If you've been following along in your own file you should be able to open your console and type `x(8)` to get 300.

With just this information alone we have enough to build our first graph.

Fibonacci Sequence Chart 1.0

```js
(function () {
  var data = [1, 1, 2, 3, 5, 8];
  var width = 320;
  var height = 150;

  var x = d3.scale
    .linear()
    .domain([0, d3.max(data)])
    .range([0, width]);

  var svg = d3
    .select('#linear-scale-chart-1')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'chart');

  svg
    .selectAll('.chart')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    //.attr('y', function(d, i) { return i * 20 })
    .attr('y', function (d, i) {
      return i * 20;
    })
    .attr('width', function (d) {
      return x(d);
    })
    .attr('height', 15);
})();
```

````js
var data = [1, 1, 2, 3, 5, 8];
var width = 320
    height = 150;

var x = d3.scale.linear()
        .domain([0, d3.max(data)])
        .range([0, width]);

var svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'chart');

svg.selectAll('.chart')
        .data(data)
      .enter().append('rect')
        .attr('class', 'bar')
        .attr('y', function(d, i) { return i * 20 })
        .attr('width', function(d) { return x(d); })
        .attr('height', 15);
```

```css
.chart {
  font-family: Arial, sans-serif;
  font-size: 10px;
}

.bar {
  fill: steelblue;
}
```

### Break It Down

Let's go through the JavaScript piece by piece to outline what happened.

```js
var data = [1, 1, 2, 3, 5, 8];
var width = 320
    height = 150;

var x = d3.scale.linear()
        .domain([0, d3.max(data)])
        .range([0, width]);
```

The first block should be pretty familar at this point. We've declared our Fibonacci data, our explicit width and height and defined our scale. Nothing new here.

```js
var svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'chart');
```

In the next section we're declaring our `SVG` element. We use a D3 selection to grab the `body` tag and we append an `svg` tag onto it. Since D3 uses method-chaining we can keep assigning attributes to our SVG element. We declare the width and the height to match the explicit values set earlier and finally we give it a class name of `chart`.

```js
svg.selectAll('.chart')
        .data(data)
      .enter().append('rect')
        .attr('class', 'bar')
        .attr('y', function(d, i) { return i * 20 })
        .attr('width', function(d) { return x(d); })
        .attr('height', 15);
```

This last section is where it all ties together. Since we stored our SVG element in a variable called `svg` we're able to easily reference it again. We instruct D3 to create a `join` by calling the `data` method and passing in our `Array` of values. When D3 performs a join it steps through each element in the array and attempts to match it to a figure that already exists on the page. If nothing exists it will call the `enter` function. At this point it steps through the array again, passing the values to us so we can define new shapes. [For a much more in-depth explanation of joins refer back to this article.](http://bost.ocks.org/mike/join/)

In our case we're appending SVG `Rects` but it could just as easily be circles or other shapes. We give each rect a class of `bar` so we can style it with CSS. When we declare the `y` attribute instead of using an explicit value we create an `accessor`, a little helper function which takes a piece of data and an optional index as its arguments. In this case `d` will equal subsequent elements in our data array and `i` will equal their indices. For a much clearer picture of what's happening you can change it to read:

```js
    .attr('y', function(d, i) { console.log('d = data[' + i + '] = ', d); return i * 20 })
```

which will give you the following output.

```js
d = data[0] = 1
d = data[1] = 1
d = data[2] = 2
d = data[3] = 3
d = data[4] = 5
d = data[5] = 8
```

Since we're just trying to space out our bars along the y-axis we don't really care about the value of `d`. Instead we'll use the index, `i`, to offset each bar by a value of i \* 20.

In the last two lines we're going to finally use our linear scale to define our bar's width. Here they are again as a refresher.

```js
.attr('width', function(d) { return x(d); })
.attr('height', 15);
```

As each element of the array is passed to our width accessor it's run through the scale and the output returned. Since 8 is our maximum value it should extend all the way to the end of our range.

The final call is just an explicit height for each bar. Depending on the scale this bit can be automated but for simplicity sake we'll just use a hard coded value so we can get something on screen.

### Conclusion

Now that we've got one scale under our belt the others should be pretty easy to digest. Over the next couple of posts we'll focus on ordinal scales followed by time scales. Stay tuned and ping me if you have any questions. Thanks!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
````


---
title: D3.js and Octopress
tags:
  - Octopress
  - Chain
  - D3
date: 2012-05-02T14:20:00.000Z
updated: 2014-12-30T06:38:00.000Z
---

## Heads up!

I wrote this post a few years ago when I was on Octopress. The code no longer works now that I've migrated to Ghost, but I'm keeping the post up in case any of it is useful for those who come along after -- Rob

```css
.chart {
  font-family: Arial, sans-serif;
  font-size: 10px;
}

.bar {
  fill: steelblue;
}

.axis path,
.axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}
```

```js
var data = [1, 1, 2, 3, 5, 8];

var margin = { top: 40, right: 40, bottom: 40, left: 40 },
  width = $('.entry-content').width(),
  height = 300;

$(window).resize(function () {
  width = $('.entry-content').width();
});
```

This morning I was hoping to cover some of the basics of using D3.js. Along the way I realized I really wanted people to be able to see the graphs on the blog itself. I _could_ have used JSFiddle, but I didn't like all that chrome repeated across the page. So I came up with my own solution with a little bit of hacking :)

I'll have to save the basics for tomorrow since I've already spent way too much time just getting this setup. But I will offer a brief explanation of D3 and how I got it working on Octopress.

### What is D3.js?

D3 (formerly Protovis) is a library written by [Mike Bostock](http://bost.ocks.org/mike/) ([@mbostock](https://twitter.com/#!/mbostock)) which allows you to easily manipulate a DOM using data sets. While the implications of that statement are somewhat vague, D3 is generally used for doing data visualizations primarily in SVG. D3 can also work with regular DOM nodes however SVG is often the best tool to use if you're trying to draw a graph of some kind.

As a quick demo, here's a bar chart which visualizes an `Array` of Fibonacci numbers: `[1, 1, 2, 3, 5, 8]`

```js
(function () {
  function draw() {
    $('#chart-1').empty();

    var x = d3.scale
      .linear()
      .domain([0, d3.max(data)])
      .range([0, width - margin.left - margin.right]);

    var y = d3.scale
      .ordinal()
      .domain(d3.range(data.length))
      .rangeRoundBands([height - margin.top - margin.bottom, 0], 0.2);

    var xAxis = d3.svg.axis().scale(x).orient('bottom').tickPadding(8);

    var yAxis = d3.svg
      .axis()
      .scale(y)
      .orient('left')
      .tickPadding(8)
      .tickSize(0);

    var svg = d3
      .select('#chart-1')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'chart')
      .append('g')
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

    svg
      .selectAll('.chart')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', function (d, i) {
        return y(i);
      })
      .attr('width', x)
      .attr('height', y.rangeBand());

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0, ' + y.rangeExtent()[1] + ')')
      .call(xAxis);

    svg
      .append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .selectAll('text')
      .text(function (d) {
        return String.fromCharCode(d + 65);
      });
  }
  draw();
  $(window).resize(function () {
    draw();
  });
})();
```

Break open your developer tools and inspect the graph above. You'll notice that it's just SVG elements. For many the 2 best aspects of D3 are 1) That it works with regular SVG elements and 2) That it doesn't wrap that functionality in arbitrary objects which require a lot of configuration. This second aspect is where many graphing libraries fall short. As Justin Palmer ([@Caged](https://twitter.com/#!/caged)) [points out on his blog](http://dealloc.me/2011/06/24/d3-is-not-a-graphing-library.html):

> As long as you stay within the confines of the template, it’s simple, but, anytime you want customize a specific aspect of the original template, more configuration options are added to the library. You should avoid “design by configuration.”

D3 handles this by dumping the idea of templated visuals. There is no `makeBarGraph()` function in D3; instead you work directly with your data and the SVG elements. Essentially what you see is what you get, which can make the initial learning curve pretty steep. But because it's so non-prescriptive you can build just about anything with it.

### How do you integrate D3 and Octopress?

Since I want to write several more posts on D3 I figured it'd be good if I setup my own little system to help me generate most of the boilerplate. If you're lazy and want to skip to the end [here's a link to the template.](https://github.com/robdodson/octopress-templates)

#### Requiring D3

If you inspect the page you'll see that starting at the top of this post I'm requiring d3.js. There's a good chance I'll move that over into the site's header so it isn't required every time but if you're just doing a one off then that should be fine. Normally it's a good idea to require your javascript at the end of your page but I want to wrap all of my graphs in self-executing functions so they can seal their scope (and also because I'm lazy and want to use the same boilerplate stub code in each). As a result if you don't require d3 before the functions execute it'll throw an error.

I chose to put a copy of d3 into my Octopress `source/javascripts` so it would get compiled with the rest of my assets and deployed. If you'd prefer you can also grab D3 from the site.

```html
<script src="http://d3js.org/d3.v2.js"></script>
```

#### Adding the CSS

The next step is to add some CSS. Getting a `style` tag into the post ended up being trickier than I had first thought because Markdown strips out `style` tags. As a result every time I generate the site the CSS dissapears. The work around is to wrap the `style` tag in a `div` and put that at the top of the post.

Here are the basic styles I'm using:

```html
<div>
  <style type="text/css">
    .chart {
      font-family: Arial, sans-serif;
      font-size: 10px;
      margin-top: -40px;
    }

    .bar {
      fill: steelblue;
    }

    .axis path,
    .axis line {
      fill: none;
      stroke: #000;
      shape-rendering: crispEdges;
    }
  </style>
</div>
```

#### Margins and Resizing

Now that we have D3 included on the page and our CSS styles are being respected it's time to setup some useful defaults in another `script` tag. Typically I'll define the dimensions of my graph area as well as any margins that I might want to use.

If I'm going to use the same data set throughout I might put that in as well so I don't have to declare it over and over again. In our case the array of Fibonacci numbers is there.

```html
<!-- Global Variables and Handlers: -->
<script type="text/javascript">
  var data = [1, 1, 2, 3, 5, 8];

  var margin = { top: 40, right: 40, bottom: 40, left: 40 },
    width = $('.entry-content').width(),
    height = 300;

  $(window).resize(function () {
    width = $('.entry-content').width();
  });
</script>
```

The margin object can be really helpful when you're trying to move things around. For instance, to send something to the bottom of your graph you can just say `height - margin.top - margin.bottom`.

You'll notice that rather than giving it an explicit width I'm using jQuery to find our containing element's width. I'm trying to keep in line with the responsiveness of the Octopress theme so setting the width to match our containing element prevents the graph from breaking out if the user starts off with a small window.

I'm also including a handler for the `window` resize event. Whenever the user changes the size of their browser we'll update our global width variable and tell all of the dependent graphs to redraw themselves.

#### Our First Graph!

Finally I create a `div` to contain our visualization. Beneath the `div` I've included another script tag with a self-executing function. When run, the function will grab its sibling and populate it with an SVG element. Here's the code (don't freak out when you see it all, we'll go over what everything does in a later post).

```html
<!-- D3.js Chart -->
<div id="chart-1"></div>
<script type="text/javascript">
  (function () {
    function draw() {
      $('#chart-1').empty();

      var x = d3.scale
        .linear()
        .domain([0, d3.max(data)])
        .range([0, width - margin.left - margin.right]);

      var y = d3.scale
        .ordinal()
        .domain(d3.range(data.length))
        .rangeRoundBands([height - margin.top - margin.bottom, 0], 0.2);

      var xAxis = d3.svg.axis().scale(x).orient('bottom').tickPadding(8);

      var yAxis = d3.svg
        .axis()
        .scale(y)
        .orient('left')
        .tickPadding(8)
        .tickSize(0);

      var svg = d3
        .select('#chart-1')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'chart')
        .append('g')
        .attr(
          'transform',
          'translate(' + margin.left + ', ' + margin.top + ')'
        );

      svg
        .selectAll('.chart')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', function (d, i) {
          return y(i);
        })
        .attr('width', x)
        .attr('height', y.rangeBand());

      svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + y.rangeExtent()[1] + ')')
        .call(xAxis);

      svg
        .append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .selectAll('text')
        .text(function (d) {
          return String.fromCharCode(d + 65);
        });
    }

    draw();

    $(window).resize(function () {
      draw();
    });
  })();
</script>
```

After we declare the self-executing function we include another function called `draw`. Using a separate function lets us later _redraw_ the graph if the user resizes their browser. This also works on the iPhone when the user changes from portrait to landscape mode. Inside of `draw` we first make sure that the containing div is empty (otherwise we'd end up drawing graphs on top of one another). You can skip most of the D3 code—we'll cover that over the next couple of days—but take a look at the last few lines where we call `draw()` and add another handler for `window.resize`. Whenever the user changes their browser size our global `width` value will be updated, then our graphs will redraw themselves using this new width.

At the moment you need to add this handler to each of your visualizations. Not terrible but not very DRY either. I think in a future iteration I'll add a queue which holds a reference to each `draw` instance and calls them in sync. For now this is the quick and dirty way to get a graph up on Octopress. [You can download the entire post template from Github.](https://github.com/robdodson/octopress-templates) Enjoy!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)


---
title: Deploying Your First Node.js and Socket.io App to Heroku
date: 2012-06-05T05:01:00.000Z
updated: 2015-01-02T08:58:00.000Z
exclude: true
---

At my office we like to shoot each other from across the room with Nerf guns. In an effort to actually remain productive we've implemented a rule that whenever you get shot you're dead for 1 hour. But that hour can be a little tricky to keep track of between players. Who's dead and who isn't? Am I about to be shot right now??

In an effort to keep track of things (and also because I need to write a blog post) I decided to start working on a little [Node.js](http://nodejs.org/) and [Socket.io](http://socket.io/) app. In this first post I'm just going to get things setup and deploy them to Heroku. Hopefully tomorrow we can work on implementing the actual timers. If you've never worked with Heroku before [you'll need to follow their getting started guide](https://devcenter.heroku.com/articles/quickstart) to make sure you have all the proper command line tools. Don't worry, it's really easy and their documentation is **awesome**.

### Express it!

To start us off we'll use [Express](http://expressjs.com/) since it provides a nice, [Sinatra](http://www.sinatrarb.com/) like layer on top of Node. If you haven't installed Node yet you can do it from the [Node.js](http://nodejs.org/) site. The installer will also include `npm` which is Node's package manager. Following the instructions on the [Express](http://expressjs.com/) site you should be able to just type:

```bash
npm install -g express
```

Now that you have Express installed you can use it to create a new project.

```bash
express defcon
```

I'm calling my project `defcon` because I luvz [WarGames](http://en.wikipedia.org/wiki/WarGames). You can call yours whatever you'd like :)

Next we need to `cd` into the defcon folder so we can install Socket.io and our other dependencies. There's a version of Socket.io designed to work with Express so we'll install that one.

```bash
npm install -d  # install Express dependencies
npm install socket.io express
```

We'll also need to add socket.io to our `package.json` which is similar to a `Gemfile` if you're coming from Ruby, or just a big list of file dependencies if you're coming from something else :D When you distribute your app other developers can just run 'npm install -d' and it will add all of the modules listed to their project. Heroku will also use our `package.json` when we push our app to their servers. I'm also going to replace the [Jade](http://jade-lang.com/) rendering engine with [EJS](http://embeddedjs.com/) since it's easier for me to work with.

```json
{
  "name": "defcon",
  "version": "0.0.1",
  "private": true,
  "dependencies": {
    "express": "~2.5.8",
    "ejs": "~0.7.1",
    "socket.io": "~0.9.6"
  },
  "engines": {
    "node": "0.6.x"
  }
}
```

The tilde `~` character tells NPM that it's ok to install this version of our module, or anything less than the next highest version number. So the following are equivalent: `"~1.2" = ">=1.2.0 <2.0.0"`. This is typically a good practice with modules because you'd like to receive bug fixes and patches but you don't want to let your app potentially download a v2 of some library which breaks the API.

Run `npm install -d` again to make sure that `ejs` and anything else you've added are properly installed. Open up your app.js file that Express provided for you. We'll need to change a lot of stuff so it's probably easiest for you to just copy and paste this one that I've already prepared. Paste it into a new file if you'd like so you can compare all the differences.

```js
var express = require('express'),
  app = express.createServer(express.logger()),
  io = require('socket.io').listen(app),
  routes = require('./routes');

// Configuration

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

// Heroku won't actually allow us to use WebSockets
// so we have to setup polling instead.
// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
io.configure(function() {
  io.set('transports', ['xhr-polling']);
  io.set('polling duration', 10);
});

// Routes

var port = process.env.PORT || 5000; // Use the port that Heroku provides or default to 5000
app.listen(port, function() {
  console.log(
    'Express server listening on port %d in %s mode',
    app.address().port,
    app.settings.env
  );
});

app.get('/', routes.index);

var status = 'All is well.';

io.sockets.on('connection', function(socket) {
  io.sockets.emit('status', {status: status}); // note the use of io.sockets to emit but socket.on to listen
  socket.on('reset', function(data) {
    status = 'War is imminent!';
    io.sockets.emit('status', {status: status});
  });
});
```

In my views folder I've created a `layout.ejs`...

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Title</title>
    <meta name="description" content="" />
    <meta name="author" content="" />

    <!-- HTML5 shim, for IE6-8 support of HTML elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- styles -->
    <link href="/css/main.css" rel="stylesheet" />
  </head>
  <body>
    <%- body %>
    <script src="/socket.io/socket.io.js"></script>
    <script src="/js/libs/jquery.js"></script>
    <script src="/js/main.js"></script>
  </body>
</html>
```

and an `index.ejs`.

```html
<div id="status"></div>
<button id="reset">Reset!</button>
```

If you'd like you can open up `routes/index.js` and look around but you don't need to. It should render `layout.ejs` and `index.ejs` by default.

A few more items to go...We need to add a copy of [jQuery](http://jquery.com/) to our `public` folder and also a `main.js` file. I've renamed the structure to look like this:

```
public
|
|_ css
|_ img
|_ js
    |_ libs
        |_ jquery.js
    |_ plugins
    |_ main.js
```

I guess that's just a habit of using Backbone Boilerplate all the time :) Here's what `main.js` should look like:

```js
var socket = io.connect(window.location.hostname);

socket.on('status', function(data) {
  $('#status').html(data.status);
});

$('#reset').click(function() {
  socket.emit('reset');
});
```

It's important to note the line that says `var socket = io.connect(window.location.hostname);`. In the socket.io docs they usually tell you to connect to `localhost` but since we're on heroku we'll need to instead connect to whatever our custom domain is.

### Cross your fingers

At this point we should be ready to test everything. From the root of your project run `node app.js`. If all goes well you should see something like this:

```
  info  - socket.io started
Express server listening on port 5000 in development mode
```

If not leave me a comment and I'll see if I can help you debug it. However let's assume that everything DID go well for you and now you're ready to connect to the local version of your app. Point your browser to [http://localhost:5000](http://localhost:5000) and you should see something like this:

![All is well with Socket.io](/images/2014/12/all_is_well_with_sockets.png)

Now open another browser window and also point it at localhost:5000. In one of the windows click the button that says `Reset` which should change the copy in _both_ windows to 'War is imminent!'

![War is Immentin with Socket.io](/images/2014/12/war_is_imminent_sockets.png)

### Git'er done!

Alright we should have a functioning app at this point so let's put this baby into Git.

```
git init
echo 'node_modules' >> .gitignore
```

We'll ignore the node_modules directory so Heroku can create its own version. Heroku requires that we deploy our app from Git which is kind of an awesome practice. We'll also need to define a `Procfile` which will list the processes that our app can run.

```
touch Procfile
echo 'web: node app.js' >> Procfile
```

To verify that our `Procfile` is working we can use Heroku's built in utility called `foreman`.

```
$ foreman start

23:47:32 web.1     | started with pid 53197
23:47:32 web.1     | info: socket.io started
23:47:32 web.1     | Express server listening on port 5000 in development mode
```

Point your browser to `localhost:5000` to verify that things are still working. If everything looks good we're ready to commit to git.

```
git add .
git commit -m 'initial commit'
```

### Deploy to Heroku

Now that our app is safely tucked away in git it's time to fire up a new Heroku instance.

```
$ heroku create --stack cedar
```

Heroku will do the work of setting up a new `git remote` for us to push our app to.

```
$ git push heroku master
```

We'll need to scale our web process before we can use the app.

```
$ heroku ps:scale web=1
```

To see which processes are running on Heroku you can use the `heroku ps` command.

```
$ heroku ps

Process       State               Command
------------  ------------------  --------------------------------------------
web.1         up for 10s          node app.js
```

With everything setup we should be able to run `heroku open` which will fire up our browser and direct it to an instance of our app. There seems to be a fair bit of latency so it can take several seconds for the initial status of 'All is well' to show up. If you see the Reset button with nothing above it give it around 10 seconds to see if it eventually updates. Open another browser window and point it at the Heroku domain in the address bar. If you press the Reset button in one window it should immediately update in the next one.

![Heroku: War is Imminent](/images/2014/12/heroku_war_is_imminent.png)

### Wrapping up

Well I hope you enjoyed this brief tour of Socket.io and Heroku. Before we sign off let's make sure to turn off the running process on our Heroku instance:

```
$ heroku ps:scale web=0
```

If all went well you should have a decent starting point to build your own Socket.io app. If you're still having trouble checkout some of the great documentation from Heroku and/or leave a comment:

[https://devcenter.heroku.com/articles/nodejs](https://devcenter.heroku.com/articles/nodejs)

[https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku](https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku)

Good Luck! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Antsy
- Sleep: 5
- Hunger: 0
- Coffee: 1


---
title: Design by Configuration Sucks
tags:
  - Chain
  - Design Patterns
date: 2012-05-11T02:08:00.000Z
updated: 2014-12-30T07:05:34.000Z
exclude: true
---

### What is design by configuration?

As an experienced developer if you find that you are performing the same actions over and over naturally your brain will start to think "Hey, this isn't very DRY". DRY, or the principle of "Don't Repeat Yourself" is pretty common dogma for most developers. How many times have you heard something like, "If you're doing it twice, you're doing it wrong." Typically when I do an action more than once I start looking for ways to wrap the work into functions or objects. This process can easily lead to what some refer to as "Design by Configuration," or breaking your work into configurable operations.

To explore this concept a bit more, and why I think it's rather brittle, let's come up with a hypothetical. In our scenario we're working for a large company redesigning their web presence. On each page we have widgets of various shapes and sizes. Here's an example of some:

```html
<div class="widget-container grey-background rounded-corners">
  <div class="widget" title="Awesome Widget" data-foo="bar">
    <p>Hey I'm an awesome widget!</p>
  </div>
</div>

<div class="widget-container red-background square-corners">
  <div class="widget" title="Stellar Widget" data-foo="baz">
    <p>Bodly going where no widget has gone before...</p>
  </div>
</div>
```

You've probably already noticed that our two widgets are nearly identical with only subtle differences in the classes, titles and paragraph content. That seems like a great candidate for automation! Because we don't know the names of, or how many classes we might support, we'll try to make it really flexible so we can pass in tons of different values.

```js
function makeWidget(attributes) {
  var classes, title, data, paragraph, widget;

  classes = attributes['classes'] || '';
  title = attributes['title'] || '';
  data = attributes['data'] || '';
  paragraph = attributes['paragraph'] || '';

  widget =
    '<div class="' +
    classes +
    '">' +
    '<div class="widget" title="' +
    title +
    '" data-foo="' +
    data +
    '">' +
    '<p>' +
    paragraph +
    '</p>' +
    '</div>' +
    '</div>';
  $('body').append($(widget));
}

makeWidget({
  classes: 'widget-container grey-background rounded-corners',
  title: 'Hello World!',
  data: 'ribeye',
  paragraph: 'Neato paragraph!'
});
```

You can play around with the previous code snippet and create your own widgets in the console or on jsFiddle. Writing a little function like this seems pretty standard for a lot of cases and I don't want to argue against it entirely but I do want to point out a few gotchas.

### Everything was perfect. Until it wasn't

Let's say that our code works perfectly. We do about 95% of the project and toward the end the client mentions an extra widget that slipped their mind. They'd like it to act just like all the other widgets but they also want to add an additional class to the `p` tag. "Not a problem," you think, "I'll just add a paragraphClasses attribute to our hash."

```js
function makeWidget(attributes) {
  var classes, title, data, paragraph, paragraphClasses;
  widget;

  classes = attributes['classes'] || '';
  title = attributes['title'] || '';
  data = attributes['data'] || '';
  paragraph = attributes['paragraph'] || '';
  paragraphClasses = attributes['paragraphClasses'] || '';

  widget =
    '<div class="' +
    classes +
    '">' +
    '<div class="widget" title="' +
    title +
    '" data-foo="' +
    data +
    '">' +
    '<p ' +
    paragraphClasses +
    '>' +
    paragraph +
    '</p>' +
    '</div>' +
    '</div>';
  $('body').append($(widget));
}

makeWidget({
  classes: 'widget-container grey-background rounded-corners',
  title: 'Hello World!',
  data: 'ribeye',
  paragraph: 'Neato paragraph!'
});
```

Easy enough right? Well, yeah... except you just changed one line that affects ALL of your widgets. Hope you got all those quotation marks perfect!

Later on your client decides that they'd like to add one more widget but this time it should have two paragraph tags instead of one. That puts us in a bit of a dilemma... We could modify our `makeWidget` function to maybe check if there's a `subParagraph` attribute, or we could just hand code this one widget on this one page. Er..did I say one page? Well actually the client just called and said this widget will need to appear on _4_ pages.

At this point we can either hack our makeWidget function, create an entirely new function like `makeSuperWidget` or we could hand code a custom widget in 4 places and hope that if there are any changes we remember to update all 4. Typically I think most people choose either the first or second option, figuring that the changes to the original function are small enough or that creating a new function is still much DRYer than hand coding the thing 4 times.

At this point I feel like we've now fallen into the trap of design by configuration. Basically we've setup our function to accept configuration parameters but the core elements are static and extremely hard to change. We can add lots of classes to our containing div and our first p tag but what if we want to add other attributes? Do we need to break open the code every time?

I think a better solution looks a lot like the syntax for D3.js, which provides helpers to make the process of widget creation easier, but it doesn't completely remove the developer from the process. Here's some pseudo code to illustrate what I think might be a better approach:

```js
widget = make('div')
  .attr('class', 'widget-container grey-background rounded-corners')
  .attr('title', 'Sweet containing div')
  .attr('data-zerp', 'porkchops')
  .append('div')
  .attr('class', 'widget')
  .attr('title', 'Slick inner div')
  .attr('data-foo', 'short-rib')
  .attr('data-bar', 'cutlet')
  .attr('data-baz', 'filet')
  .append('p')
  .html('I can haz contents?')
  .sibling('p')
  .html('I too can haz contents?');
```

Unfortunately this is still a lot of code and my first solution to slim it down is to create a helper function. At that point we're basically back to design by configuration... I'm not entirely ready to give up on this approach because I feel like their _might_ be something here, I'm just not sure what yet. I think the design by configuration problem falls right into that sweet spot between not needing to create a factory and obviously needing to create a factory. I'll try to explore this more in a later post. For now it's time for bed.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)


---
title: Don't use jQuery plugins with Shadow DOM
date: 2017-06-25T00:00:44.000Z
updated: 2017-06-29T17:19:54.000Z
---

This is a post I should have written a loooong time ago...

**tl;dr:** jQuery plugins don't work inside of Shadow DOM because typically they try to query for something starting at the document level and the shadow root blocks this.

## A super handwavy explanation of jQuery plugins (featuring shitty drawings)

jQuery plugins work by latching on to an element, stamping a template inside of it, and then (often times) querying for items in that template using `$()`.

For example, you might initialize a [WYSIWG](https://en.wikipedia.org/wiki/WYSIWYG) plugin like this:

```html
<div class=".container"></div>
<script>
  $('.container').wysiwg({ // options });
</script>
```

At which point it will fill the `.container` element with some template markup.

![Diagram of document, container, and template markup.](/images/2017/06/jquery-sd-1.png)

Often times the plugin will want to reference specific nodes in the template to give them behaviors. In the above diagram the `.foo` element represents a footer with a few controls inside of it. The plugin *may* attempt to use `$('.foo')` to reach this element. It's important to note that `$('.foo')` is equivalent to `document.querySelector('.foo')`.

![Diagram of querying from the document to the .foo element](/images/2017/06/jquery-sd-2.png)

## How is this different with Shadow DOM?

The primary thing to note about Shadow DOM is that it provides ***DOM encapsulation*** as well as style scoping.

![Diagram of a shadow root creating a boundary around the .container element](/images/2017/06/jquery-sd-3.png)

In other words, you can't query for something inside of a `shadow root` unless you start the query from within the `shadow root` itself. If you try to query from the document level (or really any point outside of the `shadow root`), the shadow boundary will block you.

![Diagram of shadow boundary blocking a query](/images/2017/06/jquery-sd-4.png)

This is actually an intended feature of Shadow DOM. I don't know if you've ever been in a situation where you *accidentally* query something inside of a jQuery plugin (or maybe a plugin accidentally queries some other element on your page) but it can lead to breakages pretty fast. By encapsulating a component's DOM we can prevent such scenarios from happening. This also means that components built with Shadow DOM can be safely dropped into big framework apps and they won't blow up the world.

## But the plugin works in Firefox!

Complicating this whole issue is the fact that effectively polyfilling Shadow DOM can be pretty tricky. As a result folks might see a situation where the plugin seems to work in Firefox (which currently does not support Shadow DOM) but breaks in Chrome or Safari. If you're seeing this behavior then you're almost certainly running into a situation where native Shadow DOM is preventing the plugin from querying something inside of a `shadow root`.

## So... how do I fix it?

Yeah this is where things get a bit tricky. There's no silver bullet fix to this issue. If you're putting a jQuery plugin inside of a component's Shadow DOM, then your component is probably too big. See if you can factor it down into smaller pieces. Maybe the plugin could end up being a leaf node that just sits along side your other Web Components.

Another alternative is to see if you can distribute the plugin as a "Light DOM" child of the component using [Shadow DOM's `<slot>` element](https://www.webpackbin.com/bins/-KnRWY0uGYLO6oBIx73l). You'll need to write some extra code to get access to your distributed children and install listeners on them, but this might be  a workable solution depending on how your page is setup.

## Conclusion

jQuery plugins are great but they were created in an era before Shadow DOM. Trying to mix the two will more often than not lead to bugs and confusion. If you're having a hard time getting them to work in your app, ask yourself if *everything* needs to be in the Shadow DOM, or if it might be better to only use Shadow DOM for the UI components where you know you want a strong encapsulation boundary.


---
title: Easily upgrade Ghost 0.x to 2.0
tags:
  - Ghost
excerpt: Upgrade from Ghost 0.x to 2.0 the quick and easy way.
date: 2019-01-14T00:40:51.000Z
updated: 2019-01-14T00:47:57.000Z
---

Over the weekend I updated my ancient [Ghost](https://ghost.org/) blog to version 2.0. This was harder than I expected so I wanted to share the strategy that worked for me. 

This will require nuking your old server—which sounds scary, but is *so* much easier than upgrading it in place. If all you're doing is running Ghost then it may be no big loss—it wasn't for me at least 😛

If you're doing a bunch of other stuff on your server then you may want to try a different guide.

It's also worth mentioning that in this post I'll use a one-click Ghost install on Digital Ocean so I don't have to deal with setting everything up myself. I am lazy 🤤

## Backup

1. Go to the **Labs** section of your Ghost admin page (`yourblog.com/ghost`) and click export to get your JSON data. You'll use this to recreate your posts.
2. Download your images. The easiest way to do this is with scp. [Here's a little cheatsheet if you're unfamiliar with it](https://devhints.io/scp).

```bash
cd /var/www/ghost/content
sudo zip -r images.zip images    
scp YOUR_USERNAME@YOUR_SERVER_IP:/var/www/ghost/images.zip /local/path/to/file
```

You can attempt to download your theme as well but if you're going from 0.x to 2.0 I think there's a *really good chance* it will not work.

## Locally migrate your post data

**This step is key**. You can't just import Ghost 0.x data into a Ghost 2.0 blog. You first have to import it into a Ghost 1.0 blog, export it again, and import *that* JSON into the 2.0 blog.

I tried to setup Ghost 1.0 on my previous server but it was a pain. I was running Ubuntu 14 but Ghost CLI will blow up if you're not running Ubuntu 16 or above. Better to just do these steps locally.

You'll need to install the [ghost-cli](https://docs.ghost.org/api/ghost-cli/) and create a local version of Ghost 1.0. You'll also want to make sure you're running Node 8 or above.

```bash
node --version # hopfully >=8, otherwise upgrade node first
npm install -g ghost-cli
mkdir ghost-v1
cd ghost-v1
ghost install --v1
```

This should fire up a server on `localhost` that you can access to setup your blog. Once you've done that, go to the **Labs** section of the Ghost admin page and import the JSON you downloaded earlier. You may see some warnings but I was able to safely ignore these. They seem related to duplicate content from 0.x to 1.0.

You can also replace the `content/images` directory with the one you downloaded from your old server.

If all goes well you should be able to preview your content in the Ghost 1.0 casper theme.

Finally, in the Labs section use the export command to retrieve your Ghost 1.0 JSON. You don't need to mess with the images because Ghost 0.x, 1.0, and 2.0 all seem to use the same directory structure for `/images`.

## Create a new Droplet

If you use DigitalOcean or another service that provides one-click installs, now's the time to create a new Ghost 2.0 instance, ideally running on Ubuntu 18.

Grab the IP for the new server but don't log into it just yet.

## Setup DNS and SSL

Go to your domain registrar and update your records to point at the IP for your new server. If you have a simple setup then you may just need to update the `A` record. It will take a while for the DNS to propagate (~15 minutes to an hour).

You can use [a DNS checker](https://dnschecker.org/) to verify that the domain is pointing at your server's IP.

## Login to the new server

When you first login the server *should* kickoff the ghost CLI install step. It will walk you through a few steps similar to the ones you did during the previous local install. Once it's finished, sign in to your Ghost admin, import your JSON, and use `scp` to copy over your images.

If all goes according to plan then you should be done. Yay! 🎉

As a last step you should consider doing some server hardening on your new Ghost instance. [This guide by Rob Ferguson](https://robferguson.org/blog/2017/08/12/migrating-from-ghost-0-x-to-ghost-1-x/#serverhardening) seems like a good next step.

I hope this blog post helps those of you in the same boat as me. Good luck!


---
title: Ending My First Chain
tags:
  - Chain
date: 2012-06-26T05:58:00.000Z
updated: 2014-12-31T00:22:58.000Z
---

_Note to readers: Since writing this post I've gone back and hidden a bunch of the posts that I created during this chain because they were bitrotting. Their URLs will still work but they now have a big warning at the top._

Why did I do it?

Everything started because of a [blog post written by a fellow named Chris Strom.](http://japhr.blogspot.com/2012/04/366-or-how-i-tricked-myself-into-being.html) Chris wrote every single day, for a year, and in that time he managed to self publish 3 books. I think many people would be happy to publish a book in like a couple years. At Chris' rate he was cranking one out nearly every 3-4 months. Amazing.

I started thinking... this whole writing thing has got to be like exercise. If you just will yourself to do it, it'll be hard at first but after a while _surely_ it becomes a habit. And who doesn't want to be in the habit of exercising more?

Writing, self-reflection, discovery... these are _really_ important. I get by in my career by reading the stuff that other people have been generous enough to put down on the page (or blog, as the case may be). If I have a problem I just type it into the little magical Google box and out pops an answer.

## That's incredible!

But that system doesn't exist unless some of us pay back into it. None of this information that we take for granted is being churned out by some machine. It's churned out by people!

## It's hard!

And because it's hard, like exercise, most of us don't do it. We can all be better at what we do, especially if it's going to be our life's work. For me that means setting aside some time to work a little extra and write about my successes and failures. It means willing myself to push beyond what I normally think I can do and hoping that if I stick with it, eventually pieces will fall into place, and doors will unlock.

## What did I learn?

I learned a ton writing every day for 60 days. My posts were at times very scattershot, Ruby one day, D3.js the next; random Sublime tips after that, etc etc etc. I get frustrated and I needed to switch gears.

There was a part of me that didn't think I would be able to go all 60 days. I have been a total quitter more times than I'd like to admit and the older I get the more I realize what a massive disservice that is to one's self. Finishing isn't the most important thing, it's the _only_ thing. It doesn't matter if you finish covered in sinew and tree branches... just finish!

## What's next?

I've got two ideas kicking around. One is to keep following in Chris' steps and to self publish a book. I was dead set on this until a very fateful evening when I watched [Indie Game: The Movie.](http://buy.indiegamethemovie.com/) Now I can't get the idea of self-publishing a _very_ tiny game out of my mind... Thankfully I have 3 weeks in Europe to think it over.


---
title: Exploring HTML Imports
tags:
  - Web Components
  - HTML Imports
  - Custom Elements
date: 2013-08-20T20:07:00.000Z
updated: 2014-12-31T02:18:59.000Z
---[Web Components](http://robdodson.me/blog/2013/03/17/why-web-components/) have come a long way in the past few months and one of the technologies that I'm most interested in is [HTML Imports](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/imports/index.html) (or "imports", for short). Imports allow you to load additional documents into your page without having to write a bunch of ajax. This is great for [Custom Elements](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/custom/index.html) where you might want to import a suite of new tags. I spent the day playing with imports and thought it would be useful to write up my progress.

## The Lowdown

Imports are a new type of `link` tag which should be familiar to you since that's also how we load our stylesheets.

```html
<link rel="stylesheet" href="/path/to/styles.css" />
```

For an import we just replace the `rel` with one of type `import`.

```html
<link rel="import" href="/path/to/some/import.html" />
```

## Support

Native imports are currently only available in Chrome. Be sure to check the [support brackets on caniuse](http://caniuse.com/#feat=imports) to see if things have changed since the writing of this article. If you'd like to play with imports today you can leverage the [webcomponents.js](http://webcomponents.org/) polyfill.

## A Basic Example

OK so what's a very basic import look like?

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Basic HTML Imports</title>
    <!-- Pull in our blog post example -->
    <link rel="import" href="/imports/blog-post.html" />
  </head>
  <body>
    <p>Hello World!</p>
  </body>
</html>
```

In its simplest form an import works just like calling a stylesheet. We have to make sure there's a document to import so let's create a fake blog post in `imports/blog-post.html`.

```html
<div id="blog-post">
  <h1>Awesome header</h1>
  <p>Here is some really interesting paragraph content.</p>
</div>
```

To test, you'll need to host your `index.html` and `imports/` folder on a local server. I recommend [serve](https://github.com/visionmedia/serve) if you don't already have one installed.

Once you have that setup, visit your index page. If you take a look at the console you can see the request returning.

![Our first HTML import!](/images/2014/12/imports-console.jpg)

Well that's cool, but now what?

Let's grab the content of the import using some JavaScript and append it to the body. We'll do this back in our `index.html`.

```html
<body>
  <p>Hello World!</p>

  <script>
    var link = document.querySelector('link[rel=import]');
    var content = link.import.querySelector('#blog-post');
    document.body.appendChild(document.importNode(content, true));
  </script>
</body>
```

First we query the `link` tag which loaded our import. Then we extract our `#blog-post` element and store it in a variable called `content`. In browsers with native support for imports (i.e. Chrome and Opera) notice that we don't have to write any event handler code to wait till the import has loaded, we can just assume the content is there and start working with it. Finally we add the new content to our `body`.

If you're following along you should end up with something like this:

![Basic Import Example](/images/2014/12/imports-screen1.jpg)

Exciting, I know ;) But it demonstrates a no frills approach to loading content that doesn't require ajax and writing our own event handlers. Let's keep digging to see what else we find...

## A Basic Example with Polymer

Polymer is a library that sugars the Web Components APIs and seeks to enable the use of Web Components in all modern browsers. The hope is that devolopers will use Polymer to inform the W3C on which direction to take with Web Components; so rather than wait for a stinky spec, we can guide the implementation process.

Polymer attempts to keep parity with the the evolving specifications but obviously there are some places where the API must differ because of the limitations of current browsers. In the case of HTML Imports, Polymer waits for the `DOMContentLoaded` event before triggering the actual import process. This means we need to listen for the `HTMLImportsLoaded` event on either `window` or `document` to know when it is finished. Let's add that to our `index.html`.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Basic HTML Imports</title>
    <link rel="import" href="/imports/blog-post.html" />
  </head>
  <body>
    <p>Hello World!</p>

    <!-- Include platform.js -->
    <script src="/bower_components/webcomponentsjs/webcomponents.js"></script>

    <!-- Listen for the HTMLImportsLoaded event -->
    <script>
      window.addEventListener('HTMLImportsLoaded', function() {
        var link = document.querySelector('link[rel=import]');
        var content = link.import.querySelector('#blog-post');
        document.body.appendChild(document.importNode(content, true));
      });
    </script>
  </body>
</html>
```

Using the above we should get the same results as before.

![Basic Import Example with Polymer](/images/2014/12/imports-screen1.jpg)

You might notice that I used `webcomponents.js` instead of only including the [HTML Imports polyfill](http://webcomponents.org/polyfills/html-imports/). The Web Components polyfills are structured so you can take any of the polyfills à la carte but I find it's easier to just include all of `webcomponents.js` when I'm experimenting, rather than worry if I have each individual polyfill loaded. That's just personal preference (in other words: I'm lazy).

## Using Scripts in our Imports

Let's look at using `<script>` tags inside of our import. We'll start by removing the `<script>` block from our `index.html`.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Basic HTML Imports</title>
    <link rel="import" href="/imports/blog-post.html" />
  </head>
  <body>
    <h1>Boring header</h1>
    <p>Hello World!</p>
  </body>
</html>
```

Then we'll transfer that script block over to our blog post in `imports/blog-post.html`.

```html
<div id="blog-post">
  <style>
    h1 {
      background: lightgreen;
      color: green;
    }

    p {
      font-size: 16px;
      font-family: Helvetica, Arial, sans-serif;
      color: green;
      font-weight: bold;
    }
  </style>

  <h1>Awesome header</h1>
  <p>
    Here is some really interesting paragraph content. It comes with its own stylesheet!
  </p>
</div>

<script>
  // thisDoc refers to the "importee", which is blog-post.html
  var thisDoc = document.currentScript.ownerDocument;

  // thatDoc refers to the "importer", which is index.html
  var thatDoc = document;

  // grab the contents of the #blog-post from this document
  // and append it to the importing document.
  var content = thisDoc.querySelector('#blog-post');
  thatDoc.body.appendChild(thatDoc.importNode(content, true));
</script>
```

If we run this we should get the following output _(note: I've included a style element as well)_.

![Imports with Styles](/images/2014/12/imports-screen2.jpg)

An important thing to take notice of is the relationship between `thisDoc` and `thatDoc`. `thisDoc` refers to the `blog-post.html` document, while `thatDoc` refers to our `index.html` file. It's useful to distinguish between the two so we can `querySelector` for `#blog-post` and not worry that we may have grabbed something out of the importing document. _Thanks to [Dominic Cooney](https://twitter.com/coonsta) for the heads up on this._

You'll also notice that since the import has access to our `document` object it is able to add itself to the page. In practice you probably wouldn't want imports adding themselves wherever, but the important takeaway is that **anything imported can access the main `document`**. This means an import could register itself as a Custom Element using our `document` object and we wouldn't need to write any additional code. We're almost to that point so let's keep going...

## Using Templates in our Imports

I'm getting a little tired of our fake "blog post" so let's switch over to something more practical. We'll use [Chart.js](http://www.chartjs.org/) to create a very simple pie diagram and we'll use the new `<template>` tag to hold the contents of our import. If you haven't heard of the template tag before [check out this introduction](/html5-template-tag-introduction).

I've updated the `index.html` so it imports a new `chart.html` file.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Imports with Templates</title>
    <!-- Make sure to import chart.html -->
    <link rel="import" href="/imports/chart.html" />
  </head>
  <body>
    <h1>Quarterly Pokemon Sales</h1>
  </body>
</html>
```

Here's what `imports/chart.html` looks like:

```html
<!-- Include Chart.js so our import can use it -->
<script src="/lib/Chart.min.js"></script>
<template id="chart-pie">
  <canvas id="myChart" width="200" height="200"></canvas>
  <script>
    var data = [
      {
        value: 30,
        color: '#F38630'
      },
      {
        value: 50,
        color: '#E0E4CC'
      },
      {
        value: 100,
        color: '#69D2E7'
      }
    ];

    // Get the context of the canvas element we want to select
    // It's ok to use document here because this script block won't
    // activate till it's added to the page.
    var ctx = document.getElementById('myChart').getContext('2d');
    var myNewChart = new Chart(ctx).Pie(data);
  </script>
</template>

<script>
  // thisDoc refers to the "importee", which is chart.html
  var thisDoc = document.currentScript.ownerDocument;

  // thatDoc refers to the "importer", which is index.html
  var thatDoc = document;

  // grab the contents of #chart-pie from this document
  // and append it to the importing document.
  var template = thisDoc.querySelector('#chart-pie');
  thatDoc.body.appendChild(thatDoc.importNode(content, true));
</script>
```

We're creating a new `<template>` which contains a canvas tag and a script block to create our pie chart. The advantage of using a template tag is that any script blocks inside of it will not execute until we clone the contents and add them to the DOM.

Running the above gives us this:

![Imports with Template](/images/2014/12/imports-template.jpg)

Well this is interesting. We're importing an entire pie chart and our index page isn't cluttered with a bunch of code. Unfortunately we don't have much control over where the pie chart ends up. It would be nice if we could turn the contents of the import into a tag and place that wherever we please. Thankfully Custom Elements let us do just that!

## Using Custom Elements in our Imports

_I'll say in advance that you might need to read through this section a few times before you fully grok it. We're going to touch on a lot of new stuff so consider this the bonus round :)_

The final markup for our `index.html` file is going to look like this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Imports with Custom Elements</title>
    <link rel="import" href="/imports/chart.html" />
  </head>
  <body>
    <h1>Quarterly Pokemon Sales</h1>
    <chart-pie></chart-pie>
    <chart-pie></chart-pie>
    <chart-pie></chart-pie>
  </body>
</html>
```

We're going to use our new Custom Element, `chart-pie`, which will allow us to produce pie charts wherever we want. The result will look like this:

![Imports with Custom Elements](/images/2014/12/imports-custom-elements.jpg)

Obviously not the most amazing thing ever, but from a practical perspective being able to drop a pie chart on your page with one line of HTML is pretty sweet.

To create the `chart-pie` tag we'll need to create a [Custom Element](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/custom/index.html). Custom Elements are new tags with a lifecycle of JavaScript callbacks. Typically they use [Shadow DOM](http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom/) to hide their internal markup and expose attributes and specific styles to the client. For a full primer on Custom Elements, check out [this article by Eric Bidelman on HTML5Rocks](http://www.html5rocks.com/en/tutorials/webcomponents/customelements/).

Here's what our updated `imports/chart.html` looks like.

```html
<script src="/lib/Chart.min.js"></script>
<template id="chart-pie">
  <canvas class="myChart" width="200" height="200"></canvas>
</template>

<script>
  // thisDoc refers to the "importee", which is chart.html
  var thisDoc = document.currentScript.ownerDocument;

  // thatDoc refers to the "importer", which is index.html
  var thatDoc = document;

  var template = thisDoc.querySelector('#chart-pie');

  // Make sure you extend an existing HTMLElement prototype
  var ChartPieProto = Object.create(HTMLElement.prototype);

  // Setup optional lifecycle callbacks
  ChartPieProto.createdCallback = function() {
    // Create a shadow root to hold our template content
    var root = this.createShadowRoot();
    var clone = thatDoc.importNode(template.content, true);

    // Create the pie chart with Chart.js
    var data = [
      {
        value: 30,
        color: '#F38630'
      },
      {
        value: 50,
        color: '#E0E4CC'
      },
      {
        value: 100,
        color: '#69D2E7'
      }
    ];

    //Get the context of the canvas element we want to select
    var ctx = clone.querySelector('.myChart').getContext('2d');
    var myNewChart = new Chart(ctx).Pie(data);

    // Add the template content + chart to our Shadow DOM
    root.appendChild(clone);
  };

  var ChartPie = thatDoc.registerElement('chart-pie', {prototype: ChartPieProto});
  //var chartPie = new ChartPie();
  //var chartPie = document.createElement('chart-pie');
</script>
```

Let's walk through it piece by piece.

```html
<template id="chart-pie">
  <canvas class="myChart" width="200" height="200"></canvas>
</template>
```

On lines 1-3 we've shortened the `template` down so that it only contains our `canvas` tag. We'll use the Custom Element `createdCallback` to actually instantiate the chart in here.

```js
// thisDoc refers to the "importee", which is chart.html
var thisDoc = document.currentScript.ownerDocument;

// thatDoc refers to the "importer", which is index.html
var thatDoc = document;

var template = thisDoc.querySelector('#chart-pie');
```

Lines 6-12 should look familar from the last example. We're storing our two documents in variables and querying for the template tag.

```js
var ChartPieProto = Object.create(HTMLElement.prototype);
```

On line 15 we define the prototype for our Custom Element called `ChartPieProto`. This prototype extends the `HTMLElement` prototype which is a requirement for creating a new element.

```js
ChartPieProto.createdCallback = function() {
  ...
};
```

On line 20 we see the first lifecycle callback, `createdCallback`. The `createdCallback` is run every time the parser hits a new instance of our tag. Therefore we can use it as a kind of constructor to kickoff the creation of our chart. We'll want to create a new chart instance for each tag so all of our Chart.js code has been moved inside of this callback.

```js
var root = this.createShadowRoot();
var clone = thatDoc.importNode(template.content, true);
```

On lines 22-23 we create a [Shadow DOM](http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom/) to hold the markup for our chart.

```js
var data = [
  {
    value: 30,
    color: '#F38630'
  },
  {
    value: 50,
    color: '#E0E4CC'
  },
  {
    value: 100,
    color: '#69D2E7'
  }
];

//Get the context of the canvas element we want to select
var ctx = clone.querySelector('.myChart').getContext('2d');
var myNewChart = new Chart(ctx).Pie(data);
```

Lines 26-43 should look familiar. It's the same Chart.js code from before except now we use `querySelector` to find the contents of the template clone and we're using a class for `myChart` instead of an id.

```js
root.appendChild(clone);
```

On line 46 we add the new content to our Shadow DOM.

```js
var ChartPie = thatDoc.registerElement('chart-pie', {prototype: ChartPieProto});
```

Line 49 is where we actually register our Custom Element and assign it to the name `chart-pie`. From here you can either place a `<chart-pie></chart-pie>` tag somewhere on your page, or use JavaScript to instantiate an instance and add it to the `document`. This is demonstrated in the comments on lines 50-51. If you refer back to our `index.html` example we just use the `<chart-pie>` tag.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Imports with Custom Elements</title>
    <link rel="import" href="/imports/chart.html" />
  </head>
  <body>
    <h1>Quarterly Pokemon Sales</h1>
    <chart-pie></chart-pie>
    <chart-pie></chart-pie>
    <chart-pie></chart-pie>
  </body>
</html>
```

Which produces this:

![](/images/2014/12/imports-custom-elements.jpg)

## Conclusion

If you've made it this far congrats and thanks for hanging in there! I know that last section was a little crazy but stop for a moment and think about what we just did.

By using an HTML Import we were able to pull in a document which added a new tag to our application. Imagine if _all_ of Chart.js was written in this manner. There would be no need for us to write any glue code to generate a chart ever again. That would allow us to focus only on the code that matters to our application, and leave all that other boilerplate tucked away inside of Custom Elements.

Over the next few months I'll be blogging exclusively about this topic because I think it's really interesting so check back later for more!

Till then make sure to [hit me up on Twitter](http://twitter.com/rob_dodson) if you have any questions or leave a note in the comments. Thanks!


---
title: Exploring the Backbone Router and History API
tags:
  - Chain
  - Backbone
  - History API
date: 2012-05-21T14:59:00.000Z
updated: 2014-12-30T07:45:00.000Z
---I want to talk a bit more about the Backbone Router because I think it's one of the first pieces of the framework that people run up against that deviates from the standard MVC setup.

If you've used Rails before you're used to the idea of `routes` which pick apart a url and figure out which controller to run. CodeIgniter uses the same paradigm but I'm not sure if they also call them routes or use a different term. Contrary to this, in Backbone the Router is like a controller for the entire application. This makes it similar to Sinatra. Creating two different routes which replace the content of the page each time would look like this:

```js
var Router = Backbone.Router.extend({
  routes: {
    '': 'index',
    search: 'search'
  },

  index: function() {
    var tutorial = new Example.Views.Tutorial();

    // Attach the tutorial page to the DOM
    tutorial.render(function(el) {
      $('#main').html(el);
    });
  },

  search: function() {
    var search = new Example.Views.Search();

    // Attach the search page to the DOM
    search.render(function(el) {
      $('#main').html(el);
    });
  }
});
```

If you're using the Backbone Boilerplate you won't need to tell the Router to update every time someone clicks a link. The Boilerplate implements the following block of code at the very bottom of main.js

```js
// All navigation that is relative should be passed through the navigate
// method, to be processed by the router.  If the link has a data-bypass
// attribute, bypass the delegation completely.
$(document).on('click', 'a:not([data-bypass])', function(evt) {
  // Get the anchor href and protcol
  var href = $(this).attr('href');
  var protocol = this.protocol + '//';

  // Ensure the protocol is not part of URL, meaning its relative.
  if (href && href.slice(0, protocol.length) !== protocol && href.indexOf('javascript:') !== 0) {
    // Stop the default event to ensure the link will not cause a page
    // refresh.
    evt.preventDefault();

    // `Backbone.history.navigate` is sufficient for all Routers and will
    // trigger the correct events.  The Router's internal `navigate` method
    // calls this anyways.
    Backbone.history.navigate(href, true);
  }
});
```

In short this is an application wide handler for any relative anchor that doesn't have a `data-bypass` attribute. So something like `<a href="search">Search</a>` would get passed through here.

The last few bits prevent the link from completely refreshing the page—`evt.preventDefault()`—and pipe the href through the router. Actually the href gets piped through `Backbone.history.navigate` which `Router.navigate` proxies. When you call `Router.navigate('foobar')` you're supposed to pash a hash of `{trigger: true}` if you'd like the router to run the corresponding `foobar` method. If you dig into the source you can see that just passing true will also have the same effect and that's what's done here by the Boilerplate.

Originally I had written my View like this because I thought I had to use the Router explicitly.

```js
// This will fetch the tutorial template and render it.
Example.Views.Tutorial = Backbone.View.extend({
  template: 'app/templates/example.html',

  // Listen for when the user clicks our anchor tag
  events: {
    'click .search': 'search'
  },

  // Note: I'm stopping the event and explicitly telling the Router to
  // update the history and trigger the corresponding search method.
  search: function(e) {
    e.preventDefault();
    namespace.app.router.navigate('search', {trigger: true});
  }
  //...
});
```

Notice that I've defined a `search` method which listens for a click on my anchor of class `.search`. This is inline with the vanilla Backbone.js documentation but since the Boilerplate has added that application wide handler for us, we don't need this function unless there's some additional work that search needs to do. By just letting that global handler do its thing our route will still be called and we can save a fair bit of boilerplate in our templates.

If you want to subvert the handler then you can just call `preventDefault` and `stopPropagation` on the click event like so:

```js
Example.Views.Tutorial = Backbone.View.extend({
  template: 'app/templates/example.html',

  events: {
    'click .search': 'search'
  },

  search: function(e) {
    e.preventDefault();
    e.stopPropagation();
    namespace.app.router.navigate('whatever');
  }

  //...
});
```

Something else to keep in mind is that the boilerplate comes with `History pushState` turned on by default.

```js
// Trigger the initial route and enable HTML5 History API support
Backbone.history.start({pushState: true});
```

This lets you create routes that look like this: `mysite.com/search/foobar` instead of using a hash `mysite.com/#search/foobar`. The only problem is that for HTML5 History pushState to work your server has to keep resolving to index.html. The boilerplate tutorial says to use `node build/server` to run your project server, even though elsewhere it says to use `bbb server`. Neither works so I've [logged an issue on Github.](https://github.com/backbone-boilerplate/grunt-bbb/issues/21) Very possible I'm doing it wrong but we'll see. For now I'm not using pushState so I changed the line in main.js to read `Backbone.history.start()` and instead I'm using the hash approach.

_UPDATE: Turns out there was a bug in the Backbone Boilerplate, make sure in your index.html file that the data-main attribute starts from the root of the site, like so: `data-main="/app/config"`. Also make sure to use bbb server as node build/server is deprecated._

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Awake, Hurried, Focused
- Sleep: 8
- Hunger: 0
- Coffee: 0


---
title: Failing at Ruby
tags:
  - Ruby
  - Chain
  - Nokogiri
date: 2012-06-23T08:08:00.000Z
updated: 2014-12-31T00:14:41.000Z
exclude: true
---

I'm just getting my ass kicked by Ruby tonight so I don't have much to show. Trying to just get my metadata scraping to output something currently looks like this:

```ruby
require 'open-uri'
require 'nokogiri'
require 'mechanize'
require_relative 'selection_error'

module Tentacles
  class Crawler

    attr_reader :doc

    def self.from_uri(uri)
      new(uri)
    end

    def initialize(uri)
      # Create a new instance of Mechanize and grab our page
      @agent = Mechanize.new

      @uri = uri
      @page = @agent.get(@uri)
      @counts = Hash.new(0)
    end

    def words_by_selector(selector, ignored_selector = nil)
      # Get all the links on the page
      post_links = @page.links.find_all { |l| l.attributes.parent.name == 'h1' }
      # Get rid of the first anchor since it's the site header
      post_links.shift
      post_links.each do |link|
        post = link.click
        @doc = post.parser
        nodes = nodes_by_selector(selector)
        nodes.each do |node|
          if ignored_selector
            ignored = node.css(ignored_selector)
            ignored.remove()
          end
          words = words_from_string(node.content)
          count_frequency(words)
        end
      end

      sorted = @counts.sort_by { |word, count| count }
      sorted.reverse!
      sorted.map! do |word, count|
        { word: word, count: count }
      end
      { word_count: sorted }
    end

    def metadata_by_selector(selector)
      metadata = { posts: [] }

      # Get all the links on the page
      post_links = @page.links.find_all { |l| l.attributes.parent.name == 'h1' }
      # Get rid of the first anchor since it's the site header
      post_links.shift
      post_links.each do |link|
        post = link.click
        @doc = post.parser
        time = @doc.css('time')[0]
        post_data = {}
        post_data[:date] = { date: time['datetime'] }
        post_data[:stats] = []
        nodes = nodes_by_selector(selector)
        nodes.each do |node|
          node.children.each do |child|
            post_data[:stats].push(child.content)
          end
        end
        metadata[:posts].push(post_data)
      end
      p metadata
    end

  private

    def nodes_by_selector(selector)
      nodes = @doc.css(selector)
      raise Tentacles::SelectionError,
        'The selector did not return an results!' if nodes.empty?
      nodes
    end

    def words_from_string(string)
      string.downcase.scan(/[\w']+/)
    end

    def count_frequency(word_list)
      for word in word_list
        @counts[word] += 1
      end
      @counts
    end
  end
end
```

Really ugly code that still doesn't work. My biggest problem with Ruby is that I don't have very good debugging tools and that frustrates the shit out of me. I'm so used to the visual debuggers in the Chrome Dev tools that doing everything with `p` or `puts` is just soul-crushing.

Right now my biggest problem is that data isn't being returned from the spider for whatever reason. This is especially annoying because the operation takes a while to run... I should slim it down but my brain is too tired to re-write the code. I'm kind of hoping for a lucky break. Advice to anyone just starting out in programming, do not do exactly what I'm doing right now.

Ok so after getting my ass totally handed to me by Ruby here's a working version of the spider that grabs the proper metadata.

```ruby
require 'open-uri'
require 'nokogiri'
require 'mechanize'
require_relative 'selection_error'

module Tentacles
  class Crawler

    attr_reader :doc

    def self.from_uri(uri)
      new(uri)
    end

    def initialize(uri)
      # Create a new instance of Mechanize and grab our page
      @agent = Mechanize.new

      @uri = uri
      @page = @agent.get(@uri)
      @counts = Hash.new(0)
    end

    def words_by_selector(selector, ignored_selector = nil)
      # # Get all the links on the page
      # post_links = @page.links.find_all { |l| l.attributes.parent.name == 'h1' }
      # # Get rid of the first anchor since it's the site header
      # post_links.shift
      # post_links.each do |link|
      #   post = link.click
      #   @doc = post.parser
      #   nodes = nodes_by_selector(selector)
      #   nodes.each do |node|
      #     if ignored_selector
      #       ignored = node.css(ignored_selector)
      #       ignored.remove()
      #     end
      #     words = words_from_string(node.content)
      #     count_frequency(words)
      #   end
      # end

      # sorted = @counts.sort_by { |word, count| count }
      # sorted.reverse!
      # sorted.map! do |word, count|
      #   { word: word, count: count }
      # end
      # { word_count: sorted }
    end

    def metadata_by_selector(selector)
      metadata = { posts: [] }
      puts 'starting'
      p metadata
      # Get all the links on the page
      post_links = @page.links.find_all { |l| l.attributes.parent.name == 'h1' }
      # Get rid of the first anchor since it's the site header
      post_links.shift
      post_links.each do |link|
        post = link.click
        @doc = post.parser
        time = @doc.css('time')[0]
        post_data = {}
        post_data[:date] = time['datetime']
        post_data[:stats] = []
        nodes = nodes_by_selector(selector)
        nodes.each do |node|
          node.children.each do |child|
            unless child.content.chomp.empty?
              post_data[:stats].push(child.content)
            end
          end
        end
        metadata[:posts].push(post_data)
        puts 'post added'
        p metadata
      end
      puts 'returning'
      p metadata
      metadata
    end

  private

    def nodes_by_selector(selector)
      nodes = @doc.css(selector)
      # raise Tentacles::SelectionError,
      #   'The selector did not return an results!' if nodes.empty?
      nodes
    end

    def words_from_string(string)
      string.downcase.scan(/[\w']+/)
    end

    def count_frequency(word_list)
      for word in word_list
        @counts[word] += 1
      end
      @counts
    end
  end
end
```

I had to comment out the `Tentacles::SelectionError` because it was throwing and saying it wasn't getting any content with a selector even though it was. Not sure wtf is going on there but I'm sure it has to do with the fact that it's 1:30 a.m. I have a rule that nothing good happens after 11pm when it comes to coding. Tonight has lived up to that. Anyway the above should put out a hash which when converted to JSON looks like this:

```json
{
  "posts": [
    {
      "date": "2012-06-22T00:31:00-07:00",
      "stats": ["Time: 12:31 am", "Mood: Tired", "Sleep: 6", "Hunger: 0", "Coffee: 1"]
    },
    {
      "date": "2012-06-21T01:27:00-07:00",
      "stats": ["Time: 1:28 am", "Mood: Tired, Annoyed", "Sleep: 6", "Hunger: 0", "Coffee: 1"]
    },
    {
      "date": "2012-06-20T00:09:00-07:00",
      "stats": [
        "Time: 12:10 am",
        "Mood: Tired, Introspective",
        "Sleep: 4.5",
        "Hunger: 2",
        "Coffee: 1"
      ]
    }
  ]
}
```

I'm pretty certain I could have done this with Node in a fraction of the time if only because Node is much easier to debug with Chrome Dev tools using node-inspector. While I love the Ruby language I definitely do not like debugging it...

Tomorrow I might write some JS to give my brain a break. I'm thoroughly pissed off at Ruby for the evening. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Pissed
- Sleep: 6
- Hunger: 0
- Coffee: 1


---
title: Finding a job in climate as a front-end engineer
date: '2022-03-16'
tags:
  - climate
---

In October 2021, I left my job at Google to see if I could find a role in climate tech. When I left, I didn’t have a job lined up, nor did I know how to go about finding a job in climate, so I wanted to write this post to share what I learned along the way. I’m happy to say that I have since found a new role in the climate space (something I’ll write about soon) and hopefully the information below will help you do the same.

## Do climate companies even need front-end engineers?

Right out of the gate I can say an emphatic **yes**—there are plenty of web dev roles available at climate tech companies. Also, you don't need to be a climate expert to apply. None of the places I spoke with assumed that I had any prior knowledge of their domain, but they were all really motivated to help me get up to speed. I learned a lot just in the application process and I imagine you will as well.

Unlike traditional tech companies, web (and mobile) are not always the centerpieces for climate tech companies. Many are focused on building new kinds of batteries/fuels/sensors/grids/etc. So when you're searching for roles you'll see a lot of IoT and low-level programming, plus cloud and big data. But there's absolutely demand for front-enders as well.

## Where to find jobs

The best resource for job hunting is [Climatebase](https://climatebase.org/). I cannot stress this enough: [**sign up for their newsletter**](https://landing.mailerlite.com/webforms/landing/r7s1y1). It comes out weekly and gives a brief rundown of what’s new in the world of climate and then lists all the new jobs and companies for that week. Here’s [a sample from October](https://preview.mailerlite.com/k6w5m4).

Take the time to fill out a profile on Climatebase and each week they will email you roles that match your skills.

You can also go through the back catalog of the [My Climate Journey podcast](https://www.mcjcollective.com/media/podcast) and look at the careers page for the companies being interviewed.

## How to educate yourself

The [Work on Climate](http://workonclimate.org/) group has some good [resource starter packs](http://workonclimate.org/resources/). They also have a Slack that you can join to converse with like-minded folks. Personally, I didn’t use the Slack much, but I did find the starter pack reading material interesting.

I listen to a lot of podcasts and I found the [Volts podcast/newsletter](https://www.volts.wtf/) by David Roberts to be really helpful. Go through [the archive](https://www.volts.wtf/archive?sort=new) and pick an assortment of episodes that seem interesting. Some are _incredibly dry and wonkish_ (be forewarned) but others are really good explanations of topics that I only kind-of, sort-of understood. Here’s [a great starter episode that’s all about methane](https://www.volts.wtf/p/volts-podcast-all-about-methane-with?s=r).

Another podcast is [How We Survive](https://podcasts.apple.com/us/podcast/how-we-survive/id1586892518) by Molly Wood. It’s a nine-part series that mostly focuses on lithium batteries, but it does a good job of talking about the social justice side of climate change, as well as the tech.

The most helpful book I read was [The Ends of the World](https://www.goodreads.com/book/show/32075449-the-ends-of-the-world) which is a fascinating retelling of all of the world’s mass extinction events and how all of them (yes, even the dinosaurs) were connected to the planet’s carbon cycle. Understanding how the carbon cycle works and what happens when there’s too much or too little CO2 is just really interesting.

## What the employment landscape is like

### Most of the companies are startups

I realized early on that I didn’t _know_ any “climate companies”. It’s easy to name big tech companies, but there hasn’t been enough time or investment for climate companies to become household names. So most of the places I spoke to were in the range of tens of people, to maybe a couple hundred.

On the one hand, this is great. I got to speak directly to the founders of some companies and the engineering teams felt tight-knit and energized. Your work will almost certainly have a big impact on the organization and that can be really motivating.

On the other hand, there’s a lot of career and financial uncertainty when joining a startup. The base pay may be less than you currently make and equity will be much riskier/there will be less of it to go around.

I don't say these things to discourage you from working on climate—I personally think we all need to seriously consider making the career switch—but I understand that everyone is in a different situation with their financial responsibilities and it's important to know ahead of time what kinds of companies are out there and what the compensation will be like.

### Carbon offsets are popular...for better or worse

A significant portion of the companies I looked at deal in carbon offsets, which are a fairly controversial topic. The idea with an offset is that a big company can pay someone else to capture CO2 (i.e. plant or protect a forest), and this then "offsets" the big company's own emissions. Companies that sell offsets are market makers, they find the projects that will offset emissions, and they package them up and sell them.

There are a number of problems with offsets, a few that I know of are:

- It's unclear how they're regulated, or if they actually deliver the results they claim.
- Planting a forest can take years to capture significatn CO2, but your emissions go into the air _today_.
- The offset buyer doesn't have to change any of their behaviors.

That last point is a big deal, and one of the reasons why folks say offsets are "greenwashing". Right now a lot of companies are making announcements about offseting their emissions, but imagine if they _couldn't_ buy offsets? Would they be pressured to actually operate more efficiently instead?

It's hard for me to answer these questions, but my gut tells me that offsets are not a good model so I tended to steer away from companies who make them their primary business.

### React is king

I interviewed or had exploratory phone calls with six companies, and I’ve also read pretty much every Climatebase newsletter over the past four months. I can say with confidence that the two most in-demand front-end skills are React and TypeScript. Every company I interviewed with is using React, and pretty much every company on Climatebase lists it as a desired skill.

Most companies seem fine with you learning React on the job, especially if you have prior experience with similar frameworks (Vue, Angular, Svelte, Lit, etc).

I personally was not that experienced in React (I've mostly used [Lit](https://lit.dev/)), but the [beta React docs](https://beta.reactjs.org/) are _really_ good and do great job of explaining newer concepts like Hooks. I highly recommend reading through these.

### Most companies want senior full-stack (but don’t be discouraged!)

Because many of the companies are smaller startups, and likely don’t have enough engineers to specialize in front-end or back-end, most of the roles listed are for full-stack engineers, often listed as senior level.

This all makes sense but it can be discouraging. I’m pretty specialized in the front-end, and I shied away from applying to some roles because I wasn’t confident enough in my back-end skills. This doesn’t mean that you can’t find a front-end specific role—they’re certainly out there—but it just takes a bit more patience to find them. I guarantee you that they’re there—I managed to apply to several—there just aren’t _as many_ as full-stack. It can be demotivating at times, but be persistent!

## Wrapping up

One thing I didn't talk about yet is how I prepared for the coding interviews or what those were like. I'll write a follow-up post to cover that. But in the meantime, if you have any questions, please feel free to [reach out to me on Twitter](https://twitter.com/rob_dodson). I'm more than happy to talk about this process if it helps other folks make the switch!


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
---I have an upcoming project which uses [Backbone](http://documentcloud.github.com/backbone/) and [Node.js](http://nodejs.org/) so I thought it would be good to blog about the topics (particularly Backbone) for a while to make sure I'm well up to speed.

We're using the [Backbone Boilerplate](https://github.com/tbranyen/backbone-boilerplate) to get us started since it includes a bit of file structure and a build process. As they mention in the docs you have to install [Grunt](https://github.com/cowboy/grunt) if you want to use the build process they've stubbed out. Grunt is a javascript build tool which uses Node (think Rake in JS).

As a refresher course I'm going to dig into the open-source [Backbone Fundamentals book](http://addyosmani.github.com/backbone-fundamentals/) by [Addy Osmani](http://addyosmani.github.com/backbone-fundamentals/).

First thing's first though, after we have nodejs and grunt installed we need to also install the bbb (backbone boilerplate build, I guess?) tool. You can [grab it here.](https://github.com/backbone-boilerplate/grunt-bbb)

We'll create a new folder for our project and run `bbb init`. If all goes well it should stub out some project directories and files for us.

### The Backbone Boilerplate templates

I'll start with the index.html file. It seems like your standard HTML5 doc with the noteable exception that it includes [require.js](http://requirejs.org/) at the bottom of the page.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />

    <title>Backbone Boilerplate</title>

    <!-- Application styles -->
    <link rel="stylesheet" href="/assets/css/index.css" />
  </head>

  <body>
    <!-- Main container -->
    <div role="main" id="main"></div>

    <!-- Application source -->
    <script data-main="app/config" src="/assets/js/libs/require.js"></script>
  </body>
</html>
```

Require.js is a module and file loader which will help us manage our AMD modules. AMD (which stands for Asynchronous Module Definition) is a specification which details how to break JS down into modules that are loaded in, as needed, at runtime. [Again we turn to Addy Osmani for a good explanation.](http://addyosmani.com/writing-modular-js/)

If you notice this block:

```html
<!-- Application source -->
<script data-main="app/config" src="/assets/js/libs/require.js"></script>
```

the `data-main` attribute in the script tag is telling require.js what to load first. In this case it's the `app/config.js` file. If you omit the `js` require will add it for you. If you add the `.js` require will respect the path exactly as it was given. This distinction seems kind of trivial here but later on when you start configuring require with baseUrls and whatnot, it becomes more important.

Let's look at that confg file, shall we?

```js
// Set the require.js configuration for your application.
require.config({
  // Initialize the application with the main application file
  deps: ['main'],

  paths: {
    // JavaScript folders
    libs: '../assets/js/libs',
    plugins: '../assets/js/plugins',

    // Libraries
    jquery: '../assets/js/libs/jquery',
    underscore: '../assets/js/libs/underscore',
    backbone: '../assets/js/libs/backbone',

    // Shim Plugin
    use: '../assets/js/plugins/use'
  },

  use: {
    backbone: {
      deps: ['use!underscore', 'jquery'],
      attach: 'Backbone'
    },

    underscore: {
      attach: '_'
    }
  }
});
```

One of the first things you can do with Require is to pass it a configuration object. The config object [can be used for a ton of bootstrap options](http://requirejs.org/docs/api.html#config) like setting paths, requiring other scripts, setting timeouts, etc. The first option we see here is `deps: ["main"]`. We can infer this is telling require to load our main.js file first. But how does it get the path to main.js? From the docs we see that since we haven't defined a `baseUrl` property require is using the path from our `data-main` attribute.

> If no baseUrl is explicitly set in the configuration, the default value will be the location of the HTML page that loads require.js. If a data-main attribute is used, that path will become the baseUrl.

So we know that our baseUrl is `app/` and anything we require will be relative to that.

Next up we have this block:

```js
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
```

The paths property defines paths relative to `baseUrl`. If we say

```js
require(['libs/module']);
```

require.js will look for this `libs` path and find it in our config file. Most of these make sense till we hit the last line which creates a path for the `use` plugin.

[It seems like `use` was created by Tim Branyen, the author of the Backbone Boilerplate, to help with loading libraries that are non-AMD compliant.](http://tbranyen.com/post/amdrequirejs-shim-plugin-for-loading-incompatible-javascript) Most of the big libraries are currently not AMD compliant (underscore and backbone itself) so this makes sense. So instead of creating a shim for each of those libraries the `use` plugin _should_ take care of things for us. We can see how it's used further in the config file:

```js
use: {
  backbone: {
    deps: ["use!underscore", "jquery"],
    attach: "Backbone"
  },

  underscore: {
    attach: "_"
  }
}
```

Let's start at the bottom so we can see that underscore is defined and mapped to "_". `attach` is going to take whatever library we're defining and attach it to `window`. So underscore will be attached as `window._`. Next we see that backbone is defined and depends on our version of underscore and jquery. Since jquery is AMD compliant we don't need the call to`use!`but we will need it for underscore. Finally backbone is attached to the window as`window.Backbone`.

That covers the configuration file. I'll move on to main.js in the next post.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Awake, Tired, Lazy
- Sleep: 7
- Hunger: 4
- Coffee: 0


---
title: Going full-time on accessibility
date: 2018-06-27T02:47:00.000Z
updated: 2019-01-13T01:10:12.000Z
tags:
  - Accessibility
draft: true
---This is a post that I should have written ages ago but better late than never :)

If you [follow me on twitter](https://twitter.com/rob_dodson) you may have noticed that a few years back I started talking more about accessibility and less about web components and Polymer. This all began when my teammate, Alice Boxhall, asked me to co-author a course on [accessibility fundamentals](https://bit.ly/web-a11y). Initially, I thought, “oh, this will be a great way for me to learn more about a topic area that I’m deficient in.” But as we wrapped up the course, my work and interest in the topic continued to grow. Teams—both internal and external—began reaching out to me, asking for help to make their sites and components accessible. I quickly realized that the state of accessibility is pretty dismal and it feels like it’s only getting worse.

After discussing it with my managers, I began to shift more of my time from web components over to accessibility. These days I spend around 80% of my time working on accessibility, and reserve the remainder for web components projects like [custom-elements-everywhere](https://custom-elements-everywhere.com/).

But because I never announced I was shifting gears, this change sent a mixed message to developers. I’ve heard a few devs say things like “Rob stopped doing Polycasts. Looks like Polymer is on the way out,” or “web components are dead!” Really, this couldn’t be further from the truth. Browsers operate on a very long timeline, and web components are here to stay. Currently we’re looking at how new accessibility APIs can be combined with them to do some pretty amazing stuff. For instance, as part of [AOM](https://github.com/WICG/aom), we’re exploring if a custom element with shadow DOM can [declare its default semantics](https://github.com/WICG/aom/blob/gh-pages/explainer.md#use-case-1-setting-non-reflected-default-accessibility-properties-for-web-components), without the developer needing to sprinkle a bunch of ARIA around. These are the kinds of cool things you can build once you have a standard component model in place. I’m pretty confident more specs in the near future will use custom elements as an extension point.

So no, Web Components and Polymer aren’t going anywhere. There are amazing folks like [Monica](https://twitter.com/notwaldorf), [Elliott](https://twitter.com/Elliott_Marquez), and [Justin](https://twitter.com/justinfagnani) leading the charge for Polymer's outreach and developer education. And if you haven’t had a chance yet, you should watch the team’s I/O talks [[1](https://www.youtube.com/watch?v=7CUO7PyD5zA&t=1547s), [2](https://www.youtube.com/watch?v=we3lLo-UFtk&t=1s)] cuz they’re amazing. Personally, I’m just spending more time with a topic that I’m super nerdy about. And hopefully—if I do my job well—you will start to get a bit more nerdy about it too! :)

Rob


---
title: Hacking the PATH variable in Sublime Text
tags:
  - Chain
  - Sublime
  - Python
date: 2012-05-15T03:26:00.000Z
updated: 2014-12-30T07:20:52.000Z
---

This is going to be a bit of a lightning post but I wanted to quickly show off how to edit the PATH variable that Sublime text uses. I should warn you that that I am neither an expert in Python nor am I a very seasoned Sublime user. So having said that take all of this with a grain of salt and use at your own risk.

### Our first (crappy) plugin!

Sublime has a great plugin architecture that makes it extremely easy to add to the platform. If you create a `.py` file in the `~/Library/Application Support/Sublime Text 2/Packages/User/` folder it will be loaded as soon as Sublime starts. Writing plugins seems to be actually quite easy based on their [documentation and examples.](http://www.sublimetext.com/docs/plugin-basics) We won't be following the typical plugin architecture since we're just trying to hack a system variable and that doesn't seem to necessitate the use of their built in modules.

Here's a script I'm calling `Pathway` at the moment.

```python
import os

LOCAL = '/usr/local/bin:/usr/local/sbin:'
HOME = '/Users/Rob'  ### !!! REPLACE WITH YOUR HOME PATH !!! ###
RVM = HOME + '/.rvm/bin:'

# Sublime's default path is
# /usr/bin:/bin:/usr/sbin:/sbin
os.environ['PATH'] += ':'
os.environ['PATH'] += LOCAL
os.environ['PATH'] += RVM

print 'PATH = ' + os.environ['PATH']
```

If you add this file to the Sublime user's directory outlined above you should be able to hit cmd + ` to fire up the Sublime console which will print out our new PATH variable.

I would also recommend adding a shell plugin to Sublime. At the moment I use [Shell Turtlestein.](https://github.com/misfo/Shell-Turtlestein).

Now that I have my hacked path variable and my shell plugin I can check to see if RVM works. Using Shell Turtlestein you can hit `cmd-shift-c` to open a little console prompt. Typing `rvm current` returns our ruby version number and gemset. Nice! What's even nicer is this means I can now run Rake tasks from inside of Sublime!

I should point out if all you want to do is run Rake or Ant then there are already plugins for that sort of thing. My main effort in doing all this is to try to integrate the command line with Sublime a bit better. If _anyone_ knows how to simply tell Sublime to use the path in my .bash_profile or .bashrc then I would gladly use that approach instead. But after crawling the forums for a while it looks like this is still a common problem with no good solution.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Happy, Peaceful, Hurried
- Sleep: 7
- Hunger: 6
- Coffee: 0


---
title: Hello, 2018!
date: 2018-01-01T20:29:49.000Z
updated: 2018-01-01T20:29:49.000Z
old: false
---

## Goodbye, 2017

![Thousands of protestors at the Women's March in Washington D.C. The capitol building is in the background.](/images/2018/01/08_07_GettyImages-632318086.jpg "The Women's March on Washington")

### Politics

The year opened with a lot of protests and rallies. We rallied at the SF city hall, the Women's March in Oakland, at San Francisco Airport, and even at the Google Campus. It was intense. When the riot police showed up at SFO while folks were banging on the security barriers I wondered if it was only a matter of time before they tear gassed us. Thankfully that didn't happen.

2017 made me realize how much we've been asleep at the wheel, just letting politics happen, assuming that somehow it would all work out in the end. I'm very thankful for organizations like [Run for Something](https://www.runforsomething.net), [SwingLeft](https://swingleft.org/), [Indivisible](https://www.indivisible.org/), and [Crooked Media](https://crooked.com/). If I had to recommend one person to follow on twitter it would be [Celeste Pewter](https://twitter.com/Celeste_pewter). I love her daily briefings, and 2017 was the first year I started phoning my reps to tell them when I thought they were doing good (or bad).

### Travel

I went to Australia, Peru, Denmark, Japan, and Rwanda. Each of these trips was an awesome adventure. I realize I've now been to every continent except Antartica, which I really want to go to. To be 100% honest, I'm not the best traveler. I get really anxious when I don't speak the language, and nervous about walking around a city I don't know. Over time I've gotten better about this and in 2017 I started to feel more comfortable in unfamiliar places. But I think I still have a ways to go before I'm fully embracing the whole globetrotter thing.

### Work

On the work front, I took on more of an ownership role for both Web Components and Accessibility. I co-presented at CSUN and worked the Google booth—which was super fun! I think the most rewarding thing this past year has been all the folks who meet me for the first time and say "I did [your accessibility course](bit.ly/web-a11y) on Udacity!" It took Alice and I about a year to put that course together. It was _so.**much.**work._ We would send each other messages like "oh god I still have 30 slides to make [cries face down on the floor]." But we toughed it out, and even though there are bits I'd like to improve upon, I'm pretty happy with the result.

Speaking of [Alice](https://twitter.com/sundress), I wanted to thank her for helping me so much in 2017. Not only did she introduce me to the topic of accessibility, and basically teach me everything I know, but she also:

- Proofread and edited my blog posts before they went out. Making major revisions so they sounded much smarter than originally authored.
- Helped lead the AOM, :focus-ring, and inert standards discussions and polyfills.
- Shipped new accessibility devtools in Chrome which everyone can use in version 63.
- And, helped teach me C++ (more on this in a moment).

She's just awesome, and an incredibly strong person who has really pushed me to see the world differently. Thank you Alice!

At the tail end of the year I was promoted (yay!) so I'm now a "Staff Developer Advocate". On January 13th, I'll have been at Google for four years, which is the longest I've ever worked at the same place. I love my job and the opportunity it affords me to just go all in on the things I'm excited about. The folks around me are awesome and always supportive and pushing me to be better. I really am lucky to have such amazing coworkers and I'm very excited to work with the new folks who will be joining the team in 2018.

## Hello, 2018!

![The golden gate bridge at sunrise.](/images/2018/01/goldengate.jpg)

### Personal stuff

In December my wife accepted a job at Highland Hospital in Oakland, so soon we'll be moving from Palo Alto up to either Oakland or Berkeley. For years we've been unable to really put down roots because with medical school, residency, possible fellowship, etc. it was always assumed that every three years we would need to move to a new city. But now that she's accepted a full time role at Highland, we know we'll be staying in the Bay Area. I am stoked.

### Work

To start the year I'll be doing a software engineering rotation with the Chrome Accessibility team. This means I'll spend all of Q1 acting as a member of their team instead of working in developer relations. I've been picking up as much C++ as I can, and trying to wrap my head around Chromium. I'm a bit nervous because I've never worked in C++ and I really want to do a good job. I'm excited because I'll get to work directly on a few things I've been evangelizing _and_ when I switch back to developer relations, later in the year, I'll have a much deeper understanding of accessibility. I'm thrilled to talk about all the things I don't even know about yet!

### Politics

2018 feels like a really momentous year to me. I am excited and nervous at the same time. Obviously the political scene is going to be an all out slugfest, but I'm looking forward to that. Upon reflection, I think we needed this wake up call so we could get our act together when it comes to things like universal healthcare. It's deeply unpleasant having Donald Trump as president, but U.S. politics is cyclical, and in 2018 we push back.

## Resolutions

When it comes to resolutions I prefer having very specific goals, as opposed to really broad things like "work out more". I think when you have an actual target then you can feel yourself making progress and that measure of progress becomes its own motivating factor.

Let's start with the exciting personal stuff:

### Buy a house.

Yes, Bay Area housing prices are... steep, to put it mildly, but my wife and I have been saving up for a few years and we're really excited to finally own a place of our own. There's all sorts of nerdy things I want to do, like put up solar panels. Stuff you just can't really do with a rental. But most importantly, it will unlock my next resolution...

### Get a doggo (or 2).

It's actually really hard to find a rental in the Bay Area that will allow dogs. This sucks because I love dogs. If you follow me on twitter you may have noticed that my feed is like 90% dog gifs, and 20% web stuff and politics. I really want to get two dogs because I want to make sure they each have a buddy. I have already decided on their names. This is happening.

### Create an Instagram account

OK I realize this isn't that exciting and that I'm the last person to not have an Instagram account. Currently my phone has _a ton_ of travel photos but I never share them. It seems kind of silly to take all these photos and never really look at them or share them with anyone. In 2018 I plan to change that. Get ready to be spammed.

### Dress better.

There's just something about walking into an important meeting with a shirt that says ["Trust me, I'm a dogtor"](https://cdn.shopify.com/s/files/1/0251/5984/products/trust-me-im-a-dogtor-doctor-shirt-1.jpg?v=1471242400) that makes me think people aren't taking me seriously. So no more t-shirts with random company logos, or hoodies.

### Run a half marathon.

In 2017 (or maybe it was 2016?) I started the year with a goal of being able to consistently run a 5K. Prior to that, I'd maybe jog once a year, hate it—deeply, and then resolve to getting swole some other way. But working toward that 5K goal really helped me develop a love of running. I still get shin splints if I run too frequently, and I've been a couch potato cuz it's cold outside, but in 2018 I'm setting out to do a half marathon. One thing I've recently discovered is listening to books on tape while you run is pretty awesome. I'm currently listening to [Too Far From Home](https://www.amazon.com/Too-Far-Home-Story-Death/dp/0385514654) and really enjoying it.

### Boulder at a V4 level.

I started bouldering a few years ago, and over the past year I've managed to get up to where I can climb some V3s. I'm not going consistently enough right now, so that has to change if I want to get to the V4 level. Maybe 2-3 times a week would be enough.

### Write a will and document my medical directives.

OK, so this is one of those very unfun adult things that nobody wants to do but both are _incredibly_ important. Because my wife works inpatient medicine (meaning, inside the hospital) I've heard countless stories of families being in a situation where they have to decide whether or not to intubate someone. Thinking about this stuff is scary, but it would break my heart for my wife or family to be in a situation where they have to make a decision about me and they don't know what my wishes are. To spare my loved ones any undue anguish, I want to make sure I have all this stuff sorted out, just in case.

### Volunteer at organizations to promote inclusivity in tech.

Our industry is a total monoculture. I'm not happy with the current state of things and I want to do my part to change that. In 2018 I plan to find organizations that help promote diversity and inclusivity in tech, and do whatever I can to help them out. This could include speaking, or being a teaching assistant, or connecting those groups with folks at Google who work in their area of interest. Whatever it takes, I want to make sure I'm moving the needle on this.

### Get (even more) involved in politics.

Obviously this year is a big one because of the midterm elections. In California we have the ["Crooked Seven"](https://secure.actblue.com/donate/crookedseven) that need to be voted out of office. This is where I'll be focusing all of my political energy. Text or phone banking, maybe driving over to Modesto to knock on doors, whatever it takes.

### Release a game a quarter.

I've always secretly dreamed of being an indie game maker. When I read [Dave Rupert's 2017 year in review](http://daverupert.com/2017/12/twenty-seventeen/) he mentioned that he (secretly) has been trying to release a game a quarter. I think this is a great goal and one I'm planning to aspire to as well. I figure the games don't have to be big, but they do have to be "complete" which means pushing through all the unfun bits. I've already started making [my first game, a simple tilt maze](https://twitter.com/rob_dodson/status/947626484427980800) and I have a ton of ideas for where I'd want to take it. The hard part will be editing that list down, and doing the production work to actually create a handful of levels and something that feels like it has a beginning, middle, and end.

## ONWARD!

This post ended up being _way longer_ than I originally expected. I guess that's what happens when you drink too much coffee and have the house all to yourself. I'm really looking forward to this year and hope you are too. Now it's time to go work on that half marathon. Happy new year! 👟


---
title: How do you switch between views in Backbone
tags:
  - Chain
  - Backbone
date: 2012-05-23T14:56:00.000Z
updated: 2014-12-30T07:48:03.000Z
---I'm going to try to approach some of my future articles as more of a question/answer setup so they don't turn into these sprawling tutorials. Today I want to focus on moving between views in Backbone.js. I'm starting with some very simple templates and three views: LeftView, MiddleView, RightView. To do this quickly we'll make it so each view is essentially a big button which, when clicked on, should animate to the middle of the screen.

Here's what one of my templates looks like:

```html
<div id="right-container" class="container">Everyone knows I'm right.</div>
```

One of the first thing I'm noticing is that all of my templates seem to be wrapped in an extra div. Since this extra div is block displayed I can't get my items to line up next to each other... Oh! T[he problem is because I haven't specified a tagName for my views.](http://stackoverflow.com/questions/7894253/backbone-js-turning-off-wrap-by-div-in-render) I think I can actually do everything in the View declaration without needing a template.

```js
Example.Views.Right = Backbone.View.extend({
  tagName: 'div',
  id: 'right-container',
  className: 'container'
});
```

That should create our view for us with the proper tag, class and id attributes. My containers are just colored squares so I don't need to populate them with any content. If I did want to use this approach I could add more content like this:

```js
Example.Views.Right = Backbone.View.extend({
  tagName: 'div',
  id: 'right-container',
  className: 'container',
  initialize: function() {
    this.el.innerHTML = 'Hello World!';
  }
});
```

Or I could render a template. Again for our purposes we just want to move some colored blocks around so the first approach is sufficient.

Here is our most basic `Router` showing how to add the views to stage. Since we aren't using a template we can just call the regular render function and append the returned element to the DOM.

```js
var Router = Backbone.Router.extend({
  routes: {
    '': 'index'
  },

  index: function() {
    var leftView = new Example.Views.Left();
    var middleView = new Example.Views.Middle();
    var rightView = new Example.Views.Right();

    // Attach the views to the DOM
    $('#main').append(leftView.render().el);
    $('#main').append(middleView.render().el);
    $('#main').append(rightView.render().el);
  }
});
```

Here are my very simple styles:

```css
.container {
  width: 300px;
  height: 300px;
  display: inline-block;
  margin-right: 50px;
}

#left-container {
  background: #f00;
}

#middle-container {
  background: #0f0;
}

#right-container {
  background: #00f;
}
```

We should now have a very simple horizontal layout.

### Composite Views

Well I'd like to center my views in the middle of the screen but moving each item individually is going to be pretty challenging. I think the better idea would be to wrap my views in a containing view which can then be easily centered on screen.

Here's what that looks like:

```js
Example.Views.Sections = Backbone.View.extend({
  tagName: 'div',
  id: 'sections',
  leftView: undefined,
  middleView: undefined,
  rightView: undefined,

  initialize: function() {
    this.leftView = new Example.Views.Left();
    this.middleView = new Example.Views.Middle();
    this.rightView = new Example.Views.Right();

    this.$el.append(this.leftView.render().el);
    this.$el.append(this.middleView.render().el);
    this.$el.append(this.rightView.render().el);
  },

  // We should do this work with events instead of methods
  setInitialPosition: function() {
    this.$el.css({left: $(window).width() / 2 - this.$el.width() / 2});
  }
});
```

Our Sections view is going to contain our 3 subordinate views. When it gets added to the DOM, `initialize` will run and create our subviews. I've also defined a method `setInitialPosition` which centers our view on screen. Tomorrow I'll replace this with an event handler that fires whenever our element is added to the DOM. For now I'm too lazy to look up the supported events :D

The sections view is absolutely positioned and it's width and height are explicitly defined in the css. In the short term here's how we've updated things:

```css
#sections {
  display: inline-block;
  position: absolute;
  width: 1000px;
  height: 300px;
  top: 50px;
  left: 0;
}

.container {
  width: 300px;
  height: 300px;
}

#left-container {
  background: #f00;
  position: absolute;
  top: 0;
  left: 0;
}

#middle-container {
  background: #0f0;
  position: absolute;
  top: 0;
  left: 350px;
}

#right-container {
  background: #00f;
  position: absolute;
  top: 0;
  left: 700px;
}
```

I wanted to give each view a 50px margin on each side so in the short term all these values are hard coded. I'll think about how to make things more dynamic.

Let's listen to when the user clicks on a view. When we hear that we'll animate the whole sections container over so that view is centered on screen.

We'll need to add an events hash to our Sections view. Since all of our children implement the same `.container` class we may as well listen for a click on that.

```js
events: {
  "click .container": "onChildClicked"
}
```

In our handler, `onChildClicked`, we'll figure out which child was actually clicked and then animate ourselves accordingly. Here's the entire object for your reference with the handler at the bottom.

```js
Example.Views.Sections = Backbone.View.extend({
  tagName: 'div',
  id: 'sections',

  leftView: undefined,
  middleView: undefined,
  rightView: undefined,

  events: {
    'click .container': 'onChildClicked'
  },

  initialize: function() {
    this.leftView = new Example.Views.Left();
    this.middleView = new Example.Views.Middle();
    this.rightView = new Example.Views.Right();

    this.$el.append(this.leftView.render().el);
    this.$el.append(this.middleView.render().el);
    this.$el.append(this.rightView.render().el);
  },

  // We should do this work with events instead of methods
  setInitialPosition: function() {
    this.$el.css({left: $(window).width() / 2 - this.$el.width() / 2});
  },

  // Whenever a child is clicked let's animate so it is
  // centered on screen
  onChildClicked: function($e) {
    var $target = $($e.target);

    switch ($e.target.id) {
      case 'left-container':
        this.$el.animate({
          left: $(window).width() / 2 - $target.width() / 2
        });
        break;

      case 'middle-container':
        this.$el.animate({
          left: $(window).width() / 2 - this.$el.width() / 2
        });
        break;

      case 'right-container':
        this.$el.animate({
          left: $(window).width() / 2 - this.$el.width() + $target.width() / 2
        });
        break;
    }
  }
});
```

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Laggy, Pensive
- Sleep: 5
- Hunger: 0
- Coffee: 0


---
title: How I work
date: '2021-03-06'
tags:
  - productivity
---

I'm always fascinated by learning the productivity tools that people use. I'm on a bit of an asymptotic quest to be efficient during the day so I can feel good about disconnecting in the evening.

In this post, I've done a write-up on tools and techniques I use in my day-to-day work. This is a snapshot of my process in 2021, but I may revise it in the future.

- [Todoist](#todoist)
- [Pinboard](#pinboard)
- [Aggressively closing Chrome tabs](#aggressively-closing-chrome-tabs)
- [Alfred multi-clipboard](#alfred-multi-clipboard)
- [Notion (or maybe Obsidian?)](#notion-(or-maybe-obsidian))
- [Brain.fm](#brain.fm)
- [GitHub notifications](#github-notifications)

## First, a bit about me

I currently work on two content sites at Google, [web.dev](https://web.dev) and [developer.chrome.com](https://developer.chrome.com). I also manage a geographically distributed team of three engineers who sit in the Bay Area, Sydney, and Zurich. Time zones are my enemy. ⏰

I spend most of my day either helping authors in our team chat, jumping between GitHub projects, in meetings 😵, or planning "What's next" for our team. When things are going well and I'm being organized my workflow and tooling look something like this:

## Todoist

I've tried a lot of project management tools—and at Google, we have some of our own—but since I work across projects it means my tasks are spread between GitHub issues, various kanban boards, and spreadsheets.

What I found helpful about Todoist is that I can give _myself_ a personal project management tool, which acts as a layer on top of all of the other tools I use.

Todoist has a lot of features but I only use a handful of them: priorities, scheduled tasks, and project boards.

**Priorities** let me quickly dash out if I think a task is a `p1` (very important) or a `p3` (less important) and Todoist will color code and sort them accordingly.

![A todoist dashboard showing four tasks, color-coded by priority.](/images/todoist.jpg "RIP my Travel project.")

**Scheduled tasks** let me file an idea away for later.

For example, if I write "Wash the dog **tomorrow**", it will move the task out of my view and tuck it away until tomorrow.

Recently Todoist added kanban style **project boards**, which didn't interest me at first because I like the simple list view. But I realized I could use priorities and scheduled tasks as project subtasks and get the best of both worlds.

If I have a big project I'll create a card for it and break it into scheduled subtasks, when the date arrives the subtask gets added to my **Today** list.

![A modal window showing one completed, and two incomplete subtasks under the 'Improve image CDN' task.](/images/todoist-subtasks.jpg "Subtasks prevent me from losing my place when I get distracted.")

Usually on Monday I'll look at all of my project boards and triage the subtasks, assigning them to a day of the week and a priority. As new tasks crop up that are unrelated to my bigger projects, like a sudden important email I need to follow up on, I'll add it to my **Today** list. This way the **priority tasks** for my week are on auto-pilot and I can let my brain context switch without worrying that I'll drop the ball.

I'm not dogmatic with this setup, sometimes I get really busy and end up brain dumping 20 items into my Todoist Inbox and then triaging them later. The important point is that I've gotten into the habit of checking this tool at least once a day, and cleaning it up at least once a week.

If you're interested in giving Todoist a try you can use [my referral code](https://todoist.com/r/rob_dodson_vloaey) and I'll get a few months for free 🤝

## Pinboard

Pinboard is a minimalist bookmark tracker. It sort of looks like Craigslist.

![A simple webpage showing a list of linked page titles](/images/pinboard.jpg "Not a lot going on here, but I kind of like that.")

It has a simple browser extension you can use to bookmark something and assign it tags. Then, months or weeks later, you can go back to your pinboard and track it down again.

Combining Todoist and Pinboard leads me to my first productivity win:

## Aggressively closing Chrome tabs

If I have more than a handful of Chrome tabs open I start to get overwhelmed. I know folks often have a hard time closing their tabs but I've found having a combination of a good to-do list and a bookmark list helps me mentally file stuff away for later. If it's important I'll assign it a task and either drop the link in the task as a comment or pin it.

Then I close the tab. 💆‍♂️💆‍♂️💆‍♂️

If I don't do this then I feel like I'm staring at a wall of cognitive debt. If I file the tab away I know I've triaged it and it doesn't tug at my focus when I'm trying to complete something else.

One tip is to use **pinned tabs** in Chrome for things that you leave open all day like Gmail, chat, or calendars.
Here's what my tab bar usually looks like:

![A browser tab bar showing four pinned tabs and four open tabs](/images/chrome-tabs.jpg "I try to pin things to decrease the horizontal space taken up by tabs.")

## Alfred multi-clipboard

With a multi-clipboard, you can copy as many chunks of text as you want and then use a shortcut to open a little window so you can search and paste the right one. It will also keep track of your screenshots.

I use [Alfred](https://www.alfredapp.com/) for this but there are other tools that do something similar.

![A modal dialog showing text snippets and image filenames.](/images/multi-clipboard.jpg "A multi-clipboard expands my short term memory.")

If I'm going to attempt something sketchy in a file I'll **Select All** and hit copy so I know I have a backup in case things go wrong.

The built-in search is quite handy as I'll often remember a something from a week ago and I can usually dial it up with fuzzy search. Plus you can create handy snippets for emotes <span aria-hidden="true">ʕ•ᴥ•ʔ</span>

## Notion (or maybe Obsidian?)

Sometimes you just need a big notebook to braindump ideas. In the past, I've used Evernote and tried Bear. Currently I use [Notion](https://notion.so).

![A model window showing smoothie recipes written in markdown.](/images/notion.jpg "You too can be as smooth as Steph Curry")

I've found that while Notion looks great, I don't use the majority of its features, and text selection can make the authoring process clunky.

I've started looking into [Obsidian](https://obsidian.md) after seeing [Andy Bell](https://twitter.com/piccalilli_) switch to it on Twitter. I like that it's just a simple markdown tool that organizes things into a kind of brain wiki similar to [Roam](https://roamresearch.com/). Importantly Obsidian is free and all of the content stays on my machine as markdown files—so I don't have to worry that I'm sending these ✨**brilliant thoughts**✨ to a third-party.

## Brain.fm

I can't concentrate if the music I'm listening to has words in it. For a while, I've used the Spotify Focus playlists but discovered Brain.fm after [Sara Soueidan](https://twitter.com/SaraSoueidan) mentioned she uses it.

Brain.fm uses 🧪 **science music** 🧬 which sounds a lot like your typical focus playlist but it has this subtle warbling sound. They claim it makes your brain neurons do a happy dance.

> Brain.fm holds patents on key processes for creating functional music, including technology to elicit strong
> neural phase locking—allowing populations of neurons to engage in various kinds of coordinated activity—and
> technology to remove distraction in sound.

It's a pretty simple dashboard where you choose the type of music you want and then it plays a song for a few hours.

![A music player. Lo-fi focus music is playing.](/images/brain-fm.jpg "I thought it was silly but now I can't stop.")

I did the free trial, didn't think much of it, and went back to Spotify. But after a few days, I was like _"Dang, I feel like my phases aren't locking like they used to!"_ so I became a paying customer. I have no idea if the science works but I listen to it every day.

If you have neural phase envy, you can use [my referral code](https://brain.fm/invite/Rk0PNLEZrP) to try Brain.fm 🧠

## GitHub notifications

I used to filter all of my GitHub notifications to my email but I found it annoying because I couldn't differentiate between a new issue, a mention, or an assignment. A while back GitHub redid their notifications dashboard and made it more of an inbox of sorts with keyboard shortcuts to jump between notifications and archive them.

![A dashboard showing six GitHub issues assigned to me.](/images/github-notifications.jpg "It can sometimes feel overwhelming, but the notifications dashboard is a lot better than it used to be.")

I should probably do more to configure it, but right now I mainly use the **Assigned** and **Mentioned** tabs. Separately I'll scan through the PR tabs on any of my open projects and handle reviews there. I wish GitHub would let me automatically archive reviews once a PR is merged so I don't end up with a backlog saying I have 122 reviews to look at.

## That's it!

This was a very tools focused post, but I'd like to do a follow up about other work behaviors I've been trying to improve on like cutting down on coffee, scheduling recurring blocks for mindfulness meditation, etc.

If you found any of these tips helpful [give me a shout on Twitter](https://twitter.com/rob_dodson)!

---
title: How to Run a Node Script from the Command Line
tags:
  - Chain
  - Node
  - npm
date: 2012-06-16T02:46:00.000Z
updated: 2014-12-30T23:55:32.000Z
---

## First write some code

Make a new directory called `compliment` and create two files inside of it: `comliment.js` and `package.json`.

In `compliment.js` we're just going to print out some kind words.

```bash
#! /usr/bin/env node

console.log('you. are. AWESOME!');
```

Simple enough right? Just make sure you include that shebang up at the top which directs the system to use Node to execute our script.

## Package it up

Ok now that we have our little script we'll give its `package.json` some love.

```json
{
  "name": "compliment",
  "version": "0.0.1",
  "description": "Tell us how awesome we are.",
  "bin": {"compliment": "compliment.js"},
  "author": "Rob Dodson",
  "engines": {"node": "*"}
}
```

Most of that should be self explanatory. The key aspect is the `bin` section where you tell it to translate `compliment` into `compliment.js`. To install it all we have to do is run `npm link`. After you've done that you should be able to type `compliment` and hear how awesome you are!

## Publish it

When you're ready to distribute your binary to the world you can run:

```bash
npm publish
```

You'll be prompted to sign in to npm if you haven't already. After that you should see output confirming
that your package has been published.


---
title: How to setup PostgreSQL for Rails and Heroku
tags:
  - Rails
  - Rails 3
  - Ruby
  - Chain
  - PostgreSQL
  - Heroku
date: 2012-04-27T14:33:00.000Z
updated: 2014-12-30T06:18:27.000Z
exclude: true
---

### Install PostgreSQL Locally

Ryan Bates has already put together a wonderful Railscast on this topic so feel free to [jump over there](http://railscasts.com/episodes/342-migrating-to-postgresql) to view it. My main goal in writing this post was to distill down what he said, point out a small gotcha along the way and offer some additional tools.

There are a few different options for installing PostgreSQL. The first one, which Ryan outlines, is to use [Homebrew](http://mxcl.github.com/homebrew/) and simply do a `brew install postgresql`. Some folks might not be comfortable with that process so I wanted to also recommend the new [PostgreSQL.app](http://postgresapp.com/) from the team at [Heroku](http://www.heroku.com/). If you're more used to tools like [MAMP](http://www.mamp.info/en/index.html) then the PostgreSQL.app might be a bit more your style.

If you go the Homebrew route make sure you type in `initdb /usr/local/var/postgres` after the install finishes to init your first database. The installer will also mention some commands you can use to have PostgreSQL auto-start whenever you turn on your computer. I wasn't a big fan of this approach so instead I created two aliases in my .bash_profile.

```bash
alias pg-start='pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start'
alias pg-stop='pg_ctl -D /usr/local/var/postgres stop -s -m fast'
```

With these I can just type `pg-start` to fire up Postgres and `pg-stop` when I want to shut it down.

### Change Rails Database to PostgreSQL

The next thing you'll want to do is either convert an existing project to PostgreSQL or create a new rails project and set PostgreSQL as the database.

Creating a new rails project for Postgres is as easy as `rails new blog -d postgresql`. After running this command you'll also need to call `rake db:create:all` to create a new database.

To convert an existing project you'll want to update your Gemfile to include the `pg` gem. A basic Gemfile might look something like this:

    source 'https://rubygems.org'

    gem 'rails', '3.2.3'
    gem 'pg', '~>0.13.2'

    group :assets do
      gem 'sass-rails',   '~> 3.2.3'
      gem 'coffee-rails', '~> 3.2.1'
      gem 'uglifier', '>= 1.0.3'
    end

    gem 'jquery-rails'

You'll also need to update your config/database.yml to look for Postgres instead of SQLite or MySQL.

    development:
      adapter: postgresql
      encoding: unicode
      database: [insert your dev database name]
      pool: 5
      username: [insert your user name]
      password:

    test:
      adapter: postgresql
      encoding: unicode
      database: [insert your test database name]
      pool: 5
      username: [insert your user name]
      password:

Since we haven't created any Postgres user accounts both Homebrew and PostgreSQL.app will simply use our current username as the login. The password can remain blank. After this is done you'll also need to call `rake db:create:all` to create the new database.

### Connect a Rails Project to a PostgreSQL Database on Heroku

If your project isn't already under version control then now would be a good time to set that up.

    git init
    git add .
    git commit -m 'Initial commit!'

Next we'll create a free Heroku instance

    heroku create --stack cedar

After that's done we'll simply push our project up there.

    git push heroku master

You might see some deprecation warnings about vendor plugins. For now you can (probably) safely ignore those.

Here's one little gotcha that I seemed to run into. If you try to access your site on Heroku using the `heroku open` command you might get an error page. You have to make sure to also call `heroku run rake db:create:all` otherwise your production database will not be in place and your app will fail to connect to it. Speaking of production databases, you should also note that Heroku will overwrite whatever you put into your config/database.yml so you don't have to worry about figuring out all the connection details for their shared services...it'll all just work. Sweet!

### PostgreSQL GUI

One last tip re: your new Postgres setup. If you're just starting out like me then your command line fu is probably not as strong as you'd like it to be. Personally I really like having a nice GUI to visualize the tables in my database. For MySQL I usually use the awesome (and free) [SequelPro](http://www.sequelpro.com/). For PostgreSQL you can use [Induction](http://inductionapp.com/). It doesn't seem like they have a downloadable binary on their website (weird?) but you can grab one out of [the Github repo's downloads page](https://github.com/Induction/Induction/downloads). Connecting to your Postgres instance can be a little tricky, you have to make sure to use the PostgreSQL adapter, localhost as the hostname, your computer's username as the user and the password can remain blank. You also _HAVE_ to give it a database name (even though it says it's optional) or it will throw a `FATAL: database [your username] does not exist`. Here's a screenshot of what mine looks like:

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)


---
title: How to use EJS in Express
tags:
  - Chain
  - Node
  - Express
  - EJS
date: 2012-05-31T18:34:00.000Z
updated: 2016-05-04T02:54:30.000Z
---_Update: If you're starting a fresh project with Express it's much easier to just run `express --ejs`. That will scaffold out an Express app for you with EJS ready to go!_

Here's a quick explanation of how to use EJS instead of Jade in your Express projects. This is super easy and covered well in the documentation but I wanted to put it here since that's what I worked on today :)

To start I'll create a new project from the command line:

```bash
express foobar
cd foobar
npm install
```

Now that I have my foobar project created I need to install `ejs`.

```bash
npm install ejs --save
```

If you're within your project directory this will place ejs in the `node_modules` dir. Let's also add it to our package.json.

```json
{
  "name": "foobar",
  "version": "0.0.1",
  "private": true,
  "dependencies": {
    "express": "~2.5.8",
    "ejs": "~0.7.1"
  }
}
```

The tilde operator means that we require ejs verion 0.7.1 or greater but only up to the next major release. So the following are equivalent: `"~1.2" = ">=1.2.0 <2.0.0"`. For a deeper explanation of package.json and NPM in general [checkout this great post](http://howtonode.org/introduction-to-npm).

### Leaving Jade for EJS

If you're using the boilerplate that Express generates then it should be setup to use Jade as the rendering engine for its views. I think that Jade is cool but I need to baby step into Node/Express and make sure I understand everything that's going on instead of trying to consume so many different tools at once. With this in mind I decided to switch from Jade to EJS at least in the beginning because the syntax has no learning curve. To change your rendering engine you'll need to either add or edit the following call:

```js
app.set('view engine', 'ejs');
```

The boilerplate should have this set to `jade` inside of a configuration block. Once we've changed that line to read `ejs` we're ready to start writing some views.

### Setting up your layout

By default Express' boilerplate will look for a file named layout in our views directory. Let's write one called `layout.ejs`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Pivotal Search</title>
    <meta name="description" content="" />
    <meta name="author" content="" />

    <!-- HTML5 shim, for IE6-8 support of HTML elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- styles -->
    <link href="stylesheets/style.css" rel="stylesheet" />
  </head>
  <body>
    <%- body %>
  </body>
</html>
```

This is all really straightforward with the exception of the `<%- body %>` line which basically works like a `yield` in erb. Whatever template we pass to Express' `response.render()` function will fill this dependency, here's an example:

```js
app.get('/', function(req, res) {
  res.render('index', {title: 'The index page!'});
});
```

```html
<div class="title"><%= title %></div>
```

![Rendering the index template](/images/2014/12/rendering_the_index_template.png)

Furthermore we can use partials with Express and EJS like so:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Pivotal Search</title>
    <meta name="description" content="" />
    <meta name="author" content="" />

    <!-- HTML5 shim, for IE6-8 support of HTML elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- styles -->
    <link href="stylesheets/style.css" rel="stylesheet" />
  </head>
  <body>
    <%- partial('header.ejs') %> <%- body %>
  </body>
</html>

<header>My awesome header!</header>
<hr />
```

![Rendering the header partial](/images/2014/12/rendering_the_header_partial.png)

And there ya go! Simple but hopefully useful if you're just getting started like I am :) - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Eager, Alert
- Sleep: 7
- Hunger: 7
- Coffee: 0


---
title: How to use Polymer with Webpack
date: 2017-07-17T18:28:54.000Z
updated: 2017-07-17T18:30:02.000Z
old: true
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

Or if you’re using the demo project, `cd` into the demo directory and run `npm i` and <br/>`bower i`.

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

It depends. If you’re taking advantage of ES Module `import` syntax to pull in npm packages, then no. Otherwise anyone who wants to use your element would be required to also use Webpack. I think this tool is best used for handling code in your _own_ application and for elements that you don’t intend to share.

### Does this mean I don’t have to use bower anymore?

Not really. The primary reason Polymer, and Web Components in general, rely on bower is because Custom Element tag names are global. This means you can’t have multiple conflicting versions of an element trying to be registered at once. Bower enforces deduplicating version conflicts at install time so you _always_ end up with one version of a dependency. npm does not support this same feature, so for the time being it’s probably best to continue using bower to install your Web Components. If you’re curious to learn more about this [check out this clip from one of my recent I/O talks](https://www.youtube.com/watch?v=Ucq9F-7Xp8I&feature=youtu.be&t=31m16s).

### What about PRPL / code splitting?

One of my favorite features of HTML Imports is that it encourages you to colocate all of the HTML, CSS, and JavaScript for a component into a single file. This makes it easy to separate components that are critical for first render, from those that can come later in the process. You can then use a tool like Polymer CLI to bundle your critical and noncritical components into separate “fragments”, and lazy load them with Polymer's `importHref` method.

We can achieve the same effect in Webpack using a feature called [Code Splitting](https://webpack.js.org/guides/code-splitting/). The authors of the polymer-webpack-loader have put together a nice [Polymer Starter Kit example](https://github.com/Banno/polymer-2-starter-kit-webpack) which demonstrates [how to setup your Webpack configuration for code splitting](https://github.com/Banno/polymer-2-starter-kit-webpack/blob/master/webpack.config.js#L9), and how to swap out Polymer's `importHref` method for Webpack's [dynamic `import()`](https://github.com/Banno/polymer-2-starter-kit-webpack/blob/master/src/my-app.html#L127-L138).

## Conclusion

I think Custom Elements built with Polymer should absolutely work in any library or framework. But too often we hit bumps along the way, sometimes related to build tools, and it makes the entire process feel like more trouble than it's worth. I'm really excited about polymer-webpack-loader because it addresses a major pain point I've experienced and I can't wait to see more folks use it to bring Custom Elements into their project and share them across their teams.

Big thanks to Bryan Coulter and Chad Killingsworth for creating polymer-webpack-loader and Sean Larkin for reviewing this post.


---
title: A Basic RVM Tutorial for Rails 3
tags:
  - Rails
  - Rails 3
  - Ruby
  - rvm
date: 2011-09-23T14:33:00.000Z
updated: 2015-01-02T09:04:06.000Z
---

### What is RVM?

[RVM](https://rvm.io//) is a great Ruby and gem management tool that should probably be the first thing you install if you’re learning Rails (or Ruby for that matter). The main benefit of RVM is that it helps to keep your rubies and your gems organized into discrete folders which can easily be thrown away and recreated. If you’ve ever had a gem explode on you, then you know how great a feature like this is. I’ll cover the basics of using RVM in this post to quickly get you up and running. This tutorial is written for the OSX terminal, if you're on Windows...um...kill yourself.

### How to Install RVM

First download and run the RVM installation script. Thankfully the authors have made this nice and easy for you. Just copy and paste the following into your command line:

```bash
curl -L get.rvm.io | bash -s stable
```

Next you’re going to want to make sure that RVM gets loaded into your shell sessions. The easiest way to do this is to open up your .bash_profile file located in your user's home directory (that's what the ~ stands for in your terminal) and add the following to the bottom:

```bash
[[ -s "$HOME/.rvm/scripts/rvm" ]] && . "$HOME/.rvm/scripts/rvm" # This loads RVM into a shell session.
```

Then quit your terminal window and open it up again. You should be able to type: `rvm -v` to verify that RVM is loaded and ready for use. If instead it just returns the prompt then you've probably missed a step along the way. Check out the [RVM installation page](https://rvm.io/rvm/install/) and double check that you've done everything correctly.

### A Guided Tour of RVM's Inner Workings

To get us started lets look around inside the .rvm directory. Try the following:

```bash
cd ~/.rvm
ls
```

When you list out the contents of rvm you’ll see several folders but the ones we’re most interested in are gems and rubies. The gems folder is going to hold all of our gems after we create a _gemset_. The rubies folder holds different versions of ruby for us to play with. The really cool thing about RVM is that it lets you swap versions of ruby and different gemsets around so you can test out new packages without blowing stuff up. Made a mistake and installed the wrong gems? Just blow away the gemset and start over, no need to track everything down and uninstall it. RVM also lets you ensure that you have the same gems running for your dev, test and production environments :)

Now that you have RVM installed, the next thing you’ll want to do is to install the latest version of Ruby. If you haven’t previously installed Ruby and you’re on OSX then typing `ruby -v` into the command line should produce something like this:

`ruby 1.8.7 (2009-06-12 patchlevel 174) [universal-darwin10.0]`

We’re going to leave the default version of Ruby installed on our machine, and instead install a new version using RVM. The current latest version of Ruby is 1.9.3, so try typing:

```bash
rvm install 1.9.3
```

It will take a little while to run but if all goes well we should have a brand new working copy of Ruby.

Now try:

```
rvm use 1.9.3
ruby -v
# ruby 1.9.3p125 (2012-02-16 revision 34643) [x86_64-darwin11.2.0]
which ruby
# /Users/Rob/.rvm/rubies/ruby-1.9.3-p125/bin/ruby
```

We can see that not only are we running the latest version of ruby, but instead of being stashed in some random system folder somewhere, it’s being kept inside of a directory in RVM. To make sure that every time we open terminal we are using this new version of ruby we’ll simply say:

```
rvm use 1.9.3 --default
```

That will tell RVM to use this version as its default Ruby any time we open a terminal session.

### What are RVM Gemsets?

I have to admit that when I first started using Ruby I found the concept of gems really confusing. In Flash or JavaScript if you want to use some code you just download the folder from github and include it in your project. Ruby does something similar with gems except it tries to automate the process for you and often times this can lead to busted projects. Because some gems rely on other gems it isn’t unheard of to have two gems in conflict which means your project won’t run and if you’re new to ruby or rails this can be just enough to make you call it quits. Here is where RVM really shines because it makes it OK to screw up your gems by sequestering them into their own little packages which you can recreate and destroy at will.

Lets get started by typing:

```bash
rvm gemset create my-new-gemset
```

You should get a confirmation that a new gemset was created as well as a path to the new gemset. Let’s go take a look at that path.

```bash
# Make sure to use the path RVM provided you.
cd /Users/RobDodson/.rvm/gems/ruby-1.9.3-p125@my-new-gemset
ls
```

Right now the folder is empty because we haven’t told RVM to install any gems into this gemset. Let’s change that by first assigning our current instance of ruby to this set.

```bash
rvm 1.9.3@my-new-gemset --default
```

The @ character tells RVM that we want to assign this gemset to our current ruby instance. The default flag is just there since I tend to forget to make my gemsets defaults and RVM will reset to whatever the prior default was the last time the flag was set. Let’s verify that things worked by typing:

```bash
rvm current
```

Which should output: `ruby-1.9.3-p125@my-new-gemset`. Similarly you could type:

```bash
rvm gemset list
```

To see a list of all your gemsets with a hash rocket next to the one currently in use.

### How to Install Gems with RVM

Ok, so lets install some gems then. We’ll start by installing the Nokogiri gem, just as a test. But before we do this let me give you a little warning. In a lot of documentation you'll see people installing gems with the `sudo` keyword at the beginning of the commmand. If you're not using RVM then doing it this way makes sense. However if you ARE using RVM then _you should never install a gem with `sudo`!_ In short, RVM does command line wizardry and installing gems with `sudo` will place them outside of the .rvm directory. You'll think you've installed a gem properly but really it'll be somewhere in the system folder. To install a gem using RVM we simply leave off the `sudo` keyword. Let's try one by typing:

```bash
gem install nokogiri
```

After the installation has finished we should be able to see our new gem. If you’re still inside of the gems directory from earlier you can do a `cd gems`

otherwise you’ll need to dig into it with a path that looks like this

`cd /Users/RobDodson/.rvm/gems/ruby-1.9.3-p125@my-new-gemset/gems`

Now if you type `ls` you should see your version of nokogiri. Let’s pause for a moment and consider what just happened. If you use Ruby Gems without RVM then everything will be installed in the system folder. If we wanted to have 2 different versions of nokogiri we would need to make sure that there wasn’t any kind of conflict in our gems directory. Since we’re using RVM to manage our gems, we’re able to tell Ruby Gems to put one version of nokogiri in the ‘my-new-gemset’ directory and another version in the ‘some-other-gemset’ directory. This is a great feature, especially when you want to try out an upgrade or a different version of a particular library. Rather than having to uninstall your working gem, you can just create a new gemset. If things blow up then you can throw it away and revert back to the previous gemset.

Lets make another gemset and this time install a new instance of Rails.

```bash
rvm create gemset my-new-rails-setup
rvm 1.9.3@my-new-rails-setup
gem install rails
```

Now lets go into the folder for that gemset. Again the path should look similar to this:

`cd /Users/RobDodson/.rvm/gems/ruby-1.9.3-p125@my-new-rails-setup/gems`

Type `ls` this time and you’ll see _WAY_ more gems. Imagine that we wanted to test our application on a different version of Rails. Managing all those gems in one directory would be a huge pain but thankfully RVM is taking care of that for us. If we decide that this version of rails is not for us we can just delte the gemset with:

```bash
rvm gemset delete my-new-rails-setup
```

And recreate it however we want :D

That wraps it up for today. If you have any questions you can post a comment or hit me up on twitter [@rob_dodson](http://twitter.com/robdodson).

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)


---
title: How To Write a Command Line Ruby Gem
tags:
  - Ruby
  - Chain
date: 2012-06-14T15:17:00.000Z
updated: 2014-12-30T23:54:23.000Z
---So [yesterday we saw how to setup and run ruby scripts as executables from the command line.](http://robdodson.me/blog/2012/06/13/writing-a-command-line-tool-in-ruby/) While this is pretty rad, it definitely has its limitations. For one, it's not very portable and secondly it just isn't very flexible or powerful. If we stuck with this approach we'd need to write our own semantic versioning, we'd have to setup a way to make sure that all of our required 3rd party gems get installed properly... really it'll just be a big mess if we try to hand-roll it.

Instead we're going to turn to Bundler to help us manage our files and turn our command line tool into a ruby gem. I'm going to start fresh and create a totally new tool, called `zerp`. I don't know what `zerp`'s purpose will be in the long run, but today we're going to make it print some text to verify everything is working.

## New RVM Gemset

Before I do anything with gems I want to make sure I have a cleanroom of sorts. So if anything goes horribly wrong I can just throw everything away and start over. To do this we'll use RVM to create a new gemset.

```bash
rvm gemset create zerp
rvm gemset use zerp
```

If you run `rvm current` you should see something like this: `ruby-1.9.3-p125@zerp`

Now that we have our cleanroom we can template out a new gem.

## Bundle Gem

If bundler is not one of our global gems we can go ahead and install it with `gem install bundler`. You can do `gem list` to see what gems are in your global set.

With Bundler in hand we will generate the boilerplate for our new gem:

`bundle gem zerp`

This will create a new folder called `zerp/` and fill it with several files. `cd` into `zerp/` and take a look around.

```bash
drwxr-xr-x  10 Rob  staff   340B Jun 14 08:38 .
drwxr-xr-x  21 Rob  staff   714B Jun 14 08:38 ..
drwxr-xr-x  11 Rob  staff   374B Jun 14 08:38 .git
-rw-r--r--   1 Rob  staff   154B Jun 14 08:38 .gitignore
-rw-r--r--   1 Rob  staff    89B Jun 14 08:38 Gemfile
-rw-r--r--   1 Rob  staff   1.0K Jun 14 08:38 LICENSE
-rw-r--r--   1 Rob  staff   490B Jun 14 08:38 README.md
-rw-r--r--   1 Rob  staff    48B Jun 14 08:38 Rakefile
drwxr-xr-x   4 Rob  staff   136B Jun 14 08:38 lib
-rw-r--r--   1 Rob  staff   626B Jun 14 08:38 zerp.gemspec
```

Bundler has already setup a git project for us, as well as including a folder structure for our library. [This article from rails-bestpractices.com does a great job of explaining what everything in the boilerplate is.](http://rails-bestpractices.com/blog/posts/8-using-bundler-and-rvm-to-build-a-rubygem)

## Zee Codez!

Our project contains a folder called `lib` which is where we'll store our Ruby code. Open up `lib/zerp.rb`. We'll populate it with an example class called `Chatter` which'll spit out our version of Hello World.

```ruby
require "zerp/version"

module Zerp
  class Chatter
    def say_hello
      puts 'This is zerp. Coming in loud and clear. Over.'
    end
  end
end
```

## Executable

It wouldn't be much of a CLI without an executable. For that we'll need to create a folder called `bin` in the root of our project. Next create a file called `zerp` without any kind of file extension. We're going to require our `Chatter` class and tell it to `say_hello`.

```bash
#!/usr/bin/env ruby

require 'zerp'

chatter = Zerp::Chatter.new
chatter.say_hello
```

The shebang `#!/usr/bin/env ruby` tells the system that it should use Ruby to execute our code. After that we require our 'zerp' module defined previously. Finally we instantiate `Zerp::Chatter` and tell it to `say_hello`. If all goes well it should respond with

```bash
This is zerp. Coming in loud and clear. Over.
```

Let's see if we can make that happen.

## Gemspec

We're going to open the `zerp.gemspec` and make it look like so:

```ruby
# -*- encoding: utf-8 -*-
require File.expand_path('../lib/zerp/version', __FILE__)

Gem::Specification.new do |gem|
  gem.authors       = ["Rob Dodson"]
  gem.email         = ["lets.email.rob@theawesomegmails.com"]
  gem.description   = %q{When a problem comes along..You must zerp it}
  gem.summary       = %q{Now zerp it..Into shape}
  gem.homepage      = "http://robdodson.me"

  gem.files         = `git ls-files`.split($\)
  gem.executables   = ["zerp"]
  gem.test_files    = gem.files.grep(%r{^(test|spec|features)/})
  gem.name          = "zerp"
  gem.require_paths = ["lib"]
  gem.version       = Zerp::VERSION
end
```

The main thing I did was to correct the two 'TODO' entries, and to change the `gem.executables` line from

```ruby
gem.files.grep(%r{^bin/}).map{ |f| File.basename(f) }
```

to

```ruby
gem.executables   = ["zerp"]
```

For reaons unknown to me the previous code wasn't picking up my executable properly so I replaced it with `["zerp"]`. I got the idea from [Project Sprouts which also uses this technique and seems to work fine on my system.](https://github.com/lukebayes/project-sprouts/blob/master/sprout.gemspec)

Alright we're done! Let's test this thing!

## Cross your fingers

To install the Gem we'll use Rake's `install` task. Go ahead and run `rake install` from the root of the project. It should create a `pkg` directory and notify us via the terminal that our gem was installed succesfully. Moment of truth time...type `zerp` into the terminal. If you see `This is zerp. Coming in loud and clear. Over.` then you're good to go. After you've committed everything to Github and setup a RubyGems account you should be able to run `rake release` to send your gem out into the world where it can wow the jaded masses and delight with all its wonders. Good Luck! - Rob


---
title: 'HTML5 Template Tag: Introduction'
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
  <img src="" alt="random kitten image" />
  <h3 class="title"></h3>
</template>

<div id="kittens"></div>

<script>
  const template = document.querySelector('#kitten-template');
  template.content.querySelector('img').src = 'https://placekitten.com/400/400';
  template.content.querySelector('.title').textContent =
    'Random image from placekitten.com';
  document
    .querySelector('#kittens')
    .appendChild(document.importNode(template.content, true));
</script>
```

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


---
title: Custom Elements That Work Anywhere
date: 2016-11-30T18:32:38.000Z
updated: 2016-11-30T18:42:50.000Z
---

Safari Tech Preview 17 now has Custom Elements [“enabled everywhere”](https://developer.apple.com/safari/technology-preview/release-notes/#r17), meaning it won’t be long before they’re shipping in a stable version. Since more browsers are starting to adopt Custom Elements, I thought it would be a good time to share some of the patterns I’ve learned from building and speaking about them over the past few years.

In [The Case for Custom Elements](https://medium.com/dev-channel/the-case-for-custom-elements-part-1-65d807b4b439#.k7sm324jh) I pointed out that Custom Elements should be able to work in any context where HTML works. This includes being used by popular frameworks. To that end, the patterns I’m sharing in this post will not only help you write high quality components, but should also aid in framework interoperability. Specifically I’ll be referring to React and Angular 2 in this post as those are the ones I’m most familiar with, but ideally these patterns should benefit interoperability with all frameworks/libraries.

### Use properties as your source of truth

Every HTML Element has the ability to receive state through its attributes and properties. Traditionally attributes are used to set the initial state of an element but they do not update as the element changes over time. For example:

```html
<input type=”checkbox” checked>
```

The above line of code will render a checked checkbox. Clicking on the checkbox will uncheck it, however, the `checked` attribute will still exist in the DOM.

![an animation showing the DOM for an input checkbox. clicking on the checkbox does not remove the checked attribute from the DOM.](/images/2016/11/checkbox.gif)

The same is true if you set a `value` attribute on a text input and then type in a new phrase. Calling `getAttribute(‘value’)` will produce the original (stale) attribute value. However, asking for the `.value` property will produce the correct result. In other words, **attributes are useful for initial configuration, whereas properties are good for reflecting state**. This leads to a few takeaways:

- **The state of an element should always be determinable by its properties and it should not matter the order in which the properties are set**.
- Every exposed attribute should have a corresponding property
- Updating an attribute should reflect that change to the property
- Updating a property should reflect back to an attribute only when it benefits styling, or perhaps accessibility (e.g. if you expose an API where setting a role property would reflect to an ARIA role attribute). If the property sets the corresponding attribute, and you’re using the `attributeChangedCallback`, you’ll want to add a guard to prevent an infinite loop.

Here’s an example element, a Custom Menu with a selected attribute/property, that adheres to the above pattern:

```js
class CustomMenu extends HTMLElement {
  static get observedAttributes() {
    return ['selected'];
  }
  // Called anytime the 'selected' attribute is changed
  attributeChangedCallback(attrName, oldVal, newVal) {
    this[attrName] = newVal;
  }
  // Takes a numeric index value
  set selected(idx) {
    if (this._selected === idx) return;
    this._selected = idx;
    /* Update the DOM as necessary */
  }
  get selected() {
    return this._selected;
  }
}
```

This pattern becomes especially important when we think about interoperability with frameworks. Consider the following piece of code from Angular 2:

```html
<custom-checkbox [checked]="item.inShoppingCart"></custom-checkbox>
```

This is a one-way data binding which sets the checked state of the element equal to a model value, in this case the `inShoppingCart` property of the `item` object. While it looks like we’re working with an attribute here, in actuality, Angular 2 is setting a property on the element. The above line of code is functionally equivalent to:

```js
customCheckbox.checked = item.inShoppingCart;
```

*Note: Angular 2 also provides special syntax for [binding to attributes](https://angular.io/docs/ts/latest/guide/template-syntax.html#!#other-bindings), but favors binding to properties.*

One of the reasons frameworks prefer setting properties over attributes is because **attributes can only pass string values**, whereas many frameworks often need to pass more complex data like arrays and objects. To pass complex data with attributes would require serializing the data to JSON strings, setting those values on attributes, and then parsing that JSON on the other side to turn it back into an object. Using properties for everything avoids this extra work. This also highlights the need for a standards based way to declaratively serialize/deserialize data to/from something like attributes. Today libraries are forced to work around this limitation (either via JSX or data binding) but having an agreed upon way to declaratively pass complex data would be a big win for the platform.

### Data out via events

Keep this mantra in mind: **“data in via attributes and properties, data out via events”**.

![a diagram of a custom element. data goes in via attributes and properties and data goes out via events.](/images/2016/11/data-in-out-1.png)

We’ve already covered how to get data into an element, now let’s talk about how we tell the outside world that our state has changed.

The DOM provides an easy mechanism for dispatching events in the form of the [CustomEvent constructor](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent). If you’re building a custom checkbox and a user clicks on it, the appropriate thing to do would be to tell the outside world that your `checked` state has changed:

```js
class CustomCheckbox extends HTMLElement {
  connectedCallback() {
    this.addEventListener(‘click’, this.onClick);
  }
  onClick(e) {
    // This should trigger a setter which updates the DOM
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent(‘checked-changed’, {
      detail: { checked: this.checked }, bubbles: false
    }));
  }
}
```

Frameworks already have built-in mechanisms for listening to DOM events, so they should be able to work with your component if it uses this pattern. For example, to respond to this check change in React we could do the following:

```js
class SignUp extends React.Component {
  componentDidMount() {
    this.refs['signup'].addEventListener(
      'check-changed', this.onCheckChanged.bind(this)
    );
  }
  onCheckChanged(e) {
    /* Notify the outside world via callback or Redux */
  }
  render() {
    return (
      <div>
        <span>Join Our Newsletter!</span>
        <custom-checkbox
          ref="signup"
            checked={this.props.user.hasJoined}>
        </custom-checkbox>
      </div>
    );
  }
}
```

*Note: There’s an ongoing discussion about improving event handler interop between Web Components and React [over on GitHub](https://github.com/facebook/react/issues/7901). Till that issue is resolved you can use a library like [webcomponents/react-integration](https://github.com/webcomponents/react-integration) to smooth over interop issues.*

Or in Angular 2:

```html
<span>Join Our Newsletter</span>
<custom-checkbox
  [checked]="user.hasJoined"
  (check-changed)=”user.hasJoined=$event.detail.checked”>
</custom-checkbox>
```

The key thing is that we’re telling the outside world that our state has changed. For top-down, unidirectional data flow systems this is important because it affords them the opportunity to revert that change if it doesn’t match their model. For example, React listens for the `change` event from the native `<input type=”checkbox”>` element, and if it doesn’t match React’s internal model, it reverts the change. Making sure our Custom elements dovetail into this system means they’ll ultimately be more shareable across the entire ecosystem.

When I showed this pattern off recently someone asked if it would be better to dispatch the events inside of the property setters, for example:

```js
set checked(val) {
  this._checked = val;
  /* do any other updates we need */
  this.dispatchEvent(new CustomEvent(‘check-changed’, {
    detail: checked: val
  }));
}
```

The danger with doing this is you may end up creating an infinite loop if there’s an external listener for the event which in turn updates the property. Looking again to native elements, it seems that their event dispatching only takes place when some external force is acting upon the element, e.g. someone clicked, someone typed, something loaded, etc. Hence, we don’t dispatch `check-changed` when the public property is set, but instead only when someone clicks on the checkbox.

Also note that special care should be taken when working with events to prevent leaking too much information to the outside world. **In general, don't bubble events unless they are semantically meaningful**. For example, `changed` is not a very semantically meaningful event, whereas `document-opened` would be. Non-semantic events can leak up and another element may accidentally handle them. Plus it makes things less explicit. Colocating the event dispatcher, and the element handling it makes relationships easier to grok. By default, custom events won't bubble out of shadow roots without the `composed: true` flag set, so Custom Elements using Shadow DOM are default encapsulated w/ custom events.

In cases where you do need to bubble events, the element that handles the event should probably call `event.stopPropagation()`. Unless that element also has a good reason for letting the event continue to bubble up.

### Favor a declarative API over an imperative API

It is preferable to always use properties (or attributes that reflect their changes to properties) to define the state for your component. This means avoiding methods which mutate state without reflecting those changes to the corresponding properties and dispatching the appropriate events. By focusing on properties you make it much easier to build your app in a declarative fashion.

```html
<custom-dialog opened>
<!-- which is the same as saying... -->
customDialog.opened = true;
``` 

Instead of:

```js
customDialog.open();
```

In the example above, the state of the app can be reasoned about entirely using HTML, whereas the second example requires imperative setup code in JavaScript (specifically calling a method). The declarative version lends itself well to systems like React/Redux and Angular 2 which favor a top-down data flow model, as they can just pass in the appropriate attributes/properties to make the state in the DOM match the state in their data stores.

### Avoid sync issues with Shadow DOM

Frameworks and libraries which manage the DOM often have systems to dictate when components can render and how the DOM is updated. A good example is React’s virtual DOM diffing which creates a kind of snapshot of the DOM and uses it to reconcile changes whenever components update their state.

Custom Elements, on the other hand, render DOM in response to lifecycle callbacks triggered by the HTML parser. This means they may operate outside of a library’s ability to snapshot the DOM. This has the potential to lead to sync issues as the Custom Element upgrades and renders its own DOM that then does not match the snapshot the library is diffing against.

[Shadow DOM](https://developers.google.com/web/fundamentals/getting-started/primers/shadowdom) offers a way to protect both the Custom Element and the library from getting their wires crossed. It does this by creating a shadow root, essentially a self-contained tree which the Custom Element can treat as its own private world, obscuring its internal DOM state from the rest of the page. Many of the native elements that you work with every day (`input`, `video`, etc) use Shadow DOM to encapsulate their internals.

![Chrome devtools showing the shadow root for an input range element](/images/2016/11/shadow-root.png)

*To see this go to the Settings in Chrome Dev Tools and check “Show user agent Shadow DOM”.*

Adding Shadow DOM to a Custom Element is quite easy:

```js
class XFoo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `<p>Hello from x-foo</p>`;
  }
}
window.customElements.define('x-foo', XFoo);
```

Or if you prefer using a `<template>` element for your markup:

```html
<template id=”x-foo-tmpl”>
  <p>Hello from x-foo</p>
</template>
```
```js
class XFoo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    const tmpl = document.querySelector('#x-foo-tmpl');
    this.shadowRoot.appendChild(tmpl.content.cloneNode(true));
  }
}
window.customElements.define('x-foo', XFoo);
```

Using Shadow DOM will ensure that your element avoids potential conflicts with any framework managing the page and, as an added bonus, you’ll get style scoping for free!

### Wrapping Up

The patterns listed above are based on conversations I’ve had with framework authors and I imagine over time we’ll need to augment and add to this list. Because the Web Component ecosystem is still fairly new, it feels like a good time to explore these patterns before possible bad habits get burned in and become widespread. If you’re building a Custom Element, consider giving these patterns a shot, and be sure to share your final project over on the new Web Components catalog. Also leave some comments! Thanks :)

*Big thanks to Addy Osmani, Justin Fagnani-Bell, Jeff Cross, Rob Wormald, Sebastian Markbåge, and Trey Shugart for their reviews.*


---
title: "JavaScript Design Patterns: Decorator Update"
tags:
  - Design Patterns
  - JavaScript
  - Decorator
date: 2012-08-31T01:07:00.000Z
updated: 2015-01-02T08:52:18.000Z
---

[Yesterday's post](http://robdodson.me/blog/2012/08/27/javascript-design-patterns-decorator/) drew a lot of traffic from Reddit and with it came some really good feedback. If you haven't read the [previous post](http://robdodson.me/blog/2012/08/27/javascript-design-patterns-decorator/) please do so first and then come back here.

I want to go through some of what was said so I can refine my examples and also clear up any confusion.

## That prototype example sucked!

OK let me start off by apologizing for even including that second example (the `Sale` decorators). It was meant as a kind of fun academic exercise but I tried to make it clear that I wasn't suggesting anyone actually implement it. Redditor gizmo490 pointed out that for the pattern to actually work you would have to overwrite all the methods of the `Sale` object or risk working in the wrong context. You can see our full discussion [here.](http://www.reddit.com/r/javascript/comments/z0z2j/decorators_in_javascript_hope_you_enjoy/c60qb0c)

So I'll just say if you're considering that second example: Stop. Just don't do it. It is way too much code.

## We don't necessarily need all those objects

Another Redditor, Draders, pointed out that the decorator objects aren't really necessary since we can just put functions directly into the decoratorsList.

```js
// This is presuming that `add` pushes a function into the
// list of decorators
validator.add('zipcode', validateZipCodeFunction);
```

If you want `validateZipCodeFunction` to be reusable you'll have to define it somewhere and attaching it to the Validator object is probably a fine choice. In the end it's a bit less code so definitely something to think about.

## Finally, the power of CLOSURES!

Finally, and this is really the reason why I wanted to write this update, Redditor emehrkay pointed out that my examples are basically ignoring the power of JS functions and closures. [In his quick and dirty example](http://www.reddit.com/r/javascript/comments/z0z2j/decorators_in_javascript_hope_you_enjoy/c60rl7x) he shows how to achieve a similar goal with much less code:

```js
function test(arg){
    return arg + arg;
}

function testDecorator(fn, args){
    var arg = args[0] * 2;

    return fn(arg);
}

function decorate(dec, fn, args){
    return function(){
        return dec(fn, args);
    }
}

x = decorate(testDecorator, test, [2])();
console.log(x)
```

So here's my attempt to recreate the `Sale` example but using more of emehrkay's approach:

```js
function Sale(price) {
    this.price = price || 100;
}

Sale.prototype.getPrice = function() {
    return this.price;
};

Sale.prototype.setPrice = function(price) {
    this.price = price;
};

function usd(fn, context) {
    var price = fn.call(context);
    return "$" + price;
}

function decorate(dec, fn, context) {
    return function() {
        return dec.call(context, fn, context);
    };
}

// Let's run it!
var sale = new Sale(50);

// Decorate our getPrice method. We'll just add
// some extra dollar signs to the output.
sale.getPrice = decorate(usd, sale.getPrice, sale);
sale.getPrice = decorate(usd, sale.getPrice, sale);
sale.getPrice = decorate(usd, sale.getPrice, sale);
console.log(sale.getPrice()); // output: $$$50

// Test to make sure other methods can still
// access the price in the correct context
sale.setPrice(100);
console.log(sale.getPrice()); // output: $$$100
```

Since we're kind of mixing OO and functional style here the one caveat is that you have to pass the context to your decorators so when they call `getPrice` they know which instance they're referring to. So the code is a little funky but still interesting and if anyone can think of a way to write it cleaner I'm all ears!

**[Grab the Example Source](https://github.com/robdodson/JavaScript-Design-Patterns/tree/master/decorator/)**


---
title: "JavaScript Design Patterns: Decorator"
tags:
  - Design Patterns
  - JavaScript
  - Decorator
date: 2012-08-27T16:59:00.000Z
updated: 2014-12-31T00:38:28.000Z
---

#### [Table of Contents](https://robdodson.me/blog/2012/08/03/javascript-design-patterns/)

[Update: Part 2 has been posted!](https://robdodson.me/blog/2012/08/30/javascript-design-patterns-decorator-pt-2/)

A Decorator is an object which adds functionality to another object dynamically. It can be used to enhance the behavior of an object without requiring the author to reopen its class. While Decorators might feel a little weird to implement in static languages they're extremely simple in JavaScript due to the ease with which JS passes around functions and handles dynamic types.

Formal Definition
-----------------

> Attach additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.

### Also Known As

-   Wrapper

When to use it
--------------

-   When you'd like to add responsibilities to individual objects dynamically (i.e. without subclassing/inheritence).
    
-   When you'd like to be able to remove the functionality at a later time. An `undecorate` method, for instance.
    
-   When extension by subclassing would be unmanageable or lead to a class explosion. For instance, if a `Vehicle` class is subclassed by 30 other vehicle objects with only minor differences.
    

Pros and Cons
-------------

-   **Pro**: More flexible than inheritance.
    
-   **Pro**: Avoids feature-laden classes high up in the hierarchy.
    
-   **Con**: A decorator and its component aren’t identical.
    
-   **Con**: Lots of little objects.
    

A Brief Explanation
-------------------

The Decorator pattern is very similar to one we've addressed earlier, called [Strategy.](https://robdodson.me/blog/2012/08/03/javascript-design-patterns-strategy/) The differences between the two can be subtle but usually a decorator _enhances_, layers upon or "decorates" the object or method it's wrapping. In contrast, a strategy will replace a method's algorithm completely.

The primary benefit of the Decorator pattern is that you can take a rather vanilla object and wrap it in more advanced behaviors. For instance a view which renders a plain window can have decorators to add different backgrounds, scroll bars, borders, etc. The underlying code, or guts, of the window object remains the same while the decorators provide a new _skin._

Decorators are not limited to visual components. In fact much of the `java.io` package is composed of Decorators which add additional functionality such as buffering file streams and adding line numbers. A similar application to JavaScript might involve decorating I/O in Node.js. For instance, incoming data might need to be converted to ASCII and then compressed in some way. It might not _always_ need to be converted to ASCII and it might not _always_ need to be compressed. In this scenario we can apply or remove I/O decorators at runtime changing the behavior of our object instead of writing a big class with a bunch of cross-cutting concerns.

Enough Talk! COOOOODE!!!
------------------------

Ok so let's do an example. We're going to create a `Validator` class which looks at the contents of a form and adds error messages to an array if anything in the form is not correct. We want our `Validator` to be really simple so it'll just have two methods: `validate` and `decorate`. As the name implies `validate` will tell our validator to compare the form against its internal rules. We'll use `decorate` to specify those rules. The `decorate` method will accept a String, such as 'hasAge' or 'hasZipCode' which corresponds to an actual function. We'll collect these functions in a list and compare the contents of the form to each item in the list.

We'll start with the constructor and `decorate` method:

```js
function Validator () {
	this.errors = [];
	this.decoratorsList = [];
}

Validator.prototype.decorate = function(name) {
	this.decoratorsList.push(name);
};
```

We'll collect any error messages in the `errors` array. We could write a method like `validator.hasErrors()` to check the length and contents of the array but for now I'll leave that unspecified. Just know that if we do come across an error we'll toss it in there.

The `decoratorsList` will hold all of our decorator functions. This is not how the Gang of Four does things, or how you will see the Decorator pattern presented in languages like Java or C++, but that's because they're using static languages which don't do well with functions being passed around. In our case since JavaScript functions are objects we can pass our decorators into a collection to have them called sequentially. This is the easier approach recommended by [Stoyan Stefanov](https://twitter.com/stoyanstefanov) in [JavaScript Patterns.](https://www.amazon.com/JavaScript-Patterns-Stoyan-Stefanov/dp/0596806752) A little later I'll show you the "hard" approach and you can decide which you prefer ;)

OK moving on... Let's define some decorator functions. We'll add an object to our constructor called `decorators` and we'll attach our functions to it.

```js
Validator.decorators = {};

Validator.decorators.hasName = {
	validate: function(form) {
		// Code to verify presence of name...

		// If no name found...
		this.errors.push('no name!');
	}
};

Validator.decorators.hasAge = {
	validate: function(form) {
		// Code to verify presence of age...

		// If no age found...
		this.errors.push('no age!');
	}
};

Validator.decorators.hasZipCode = {
	validate: function(form) {
		// Code to verify presence of zip code...

		// If no zip found...
		this.errors.push('no zip!');
	}
};
```

Each decorator is actually an object which implements the same interface as our `Validator` object. When we have all of our decorators added to our `decoratorsList` we'll be able to loop through and call `validate` on each one.

```js
Validator.prototype.validate = function(form) {
	var i,
		max,
		name;

	this.form = form;

	max = this.decoratorsList.length;
	for (i = 0; i < max; i++) {
		name = this.decoratorsList[i];
		Validator.decorators[name].validate.call(this, form);
	};
};
```

At last we come to the `validate` method. It first receives an object containing all of our form data. Next it prepares to loop through our collection of decorators. We use the name of the decorator object as a key and `call` its `validate` method, passing in `this` for our context and also the form object as an argument. This way all of the validators will execute in the context of our `Validator` instance and they should all have access to the form data.

Let's try it out!

```js
var validator = new Validator();
validator.decorate('hasName');
validator.decorate('hasAge');
validator.decorate('hasZipCode');
validator.validate({}); // we'll just use a blank object in place of real form data
console.log(validator.errors);
```

We aren't really doing any validation at this point so our `console.log` at the end should output an array with 3 error messages, one from each of the validator decorators. But there you go, you've now got a fully decorated `validate` function. What was once rather vanilla can have all sorts of new and interesting validations applied to it!

What if my Decorators need additional arguments?
------------------------------------------------

The above example gets us started decorating but it leaves some room for improvement. For starters what if we want to pass additional arguments to our validation functions? Let's revamp this thing just a bit so we can get really fancy...

```js
function Validator () {
	this.errors = [];
	this.decoratorsList = [];
}

Validator.prototype.decorate = function(name, args) {
	this.decoratorsList.push({ name: name, args: args });
};

Validator.decorators = {};

Validator.decorators.hasName = {
	validate: function(form, args) {
		// Code to verify presence of name...

		this.errors.push('no name!');
	}
};

Validator.decorators.hasAge = {
	validate: function(form, args) {
		// Code to verify presence of age...

		this.errors.push('no age!');
	}
};

Validator.decorators.hasZipCode = {
	validate: function(form, args) {
		// Code to verify presence of zip code...

		this.errors.push('no zip!');
	}
};

Validator.prototype.validate = function(form) {
	var i,
		max,
		temp,
		name,
		args;

	this.form = form;

	max = this.decoratorsList.length;
	for (i = 0; i < max; i++) {
		temp = this.decoratorsList[i];
		name = temp.name;
		args = temp.args;
		Validator.decorators[name].validate.call(this, form, args);
	};
};
```

This time we are passing an optional hash to our `decorate` method which is stored along with its corresponding decorator object. If you've ever used validators in Rails this should feel similar. Time to see it in action!

```js
var validator = new Validator();
validator.decorate('hasName', { length: 5 });
validator.decorate('hasAge', { minimum: 21 });
validator.decorate('hasZipCode');
validator.validate({}); // some form data. in this case just an anonymous object
console.log(validator.errors);
```

Time to do things the hard way...
---------------------------------

I promised I would show you the more classical example of Decorator and since I am a man of my word I _guess_ you can see it... I would not recommend using this approach because it can require overwriting all of your methods to make sure you're always in the correct context. Still, as a kind of academic observation it's a cool example and demonstrates how JS can emulate other languages. I'm taking this code almost verbatim from [JavaScript Patterns](https://www.amazon.com/JavaScript-Patterns-Stoyan-Stefanov/dp/0596806752) so full credit goes to Stoyan for coming up with it.

In this example we're going to format a Sale price so that it can work for both U.S. and Canadian stores. This means applying different tax rates and outputting the text with different currency symbols.

```js
function Sale(price) {
	this.price = price || 100;
}

Sale.prototype.getPrice = function() {
	return this.price;
};
```

Things start off very similar to our last example. Instead of `validate` the method we're interested in this time is `getPrice`. If you've been paying attention you'll notice that in our previous example `validate` was rather complex. Yet `getPrice` is so...simple. Hmm...

Let's move on to the decorators.

```js
Sale.decorators = {};

Sale.decorators.fedtax = {
	getPrice: function() {
		var price = this._super.getPrice();
		price += price * 5 / 100;
		return price;
	}
};

Sale.decorators.quebec = {
	getPrice: function() {
		var price = this._super.getPrice();
		price += price * 7.5 / 100;
		return price;
	}
};

Sale.decorators.usd = { // U.S. dollars
	getPrice: function() {
		return "$" + this._super.getPrice().toFixed(2);
	}
};

Sale.decorators.cdn = { // Canadian dollars
	getPrice: function() {
		return "CDN$" + this._super.getPrice().toFixed(2);
	}
};
```

This may look similar to the last example but take note of the use of `_super`. The `_super` property is actually a reference to a parent class instance. We'll use this reference to travel up the chain of decorators, performing an operation and returning the price at each stop.

This leads us to the `decorate` method:

```js
Sale.prototype.decorate = function (decorator) {
	var F = function () {},
	overrides = this.constructor.decorators[decorator],
	i,
	newobj;

	// Create prototype chain
	F.prototype = this;
	newobj = new F();
	newobj._super = F.prototype;

	// Mixin properties/methods of our decorator
	// Overriding the ones from our prototype
	for (i in overrides) {
		if (overrides.hasOwnProperty(i)) {
			newobj[i] = overrides[i];
		}
	}

	return newobj;
}
```

If you're unfamiliar with JavaScript prototypes this can look a little daunting. We're using a pattern that [JavaScript Patterns](https://www.amazon.com/JavaScript-Patterns-Stoyan-Stefanov/dp/0596806752) refers to as _Rented Constructor_ in order to essentially take a snapshot of our current object, store it in `_super` and then mixin new decorator methods. Let's see it in action to clarify things a bit better.

```js
var sale = new Sale(50);
sale = sale.decorate('fedtax');
sale = sale.decorate('cdn');
console.log(sale.getPrice()); // outputs $CDN52.50
```

You'll notice that each time we call `decorate` we have to re-assign the sale variable to a new instance. Each new instance has a reference to the previous sale object. When we finally call `getPrice` it walks up this chain of instances and calls `getPrice` on each stop along the way. In the end we have something which is functionally identical to our first example but potentially a lot harder to understand. In other words, stick with the first approach! Also be sure to [see my update](https://robdodson.me/blog/2012/08/30/javascript-design-patterns-decorator-pt-2/) which discusses this example a bit more and points out a few more of its flaws. Again, it's a neat idea to mess around with but there are much easier ways.

The Open-Closed Principle
-------------------------

I'm going to go off on a quick tangent here because of something I saw in [Head First Design Patterns.](https://www.amazon.com/First-Design-Patterns-Elisabeth-Freeman/dp/0596007124) There's a common heuristic in software design known as the **Open-Closed Principle** which states that "classes should be open for extension but closed for modification." Let's explore this concept with our Sale object.

Consider the following bit of code:

```js
function Sale(price) {
	this.price = price || 100;
}

Sale.prototype.getPrice = function() {
	return this.price;
};
```

You should be able to look at this snippet of code and say that it's almost certainly bug free. Now let's pretend we aren't using decorators and our boss comes to us and says we need to add US and Canadian taxes and currency symbols.

"_Hm...I guess that means I'll need to pass those parameters into the constructor and then write some booleans or something to check if we're Canadian or US... Or maybe I'll put them all in a hash... Or..._"

Regardless of what we choose to do, if it involves opening up the class then there's a chance that we'll compromise our previous snippet of code. The more times we do this the more we increase the likelihood that we'll introduce a bug which might go uncaught for a long time. Eventually what started off as extremely simple, bug-free code, can turn into a rat's nest.

So, where possible, try to avoid reopening classes and find ways to extend their functionality. This can mean simply subclassing the parent, or using one of the many design patterns we'll be covering.

[Grab the Example Source](https://github.com/robdodson/JavaScript-Design-Patterns/tree/master/decorator/)
---------------------------------------------------------------------------------------------------------

Related Patterns
----------------

-   Adapter: A decorator is different from an adapter in that a decorator only changes an object’s responsibilities, not its interface; an adapter will give an object a completely new interface.
    
-   Composite: A decorator can be viewed as a degenerate composite with only one component. However, a decorator adds additional responsibilities—it isn't intended for object aggregation.
    
-   [Strategy:](https://robdodson.me/blog/2012/08/03/javascript-design-patterns-strategy/) A decorator lets you change the skin of an object; a strategy lets you change the guts. These are two alternative ways of changing an object.
    

Gamma, Erich; Helm, Richard; Johnson, Ralph; Vlissides, John (1994-10-31). Design Patterns: Elements of Reusable Object-Oriented Software. Pearson Education (USA).

- - -

  

#### [Table of Contents](https://robdodson.me/blog/2012/08/03/javascript-design-patterns/)

Also be sure to [checkout Part 2 which covers even more ways to do decorators!](https://robdodson.me/blog/2012/08/30/javascript-design-patterns-decorator-pt-2/) - Rob

You should follow me on Twitter [here.](https://twitter.com/rob_dodson)

---
title: "JavaScript Design Patterns: Factory"
tags:
  - Design Patterns
  - JavaScript
  - Factory
date: 2012-09-03T19:40:00.000Z
updated: 2017-01-18T02:57:16.000Z
---

**[Table of Contents](/javascript-design-patterns/)**

Factories encapsulate and separate object creation from the rest of your code.
In situations where the creation of an object can be complex or subject to
change a factory can act as a nice buffer to help keep things tidy. Without
proper planning Factories can lead to class explosions; as a result the pattern
can be both a blessing and a curse depending on how it's used.

Formal Definition
-----------------

**Factory Method**

> Define an interface for creating an object, but let subclasses decide which
> class to instantiate. Factory Method lets a class defer instantiation to
> subclasses.

**Abstract Factory**

Provide an interface for creating families of related or dependent objects
without specifying their concrete classes.

**Also Known As**

* Virtual Constructor (**Factory Method**)
* Kit (**Abstract Factory**)

Simple Factory vs Factory Method vs Abstract Factory
----------------------------------------------------

The phrase "Factory Pattern" is rather overloaded so I'm going to give you a
quick crash course in the three main types of factories.

A **simple factory** is an object which encapsulates the creation of another
object, shielding that code from the rest of your application.

```js
var user = UserFactory.createUser();
```

It's common to parameterize simple factory methods to increase the number of
products they're able to return.

```js
var admin = UserFactory.createUser('admin');
var customer = UserFactory.createUser('customer');
```

The actual implementaiton of `createUser` might look something like this:

```js
UserFactory.createUser = function(type) {
  if (type == 'admin') {
    return new Admin();
  } else if (type == 'customer') {
    return new Customer();
  }
};
```

Typically the return value from a factory is known as the `Product`. In the case
of our `UserFactory` there are two Products: `Admin` and `Customer`. It's
important for these products to maintain a consistent interface so the client
can use any product from our factory without needing to do elaborate checks to
see if a particular method exists.

### Factory Method

While the Simple Factory is a nice start and good for many situations it's
possible to extend this even further through the use of the **Factory Method**
pattern.

> The Factory Method Pattern defines an interface
> for creating an object, but lets subclasses decide which
> class to instantiate. Factory Method lets a class defer
> instantiation to subclasses.
*Elisabeth Freeman, Head First Design Patterns*

Factory Method defines one method, `createThing` for instance, which is
overriden by subclasses who decide what to return. The Factories and Products
must conform to interfaces for clients to be able to use them.

In _Head First Design Patterns_ a Factory Method pattern is used to allow a
PizzaStore to define many subclasses such as ChicagoPizzaStore,
CaliforniaPizzaStore, NewYorkPizzaStore. Each subclass overrides `createPizza`
and returns its own particular style of pizza (ie: a ChicagoPizza or a
CaliforniaPizza). The main take away is that there is only one method,
`createPizza`, that does anything. By subclassing and overriding this method we
can offer aditional flexibility beyond what's possible with the Simple Factory.

### Abstract Factory

Unlike the Factory Method pattern, **Abstract Factory** defines any number of
methods which return Products.

> The Abstract Factory Pattern provides an interface
> for creating families of related or dependent objects
> without specifying their concrete classes.
*Elisabeth Freeman, Head First Design Patterns*

Again in _Head First Design Patterns_, an Abstract Factory pattern is used to
provide different Pizza ingredients depending on the type of Pizza. For
instance, a ChicagoPizza would be given a ChicagoPizzaIngredients factory with
methods like `createDough`, `createSauce`, `createCheese`, etc. A
CaliforniaPizzaIngredients factory would also implement `createDough`,
`createSauce` and `createCheese`. In this way the factories would be
interchangeable.

The authors are keen to point out that the methods of the Abstract Factory
(`createDough`, `createSauce`, etc) look very similar to the Factory Method
(`createPizza`). One way of thinking about things is that an Abstract Factory
can be composed of Factory Methods.

The Factory Method in JavaScript
--------------------------------

Since I've already shown a basic Simple Factory let's take a stab at doing the
Factory Method in JS. We'll continue with the PizzaStore theme since I've
already spelled out how each pattern applies to it. We're going to do this
without the use of the `new` keyword and instead we'll take advantage of
JavaScript's prototypes. How you ask?

### The very awesome Object.create

ECMAScript 5 introduced a new method of the `Object` prototype called `create`.
You can read up on it in full detail [on
MDN.](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create)
In a nutshell it lets you pass in a prototype and receive a new object which
points to that prototype. `Object.create` is actually a simple Factory Method!
Here's an example:

```js
var firstPizzaStore = Object.create(PizzaStore);
firstPizzaStore.createPizza(); // returns 'Generic pizza created'
```

One very cool feature of `Object.create` is that it accepts a properties object which is then mixed in to the returned object. The code can get a little verbose since it uses [defineProperty syntax](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty) so instead let's steal a function from [Yehuda Katz](http://yehudakatz.com/2011/08/12/understanding-prototypes-in-javascript/) which lets us do something very similar.

```js
var fromPrototype = function(prototype, object) {
  var newObject = Object.create(prototype);
  for (var prop in object) {
    if (object.hasOwnProperty(prop)) {
      newObject[prop] = object[prop];
    }
  }
  return newObject;
};
```

Now that we have that we can continue on our way. One quick caveat though! Some browsers \*cough\* **IE** \*cough\* don't support `Object.create` so we need to shim it. Thankfully MDN has got our back:

```js
// Polyfill
if (!Object.create) {
  Object.create = function (o) {
    if (arguments.length > 1) {
      throw new Error('Object.create implementation only accepts the first parameter.');
    }
    function F() {}
    F.prototype = o;
    return new F();
  };
}
```

Drop that into your page and you should be able to use Object.create like we are
above. Note that the shim does not support the second properties object. For our
purposes that's ok but definitely keep it in mind if you're thinking of using
it.

### Back to the Factory Method

With `Object.create` and `fromPrototype` in hand we're ready to tackle our first
Factory Method.

Let's start by creating a PizzaStore:

```js
// Define the Pizza product
var Pizza = {
  description: 'Plain Generic Pizza'
};

// And the basic PizzaStore
var PizzaStore = {
  createPizza: function(type) {
    if (type == 'cheese') {
      return fromPrototype(Pizza, {
        description: 'Cheesy, Generic Pizza'
      });
    } else if (type == 'veggie') {
      return fromPrototype(Pizza, {
        description: 'Veggie, Generic Pizza'
      });
    }
  }
};
```

Easy enough. Ok now let's extend the PizzaStore so we have two variations: ChicagoPizzaStore and CaliforniaPizzaStore.

```js
var ChicagoPizzaStore = fromPrototype(PizzaStore, {
  createPizza: function(type) {
    if (type == 'cheese') {
      return fromPrototype(Pizza, {
        description: 'Cheesy, Deep-dish Chicago Pizza'
      });
    } else if (type == 'veggie') {
      return fromPrototype(Pizza, {
        description: 'Veggie, Deep-dish Chicago Pizza'
      });
    }
  }
});

var CaliforniaPizzaStore = fromPrototype(PizzaStore, {
  createPizza: function(type) {
    if (type == 'cheese') {
      return fromPrototype(Pizza, {
        description: 'Cheesy, Tasty California Pizza'
      });
    } else if (type == 'veggie') {
      return fromPrototype(Pizza, {
        description: 'Veggie, Tasty California Pizza'
      });
    }
  }
});

// Elsewhere in our app...
var chicagoStore = Object.create(ChicagoPizzaStore);
var pizza = chicagoStore.createPizza('veggie');
console.log(pizza.description); // returns 'Veggie, Deep-dish Chicago Pizza'
```

The Abstract Factory in JavaScript
----------------------------------

Since we have a variety of pizza styles we might also have a variety of ingredients. Let's see if we can accomodate all the different kinds.

```js
var Ingredients = {
  createDough: function() {
    return 'generic dough';
  },
  createSauce: function() {
    return 'generic sauce';
  },
  createCrust: function() {
    return 'generic crust';
  }
};

Ingredients.createChicagoStyle = function() {
  return fromPrototype(Ingredients, {
    createDough: function() {
      return 'thick, heavy dough';
    },
    createSauce: function() {
      return 'rich marinara';
    },
    createCrust: function() {
      return 'deep-dish';
    }
  });
};

Ingredients.createCaliforniaStyle = function() {
  return fromPrototype(Ingredients, {
    createDough: function() {
      return 'light, fluffy dough';
    },
    createSauce: function() {
      return 'tangy red sauce';
    },
    createCrust: function() {
      return 'thin and crispy';
    }
  });
};
```


In the above example `Ingredients` is our Abstract Factory. We know that for every
different kind of pizza we'll need different ingredients and therefore a new Factory Method. We also know that we have different styles of pizza so we'll need Chicago style ingredients and California style ingredients. When a client wishes to grab some ingredients for a particular kind of pizza they just say:

```js
var californiaIngredients = Ingredients.createCaliforniaStyle();
californiaIngredients.createCrust(); // returns 'thin and crispy';
```

The object that is returned by the call `createCaliforniaStyle` is the concrete implementation of our Abstract Ingredients object. In other words, if `Ingredients` is the Abstract Factory, then the object returned by `createCaliforniaStyle` could also be thought of as a `CaliforniaIngredients` object. It is a _subclass_ of `Ingredients` if you want to think of it that way. The returned object extends `Ingredients` and overrides its Factory Methods with its own methods. In so doing we provide a lot of additional flexibility to our app. If we want to add a Hawaiian style ingredients we just add a `createHawaiianStyle` method.

If you recall from [the previous article on Decorators](https://robdodson.me/blog/2012/08/27/javascript-design-patterns-decorator/) we talked about the **Open-Closed Principle** which states that "classes should be open for extension but closed for modification." You'll notice that adding a `createHawaiianStyle` method would actually violate this principle so it should be noted that when using an Abstract Factory approach you'll probably have to reopen the class/object a few times to modify it. Not ideal but depending on your use case this might not be such big deal and you might prefer the flexibility and organization that the factory offers.

**[Grab the Example Source](https://github.com/robdodson/JavaScript-Design-Patterns/tree/master/factory/)**

Related Patterns
----------------

* Template Methods: Factory Methods are usually called within Template Methods.
* [Singleton](https://robdodson.me/blog/2012/08/08/javascript-design-patterns-singleton/): A concrete factory is often a singleton.

Gamma, Erich; Helm, Richard; Johnson, Ralph; Vlissides, John (1994-10-31). Design Patterns: Elements of Reusable Object-Oriented Software. Pearson Education (USA).

#### [Table of Contents](/javascript-design-patterns/)

---
title: "JavaScript Design Patterns: Iterator"
tags:
  - Design Patterns
  - JavaScript
  - Iterator
date: 2012-08-10T22:45:00.000Z
updated: 2014-12-31T00:35:44.000Z
---

#### [Table of Contents](/javascript-design-patterns/)

If you're coming from Ruby or Java you probably think of an Iterator as an object which gives you a consistent interface for traversing a collection of some kind. If you're coming from JavaScript or Actionscript you probably just think of an iterator as the `i` value in a `for` loop. The term has mixed meanings but in this case we're refering to the former, an object which gives us a consistent interface for iterating over a collection of some kind. If you've never used them before that might seem kind of silly. "If I need to loop over something I'm just going to loop over it!" For many use cases that's totally fine. Where Iterator objects are useful is in situations where you might need to loop in an async fashion (stopping and restarting) or if you want to preclude an object from knowing too much about the inner workings of a collection.

Formal Definition
-----------------

> Provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.

### Also Known As

-   Cursor

Example Time
------------

The code for an Iterator should be pretty easy to grok if you've worked with loops before. Here is a simple example which returns an Iterator for looping over an Array by every third value.

```js
var iterator = (function() {

	var index = 0,
		data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		length = data.length;

	return {
		next: function() {
			var element;
			if (!this.hasNext()) {
				return null;
			}
			element = data[index];
			index += 3;
			return element;
		},
		hasNext: function() {
			return index < length;
		},
		rewind: function() {
			index = 0;
			return data[index];
		},
		current: function() {
			return data[index];
		}
	}

}());
```

Our iterator has a handful of useful operations including `next`, `hasNext`, `rewind` and `current`.

`next` will return the next value and advance the index by 3.

`hasNext` will check to see if calling `next` will actually return an item. Good for indicating when we've reached the end of a collection.

`rewind` will reset the index to zero so we can loop over the collection again.

`current` will return the current item at the index without advancing the index.

Let's put these into play to see how it works:

```js
while(iterator.hasNext()) {
	console.log(iterator.next());
}

iterator.rewind();
console.log(iterator.current());
```

If we ran the above we'd see the following output in the console.

```
1
4
7
10
1
```

Since the iterator is mainting its own state if we need to stop iteration at any point we just don't call `next`. Using exclusively `for` loops we'd have to check against a flag of some kind, store our current position and then rebuild the loop starting from that point.

Not just for Arrays
-------------------

As I mentioned before the Iterator gives us a consistent interface for traversing a collection, which means it can iterate over _any_ object. Calendar Dates, Linked Lists, Node Graphs, whatever! Here's an example of an iterator that traverses a simple Hash.

```js
var iterator = (function() {
	var data = { foo: 'foo', bar: 'bar', baz: 'baz' },
		keys = Object.keys(data),
		index = 0,
		length = keys.length;

	return {
		next: function() {
			var element;
			if (!this.hasNext()) {
				return null;
			}
			element = data[keys[index]];
			index++;
			return element;
		},
		hasNext: function() {
			return index < length;
		},
		rewind: function() {
			index = 0;
			return data[keys[index]];
		},
		current: function() {
			return data[keys[index]];
		}
	}
}());
```

Notice how the interface is identical to our previous Iterator? That's one of the key aspects to this pattern: Regardless of the _type_ of collection, we can define a consistent interface to loop through it. It also means that the client doesn't need to know anything about the implementation of the actual collection, and by wrapping it in a closure we can prevent the client from _editing_ the collection. Personally I like the idea of certain services handing out iterators rather than a wholesale dump of all the data. As always use whichever tool is appropriate for the context.

One quick note regarding Hashes. Previous versions of the ECMA spec did not require that Hash keys be kept in order. While most modern browsers _do_ keep them in order there are some funky inconsistencies. For instance, if you write out the following Hash:

```js
var hash = { 'foo': 'foo', 'bar': 'bar', '1': 'hello', '2': 'world' };
```

Google Chrome will swap the order of the keys such that they appear like this:

```js
{ '1': 'hello', '2': 'world', 'foo': 'foo', 'bar': 'bar' };
```

There are some interesting discussions on StackOverflow which cover this topic but it's a bit outside the scope of this article. If you're interested you can find them here:

-   [How to keep an Javascript object/array ordered while also maintaining key lookups?](https://stackoverflow.com/questions/5773950/how-to-keep-an-javascript-object-array-ordered-while-also-maintaining-key-lookup)
-   [Javascript data structure for fast lookup and ordered looping?](https://stackoverflow.com/questions/3549894/javascript-data-structure-for-fast-lookup-and-ordered-looping)

JavaScript 1.7
--------------

Although not widely supported yet, JavaScript 1.7 includes a built in Iterator object which can be used to wrap an Array or Hash with just a single line of code.

```html
<script type="application/javascript;version=1.7">
	var lang = { name: 'JavaScript', birthYear: 1995 };
	var it = Iterator(lang);
</script>
```

The above script block will not work in Chrome but it should work in the latest version of Firefox. Note the `type` attribute of the script tag which instructs the interpreter to handle the code as JS 1.7.

For some further reading on the topic checkout the MDN article which covers [Iterators in JavaScript 1.7](https://developer.mozilla.org/en-US/docs/JavaScript/Guide/Iterators_and_Generators)

[Grab the Example Source](https://github.com/robdodson/JavaScript-Design-Patterns/tree/master/iterator/)
--------------------------------------------------------------------------------------------------------

Related Patterns
----------------

-   Composite: Iterators are often applied to recursive structures such as Composites.
-   Factory Method: Polymorphic iterators rely on factory methods to instantiate the appropriate Iterator subclass.
-   Memento: Often used in conjunction with the Iterator pattern. An iterator can use a memento to capture the state of an iteration. The iterator stores the memento internally.

Gamma, Erich; Helm, Richard; Johnson, Ralph; Vlissides, John (1994-10-31). Design Patterns: Elements of Reusable Object-Oriented Software. Pearson Education (USA).

- - -

  

#### [Table of Contents](/javascript-design-patterns/)

Thanks for reading!

You should follow me on Twitter [here.](https://twitter.com/rob_dodson)

---
title: 'JavaScript Design Patterns: Observer'
tags:
  - Design Patterns
  - jQuery
  - JavaScript
  - Observer
  - PubSub
date: 2012-08-16T20:19:00.000Z
updated: 2014-12-31T00:37:00.000Z
---

#### [Table of Contents](/javascript-design-patterns/)

Observer is one of the most popular design patterns and chances are you're probably already using it. If you've ever written an event listener with `addEventListener` or used one of jQuery's many versions: `on`, `delegate`, `live`, `click`, etc... then you should already be comfortable with the concept. In a nutshell the Observer pattern allows a **Subject** to publish updates to a group of **Observers**. The Subject maintains a list of Observers and provides an interface for objects to register as Observers. Otherwise the Subject doesn't care who or what is listening to it. In this way the Subject is decoupled from the Observers allowing easy replacement of one Observer for another or even one Subject for another so long as it maintains the same lexicon of events/notifications.

## Formal Definition

> Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

### Also Known As

- Dependents
- Publish-Subscribe

## When to use it

- When the state or actions of one object depends on the state or actions of another object.
- When changing one object necessitates a change to an unknown number of _other_ objects.
- When an object should be able to notify other objects of changes without knowing anything about these other objects.

## Pros and Cons

- **Pro:** Very loose coupling between objects.
- **Pro:** The ability to broadcast changes and updates.
- **Con:** Potentially unexpected updates and sequencing issues.

## The Many Faces of Observer

Because of its popularity the Observer pattern often goes by a few different names. The primary objects are the **Subject** and the **Observers** though sometimes they are referred to as **Publisher**/**Subscribers** or **Event Dispatcher**/**Listeners**. Although you can definitely split hairs regarding the actual implementation of this pattern, in essence we're usually talking about the same thing. When the Subject's state changes it sends out notifications, unaware of who its Observers are. The Observers, in turn, perform some action in response to this update.

I'm going to heavily quote (\*cough\* _plagiarize_ \*cough\*) the wonderful [JavaScript Patterns by Stoyan Stefanov](https://www.amazon.com/JavaScript-Patterns-Stoyan-Stefanov/dp/0596806752) to sum up all the parts of an Observer/Pub-Sub relationship:

_"The publisher object needs to have a property `subscribers` that is an array storing all subscribers. The act of subscription is merely adding to this array. When an event occurs, the publisher loops through the list of subscribers and notifies them. The notification means calling a method of the subscriber object. Therefore, when subscribing, the subscriber provides one of its methods to the publisher’s subscribe() method._

_The publisher can also provide unsubscribe(), which means removing from the array of subscribers. The last important method of the publisher is publish(), which will call the subscribers’ methods."_

Here is Stoyan's Pub/Sub implementation. Note that the `on` function accepts a `context` argument which allows you to set the handler's context and in turn, the value of `this`. We'll discuss this a bit more later.

```js
var publisher = {
  subscribers: {
    any: [], // event type: subscribers
  },
  on: function (type, fn, context) {
    type = type || 'any';
    fn = typeof fn === 'function' ? fn : context[fn];
    if (typeof this.subscribers[type] === 'undefined') {
      this.subscribers[type] = [];
    }
    this.subscribers[type].push({ fn: fn, context: context || this });
  },
  remove: function (type, fn, context) {
    this.visitSubscribers('unsubscribe', type, fn, context);
  },
  fire: function (type, publication) {
    this.visitSubscribers('publish', type, publication);
  },
  visitSubscribers: function (action, type, arg, context) {
    var pubtype = type || 'any',
      subscribers = this.subscribers[pubtype],
      i,
      max = subscribers ? subscribers.length : 0;

    for (i = 0; i < max; i += 1) {
      if (action === 'publish') {
        // Call our observers, passing along arguments
        subscribers[i].fn.call(subscribers[i].context, arg);
      } else {
        if (subscribers[i].fn === arg && subscribers[i].context === context) {
          subscribers.splice(i, 1);
        }
      }
    }
  },
};
```

In practice using the `publisher` might look something like this:

```js
function handleLogin() {
  console.log('we haz a users!');
}

publisher.subscribe('login.complete', handleLogin);

// ... .
// Elaborate user login process...

publisher.publish('login.complete');
```

## Mind the Context

In JavaScript the keyword `this` in a function will refer to the context in which the function was called. Sometimes functions are global and sometimes they're part of a larger Object. Here's a brief example to clarify:

```js
var foobar = {
  doWork: function () {
    console.log('doing some work...');
    console.log(this);
  },
};

foobar.doWork(); // `this` will refer to foobar

var doWorkClone = foobar.doWork;
doWorkClone(); // `this` will refer to window

var workClones = [];
workClones.push(foobar.doWork);
workClones[0](); // `this` will refer to the workClones Array
```

The first time we call `doWork` we do so in the _context_ of the `foobar` object: `foobar.doWork()`. As a result the term `this` inside of the `doWork` method will refer to `foobar`.

The second time we call `doWork` we do so by referencing the method through a variable. We're calling `doWork` using that variable's _context_. But the variable is a global variable, it's just hanging out on the page! As a result `this` will refer to `window`.

In the third example we're stuffing `doWork` into an array, then referencing it by index, then calling it. In this _context_ `doWork` is scoped to the `workClones` Array, since it's also an Object. A little confusing I know.

So why do I care?

Well if you go back and look at the `publisher` example you'll notice that we pass a function reference to be called whenever the Subject sends out a notification. In our case it looks like this: `publisher.subscribe('login.complete', handleLogin);` If `handleLogin` needs to use `this` we might be in a world of hurt because `publisher` is going to call `handleLogin` using itself as the value of `this`. Uh oh!

## Preserving Context in Observer

JavaScript's context switching can be really bizarre if you've never had to manage it before. To mitigate this problem we have a handful of useful strategies.

The first one, which is demonstrated in the `publisher`, is to pass along a `context` whenever we subscribe a function. This is the third argument to our `publisher`'s `on` method.

```js
on: function(type, fn, context) {
		type = type || 'any';
		fn = typeof fn === 'function' ? fn : context[fn];
		if (typeof this.subscribers[type] === "undefined") {
			this.subscribers[type] = [];
		}
		this.subscribers[type].push({ fn: fn, context: context || this });
	},
```

By storing the `context` we ensure that when it's time to call our function, we can do so in the correct context with the correct value for `this`. We do this through the use of JavaScript's `call` method which allows us to define in which context a function should execute.

```js
subscribers[i].fn.call(subscribers[i].context, arg);
```

This can be a very powerful feature especially for utility functions. Checkout the MDN docs for a deeper understanding of [call](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/call) and its cousin [apply.](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/apply)

But what if you're not using our `publisher` example? What if you're using a slightly more popular library like jQuery to manage your events? Maybe you have some code that looks like this:

```js
// Substitute `on` for `click` or `delegate` or `live` or
// whatever else you're using :)

$('.login-button').on('click', function () {
  // tell the app the user is trying to log in!
});
```

Well in this case we might have to use a different approach. As anyone who's used jQuery knows, the value of `this` in our handler function is going to refer to the DOM element that jQuery selected. Sometimes that's really useful but other times, like in this case, it isn't going to do us much good.

### Closures

Closures are a powerful feature of ECMAScript and they're especially useful when passing around functions. The best definition I've found for a closure comes from [this article:](http://jibbering.com/faq/notes/closures/)

> The simple explanation of a Closure is that ECMAScript allows inner functions; function definitions and function expressions that are inside the function bodies of other functions. And that those inner functions are allowed access to all of the local variables, parameters and declared inner functions within their outer function(s).

So let's see that in action.

```js
var loginController = {
  init: function () {
    var self = this;

    $('.login-button').on('click', function () {
      self.handleLogin(); // use self as a stand in for `this`
    });
  },
  handleLogin: function () {
    console.log('handling login!');
  },
};
```

In the above example the var `self` exists in a kind of interesting limbo: it is part of `loginController's` `init` method and also part of the function registered as the `on('click')` handler. As a result, when the function is executed, `self` is still in the context of the `loginController` object and thus logs `handling login!`

Awesome! We've solved the issue of preserving scope, right? Well, yes but it's not our only option. Many people (myself included) find it annoying to sprinkle `var self = this` all over their app. To mitigate things we also have `Function.bind`.

### Bindings

The addition of `Function.bind` in ECMAScript 5 allows us to specify in which context a function should be called, in other words, _binding_ that function (and the value of `this`) to a particular context. Let's see it in action:

```js
var widget = {
  name: 'My Awesome Widget!',
  sayName: function () {
    console.log(this.name);
  },
};

var nameFunc = widget.sayName.bind(widget);
nameFunc(); // outputs: 'My Awesome Widget!'
```

Calling `Function.bind` will actually create a closure preserving whatever scope we've passed in. It returns a clone of our original function but this time it is bound to a particular context. In the above example it's bound to the `widget` object. While it's cleaner than our original closure example we're still in a dilemma because we want `sayName` to ALWAYS be called in the context of `widget`. How about something like this instead: `widget.sayName = widget.sayName.bind(widget);` Hey, now we're talking! By overwriting our function and binding it to our `widget` object we've gotten very close to how classical languages like Java and Actionscript handle scope! This means it's easy to both subscribe and unsubscribe our method, safe in the knowledge that it will always use the proper scope. If you're lazy (like me) take some time to research [Underscore.js](http://underscorejs.org/) which provides both [bind](http://underscorejs.org/#bind) and [bindAll](http://underscorejs.org/#bindAll) functions to ease the process of connecting your methods to their parent objects.

I'll save you the speech on treating JavaScript like other languages except to say anytime you're writing code to make one language act like another you should obviously research whether that's the best course of action or not. In my experience I've found that binding observers can make writing event listeners much cleaner but your mileage may vary and comments/feedback are always welcome :D

Also if you want to read more on `Function.bind` you can do so [here on MDN.](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Function/bind)

## The Push and Pull Model

Typically when you create a Subject/Observer relationship you'll want the Subject to send along additional information during its event dispatch. The amount of information can vary widely. Sometimes you'll want to send a lot of information and other times you'll want the observers to receive the event and then query for more information. When you're sending a lot of information it's referred to as the _push model_ and when the Observers should query for more information it's referred to as the _pull model_. The Gang of Four describe the differences between the two:

> The pull model emphasizes the subject’s ignorance of its observers, whereas the push model assumes subjects know something about their observers’ needs. The push model might make observers less reusable, because Subject classes make assumptions about Observer classes that might not always be true. On the other hand, the pull model may be inefficient, because Observer classes must ascertain what changed without help from the Subject.

There's no right or wrong approach but it is good to understand the differences between the two.

## PubSub and Observer mixins

If you want a quick, easy to use event dispatcher the [PubSubJS](https://github.com/mroderick/PubSubJS) library does a wonderful job of providing an easy to use event dispatcher. It also includes a jQuery plugin variant if that's more your style. If you're looking for something a little less global and a bit more OO checkout this utility function from [JavaScript Patterns](https://www.amazon.com/JavaScript-Patterns-Stoyan-Stefanov/dp/0596806752) which mixes-in the `publisher` to other objects.

```js
function makePublisher(o) {
  var i;
  for (i in publisher) {
    if (publisher.hasOwnProperty(i) && typeof publisher[i] === 'function') {
      o[i] = publisher[i];
    }
  }
  o.subscribers = {
    any: [],
  };
}
```

## [Grab the Example Source](https://github.com/robdodson/JavaScript-Design-Patterns/tree/master/observer/)

## Related Patterns

- Promise: A Promise is an observable token given from one object to another. Promises wrap an operation and notify their observers when the operation either succeeds or fails.

Gamma, Erich; Helm, Richard; Johnson, Ralph; Vlissides, John (1994-10-31). Design Patterns: Elements of Reusable Object-Oriented Software. Pearson Education (USA).

---

#### [Table of Contents](/javascript-design-patterns/)

Thanks for reading! If you have questions or feedback please leave a comment below. - Rob

You should follow me on Twitter [here.](https://twitter.com/rob_dodson)


---
title: "JavaScript Design Patterns: Singleton"
tags:
  - Design Patterns
  - JavaScript
  - Singleton
date: 2012-08-09T02:52:00.000Z
updated: 2016-08-14T17:00:51.000Z
---

#### [Table of Contents](/javascript-design-patterns/)

Ah yes the Singleton, a pattern whose name lives in infamy. For the uninitiated a little explanation is in order. A Singleton is an object which can only be instantiated one time. Repeated calls to its constructor return the same instance and in this way one can ensure that they don't accidentally create, say, two Users in a single User application. Doesn't sound too bad, right? Well, if you're responsible then it arguably _is_ OK but there are many caveats. Before I get into those though, let's throw in the formal definition _a la_ the Gang of Four.

Formal Definition
-----------------

> Ensure a class only has one instance, and provide a global point of access to it.

The icky bits
-------------

So I'm sure some of you are already a little anxious because I used the phrase "global point of access" and rightfully you should be. In OO software design _global_ variables and objects are often frowned upon. They break encapsulation and more often than not cause more harm than good. You don't want the far flung bits of your app to be able to reach all the way up to the very top and fiddle around with stuff. When that starts to happen, and other objects also rely on those global variables, then any piece of code, anywhere in the project can change something which can in turn break a totally unrelated bit of functionality. Debugging becomes a nightmare because you're constantly moving from deeply nested object graphs up to the global scope and then back down again. I one time worked on a _major_ application which I inherited from another developer. It was so riddled with Singletons that any change became a sisyphean ordeal of unintended consiquences and time lost debugging. Needless to say I want to put this warning front and center or else the programming gods would surely smite me.

So, why would I want to use one of these?
-----------------------------------------

Before you start running for the hills I want to point out the ways in which Singletons can be useful and then you can make up your mind if they're right for you.

Let's start with the most obvious one: You're probably already using Singletons!

Ever written any code that looks like this?

```js
var user = {
	firstName: 'John',
	lastName: 'Doe',
	sayName: function() {
		return this.firstName + ' ' + this.lastName;
	}
};
```

Yep, that's a Singleton. Once you create an object literal in JavaScript you've reserved a little piece of memory and no other object will ever be just like that one. Now, depending on the scope you might have only created a local variable but if that `user` is sitting outside a function then it's globally available to anyone who wants to fiddle with it. I guess the most famous Singleton probably looks like this: `$`. To put it another way, ever notice how you can use jQuery anywhere in your app after you've included it on the page...? Boom! Singleton!

_mind blown_ ... _face off_ ...

OK, So they have their uses I guess
-----------------------------------

Yes as much as some are probably loathe to admit it, Singletons are quite useful in JavaScript. And as jQuery demonstrates their primary use is to namespace your code.  
While other languages like Java or C# have namespaces built in, JavaScript has to emulate them using simple objects.

Consider the following scenario: You have a series of functions hanging out on the page that you frequently use in your program.

```js
function login() {
	// do some login shtuffs
}

function logout() {
	// do some logout shtuffs
}

function addToCart() {
	// blah, blah blah...
}
```

A few things are going on here...

_1\. Our functions are polluting the global space._  
Since they are just floating around on the page they have to attach to something. With no explicitely declared parent object they get hooked on to the globally available `window` object.

_2\. They're in danger of being overwritten_  
If we were to accidentally define another global `addToCart` function or if we brought in a library whose author did the same, it would overwrite the original leading to a really gnarly debugging situation.

Let's revise this by creating one (and only one) global object which our code can branch off of.

```js
var NAMESPACE = {};

NAMESPACE.login = function() {
	// do some login shtuffs
}

NAMESPACE.logout = function() {
	// do some logout shtuffs
}

NAMESPACE.addToCart = function() {
	// blah, blah blah...
}
```

Now so long as no one creates an object which also has the name `NAMESPACE` our code should be safe. From here we can do all sorts of things. We can nest more object literals or we can create constructor functions:

```js
var NAMESPACE = {};

NAMESPACE.Widget = function(foo, bar) {
	// Some awesome widget code
}

NAMESPACE.Widget.prototype.doSomethingAwesome = function() {
	// do something awesome!!!
}

var myWidget = new NAMESPACE.Widget('hello', 'world');
```

Take a look at [the Three.js library which](https://github.com/mrdoob/three.js/) relies heavily on this pattern to structure its code.

But I like constructors!
------------------------

OK so maybe object literals aren't your thing. That's understandable so let me show you a few other ways of writing Singletons.

These first few come from Stoyan Stefanov's excellent book [JavaScript Patterns.](https://www.amazon.com/JavaScript-Patterns-Stoyan-Stefanov/dp/0596806752)

**Singleton with a cached static property**

```js
function User() {
	// do we have an existing instance?
	if (typeof User.instance === 'object') {
		return User.instance;
	}
	
	// proceed as normal
	this.firstName = 'John';
	this.lastName = 'Doe';
	
	// cache
	User.instance = this;
	
	// implicit return
	// return this;
}
```

The cached static property is publicly available which adds a little danger (someone could say `Universe.instance = foo`) but this version is very straightforward and doesn't require closures and funky prototype work. If you're lazy this might be a good approach.

**Singleton with a closure**

```js
function User() {
	// the cached instance
	var instance;

	// rewrite the constructor
	User = function() {
		return instance;
	};

	// carry over the prototype
	User.prototype = this;

	// the instance
	instance = new User();

	// reset the constructor pointer
	instance.constructor = User;

	// all the functionality
	instance.firstName = 'John';
	instance.lastName = 'Doe';

	return instance;
}
```

This version takes a bit of fiddling to get the prototype to work as expected because we rewrite the constructor. The upshot is that `instance` is now private (being contained within the closure).

**Singleton with a self executing function**

```js
var User;
(function() {
	var instance;

	User = function User() {
		if (instance) {
			return instance;
		}

		instance = this;

		// all the functionality
		this.firstName = 'John';
		this.lastName = 'Doe';
        
        return instance;
	};
}());
```

By wrapping the instance variable in a self executing function we make it private. This version doesn't require any prototype or constructor reassignment but it may potentially confuse people who aren't comfortable with self executing functions.

Addy Osmani also defines a Singleton pattern in his book [Essential JavaScript Design Patterns.](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#singletonpatternjavascript)

```js
var mySingleton = (function () {

  // Instance stores a reference to the Singleton
  var instance;

  function init() {

    // Singleton

    // Private methods and variables
    function privateMethod(){
        console.log( "I am private" );
    }

    var privateVariable = "Im also private";

    return {

      // Public methods and variables
      publicMethod: function () {
        console.log( "The public can see me!" );
      },

      publicProperty: "I am also public"
    };

  };

  return {

    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {

      if ( !instance ) {
        instance = init();
      }

      return instance;
    }

  };

})();

// Usage:

var singleA = mySingleton.getInstance();
var singleB = mySingleton.getInstance();
console.log( singleA === singleB ); // true
```

This much more elaborate example allows us to define both private and public methods of our Singleton object at the cost of being a bit more complex than all the others.

As Addy is quick to point out:

> Whilst the Singleton has valid uses, often when we find ourselves needing it in JavaScript it's a sign that we may need to re-evaluate our design.

> They're often an indication that modules in a system are either tightly coupled or that logic is overly spread across multiple parts of a codebase. Singletons can be more difficult to test due to issues ranging from hidden dependencies, the difficulty in creating multiple instances, difficulty in stubbing dependencies and so on.

Definitely read [his full article](http://addyosmani.com/resources/essentialjsdesignpatterns/book/#singletonpatternjavascript) on the subject since it contains a handful of links to interesting side topics.

[Grab the Example Source](https://github.com/robdodson/JavaScript-Design-Patterns/tree/master/singleton/)
---------------------------------------------------------------------------------------------------------

Related Patterns
----------------

Many patterns can be implemented using the Singleton pattern. See Abstract Factory, Builder, and Prototype.

Gamma, Erich; Helm, Richard; Johnson, Ralph; Vlissides, John (1994-10-31). Design Patterns: Elements of Reusable Object-Oriented Software. Pearson Education (USA).

- - -

  

#### [Table of Contents](/javascript-design-patterns/)

Thanks for reading!

You should follow me on Twitter [here.](https://twitter.com/rob_dodson)

---
title: "JavaScript Design Patterns: Strategy"
tags:
  - Design Patterns
  - Strategy
date: 2012-08-03T22:12:00.000Z
updated: 2014-12-31T00:29:01.000Z
---

#### [Table of Contents](/javascript-design-patterns/)

The Strategy pattern is one of my personal favorites and you've probably seen or used it in some fashion without even knowing it. Its primary purpose is to help you separate the parts of an object which are subject to change from the rest of the static bits. Using Strategy objects versus subclasses can often result in much more flexible code since you're creating a suite of easily swappable algorithms.

Formal Definition
-----------------

> Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from clients that use it.

### Also Known As

-   Policy

Contrived Example Time!
-----------------------

Let's say you're making a game and you have a Character class. This game has all sorts of different terrain types so your character can run through open fields, walk slowly through swamps or swim under the ocean. Since you don't know what kind of other terrains the game designer is going to think up you decide that it would be a bad idea to give each character `run`, `walk`, and `swim` methods. After all, what if suddenly the character needs to `fly` or `crawl`? What if they're wounded and they need to `limp`? This situation could potentially get out of hand very fast...

There's a good chance you've seen or written code like this before:

```js
function move() {
	if (state === 'walking') {
		// do some walk animation
	} else if (state === 'running') {
		// do some running animation
	} else if (state === 'swimming') {
		// do some swimming animation
	}
}
```

When you see a big conditional like that or a switch statement it's time to stop and wonder if there's a better way. For instance if we need to subclass our Character we're going to have to override that big conditional. What if we only want to replace the `swimming` bit? We'll have to copy and paste the code from the super class for `walking` and `running` and then write new code specifically for `swimming`. And of course if `walking` and `running` ever change we're totally screwed.

### We need a Strategy to deal with this

Ok so we know that our character is going to be a real contortionist and need to run and jump and crab-walk all over the place. What if we took the code that made her run and we put it in its own object? How about we just define a Class for movements and we do this for all the different kinds of motion? Then when we need to move our Character we'll just tell it to defer to one of these Movement objects.

```js
var Movement = function(func) {
	this.move = func;
};

Movement.prototype.execute = function() {
	this.move();
};

var running = new Movement(function() {
	console.log("Hey I'm running!");
});

var walking = new Movement(function() {
	console.log("Just walking along...");
});
```

Now when we want to tell our character to move in a different way we'll just update which Movement object its currently referencing.

```js
function changeMovementType(movement) {
	this.movement = movement;
}

function move() {
	this.movement.execute();
}
```

In practice you might have something that looks like this:

```js
var running = new Movement(function() {
	console.log("Hey I'm running!");
});

var walking = new Movement(function() {
	console.log("Just walking along...");
});

// Create a hero and walk through a peaceful forest...

var hero = new Character();
hero.changeMovementType(walking);
hero.move();

// ... OH NO MOTHERFUCKIN' DINOSAURS!!!

hero.changeMovementType(running);
hero.move();
```

Now it's easy for us to add as many different kinds of motion as our little game designer can dream up. Want to give the character gas-powered robotic legs? No problem!

```js
var robotlegs = new Movement(function() {
	console.log("Cruisin for oil...Look out humans!");
});

hero.changeMovementType(robotlegs);
hero.move();
```

When to use it
--------------

When you have a part of your Class that's subject to change frequently or perhaps you have many related subclasses which only differ in behavior it's often a good time to consider using a Strategy pattern.

Another benefit of the Strategy pattern is that it can hide complex logic or data that the client doesn't need to know about.

The Painting App
----------------

For a real world example of when to use Strategy objects consider your typical painting program. Often times you will offer a variety of different brush types to your user but you don’t want to have to change the fundamentals of how a mark shows up on screen every time the user decides to switch from a round to a square brush. Why not wrap those specific implementations in their own brush objects and later on when the user clicks to draw something to screen we’ll just defer to one of those brushes.

```js
// Grab a reference to the canvas and the drawing context
$canvas = $('#painter');
context = $canvas[0].getContext('2d');

// Define our brush strategy objects
brushes = {
  outline: {
      draw: function(e, context) {
          context.strokeRect(e.pageX - offsetLeft, e.pageY - offsetTop, 10, 10);
      }
  },
  square: {
      draw: function(e, context) {
          context.fillRect(e.pageX - offsetLeft, e.pageY - offsetTop, 10, 10);
      }
  },
  circle: {
      draw: function(e, context) {
          context.arc(e.pageX - offsetLeft, e.pageY - offsetTop, 10, 0, Math.PI * 2);
          context.fill();
      }
  }
};

... .

brush = brushes.square;
```

Here we see that `brushes.outline`, `brushes.square`, and `brushes.circle` each implement a consistent interface for the `draw` call. However their exact implementation changes from one brush to the next. `brushes.outline` will only draw the stroke of a rectangle, whereas `brushes.square` and `brushes.circle` will fill their respective shapes in. Elsewhere in the program we set our initial brush to a default of brushes.square. When the users presses their mouse and moves it around screen we can defer to whichever Strategy the brush object is currently referencing:

```js
// Listen for mouse events on the canvas
$canvas
  .on('mousedown', function() {
      isDrawing = true;
  })
  .on('mouseup mouseleave', function() {
      isDrawing = false;
  })
  .on('mousemove', function(e) {
      if (isDrawing) {
          // Defer drawing to a Strategy object
          brush.draw(e, context);
      }
  });
```

Again notice that `.on('mousemove')` we first check to see if it’s ok to draw something and then defer to whichever Strategy is currently being referenced. Using this approach we can add limitless new brush types to the `brushes` object and easily change how our program performs at runtime. Be sure to check out the live example and the source for the full application.

### [Live Example](https://robdodson.s3.amazonaws.com/javascript-design-patterns/strategy/painter/index.html)

[Grab the Example Source](https://github.com/robdodson/JavaScript-Design-Patterns/tree/master/strategy/)
--------------------------------------------------------------------------------------------------------

Related Patterns
----------------

-   Flyweight: Strategy objects often make good flyweights.

Gamma, Erich; Helm, Richard; Johnson, Ralph; Vlissides, John (1994-10-31). Design Patterns: Elements of Reusable Object-Oriented Software. Pearson Education (USA).

- - -

#### [Table of Contents](/javascript-design-patterns/)

You should follow me on Twitter [here.](https://twitter.com/rob_dodson)

---
title: "JavaScript Design Patterns: Table of Contents"
tags:
  - Design Patterns
  - JavaScript
date: 2012-08-03T16:39:00.000Z
updated: 2015-01-02T08:53:08.000Z
---

### Creational

-   Abstract Factory
-   Builder
-   Factory Method
-   Object Pool
-   Prototype
-   [Singleton](/posts/javascript-design-patterns-singleton/)

### Structural

-   Adapter
-   Bridge
-   Composite
-   [Decorator](/posts/javascript-design-patterns-decorator/)
-   Facade
-   Flyweight
-   Private Class Data
-   Proxy

### Behavioral

-   Chain of Responsibility
-   Command
-   Interpreter
-   [Iterator](/posts/javascript-design-patterns-iterator/)
-   Mediator
-   Memento
-   Null Object
-   [Observer](/posts/javascript-design-patterns-observer/)
-   State
-   [Strategy](/posts/javascript-design-patterns-strategy/)
-   Template Method
-   Visitor
-   Monad Pattern / Promises

I've been trying to think up [a new chain](/ending-my-first-chain/) since coming back from Europe but nothing was enticing me. Then a few days ago I had a conversation with one of my friends in which we discussed using Promises in JavaScript. And later on we discussed Builders. I was doing my best to explain the two but really wished that I had a resource where I could just show some simple code examples. It occurred to me that I've always wanted to go through the [Gang of Four book](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612/ref=sr_1_1?ie=UTF8&qid=1344014497&sr=8-1&keywords=design+patterns) and just write my own interpretation of each pattern. Since I'm currently working primarily in JavaScript I thought it might be an interesting challenge to convert their examples, often in strongly typed languages, to something as dynamic and loosey-goosey as JS.

I know there are a lot of people out there who aren't too keen on design patterns but that's not to say that they shouldn't be used or studied.

Patterns should be used with caution as not everything fits so neatly into their paradigms. It's often said that a beginner never met a pattern they didn't like. In my experiences I've been burned by pattern overuse and at other times they've really helped me solve a novel problem.

It's also true that many patterns don't really work or aren't appropriate for particular languages. For instance, the GoF book was written primarily for languages which shared features of C++ and SmallTalk. My hope is that along the way we'll discover what does and doesn't make sense in a dynamic language like JS. Already to the list I've added Promises which I use quite frequently and find to be a wonderful alternative to JavaScript's oft seen pyramid of callbacks.

Again, this is all about learning and experimenting. I’m committed to doing this twice a week for the next several weeks so hopefully by the end of it we’ll have a useful resource that others can benefit from. Stay tuned!

---
title: Joining Voltus to work on climate!
date: 2022-07-10
description: I'm joining the team at Voltus to help make the grid smarter and more resilient.
socialImage: /images/earth-from-space.jpg
socialImageAlt: A nightime photo of Earth taken from space. It shows the lights of the electrical grid across a network of cities.
tags:
  - climate
  - voltus
  - demand response
  - virtual power plant
---

When I left Google back in October of 2021, I did so because I wanted to find a job working on climate change. After a lot of reasearch and interviewing (which [I wrote about at the time](/posts/finding-a-job-in-climate/)) I finally found a role that felt perfect for me. So a couple weeks back, I joined the team at [Voltus](http://voltus.co/), with a mission to make the grid smarter and more resilient.

## What does Voltus do?

Voltus offers a number of programs to its customers, but it's primarily known for its demand response programs. Demand response is a clever grid balancing technique that's especially important as we transition to renewable energy.

You can think of it like this: When there is more demand (i.e. people using power) than there is supply (power being generated) then a grid operator has two choices—either generate more supply, or reduce demand.

Generating more supply means firing up a power plant and producing green house gases. Reducing demand means convincing (or incentivizing) customers to use less power. This is where Voltus comes in.

When a grid operator needs a reduction in demand they send a signal to Voltus, and Voltus pays major power users (factories, big box stores, etc.) to curtail their consumption. Voltus gets paid by the grid operator for this reduction in demand, and Voltus passes a percentage of that payment on to their customers.

You may have heard the term "virtual power plant" before ([I wrote about it recently](/posts/your-home-is-a-virtual-power-plant/)). That's essentially what Voltus does. They manage around 2 Gigawatts (GW) of power—enough to run ~328,000 homes—and have paid out more than \$31M to their customers.

## How does Voltus fight climate change?

If Voltus did not exist, when a grid operator needed more power they would be forced to fire up a fast acting fossil fuel plant. Voltus provides a cleaner (literally zero CO2) alternative.

But what's more important is how Voltus enables renewable energy. A grid designed around wind and solar is highly volatile—every cloud or reduction in wind speed causes the supply to drop. If we want to move away from fossil fuel reserves, then we need grid balancing technologies like Voltus.

_What about batteries?_ you might ask.

According to the Energy Information Administration (EIA), at the end of 2021, [the United States only had 4.5GW of energy storage](https://pv-magazine-usa.com/2022/03/29/us-grid-scale-energy-storage-usage-profiles-innovation-and-growth-outlook/), but it's estimated that [the U.S. will need 930GW by 2050](https://www.pv-magazine.com/2022/01/24/us-zero-carbon-future-would-require-6twh-of-energy-storage/#:~:text=US%20researchers%20suggest%20that%20by,electricity%20in%20the%20United%20States.). So, yes, batteries are great, but there's just not enough of them right now and they take time to install. The beauty of a virtual power plant is that there's no construction required!

But really these things are not mutually exclusive. A greener grid will require a combination of renewable generation, long and short term battery storage, and demand response.

## We're hiring

One of the things that attracted me to Voltus was the incredibly strong work culture. Everyone I spoke to during my interview process seemed to really care about the company's mision, and the leadership team has put a lot of thought and effort into creating a supportive, inclusive environment. I feel like [this video from my manager Jamie](https://www.voltus.co/join-us/engineering) does a good job of conveying the vibe 😁

Voltus is entirely remote, and currently hiring across a number of positions. If you're interested in joining the team, [take a look at our careers page](https://www.voltus.co/join-us/) or feel free to [reach out to me on Twitter](https://twitter.com/rob_dodson) and I'd be happy to answer any questions you may have.

All in all, I feel really fortunate to have found this team, and I hope if you're reading this that you might be considering a role in climate as well. It's a big challenge, and we need all the help we can get, but I'm hopeful and optimistic that we'll get there 🌎


---
title: Let's Talk SMACSS
tags:
  - Chain
  - CSS
  - SMACSS
date: 2012-06-10T04:03:00.000Z
updated: 2015-01-02T08:55:18.000Z
---

In an effort to further my understanding of CSS best practices I've ended up with two sort of looming frameworks: [OOCSS](http://oocss.org/) and [SMACSS.](http://smacss.com/) After reading up on both I feel more drawn toward SMACSS, most likely because it features a lumberjack on its site. I want to give a quick summary of what SMACSS has to offer. In so doing I'm going to borrow liberally from the documentation and then explain my thinking as it relates to certain passages. Cool? OK.

## The Skinny

The ideas behind SMACSS were fostered over time by its creator, Jonathan Snook, who has worked on tons of sites, most notably YAHOO! Mail's latest redesign. SMACSS is not a library of ready-made code that you can just download like [Twitter's Bootstrap](http://twitter.github.com/bootstrap/) or [ZURB's Foundation.](http://foundation.zurb.com/) Instead it is a collection of design ideas and suggestions codefied in an easy to read ebook. Think of it as a tool to help you decide _how_ you're going to write your CSS, rather than something which will write your CSS for you.

The Core of the book, which is what I'm going to focus on today, is separated by stylesheet: Base Rules, Layout Rules, Module Rules, State Rules, and Theme Rules.

## Base Rules

> Base rules are the defaults. They are almost exclusively single element selectors but it could include attribute selectors, pseudo-class selectors, child selectors or sibling selectors. Essentially, a base style says that wherever this element is on the page, it should look like this. -- SMACSS, Categorizing CSS Rules

[Nicole Sullivan](http://www.stubbornella.org/content/), creator of OOCSS, suggests that we start with the smallest possible elements of our site and design up from there. In the SMACSS philosophy this process would start with our `base.css` file. Think of it as the place where we define the absolute most basic styles any element on our site can have.

```css
body,
form {
  margin: 0;
  padding: 0;
}

a {
  color: #039;
}

a:hover {
  color: #03f;
}
```

The idea is to give us a decent, even playing field where all of our core pieces are ready to be used in whatever fashion we see fit. You might find that you enjoy adding your css reset or normalization to a base.css file but personally I like to keep my reset separate to reduce clutter.

## Layout Rules

> Layout rules divide the page into sections. Layouts hold one or more modules together. -- SMACSS, Categorizing CSS Rules

Your layout rules are where prototypes start to come to life. Every site can be broken down into two very broad layers. The first is the scaffolding of the page and the second is the modules which live in the scaffolding.

To understand scaffolding, try looking at a website like [CNN](http://www.cnn.com/) and unfocusing your eyes. Once you're ignoring the words and pictures you should be able to easily describe the major areas of content: the header, the primary content, sidebars, etc. The rules which govern the positioning of those elements should live in `layout.css`.

```css
#header,
#article,
#footer {
  width: 960px;
  margin: auto;
}

#article {
  border: solid #ccc;
  border-width: 1px 0 0;
}
```

It's also a good place to put other generalized layout styles which might be used elsewhere in your site. For instance, a horizontal list for menu items or breadcrumbs:

```css
.h-list {
  margin: 0;
  padding: 0;
  list-style-type: none;
}
.h-list > li {
  display: inline-block;
  margin: 0 10px 0 0;

  /* IE7 hack to mimic inline-block on block elements */
  *display: inline;
  *zoom: 1;
}
```

These styles don't care about the color or background or any other specifics of their elements. They only care about how those elements will be layed out in space.

## Module Rules

> Modules are the reusable, modular parts of our design. They are the callouts, the sidebar sections, the product lists and so on. -- SMACSS, Categorizing CSS Rules

The module rules are where the majority of your site code will go, as this sheet defines all the little inhabitants of that second layer I mentioned, the modules _inside_ the scaffolding. Each module should be able to stand on its own, and as such, it might be a good idea to design them first in a separate file so there is no temptation to leverage styles already on the page. Once your module is complete you can drop it into your document and it _should_ play nice with everyone else.

Each module will typically start with a class name, and all subsequent selectors should work from this point down. Or if our module is going to be rather complex we can namespace our selectors. For instance:

```css
.pod {
  width: 100%;
}

.pod > h3 {
  color: #f00;
}

/* Or... */

.pod-title {
  color: #f00;
}
```

Whether you use descendant selectors or namespaced clases is really up to you and how complex your modules get. You definitely don't want to end up with classitis. The advantage to using `.pod-title` is that it doesn't tie us to an `h3`, however your markup might become a total mess if every single element requires its own class. Balance is key.

### Subclassing Modules

One very important concept to keep in mind is that of subclassing modules. Imagine a scenario where you have a widget which exists in your primary content area. One day your boss tells you to move it into the sidebar, and once it's there 99% of the styles should look the same, except the widget will now be about 3/4ths of its normal width and its text should be red instead of blue. Your first inclination might be to move the code for the widget into the sidebar and then to do something like this:

```css
/* DON'T DO THIS! */

.widget {
  width: 100px;
}

.widget .widget-title {
  color: #00f;
}

#sidebar .widget {
  width: 75px;
}

#sidebar .widget .widget-title {
  width: 75px;
}
```

By leveraging the parent context we've now locked ourselves into a specificity war. Any change to our second widget requires the `#sidebar` id, which also means that this second widget cannot live anywhere else. Rather than using the parent we should consider the widget that lives in the sidebar as an _extension_ of our original object.

```css
.widget {
  width: 100px;
}

.widget .widget-title {
  color: #00f;
}

/* Our Subclass */
.widget-constrained {
  width: 75px;
}

.widget-constrained .widget-title {
  color: #f00;
}
```

To use a subclass we should apply both the original and the subclass styles to our element:

```html
<div class="widget widget-constrained">...</div>
```

The benefit of doing it this way is that the styles are easier to read and also more flexible. Since there's no parent coupling our `widget-constrained` can be used in the sidebar, footer, modals, or anywhere else you'd like.

## State Rules

> State rules are ways to describe how our modules or layouts will look when in a particular state. Is it hidden or expanded? Is it active or inactive? They are about describing how a module or layout looks on screens that are smaller or bigger. They are also about describing how a module might look in different views like the home page or the inside page. -- SMACSS, Categorizing CSS Rules

The best example of what should go into a `states.css` is the classic error state.

```css
.is-error {
  border: 1px solid red;
}
```

Really anything that would potentially be added with JavaScript to illustrate a change in a module's state would be a good candidate. Some other ones that come to mind are `is-hidden` or `is-pressed`.

One rather sticky point to the whole idea of a `states.css` is that most of the states would need to either rely on being loaded after all your other stylesheets or have an `!important` added to them. I think for a lot of folks that is a dealbreaker, although in my opinion, if used properly, those few !importants can be very useful. For instance, if we add an `is-hidden` state to one of our elements I think it's perfectly ok to `!important` the `display: none`.

### Module States

An alternative to using `!important` all over the place is the idea of module states. So rather than `.is-pressed` in our `states.css` we would have `.is-btn-pressed` next to our `.btn` module in `modules.css`. I like this approach a lot and think it solves many of the places where `states.css` feels too general.

## Theme Rules

> Theme rules are similar to state rules in that they describe how modules or layouts might look. Most sites don’t require a layer of theming but it is good to be aware of it.

The primary consideration for theme rules are when your site is able to be reskinned and also if the typography can be changed.

Skinning a new module with a `theme.css` might look something like this:

```css
/* in modules.css */
.mod {
  border: 1px solid;
}

/* in theme.css */
.mod {
  border-color: blue;
}
```

Likewise if you need to switch to a different font or size, here is where you would do that. To be honest I don't currently need to make any of my projects skinnable so I haven't explored the ideas around `theme.css` all that much, but I do think it's a good idea to keep in the back of your hat.

## Wrap it up!

That does it for tonight. Hopefully you're a little more enlightened with regards to SMACSS. Definitely [checkout the SMACSS site](http://smacss.com/) and grab the book. And as always please feel free to [send me feedback on Twitter](https://twitter.com/rob_dodson).


---
title: Make Your Own jQuery Deferreds and Promises
tags:
  - Chain
  - jQuery
  - Promises
date: 2012-06-04T03:33:00.000Z
updated: 2014-12-30T23:20:41.000Z
---Last week [I did a post on how to load an Underscore template using jQuery's Deferred method](http://robdodson.me/blog/2012/05/30/using-jquery-deferred-to-load-an-underscore-template/). I got some great feedback from folks and decided I should do a follow up showing how to create your own Deferreds.

### What's a Deferred again...?

So, quick summary time. jQuery has a neat little Object called a `Deferred` which is basically a wrapper around a function or a group of functions. Let's say that you want to load 3 different json files via ajax and when all that's done you want to let the rest of the world know. Using jQuery's `Deferred` Object we can actually put a wrapper around those 3 ajax functions and fire off a callback when they've all finished. [Refer back to my previous post (toward the bottom) where I explain some of these callbacks.](http://robdodson.me/blog/2012/05/30/using-jquery-deferred-to-load-an-underscore-template/)

`Deferred` isn't limited to ajax calls, it can work in just about any environment. Let's do an example using jQuery's animate function. We'll fade an item and when it's finished animating we'll resolve our `Deferred` object.

### Our First Deferred

Here's the code we'll be using in our index.html file:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Deferred Sandbox</title>
    <style type="text/css">
      #container {
        width: 100px;
        height: 100px;
        background: #ccc;
      }
    </style>

    <script src="jquery.js"></script>
    <script src="main.js"></script>
  </head>
  <body>
    <div id="main">
      <div id="container"></div>
    </div>
  </body>
</html>
```

Take note of the fact that I've included jquery.js and main.js in the same folder as index.html. If you run the above you should get a simple little grey square in the top left of your screen. Now let's dive into the JavaScript.

```js
var container = {
  initialize: function($el) {
    // Store a reference to our element
    // on the page
    this.$el = $el;
  },
  fadeOut: function() {
    // Create a new Deferred.
    var dfd = new $.Deferred();

    this.$el.animate(
      {
        opacity: 0
      },
      2000,
      function() {
        // When we're done animating
        // we'll resolve our Deferred.
        // This will call any done() callbacks
        // attached to either our Deferred or
        // one of its promises.
        dfd.resolve('Finished fading out!');
      }
    );

    // Return an immutable promise object.
    // Clients can listen for its done or fail
    // callbacks but they can't resolve it themselves
    return dfd.promise();
  }
};

$(function() {
  // Hook the container object up to the #container div
  container.initialize($('#container'));

  // Instruct the container to fade out. When we call
  // fadeOut we should get a promise back as a return value
  var promise = container.fadeOut();

  // Now that we have a promise we can hook a done callback
  // onto it. The done() method will fire once the promise
  // is resolved.
  promise.done(function(message) {
    console.log(message);
  });
});
```

That's a fair bit of code so let's walk through it bit by bit. We start off by creating an object called `container` which is going to wrap the `#container` div already on the page. The real guts of container happens in the `fadeOut` method:

```js
fadeOut: function() {
    // Create a new Deferred.
    var dfd = new $.Deferred();

    this.$el.animate({
        opacity: 0
    }, 2000, function() {
        // When we're done animating
        // we'll resolve our Deferred.
        // This will call any done() callbacks
        // attached to either our Deferred or
        // one of its promises.
        dfd.resolve("Finished fading out!");
    });

    // Return an immutable promise object.
    // Clients can listen for its done or fail
    // callbacks but they can't resolve it themselves
    return dfd.promise();
}
```

The first thing we do is to create a new `Deferred` using jQuery's Deferred constructor. Ignore the animation function for a moment and look at the bottom of this method. See how we're returning `dfd.promise()`? A promise is a dynamically generated object which lets clients hook onto our `done` and `fail` callbacks but it doesn't let them do anything to change our original `Deferred` object. A promise is an `immutable` object, meaning clients can listen to it but they can't really do anything to change it. We want this functionality because we don't want someone else to come along and accidentally resolve our `Deferred`. So instead of returning the `Deferred` we just created, we only return its `promise`.

OK back to the animation function:

```js
this.$el.animate(
  {
    opacity: 0
  },
  2000,
  function() {
    // When we're done animating
    // we'll resolve our Deferred.
    // This will call any done() callbacks
    // attached to either our Deferred or
    // one of its promises.
    dfd.resolve('Finished fading out!');
  }
);
```

If you've used `jQuery.animate` before this should look pretty straightforward to you. At the end of our animation we pass in an anonymouse function which will be run when the animation completes. In this function we tell our `Deferred` to resolve. Resolving the `Deferred` causes any `done` callbacks to fire. In this case we're also passing along a little snippet of text. When you resolve a `Deferred` you can give it an optional payload object which will be passed to all the `done` callbacks. This is extremely useful if you're using ajax to pass along the final data value. In this case we're just going to log the message into the console:

```js
promise.done(function(message) {
  console.log(message);
});
```

There are more cool things you can do with `Deferreds` I highly recommend you [spend some time with the documentation](http://api.jquery.com/category/deferred-object/) and trying out some of the other methods like `pipe` or `resolveWith`. Also as a side note [checkout this page](http://api.jquery.com/promise/) which shows how to extract a `promise` by type. It will actually let you do everything we've done in our animation example but with fewer lines of code.

Let me know if this is helpful or if you have any questions. Till tomorrow! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Silly, Lazy
- Sleep: 7
- Hunger: 5
- Coffee: 0


---
title: Mocking Requests with Mocha, Chai and Sinon
tags:
  - Chain
  - BDD
  - Node
  - Mocha
  - Chai
  - Express
  - Sinon
date: 2012-05-28T18:20:00.000Z
updated: 2014-12-30T08:05:53.000Z
---[After a bit of a rocky start yesterday](http://robdodson.me/blog/2012/05/27/testing-backbone-boilerplate-with-mocha-and-chai/) I've finally got Mocha and Chai running in the browser which is great. Today I'd like to test out some of the async functionality of Mocha. This seems to be the big selling point for most people so we'll kick the tires a bit.

### Basic Async Tests with Mocha and Chai

I wrote a little Node service that we'll consume for testing purposes. This is my first [Node](http://nodejs.org/) and [Express](http://expressjs.com/) app so apologies if it's lamesauce. I used the `express` command to boilerplate a project called `pickles` with some very basic routes:

```js
// Routes

var count = 100;

app.get('/', function(req, res) {
  res.send('Welcome to the Pickle Store!');
});

app.get('/pickles', function(req, res) {
  res.json({
    count: count,
    message: 'oh boy, ' + count + ' pickles!'
  });
});

app.get('/pickles/add/:num', function(req, res) {
  count += parseInt(req.params.num);
  res.json({
    add: req.params.num,
    message: 'you added ' + req.params.num + ' pickles to the pickle barrel!'
  });
});

app.listen(3000, function() {
  console.log(
    'Express server listening on port %d in %s mode',
    app.address().port,
    app.settings.env
  );
});
```

We'll need to make sure our node service is running for our tests to work and all of our URLs will point at localhost:3000. Obviously you wouldn't want this for a production setting but it'll be fine for demonstration purposes.

Here is our really simple Mocha spec. We're actually creating a `pickelStore` object in the spec file itself so we can test against it.

```js
var expect = chai.expect;

var pickleStore = {
  pickles: function() {
    $.ajax({
      url: 'http://localhost:3000/pickles',
      dataType: 'json',
      success: function(data) {
        console.log(data);
      }
    });
  },
  add: function(num) {
    $.ajax({
      url: 'http://localhost:3000/pickles/add/' + num,
      dataType: 'json',
      success: function(data) {
        console.log(data);
      }
    });
  }
};

describe('Pickle Store', function() {
  describe('#pickles', function() {
    pickleStore.pickles();
  });
});
```

I just want to see if the ajax methods will run and hit our Node service but I'm running into the following issue in Chrome:

```
XMLHttpRequest cannot load http://localhost:3000/pickles. Origin null is not allowed by Access-Control-Allow-Origin.
```

Bummer... :(

OK, what's going on here... To StackOverflow! [Aaaand we have our response.](http://stackoverflow.com/questions/8456538/origin-null-is-not-allowed-by-access-control-allow-origin/8456586#8456586) After a bit of googling I came across [this post](http://www.stoimen.com/blog/2010/11/19/diving-into-node-js-very-first-app/) which mentions adding `res.header('Access-Control-Allow-Origin', '*');` to my Node responses. That does the trick. I also found [this post](http://www.stoimen.com/blog/2010/11/19/diving-into-node-js-very-first-app/) which describes setting up [CORS](https://developer.mozilla.org/en/http_access_control) with Express.

OK hopefully we're done with Node for now. I don't want this to turn into a node tutorial... Let's see if we can get the tests to perform using Mocha. We'll need some way to mock and spy on the ajax because I don't want to test the data coming from the actual service. I've realized I want to _simulate_ the service for client-side Mocha tests. In a future tutorial I'll test the service itself using the Node aspect of Mocha. Kind of silly to lead off this way but whatever, moving on!

### Enter Sinon.js

I'm going to use [Sinon.js](http://sinonjs.org/) to help me mock, stub, fake, spy and do whatever the heck else I need to make sure my client code is solid. After downloading the js file for Sinon you can just add it to our test/index.html under the line where we added mocha.

```html
<html>
  <head>
    <meta charset="utf-8" />
    <title>Mocha Tests</title>
    <link rel="stylesheet" href="mocha/mocha.css" />
    <script src="../assets/js/libs/jquery.js"></script>
    <script src="chai/chai.js"></script>
    <script src="mocha/mocha.js"></script>
    <script src="sinon/sinon.js"></script>
    <script>
      mocha.setup('bdd');
    </script>
    <script src="test.pickles.js"></script>
    <script>
      $(function() {
        mocha.run();
      });
    </script>
  </head>
  <body>
    <div id="mocha"></div>
  </body>
</html>
```

Now we can use Sinon in our `test.pickles.js` file to get a handled on our ajax. Let's first test that an ajax call is made when we run the `pickles()` method of the `pickleStore` object. We'll make sure this first test fails, then we'll change the spec to make it pass.

```js
var expect = chai.expect;

var pickleStore = {
  pickles: function() {
    $.ajax({
      url: 'http://localhost:3000/pickles',
      dataType: 'json',
      success: function(data) {
        console.log(data);
      }
    });
  },
  add: function(num) {
    $.ajax({
      url: 'http://localhost:3000/pickles/add/' + num,
      dataType: 'json',
      success: function(data) {
        console.log(data);
      }
    });
  }
};

describe('Pickle Store', function() {
  describe('#pickles', function() {
    // Use Sinon to replace jQuery's ajax method
    // with a spy.
    beforeEach(function() {
      sinon.spy($, 'ajax');
    });

    // Restor jQuery's ajax method to its
    // original state
    afterEach(function() {
      $.ajax.restore();
    });

    it('should make an ajax call', function(done) {
      pickleStore.pickles();
      expect($.ajax.calledOnce).to.be.false; // see if the spy WASN'T called
      done(); // let Mocha know we're done async testing
    });
  });
});
```

![Our first failing test with Mocha, Chai and Sinon. Yay!](/images/2014/12/first_failing_ajax_test.png)

Changing this line `expect($.ajax.calledOnce).to.be.false;` from `false` to `true` should make our test pass. Yay, first async test in the bag! Next let's try to fake a response from the server. But I'm realizing that the succesful server response should _do_ something to my pickleStore object, otherwise why do I care about the data? So I'm going to update pickelStore with the following success callback on its pickles method:

```js
var pickleStore = {
  count: 0,
  status: '',
  pickles: function() {
    var self = this;
    $.ajax({
      url: 'http://localhost:3000/pickles',
      dataType: 'json',
      success: function(data) {
        self.count = parseInt(data.count);
        self.status = data.status;
      }
    });
  },
  add: function(num) {
    $.ajax({
      url: 'http://localhost:3000/pickles/add/' + num,
      dataType: 'json',
      success: function(data) {
        console.log(data);
      }
    });
  }
};
```

Now we can test what happens after the server sends a succesful response. But how do we get that response and how do we force the success callback? For that we'll need to use Sinon's `stub.yieldsTo` method. It's mentioned in [the docs on this page](http://sinonjs.org/docs/#stubs) if you scroll down. `yieldsTo` lets us direct the path of our spy so it will not only pretend to be jQuery's `ajax` method, but it will also force itself into the `success` callback with an optional hash of parameters which simulate our service response. Sweet! We'll have to revise the `beforeEach` in our spec though otherwise Sinon will complain that we're wrapping `ajax` twice. The updated spec should look like this. Again, take note that we're going to make it fail first by expecting a count of 99 pickles instead of 100.

```js
describe('Pickle Store', function() {
  describe('#pickles', function() {
    // Use Sinon to replace jQuery's ajax method
    // with a spy. This spy will also come with
    // some success data.
    beforeEach(function() {
      sinon.stub($, 'ajax').yieldsTo('success', {
        count: '100',
        message: 'oh boy, 100 pickles!'
      });
    });

    // Restor jQuery's ajax method to its
    // original state
    afterEach(function() {
      $.ajax.restore();
    });

    it('should make an ajax call', function(done) {
      pickleStore.pickles();
      expect($.ajax.calledOnce).to.be.true;
      done();
    });

    it('should update the count', function(done) {
      pickleStore.pickles();
      expect(pickleStore.count).to.equal(99);
      done();
    });
  });
});
```

Failing as expected. Aaaaand we change the expected count to 100, voila! Passing tests again!

![Passing test with Sinon's yieldTo](/images/2014/12/passing_yield_test.png)

I'm adding the test for the status update as well so our final `#pickles` spec should look like this:

```js
describe('Pickle Store', function() {
  describe('#pickles', function() {
    // Use Sinon to replace jQuery's ajax method
    // with a spy. This spy will also come with
    // some success data.
    beforeEach(function() {
      sinon.stub($, 'ajax').yieldsTo('success', {
        count: '100',
        message: 'oh boy, 100 pickles!'
      });
    });

    // Restor jQuery's ajax method to its
    // original state
    afterEach(function() {
      $.ajax.restore();
    });

    it('should make an ajax call', function(done) {
      pickleStore.pickles();
      expect($.ajax.calledOnce).to.be.true;
      done();
    });

    it('should update the count', function(done) {
      pickleStore.pickles();
      expect(pickleStore.count).to.equal(100);
      done();
    });

    it('should update the status', function(done) {
      pickleStore.pickles();
      expect(pickleStore.status).to.equal('oh boy, 100 pickles!');
      done();
    });
  });
});
```

Now let's test the `#add` method before calling it a day. This method is interesting because all it can really do is update our status message. However, once it's called the value returned by `pickles()` should have incremented by whatever amount was passed to `add()`. Let's start by updating our `pickleStore` so it properly updates the status message after we've called add.

```js
var pickleStore = {
  count: 0,
  status: '',
  pickles: function() {
    var self = this;
    $.ajax({
      url: 'http://localhost:3000/pickles',
      dataType: 'json',
      success: function(data) {
        self.count = parseInt(data.count);
        self.status = data.message;
      }
    });
  },
  add: function(num) {
    var self = this;
    $.ajax({
      url: 'http://localhost:3000/pickles/add/' + num,
      dataType: 'json',
      success: function(data) {
        self.status = data.message; // <-- update the status message!
      }
    });
  }
};
```

Now that that's in there we'll write a failing spec.

```js
describe('#add', function() {
  var amount = 11;

  beforeEach(function() {
    sinon.stub($, 'ajax').yieldsTo('success', {
      add: amount,
      message: 'you added ' + amount + ' pickles to the pickle barrel!'
    });
  });

  afterEach(function() {
    $.ajax.restore();
  });

  it('should update the status with the correct amount', function(done) {
    pickleStore.add(amount);
    expect(pickleStore.status).to.equal('you added ' + 99 + ' pickles to the pickle barrel!');
    done();
  });
});
```

This is not unlike our previous spec, in fact it does even less since we're not checking count.

![Another failing test.](/images/2014/12/failing_add_test.png)

To make the test pass we change the 99 to `amount`. I originally wrote the add method thinking I would go back and check the total number of pickles but I've realized now that really that's more of a test for the service and not the front end. The front end shouldn't care if that arithmetic is happening properly, it should just consume data and update its UI. For tomorrow's post I'll try to get an AMD module in here so we can start playing with Backbone again. Thanks!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Irritated, Antsy
- Sleep: 8
- Hunger: 5
- Coffee: 0


---
title: My First Chain
tags:
  - Chain
date: 2012-05-20T05:53:00.000Z
updated: 2014-12-30T07:34:41.000Z
---Back in April I was reading hacker news when I came across a blog posted titled ['366 or How I Tricked Myself into Being Awesome'](http://japhr.blogspot.com/2012/04/366-or-how-i-tricked-myself-into-being.html). It was written by a fellow named Chris Strom. It was written on blogspot. It was mostly unstyled.

Chris wrote every single day for 366 days and in so doing self-published three books on programming languages that he knew nothing about. His post was to champion that milestone. At the time I read it and thought, "I can totally do this," meaning if I follow the steps that Chris has outlined I can potentially trick myself into becoming a blogger.

That probably seems rather silly to say but it's true. Every developer I know Googles for answers when they're stuck or trying to learn something new. [And it seems like](http://css-tricks.com/), [over and](http://www.alistapart.com/)[over again](http://www.leebrimelow.com/), [we end up](http://devblog.avdi.org/)[in the same places.](http://yehudakatz.com/) And if you're a developer, or maybe if you're just me, you totally revere these people. They are guides in what is a truly unfamiliar world and they do it without asking anything in return.

So I set out to try to do my own chain. I have to write until I go to Europe on June 27th. At this moment I have 22 blog posts that I've written as a result of the chain. Prior to that I'd written 3 in an entire year. At first I found the whole process exhilarating, until it started to get in the way of my personal activities. Now I have to figure out how to write something of substance while still balancing my job and my home life. This is not easy. It requires setting boundaries and self-discipline. I try to write in the mornings, usually between the hours of 7 to 9. Frequently I don't finish and my posts have to be resumed in the evening. But working like this interferes with the time I can spend with my girlfriend and that breaks one of the unspoken rules I have which is that writing should not disturb my normal social life. Getting to the first 10 posts this was not a problem but now that I'm passing 20 it is. I've changed my writing style from full blown tutorials to more of a play-by-play as I code. I'm always striving to be more succinct in what I write but usually the challenge is disappearing down a rabbit hole while I research something new only to realize that I've blown half an hour of my writing time googling minutia. I'm going to try to associate googling minutia with some guy getting in between me and my girlfriend. As a result I will want to stab googling minutia.

Anyway, if you find this post and you are thinking about writing let me tell you that I **highly** recommend it. Here is some quick advice:

### Don't worry about what your blog looks like.

**I'm 100% serious on this point**. If you spend any time designing your blog before you write your first 5 articles then you're doing it wrong. I have fallen into this trap innumerable times. Just accept this challenge: Make it to 10 blog posts, then you can redesign the thing.

I think we fall in love with the idea of having a beautiful blog and get lost in design and programming how everything will look. This is a mistake. Blogging is supposed to just be a journal of what you're currently working on and thinking. Assume no one will read it (this is probably true). After you have a few readers then work on the look and feel if you choose. Personally I've found that not worrying about the design at all has been incredibly freeing. Again, look at [Chris Strom's blog](http://japhr.blogspot.com/2012/04/366-or-how-i-tricked-myself-into-being.html). He has a ton of readers, is a published author, and is running the default blogspot theme.

### Try to write at the same time every day

I find it easiest to focus in the morning especially when everyone else is asleep. I think Chris works late at night. Figure out what times suits you and do your best to stick to it. When I finish a post in the morning I feel free for the whole rest of the day. It's kind of cool to have that sense of accomplishment before arriving at work :D

### Use the best tools you can

I tried writing in Wordpress on several different occasions. I've also tried Tumblr and Posterous. I find writing in shitty WYSIWYG editors drives me totally crazy. There are apps out there that let you write in more of a desktop setting but I'm not sure if they are still subject to Wordpress or Tumblr's weird formatting. Basically if you're writing a code blog it fucking sucks to use a WYSIWYG because they'll try to wrap all of your funky syntax in weird markup. I found [Octopress](http://octopress.org/) and it's been the best tool I've ever used for writing. I also [wrote a little article](http://robdodson.me/blog/2012/04/30/custom-domain-with-octopress-and-github-pages/) on it if you're trying to get it setup for your personal domain. Octopress is great because it uses [Markdown](http://daringfireball.net/projects/markdown/), the same language that's used to generate most of the pages on Github, there's no database and you can write in any text editor. I do all of my blogging in [Sublime Text 2](http://www.sublimetext.com/2), often times with my blog in one cell with my code in the other. Here's a screenshot of what this can look like.

![Side-by-side blogging](/images/2014/12/side_by_side_blogging.png)

### Don't worry when no one reads it

Finally, don't get too hung up on who is (or isn't) reading your blog. I know that pretty much all of the visits I see in my google analytics are actually just me checking the site on my phone or laptop. Definitely _do_ add analytics so you can see which parts are successful and which are not but don't expect to be [Daring Fireball](http://daringfireball.net/) overnight. In fact, don't ever expect to be Daring Fireball. Keep in mind that what you're doing is a personal journal. It may not seem like blogs are framed in that context but that's what they're best at. I often times find this really interesting flow where I write down what I think I should build before I build it, then I write a test, then I write the implementation. Often times I work out what I'm doing in the blog post well before I've even written the test. This is like a whole other kind of BDD, Blog Driven Development :) Use it for what it's best at and you'll find it rewarding.

Ok that's it for now. Goodnight!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)


---
title: NoMethodError in Rails 3
tags:
  - Rails
  - Rails 3
  - Errors
  - Ruby
date: 2011-09-20T14:33:00.000Z
updated: 2014-12-30T06:03:21.000Z
---

Coming from Actionscript 3 I’m pretty used to all of the different errors that the Flash compiler and runtime typically throw at me. But now that I’ve started teaching myself Ruby on Rails 3 I’m having to learn a whole new lexicon of messages which generally amount to “Something blow’d up...”

For my own benefit, and hopefully for the benefit of others, I’m going to post the errors and solutions that I come up with. Hopefully since I’m a total newbie, explaining things from my perspective will help other people who are new to the language as well.

To start of we have the `NoMethodError`.
![NoMethodError](/images/2014/12/no_method_error.jpg)

You get a `NoMethodError` when you try to call a method which either doesn’t exist on an Object, or the Object itself doesn’t exist. Since `Nil` is actually an object in Ruby (it’s an instance of `NilClass`) this error can sometimes be a bit misleading (especially if you come from a language where Nil or Null is represented by a primitive or a data type like in Actionscript 3).

The real reason this occurs is either because the Object itself is Nil (and you probably didn’t intend that) or you forgot to define the method on your Object. In Flash you would get an error saying you can’t call a method on a null object reference, since null is just a primitive data type. But in Ruby, it says that the method you wanted didn’t exist because you called it on an ACTUAL NilClass object and NilClass doesn't define whatever method name you passed.

### Resolution

1. If your error says “undefined method ‘some_method_name’ for NilClass:Class” (like it does in the picture) then you’ve accidentally tried to call a method on an Object which doesn’t really exist. You probably just didn’t pass or instantiate the Object properly.

2. If you see the correct class type in the error then you’ve just failed to declare that method or perhaps mistyped its name. Verify that the method exists in the class and that you don’t have any spelling errors :)

You should follow me on Twitter [here](http://twitter.com/rob_dodson).


---
title: nth-child is weird
tags:
  - CSS
date: 2013-08-04T17:55:00.000Z
updated: 2014-12-31T01:39:04.000Z
---

I ran into a CSS gotcha today and it brought up an interesting (and important)
question: What's the difference between `nth-child` and `nth-of-type`?

## Comparing two things or one

Take a look at this sample code to get a feel for what we're talking about.

```html
<style>
p:nth-child(2) {
  background-color: green;
}
</style>

<div>
  <p>This paragraph is not green</p>
  <p>This paragraph *is* green</p>
</div>
```

You'll notice that we're setting our second `p` element to have a
`background-color` of `green`. To do this we use `p:nth-child(2)`. I think the
way most people (myself included) would read that selector is "select the second
child paragraph". But if we change the markup to look like this:

```html
<div>
  <h1>Hello World!</h1>
  <p>This paragraph is not green :(</p>
  <p>This paragraph is green!</p>
</div>
```

Suddenly our green background moves to the wrong element. What gives?!

[Chris Coyier helpfully explains on CSS-Tricks.](http://css-tricks.com/the-difference-between-nth-child-and-nth-of-type/)

> Our :nth-child selector, in "Plain English," means select an element *if*:
> - It is a paragraph element
> - It is the second child of a parent

Since we've added another child in the form of an `h1` tag, we need to now say
`p:nth-child(3)` if we want to select the same element. In my mind that makes
the `nth-child` tag brittle and somewhat counterintuitive.

Thankfully there's an alternative in form of the `nth-of-type` selector.

```css
p:nth-of-type(2) {
  background-color: green;
}
```

Again, quoting [Mr. Coyier](http://css-tricks.com/the-difference-between-nth-child-and-nth-of-type/):

> Our :nth-of-type selector, in "Plain English," means:
> - Select the second paragraph child of a parent

So `nth-of-type` gives us the functionality we were originally looking for and
doesn't require us to change our markup if we add additional child elements
which use different tags. That's pretty sweet!

If you want to play around with the idea [I've put together a codepen.](http://codepen.io/robdodson/pen/GzuKH) Enjoy!


---
title: Object Oriented Scraper Backed With Tests pt. 2
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
date: 2012-05-08T01:48:00.000Z
updated: 2014-12-30T06:58:01.000Z
exclude: true
---

I'm picking up from where I left off last night. If you look back at the [previous post](/blog/2012/05/06/object-oriented-scraper-backed-with-tests/) we ended with a spec'd out `Runner` object. Now we need to build our `Crawler` which will slurp up all the content from our posts and return them as meaningful data.

Our Crawler will have 2 main responsibilities. First it will iterate over a post and return a Hash of words and their usage count. Second, it will iterate over a post and pull out any metadata and associate that with a Date. These are rather simple goals and if you remember from our original scraper we were actually hitting every post on the main page. I think I'd like to nail down these simple functions and then refactor the Crawler to accept a corpus page full of links—[like our archives page](http://robdodson.me/blog/archives/)—which it will follow and parse. Right now I want to start small.

Here's a list of what I _think_ would be good tests for our `Crawler`.

- It should return an instance in exchange for a valid URI. Since the URI comes from the Runner and that's already being tested we'll assume that the URI we're given is valid.
- It should respond to a `get_word_counts` method.
- The get_word_counts method should accept a selector `String` and return a `Hash` of words and their counts. Since the selector will be coming from the Runner we'll assume it's valid too but first we'll need to put another test in our `runner_spec.rb`.
- It should respond to a `get_metadata` method.
- The get_metadata method should also accept a selector `String` and return a `Hash` with a valid `Date` and each piece of metadata categorized. Let's see how far we can take this by converting strings related to time into `Time` objects and any categories with multiple entries into `Arrays`.

I'm actually going to copy and paste the above list into my specs and start buliding from there.

....

Hmm... actually I'm not. Something about this doesn't feel right. `Runner` has accrued too much responsibility. It's supposed to validate 3 different strings parsed from a YAML file which it loads and then it also has to deal with creating and running the `Crawler`. I think it's time for another object. Which we'll call `Options`. Options will be in charge of loading our YAML and verifying that all the values are valid. `Runner` will create both an Options and a Crawler object and pass the values from Options to Crawler. This is actaully also in line with the Pickaxe book's Anagrams example, so we have a nice guide to follow in that.

OK so `Options`, eh? Well we'll need to spec out its responsibilities. I think we can just take the tests we wrote for Runner and move them over to Options.

After doing this for while I've ended up with a TON of tests...only to validate 3 variables.

```ruby
require_relative '../lib/tentacles/options'
require 'yaml'
require 'uri'
require 'helpers'

describe Tentacles::Options do
  include Helpers

  before do
    @options = Tentacles::Options.new(relative_path + '/../lib/tentacles/config.yml')
  end

  subject { @options }

  it { should respond_to(:uri) }
  it { should respond_to(:post_selector) }
  it { should respond_to(:metadata_selector) }

  describe "when parsing the config file" do
    it "should raise an exception if the config file is missing" do
      expect { options = Tentacles::Options.new('') }.to raise_error(Errno::ENOENT)
      expect { options = Tentacles::Options.new(nil) }.to raise_error(TypeError)
    end

    it "should raise an exception if the config file is invalid" do
      expect { options = Tentacles::Options.new(relative_path + '/mocks/invalid_yaml.yml') }.to raise_error(Psych::SyntaxError)
    end
  end

  describe "when parsing the URI" do
    it "should display the right URI" do
      uri = URI.parse('http://robdodson.me')
      @options.uri.should eq(uri)
    end

    it "should raise an exception if uri is empty" do
      expect { options = Tentacles::Options.new(relative_path + '/mocks/blank_uri.yml') }.to raise_error(Psych::SyntaxError)
    end

    it "should raise an exception if uri is invalid" do
      expect { options = Tentacles::Options.new(relative_path + '/mocks/invalid_uri.yml') }.to raise_error(Psych::SyntaxError)
    end
  end

  describe "when parsing the post selector" do
    it "should have a post_selector" do
      @options.post_selector.should be('.entry-content')
    end

    it "should raise an exception if the post selector is empty" do
      expect { options = Tentacles::Options.new(relative_path + '/mocks/blank_uri.yml') }.to raise_error(Psych::SyntaxError)
    end
  end

  describe "when parsing the metadata selector" do
    it "should have a metadata_selector" do
      @options.metadata_selector.should be('.personal-metadata')
    end

    it "should raise an exception if the metadata selector is empty" do
      expect { options = Tentacles::Options.new(relative_path + '/mocks/blank_uri.yml') }.to raise_error(Psych::SyntaxError)
    end
  end
end
```

Here's my implementation of `options.rb`

```ruby
require 'yaml'

module Tentacles
  class Options

    attr_reader :uri
    attr_reader :post_selector
    attr_reader :metadata_selector

    def initialize(config)
      @config = YAML.load(File.open(config))

      @uri = URI.parse(@config[:uri])
      raise IOError, 'invalid uri!' if @uri.scheme.nil? || @uri.host.nil?

      @post_selector = @config[:post_selector]
      raise IOError, 'post_selector is not defined' if @post_selector.empty?

      @metadata_selector = @config[:metadata_selector]
      raise IOError, 'metadata_selector is not defined' if @metadata_selector.empty?
    end
  end
end
```

Seems like now might be a good time to pause for a bit. When I look at those tests I see a lot of places where I'm testing Classes that have probably already been tested. I feel like you can safely assume that if you pass `YAML.load` a bunch of junk it's going to throw an error. Is there any value in testing something like that for my own implementation? I'm guessing not. However I do think it's important that I test the 3 exceptions that I wrote. I'll get all the tests to pass and then I'll go back and clean it up.

### Making the Tests Pass

I like to comment out my spec file and go line by line making each test pass as I go. I'm pretty good at writing failing tests (heh) so this approach adheres well to the red, green, refactor mantra.

Starting out I have a problem in the first block which checks my `attr_readers`:

```ruby
it { should respond_to(:uri) }
it { should respond_to(:post_selector) }
it { should respond_to(:metadata_selector) }
```

Let's see if I can get just the first test to pass... I comment out everything inside of Options and notice that YAML does not use symbols for keys. It seems like loaded YAML uses Strings for keys. After changing my symbol keys to strings my first block of tests pass.

```ruby
require 'yaml'

module Tentacles
  class Options

    attr_reader :uri
    attr_reader :post_selector
    attr_reader :metadata_selector

    def initialize(config)
      @config = YAML.load(File.open(config))

      @uri = URI.parse(@config["uri"])
      raise IOError, 'invalid uri!' if @uri.scheme.nil? || @uri.host.nil?

      @post_selector = @config["post_selector"]
      raise IOError, 'post_selector is not defined' if @post_selector.empty?

      @metadata_selector = @config["metadata_selector"]
      raise IOError, 'metadata_selector is not defined' if @metadata_selector.empty?
    end
  end
end
```

The next block passes quite easily because it's ported over from the `Runner` class

```ruby
describe "when parsing the config file" do
  it "should raise an exception if the config file is missing" do
    expect { options = Tentacles::Options.new('') }.to raise_error(Errno::ENOENT)
    expect { options = Tentacles::Options.new(nil) }.to raise_error(TypeError)
  end

  it "should raise an exception if the config file is invalid" do
    expect { options = Tentacles::Options.new(relative_path + '/mocks/invalid_yaml.yml') }.to raise_error(Psych::SyntaxError)
  end
end
```

After that we run into some issues because our next set of tested exceptions have the wrong class.

```ruby
describe "when parsing the URI" do
  it "should display the right URI" do
    uri = URI.parse('http://robdodson.me')
    @options.uri.should eq(uri)
  end

  it "should raise an exception if uri is empty" do
    expect { options = Tentacles::Options.new(relative_path + '/mocks/blank_uri.yml') }.to raise_error(Psych::SyntaxError)
  end

  it "should raise an exception if uri is invalid" do
    expect { options = Tentacles::Options.new(relative_path + '/mocks/invalid_uri.yml') }.to raise_error(Psych::SyntaxError)
  end
end
```

Changing the last two exceptions to expect `Errno::ENOENT` and `URI::InvalidURIError` in that order fixes things and we're all green again.

In the next block we have 2 failing tests because the first one is using improper syntax. Instead of `be` we should be using `eq`. Seems like in RSpec `be` is equivalent to `===` and not `==`. Also we have another PSYCH::SyntaxError that needs to be replaced with `Errno::ENOENT`. Here's what we end up with after making those changes:

```ruby
describe "when parsing the post selector" do
  it "should have a post_selector" do
    @options.post_selector.should eq('.entry-content')
  end

  it "should raise an exception if the post selector is empty" do
    expect { options = Tentacles::Options.new(relative_path + '/mocks/blank_uri.yml') }.to raise_error(Errno::ENOENT)
  end
end
```

Ugh, hate to cut it short but looks like I'm going down a rabbit hole with validation. I'll pickup tomorrow to see if we can iron a lot of this out.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Calm, Hot, Tired
- Sleep: 7
- Hunger: 6.5
- Coffee: 0


---
title: Object Oriented Scraper Backed With Tests Pt. 3
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
  - FakeWeb
date: 2012-05-09T04:03:00.000Z
updated: 2014-12-30T06:59:53.000Z
exclude: true
---

I did some cleanup this morning on the `Options` class and the `options_spec`, mainly to remove items that seemed like they shouldn't be tested. Here's where I'm currently at:

```ruby
require 'yaml'

module Tentacles
  class Options

    attr_reader :uri
    attr_reader :post_selector
    attr_reader :metadata_selector

    def initialize(config)
      @config = YAML.load(File.open(config))

      @config.each do |key, value|
        raise IOError, "#{key} is undefined!" if key.nil?
      end

      @uri = URI.parse(@config["uri"])
      raise IOError, 'Invalid uri!' if @uri.scheme.nil? || @uri.host.nil?

      @post_selector = @config["post_selector"]
      @metadata_selector = @config["metadata_selector"]
    end
  end
end


require_relative '../lib/tentacles/options'
require 'yaml'
require 'uri'
require 'helpers'

describe Tentacles::Options do
  include Helpers

  before do
    @options = Tentacles::Options.new(relative_path + '/../lib/tentacles/config.yml')
  end

  subject { @options }

  it { should respond_to(:uri) }
  it { should respond_to(:post_selector) }
  it { should respond_to(:metadata_selector) }

  describe "#initialize" do
    describe "when parsing the URI" do

      context "when URI is valid" do
        it "should display the right URI" do
          uri = URI.parse('http://robdodson.me')
          @options.uri.should eq(uri)
        end
      end

      context "when URI is invalid" do
        it "should raise an exception" do
          expect { options = Tentacles::Options.new(relative_path + '/mocks/invalid_uri.yml') }.to raise_error(URI::InvalidURIError)
        end
      end

      context "when URI does not contain a scheme" do
        it "should raise an IO exception" do
          expect { options = Tentacles::Options.new(relative_path + '/mocks/no_scheme_or_host_uri.yml') }.to raise_error(IOError)
        end
      end

      context "when URI does not contain a host" do
        it "should raise an IO exception" do
          expect { options = Tentacles::Options.new(relative_path + '/mocks/no_scheme_or_host_uri.yml') }.to raise_error(IOError)
        end
      end
    end
  end
end
```

Previously I was testing against `@config = YAML.load(File.open(config))` to see if it would throw an error when passed `nil` or empty string for the argument. I've since realized that's basically testing [Ruby Core](http://www.ruby-doc.org/core-1.9.3/) to see if it's working as described in the docs...which seems silly to me. Now if I were _handling_ those exceptions and doing something in response, then yeah, I would want to test it. But since I'm allowing the program to explode if you try to load an empty config file I figure it's best to just let the core or stdlib do their thing and assume that it was well tested. Having said that I think we've got decent coverage on `Options` and can move back to the `Runner` and then the `Crawler`.

By the way, if you want a more visual representation of our tests you can run `bundle exec rspec -f html -o index.html` which will generate an html file showing what passed/failed and is still pending.

### Mocking Nokogiri requests with FakeWeb

I was curious if it would be possible to mock the Nokogiri requests from our `Crawler` so I did a bit of googling. It looks like the best options would be either [Artifice](https://github.com/wycats/artifice) or [FakeWeb](http://fakeweb.rubyforge.org/). I'm not super familiar with Rack and I don't want to write a separate app just to mock a few calls so I've decided to go with FakeWeb.

First we add it to our Gemfile

```ruby
source 'https://rubygems.org'

gem 'rspec', '2.9.0'
gem 'nokogiri', '~>1.5.2'
gem 'awesome_print', '~>1.0.2'
gem 'fakeweb', '~>1.3.0'
```

and do the usual `bundle install`. Next we'll stub out our `crawler_spec` and verify that it's at least detecting all the methods on the class.

```ruby
require_relative '../lib/tentacles/crawler'

describe Tentacles::Crawler do

  before do
    # A mock for our options object
    options = {
      uri: 'http://robdodson.me',
      post_selector: '.entry-content',
      metadata_selector: '.personal-metadata'
    }

    @crawler = Tentacles::Crawler.from_uri(options[:uri])
  end

  subject { @crawler }

  it { should respond_to(:get_words_by_selector) }
  it { should respond_to(:get_metadata_by_selector) }

end
```

I also want to verify that my class responds to an alternative constructor. Rather than just saying `Crawler.new` I'd prefer to use `Crawler.from_uri`. It doesn't serve much of a purpose but I think it's a good exercise. Here's the modified test to support it.

```ruby
require_relative '../lib/tentacles/crawler'

describe Tentacles::Crawler do

  describe "constructors" do
    describe "#from_uri" do
      it "should respond" do
        Tentacles::Crawler.should respond_to(:from_uri)
      end

      it "should return an instance" do
        crawler = Tentacles::Crawler.from_uri('http://robdodson.me')
        crawler.should be_an_instance_of(Tentacles::Crawler)
      end
    end
  end

  before do
    options = {
      uri: 'http://robdodson.me',
      post_selector: '.entry-content',
      metadata_selector: '.personal-metadata'
    }

    @crawler = Tentacles::Crawler.from_uri(options[:uri])
  end

  subject { @crawler }

  it { should respond_to(:get_words_by_selector) }
  it { should respond_to(:get_metadata_by_selector) }

end
```

And here is our `Crawler` class based largely on our original Crawler [from the first post.](http://robdodson.me/blog/2012/05/05/building-a-simple-scraper-with-nokogiri-in-ruby/)

```ruby
require 'open-uri'
require 'nokogiri'

module Tentacles
  class Crawler
    def self.from_uri(uri)
      new(uri)
    end

    def initialize(uri)
      @uri = uri
      @doc = Nokogiri::HTML(open(@uri))
      @counts = Hash.new(0)
    end

    def get_words_by_selector(selector)
      entries = doc.css('div.entry-content')
      puts "Parsing #{entries.length} entries"
      entries.each do |entry|
        words = words_from_string(entry.content)
        count_frequency(words)
      end

      sorted  = @counts.sort_by { |word, count| count }
      puts sorted.map { |word, count| "#{word}: #{count}"}
    end

    def get_metadata_by_selector(selector)
      # TODO
    end

  private

    def words_from_string(string)
      string.downcase.scan(/[\w']+/)
    end

    def count_frequency(word_list)
      for word in word_list
        @counts[word] += 1
      end
      @counts
    end
  end
end
```

If we run the specs now they _should_ pass but they're **EXTREMELY** slow! Just 4 examples takes 6 seconds O_O. Can you spot the source of all that lag? Take a look at what happens inside of `Crawler#initialize`. Notice how it's creating a new Nokogiri doc every time? Since we have a `before` block in our spec that means that each test (after the before) is going out and parsing our website. Let's see if FakeWeb can help us out some.

```ruby
require_relative '../lib/tentacles/crawler'
require 'fakeweb'

describe Tentacles::Crawler do

  before do
    # Create a mock options object
    @options = {
      uri: 'http://robdodson.me',
      post_selector: '.entry-content',
      metadata_selector: '.personal-metadata'
    }

    # Create a mock web request
    FakeWeb.register_uri(:get, @options[:uri], :body => "Hello World! Hello San Francisco!")
  end

  describe "constructors" do
    describe "#from_uri" do
      it "should respond" do
        Tentacles::Crawler.should respond_to(:from_uri)
      end

      it "should return an instance" do
        crawler = Tentacles::Crawler.from_uri(@options[:uri])
        crawler.should be_an_instance_of(Tentacles::Crawler)
      end
    end
  end

  describe "instances" do
    before do
      @crawler = Tentacles::Crawler.from_uri(@options[:uri])
    end

    subject { @crawler }

    it { should respond_to(:get_words_by_selector) }
    it { should respond_to(:get_metadata_by_selector) }
  end
end
```

While it's not the prettiest test ever written it does get the job done. 0.00359 seconds for 4 examples _down from 6 seconds!_ That's going to wrap it up for tonight. Tomorrow we'll finish off the spec and the implementation and finally get some data coming down from the live site. Until then!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)


---
title: Object Oriented Scraper Backed with Tests Pt. 4
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
  - FakeWeb
date: 2012-05-11T14:20:00.000Z
updated: 2014-12-30T07:10:14.000Z
exclude: true
---

Continuing from our [previous post](http://robdodson.me/blog/2012/05/08/object-oriented-scraper-backed-with-tests-pt-3/) we're going to keep working on our `Crawler` and our specs to see if we can start pulling real data from our site.

The first thing I did this morning was to run my tests:

```bash
bundle exec rspec spec/

..............

Finished in 0.01271 seconds
14 examples, 0 failures
```

As someone totally new to TDD/BDD this is kind of an awesome feeling. I left my code for a few days and now I can come back and verify that everything still works. We can take it even further and run rspec with a documentation formatter to get some pretty printed output:

```bash
    bundle exec rspec spec/ -cf d

    Tentacles::Crawler
      constructors
        #from_uri
          should respond
          should return an instance
      instances
        should respond to #get_words_by_selector
        should respond to #get_metadata_by_selector

    Tentacles::Options
      should respond to #uri
      should respond to #post_selector
      should respond to #metadata_selector
      #initialize
        when parsing the URI
          when URI is valid
            should display the right URI
          when URI is invalid
            should raise an exception
          when URI does not contain a scheme
            should raise an IO exception
          when URI does not contain a host
            should raise an IO exception

    Tentacles::Runner
      should respond to #run
      when parsing the config file
        should raise an error if the config file is missing
        should raise an error if the config file is invalid

    Finished in 0.01359 seconds
    14 examples, 0 failures
```

In rspec the `-c` flag enables color in the output. The `-f` flag sets a formatter and `d` specifies the documentation format.

```bash
-f, --format FORMATTER           Choose a formatter.
                                        [p]rogress (default - dots)
                                        [d]ocumentation (group and example names)
                                        [h]tml
                                        [t]extmate
                                        custom formatter class name
```

Neat.

In `crawler_spec.rb` I'm going to add a test that checks to see if our instance has actually stored the content from our mocked web request.

```ruby
require_relative '../lib/tentacles/crawler'
require 'fakeweb'

describe Tentacles::Crawler do

  before do
    # Create a mock options object
    @options = {
      uri: 'http://robdodson.me',
      post_selector: '.entry-content',
      metadata_selector: '.personal-metadata'
    }

    # Create a mock web request
    FakeWeb.register_uri(:get, @options[:uri], :body => "Hello World! Hello San Francisco!")
  end

  describe "constructors" do
    describe "#from_uri" do
      it "should respond" do
        Tentacles::Crawler.should respond_to(:from_uri)
      end

      it "should return an instance" do
        crawler = Tentacles::Crawler.from_uri(@options[:uri])
        crawler.should be_an_instance_of(Tentacles::Crawler)
      end
    end
  end

  describe "instances" do
    before do
      @crawler = Tentacles::Crawler.from_uri(@options[:uri])
    end

    subject { @crawler }

    it { should respond_to(:get_words_by_selector) }
    it { should respond_to(:get_metadata_by_selector) }

    context "post-construct" do
      it "should have the right document" do
        @crawler.doc.content.should =~ /Hello World! Hello San Francisco!/
      end
    end
  end
end
```

I want to write a test to parse the content for keywords but I realize now that our FakeWeb request returns a string without any classes or id's. Gotta go back and wrap it in some HTML to match our selectors. So I'm changing the mock web request to look like this:

```ruby
# Create a mock web request
FakeWeb.register_uri(:get, @options[:uri],
                      :body => '<div class="' + @options[:post_selector] + '">Hello World! Hello San Francisco!</div>')
```

### Hello Hello Hello World!

After a lot of back and forth I finally get my test to pass. I realize along the way that there are a bunch of things I need to change. For starters having most of my words be the same count doesn't really help me to validate that my keyword counting is working all that well. So I'm changing our FakeWeb request and the subsequent specs which test against it.

```ruby
# Create a mock web request
FakeWeb.register_uri(:get, @options[:uri],
                      :body => '<div class="' + @options[:post_selector].delete(".") + '">Hello Hello Hello World World Foobar!</div>')


context "post-construct" do
  it "should have the right document" do
    @crawler.doc.content.should =~ /Hello Hello Hello World World Foobar!/
  end
end
```

Next I need to make sure that my `get_words_by_selector` method is accepting a selector.

```ruby
def get_words_by_selector(selector)
      entries = doc.css('div.entry-content')
      entries.each do |entry|
        words = words_from_string(entry.content)
        count_frequency(words)
      end

      sorted = @counts.sort_by { |word, count| count }
      sorted.reverse!
      sorted.map { |word, count| "#{word}: #{count}"}
    end
```

I also realize that I'd like my Array of keywords to be in desceding order so I `reverse` it after the initial sort.

Next I'm going to write the test to verify that we've received a group of words, counted them up and tossed them into an Array in descending order:

```ruby
describe "#get_words_by_selector" do
  it "should produce an Array of keywords" do
    expected_array = ['hello: 3', 'world: 2', 'foobar: 1']
    actual_array = @crawler.get_words_by_selector(@options[:post_selector])
    actual_array.should eq(expected_array)
  end
end
```

I actually wrote the test first and did everything else to make it pass. But at this point it should all be passing and we can verify that given a request with the appropriate selector we should be able to build a basic word frequency list. Yay!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Calm, Awake, Curious
- Sleep: 7
- Hunger: 4
- Coffee: 0


---
title: Object Oriented Scraper Backed with Tests Pt. 5
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
  - FakeWeb
  - BDD
date: 2012-05-12T14:02:00.000Z
updated: 2014-12-30T07:18:03.000Z
exclude: true
---

Last night I got the `Crawler` passing its test for `#get_words_by_selector`. This morning I realize that when someone sends in a junk selector I want to raise an exception of some kind. Since I don't know much about Ruby Exceptions I'm doing a little digging...Ruby has both `throw`/`catch` and `raise`/`rescue` so what's the difference between throw/catch and raise/rescue in Ruby?

### Throwing exceptions for control flow

There's a great guest post by Avdi Grimm on [RubyLearning](http://rubylearning.com/blog/2011/07/12/throw-catch-raise-rescue-im-so-confused/) which covers this topic in depth. To summarize `throw`/`catch` is mainly used when doing _exceptions as control flow_. In other words, if you need to break out of a deeply nested loop or some other expensive operation you can throw an exception symbol which can be caught someone high up the call stack. Initially this rubbed me the wrong way since I know that things like `goto` and `labels` are a bad practice. Someone else raised this point in the comments to which Avid responded:

> There is a fundamental difference between throw/catch and goto. Goto, in languages which support it, pays no attention to the stack. Any resources which were allocated before the goto are simply left dangling unless they are manually cleaned up.

> throw/catch, like exception handling, unwinds the stack, triggering ensure blocks along the way. So, for example, if you throw inside an `open() {…}` block, the open file will be closed on the way up to the catch() block.

### Raising exceptions for everything else

With `throw`/`catch` out of the way that leaves `raise`/`rescue` to handle everything else. I'm willing to bet that 99% of error code should probably be raising exceptions and throw/catch should only be used in situations where you need the control flow behavior. With that knowledge in hand I need to decide between one of Ruby's built-in Exceptions or defining one of my own. Let's define one of our own so we can get that experience under our belt.

### Creating an exception subclass in Ruby

One tip I picked up while doing my research into `raise` and `throw` is that any exception that doesn't subclass StandardError will not be caught by default. Here's an example to illustrate:

```ruby
###
# First we define an exception class which doesn't
# inherit from StandardError. As a result it won't
# be caught by a simple rescue. Instead we would
# need to rescue by its class name
###
class MyBadException < Exception
end

def miss_bad_exception
  raise MyBadException.new
  rescue
  p "I'll never be called :("
end

miss_bad_exception
MyBadException: MyBadException
  from (irb):4:in `miss_bad_exception'
  from (irb):8
  from /Users/Rob/.rvm/rubies/ruby-1.9.3-p125/bin/irb:16:in `<main>

# See that calling the method produces an uncaught exception...


###
# Next we'll subclass StandardError. As a result
# we won't have to explicitly define our class name
# for a rescue to work.
###
class MyGoodException < StandardError
end

def save_good_exception
  raise MyGoodException.new
  rescue
  p "I'm saved! My hero!"
end

save_good_exception
"I'm saved! My hero!"

# Yay! Our exception was caught!
```

We'll call our Exception `SelectorError` to indicate that the provided selector did not return any results. For reference I often refer to [this chart on RubyLearning](http://rubylearning.com/satishtalim/ruby_exceptions.html) when I want to see a list of all the available Exception classes. In our case we'll just inherit from StandardError.

```ruby
module Tentacles
  class SelectionError < StandardError
  end
end
```

I don't think we actually need to do much more than that. The ability to pass a payload message should come from the super class so I think we're good to go. Here's our updated spec:

```ruby
it "should raise an exception if nothing was returned" do
  expect { @crawler.get_words_by_selector('some-gibberish-selector') }.to raise_error(Tentacles::SelectionError, 'The selector did not return an results!')
end
```

Initially the test fails so now we need to update our `Crawler` to check if nothing was returned and raise the custom exception.

Here's our updated `Crawler` with additional require and updated method.

```ruby
require 'open-uri'
require 'nokogiri'
require_relative 'selection_error'

module Tentacles
  class Crawler

    attr_reader :doc

    def self.from_uri(uri)
      new(uri)
    end

    def initialize(uri)
      @uri = uri
      @doc = Nokogiri::HTML(open(@uri))
      @counts = Hash.new(0)
    end

    def get_words_by_selector(selector)
      entries = doc.css(selector)
      raise Tentacles::SelectionError,
        'The selector did not return an results!' if entries.empty?
      entries.each do |entry|
        words = words_from_string(entry.content)
        count_frequency(words)
      end

      sorted = @counts.sort_by { |word, count| count }
      sorted.reverse!
      sorted.map { |word, count| "#{word}: #{count}"}
    end

    def get_metadata_by_selector(selector)
      # TODO
    end

  private

    def words_from_string(string)
      string.downcase.scan(/[\w']+/)
    end

    def count_frequency(word_list)
      for word in word_list
        @counts[word] += 1
      end
      @counts
    end
  end
end
```

All tests passing, we're good to go :)

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Alert, Awake, Anxious
- Sleep: 8
- Hunger: 3
- Coffee: 0


---
title: Object Oriented Scraper Backed with Tests Pt. 6
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
  - BDD
date: 2012-05-13T14:52:00.000Z
updated: 2014-12-30T07:19:31.000Z
exclude: true
---

Yesterday we verified that our `Crawler` was able to hit a document and, given the right selector, pull down a list of words and their frequency on the page. We also created a custom exception to be used whenever the selector fails to pull down the right content. I'm going to repeat this process today with the `get_metadata_by_selector`. If there's time we'll try to output another file with our data, otherwise that'll be tomorrow's homeworkd :D

Let's take a moment to look at today's metadata to figure out what we'd like our output to reflect.

    - Time: 8:03 am
    - Mood: Happy, Drowsy, Peaceful
    - Sleep: 5.5
    - Hunger: 3
    - Coffee: 0

That's the actual markdown that goes into the editor but it gets converted into a `ul`. I don't _think_ you can pass a CSS class to markdown syntax otherwise I'd use one here. We could go back and wrap everything in regular HTML tags but since we know that our metadata is going to be the last ul per entry we'll just use that knowledge to build our selector. Obviously a more robust solution would use a CSS class so that might be a good refactoring for the future.

I figure for now we'll just parse the metadata into a Hash that'll look something like this:

```ruby
{
  datetime: 2012-05-13T08:03:00-07:00,
  mood: ['Happy', 'Drowsy', 'Peaceful'],
  sleep: 5.5,
  hunger: 3.0,
  coffee: 0.0
}
```

In the final iteration we'll toss all of our Metadata Hashes into an ordered Array so we can visualize them over time.

### Red, Green, Refactor

Ok, time for a failing test. Let's make sure that our selector pulls something down and if it doesn't we should raise the custom `SelectionError` we defined yesterday. I'm already seeing some repetitive code in our Crawler so I'm refactoring it. Where we need to get a group of XML nodes from the document via selector I've created a private helper called `nodes_by_selector`. This is also where we'll raise our exception if nothing came back. I'm also cleaning up some of the word cruff from our public API so instead of `get_words_by_selector` it's not just `words_by_selector`. The same goes for our metadata method.

```ruby
require 'open-uri'
require 'nokogiri'
require_relative 'selection_error'

module Tentacles
  class Crawler

    attr_reader :doc

    def self.from_uri(uri)
      new(uri)
    end

    def initialize(uri)
      @uri = uri
      @doc = Nokogiri::HTML(open(@uri))
      @counts = Hash.new(0)
    end

    def words_by_selector(selector)
      nodes = nodes_by_selector(selector)
      nodes.each do |node|
        words = words_from_string(node.content)
        count_frequency(words)
      end

      sorted = @counts.sort_by { |word, count| count }
      sorted.reverse!
      sorted.map { |word, count| "#{word}: #{count}"}
    end

    def metadata_by_selector(selector)
      nodes = nodes_by_selector(selector)
    end

  private

    def nodes_by_selector(selector)
      nodes = doc.css(selector)
      raise Tentacles::SelectionError,
        'The selector did not return an results!' if nodes.empty?
      nodes
    end

    def words_from_string(string)
      string.downcase.scan(/[\w']+/)
    end

    def count_frequency(word_list)
      for word in word_list
        @counts[word] += 1
      end
      @counts
    end
  end
end
```

Going back to the tests we need to refactor a bit for any place that's been broken. Immediately I saw that my `nodes_by_selector` method was not initially returning the nodes so I added that back in. The tests brought that to my attention before I had to do any potentially painful debugging. Beyond that we just need to fix up our method names:

```ruby
require_relative '../lib/tentacles/crawler'
require 'fakeweb'

describe Tentacles::Crawler do

  before do
    # Create a mock options object
    @options = {
      uri: 'http://robdodson.me',
      post_selector: '.entry-content',
      metadata_selector: '.personal-metadata'
    }

    # Create a mock web request
    FakeWeb.register_uri(:get, @options[:uri],
                          :body => '<div class="' + @options[:post_selector].delete(".") +
                          '">Hello Hello Hello World World Foobar!</div>')
  end

  describe "constructors" do
    describe "#from_uri" do
      it "should respond" do
        Tentacles::Crawler.should respond_to(:from_uri)
      end

      it "should return an instance" do
        crawler = Tentacles::Crawler.from_uri(@options[:uri])
        crawler.should be_an_instance_of(Tentacles::Crawler)
      end
    end
  end

  describe "instances" do
    before do
      @crawler = Tentacles::Crawler.from_uri(@options[:uri])
    end

    subject { @crawler }

    it { should respond_to(:words_by_selector) }
    it { should respond_to(:metadata_by_selector) }

    context "post-construct" do
      it "should have the right document" do
        @crawler.doc.content.should =~ /Hello Hello Hello World World Foobar!/
      end
    end

    describe "#words_by_selector" do
      it "should produce an Array of keywords" do
        expected_array = ['hello: 3', 'world: 2', 'foobar: 1']
        actual_array = @crawler.words_by_selector(@options[:post_selector])
        actual_array.should eq(expected_array)
      end

      it "should raise an exception if nothing was returned" do
        expect { @crawler.words_by_selector('some-gibberish-selector') }.to raise_error(Tentacles::SelectionError, 'The selector did not return an results!')
      end
    end

    describe "#metadata_by_selector" do
      it "should raise an exception if nothing was returned" do
        expect { @crawler.metadata_by_selector('some-gibberish-selector') }.to raise_error(Tentacles::SelectionError, 'The selector did not return an results!')
      end
    end
  end
end
```

We've got a duplicate test in there where both `#words_by_selector` and `#metadata_by_selector` are checking that they both raise an exception if nothing comes down. Let's see if we can refactor those into an RSpec shared example. I'm not sure if this is a best practice or not but here's my implementation:

```ruby
shared_examples_for "all selector methods" do
  describe "when selection has no nodes" do
    it "should raise an exception" do
      expect { @crawler.send(selector_method, 'some-gibberish-selector') }.to raise_error(Tentacles::SelectionError, 'The selector did not return an results!')
    end
  end
end

### ...

describe "#words_by_selector" do
  it_behaves_like "all selector methods" do
    let(:selector_method) { :words_by_selector }
  end

# ...

end

describe "#metadata_by_selector" do
  it_behaves_like "all selector methods" do
    let(:selector_method) { :metadata_by_selector }
  end
end
```

Basically we're putting our method name as a symbol into a variable using `let` and then calling that method in the shared_examples_for block. Notice how we're using `@crawler.send(selector_method, ...)`? In this case `selector_method` refers to our method name symbol.

If you run this in RSpec's nested mode it looks pretty cool:

```bash
    Tentacles::Crawler
      constructors
        #from_uri
          should respond
          should return an instance
      instances
        should respond to #words_by_selector
        should respond to #metadata_by_selector
        post-construct
          should have the right document
        #words_by_selector
          should produce an Array of keywords
          behaves like all selector methods
            when selection has no nodes
              should raise an exception
        #metadata_by_selector
          behaves like all selector methods
            when selection has no nodes
              should raise an exception
```

Ok, so we know that all of our selector methods raise the proper exception if they are called with a bunk selector. Now let's make sure we can get our metadata downloaded and structured.

Unfortunately I'm realizing that if the `ul` for our metadata is part of the post then those words get counted along with everything else, which is not what I want. I need to figure out how to exclude that content...

I could either tell my crawler to explicitly ignore that content or wrap my blog entry in an even more specific class and just select that. I guess that'll be an exercise for tomorrow :\

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Happy, Drowsy, Peaceful
- Sleep: 5.5
- Hunger: 3
- Coffee: 0


---
title: Object Oriented Scraper Backed with Tests Pt. 7
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
  - BDD
date: 2012-05-16T04:33:00.000Z
updated: 2014-12-30T07:24:17.000Z
exclude: true
---

During my last post I realized that including my metadata in the blog post as only a ul meant that all the words were being scraped as part of the keyword frequency search. After thinking about it for a while I think I'm going to give the keyword search method an optional value which it can use to ignore or delete certain nodes.

Thankfully I have my tests in place to validate what our final output should look like. Which means I'm basically hacking away at Nokogiri to get things to pass. Here's what I finally settle on:

```ruby
def words_by_selector(selector, ignored_selector = nil)
  node = nodes_by_selector(selector).first
  if ignored_selector
    ignored = node.css(ignored_selector)
    ignored.remove()
  end
  words = words_from_string(node.content)
  count_frequency(words)

  sorted = @counts.sort_by { |word, count| count }
  sorted.reverse!
  sorted.map { |word, count| "#{word}: #{count}"}
end
```

I think the code is pretty self explanatory. Moving on to the metadata we expect a Hash that looks like this:

```ruby
{
  datetime: 2012-05-13T08:03:00-07:00,
  mood: ['Happy', 'Drowsy', 'Peaceful'],
  sleep: 5.5,
  hunger: 3.0,
  coffee: 0.0
}
```

As I'm playing back and forth with the metadata selector methods I'm realizing that writing non-brittle tests is extremely difficult!

I'm noticing that some of the metadata, when broken into Strings, don't parse very well. For instance:

`Time: 8:03` splits up into `["Time", " 8", "03"]`

We can use a splat operator to clean that up a bit for us:

```ruby
def metadata_by_selector(selector)
  node = nodes_by_selector(selector).first
  metadata = {}
  node.children.each do |child|
    key, *value = child.content.split(':')
    puts "#{key}: #{value}"
  end
end
```

The above should produce something like:

```bash
Time: [" 8", "03 am"]
Mood: [" Happy, Drowsy, Peaceful"]
Sleep: [" 5.5"]
Hunger: [" 3"]
Coffee: [" 0"]
```

Close... but still not perfect. I think the best thing to do would be to write some formatter objects or functions to handle the different kinds of metadata. We'll tackle that tomorrow.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Fat, Tired, Drunk
- Sleep: 6
- Hunger: 0
- Coffee: 1


---
title: Object Oriented Scraper Backed with Tests Pt. 8
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
  - BDD
date: 2012-05-16T14:42:00.000Z
updated: 2014-12-30T07:25:30.000Z
exclude: true
---

Yesterday's I refactored my specs and crawler to support ignoring selections. While I started parsing the metadata I quickly realized that certain bits were rather specific and needed to have custom parsing methods. Today I'm going to write some format objects to help with all that.

Our metadata on the page looks like this:

```bash
Time: 7:42 am
Mood: Awake, Alert, Focused
Sleep: 6
Hunger: 0
Coffee: 0
```

Sleep, hunger and coffee are all floats, so one object could be just `FloatFormat`. Mood should produce an `Array` of objects so we could have a `CollectionFormat`. Finally time is going to combine the time listed in the metadata and the post date. We'll make a `DateTimeFormat` for that. These could all be methods of one big Format object as well but experience tells me that you need to be careful of monolithic actors that consume tons of different data types and spit out results. Those classes have a tendency to bloat very easily as project requirements change. I think it's better to produce classes which can be extended or abstracted as needs arise.

So we know _who_ is going to format but we still don't know _how_. I think I'd like to build a manifest which matches the metadata category to a format. Maybe something like this?

```
{
  'Time'    => DateTimeFormat,
  'Mood'    => CollectionFormat,
  'Sleep'   => FloatFormat,
  'Hunger'  => FloatFormat,
  'Coffee'  => FloatFormat
}
```

I could probably look at each item and "detect" what kind of format it needs but I'd rather be explicit. If, for instance, I want to add another format, it's a lot easier to just change my manifest file vs. hacking on some detection scheme. I think we can just produce this manifest file in YAML and load it in at runtime. One thing I don't like about this approach is that it specifically names our format classes. You could generalize it so that it just matches a category to the desired output data, for instance `'Coffee' => Float` but then you run into problems with flexibility. What if Coffee still needed to output a float but had to go through a different Format than Hunger or Sleep? With that in mind we'll stick to the plan already laid out.

```
time:     DateTimeFormat
mood:     CollectionFormat
sleep:    FloatFormat
hunger:   FloatFormat
coffee:   FloatFormat
```

### The Format object

I would love it if I could use the Format object as a module and just call a method on it from Crawler. It might look like this:

```ruby
def metadata_by_selector(selector)
  node = nodes_by_selector(selector).first
  metadata = {}
  node.children.each do |child|
    Tentacles::Format.insert(child, metadata)
  end
end
```

The only problem is `Format` needs to load in and parse its formats.yml file before it's any good to us. There's some interesting talk of the [Module#autoload method](http://www.subelsky.com/2008/05/using-rubys-autoload-method-to.html) but that's not quite what I need...

Seems like I can't find any good documentation on this so instead we'll make it an instance of the class. Also I'm lazy so I'm going to have that instance load its own formats.yml file. Normally I like to only have one entry point for configuration files but...whatever.

### How do I convert a string into a class name in Ruby?

Well we know we can load our YAML file but all of our format classes are going to come in as strings. I did some digging to figure out how to convert the string into an actual class that can then be instantiated. If you just want to convert a String into a class you can use `Object.const_get('Foobar').new` but that's not going to work for us since our code is wrapped in a module. To convert a string into a module class we'll need to use the name of our module: `Tentacles.const_get('DateTimeFormat').new`.

With that in mind I want to spec out a simple test that passes in string of metadata and receives a printed notification that the right formatter has been created. We'll then refactor it to actually use the formatter on the string.

```ruby
require_relative '../lib/tentacles/format'
require_relative '../lib/tentacles/date_time_format'

describe Tentacles::Format do
  describe "when asked to parse some metadata" do
    it "should create the right formatter" do
      @format = Tentacles::Format.new
      @format.parse('Time: 8:03 am').should be_an_instance_of(Tentacles::DateTimeFormat)
    end
  end
end


require 'yaml'
require_relative 'date_time_format'

module Tentacles
  class Format
    def initialize
      @categories = YAML.load(File.open(File.dirname(__FILE__) + '/formats.yml'))
    end

    def parse(data)
      category = data.split(':')[0]
      category.downcase!
      Tentacles.const_get(@categories[category]).new
    end
  end
end


module Tentacles
  class DateTimeFormat
    def initialize
      puts 'DateTimeFormat created!'
    end
  end
end
```

Now let's take it a step further so we can convert an actual time into a DateTime object. Here's our updated spec:

```ruby
require_relative '../lib/tentacles/format'
require 'date'

describe Tentacles::Format do
  describe "when asked to parse some metadata" do
    it "should create the right formatter" do
      @format = Tentacles::Format.new
      @format.parse('Time: 8:03 am').should be_an_instance_of(Date)
    end
  end
end
```

To pull this off we'll need the help of at least 2 new gems: [Chronic](http://rubygems.org/gems/chronic) and [ActiveSupport](http://rubygems.org/gems/activesupport). Chronic is a natural language parser which can convert strings into useable timestamps. ActiveSupport is a library of extensions originally created for Rails which have been abstracted into a general purpose toolset. We're going to combine these two gems to turn the phrase "8:03 am" into a Ruby DateTime.

Gotta first update the Gemfile with our new dependencies and run `bundle install`.

```ruby
source 'https://rubygems.org'

gem 'rspec', '2.9.0'
gem 'nokogiri', '~>1.5.2'
gem 'awesome_print', '~>1.0.2'
gem 'fakeweb', '~>1.3.0'
gem 'chronic', '~> 0.6.7'
gem 'activesupport', '~> 3.2.3'
```

Next we bang out a quick parse method inside of DateTimeFormat. Our Tentacles::Format is going to delegate its parse call to whichever subordinate formatter it creates. Code speaks louder than words:

```ruby
require 'yaml'
require_relative 'date_time_format'

module Tentacles
  class Format
    def initialize
      @categories = YAML.load(File.open(File.dirname(__FILE__) + '/formats.yml'))
    end

    # Create a formatter based on the content of the passed
    # in data. Delegate the parse call to this new formatter
    def parse(data)
      category, *content = data.split(':')
      category.downcase!
      formatter = Tentacles.const_get(@categories[category]).new
      formatter.parse(content)
    end
  end
end


require 'chronic'
require 'active_support/core_ext/string/conversions.rb'

module Tentacles
  class DateTimeFormat
    def initialize
      puts 'DateTimeFormat created!'
    end

    def parse(content)
      Chronic.parse(content.join(':')).to_datetime
    end
  end
end
```

With all that in place our test should pass. Nice!!!!!! We're well on our way to processing the remaining metadata. Tomorrow I'll whip up our other formats and figure out how to pull the date out of a blog post so we can combine that with the time to get a proper DateTime.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Awake, Alert, Focused
- Sleep: 6
- Hunger: 0
- Coffee: 1


---
title: Object Oriented Scraper Backed With Tests Pt...9?
tags:
  - Ruby
  - Chain
  - RSpec
date: 2012-06-18T05:43:00.000Z
updated: 2015-01-02T08:54:25.000Z
exclude: true
---

I just spent a few hours talking to my friend [Derek](http://derekbradley.com/)([@derekebradley](https://twitter.com/#!/derekebradley)) about Ruby and it occured to me that I never finished this scraper project. We got awfully far with it but then it kind of died on the vine. [Thankfully,](http://robdodson.me/blog/2012/05/06/object-oriented-scraper-backed-with-tests/)[I](http://robdodson.me/blog/2012/05/07/object-oriented-scraper-backed-with-tests-pt-2/)[wrote](http://robdodson.me/blog/2012/05/08/object-oriented-scraper-backed-with-tests-pt-3/)[it](http://robdodson.me/blog/2012/05/11/object-oriented-scraper-backed-with-tests-pt-4/)[all](http://robdodson.me/blog/2012/05/12/object-oriented-scraper-backed-with-tests-pt-5/)[down.](http://robdodson.me/blog/2012/05/13/object-oriented-scraper-backed-with-tests-pt-6/)[down.](http://robdodson.me/blog/2012/05/15/object-oriented-scraper-backed-with-tests-pt-7/)[down.](http://robdodson.me/blog/2012/05/16/object-oriented-scraper-backed-with-tests-pt-8/)

The fact of the matter is I didn't know where to take the data. I didn't have a design or a layout that I could put it all into. I want to change all that. I want to turn this into something useful. But first I have to make sense of all the code that was written so many weeks ago.

## Tests as documentation...bullshit.

Ok ok. I should say it's _total_ bullshit to call your tests the documentation because they are helpful. But the fact of the matter is you can get so crafty with RSpec that it makes the tests difficult to read in a useful way. I'm not saying they're illegible, it's just that they leverage features which adds to their thought deficit. Before you go off saying that I wrote them wrong and tests should be all the documentation you need...shutup. They're helpful but I would love it if I had written a bit of Markdown Readme to go with all this...

## Explain yourself

Let's see if I can regurgitate what this thing currently does in plain English.

- There's a config.yml file. It says what page to scrape, what the CSS selector for a post looks like and what the CSS selector for metadata looks like. The metadata is the list at the bottom of every page listing the time, amount of sleep, coffee, etc.

- There's a command line object, `tentacles`. It initiates `runner.rb`. `Runner` creates an instance of `Options`. `Options` loads the config.yml file and parses it, turning its properties into members of the options object.

- It actually doesn't do anything else beyond that. `runner.rb` stops right there but we have Rspec tests which fake data and check to see if our other classes work. Those other classes are...

- `crawler.rb` should be the real meat of our program. Funny, seeing as how I wrote all this, that I totally can't remember who does what...

- `crawler.rb` has two primary methods: `words_by_selector` and `metadata_by_selector`.

- `words_by_selector` returns an array of words and the number of times they've occurred. This array should be in order from most used to least used.

- `metadata_by_selector` returns the content of one of our metadata lists.... I think.

## Make it work

With Tim Gunn's mantra we're gonna make this thing work. The tests verify that everything should be at least somewhat functioning. Since I'm a little drunk I can't do a _super_ deep dive but let's see if we can get our runner to write out the contents of `words_by_selector` to a text file.

```ruby
require 'yaml'
require_relative 'options'
require_relative 'crawler'

module Tentacles
  class Runner

    def initialize(config)
      @options = Tentacles::Options.new(config)
    end

    def run
      @crawler = Tentacles::Crawler.from_uri(@options.uri)
      output = @crawler.words_by_selector(@options.post_selector, 'ul:last-child')
      File.open("output.txt", "w") do |file|
        output.each do |line|
          file.puts line
        end
      end
    end
  end
end
```

To get this working I `cd` into the lib/ folder where all the code lives and do an `irb -I .` so I can require the local files.

```ruby
require 'runner'
runner = Tentacles::Runner.new('config.yml')
runner.run
```

After doing that we _do_ get a text file, with copy that looks somewhat correct...

```bash
we: 8
to: 8
npm: 6
should: 5
package: 4
our: 4
compliment: 4
git: 3
0: 3
4: 3
need: 3
2: 3
it: 3
node_modules: 3
the: 3
have: 3
be: 3
json: 2
your: 2
any: 2
dependencies: 2
module: 2
and: 2
node: 2
add: 2
xml2json: 2
how: 2
s: 2
in: 2
you: 2
json1: 2
an: 2
3: 2
awesome: 2
version: 2
```

It looks like the copy from my most recent blog post, plus or minus a few words. Horrible regex aside it _kinda_ works and that's what we're after. Maybe tomorrow we can turn it into some JSON :D Till then. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Drunk, Sleepy
- Sleep: 3
- Hunger: 4
- Coffee: 1


---
title: Object Oriented Scraper Backed with Tests
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
date: 2012-05-07T01:09:00.000Z
updated: 2014-12-30T06:53:11.000Z
exclude: true
---

_I just drank a ton of coffee and I'm blasting music in my headphones so this post my bit a bit more scatter-shot than most since I can't really focus :]_

Yesterday I managed to build a pretty naive scraper using Nokogiri which would count how often each word was used in the first 10 posts of this blog. Basically scraping the home URL of the site and grabbing everything inside of the `div.entry-content` selector.

Today I want to convert it into a more OO library so it's a bit more modular and reusable. I also want to back everything with RSpec tests to get into the practice. While it won't be true TDD I'll try to write the tests for the library before putting the classes together.

### Design Decisions

I'm calling the project `Tentacles` for now since it relates to my Octopress blog. I'm still trying to figure out exactly what the end product will be. So far I know that I want it to produce a page of statistics about my blog. I figure that for now it can be just one page with stats that cover the entire blog. In the future I might want to make it more granular so that each post can get special attention. For now it's easiest for me if I just think of the whole blog as a big data set and this page as the output.

I also know that since Octopress is heavily integrated with Rake that I'd probably like to trigger the process as part of a Rake task. IMO the logical place would be to amend Octopress' `rake generate` so that it not only builds our static pages but it also produces our statistics. Down the line I might want to change this but for now it seems OK to me.

Finally I figure I'll want to have some kind of configuration file so the parser knows what to look for.

For now I'm fine with the output being a plain text file with a few stats on it. We'll work on making the output more robust after we've figure out the basics of our module and integrated it with Rake.

Here's the folder structure I'm using:

```
- tentacles

- bin      *<--- contains our executable program*
- tentacles

- lib      *<--- contains our library of classes*
- crawler.rb
- config.yml
- runner.rb

- spec      *<--- contains our RSpec tests*
- crawler_spec.rb
- runner_spec.rb
```

### Playing with IRB

One of the first issues I've run up against is figuring out how to play with my classes in IRB. Being new to Ruby I tend to build everything in one folder. Since this is my first time embarking on some actual modular structure I'm unsure how to require or include a module in IRB. What I've settled on for now is to `cd` into my lib folder and use the `-I` flag to set the `$LOAD_PATH`.

Here's the `grep` from the irb man page.

```bash
-I path        Same as `ruby -I' .  Specifies $LOAD_PATH directory
```

So we end up in `tentacles/lib` and call IRB like so:

```bash
irb -I .
```

And now we can require our classes

```bash
irb -I .
1.9.3-p125 :001 > require 'runner'
=> true # sweeet
```

### Skeletons

I'm going to create a basic `Runner` class so we can verify that the stuff in IRB is working properly.

Here's what I've thrown together:

```ruby
module Tentacles
  class Runner

    def initialize(config)
      # Load in our config file
    end

    def run
      puts 'run run run!'
    end

  end
end
```

and here's how we test it in IRB.

```ruby
irb -I .
require 'runner'

runner = Tentacles::Runner.new('foo')
  => #<Tentacles::Runner:0x007faeb284ec30>

runner.run
run run run!
  => nil
```

Looks good so far!

### Tests

OK on to the tests then. I'm going to be using RSpec so if you don't have that setup already you should do a `gem install rspec`.

I'm a total noob when it comes to testing so let me take my best stab at this...

I'm going to write tests for `Runner` first since it's already stubbed out. I want to make sure of the following things:

- It should respond to the `run` method
- When I pass it an invalid config file it should throw an error
- When I pass it an empty string or nil in place of config it should throw an error

For now that's the only public API this object has. Pretty simple but of course I'm immediately running into issues. Here's what my spec looks like:

```ruby
require_relative '../lib/tentacles/runner'

describe Tentacles::Runner do

  before do
    @runner = Tentacles::Runner.new('config.yml')
  end

  subject { @runner }

  it { should respond_to(:run) }

  describe "when passing the config file" do
    it "should raise an error if the config file is missing" do
      expect { runner = Tentacles::Runner.new('') }.to raise_error(Errno::ENOENT)
      expect { runner = Tentacles::Runner.new(nil) }.to raise_error(TypeError)
    end
  end
end
```

and here's what runner.rb looks like:

```ruby
require 'yaml'

module Tentacles
  class Runner

    def initialize(config)
      @config = YAML.load(File.open(config))
    end

    def run
      'Runner should be running'
    end
  end
end
```

aaaaaand here's the error:

```
1) Tentacles::Runner
      Failure/Error: @runner = Tentacles::Runner.new('config.yml')
      Errno::ENOENT:
        No such file or directory - config.yml
      # ./lib/tentacles/runner.rb:10:in `initialize'
      # ./lib/tentacles/runner.rb:10:in `open'
      # ./lib/tentacles/runner.rb:10:in `initialize'
      # ./spec/runner_spec.rb:8:in `new'
      # ./spec/runner_spec.rb:8:in `block (2 levels) in <top (required)>'
```

It looks like the test is bailing out on my `before` block when I try to create an instance of runner and pass it the config file. Folks on IRC are kind enough to point out that `require` and methods run in RSpec don't necessarily have the same scope so trying `../lib/tentacles/config.yml` won't work either. The solution is to use `File.dirname(__FILE__) + '/../lib/tentacles/config.yml'`. Since I don't want my line lengths to get any longer I define a helper module and give it a `relative_path` method which should spit out `File.dirname(__FILE__)`.

```ruby
module Helpers
  def relative_path
    File.dirname(__FILE__)
  end
end
```

After I include it my tests look like this:

```ruby
require_relative '../lib/tentacles/runner'
require 'helpers'

describe Tentacles::Runner do
  include Helpers

  before do
    @runner = Tentacles::Runner.new(relative_path + '/../lib/tentacles/config.yml')
  end

  subject { @runner }

  it { should respond_to(:run) }

  describe "when passing the config file" do
    it "should raise an error if the config file is missing" do
      expect { runner = Tentacles::Runner.new('') }.to raise_error(Errno::ENOENT)
      expect { runner = Tentacles::Runner.new(nil) }.to raise_error(TypeError)
    end

    it "should raise an error if the config file is invalid" do
      expect { runner = Tentacles::Runner.new(relative_path + '/mocks/invalid_yaml.yml') }.to raise_error(Psych::SyntaxError)
    end
  end

end
```

You'll also notice I added a test for an invalid yml file. Basically I created a mocks folder and tossed in a yaml file that's full of gibberish. Probably not the best way to mock stuff but whatever, i'm learning!

With that all of our tests for `Tentacles::Runner` are passing. Yay! But now it's 10:37pm and I gotta call it a night. We'll continue tomorrow by writing tests for `Tentacles::Crawler`. See ya!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Wired, Lazy
- Sleep: 7.5
- Hunger: 0
- Coffee: 2


---
title: Outputting JSON from Ruby
tags:
  - Ruby
  - Chain
  - JSON
date: 2012-06-18T15:19:00.000Z
updated: 2014-12-31T00:05:28.000Z
exclude: true
---

[Last night](http://robdodson.me/blog/2012/06/17/object-oriented-scraper-backed-with-tests-pt-dot-dot-dot-9/) I got the scraper to write an output.txt file which listed all the contents of `words_by_selector`. Today I want to make it write to JSON instead of plain text and I want to back it with some tests.

## Updating our tests

Our current test for `words_by_selector` looks like this:

```ruby
it "should produce the correct Array of keywords" do
  expected_array = ['hello: 3', 'world: 2', 'foobar: 1']
  actual_array = @crawler.words_by_selector(@options[:post_selector], @options[:ignored_post_selector])
  actual_array.should eq(expected_array)
end
```

We're going to need to break that sucker so it'll produce something more like this:

```ruby
it "should produce the correct Hash of keywords" do
  expected_hash = {
      word_count: [
        {
          word: 'hello',
          count: 3
        },
        {
          word: 'world',
          count: 2
        },
        {
          word: 'foobar',
          count: 1
        },
      ]
    }

  actual_hash = @crawler.words_by_selector(@options[:post_selector], @options[:ignored_post_selector])
  actual_hash.should eq(expected_hash)
end
```

And we update `words_by_selector` to look like this:

```ruby
def words_by_selector(selector, ignored_selector = nil)
  node = nodes_by_selector(selector).first
  if ignored_selector
    ignored = node.css(ignored_selector)
    ignored.remove()
  end
  words = words_from_string(node.content)
  count_frequency(words)

  sorted = @counts.sort_by { |word, count| count }
  sorted.reverse!
  sorted.map! do |word, count|
    { word: word, count: count }
  end
  { word_count: sorted }
end
```

Our new test should pass. Feel free to flip one of the numbers in the expected_hash to 99 or something to see it fail.

Now let's make sure the runner takes the content out of the crawler and writes it to a JSON file.

```ruby
it "should create a directory for our output" do
  @runner.run
  Dir.exists?('../../output').should be_true
end

it "should output the correct JSON" do
  @runner.run
  File.open("../../output/word_count.json") do |file|
    file.each_line do |line|
      puts line
    end
  end
end
```

And in runner.rb...

```ruby
def run
  @crawler = Tentacles::Crawler.from_uri(@options.uri)
  output = @crawler.words_by_selector(@options.post_selector, 'ul:last-child')

  Dir.mkdir('../../output') unless Dir.exists?('../../output')

  File.open("../../output/word_count.json", "w") do |file|
    file.puts JSON.pretty_generate(output)
  end
end
```

And there we go. Our first decent output from the crawler :D -Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Awake
- Sleep: 6
- Hunger: 4
- Coffee: 0


---
title: Pangrams in Ruby
tags:
  - Ruby
  - Chain
date: 2012-05-10T06:15:00.000Z
updated: 2014-12-30T07:01:38.000Z
---

I'm a big fan of sites like [RubyQuiz](http://www.rubyquiz.com/) and [CodeEval](http://www.codeeval.com/). In my opinion doing short puzzles and brain-teasers is a great way to explore a language. Here's one such puzzle taken from CodeEval which asks that you devise a program to read in a file, parse each line and decide if it is a pangram or not.

> The sentence 'A quick brown fox jumps over the lazy dog' contains every single letter in the alphabet. Such sentences are called pangrams. You are to write a program, which takes a sentence, and returns all the letters it is missing (which prevent it from being a pangram). You should ignore the case of the letters in sentence, and your return should be all lower case letters, in alphabetical order. You should also ignore all non US-ASCII characters.In case the input sentence is already a pangram, print out the string NULL

Here's my first attempt. Hopefully I can come back to this post in a few weeks and try it again in a bit more elegant fashion :)

```ruby
File.open(ARGV[0]).each_line do |line|

  missing_letters = []

  unless line.chomp.empty?
    line.chomp!
    line.downcase!
    ('a'..'z').each do |l|
      if line.index(l).nil?
        missing_letters << l
      end
    end
  end

  if missing_letters.empty?
    puts "NULL"
  else
    puts missing_letters.join('')
  end
end
```

And here's some input:

```
A quick brown fox jumps over the lazy dog
A slow yellow fox crawls under the proactive dog
AbC
```

To run it from the command line you'll need to pass in the path to the sentece file as an argument. Here's what it would look like if `pangrams.rb` and `sentences.txt` were in the same folder:

```
ruby pangrams.rb sentences.txt

# outputs...
NULL
bjkmqz
defghijklmnopqrstuvwxyz
```

Play around with this, throw some different sentence combinations at it to see what it spits out. Then try to write your own implementation. A good next step would be to modify the script so it can support empty lines in the text file.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)


---
title: Penner easing equations with GFX and CSS3
tags:
  - Chain
  - CSS3
  - GFX
  - jQuery
date: 2012-05-27T07:07:00.000Z
updated: 2014-12-30T07:54:45.000Z
exclude: true
---

This is going to be a bit of lightning post because it's rather late and I need to get to bed. I spent most of the day either eating dim sum or hanging out at the [SF Creative Coders BBQ](http://www.meetup.com/San-Francisco-Creative-Coders/) so I've neglected my blogging duties a bit.

I have something which will hopefully be useful for some folks who are getting into CSS3 animations with the Gfx plugin for jQuery. [I've blogged a bit about Gfx before](http://robdodson.me/blog/2012/05/22/css3-transitions-with-gfx/) and one of the first things I noticed was the lack of a built in easing library. Coming from the Flash world where [TweenLite is king](http://www.greensock.com/tweenlite/) I've grown very accustomed to using Robert Penner's easing equations for great effect. The same equations are used by the jQuery framework to do its animations. Thankfully [Matthew Lein was kind enough to convert those over to cubic-beziers](http://matthewlein.com/ceaser/) for those of us doing CSS3 animations. Since Gfx accepts cubic-beziers I moved the equations from Matthew's tool into an AMD compliant module and [put it up on Github.](https://github.com/robdodson/amd-css3-ease) It's very simple so if AMD isn't your thing you can just rip those parts out :D

Example usage looks something like this:

```js
// After requiring the ease module and
// passing it into your View with the
// name 'Ease'

this.$el.gfx(
  {
    translateY: '300px'
  },
  {
    duration: 500,
    easing: Ease.easeInExpo
  }
);
```

Give it a shot and consider donating to Matthew's project or buying Robert Penner like a million beers!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Tipsy
- Sleep: 7
- Hunger: 0
- Coffee: 0


---
title: Playing with Ruby Dates
tags:
  - Ruby
  - Chain
  - Dates
  - Chronic
  - Active Support
date: 2012-04-28T14:30:00.000Z
updated: 2014-12-30T06:20:32.000Z
---

One of [my previous projects](https://vimeo.com/40633070) involved a ton of work using Flash's built in Date object. We ended up rolling our own Calendar library which was both tedious and time consuming to debug. Now that I'm digging into Ruby for my newest project, I wanted to see what features the language has to offer. So far I'm _really_ impressed and that's after only a few hours of exploration. I'll detail some of the tricks I've learned along the way so hopefully other newcomers can benefit.

### Ruby Date Object Basics

We can start off by firing up IRB and requiring the `date` class. Let's do a really simple example first and just generate today.

```ruby
require 'date'

today = Date.today
=> #<Date: 2012-04-28 ((2456046j,0s,0n),+0s,2299161j)>
```

Now lets try a bit of Ruby's sugar to generate tomorrow's date.

```ruby
tomorrow = today + 1
=> #<Date: 2012-04-29 ((2456047j,0s,0n),+0s,2299161j)>
```

Pretty straightforward, right? Since there is usually more than one way to do something in Ruby we could have achieved the same results using any of the following.

```ruby
today.succ
=> #<Date: 2012-04-29 ((2456047j,0s,0n),+0s,2299161j)>

today.next
=> #<Date: 2012-04-29 ((2456047j,0s,0n),+0s,2299161j)>

today.next_day
=> #<Date: 2012-04-29 ((2456047j,0s,0n),+0s,2299161j)>
```

As [someone on StackOverflow pointed out](http://stackoverflow.com/questions/962544/one-line-hash-creation-in-ruby): `Date` objects are also `Comparable`, so you can construct a `Range`. If you wanted to collect every day from the previous week into an array you could do the following:

```ruby
last_week = today - 7
every_day_last_week = (last_week..today).to_a
```

or...

```ruby
today.downto(today - 7).to_a
```

There are also some cute booleans tossed into the mix for figuring out the day of the week.

```ruby
today.friday?
=> false

today.saturday?
=> true
```

### How to Use Chronic

[Chronic](https://github.com/mojombo/chronic/) is a Ruby natural language date/time parser written by [Tom Preston-Werner](http://tom.preston-werner.com/) ([@mojombo](https://twitter.com/#!/mojombo)) which takes surprisingly human readable text and converts it to dates.

Covering everything that Chronic supports could take a while so definitely go check out the docs. Below is just a quick example to demonstrate how cool it is.

```ruby
require 'chronic'

Chronic.parse('yesterday')
=> 2012-04-27 12:00:00 -0700

Chronic.parse('yesterday').to_date
=> #<Date: 2012-04-27 ((2456045j,0s,0n),+0s,2299161j)>

Chronic.parse('last monday')
=> 2012-04-23 12:00:00 -0700

Chronic.parse('3 months ago this friday at 3:45pm')
=> 2012-02-04 15:45:00 -0800
```

### How to Use Active Support for Dates

Active Support is a library extracted from Rails which adds a ton of sugar to the Ruby language. As the author's describe it:

> Active Support is a collection of various utility classes and standard library extensions that were found useful for Rails. All these additions have hence been collected in this bundle as a way to gather all that sugar that makes Ruby sweeter.

It's broken into several pieces so you can choose to load only the parts that you'll actually be using. _I'm going to write an upcoming article on Active Support. For now we'll just require it all._

```ruby
require 'active_support/all'

t = Date.today
=> Sat, 28 Apr 2012

t.class
=> Date
```

You'll notice that Active Support has changed the way our date's `to_s` is formatted so it's more human readable. It also added shortcuts for creating Dates on either side of today.

```ruby
yesterday = Date.yesterday
=> Fri, 27 Apr 2012

tomorrow = Date.tomorrow
=> Sun, 29 Apr 2012
```

Included as well are some nice convenience booleans: `past?`, `today?`, and `future?`

```ruby
tomorrow.future?
=> true
```

If you've ever had to write a Calendar that can support weeks, especially those that straddle two different months, you'll appreciate the simplicity of the helpers Active Support adds.

```ruby
today = Date.today
=> Sat, 28 Apr 2012

today.beginning_of_week
=> Mon, 23 Apr 2012

today.next_week
=> Mon, 30 Apr 2012

# You can also choose to make the week start on an arbitrary day, like Sunday
today.beginning_of_week(:sunday)
=> Sun, 22 Apr 2012
```

We aren't limited to weeks though. Active Support adds methods for days, months and years. For example:

```ruby
today.years_ago(10)
=> Sun, 28 Apr 2002
```

By extending `FixNum` to support additional Date methods certain operations become much more readable.

```ruby
today + 1.year
=> Sun, 28 Apr 2013
```

These extensions are referred to as `durations`[in the documentation](http://guides.rubyonrails.org/active_support_core_extensions.html).

Which brings us back to one of our first examples of finding the date 7 days ago. With Active Support it's as easy as...

```ruby
7.days.ago
=> 2012-04-21 08:44:02 -0700
```

Pretty cool! Active Support adds _A LOT_ more than just Date helpers and I'll try to cover it more in some future articles. Definitely [check out the documentation](http://guides.rubyonrails.org/active_support_core_extensions.html) (you can [skip to the Date section](http://guides.rubyonrails.org/active_support_core_extensions.html#extensions-to-date) since it's pretty immense).

Source:

[http://stackoverflow.com/questions/962544/one-line-hash-creation-in-ruby](http://stackoverflow.com/questions/962544/one-line-hash-creation-in-ruby)
[http://www.developer.com/open/article.php/3729206/Telling-Time-with-Ruby.htm](http://www.developer.com/open/article.php/3729206/Telling-Time-with-Ruby.htm)
[http://guides.rubyonrails.org/active_support_core_extensions.html](http://guides.rubyonrails.org/active_support_core_extensions.html)

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

[Photo credit](https://www.flickr.com/photos/125167502@N02/14363795854/in/set-72157645053557074)


---
title: Publish your Node library to npm
tags:
  - Chain
  - Node
  - npm
date: 2012-06-17T06:06:00.000Z
updated: 2014-12-31T00:00:41.000Z
---

Alright, [contuing from yesterday](http://robdodson.me/blog/2012/06/15/how-to-run-a-node-script-from-the-command-line/) we want to take our little Node module and make it available to the world as a really awesome command line tool.

The first thing we need to do is register an NPM account.

`npm adduser`

Fill in your credentials and it should be ready to go.

If we have any dependencies they should be added to our `package.json` file. Our simple `compliment` program doesn't need any extra libraries but we'll add `xml2json` just to demonstrate how it's done.

```json
{
  "name": "compliment",
  "version": "0.0.1",
  "description": "Tell us how awesome we are.",
  "preferGlobal": "true",
  "bin": { "compliment": "compliment.js" },
  "author": "Rob Dodson",
  "dependencies": {
    "xml2json": "0.2.4"
  },
  "engines": { "node": "*" }
}
```

Since we've changed our `package.json` we need to run `npm link` again to install the dependency. After that you should have a `node_modules/` folder in your project root.

Let's put this baby under version control!

```bash
git init
echo node_modules/ >> .gitignore # node_modules should be installed by npm
git add .
git commit -am 'Initial commit'
```

Final step:

```bash
npm publish
```

# BOOMJAMS! We have us an npm module! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Hyper
- Sleep: 5
- Hunger: 1
- Coffee: 1


---
title: Quick Spider Example
tags:
  - Ruby
  - Chain
  - Nokogiri
  - Mechanize
date: 2012-06-21T08:27:00.000Z
updated: 2014-12-31T00:08:09.000Z
exclude: true
---

```ruby
require 'mechanize'

# Create a new instance of Mechanize and grab our page
agent = Mechanize.new
page = agent.get('http://robdodson.me/blog/archives/')



# Find all the links on the page that are contained within
# h1 tags.
post_links = page.links.find_all { |l| l.attributes.parent.name == 'h1' }
post_links.shift



# Follow each link and print out its title
post_links.each do |link|
    post = link.click
    doc = post.parser
    p doc.css('.entry-title').text
end
```

Having a horrible time getting anything to run tonight. The code from above is a continuation from yesterday's post except this time we're finding every link on the page, then following that link and spitting out its title. Using this formula you could build something entirely recursive which acts as a full blown spider.

Unfortunately getting this to integrate into the existing app is not working for me tonight. Coding anything after 11 pm is usually a bad call, so I'm going to shut it down and try again in the morning.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Annoyed
- Sleep: 6
- Hunger: 0
- Coffee: 1


---
title: Regarding the broken promise of Web Components
date: 2017-03-16T01:01:38.000Z
updated: 2017-06-18T05:25:31.000Z
---

After reading an article titled [The broken promise of Web Components](https://dmitriid.com/blog/2017/03/the-broken-promise-of-web-components/) and typing out the world's longest comment response I figured it'd be better if I try to distill my thoughts into a blog post. I'll address each of the points raised by the author as their own section.

## After years of effort Web Components have been a waste of time

Something I've learned from working with the Chrome team is that browser makers view shipping something in the platform very differently from the web dev audience. Once you ship something in the browser, the assumption is it's there "forever", at a minimum several years, possibly decades. This means big changes are often undertaken in a slow process that to outside observers feels downright glacial.

Web Components are a big change and as a result they've moved pretty slowly. Along the way some parts got dropped or reworked but that's a good thing. Using an ES6 Class instead of building a prototype Object to create a Custom Element is a much nicer approach, but required revising the Custom Elements spec. It's frustrating because it delayed native Custom Element support for folks, but the final product is better.

I'd still like things to move faster, but in 2016 we saw Safari add support for Custom Elements and Shadow DOM, and it looks like Firefox may be on track to do the same in 2017 (fingers crossed). It's taken a (very) long time, but I do think we're getting close to having full cross-browser support soon.

## React built a better mouse trap

React is awesome and drives a ton of discussion among folks who work on Web Components. My perspective is that the ideas in React and the ideas in Web Components are not mutually exclusive. Instead, we should roll those patterns into how we build components and make sure we have a good story for interoperability.

Whether you choose to use React or Web Components (or both) I think ultimately comes down to personal style and project constraints. Let's say in another year or two Web Components become fully supported and you're asked to build a UI library to scale across a huge company with tons of developers on different stacks. Web Components would fit that job very well. Or let's say you're a marketing agency making a site for a product launch. There's only one team invovled and everyone is already familiar with React. It would make sense to just use React for the whole thing. There are a lot of scenarios that fall in between these two examples but really it comes down to using the right tool for the job.

As a bit of an aside, I also feel like a lot of folks often overlook the fact that libraries like [Amp](https://www.ampproject.org) are in fact Web Components (specifically Custom Elements), and Amp is incredibly successful. Their elements are performant and meet a need for publishers. Often times the Web Components discussion descends into Framework X versus Framework Y, but taking a step back reveals there are other applications for these standards that we may have overlooked.

## The DOM is slow

Abstractions like React/JSX which help you manage your DOM updates are great, but they don't come free of cost. A major bottleneck for page load times is large javascript bundles being downloaded which then take a very long time to parse on underpowered mobile hardware. Here's a great talk on the subject by my teammate Sam Saccone: [https://www.youtube.com/watch?v=RWLzUnESylc](https://www.youtube.com/watch?v=RWLzUnESylc)

The important takeaway is that React (or really any library that provides an abstraction over the DOM, including Polymer) is not a silver bullet. If you end up shipping megabytes of slow-to-parse javascript, then you've just shifted the problem around. The fix is to make sure you're splitting up your bundles, and only loading what you need, when you need it.

## Using JSX and Virtual DOM is nicer than using DOM APIs directly

The DOM APIs are meant to be low level tools that we can build abstractions on top of. JSX is a great tool but the use case cited by the author (JSX + ReactDOM) is just sugar over the native DOM APIs. As a result, there's no reason why you can't use JSX with Web Components, and libraries like [SkateJS](https://github.com/skatejs/skatejs) do this today.

## There's no standardized data binding system

A frustration cited in the blog post is that there's no standardized data binding system and that Polymer had to invent their own. Originally there *was* a proposed standard, called [Model Driven Views](https://github.com/toolkitchen/mdv), and (if I understand my history correctly) this is what Polymer's binding system was originally based on. But this proposal never caught on. I've heard anecdotally that it was too difficult to get the various stakeholders (including framework authors) to agree on exactly *how* data binding should work in the platform.

Today many developers prefer the look of JSX to template bindings (MDV style) and with things like Observables and ES6 Proxies on the horizon, I'm not sure what this space will look like in a few years. It may just be too volatile to standardize right now. Competition in this space is a good thing though. Over time it helps us zero in on a solution that makes everyone happy.

## Working with string attributes is annoying

Because a Custom Element is really just a class instance, you can (and should) provide a properties interface using ES6 class getters/setters. That way you don't have to rely on attributes for anything other than initial configuration (if you want to). [I wrote up a blog post on how to do this here](https://medium.com/dev-channel/custom-elements-that-work-anywhere-898e1dd2bc48#.5rnqw871f).

This means properties (not attributes) can be the source of truth for your element. And libraries like Angular2 already support this in their binding system when communicating with Web Components.

Evangelizing component authoring best practices that use this approach is something I'm currently pursuing along with the help of my teammates so stay tuned for more in this department :)

## Wrapping up

I completely understand the frustration expressed by the author in this post. As someone working on Web Components for years (and years) at this point I'm like "OMG CAN WE PLEASE BE DONE SOON!" But I'm actually more excited for the work I'm doing this year than I was in 2016.

I think we're finally getting on solid footing when it comes to browsers shipping native implementations. The standards have stopped moving around so we can start publishing best practices. And folks are taking Web Components in new and interesting directions. I've already mentioned [SkateJS](https://github.com/skatejs/skatejs), but just the other day I discovered [Switzerland](https://github.com/Wildhoney/Switzerland), and the Polymer team is close to releasing Polymer 2.0. Also the Amp team just wrapped up a [two day conference](https://www.ampproject.org/amp-conf-2017/) where they showed off all the cool stuff they've been working on ([videos available on their YouTube channel](https://www.youtube.com/channel/UCXPBsjgKKG2HqsKBhWA4uQw)).

So yeah, as crazy as it sounds given how long things have taken, I think 2017 is going to be a good year for Web Components. There are still hard problems to tackle but I think we'll get there. And just like any tool, the final result won't be a panacea, but it will solve real problems and serve as a building block to address future issues in the platform.


---
title: Repeating Templates in Polymer
tags:
  - Web Components
  - Template
  - Polymer
date: 2013-11-12T23:14:00.000Z
updated: 2015-01-02T05:26:38.000Z
exclude: true
---

I ran into a little issue this afternoon working with templates in Polymer and I wanted to quickly jot down my thoughts in case others bump up against this.

## Bindings

Bindings allow you to easily pipe some data into your markup from a JavaScript object. If you've worked with a library like Mustache or Handlebars before then they should feel familiar.

In Polymer land, the `<template>` tag has been extended so it supports a few handy binding attributes. These include `bind`, `repeat`, `if`, and `ref`.

## How Not to Do It

Because every Polymer element starts off with a template inside of it, I figured I could write my element like this:

```html
<polymer-element name="polymer-letters">
  <template repeat="&#123;{ letter in letters }}"> &#123;{ letter }} </template>
  <script>
    Polymer('polymer-letters', {
      letters: ['a', 'b', 'c']
    });
  </script>
</polymer-element>
```

But unfortunately that does not work #sadtrombone.

## The Right Way

Polymer uses the first `template` element to create Shadow DOM, so if you want to use a binding **you'll need to nest it _inside_ another template.**

Our updated example would look like this:

```html
<polymer-element name="polymer-letters">
  <template>
    <template repeat="&#123;{ letter in letters }}">
      &#123;{ letter }}
    </template>
  </template>
  <script>
    Polymer('polymer-letters', {
      letters: ['a', 'b', 'c']
    });
  </script>
</polymer-element>
```

And [here it is running on CodePen](http://codepen.io/robdodson/pen/wxrqf).

I mentioned this to Eric Bidelman and he opened [a ticket to improve the docs](https://github.com/Polymer/docs/issues/191), so keep an eye out for that. Hope this helps some of you that may have been stuck :) This has been fixed in the latest Polymer docs. yay!


---
title: 'RequireJS: Embracing the Awesomness of AMD Modules'
description: >
  Over the past few weeks I put together this talk for my team at GE to help get 
  everyone on the same page with AMD modules. I figured it'd be cool if I removed
  any GE specific stuff and open sourced the presentation, so here it is!
tags:
  - RequireJS
  - AMD
  - Talks
date: 2013-03-22T04:57:00.000Z
updated: 2014-12-31T01:22:13.000Z
---

Over the past few weeks I put together this talk for my team at GE to help get
everyone on the same page with AMD modules. I figured it'd be cool if I removed
any GE specific stuff and open sourced the presentation, so here it is!

<iframe width="100%" height="400" src="https://www.youtube.com/embed/vWGuaZOTR4U" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

The video is around 35 minutes long and there's a slide deck available on Github
that has clickable links and whatnot. Enjoy!

[Slidedeck on Github](https://github.com/robdodson/requirejs-presentation)


---
title: Ruby Objects and Dot Syntax
tags:
  - Ruby
  - Chain
  - Dates
date: 2012-05-01T14:37:00.000Z
updated: 2014-12-30T06:25:03.000Z
---

Coming from JavaScript I'm very accustomed to doing something like this:

```js
var person = { name: 'Rob', city: 'San Francisco' };

console.log(person.city); // 'San Francisco'
```

Using dot syntax to access a `Hash` is second nature to me. That's why I was surprised when I ran into the following error yesterday while writing some Ruby.

```ruby
person = {name: 'Rob', city: 'San Francisco'}
=> {:name=>"Rob", :city=>"San Francisco"}

puts person.city

NoMethodError: undefined method `city' for {:name=>"Rob", :city=>"San Francisco"}:Hash
```

"Hmm, weird," I thought. I know I've seen dot syntax used in Ruby before..what gives?

### Dot Syntax and the Ruby Hash Object

As it turns out Ruby does not support dot syntax for the `Hash` object. If I had wanted to access the `city` property from my previous example I should have done it using the symbol key like so:

```ruby
person[:city]
=> "San Francisco"
```

There are a few data structures that are very similar to `Hashes` and seeing those used in the wild perhaps threw me off. So I figured I'd write a post about the do's and dont's of dot syntax and how different object types react to it.

#### Class

The first and most obvious one is the `Class` object. Really I'm talking about instances of a `Class` here, for example an instance of class `Person` might have a `city` attribute. Here's what that would look like.

```ruby
class Person
  def initialize(name, city)
    @name = name
    @city = city
  end

  def name
    @name
  end

  def city
    @city
  end
end

person = Person.new('Rob', 'San Francisco')
=> #<Person:0x007ff15412a8c0 @name="Rob", @city="San Francisco">

person.city
=> "San Francisco"
```

Since I've defined methods for both `name` and `city`, using dot syntax to access those properties basically means we're calling those methods. The methods just return the instance variables, acting as getters. You can shorten this by using `attr_reader` or `attr_accessor`.

```ruby
class Person
  attr_accessor :name, :city
  def initialize(name, city)
    @name = name
    @city = city
  end
end

person = Person.new('Rob', 'San Francisco')
=> #<Person:0x007ff15412a8c0 @name="Rob", @city="San Francisco">

person.city
=> "San Francisco"
```

#### Struct

The `Struct` object is another commonly used element which allows dot access to its attributes. Quoting from [the documentation](http://www.ruby-doc.org/core-1.9.3/Struct.html):

> A Struct is a convenient way to bundle a number of attributes together, using accessor methods, without having to write an explicit class.

Examples speak louder than words so here's our `Person` again.

```ruby
Person = Struct.new(:name, :city)
=> Person

person = Person.new('Rob', 'San Francisco')
=> #<struct Person name="Rob", city="San Francisco">

person.city
=> "San Francisco"
```

As I understand it a `Struct` is basically sealed after you've given it an initial definition. This means that you can't keep tacking on properties like you can with a `Hash`

```ruby
# Continuing from above...

person.age = 28
NoMethodError: undefined method `age=' for #<struct Person name="Rob", city="San Francisco">

person[:age] = 28
NameError: no member 'age' in struct
```

#### OpenStruct

Finally we come to the `OpenStruct` which has both dynamic attributes and dot syntax. [The documentation describes it like so](http://ruby-doc.org/stdlib-1.9.3/libdoc/ostruct/rdoc/OpenStruct.html):

> An OpenStruct is a data structure, similar to a Hash, that allows the definition of arbitrary attributes with their accompanying values.

And again here is our `Person` from before. Note that `OpenStruct` needs you to `require` it.

```ruby
require 'ostruct'

person = OpenStruct.new
=> #<OpenStruct>

person.name = 'Rob'
=> "Rob"

person.city = 'San Francisco'
=> "San Francisco"

person.city
=> "San Francisco"
```

If you noticed, we didn't need to define the attributes of our `Person` before creating an instance of it. This means we could keep adding attributes indefinitely. Want your person to respond to `age`? Just tack it on.

```ruby
person.age = 28
=> 28

person.age
=> 28
```

For the sake of brevity you can pass in a `Hash` and `OpenStruct` will covert it for you.

```ruby
require 'ostruct'

person = OpenStruct.new(name: 'Rob', city: 'San Francisco')
=> #<OpenStruct name="Rob", city="San Francisco">

person.city
=> "San Francisco"
```

This all seems wonderful but there's one huge caveat which comes from the way `OpenStruct` finds all of these dynamic attributes. As [the documentation describes it](http://ruby-doc.org/stdlib-1.9.3/libdoc/ostruct/rdoc/OpenStruct.html):

> An OpenStruct utilizes Ruby’s method lookup structure to and find and define the necessary methods for properties. This is accomplished through the method method_missing and define_method.

> This should be a consideration if there is a concern about the performance of the objects that are created, as there is much more overhead in the setting of these properties compared to using a Hash or a Struct.

Definitely keep that in mind if you're writing time sensitive code. In those situations you'll want to use a `Hash` or a `Struct` instead.

Source:

[http://www.ruby-doc.org/core-1.9.3/Class.html](http://www.ruby-doc.org/core-1.9.3/Class.html)

[http://www.ruby-doc.org/core-1.9.3/Struct.html](http://www.ruby-doc.org/core-1.9.3/Struct.html)

[http://ruby-doc.org/stdlib-1.9.3/libdoc/ostruct/rdoc/OpenStruct.html](http://ruby-doc.org/stdlib-1.9.3/libdoc/ostruct/rdoc/OpenStruct.html)

[http://stackoverflow.com/questions/9356704/unable-to-use-dot-syntax-for-ruby-hash](http://stackoverflow.com/questions/9356704/unable-to-use-dot-syntax-for-ruby-hash)

[http://www.rubyist.net/~slagell/ruby/accessors.html](http://www.rubyist.net/~slagell/ruby/accessors.html)

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)


---
title: Setting up Android Studio on Yosemite
tags:
  - Android
  - Android Studio
  - Java
date: 2014-12-31T06:01:12.000Z
updated: 2015-01-24T21:02:50.000Z
---I've set out to learn some of the Android framework this quarter, which means setting up Java and the lastest version of Android Studio.

As it happens, I formatted my laptop today and did a clean install of Yosemite so my machine is about as stock as they come. As I was setting up Android Studio, I ran into some hiccups and thought I'd document them for anyone else running into similar issues.

## Step 1: Install Android Studio

After downloading Android Studio and firing it up for the first time, I was immediately confronted with an error:

> Android Studio was unable to find a valid JVM

I realized I hadn't yet setup Java on my machine so I followed [the link from the Android Studio docs to download the JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html) and installed Java 7. Hopping over to my command line, I verified the install by running `javac -version` which output `javac 1.7.0_71`.

Tried restarting Android Studio and...

> Android Studio was unable to find a valid JVM

Crap.

## Step 2: Google furiously

At this point, I must admit that I'm no Java expert. I followed the instructions to download the JDK but there are a ton of links on that page... maybe I made a mistake?

Thankfully [this StackOverflow thread](https://stackoverflow.com/questions/27369269/android-studio-was-unable-to-find-a-valid-jvm-related-to-mac-os/27369596) saved the day.

The accepted answer recommends hacking on the `info.plist` inside the Android Studio package. There's discussion in the comments pointing out that **this is no longer a recommended practice**.

I finally found [this answer](https://stackoverflow.com/a/27369494) which recommends [downloading the latest JVM from Oracle](https://www.java.com/en/download/) and then [downloading this Java bundle from Apple](https://support.apple.com/kb/DL1572?viewlocale=en_US&locale=en_US). After installing both packages I'm now able to fire up Android Studio (and I didn't have to hack on any of the internals). Yay!

## Step 3: Reflect

I've tried setting up Java in Eclipse before, and even previously in Android Studio. For some reason it's always a pain and super discouraging. I think it would be great if [the Android Studio guide](https://developer.android.com/sdk/installing/index.html?pkg=studio) contained a bit more explaination about exactly what I need to install to get up and running. Just pointing folks to [this page](http://www.oracle.com/technetwork/java/javase/downloads/index.html) and telling them to install the JDK is frought with peril. There are a million links on that page and almost no information hierarchy. If there are specific items I should click, gimme some screenshots.

Also, the error message from Android Studio is very unhelpful.

> Android Studio was unable to find a valid JVM

That was literally the first thing I saw when I started Android Studio. There's no "Hey click this link to find out how you can remedy this." Just an OK button that closes the app. Add a link to a troubleshooting guide and I think you'll save a handful of folks who were struggling like I was.

## Update 01/24/2015

Looks like there's [a ticket to address this issue](https://code.google.com/p/android/issues/detail?id=82378). According to the team:

> In the next version of Android Studio, if no java 6 is found but 7 (or greater) is found then it will use that instead. We still recommend running studio with Java 6 due to improved font rendering, but there is no work around needed if, for example, only java 8 is found.

So it seems like much of the confusion is around using Java 7 (or 8) instead of Java 6. If 6 is the required version it would be nice to link directly to it instead of pointing everyone to the JDK download page which has the latest versions at the top. Still, I'm happy to see this issue is being resolved.


---
title: Some More Backbone.js Basics
tags:
  - Chain
  - Backbone
date: 2012-05-20T15:19:00.000Z
updated: 2015-01-02T09:01:34.000Z
---Here are some quick Backbone snippets to help visualize concepts. I'll move around fairly quickly so if you're interested in going more in-depth then checkout the documentation.

### Events

Backbone events are pretty straightforward. To create a pub/sub relationship you use the `on` and `off` methods of `Backbone.Events`:

In the above example you could make `dispatcher` into an AMD module and load the dependency with Require.js, something [I've covered in a previous post.](http://robdodson.me/blog/2012/05/18/backbone-boilerplate-playing-with-require-dot-js/)

```js
var dispatcher = {};
_.extend(dispatcher, Backbone.Events);

var receiver = {
  initialize: function() {
    // Start listening for the 'hello' event from the dispatcher.
    // When we hear the 'hello' event we'll run a function
    dispatcher.on('hello', this.sayHello, this);
  },
  sayHello: function() {
    console.log('hello!');
    // Kill the listener so we only get called once
    dispatcher.off('hello', this.sayHello, this);
  }
};

receiver.initialize();
dispatcher.trigger('hello');
dispatcher.trigger('hello');
```

### Models

Backbone models are interesting because they implement explicit `get` and `set` methods. When you change a property with the get and set methods it will fire off an event. Here's a fiddle showing how to model a `Book`. We'll change the author and the DOM will reflect this update.

If your model implements an `initialize` function it will be called as soon as the object is created. In other words, its a constructor. If you pass a hash to the model's constructor it will set those attributes on itself. The hash and any additional arguments will also be passed to `initialize`.

```js
// Define an initialize function for our book
// Initialize will be called anytime we say new Book()
var Book = Backbone.Model.extend({
  initialize: function(foo, bar) {
    console.log(foo);
    console.log(bar);
  }
});

// You can pass in a hash to set initial values on the model
// The hash and any additional arguments will also be passed
// to the initialize function
book = new Book(
  {
    author: 'Hunter S. Thompson',
    title: 'Fear and Loating in Las Vegas'
  },
  'hello world!'
);

console.log(book.get('author'));
```

#### Poor man's data-binding

Now that we have a basic understanding of models we can write our own simple binding setup. This example presumes we have an `#author` and a `#title` element somewhere on our page.

```js
var Book = Backbone.Model.extend({});

book = new Book({
  author: 'Hunter S. Thompson',
  title: 'Fear and Loating in Las Vegas'
});

// Listen for any change event coming from the model.
// When any attribute changes we'll tell our elements to
// automatically update.
book.on('change', function() {
  $('#author').html(book.get('author'));
  $('#title').html(book.get('title'));
});

book.set('author', 'Mickey Mouse');
book.set('title', 'Everyone Poops');
```

#### Backbone.sync

To mess around with saving data we'll need to alter `Backbone.sync`.

> Backbone.sync is the function that Backbone calls every time it attempts to read or save a model to the server. By default, it uses (jQuery/Zepto).ajax to make a RESTful JSON request and returns a jqXHR. You can override it in order to use a different persistence strategy, such as WebSockets, XML transport, or Local Storage.

Backbone will decide whether a save call should perform a create with `HTTP POST` or an update `HTTP PUT` based on whether or not our model has an id attribute already.

Here's an example from the Backbone docs which overrides the sync functionality and fakes a request to a server.

```js
Backbone.sync = function(method, model) {
  console.log(method + ': ' + JSON.stringify(model));
  model.id = 1; // This line is crucial!
};

var book = new Backbone.Model({
  title: 'The Rough Riders',
  author: 'Theodore Roosevelt'
});

book.save();
// create: {"title":"The Rough Riders","author":"Theodore Roosevelt"}

book.save({author: 'Teddy'});
// update: {"title":"The Rough Riders","author":"Teddy"}
```

​If we don't give our model an `id` on line 3 then Backbone has no way of knowing if the model has been previously saved or not. It will keep doing create/POST until it receives that id.

### Collections

If you don't want to setup a server but you do want to play around with saving models and collections you can use [the Backbone LocalStorage adapter written by Jerome Gravel-Niquet](https://github.com/jeromegn/Backbone.localStorage). After you've included the js file in your code somewhere you can use it like so:

```js
var Book = Backbone.Model.extend({});

var Books = Backbone.Collection.extend({
  model: Book,
  localStorage: new Backbone.LocalStorage('Books')
});

var library = new Books();
library.on('sync', function() {
  console.log('sync succesful!');
});

var othello = library.create({
  title: 'Othello',
  author: 'William Shakespeare'
});
```

To `fetch` the models in the collection at a later point you can do the following:

```js
var Book = Backbone.Model.extend({});

var Books = Backbone.Collection.extend({
  model: Book,
  localStorage: new Backbone.LocalStorage('Books')
});

var library = new Books();
library.fetch();
console.log(library);
```

The docs mention that you shouldn't use this to initialize your collections. Instead you should [bootstrap your app](http://documentcloud.github.com/backbone/#FAQ-bootstrap) at page load. Here's the passage:

> Note that fetch should not be used to populate collections on page load — all models needed at load time should already be bootstrapped in to place. fetch is intended for lazily-loading models for interfaces that are not needed immediately: for example, documents with collections of notes that may be toggled open and closed.

### Routers

Routers are used to map URLs to actions. If you're using the Backbone Boilerplate you should see this block of code in your main.js.

```js
// Defining the application router, you can attach sub routers here.
var Router = Backbone.Router.extend({
  routes: {
    '': 'index',
    ':hash': 'index'
  },

  index: function(hash) {
    var route = this;
    var tutorial = new Example.Views.Tutorial();

    // Attach the tutorial to the DOM
    tutorial.render(function(el) {
      $('#main').html(el);

      // Fix for hashes in pushState and hash fragment
      if (hash && !route._alreadyTriggered) {
        // Reset to home, pushState support automatically converts hashes
        Backbone.history.navigate('', false);

        // Trigger the default browser behavior
        location.hash = hash;

        // Set an internal flag to stop recursive looping
        route._alreadyTriggered = true;
      }
    });
  }
});
```

One gotcha is that the definition of `":hash": "index"` will send any route that follows the base domain to the index function. For instance if you did the following:

```js
routes: {
    "": "index",
    ":hash": "index"
    "search": "search"
},

//...

search: function() {
    console.log('time to search!');
}
```

Instead of the search function running what will actually happen is mysite.com/search will be converted into mysite.com/#search and the word `search` will be sent to the index function to supply the `hash` argument. To fix this you'll need to remove the `":hash": "index"` route.

### Views

Views can either work with existing DOM elements or create new ones. Here's a very basic fiddle in which a BodyView is created to wrap our `body` tag and BoxView is appended to it. We add a little jQuery animation to show the process in action.

You'll often want to link a view's render method up to a model's change event so the two will stay in sync. Here's a quick and dirty example showing how to bind in this fashion.

```js
var Book = Backbone.Model.extend({});

var BookView = Backbone.View.extend({
  className: 'book-view',
  initialize: function() {
    this.model.on('change', this.render, this);
    this.render();
  },
  render: function() {
    this.$el.html(this.model.get('title') + ' by ' + this.model.get('author'));
  }
});

var outliers = new Book({
  author: 'Malcolm Gladwell',
  title: 'Outliers'
});

var bookView = new BookView({model: outliers});

$('body').append(bookView.el);

outliers.set('author', 'Mickey Mouse');
```

Instead of throwing your HTML into the render method as a String it's advised that you use some kind of templating library. Underscore templates seem like a good place to start but Backbone is designed to be template agnostic so you could easily switch to Mustache/Handelbars or HAML if you want. Tomorrow I'll look into displaying some content using an Underscore template linked up to a model. Till then.. :D

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)


---
title: Some Octopress Rake Tips
tags:
  - Octopress
  - Chain
  - Rake
date: 2012-06-12T02:04:00.000Z
updated: 2014-12-30T23:43:39.000Z
exclude: true
---

This is a quick post just to scratch one of my own itches. I've been using Octopress every single day for around two months now and the generation time for my blog is slowly starting to creep up. I'd heard that you could isolate a post and just preview/generate it instead of doing the whole blog every time but it wasn't until today that I finally decided to look into it.

Turns out it's really simple. Let's say we are going through our usual steps of creating a new post:

```bash
rake new_post["Today is a Wonderful Day"]
```

Now that we have our post ready we can isolate it from all the others:

```bash
rake isolate[wonderful-day]
```

Notice I didn't pass in the entire filename? That's because the Rake task inspects each of our posts and stashes anything that doesn't include the String 'wonderful-day' in the filename.

```ruby
Dir.glob("#{source_dir}/#{posts_dir}/*.*") do |post|
    FileUtils.mv post, stash_dir unless post.include?(args.filename)
end
```

Now that our post is isolated we can preview it, like we always do:

```bash
rake preview
```

Write a little bit, save, and hit `localhost:4000` to see your super speedy blog post!

When we're all done we integrate the post back in with the rest of our blog.

```bash
rake integrate
```

And finally we generate and deploy it, which can be done in a single command:

```bash
rake gen_deploy
```

There are a few other useful rake tasks, you can see the whole list by running:

```bash
rake -T

    rake clean                     # Clean out caches: .pygments-cache, .gist-cache, .sass-cache
    rake copydot[source,dest]      # copy dot files for deployment
    rake deploy                    # Default deploy task
    rake gen_deploy                # Generate website and deploy
    rake generate                  # Generate jekyll site
    rake install[theme]            # Initial setup for Octopress: copies the default theme into the path of Jekyll's generator.
    rake integrate                 # Move all stashed posts back into the posts directory, ready for site generation.
    rake isolate[filename]         # Move all other posts than the one currently being worked on to a temporary stash location (stas...
    rake list                      # list tasks
    rake new_page[filename]        # Create a new page in source/(filename)/index.markdown
    rake new_post[title]           # Begin a new post in source/_posts
    rake preview                   # preview the site in a web browser
    rake push                      # deploy public directory to github pages
    rake rsync                     # Deploy website via rsync
    rake set_root_dir[dir]         # Update configurations to support publishing to root or sub directory
    rake setup_github_pages[repo]  # Set up _deploy folder and deploy branch for Github Pages deployment
    rake update_source[theme]      # Move source to source.old, install source theme updates, replace source/_includes/navigation.ht...
    rake update_style[theme]       # Move sass to sass.old, install sass theme updates, replace sass/custom with sass.old/custom
    rake watch                     # Watch the site and regenerate when it changes
```

I'm looking forward to trying out Octopress 2.1 as it includes [a more streamlined generate task](https://github.com/imathis/octopress/pull/207) as well as some other nifty features. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Caffeinated
- Sleep: 7
- Hunger: 0
- Coffee: 1


---
title: Sublime Snippet Basics
tags:
  - Chain
  - Sublime
date: 2012-06-25T05:48:00.000Z
updated: 2014-12-31T00:21:39.000Z
---

[Yesterday I covered some tips and tricks](http://robdodson.me/blog/2012/06/23/sublime-text-2-tips-and-shortcuts/) I've learned over the past few months of using Sublime. Something I didn't touch on is Sublime's Snippet architecture.

Essentially a snippet is a little piece of code that gets executed when you type some characters and hit the `tab` key. For instance I have a snippet that spits out `console.log()` whenever I type `lg` and press `tab`. One clever feature of snippets is that they can be bound to a keyboard shortcut if the key binding calls the `insert_snippet` command and passes the path to the snippet file as an argument. For example:

```json
{
  "keys": ["super+shift+r"],
  "command": "insert_snippet",
  "args": {
    "name": "Packages/XML/long-tag.sublime-snippet"
  }
}
```

That will tell Sublime that when I press `cmd+shift+r` it should act as if I triggered the long-tag snippet for XML files. Basically that will let me highlight some text, hit `cmd+shift+r` and then I can type some HTML or XML tags to wrap my text. Cool. So let's go about writing our own snippet to learn a bit more about this process.

## Getting Started

The previously mentioned snippet is great for wrapping an item in HTML/XML tags but it totally breaks if we need to wrap our selection in anything not existing within brackets: `</>`. Since I write a lot of Markdown I'm always wrapping text in some kind of markdown syntax, `*like this*`, but there's no easy way to do this. The aforementioned snippet is close so we're going to copy it and tweak it to do what we need.

[The documentation on snippets for Sublime is short and full of good information. I suggest you read it before continuing on.](http://docs.sublimetext.info/en/latest/reference/snippets.html)

We're going to copy the file located at `/Library/Application\ Support/Sublime\ Text\ 2/Packages/XML` and move it into our `/Packages/User` directory. I chose to rename the file to `wrap-anything.sublime-snippet`. The original snippet looks like this:

```
<snippet>
    <content><![CDATA[<${1:p}>${2:$SELECTION}</${1/([^ ]+).*/$1/}>]]></content>
    <tabTrigger>&lt;</tabTrigger>
    <scope>text.xml</scope>
    <description>Long Tag</description>
</snippet>
```

`<content>` is where we put everything that's going to be spit out by our snippet when it's executed. Items are wrapped in a `CDATA` tag so they don't interfere with the rest of the XML.

The first part `<${1:p}>` outputs a `<` followed by a variable, `$1` which has a default value of the letter "p" and it closes with a `>`. If our snippet only contained this bit of code then when we ran it the output would be `<p>`.

The second part uses one of the environment variables [talked about in the snippet documentation.](http://docs.sublimetext.info/en/latest/reference/snippets.html)`$SELECTION` will take whatever we've highlighted and make it part of the snippet output. You'll notice this variable is prefixed with a `2:` meaning it's our second variable and it's default output is going to be whatever was highlighted. The 2 also indicates that if the user hits `tab` this is the second place they'll go.

The third part contains a block of regex which, I think, just matches whatever the user types after the snippet has executed. My regex sucks so correct me if I'm wrong.

`<tabTrigger>` indicates what character should be typed before hitting `tab` to fire off the snippet. In this case it's a `<`

`<scope>` defines where the snippet should run I believe.. But I'm not entirely sure. The documentation just says "Scope selector to activate this snippet." I didn't see a text.xml file anywhere in the `Packages/XML/` folder and I know this snippet works in non-xml files so...yeah..._shrug_

`<description>` lets you describe the thing. duh.

OK let's make our own simplified snippet:

```
    <snippet>
        <content><![CDATA[${1:`}${2:$SELECTION}${1}]]></content>
        <tabTrigger></tabTrigger>
        <scope></scope>
        <description>Wrap any block of text</description>
    </snippet>
```

Our snippet is less sophisticated than the previous one since we've excluded the regex. With the above snippet located in our `Packages/User/` folder we can tie it to a keyboard shortcut like so:

```json
{ "keys": ["super+r"], "command": "insert_snippet", "args": { "name": "Packages/User/wrap-anything.sublime-snippet" } },
```

Now when we hit `cmd+r` it will let us wrap our current selection in whatever we want :)

For good measure here's a really useful console.log snippet that's triggered by typing `lg` and then pressing `tab`.

```
<snippet>
    <content><![CDATA[console.log(${1});]]></content>
    <tabTrigger>lg</tabTrigger>
    <scope>source.js</scope>
    <description>console.log()</description>
</snippet>
```

No need to bind this to a keyboard shortcut (unless you want to) because it defines a tab trigger. I know this wasn't super in-depth but hopefully it gives you a little bit of a start. [Read the documentation on snippets](http://docs.sublimetext.info/en/latest/reference/snippets.html) and tighten up your regex! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Lazy
- Sleep: 5
- Hunger: 0
- Coffee: 1


---
title: Sublime Text 2 Tips and Shortcuts
tags:
  - Chain
  - Sublime
date: 2012-06-24T05:28:00.000Z
updated: 2014-12-31T00:17:50.000Z
---I've been using Sublime Text 2 for probably two months now and in that time I've discovered tons of useful tricks. I figured I should start writing them down for anyone who might be interested. I'll try to explain the bits that seem esoteric because there are a lot of cool commands which only work in certain contexts.

## Finding your preferences

One of the first things you want to do with Sublime is to find your User key bindings. They're located under `Sublime Text 2 > Preferences > Key Bindings - User`

Sublime Text is very DIY so there isn't a fancy GUI to help you change keyboard shortcuts. Instead you use the preference file to override the default shortcuts. Like a lot of things in Sublime, this can at first seem annoying and non-intuitive. That is, until you realize that by doing it this way Sublime has actually given you the power to make _extremely_ awesome key bindings. Take some time to look around in this file. I still only understand a fraction of what all it does but the little bits I learn here and there give me all sorts of ideas for new shortcuts. Just remember, if you want to change a keyboard shortcut you should do it in the User's key bindings and not the Default key bindings.

**Pro Tip:** If you ever want to change a keyboard shortcut but can't figure out what command is currently running open up Sublime's built in terminal with ` ctrl+`` then type `sublime.log_commands(True)`. Now when you execute your command from the menu you should see its name show up in the console. Just remember to turn logging off when you're done :)

## Sublime Package Control

If you only follow one piece of my advice make it this: [Install Sublime Package Control.](http://wbond.net/sublime_packages/package_control)

Package Control makes it extremely easy to manage your Sublime plugins. It also helps with discovering new ones, which is nice. Just install it if you haven't already, it's impossible to live without.

## Setting up a command line shortcut

I highly recommend setting up a symlink so you can easily open things with Sublime. [This article details how to go about it on OSX.](http://www.sublimetext.com/docs/2/osx_command_line.html)

CLI FTW!

## The Command Palette

OK, so hopefully you've setup Sublime Package Control. Maybe you've even installed some plugins. It's time for you to meet the Command Palette then. `cmd+shift+p` will open up the window and from here you can execute just about any command either native to Sublime or part of a plugin. It is super useful for all those things you don't run often enough to turn into full blown keyboard shortcuts. It's also useful if you know the name of a command but can't remember what section of the menu it lives under.

## Goto Anything...

So you want to fly around your project like a ninja on methamphetamines, eh? Then the shortcut you want is `cmd+p`. Once you've opened the dialog try typing a filename. Useful right? But wait, there's more...

If you preface what you're typing with a `@` it will look for "symbols" in the current file. Ex: `@foobar`. But just typing `@` will give you a nice file outline. The definition of what a symbol is depends on the file-type. In a Markdown file, for instance, it will list every header. In a JavaScript or Ruby file it will list every method of an object.

One last trick. If instead of an `@` you preface things with an `:` you can type a line number instead and hit enter to jump to that point. Ex: `:415`

There are other keyboard shortcuts for jumping to a line and going to a symbol but why bother when you can just use `cmd+p` and some easy prefixing.

## Splitting the editor windows

OK this one is also important and I can't recommend it enough. **Learn to split your editor windows.** I never used this feature in previous IDEs and now I wonder how I ever lived without it. Whether you have a unit test in one window and an implementation in the other, or some HTML and CSS, this feature is just always handy.

![Split panes in Sublime](/images/2014/12/sublime-split-panes.png)

I _live_ in split panes. They've changed my workflow significantly for the better. Less time switching between files and finding your place is an incredible advantage. You can access them through `View > Layouts`. It will behoove you to learn these keyboard shortcuts. Also learn the shortcuts for `View > Focus Group` and `View > Move File to Group`.

## Selections

There are some neat selections which come in handy depending on your context. Personally I use Expand Selection to Tag, `cmd+shift+a` quite frequently when writing HTML. I also use Expand Selection to Line, `cmd+L` and Expand Selection to Word, `cmd+D` a lot.

## Selections with Multiple Cursors

Multiple cursors... It's one of those things you didn't realize you needed until suddenly you had it and you were all like "WHAAAAAAAAT!"

There are a handful of ways to activate multiple cursors in Sublime. Hitting `cmd+D` to select multiples of the same word will put us into a multi-cursor context.

Another way to go about it is to highlight a block of text and hit `cmd+shift+L` which will split each line into its own selection. This is extremely useful when editing HTML where often times you have repeating elements and you want to tweak a class name on all of them.

You can also just hold `cmd` and click around your file to add more cursors. Or you can hold `ctrl+shift` and tap either the up or down arrows to add a new cursor in that direction.

## Moving Lines

`Edit > Line > Swap Line Up`

`Edit > Line > Swap Line Down`

`Edit > Line > Duplicate Line`

Learn em. Love em. I changed my keyboard shortcut for these so I can't recall what it is by default. Regardless I think I use these three commands more than any other so I would say if you only learn three shortcuts, make it these three.

**Pro Tip:** If you want to duplicate a block of code highlight it and hit `cmd+L` to select the new line before you hit `cmd+shift+D`. This way your duplicated block will appear on a new line, rather than next to the previous block of code.

## Wrap your lines

If you've installed the [Tag plugin](https://github.com/SublimeText/Tag) you should have some extra line wrapping methods. I would also recommend you install [ZenCoding](https://bitbucket.org/sublimator/sublime-2-zencoding). I'm suggesting this for two reasons:

1. You get awesome new features...
2. I can't remember if what I'm about to say is native to Sublime or part of a plugin.

OK with that out of the way...

Let's say you're working on some HTML and you have a block of text that you'd like to wrap in a `p` tag. No problemo! Highlight the text and hit `ctrl+shift+w` or `Edit > Tag > Wrap Selection in Tag`. There's a more advanced versions that comes with the ZenCoding plugin which lets you do really elaborate wrappings. I believe the keyboard shortcut for that is `ctrl+alt+w`. Personally I dislike using the `ctrl` key on my Mac laptop so I changed both of those keyboard shortcuts to the following:

```json
({
  "keys": ["super+shift+r"],
  "command": "insert_snippet",
  "args": {"name": "Packages/XML/long-tag.sublime-snippet"}
},
{
  "keys": ["alt+shift+r"],
  "command": "wrap_zen_as_you_type",
  "context": [
    {
      "operand": "text.html, text.xml",
      "operator": "equal",
      "match_all": true,
      "key": "selector"
    }
  ]
})
```

You'll notice that instead of just using a `wrap_in_tag` command name the first entry actually calls another command, `insert_snippet` and passes it an argument: `Packages/XML/long-tag.sublime.snippet` which is the location of a snippet file. Pretty cool trick!

Also note that Sublime uses the term "super" to refer to the command key

## Bookmarks!

If you're like me then you lose your place in large files. That's where bookmarks can be a big help. `cmd+F2` will add a new bookmark on the page. The bookmark is tied to the line so if you use the move line up/down commands it will move the bookmark as well (nice). To cycle through your bookmarks just hit F2. The rest of the bookmark commands are located in `Goto > Bookmarks`. Take note of the one that says `Select All Bookmarks` which will basically let you do a multi-selection on all of the lines you've already bookmarked.

## Marks

Marks are very similar to bookmarks but they serve a different purpose. They're located in `Edit > Mark` and their keyboard shortcuts are a little weird because you need to hit `cmd+K` and then a secondary shortcut like `cmd+space`. I find myself using Marks a few times a day to do large selections. For instance if you have a big block of HTML it can be very tricky to stay inside the proper scope if you're trying to delete all the contents of a very high level container. With Marks you can just put a mark on the opening line of the container, hit `cmd+shift+a` to select down to the bottom of the tag, and then hit `cmd+K, cmd+a` to select everything back to your previous mark. Marks can also be used to swap lines of text but I've never needed to do that in practice.

## Hide the Sidebar

To hide the sidebar hit `cmd+K, cmd+B`. Since I work on a laptop I often hide the sidebar to give myself that extra 100px of reading space.

## Turn off Minimap

Do you guys use that minimap thing in the top corner of the editor windows? I find it _incredibly_ distracting and it also takes up screen space. To disable it go to `View > Hide Minimap`.

## Saving a project

This one might be obvious for many of you but it wasn't something I was really taking advantage of until recently. Once you have a folder open it can be beneficial to save it as a project via the `Project > Save Project As...` command. Save the project files in the root of your app and then whenever you do `Project > Recent Projects...` it will open everything up with all your windows just as you left them.

To switch between projects use `ctrl+cmd+p`.

## Some awesome plugins

Sublime is all about plugins so here's a list of some of my favorites. Once you have Package Control installed you can just hit `cmd+shift+p` and type `discover`, then hit enter which will take you to a page listing tons of plugins. Try out some (or all) of the ones below. They're great :D

- AdvancedNewFile
- HtmlTidy
- Nettuts+ Fetch
- Prefixr
- RubyTest
- Shell Turtlestein
- SideBarEnhancements
- sublime-github
- Sublime-JSHint
- SublimeCodeIntel
- Tag
- ZenCoding

## Convert Case

If you highlight some text you can use `cmd+K, cmd+U` to uppercase it. Likewise you can use `cmd+K, cmd+L` to lowercase it.

## Spell Check :)

Finally I wouldn't be much of a blogger if I didn't point out the spell check feature. Hit `F6` to check your current file. Once you've turned it on the spell checker will stay on until you hit `F6` again.

## Hack the Planet!

We've only really scratched the surface of what Sublime is capable of. In the future I'd like to write more about its awesome Macros, Snippets and Plugin architecture. Till then, have fun hacking. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Lazy
- Sleep: 5
- Hunger: 5
- Coffee: 1


---
title: 'Syntax Error: Unexpected tIDENTIFIER in Rails 3'
tags:
  - Rails
  - Rails 3
  - Errors
  - Ruby
date: 2011-09-21T14:33:00.000Z
updated: 2015-01-02T09:04:39.000Z
---

Today we’re going to look at this little gem, which is really nothing more than a syntax error. If you’re not used to Ruby’s syntax, this can be a particularly easy stumbling block.

For starters here’s the image you see in Rails 3 when things go South:

![Syntax Error: Unexpected tIDENTIFIER](/images/2014/12/unexpected_tidentifier.jpg)

Just to focus your attention, I’ll post the snippet of code that was causing the issue.

```ruby
<%= link_to "Goodbye" say_goodbye_path %>
```

Can you tell me what’s wrong with the code above? If you’re coming from a Ruby background it should be plainly obvious, but if you’re coming from more of an ECMAScript or Java/C/C++ background things might be a little more subtle. What if I rewrote it like this?

```ruby
linkTo("Goodbye" sayGoodbyePath);
```

Did you notice I left out a comma when passing my function arguments? The proper code would look something like this:

```ruby
# note the comma between arguments
<%= link_to "Goodbye", say_goodbye_path %>
```

If you want to explore this a bit more (and if you’re new to Ruby—trust me—you do) then strap in for a brief tangent.

### Ruby Says Goodbye to Braces (sort of)

One of Ruby’s double edged swords, especially if you’re coming from another language, is the exclusion of various syntactical elements to improve brevity and readability. In Actionscript 3 you might iterate over a list of items like this:

```ruby
for each (var person:Object in people) {
  trace(person.name);
}
```

However in Ruby you can write it much more succinctly:

```ruby
for person in @people
  puts person.name
end

# or...

@people.each do |person|
  puts person.name
end
```

Just that example alone doesn’t look so bad but where it gets tricky for a newcomer like myself is when the parenthesis wrapping a function’s arguments are excluded. This is the case in our original example and it can be pretty jarring for someone not used to that kind of shorthand. Suddenly I’m left wondering if I’m calling another function, or using a keyword, or some other idiom of the language that I don’t fully grasp.

It gets especially confusing when dealing with hashes as function arguments. Here’s a quote from [Agile Web Development with Rails, 4th Edition](http://pragprog.com/book/rails4/agile-web-development-with-rails) with some emphasis added:

> You can pass hashes as parameters on method calls. **Ruby allows you to omit the braces, but only if the hash is the last parameter of the call.** Rails makes extensive use of this feature…In effect, though, you can ignore that it’s a hash and pretend that Ruby has keyword arguments.

As you start to learn Rails you’ll see this kind of thing everywhere. At first I thought there was a special language construct that I was missing (similar to the ‘keyword’ referred to in the book) but in actuality it’s just hashes without the surrounding brackets. Common Rails practices take this to the extreme, mixing and omitting braces quite frequently. Take for example this validation:

```ruby
validates :email, presence:   true,
                    format:     { with: VALID_EMAIL_REGEX },
                    uniqueness: { case_sensitive: false }
```

To confuse the issue even further, the hash syntax changed from Ruby 1.8.7 to 1.9 allowing you to swap the place of the colon on your symbols. This makes newer Rails examples seem like they’re using another part of the language that you might not be familiar with. Below is an example, note the position of the colons:

```ruby
# Ruby 1.8.7 hash syntax
say_hello :name => 'Rob', :age => 27
say_hello(:name => 'Rob', :age => 27)
say_hello({:name => 'Rob', :age => 27})

# Ruby 1.9 hash syntax
say_hello name: 'Rob', age: 27
say_hello(name: 'Rob', age: 27)
say_hello({name: 'Rob', age: 27})
say_hello :name => 'Rob', :age => 27
say_hello(:name => 'Rob', :age => 27)
say_hello({:name => 'Rob', :age => 27})
```

All of the above code evaluates to the same thing (give it a shot in IRB). At this point we’re way off topic but I wanted to put this out there in case anyone else is struggling with these concepts. After getting used to the syntax (or lack thereof) these kinds of mistakes are easily cleared up, but for now just be mindful of what version of Ruby your examples are written in.

### Resolution

Check the syntax of your method call. Odds are you forgot a comma somewhere.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)


---
title: Take Control of your App with the JavaScript State Pattern
tags:
  - Chain
  - Design Patterns
  - JavaScript
date: 2012-06-03T01:22:00.000Z
updated: 2015-01-02T08:58:40.000Z
exclude: true
---

Last week I wrote a post about [communicating between views in Backbone.js](http://robdodson.me/blog/2012/05/25/backbone-events-framework-communication/) and since then it has easily become my most popular article. The comments have forced me to think about the ways in which I typically manage state in very large Flash applications and how that might translate to JavaScript and Backbone. Today I want to present my all time favorite design pattern, the State pattern, and illustrate how it can help you maintain control of your application. I want to warn you that I'm going to show a rather large block of what looks like repetitive code because I want the pattern to be obvious. In tomorrow's post we'll clean it up and try it out with a Backbone Model and View.

### The State pattern?

Ok let's get started. I want to write a video player so I'm going to need an object that can handle `play`, `stop` and `pause` states. I would say that there are probably a ton of video players out there that have `play`, `stop` and `pause` methods on them, and I bet many look kind of like this:

```js
play: function() {
    if (this.status == 'playing') {
        return;
    } else if (this.status == 'stopped') {
        // play the video
    } else if (this.status == 'paused') {
        // unpause and play
    }
    // else if ...
}
```

Or maybe instead of a long conditional there's a switch statement or something. But _essentially_ you're querying some variable somewhere to check what state the object is in and you're branching your logic as a result. Now, I would argue that this is a really brittle process and probably error prone. You could imagine that in each of those conditional blocks there might be several lines of code: preparing to play, stopping the video, tearing down this or that... Or perhaps if you're moving from one state to another you want to animate something on screen, maybe do some ajax, who knows!? Really no matter what you're doing if you're tossing it into these big conditionals it's going to become a nightmare to manage.

Alternatives? Ok, let's think of our video player in terms of the actions that it performs. Our player can play, it can stop and it can pause. What if instead of play, pause and stop acting as methods on our object, we make each of those states into its _own_ object? So when the play state object is told to play it says 'Hey! I'm already playing. No need to change' and when it's told to stop it says 'Ah stopping, eh? Let me defer to my friend the Stop state object'.

To illustrate this I've written a very simple player which just logs what it's doing as you ask it to change state. I want to point out that this code is neither DRY nor very useful in a real world situation but it's intended to illustrate a point. Hopefully when you see the repetition you'll quickly say to yourself 'Hey! Those state objects could be made into a more general/abstract parent object.' That would be the correct mindset but I thought that if I skipped this part the pattern might not be obvious for those new to it.

```js
var player = {
  state: undefined,
  states: {
    playing: {
      initialize: function(target) {
        this.target = target;
      },
      enter: function() {
        console.log('setting up the playing state');
      },
      execute: function() {
        console.log('playing!');
      },
      play: function() {
        console.log('already playing!');
      },
      stop: function() {
        this.target.changeState(this.target.states.stopping);
      },
      pause: function() {
        this.target.changeState(this.target.states.pausing);
      },
      exit: function() {
        console.log('tearing down the playing state');
      }
    },
    stopping: {
      initialize: function(target) {
        this.target = target;
      },
      enter: function() {
        console.log('setting up the stopping state');
      },
      execute: function() {
        console.log('stopping!');
      },
      play: function() {
        this.target.changeState(this.target.states.playing);
      },
      stop: function() {
        console.log('already stopped!');
      },
      pause: function() {
        this.target.changeState(this.target.states.pausing);
      },
      exit: function() {
        console.log('tearing down the stopping state');
      }
    },
    pausing: {
      initialize: function(target) {
        this.target = target;
      },
      enter: function() {
        console.log('setting up the pausing state');
      },
      execute: function() {
        console.log('pausing!');
      },
      play: function() {
        this.target.changeState(this.target.states.playing);
      },
      stop: function() {
        this.target.changeState(this.target.states.stopping);
      },
      pause: function() {
        console.log('already paused!');
      },
      exit: function() {
        console.log('tearing down the pausing state!');
      }
    }
  },
  initialize: function() {
    this.states.playing.initialize(this);
    this.states.stopping.initialize(this);
    this.states.pausing.initialize(this);
    this.state = this.states.stopping;
  },
  play: function() {
    this.state.play();
  },
  stop: function() {
    this.state.stop();
  },
  pause: function() {
    this.state.pause();
  },
  changeState: function(state) {
    if (this.state !== state) {
      this.state.exit();
      this.state = state;
      this.state.enter();
      this.state.execute();
    }
  }
};
```

Lots of code, I know. But there is serious value in digesting this pattern so stick with me here and I'll go through it bit by bit. Let's start at the top where we define our object:

```js
var player = {
  state: undefined,
  states: {
    playing: {
      initialize: function(target) {
        this.target = target;
      },
      enter: function() {
        console.log('setting up the playing state');
      },
      execute: function() {
        console.log('playing!');
      },
      play: function() {
        console.log('already playing!');
      },
      stop: function() {
        this.target.changeState(this.target.states.stopping);
      },
      pause: function() {
        this.target.changeState(this.target.states.pausing);
      },
      exit: function() {
        console.log('tearing down the playing state');
      }
    }
    // ... .
  }
};
```

First we declare our object and give it a property of `state` which we set to `undefined` for now. We're going to be creating state object to delegate all of our method calls to so once we're ready to use our player we'll set its initial state.

The `states` object (note the plurality) holds all of the different state objects that our player can use. In this version we've defined `playing`, `stopping` and `pausing` but you could also add states like `buffering` or `initializing`. Keep in mind that this pattern can be applied to just about anything. For instance, if you were making a game with an old prospector his state objects could be `mining`, `drinking` and `sleeping`. The main thing to remember is that **your state objects should all define the exact same public methods**.

We can skip the `stopping` and `pausing` states since they're nearly identical to the `playing` state. Instead let's jump down to the bottom and look at the last bit.

```js
initialize: function() {
  this.states.playing.initialize(this);
  this.states.stopping.initialize(this);
  this.states.pausing.initialize(this);
  this.state = this.states.stopping;
},
play: function() {
  this.state.play();
},
stop: function() {
  this.state.stop();
},
pause: function() {
  this.state.pause();
},
changeState: function(state) {
  if (this.state !== state) {
    this.state.exit();
    this.state = state;
    this.state.enter();
    this.state.execute();
  }
}
```

In our player's initialize function we give each state a reference to the player object so we can tell it to `changeState`. We also set our initial state to be the stopping state.

Now let's look at the `play` method. Do you see how it defers the call to whatever object is currently set as the player's `state`? Since `this.state` refers to `this.states.stopping` we're effectively calling the `play` method of the `stopping` state object. Go look at the other state objects to see how they respond to having their `play` methods called. In the case of `states.stopping`, calling `play` is going to tell its `target` (which is just a reference to the player) to `changeState`, passing in the `states.playing` state.

`changeState` is kind of an awesome method because it does a ton of work but it does it very elegantly and efficiently. For starters it makes sure that the state we've asked to change to is actually different than our current state. Then it tells our current state to `exit()`. A state's `exit()` method is a great place to tear down any constructs that we may have built to support that action. Next it sets our current state to the new state. Lastly, it calls `enter()` (a good place to build up supporting constructs) and `execute()`, which is where we do the main work of our state. That's pretty straightforward right?

Since `play`, `pause` and `stop` are members of our player's public API, **all of our states must also implement those methods.** Otherwise you would get an error if you called `play()` on the object and its state did not support that method. Keep this in mind when you're designing your state objects.

### Aaaaand we're off!

Let's look at our player in action:

```js
// We start off in the stopping state
// So when we call stop...
player.initialize();
player.stop();

=> 'already stopped!'

// Let's move to the playing state
player.play();

=> 'tearing down the stopping state'
=> 'setting up the playing state'
=> 'playing!'

// Quick call pause!
player.pause();

=> 'tearing down the playing state'
=> 'setting up the pausing state'
=> 'pausing!'

// Um... call pause like 3 times cuz
// I'm a button masher!!!
player.pause();
player.pause();
player.pause();

=> 'already paused!'
=> 'already paused!'
=> 'already paused!'

// OK call play again!
player.play();

=> 'tearing down the pausing state!'
=> 'setting up the playing state'
=> 'playing!'
```

### I like it, but...

Before you run for the hills due to the sheer volume of boilerplate code I want to remind you that almost all of this repetition can easily be cleaned up. If we defined a base state that all of our other states extended then they would only need to override the methods that they cared about. For instance, the `stopping` state and `pausing` state both tell their target to `changeState` when someone calls `play`. This kind of functionality is easily moved into a base state. Also if you have no need for `enter` and `exit` methods those can be removed or also thrown into the base state. I'll dig into this more tomorrow but for now play around with the example and leave some feedback if you have comments or suggestions. Thanks!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Drunk
- Sleep: 7
- Hunger: 0
- Coffee: 1


---
title: Getting started with Mocha and Chai
tags:
  - Chain
  - BDD
  - Mocha
  - Chai
date: 2012-05-27T21:08:00.000Z
updated: 2015-01-02T09:00:11.000Z
---Since I was previously doing so much RSpec I want to try to bring some of that over to my JavaScript work. Lately I've been working with the Backbone Boilerplate which is a wonderful jump-start for folks who want to get up and running with AMD and Backbone. Today I'm going to see if I can get a working BDD setup going which will run some very basic tests. In a future post I'll use this new setup to do some BDD with Backbone Boilerplate.

### Setting up Mocha and Chai

I chose Mocha over Jasmine because I've already worked with Jasmine so there wasn't much mystery there and also because I've heard really good things about Mocha. I think it's cool that if I choose to do a Node.js project Mocha will be able to test both my server and client code.

Unfortunately the documentation for both Mocha and Chai is rather terse when it comes to actually explaining how to get either library working for client side testing. I guess that's understandable since their primary focus is Node but after over an hour of poking around both sites I still don't have anything that functions...

Copying over both the mocha and chai directories into my project I've noticed that each one has a test/browser folder which is refered to in the documentation. Seems like this is how I run my specs. Mocha has a failing set of specs on its opts.html file but otherwise everything seems to pass. Chai has failures in its spec regarding its deep equals operations... Let's see if we can forge ahead and write a test in just mocha.

Here's my html runner setup:

```html
<html>
  <head>
    <meta charset="utf-8" />
    <title>Mocha Tests</title>
    <link rel="stylesheet" href="mocha/mocha.css" />
    <script src="../assets/js/libs/jquery.js"></script>
    <script src="mocha/mocha.js"></script>
    <script>
      mocha.setup('bdd');
    </script>
    <script src="test.foobar.js"></script>
    <script>
      $(function() {
        mocha.run();
      });
    </script>
  </head>
  <body>
    <div id="mocha"></div>
  </body>
</html>
```

And here's my first failing test:

```js
describe('Foobar', function() {
  describe('#sayHello()', function() {
    it('should return some text', function() {
      var foobar = {
        sayHello: function() {
          return 'Hello World!';
        }
      };

      assert(foobar.sayHello() === 'funky chicken');
    });
  });
});
```

Using just the above I see the mocha runner fire up but then it immediately breaks saying that `assert` is not defined. Well...great. [I'm basing my work on this example](http://visionmedia.github.com/mocha/#browser-support) but I realize now that I removed the line which included `expect.js`. Without expect.js we don't have anything to do exceptions for us because Mocha doesn't include any by default.

![Assert is not defined](/images/2014/12/no_assert.png)

Looking at some other Mocha examples in the github repo I noticed that they explicitly define the `assert` method inside the runner. We'll do the same to get things working. Here's my updated runner which now functions as expected. Note the addition of `assert` after we call `mocha.setup('bdd')`.

```html
<html>
  <head>
    <meta charset="utf-8" />
    <title>Mocha Tests</title>
    <link rel="stylesheet" href="mocha/mocha.css" />
    <script src="../assets/js/libs/jquery.js"></script>
    <script src="mocha/mocha.js"></script>
    <script>
      mocha.setup('bdd');
    </script>
    <script>
      function assert(expr, msg) {
        if (!expr) throw new Error(msg || 'failed');
      }
    </script>
    <script src="test.foobar.js"></script>
    <script>
      $(function() {
        mocha.run();
      });
    </script>
  </head>
  <body>
    <div id="mocha"></div>
  </body>
</html>
```

Since our `assert` method takes a `msg` param we can add that to our test so we get some useful feedback when it fails. Here's the updated spec.

```js
describe('Foobar', function() {
  describe('#sayHello()', function() {
    it('should return some text', function() {
      var foobar = {
        sayHello: function() {
          return 'Hello World!';
        }
      };

      assert(foobar.sayHello() === 'funky chicken', 'Was expecting "Hello World!"');
    });
  });
});
```

That should fail and give us the appropriate message. Changing 'funky chicken' to 'Hello World!' will make the test pass. Yay that only took a few hours...

OK, let's forge ahead and see if we can get chai working so we can use some nicer expectations than our weak `assert`. I'm including chai.js in place of our `assert` function.

```html
<html>
  <head>
    <meta charset="utf-8" />
    <title>Mocha Tests</title>
    <link rel="stylesheet" href="mocha/mocha.css" />
    <script src="../assets/js/libs/jquery.js"></script>
    <script src="chai/chai.js"></script>
    <!-- added chai.js instead of assert -->
    <script src="mocha/mocha.js"></script>
    <script>
      mocha.setup('bdd');
    </script>
    <script src="test.foobar.js"></script>
    <script>
      $(function() {
        mocha.run();
      });
    </script>
  </head>
  <body>
    <div id="mocha"></div>
  </body>
</html>
```

Next we need to update our spec. Chai has 3 different styles of assertions: `assert`, `expect` and `should`. I'll show you how to use each in our foobar spec:

```js
var assert = chai.assert,
  expect = chai.expect,
  should = chai.should(); // Note that should has to be executed

var foobar = {
  sayHello: function() {
    return 'Hello World!';
  }
};

describe('Foobar', function() {
  describe('#sayHello()', function() {
    it('should work with assert', function() {
      assert.equal(foobar.sayHello(), 'funky chicken!');
    });

    it('should work with expect', function() {
      expect(foobar.sayHello()).to.equal('funky chicken!');
    });

    it('should work with should', function() {
      foobar.sayHello().should.equal('funky chicken!');
    });
  });
});
```

![Our failing Chai tests](/images/2014/12/failing_chai_tests.png)

Changing all those funky chickens to 'Hello World!' should get the tests passing again and now we can use any syntax we like.

![Finally some passing Chai tests!](/images/2014/12/passing_chai_tests.png)

Now all is well and good except the tests that come with Chai are failing in a few places. It looks like some of Chai's methods are borked on my system.

![Chai failing its own tests](/images/2014/12/broken_chai_tests.png)

That does _not_ fill me with confidence. I think there's a very high probability that being a newbie I'm doing something wrong so [I've tweeted to Jake Luer, the author of Chai, to figure out if perhaps I'm missing something or if the tools are actually broken.](https://twitter.com/rob_dodson/status/206893206435151872/photo/1) In the meantime I'm not comfortable using a testing framework that's broken.

Sigh... well tomorrow I'll try to import some modules and if Jake hasn't gotten back to me by then I'll use Jasmine to do those tests. Till then!

- Update: Looks like I managed to clone Chai right as they were updating the repo. Pulling the latest fixed everything. See the comment thread below\*

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Awake, Caffeinated, Curious
- Sleep: 7
- Hunger: 0
- Coffee: 1


---
title: Testing AMD Backbone Modules
tags:
  - Chain
  - BDD
  - Backbone
  - Backbone Boilerplate
  - Mocha
  - Chai
  - Sinon
date: 2012-05-29T15:03:00.000Z
updated: 2015-01-02T08:59:21.000Z
---Continuing from [yesterday's post](http://robdodson.me/blog/2012/05/28/mocking-requests-with-mocha-chai-and-sinon/) I'm going to start to incorporate Backbone into my BDD setup. I'm going to use the [Backbone Boilerplate](https://github.com/tbranyen/backbone-boilerplate) and [grunt-bbb](https://github.com/backbone-boilerplate/grunt-bbb) to setup a new project. If you're new to the boilerplate or grunt-bbb [checkout my previous post on getting started.](http://robdodson.me/blog/2012/05/17/getting-familiar-with-backbone-boilerplate/)

### Shiny and new

I've created a new directory called `amd-tests` and once I `cd` inside I run `bbb init` to template out a new project. By default the boilerplate uses Require.js and AMD modules and we have a little example one already created for us. It's called, well, Example :) We'll use this to create our model for testing since I know that everyone should be on the same page with this module.

I'm going to change our model's name from Example.Model to Example.Photo so our terminalogy won't get muddy. We'll give it some default properties for `src` and `caption`. Later on we'll test that a freshly created model has these same defaults. When we're done setting up our `/app/example.js` file should look like this. Keep in mind that the boilerplate adds a lot of stuff to get us started so you can ignore everything that isn't Example.Photo

```js
define([
  'namespace',

  // Libs
  'use!backbone'

  // Modules

  // Plugins
], function(namespace, Backbone) {
  // Create a new module
  var Example = namespace.module();

  // !!! Our awesome new model !!!
  Example.Photo = Backbone.Model.extend({
    defaults: {
      src: '/images/placeholder.jpg',
      caption: 'Waiting for content...'
    }
  });

  Example.Collection = Backbone.Collection.extend({
    /* ... */
  });
  Example.Router = Backbone.Router.extend({
    /* ... */
  });

  // This will fetch the tutorial template and render it.
  Example.Views.Tutorial = Backbone.View.extend({
    template: 'app/templates/example.html',

    render: function(done) {
      var view = this;

      // Fetch the template, render it to the View element and call done.
      namespace.fetchTemplate(this.template, function(tmpl) {
        view.el.innerHTML = tmpl();

        // If a done function is passed, call it with the element
        if (_.isFunction(done)) {
          done(view.el);
        }
      });
    }
  });

  // Required, return the module for AMD compliance
  return Example;
});
```

Now comes the rather tricky part. We need to create a test runner HTML file that can incorporate mocha, chai and sinon. It also has to load our Example module and maintain all of that module's dependencies. I spent a _ton_ of time on IRC today sorting this out so here is my current best stab at things based on some [VERY generous gists](https://gist.github.com/2655876) from [Kelly Miyashiro.](https://github.com/kmiyashiro)

Let's start with the index.html file that'll be our test runner:

```html
<html>
  <head>
    <meta charset="utf-8" />
    <title>Mocha Tests</title>
    <link rel="stylesheet" href="mocha/mocha.css" />
    <script src="../assets/js/libs/require.js"></script>
    <script src="mocha/mocha.js"></script>
    <script src="sinon/sinon.js"></script>
    <script src="config.js"></script>
  </head>
  <body>
    <script>
      require(['../test/test.example'], runMocha);
    </script>
    <div id="mocha"></div>
  </body>
</html>
```

The first thing we do is add require.js, then mocha and sinon. Why no Chai? Good question. Kelly didn't do it so I didn't do it. If anyone wants to cite the pros and cons of this approach I'm all ears. Next we add our own config.js that is specific to our tests. We might have a config.js somewhere else that runs our main app but we'll also need this one to run our tests. Finally we have a script block sitting on top of our `#mocha` div. The script block loads in our specs (in this case I've only written one but you can do multiple specs here). A final argument to the require call is `runMocha`. Essentially this is the function that is executed _AFTER_ the modules have finished loading. In our case runMocha is located inside the new config.js we've defined just for our tests. Let's take a look at it now.

```js
require.config({
  // Base URL relative to the test runner
  // Paths are relative to this
  baseUrl: '../app',
  paths: {
    // Testing libs
    chai: '../test/chai/chai',
    common: '../test/common',
    jquery: '../assets/js/libs/jquery',
    underscore: '../assets/js/libs/underscore',
    backbone: '../assets/js/libs/backbone',
    use: '../assets/js/plugins/use'
  },
  use: {
    backbone: {
      deps: ['use!underscore', 'jquery'],
      attach: 'Backbone'
    },
    underscore: {
      attach: '_'
    },
    mocha: {
      attach: 'mocha'
    }
  },
  priority: ['jquery', 'underscore', 'common']
});

mocha.setup({
  ui: 'bdd',
  ignoreLeaks: true
});

// Protect from barfs
console = window.console || function() {};

var runMocha = function() {
  mocha.run();
};
```

Lots of stuff here but nothing to get alarmed about. [If you've read my previous getting started post you'll know all about the config.js file.](http://robdodson.me/blog/2012/05/17/getting-familiar-with-backbone-boilerplate/) Go back and read the previous post if none of this makes sense to you. The thing to take note of is the `priority` array and the `runMocha` function at the bottom of the page. I don't have much experience with the priority array and I didn't find much documentation on it but Kelly uses it [in the gists](https://gist.github.com/2655876) to make sure that jQuery, chai and any chai plugins are properly setup on the page.

```js
// Include and setup all the stuff for testing
define(function(require) {
  window.$ = window.jQuery = require('jquery');
  window.chai = require('chai');
  window.expect = chai.expect;
});
```

Good practice? Bad practice? I'm not sure and I would love comments if anyone has a take on things. Underneath the priority array is a setup function which sends some configuration parameters to mocha. `ignoreLeaks` is useful because it's easy for mocha to see jQuery or any other global variable as a good reason to abort a test. IMO that's what JSLint/Hint is for, and bailing everytime you see a global is going to make testing 3rd party code especially difficult. My advice, leave it off. Finally we call `mocha.run()` via the `runMocha` function. Remember that this function is executed inside our test runner after all the specs are loaded, like so:

```html
<script>
  require(['../test/test.example'], runMocha);
</script>
```

Doing it this way guarantees that all the dependencies our module needs will be loaded before we start running our tests.

### Oh right, the tests!

Wow! OK so hopefully you're still with me because after all of that we _still_ need to generate some tests. Since it's getting late I'm just going to put together a really simple spec to make sure our default values are being set on the model.

I've created a file called `test.example.js` which will test our `Example` module.

```js
define(function(require) {
  var Example = require('modules/example');

  describe('Example', function() {
    describe('Photo', function() {
      var photo = new Example.Photo();
      it('should have proper defaults', function(done) {
        expect(photo.get('src')).to.equal('/images/placeholder.jpg');
        expect(photo.get('caption')).to.equal('Waiting for content...');
        done();
      });
    });
  });
});
```

It isn't amazing but it gets us started testing our module. I'm explicitly calling `done()` at the end of our test because I saw mention on StackOverflow that you should do this when testing AMD modules in the browser with mocha otherwise you can get false passing tests. Not sure if it's absolutely necessary but I guess better safe than sorry!

At this point I'm exhausted and hopefully you have a decent head start on your tests. I know that this post jumps around a lot so please take a moment [to grab the repo I've posted which contains all the source code.](https://github.com/robdodson/backbone-boilerplate-mocha) Again. Caveat. I'm learning along with you so there are lots of newbie mistakes being made, I'm sure. I really want to hear your feedback if you have any. Good luck!

You should follow me on Twitter [here](http://twitter.com/rob_dodson)

- Mood: Awake, Antsy
- Sleep: 6
- Hunger: 3
- Coffee: 0


---
title: The Art of Fear Blogging
date: 2013-09-16T19:51:00.000Z
updated: 2015-01-01T21:04:56.000Z
exclude: true
---

Years ago [I heard a radio story about a woman hopelessly addicted to cigarettes.](http://www.radiolab.org/2011/mar/08/you-v-you/) Although she tried numerous times to quit, the temptation always won out. So she devised a plan. She told her best friend that if she ever caught her smoking again, she would have to send \$5,000 to the Ku Klux Klan. Her best friend, acting as the enforcer, would hold her to it.

There's a name for this. It's called a [Ulysses pact.](http://en.wikipedia.org/wiki/Ulysses_pact)

As the story goes, Ulysses wanted to hear the song of the Sirens, but he knew that doing so would cause him to crash his ship into the rocks. The song was just too irresistible; it would drive any man mad with desire. So Ulysses struck a deal with his men. They would tie him to the mast and put beeswax in their ears. By doing so they would be unable to hear Ulysses' commands. As they approached the island Ulysses became transfixed, but try as he might he couldn't escape or convince his men to drive the boat to the shore.

**He made a decision in the present which (literally) bound his future self.**

## Know Your Sirens

I wanted to elevate my career and push myself to be a better developer. I knew that one of the best ways to do this was to start writing. But the fact of the matter is, writing a blog post to explain a technical topic is just \*not fun.**\*It's a struggle!** You feel like an idiot most of the time. And at the end of it all you look at your work and realize that you sound like a robot.

**It's very easy to get bogged down and to not do it consistently. But consistency is key to forming any good habit.**

To overcome these obstacles I made a deal. I publicly announced that I would give \$500 to a politician I was not fond of unless I published a blog post every day for 60 days. I've come to refer to this as **Fear Blogging.**

**I made a decision in the present which (figuratively) bound my future self.**

I'll admit that those 60 days were hard. There were numerous times when I would come home late, exhausted from work, and I still had to put out a thoughtful blog post. [Some of them are not so good.](http://robdodson.me/blog/2012/06/23/failing-at-ruby/)

But when it was all over, I emerged on the other side and the goal was completed! It felt amazing. I had judo-ed one of my biggest character flaws—my desire to quit—and turned it into a strength! What else could I use these new found powers on? Could I force myself to go to the gym or learn Mandarin? Maybe I could take up photography with the goal of taking 100 pictures every day. The possibilities are endless. It feels, in many ways, like I've finally found a loophole in my own lazy personality.

## Tips

**Choose one thing and stick to it.**

I've tried doing pacts where I'm writing, going to the gym and learning a new language all at the same time. Typically those end up being too stressful. You're trying to form a habit so make it something that you really want to do and focus on just that one thing.

**Find a buddy.**

Making a public declaration that you're going to do something on Facebook and Twitter is a great start but in reality nobody on those sites is going to hold you to it. They read your post, Like it, and move on. It's better to find a friend you trust and make them act as your enforcer. When my buddy [P.J. Onori tried Fear Blogging](http://somerandomdude.com/2013/07/07/my-last-three-months-blogging-under-fear/) I promised him that if he didn't do his work I was going to force him to pay the penalty. Not only did this give me a ton of sadistic glee but it also made P.J.'s contract all the more binding and real.

**Don't decorate the house.**

I've noticed a lot of my friends say they want to blog but first they need to "update their site." Or, if they don't have a site, then they need to get one and it needs to be really spiffy. I like to say _that's like decorating a house before you've decided to live in it_. You're going to waste a ton of effort on fixing everything up and that's time that would be better spent accomplishing your goal. My advice is to write 10 or 15 posts, then worry about how things look. Get into the habit of jogging before you spend a bunch of time picking out the most perfect shoes. You get what I'm saying :)

## Whatever It Takes

I've found that once you complete a big goal, it gives you a little more self confidence and next time you don't have to do the whole production of making a pact with harsh penalties. Today I don't need to Fear Blog because I've established the habit of writing. But the option's there if I ever need it to help me achieve a new goal.

Now, dear reader, it's your turn.

**What are you going to accomplish?**


---
title: The future of accessibility for custom elements
date: 2017-10-02T20:17:28.000Z
updated: 2017-12-22T20:02:27.000Z
---

When users of assistive technology, like a screen reader, navigate a web page, it’s vitally important that the semantic meaning of the various controls is communicated.

For example, if a screen reader visits a login button:

```html
<button>Sign in</button>
```

—it would announce, “Sign in, button”. This tells the user about the affordance available to them—whether something is a button that may be pressed, for example, or if it’s just a block of text content with no other semantics.

Additionally, built-in elements support keyboard-based usage, which is important for users who can’t use a pointing device—whether they are unable to see the pointer, or don’t have the physical ability. This is why accessibility experts always urge developers to mark up their pages with the built-in elements.

[Custom elements](https://developers.google.com/web/fundamentals/web-components/customelements), by contrast, have no implicit semantics or keyboard support.

When you define a new tag, the browser really has no way of knowing if you’re trying to build a button, or a slider, or just a fancy text container. Adding these features back in requires a fair bit of work on the developer’s part and it can be difficult to reach parity with the native equivalents.

## `<howto-component>`

Recently we launched a project called [HowTo: Components](https://github.com/GoogleChromeLabs/howto-components) which demonstrates how to build accessible custom elements. Many folks have since asked us why we’re bothering to implement things like [checkbox](https://github.com/GoogleChromeLabs/howto-components/tree/master/elements/howto-checkbox) since there is already an accessible, native version.

Taking an even cursory look at any web framework shows that developers are going to keep building custom checkboxes, even though it’s arguably more work than using a built-in element. We’ll get to why that is in a moment, but given that’s the case, we’d like to educate developers on the best practices for doing so. Here we take inspiration from the [ARIA Authoring Practices Guide](https://www.w3.org/TR/wai-aria-practices-1.1/), and in fact all of the HowTo: Components are based on their examples. We just want to illustrate how to do them as custom elements.

So, why do developers keep reinventing this wheel?

## Built-in elements are great. Until you try to style them.

`<input>` is like the Swiss Army Knife of elements. It contains multiple different types (text, date, file...) and each of them is difficult to style. Have you ever tried to style an `<input type="file">`? It **sucks**. Here's how Mark Otto, co-creator of Bootstrap, recommends styling them on his site, [wtfforms](http://wtfforms.com):

> The file input is the most gnarly of the bunch. Here's how it works:

> - We wrap the `<input>` in a `<label>` so the custom control properly triggers the file browser.
> - We hide the default file `<input>` via `opacity`.
> - We use `:after` to generate a custom background and directive (Choose file...).
> - We use `:before` to generate and position the Browse button.
> - We declare a height on the `<input>` for proper spacing for surrounding content.
> - We add an explicit label text for assistive technologies with an `aria-label` attribute.

> In other words, it's an entirely custom element, all generated via CSS.

Not fun. I think a large reason so many sites are inaccessible is because developers run into these styling limitations and decide to just roll their own controls—without adding back in the necessary semantics and keyboard support.

> So why is it so hard to style the built-in form elements? Can't browsers make this as easy as styling a `<div>` or an `<h1>`?

Not really. Elements like `<input>` and `<select>` aren’t always implemented in terms of regular DOM elements. Sometimes they are, which is why there are articles on CSS hacks for styling `<input type="range">`. Other times they are rendered directly by the operating system - this is why a standard `<select>` comes up looking like any other native drop-down list on the platform you’re using. They are specified as a kind of black box, meaning it’s up to the browser to figure out their internals, so exposing styling hooks for them is quite difficult and often very limited. It is entirely possible that **we may never be able to style these elements to the degree we want**.

The alternative is to expose the magic behavior that these elements have as new web platform APIs. Not only will this allow us to create more flexible versions of `<input>` and `<select>`, but we can also expand the grammar to include other elements like `<multi-select-autocomplete-thing>`.

This is why I am so passionate about custom elements. In my mind, it is where the future of accessibility lives. I deeply want to be able to stop hacking CSS on top of `<select>`. I want to make my own badass, extensible, styleable, accessible elements that are just as good as the built-ins!

So as well as modeling best practices with today’s technologies, I’m hoping that HowTo: Components can help us identify areas where we can create better APIs for the next generation of web technology. We want to get to a point where we’re not forced to choose between the impossible task of styling the existing set of built-in elements, or the fiddly, error-prone and largely forgotten job of re-implementing accessibility for every new custom element.

## How do we get there?

The first step is to make sure our custom elements have the right semantics.

I’m excited for the potential of the new [Accessibility Object Model (AOM)](https://github.com/wicg/aom) proposal to help us out here. AOM lets an element define its semantics directly in the accessibility tree.

What’s the accessibility tree you ask? Ah ha! [We have a article for you!](https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/the-accessibility-tree)

As I mentioned before, a custom element is, semantically speaking, just a `<span>`, whereas the native `<button>` element has built-in accessibility because it has an implicit role of "button". While we could have our `<custom-button>` sprout ARIA attributes to define its semantics, this can get ugly fast. To recreate a `<input type="slider">` as a custom element would end up looking like:

```html
<custom-slider
  min="0"
  max="5"
  value="3"
  role="slider"
  tabindex="0"
  aria-valuemin="0"
  aria-valuemax="5"
  aria-valuenow="3"
  aria-valuetext="3"
></custom-slider>
```

And because ARIA is exclusively an HTML attributes API, it means we need to touch the DOM every time we want to update our semantic state. For an individual element this isn't so bad, but if you have hundreds of controls (perhaps inside of a table or list), having each of them call `setAttribute()` multiple times at startup could lead to a performance bottleneck.

With AOM your element can just define its semantics in its constructor like so:

```js
class CustomSlider extends HTMLElement {
  constructor() {
    super();
    this.accessibleNode.role = 'slider';
    this.accessibleNode.valueMin = 0;
    this.accessibleNode.valueMax = 5;
    this.accessibleNode.valueNow = 3;
    this.accessibleNode.valueText = 3;
  }
}
```

—and the consumer of your element doesn't have to see it sprouting attributes all over the place. Effectively, `<input type="slider">` and `<custom-slider>` become indistinguishable at the semantic level.

Some folks have even proposed giving custom elements access to a special "private" `accessibleNode` so the author can define immutable default semantics. This would mean that one could safely override an element's role, then delete that override, and things would safely fallback. For example:

```js
// default role is "slider"
// set using private accessibleNode by the element author
<custom-slider id="mySlider">

// element consumer changes role to "button"
mySlider.accessibleNode.role = "button"

// element consumer nulls role
mySlider.accessibleNode.role = null

// element falls back to default role
getComputedAccessibility(mySlider.accessibleNode).role // returns 'slider'

// note: the ability to compute the accessibility tree is
// a phase 4 AOM proposal. The line above is pseudo code :)
```

## But wait, there's more...

Another major pain point of using ARIA is the fact that all relationships must be defined using ID references. On numerous projects I've had to auto-generate unique IDs to make this system work:

```html
<custom-listbox
  role="listbox"
  aria-describedby="generated-id1 generated-id2"
  aria-activedescendant="generated-id3"
></custom-listbox>
```

Furthermore, new standards like [Shadow DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom) create scoping boundaries for IDs. If you need to point `aria-labelledby` or `aria-activedescendant` at something on the other side of this shadow boundary, you're out of luck!

AOM fixes this by allowing you to build relationships using object references. In the above example we could rewrite our listbox with:

```js
el.accessibleNode.describedBy = new AccessibleNodeList([
  accessibleNode1,
  accessibleNode2,
]);
el.accessibleNode.activeDescendant = accessibleNode3;
```

The `accessibleNodes` in the above example just come from referencing other elements on the page. No more generated IDs or cluttering up the DOM. Nice!

## Wait, wasn’t there something called is=”” for custom elements?

A counter proposal to adding all of these semantics yourself is to just inherit from the built-in elements. For custom elements this idea was specced as “[customized built-ins](https://developers.google.com/web/fundamentals/web-components/customelements#extendhtml)”. With customized built-ins you could inherit from something like [HTMLInputElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement) and then do `<input is=”custom-checkbox”>`.

Unfortunately customized built-ins have not really caught on with all of the browsers, mainly because they suffer from a few gnarly issues. Chief among these is the fact that if you inherit from another element like `<select>`, and add your own shadow root, it will blow away all of the default styling and behavior of the element. Since the primary reason you were extending the element in the first place was probably to style it, this just ends up creating more problems.

I think in the near term, new primitives like AOM and an [as of yet unspecified form submission callback](https://github.com/w3c/webcomponents/issues/187) offer a better alternative when it comes to replicating the built-in elements. Because custom elements still require JavaScript to boot up there are still open questions around progressive enhancement, but my hope is that increasingly exposing primitives will help us find other ways to solve that issue.

## Wrapping up

These are not entirely custom element concerns. Really, any component (React, Angular, etc) should be able to benefit from proposals like AOM. But custom elements are the only _standards-based_ way to define a component that can be shared amongst frameworks, so solving things at that level seems very useful.

Our plan with HowTo: Components is to continue to build custom element equivalents of the built-ins so we can educate developers, and push these standards forward. We’ll also be updating the docs to [explicitly call out the limitations](https://github.com/GoogleChromeLabs/howto-components/pull/121) custom elements currently face, and when using a built-in might make more sense. We would love help landing all of the [ARIA Authoring Practices examples](https://www.w3.org/TR/wai-aria-practices-1.1/) as custom elements and plan to push things even further in future quarters by exploring more complex widget types. If you’re interested in pitching in, please feel free to open up a pull request over at the [HowTo: Components repo](https://github.com/GoogleChromeLabs/howto-components) and if you want to learn more about AOM you can check it out in [the Web Incubation Community Group repo](https://github.com/wicg/aom).

_Big thanks to [Alice Boxhall](https://twitter.com/sundress), [Matt Gaunt](https://twitter.com/gauntface), and [Surma](https://twitter.com/dassurma) for reviewing this blog post._


---
title: Using jQuery Deferred to Load an Underscore Template
tags:
  - Chain
  - jQuery
  - Promises
  - Underscore
date: 2012-05-30T15:53:00.000Z
updated: 2014-12-30T08:09:30.000Z
---Today's post is meant to scratch an itch I had the other day regarding templates. My friend wanted to load an underscore template along with some JSON data but wasn't sure what the best approach would be.

Since I'm using Backbone Boilerplate I've gotten used to having my template loading method already stubbed out for me. Here's the one they use:

```js
fetchTemplate: function(path, done) {
  var JST = window.JST = window.JST || {};
  var def = new $.Deferred();

  // Should be an instant synchronous way of getting the template, if it
  // exists in the JST object.
  if (JST[path]) {
    if (_.isFunction(done)) {
      done(JST[path]);
    }

    return def.resolve(JST[path]);
  }

  // Fetch it asynchronously if not available from JST, ensure that
  // template requests are never cached and prevent global ajax event
  // handlers from firing.
  $.ajax({
    url: path,
    type: "get",
    dataType: "text",
    cache: false,
    global: false,

    success: function(contents) {
      JST[path] = _.template(contents);

      // Set the global JST cache and return the template
      if (_.isFunction(done)) {
        done(JST[path]);
      }

      // Resolve the template deferred
      def.resolve(JST[path]);
    }
  });

  // Ensure a normalized return value (Promise)
  return def.promise();
}
```

Not having previous experience working with [jQuery.Deferred](http://api.jquery.com/category/deferred-object/) I was initially put-off by the idea of just copy/pasting this function over to him, especially since I couldn't explain what was going on. I knew that I probably wanted to use Deferreds and Promises but I wasn't sure how best to explain the concepts nor did this method seem to do much in the way of loading JSON, it was just for loading templates. Since my friend only wanted to load 1 template and 1 JSON file I thought it best for us to start small, and to write something that we could easily debug. Knowing I wanted to use Deferreds I found [this wonderful article by Addy Osmani and Julian Aubourg](http://msdn.microsoft.com/en-us/magazine/gg723713.aspx) detailing how Deferreds work. It is VERY comprehensive and for our purposes I only needed to read the first few paragraphs before I had enough to start.

In a nutshell deferreds are objects which contain promises (also objects). Promises can be in various states, `pending`, `resolved` or `rejected`. Once you have a deferred (or it's promise) you can hook functions on to it so when it changes from a `pending` to `resolved` state all those functions fire. It's actually the promise that changes state but you can use the deferred like a promise because in most cases it will just proxy the calls to its promise object. Using deferreds can be nice for several reasons. For starters, you can avoid the jQuery _pyramid of doom_

```js
// NOOOOOOoooooooooo

$.ajax({
  url: 'foo.php',
  success: function() {
    $.ajax({
      url: 'bar.php',
      success: function() {
        $.ajax({
          url: 'baz.php',
          success: function() {
            ...
          }
        })
      }
    })
  }
})
```

Secondly your deferreds/promises are little tokens that you can hand out from your services so other actors don't have to get all up in your ajax guts. Someone makes an API request, you give em a token, when it resolves they play with the data.

```js
function doSomethingWithHugeData(data) {
  console.log("man, look at all these 1's and 0's!");
}

var dfd = myService.getSomeHugeData();
dfd.done(doSomethingWithHugeData);
```

This is a much nicer approach than passing in a callback that your service will need to execute whenever it finishes getting its data. Your service shouldn't care about your callbacks. It should care about getting data and letting people know when that data's been got! :D

### But I digress...

We were _trying_ to load some JSON and a template, so let's get back to the task at hand. Since we know that we have two ajax calls, one for the JSON and one for the template, and we know that we don't really want to do anything till both of these calls have completed we've got a perfect use case for [\$.when](http://api.jquery.com/jQuery.when/). `when` accepts a list of deferreds/promises and acts as one big deferred, waiting for all of its children to resolve before it resolves. This is a nice way to build a sequencer. In our case we're going to take two ajax calls and toss them into `$.when`. When it resolves we'll use `$.then` to tell it what our success and failure callbacks should be.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Deferred Sandbox</title>
    <script src="jquery.js"></script>
    <script src="underscore.js"></script>
  </head>
  <body>
    <div id="main"></div>

    <script>
      $(function() {
        function successFunc(jsonRes, templateRes) {
          var json = _.first(jsonRes);
          var template = _.first(templateRes);
          var compiled = _.template(template, json);
          $('#main').html(compiled);
        }

        function failureFunc() {
          console.log('fail whale!');
        }

        $.when($.ajax('person.json'), $.ajax('person.template.html')).then(
          successFunc,
          failureFunc
        );
      });
    </script>
  </body>
</html>
```

In our case everything is in the same folder as index.html so there's no need for any paths. Keep in mind that in most (all?) browsers you'll need to be running a local server for the above code to actually work. In Chrome, at least, you can't run an html file from file:// and have it load external resources, it'll complain that the access-origin is not allowed.

Let me take a moment to explain `$.then` a little bit. We know that `$.ajax` returns a deferred, and that the deferred's promise can be in three states: `pending`, `resolved`, `rejected`. So if we did something like this:

```js
var dfd = $.ajax('foobar.php');
```

`dfd` would be a deferred object with a `pending` promise. Deferred's let us link methods up to them for when their state changes. These methods are: `done()`, `fail()`, `always()`, `progress()`, and `then()`. There are more but [I'll let the documentation explain them.](http://api.jquery.com/category/deferred-object/)`done()` and `fail()` each accept either a single callback or an array of callbacks to be fired when the deferred changes to either the `resolved` or `rejected` state.

```js
function successFunc() {
  console.log('success! do stuff with data!');
}

function failureFunc() {
  console.log('failure! um...give up!');
}

var service = {
  getJSON: function() {
    return $.ajax('person.json');
  }
};

service
  .getJSON()
  .done(successFunc)
  .fail(failureFunc);
```

`always()` fires its callbacks regardless of whether the deferred was `resolved` or `rejected`. This might be a good place to put any cleanup code. `progress()` is fired during any progress events that the process might emit. Finally there's `then()` which is what we're using in our template example. `then()` is essentially shorthand for `done()` and `fail()` so you can pass it two callbacks or two arrays of success/fail callbacks.

Hopefully that's helpful for you all and you can go back and clean up some of those pyramids that might be lingering in your code. Till tomorrow! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Reserved, Sedate
- Sleep: 7
- Hunger: 4
- Coffee: 0


---
title: Which elements support shadow DOM?
tags:
  - Shadow DOM
  - Web Components
excerpt: A quick look at which elements do—and don't—support shadow DOM.
date: 2019-01-13T16:56:36.000Z
updated: 2019-01-13T16:56:36.000Z
---

[Oliver on twitter asked](https://twitter.com/Oliver41618769/status/1084275850441355265):

> _Is there a list somewhere of which HTML elements can and can't have a shadow DOM?_

As it turns out, there is! (Big thanks to [Anne van Kesteren](https://annevankesteren.nl/) for [showing us the way](https://twitter.com/annevk/status/1084426928965238787?s=19)).

> If [context object](https://dom.spec.whatwg.org/#context-object)’s [local name](https://dom.spec.whatwg.org/#concept-element-local-name) is **not** a [valid custom element name](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name), `article`, `aside`, `blockquote`, `body`, `div`, `footer`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `header`, `main`, `nav`, `p`, `section`, or `span`, then [throw](https://heycam.github.io/webidl/#dfn-throw) a ` NotSupportedError``DOMException `.

Here's a quick example using `div`:

<div class="glitch-embed-wrap" style="height: 420px; width: 100%;">
  <iframe
    src="https://glitch.com/embed/#!/embed/shadow-dom-elements?path=script.js&previewSize=100"
    title="shadow-dom-elements on Glitch"
    allow="geolocation; microphone; camera; midi; vr; encrypted-media"
    style="height: 100%; width: 100%; border: 0;"
  ></iframe>
</div>

## Exceptions

It's worth calling out that `button`, `input`, `select`, `img`, and `a` are not on this list and will throw an error if you try to attach a shadow root to them. If you need to use them you'll probably need to look into either wrapping these elements or using [a type extension](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#High-level_view).


---
title: Why you can't test a screen reader (yet)!
date: 2018-01-02T17:42:55.000Z
updated: 2018-01-07T01:57:23.000Z
tags:
  - Accessibility
---

When I first started to learn about accessibility I wanted to write automated tests to ensure that assistive technology devices, like screen readers, were interpreting my pages correctly. Because I'm not a daily screen reader user, I figured it would be easy for a regression to slip in unnoticed.

This idea, testing a screen reader, proved much harder than I thought. It's actually a bit of a holy grail in the accessibility space. Something that many have dreamed of, but few—if any—have achieved.

To understand why this is, it helps to know a bit about the process your page goes through when it finally gets announced by a screen reader.

## The Accessibility Tree

When Chrome parses the DOM and the CSSOM it produces a tree of nodes. You may have heard folks on my team refer to this as the **render tree**. It tells the browser what to paint on screen, and when to omit things hidden by CSS.

But what many don't know is that during this process there's a second tree created called the **accessibility tree**. This tree removes all the nodes which are semantically uninteresting and computes the roles/states/properties for the remaining nodes. Similar to the render tree, it will also remove nodes hidden by CSS.

So, given the following HTML:

```html
<html>
  <head>
    <title>How old are you?</title>
  </head>
  <body>
    <label for="age">Age</label>
    <input id="age" name="age" value="42" />
    <div>
      <button>Back</button>
      <button>Next</button>
    </div>
  </body>
</html>
```

Chrome would produce an accessibility tree that looks something like:

```text
id=1 role=WebArea name="How old are you?"
    id=2 role=Label name="Age"
    id=3 role=TextField labelledByIds=[2] value="42"
    id=4 role=Group
        id=5 role=Button name="Back"
        id=6 role=Button name="Next"
```

Next Chrome needs to convert these nodes into something the user's operating system can understand. On Windows it will produce a tree of IAccessible objects, and on macOS it will use NSAccessibility objects. Finally, this tree of OS-specific nodes gets handed off to a screen reader, which interprets it, and chooses what to say.

_If you're really interested, you can check out [this doc which explains a lot more about how accessibility works in Chromium](https://chromium.googlesource.com/chromium/src/+/lkgr/docs/accessibility/overview.md)._

So it's pretty tricky to know what any specific browser + OS + screen reader combo will announce. There are differences in how each browser builds its accessibility tree, there are differences in how well each browser supports ARIA, and there are differences in how the various screen readers interpret the information browsers give to them. Oof!

## So how do we test this stuff?

Rather than test what a screen reader announces, a better place to start might be to test the accessibility tree itself. This avoids some of the layers of indirection mentioned above.

If you [follow me on twitter](https://twitter.com/rob_dodson), you've probably heard me mention a new standard we're working on called the [Accessibility Object Model](https://github.com/wicg/aom) or "AOM", for short. There are a number of features AOM seeks to achieve, but one that I'm most excited about is the ability to compute the accessibility information for a given node.

```js
const {role} = await window.getComputedAccessibleNode(element);
assert(role, 'button');
```

_Note, this API is still being sketched out so the final version may be different from the snippet above._

When this lands (hopefully in 2018) we should be able to start writing unit and integration tests that ensure our components are properly represented in the browser's accessibility tree. That's pretty darn close to Holy Grail territory!

Aside from AOM, there are linters and auditors we can use today, like [eslint-plugin-jsx-a11y](https://github.com/evcohen/eslint-plugin-jsx-a11y), [Lighthouse](https://developers.google.com/web/tools/lighthouse/), [axe](https://github.com/dequelabs/axe-core), and [pa11y](http://pa11y.org/). Ultimately we'll want to use a combination of these tools plus AOM tests to monitor the accessibility of our apps. If you haven't seen Jesse Beach's talk, [Scaling accessibility improvements with tools and process at Facebook](https://www.youtube.com/watch?v=vmA4TS3IbVQ), I recommend you give it a look to see how an organization the size of Facebook is integrating these tools into their process.

To wrap up, I think testing the output of a screen reader may still be a ways off, but in 2018 we're going to have more tools in our toolbox than ever before. If you want to learn more about accessibility fundamentals you can check out this [free Udacity course](https://bit.ly/web-a11y) and if you'd like to start incorporating more accessibility work into your team practice take a look at [my session from this year's Google I/O](https://www.youtube.com/watch?v=A5XzoDT37iM). I'm really excited to see what you all build in 2018 😁

Happy new year!

Rob


---
title: Wrapping up the Word Count Spider
tags:
  - Ruby
  - Chain
date: 2012-06-22T07:31:00.000Z
updated: 2014-12-31T00:13:45.000Z
exclude: true
---

Yeesh, I gotta stop writing so late at night... Last night I was trying to get my spider to follow all the links on the blog's archive page and then sum up all the words from every post. Unfortunately I was way too tired to get that to actually work. Tonight I finished that step of the process but it required some ugly code and refactoring our unit tests. Without further adieu...

```ruby
require 'yaml'
require 'json'
require_relative 'options'
require_relative 'crawler'

module Tentacles
  class Runner

    def initialize(config)
      @options = Tentacles::Options.new(config)
      @path = File.dirname(__FILE__) + '/../../output/'
      @filename = 'word_count.json'
    end

    def run
      @crawler = Tentacles::Crawler.from_uri(@options.uri)
      output = @crawler.words_by_selector(@options.post_selector, @options.ignored_post_selector)

      Dir.mkdir(@path) unless Dir.exists?(@path)

      File.open(@path + @filename, "w") do |file|
        file.puts JSON.pretty_generate(output)
      end
    end
  end
end


require 'open-uri'
require 'nokogiri'
require 'mechanize'

module Tentacles
  class Crawler

    attr_reader :doc

    def self.from_uri(uri)
      new(uri)
    end

    def initialize(uri)
      # Create a new instance of Mechanize and grab our page
      @agent = Mechanize.new

      @uri = uri
      @page = @agent.get(@uri)
      @counts = Hash.new(0)
    end

    def words_by_selector(selector, ignored_selector = nil)
      # Get all the links on the page
      post_links = @page.links.find_all { |l| l.attributes.parent.name == 'h1' }
      post_links.shift # Get rid of the first anchor since it's the site header
      post_links.each do |link|
        post = link.click
        @doc = post.parser
        nodes = nodes_by_selector(selector)
        nodes.each do |node|
          if ignored_selector
            ignored = node.css(ignored_selector)
            ignored.remove()
          end
          words = words_from_string(node.content)
          count_frequency(words)
        end
      end

      sorted = @counts.sort_by { |word, count| count }
      sorted.reverse!
      sorted.map! do |word, count|
        { word: word, count: count }
      end
      { word_count: sorted }
    end

    def metadata_by_selector(selector)
      node = nodes_by_selector(selector).first
      metadata = {}
      node.children.each do |child|
        child.content
      end
    end

  private

    def nodes_by_selector(selector)
      nodes = @doc.css(selector)
      raise Tentacles::SelectionError,
        'The selector did not return an results!' if nodes.empty?
      nodes
    end

    def words_from_string(string)
      string.downcase.scan(/[\w']+/)
    end

    def count_frequency(word_list)
      for word in word_list
        @counts[word] += 1
      end
      @counts
    end
  end
end
```

One of the first things I realized what that my paths to the output folder were getting all weird depending on the context in which I was running my tests. So I switched to using Ruby's `__FILE__` to create paths relative to our crawler. `words_by_selector` is kind of gross with some nested iterators but whatever, it works. We will probably need to refactor it when we get the metadata spider working. For now I'm just glad that it actually visits all the pages and produces the right output.

```ruby
require_relative '../lib/tentacles/runner'
require 'helpers'
require 'fakeweb'

describe Tentacles::Runner do
  include Helpers

  before do
    @runner = Tentacles::Runner.new(relative_path + '/../lib/tentacles/config.yml')

    # Create a mock options object
    @options = {
      uri: 'http://robdodson.me/blog/archives',
      post_selector: '.entry-content',
      ignored_post_selector: 'ul:last-child',
      metadata_selector: '.entry-content ul:last-child'
    }
    @path = File.dirname(__FILE__) + '/../output/'
    @filename = 'word_count.json'
  end

  subject { @runner }

  it { should respond_to(:run) }

  describe "when parsing the config file" do
    it "should raise an error if the config file is missing" do
      expect { runner = Tentacles::Runner.new('') }.to raise_error(Errno::ENOENT)
      expect { runner = Tentacles::Runner.new(nil) }.to raise_error(TypeError)
    end

    it "should raise an error if the config file is invalid" do
      expect { runner = Tentacles::Runner.new(relative_path + '/mocks/invalid_yaml.yml') }.to raise_error(Psych::SyntaxError)
    end

    it "should create a directory for our output" do
      @runner.run
      Dir.exists?(@path).should be_true
    end

    it "should output the correct JSON" do
      @runner.run
      File.open(@path + @filename) do |file|
        file.each_line do |line|
          puts line
        end
      end
    end
  end
end
```

Our spec also needed updating so it could find the output directory properly. One downside to our current hacked-together setup is that I haven't produced a proper mock for things so the test takes FOREVER to run. Something like 30+ seconds because it's actually crawling our site instead of just hitting a dummy file. Definitely need to fix that at some point :)

But once we get it all working the output from robdodson.me ends up looking like this:

```json
{
  "word_count": [
    {
      "word": "the",
      "count": 1678
    },
    {
      "word": "to",
      "count": 1548
    },
    {
      "word": "a",
      "count": 1023
    },
    {
      "word": "i",
      "count": 792
    },
    {
      "word": "it",
      "count": 730
    },
    {
      "word": "and",
      "count": 718
    },
    {
      "word": "this",
      "count": 661
    },
    {
      "word": "of",
      "count": 658
    },
    {
      "word": "you",
      "count": 640
    },
    {
      "word": "that",
      "count": 585
    },
    {
      "word": "we",
      "count": 569
    }
  ]
}
```

We can use that JSON to start graphing which I'll hopefully have time to get into before going to Europe. We shall seeeeee. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired
- Sleep: 6
- Hunger: 0
- Coffee: 1


---
title: Writing a Command Line Tool in Ruby
tags:
  - Ruby
  - Chain
date: 2012-06-13T14:29:00.000Z
updated: 2014-12-30T23:47:54.000Z
---Yesterday I tried to do a post on creating your first Ruby Gem as a command line tool. [It didn't go very well.](http://robdodson.me/blog/2012/06/12/messing-around-with-gems/) In an effort to better understand what goes on with command line tools I'm going to start from the most basic, a ruby script that is in our `PATH`.

I've previously added the folder `~/bin` to my PATH so I know that if I drop an executable script in there I should be able to run it by just typing its name. Let's give that a shot. First we'll make a new file just called `sherp` without any file extension. Make sure to `chmod 755 sherpa` so that it's executable. Then we'll add the following:

```bash
#!/usr/bin/env ruby

puts 'I am the sherpa!!!'
```

If I now type `sherpa` into the command line, it should fire back `I am the sherpa!!!`

Ok cool so we've got that part working. Now let's see if we can get some arguments in there. We'll iterate the `ARGV` object to see what comes in.

```bash
#!/usr/bin/env ruby

ARGV.each do |arg|
    puts arg
end
```

With that little bit of code we should be able to pass just about anything to our command and have it echoed back.

```bash
sherpa foo bar baz

=> foo
=> bar
=> baz
```

Ok cool. Now let's step this up a notch or two. Let's say we want to send in commands and options. For that we'll use the built-in [OptionParser](http://ruby-doc.org/stdlib-1.9.3/libdoc/optparse/rdoc/OptionParser.html). Here's [a link to the article I've been following which details how to use the OptionParser.](http://rubylearning.com/blog/2011/01/03/how-do-i-make-a-command-line-tool-in-ruby/) In my case, I'm going to tell `sherpa` to either `say_hello` or `say_goodbye`. When I pass in the `-n` flag it should accept a name, otherwise it will use the name 'Master'. So the line `sherpa say_hello -n Rob` should produce `Hello Rob` and likewise if I left off the option and just used `sherpa say_hello` it should produce `Hello Master`.

Here's the code to accomplish this:

```bash
    #!/usr/bin/env ruby

    require 'optparse'

    options = {}

    opt_parser = OptionParser.new do |opt|
      opt.banner = "Usage: opt_parser COMMAND [OPTIONS]"
      opt.separator  ""
      opt.separator  "Commands"
      opt.separator  "     name: the name the sherpa should use when addressing you"
      opt.separator  ""
      opt.separator  "Options"

      opt.on("-n","--name NAME","tell the sherpa what to call you") do |name|
        options[:name] = name
      end

      opt.on("-h","--help","help") do
        puts opt_parser
      end
    end

    opt_parser.parse!
    name = options[:name] || 'Master'

    case ARGV[0]
    when "say_hello"
      puts "Hello #{name}"
    when "say_goodbye"
      puts "Goodbye #{name}"
    else
      puts opt_parser
    end
```

And there we go, our first command line Ruby tool. I'll pick it up tomorrow to try to improve upon it. We're starting small but at least we have something that works!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Patient
- Sleep: 6
- Hunger: 1
- Coffee: 0


---
title: Yeoman Polymer and Gulp
date: 2015-02-13T20:28:30.000Z
updated: 2015-02-13T20:28:30.000Z
exclude: true
---

Finally managed to get [v0.7 of the Polymer Yeoman generator](https://github.com/yeoman/generator-polymer/releases/tag/v0.7.0) out. This release includes Gulp support, BrowserSync, and a sweet little Material Design scaffold to get people started.

[![Yo polymer](/images/2015/02/yolomer.png)](https://github.com/yeoman/generator-polymer/releases/tag/v0.7.0)

This release took a while to put together but I'm really happy to finally have it out there. It's my first time working with Gulp and it was quite the learning experience. If you have issues please be sure to open a thread over on [the GitHub tracker](https://github.com/yeoman/generator-polymer/issues).

Enjoy!


---
title: Why I'm turning my home into a virtual power plant
date: 2022-04-08
description: A group of startups are making it possible for consumers to pool their resources and act as nodes in virtual power plants. This makes the grid smarter and more resilient, while also rewarding the consumers with financial incentives.
socialImage: /images/virtual-lightbulb.jpg?1
socialImageAlt: A 3D lightbulb
tags:
  - climate
  - demand response
  - smart home
  - virtual power plant
  - ohmconnect
  - voltus
---

On September 9th 2020, I woke up to find that the sky outside of my window looked like this:

![The San Francisco skyline. The entire city is dark orange, almost as if it were a photo taken on Mars.](/images/orange-sf.jpg 'San Francisco, September 2020')

Smoke from nearby wildfires was trapped over the Bay Area, making the region look like the surface of Mars. It's hard to describe the feeling of walking around my neighborhood with it looking like the set of Blade Runner, but the one thing I can say is that it made the immediacy of climate change paramount.

That morning a switch flipped in my brain. I couldn't keep doing my job and ignoring what was literally happening outside of my window. I decided to leave Google to look for a role doing something—anything!—connected to climate.

Today I want to talk about a clever idea I learned about during my job search. I think it is potentially a transformational new industry and one that many, if not all of us, will participate in: turning every home (and apartment) into a virtual power plant ⚡️

On the surface that just sounds cool, right? But what does it actually mean? To understand how it works we first have to understand how the grid operates and what happens when there's not enough power to go around.

## How the grid works

The power grid is a balancing act—there’s the amount that consumers are trying to use—the **demand**—and there’s the amount being generated by power plants—the **supply**.

Sometimes, like on the hottest day of the year when everyone is running their air conditioners, demand outpaces supply. During these times, the grid operator has to go to the energy market to buy more power to respond to the demand.

Depending on the situation, this might mean calling up a **peaker plant**. These are fast-acting—and very dirty—fossil fuel plants that can ramp up quickly.

There are a number of problems with peaker plants:

1. They’re expensive to operate

   > A new report has found that New Yorkers over the last decade have paid more than \$4.5 billion in electricity bills to the private owners of the city’s peaker plants, just to keep those plants online in case they’re needed — even though they only operate between 90 and 500 hours a year. [source](https://grist.org/justice/these-dirty-power-plants-cost-billions-and-only-operate-in-summer-can-they-be-replaced/#:~:text=A%20new%20report%20has%20found%20that%20New%20Yorkers%20over%20the%20last%20decade%20have%20paid%20more%20than%20%244.5%20billion%20in%20electricity%20bills%20to%20the%20private%20owners%20of%20the%20city%E2%80%99s%20peaker%20plants%2C%20just%20to%20keep%20those%20plants%20online%20in%20case%20they%E2%80%99re%20needed%20%E2%80%94%20even%20though%20they%20only%20operate%20between%2090%20and%20500%20hours%20a%20year.)

2. They’re dirty

   > Many of these facilities are 50 or more years old, lack modern pollution controls, and run on dirty fuels like kerosene or oil [source](https://grist.org/justice/these-dirty-power-plants-cost-billions-and-only-operate-in-summer-can-they-be-replaced/#:~:text=Many%20of%20these%20facilities%20are%2050%20or%20more%20years%20old%2C%20lack%20modern%20pollution%20controls%2C%20and%20run%20on%20dirty%20fuels%20like%20kerosene%20or%20oil%20at%20least%20part%2Dtime.)

3. They damage the health of our communities
   > They're predominantly located near population centers where energy demands are greatest and typically located in communities of color and under-resourced areas. There are more than 1,000 peakers in operation across the country today [source](https://www.usnews.com/news/cities/articles/2020-05-27/its-time-to-shut-down-polluting-urban-power-plants#:~:text=They%27re%20predominantly%20located,major%20metropolitan%20areas.)

Ironically, as we’ve moved from using fossil fuels to renewables like wind and solar, [some electric utilities have proposed building _more_ peaker plants](https://www.eenews.net/articles/fight-over-peaker-plants-poses-grid-climate-test/) to make up for the intermittent nature of renewables.

An alternative to peaker plants is that we could all agree to use less energy when the grid is under strain. But this presents a coordination problem: consumers don’t know when the grid is under strain, so they don’t know when to use less energy, and therefore grid operators cannot rely on these energy savings.

So how do we solve this coordination problem?

## Demand response

As I mentioned earlier, the power grid is a balancing act. One way to balance the grid when demand is high is to generate more power. The other way is to lower demand, a.k.a. "demand response".

In other words, if you and I agree to unplug our refrigerators for an hour when the grid is under strain, then we help rebalance the grid by lowering the demand.

Where this gets interesting is when you think about **aggregating that collective action**. Instead of unplugging one refrigerator for an hour, we unplug one million. Now we’re talking about _megawatts_ of power that can be “generated”, on-demand, to rebalance the grid.

Technically we're not generating new power, but the net effect is the same. If the grid needs one megawatt of power, and we turn off one megawatt’s worth of refrigerators, then everything evens out.

Rather than thinking of these as megawatts generated, you can instead think of them as **“negawatts”** saved (yes, that is an actual term used in the industry).

If we all knew when to turn off our refrigerators (or thermostats/lights/space heaters/air purifiers/EV chargers/etc.), and we understood energy markets well enough to sell energy into them, then we could act as a kind of **virtual power plant**. When a grid operator needs power, instead of going to a dirty peaker plant, they could instead call up our virtual power plant and **pay us** for our negawatts!

It might seem odd to think about selling energy that we _didn’t_ use, but according to the Federal Energy Regulatory Commission (FERC), [we can do just that](https://www.ferc.gov/industries-data/electric/power-sales-and-markets/demand-response#:~:text=In%202011%2C%20the,is%20cost%2Deffective.). Negawatts are priced and sold just like megawatts.

To do this sort of collective action, we need _aggregators_: someone to tell us when to reduce our energy consumption, who can handle selling that energy on our behalf. This is where startups like [Voltus](https://www.voltus.co/) and [OhmConnect](https://ohm.co/lets-email-rob) (to name a few) enter the picture.

These companies present themselves as virtual power plants to grid operators and sell negawatts at a cost per kilowatt hour. They generate these negawatts by sending notifications to their users who then reduce their energy consumption during specific times. When Voltus or OhmConnect gets paid by the grid operator, they pass a percentage of that payment on to their users.

Voltus mostly targets industrial customers (steel mills, factories, etc.) but they told me that they plan to do more consumer demand response soon. OhmConnect, on the other hand, is entirely consumer facing and currently operates in California, Texas, and New York. I’ve been using OhmConnect since February 2022—about two months—and have so far earned around \$100 through a combination of energy savings and referrals.

While the money is a nice bonus, what most excites me about OhmConnect is feeling like I'm participating in a social experiment to improve grid intelligence and help the climate. I had wanted to add smart lights and plugs to my home for convenience, but this creates an additional incentive when I can think of my home as (part of) a virtual power plant.

Let me walk you through an example so you can see how it works.

## One OhmHour

When the grid is really busy, OhmConnect sends me a notification with a specific time—an **OhmHour**—during which I should ramp down my power consumption. OhmHours typically occur once per week, and they notify me a day or so in advance, and then an hour before the event begins.

During the OhmHour I'm rewarded in points—called **watts**—based on how much I reduce my consumption. Watts can be exchanged for cash (via PayPal), spent on discounted smart devices, or used for contests: free groceries for a year, an e-bike, that sort of thing. OhmConnect also pays me cash for referring new users. It varies by state, but I earn $40 if I refer a fellow Californian, and the referee receives $10.

There’s no requirement to connect devices to OhmConnect—you can walk around your house and manually turn things off during an OhmHour—but I found it easier to let them do it for me, plus I receive bonus watts for every connected device. So I connected my Nest thermostat and a smart plug powering my refrigerator to their system.

During the event I'm graded on how much energy I save compared to my previous 10-day average. For example, on March 16th from 7-8pm, I reduced my consumption down to 0.19kWh from an average of 0.43kWh.

![My OhmConnect dashboard showing an bar area chart comparing my typical 10-day usage versus my usage during the OhmHour. The chart shows a 57% reduction in power.](/images/ohmhour.jpg 'My OhmConnect dashboard')

I didn't have to radically alter my life to achieve these savings. During this specific event, I was watching TV on the couch with my wife. But prior to the OhmHour starting I turned off the unused lights in my house and put my dishwasher on a timer so it would start later in the evening. My refrigerator automatically turned off and my thermostat switched to eco mode.

_Brief aside: Did you know that most dishwashers have a timed start feature? This is really helpful if you're on a peak time-of-use electricity plan!_

In total I earned 605 watts during that OhmHour: 245 watts in energy savings + 360 bonus watts for having two smart devices connected to my account (320 for my thermostat and 40 for my smart plug). Because you can use watts to buy more smart devices, which then grant additional watt bonuses, you can see how this turns into a positive feedback loop.

## Is this a scam?

OhmConnect is clearly trying to gamify this process—apparently the CTO used to work at Zynga—so there are streaks and levels that increase the discounts you receive when you exchange your watts for smart devices. You can also spend watts to increase your referral bonus, something I’ve done in the past before referring a few of my friends.

Does it feel a _tad_ like a multi-level marketing scheme? Sure. But if you understand the demand response / virtual power plant model, you can see that they’re actually making money by selling negawatts to grid operators and paying you a percentage of that when you cash out your watts or use them to buy subsidized smart devices.

So it really is more of a social game where reducing CO2 is the goal and there are financial incentives. It's a novel approach to climate change because it takes the addictive engagement and recruitment model of Farmville but uses that power for good. Who would have ever thought that Farmville could help save the planet?!

## Privacy concerns

I think it’s fair to mention that participating in OhmConnect does require sharing some data. For OhmConnect to work, it first needs to know how much energy you're using, which means giving them access to your energy data via your utility's website. In addition, you're rewarded for connecting smart devices to your account, which lets OhmConnect turn those devices off during an OhmHour.

I can totally understand being concerned about a third-party having the ability to turn off your refrigerator, but you can always opt-out of the OhmHour or walk over and turn your refrigerator back on (or through the smart plug app on your phone). Another option is to only use the smart plugs for less critical devices.

Since you're only rewarded based on your energy savings, if you choose to completely ignore the OhmHour there's no real penalty, you just won't earn any watts.

The way I see it, giving OhmConnect the ability to ramp down my power consumption acts as a kind of backpressure model for the grid, so even if I’m not at home, my devices can quickly switch off and hopefully do a bit of good. Also, I’ve learned that an unopened refrigerator has enough thermal inertia to safely be off for around four hours 😄

## Give it a shot!

If you’re interested in trying OhmConnect you can use [my referral](https://ohm.co/lets-email-rob) and we’ll both get some money 🙌 When you sign up they will offer to send you a smart plug for $1. Technically you have to pay the full $11 and then they refund you \$10 if you connect the device to your account (I can verify that they did refund me).

If you want to learn more about their business I recommend checking out the [My Climate Journey interview with their CEO, Cisco DeVries](https://my-climate-journey.simplecast.com/episodes/cisco-devries).

I should also mention that both OhmConnect and Voltus are hiring!

- [OhmConnect jobs](https://climatebase.org/jobs?l=&q=ohmconnect&p=0)
- [Voltus jobs](https://climatebase.org/jobs?l=&q=voltus&p=0)

I think this is such a cool space and am excited to see where these companies go in the future. If you do give OhmConnect a shot, give me a shout on [Twitter](https://twitter.com/rob_dodson) and let me know how it goes for you!


