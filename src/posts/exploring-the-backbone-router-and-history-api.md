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
