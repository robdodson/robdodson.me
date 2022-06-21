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
---

Continuing from [yesterday's post](http://robdodson.me/blog/2012/05/28/mocking-requests-with-mocha-chai-and-sinon/) I'm going to start to incorporate Backbone into my BDD setup. I'm going to use the [Backbone Boilerplate](https://github.com/tbranyen/backbone-boilerplate) and [grunt-bbb](https://github.com/backbone-boilerplate/grunt-bbb) to setup a new project. If you're new to the boilerplate or grunt-bbb [checkout my previous post on getting started.](http://robdodson.me/blog/2012/05/17/getting-familiar-with-backbone-boilerplate/)

### Shiny and new

I've created a new directory called `amd-tests` and once I `cd` inside I run `bbb init` to template out a new project. By default the boilerplate uses Require.js and AMD modules and we have a little example one already created for us. It's called, well, Example :) We'll use this to create our model for testing since I know that everyone should be on the same page with this module.

I'm going to change our model's name from Example.Model to Example.Photo so our terminalogy won't get muddy. We'll give it some default properties for `src` and `caption`. Later on we'll test that a freshly created model has these same defaults. When we're done setting up our `/app/example.js` file should look like this. Keep in mind that the boilerplate adds a lot of stuff to get us started so you can ignore everything that isn't Example.Photo

```js
define([
  'namespace',

  // Libs
  'use!backbone',

  // Modules

  // Plugins
], function (namespace, Backbone) {
  // Create a new module
  var Example = namespace.module();

  // !!! Our awesome new model !!!
  Example.Photo = Backbone.Model.extend({
    defaults: {
      src: '/images/placeholder.jpg',
      caption: 'Waiting for content...',
    },
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

    render: function (done) {
      var view = this;

      // Fetch the template, render it to the View element and call done.
      namespace.fetchTemplate(this.template, function (tmpl) {
        view.el.innerHTML = tmpl();

        // If a done function is passed, call it with the element
        if (_.isFunction(done)) {
          done(view.el);
        }
      });
    },
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
    use: '../assets/js/plugins/use',
  },
  use: {
    backbone: {
      deps: ['use!underscore', 'jquery'],
      attach: 'Backbone',
    },
    underscore: {
      attach: '_',
    },
    mocha: {
      attach: 'mocha',
    },
  },
  priority: ['jquery', 'underscore', 'common'],
});

mocha.setup({
  ui: 'bdd',
  ignoreLeaks: true,
});

// Protect from barfs
console = window.console || function () {};

var runMocha = function () {
  mocha.run();
};
```

Lots of stuff here but nothing to get alarmed about. [If you've read my previous getting started post you'll know all about the config.js file.](http://robdodson.me/blog/2012/05/17/getting-familiar-with-backbone-boilerplate/) Go back and read the previous post if none of this makes sense to you. The thing to take note of is the `priority` array and the `runMocha` function at the bottom of the page. I don't have much experience with the priority array and I didn't find much documentation on it but Kelly uses it [in the gists](https://gist.github.com/2655876) to make sure that jQuery, chai and any chai plugins are properly setup on the page.

```js
// Include and setup all the stuff for testing
define(function (require) {
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
define(function (require) {
  var Example = require('modules/example');

  describe('Example', function () {
    describe('Photo', function () {
      var photo = new Example.Photo();
      it('should have proper defaults', function (done) {
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
