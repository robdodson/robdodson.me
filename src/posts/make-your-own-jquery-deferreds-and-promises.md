---
title: Make Your Own jQuery Deferreds and Promises
tags:
  - Chain
  - jQuery
  - Promises
date: 2012-06-04T03:33:00.000Z
updated: 2014-12-30T23:20:41.000Z
---

Last week [I did a post on how to load an Underscore template using jQuery's Deferred method](http://robdodson.me/blog/2012/05/30/using-jquery-deferred-to-load-an-underscore-template/). I got some great feedback from folks and decided I should do a follow up showing how to create your own Deferreds.

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
  initialize: function ($el) {
    // Store a reference to our element
    // on the page
    this.$el = $el;
  },
  fadeOut: function () {
    // Create a new Deferred.
    var dfd = new $.Deferred();

    this.$el.animate(
      {
        opacity: 0,
      },
      2000,
      function () {
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
  },
};

$(function () {
  // Hook the container object up to the #container div
  container.initialize($('#container'));

  // Instruct the container to fade out. When we call
  // fadeOut we should get a promise back as a return value
  var promise = container.fadeOut();

  // Now that we have a promise we can hook a done callback
  // onto it. The done() method will fire once the promise
  // is resolved.
  promise.done(function (message) {
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
    opacity: 0,
  },
  2000,
  function () {
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
promise.done(function (message) {
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
