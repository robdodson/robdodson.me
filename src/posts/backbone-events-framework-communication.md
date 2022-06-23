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
