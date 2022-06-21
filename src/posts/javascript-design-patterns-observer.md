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
