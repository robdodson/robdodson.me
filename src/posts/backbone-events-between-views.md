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
