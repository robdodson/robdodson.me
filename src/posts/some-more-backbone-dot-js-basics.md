---
title: Some More Backbone.js Basics
tags:
  - Chain
  - Backbone
date: 2012-05-20T15:19:00.000Z
updated: 2015-01-02T09:01:34.000Z
---

Here are some quick Backbone snippets to help visualize concepts. I'll move around fairly quickly so if you're interested in going more in-depth then checkout the documentation.

### Events

Backbone events are pretty straightforward. To create a pub/sub relationship you use the `on` and `off` methods of `Backbone.Events`:

In the above example you could make `dispatcher` into an AMD module and load the dependency with Require.js, something [I've covered in a previous post.](http://robdodson.me/blog/2012/05/18/backbone-boilerplate-playing-with-require-dot-js/)

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
    

### Models

Backbone models are interesting because they implement explicit `get` and `set` methods. When you change a property with the get and set methods it will fire off an event. Here's a fiddle showing how to model a `Book`. We'll change the author and the DOM will reflect this update.

If your model implements an `initialize` function it will be called as soon as the object is created. In other words, its a constructor. If you pass a hash to the model's constructor it will set those attributes on itself. The hash and any additional arguments will also be passed to `initialize`.

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
    book = new Book({
        author: 'Hunter S. Thompson',
        title: 'Fear and Loating in Las Vegas'
    }, 'hello world!');
    
    console.log(book.get('author'));
    

#### Poor man's data-binding

Now that we have a basic understanding of models we can write our own simple binding setup. This example presumes we have an `#author` and a `#title` element somewhere on our page.

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
    

#### Backbone.sync

To mess around with saving data we'll need to alter `Backbone.sync`.

> Backbone.sync is the function that Backbone calls every time it attempts to read or save a model to the server. By default, it uses (jQuery/Zepto).ajax to make a RESTful JSON request and returns a jqXHR. You can override it in order to use a different persistence strategy, such as WebSockets, XML transport, or Local Storage.

Backbone will decide whether a save call should perform a create with `HTTP POST` or an update `HTTP PUT` based on whether or not our model has an id attribute already.

Here's an example from the Backbone docs which overrides the sync functionality and fakes a request to a server.

    Backbone.sync = function(method, model) {
      console.log(method + ": " + JSON.stringify(model));
      model.id = 1; // This line is crucial!
    };
    
    var book = new Backbone.Model({
      title: "The Rough Riders",
      author: "Theodore Roosevelt"
    });
    
    book.save();
    // create: {"title":"The Rough Riders","author":"Theodore Roosevelt"}
    
    book.save({author: "Teddy"});
    // update: {"title":"The Rough Riders","author":"Teddy"}
    

​If we don't give our model an `id` on line 3 then Backbone has no way of knowing if the model has been previously saved or not. It will keep doing create/POST until it receives that id.

### Collections

If you don't want to setup a server but you do want to play around with saving models and collections you can use [the Backbone LocalStorage adapter written by Jerome Gravel-Niquet](https://github.com/jeromegn/Backbone.localStorage). After you've included the js file in your code somewhere you can use it like so:

    var Book = Backbone.Model.extend({});
    
    var Books = Backbone.Collection.extend({
        model: Book,
        localStorage: new Backbone.LocalStorage("Books")
    });
    
    var library = new Books();
    library.on('sync', function() {
        console.log('sync succesful!');
    });
    
    var othello = library.create({
      title: "Othello",
      author: "William Shakespeare"
    });
    

To `fetch` the models in the collection at a later point you can do the following:

    var Book = Backbone.Model.extend({});
    
    var Books = Backbone.Collection.extend({
        model: Book,
        localStorage: new Backbone.LocalStorage("Books")
    });
    
    var library = new Books();
    library.fetch();
    console.log(library);
    

The docs mention that you shouldn't use this to initialize your collections. Instead you should [bootstrap your app](http://documentcloud.github.com/backbone/#FAQ-bootstrap) at page load. Here's the passage:

> Note that fetch should not be used to populate collections on page load — all models needed at load time should already be bootstrapped in to place. fetch is intended for lazily-loading models for interfaces that are not needed immediately: for example, documents with collections of notes that may be toggled open and closed.

### Routers

Routers are used to map URLs to actions. If you're using the Backbone Boilerplate you should see this block of code in your main.js.

    // Defining the application router, you can attach sub routers here.
    var Router = Backbone.Router.extend({
      routes: {
        "": "index",
        ":hash": "index"
      },
    
      index: function(hash) {
        var route = this;
        var tutorial = new Example.Views.Tutorial();
    
        // Attach the tutorial to the DOM
        tutorial.render(function(el) {
          $("#main").html(el);
    
          // Fix for hashes in pushState and hash fragment
          if (hash && !route._alreadyTriggered) {
            // Reset to home, pushState support automatically converts hashes
            Backbone.history.navigate("", false);
    
            // Trigger the default browser behavior
            location.hash = hash;
    
            // Set an internal flag to stop recursive looping
            route._alreadyTriggered = true;
          }
        });
      }
    });
    

One gotcha is that the definition of `":hash": "index"` will send any route that follows the base domain to the index function. For instance if you did the following:

    routes: {
        "": "index",
        ":hash": "index"
        "search": "search"
      },
    
      ...
    
      search: function() {
        console.log('time to search!');
      }
    

Instead of the search function running what will actually happen is mysite.com/search will be converted into mysite.com/#search and the word `search` will be sent to the index function to supply the `hash` argument. To fix this you'll need to remove the `":hash": "index"` route.

### Views

Views can either work with existing DOM elements or create new ones. Here's a very basic fiddle in which a BodyView is created to wrap our `body` tag and BoxView is appended to it. We add a little jQuery animation to show the process in action.

You'll often want to link a view's render method up to a model's change event so the two will stay in sync. Here's a quick and dirty example showing how to bind in this fashion.

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
    

Instead of throwing your HTML into the render method as a String it's advised that you use some kind of templating library. Underscore templates seem like a good place to start but Backbone is designed to be template agnostic so you could easily switch to Mustache/Handelbars or HAML if you want. Tomorrow I'll look into displaying some content using an Underscore template linked up to a model. Till then.. :D

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
