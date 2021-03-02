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