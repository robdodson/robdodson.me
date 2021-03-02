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