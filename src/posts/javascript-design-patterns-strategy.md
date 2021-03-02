---
title: "JavaScript Design Patterns: Strategy"
tags:
  - Design Patterns
  - Strategy
date: 2012-08-03T22:12:00.000Z
updated: 2014-12-31T00:29:01.000Z
---

#### [Table of Contents](/javascript-design-patterns/)

The Strategy pattern is one of my personal favorites and you've probably seen or used it in some fashion without even knowing it. Its primary purpose is to help you separate the parts of an object which are subject to change from the rest of the static bits. Using Strategy objects versus subclasses can often result in much more flexible code since you're creating a suite of easily swappable algorithms.

Formal Definition
-----------------

> Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from clients that use it.

### Also Known As

-   Policy

Contrived Example Time!
-----------------------

Let's say you're making a game and you have a Character class. This game has all sorts of different terrain types so your character can run through open fields, walk slowly through swamps or swim under the ocean. Since you don't know what kind of other terrains the game designer is going to think up you decide that it would be a bad idea to give each character `run`, `walk`, and `swim` methods. After all, what if suddenly the character needs to `fly` or `crawl`? What if they're wounded and they need to `limp`? This situation could potentially get out of hand very fast...

There's a good chance you've seen or written code like this before:

```js
function move() {
	if (state === 'walking') {
		// do some walk animation
	} else if (state === 'running') {
		// do some running animation
	} else if (state === 'swimming') {
		// do some swimming animation
	}
}
```

When you see a big conditional like that or a switch statement it's time to stop and wonder if there's a better way. For instance if we need to subclass our Character we're going to have to override that big conditional. What if we only want to replace the `swimming` bit? We'll have to copy and paste the code from the super class for `walking` and `running` and then write new code specifically for `swimming`. And of course if `walking` and `running` ever change we're totally screwed.

### We need a Strategy to deal with this

Ok so we know that our character is going to be a real contortionist and need to run and jump and crab-walk all over the place. What if we took the code that made her run and we put it in its own object? How about we just define a Class for movements and we do this for all the different kinds of motion? Then when we need to move our Character we'll just tell it to defer to one of these Movement objects.

```js
var Movement = function(func) {
	this.move = func;
};

Movement.prototype.execute = function() {
	this.move();
};

var running = new Movement(function() {
	console.log("Hey I'm running!");
});

var walking = new Movement(function() {
	console.log("Just walking along...");
});
```

Now when we want to tell our character to move in a different way we'll just update which Movement object its currently referencing.

```js
function changeMovementType(movement) {
	this.movement = movement;
}

function move() {
	this.movement.execute();
}
```

In practice you might have something that looks like this:

```js
var running = new Movement(function() {
	console.log("Hey I'm running!");
});

var walking = new Movement(function() {
	console.log("Just walking along...");
});

// Create a hero and walk through a peaceful forest...

var hero = new Character();
hero.changeMovementType(walking);
hero.move();

// ... OH NO MOTHERFUCKIN' DINOSAURS!!!

hero.changeMovementType(running);
hero.move();
```

Now it's easy for us to add as many different kinds of motion as our little game designer can dream up. Want to give the character gas-powered robotic legs? No problem!

```js
var robotlegs = new Movement(function() {
	console.log("Cruisin for oil...Look out humans!");
});

hero.changeMovementType(robotlegs);
hero.move();
```

When to use it
--------------

When you have a part of your Class that's subject to change frequently or perhaps you have many related subclasses which only differ in behavior it's often a good time to consider using a Strategy pattern.

Another benefit of the Strategy pattern is that it can hide complex logic or data that the client doesn't need to know about.

The Painting App
----------------

For a real world example of when to use Strategy objects consider your typical painting program. Often times you will offer a variety of different brush types to your user but you don’t want to have to change the fundamentals of how a mark shows up on screen every time the user decides to switch from a round to a square brush. Why not wrap those specific implementations in their own brush objects and later on when the user clicks to draw something to screen we’ll just defer to one of those brushes.

```js
// Grab a reference to the canvas and the drawing context
$canvas = $('#painter');
context = $canvas[0].getContext('2d');

// Define our brush strategy objects
brushes = {
  outline: {
      draw: function(e, context) {
          context.strokeRect(e.pageX - offsetLeft, e.pageY - offsetTop, 10, 10);
      }
  },
  square: {
      draw: function(e, context) {
          context.fillRect(e.pageX - offsetLeft, e.pageY - offsetTop, 10, 10);
      }
  },
  circle: {
      draw: function(e, context) {
          context.arc(e.pageX - offsetLeft, e.pageY - offsetTop, 10, 0, Math.PI * 2);
          context.fill();
      }
  }
};

... .

brush = brushes.square;
```

Here we see that `brushes.outline`, `brushes.square`, and `brushes.circle` each implement a consistent interface for the `draw` call. However their exact implementation changes from one brush to the next. `brushes.outline` will only draw the stroke of a rectangle, whereas `brushes.square` and `brushes.circle` will fill their respective shapes in. Elsewhere in the program we set our initial brush to a default of brushes.square. When the users presses their mouse and moves it around screen we can defer to whichever Strategy the brush object is currently referencing:

```js
// Listen for mouse events on the canvas
$canvas
  .on('mousedown', function() {
      isDrawing = true;
  })
  .on('mouseup mouseleave', function() {
      isDrawing = false;
  })
  .on('mousemove', function(e) {
      if (isDrawing) {
          // Defer drawing to a Strategy object
          brush.draw(e, context);
      }
  });
```

Again notice that `.on('mousemove')` we first check to see if it’s ok to draw something and then defer to whichever Strategy is currently being referenced. Using this approach we can add limitless new brush types to the `brushes` object and easily change how our program performs at runtime. Be sure to check out the live example and the source for the full application.

### [Live Example](https://robdodson.s3.amazonaws.com/javascript-design-patterns/strategy/painter/index.html)

[Grab the Example Source](https://github.com/robdodson/JavaScript-Design-Patterns/tree/master/strategy/)
--------------------------------------------------------------------------------------------------------

Related Patterns
----------------

-   Flyweight: Strategy objects often make good flyweights.

Gamma, Erich; Helm, Richard; Johnson, Ralph; Vlissides, John (1994-10-31). Design Patterns: Elements of Reusable Object-Oriented Software. Pearson Education (USA).

- - -

#### [Table of Contents](/javascript-design-patterns/)

You should follow me on Twitter [here.](https://twitter.com/rob_dodson)