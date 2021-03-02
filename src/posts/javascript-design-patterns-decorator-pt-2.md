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
