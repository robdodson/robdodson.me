---
title: "JavaScript Design Patterns: Factory"
tags:
  - Design Patterns
  - JavaScript
  - Factory
date: 2012-09-03T19:40:00.000Z
updated: 2017-01-18T02:57:16.000Z
---

**[Table of Contents](https://robdodson.me/blog/2012/08/03/javascript-design-patterns/)**

Factories encapsulate and separate object creation from the rest of your code.
In situations where the creation of an object can be complex or subject to
change a factory can act as a nice buffer to help keep things tidy. Without
proper planning Factories can lead to class explosions; as a result the pattern
can be both a blessing and a curse depending on how it's used.

Formal Definition
-----------------

**Factory Method**

> Define an interface for creating an object, but let subclasses decide which
> class to instantiate. Factory Method lets a class defer instantiation to
> subclasses.

**Abstract Factory**

Provide an interface for creating families of related or dependent objects
without specifying their concrete classes.

**Also Known As**

* Virtual Constructor (**Factory Method**)
* Kit (**Abstract Factory**)

Simple Factory vs Factory Method vs Abstract Factory
----------------------------------------------------

The phrase "Factory Pattern" is rather overloaded so I'm going to give you a
quick crash course in the three main types of factories.

A **simple factory** is an object which encapsulates the creation of another
object, shielding that code from the rest of your application.

```js
var user = UserFactory.createUser();
```

It's common to parameterize simple factory methods to increase the number of
products they're able to return.

```js
var admin = UserFactory.createUser('admin');
var customer = UserFactory.createUser('customer');
```

The actual implementaiton of `createUser` might look something like this:

```js
UserFactory.createUser = function(type) {
  if (type == 'admin') {
    return new Admin();
  } else if (type == 'customer') {
    return new Customer();
  }
};
```

Typically the return value from a factory is known as the `Product`. In the case
of our `UserFactory` there are two Products: `Admin` and `Customer`. It's
important for these products to maintain a consistent interface so the client
can use any product from our factory without needing to do elaborate checks to
see if a particular method exists.

### Factory Method

While the Simple Factory is a nice start and good for many situations it's
possible to extend this even further through the use of the **Factory Method**
pattern.

> The Factory Method Pattern defines an interface
> for creating an object, but lets subclasses decide which
> class to instantiate. Factory Method lets a class defer
> instantiation to subclasses.
*Elisabeth Freeman, Head First Design Patterns*

Factory Method defines one method, `createThing` for instance, which is
overriden by subclasses who decide what to return. The Factories and Products
must conform to interfaces for clients to be able to use them.

In _Head First Design Patterns_ a Factory Method pattern is used to allow a
PizzaStore to define many subclasses such as ChicagoPizzaStore,
CaliforniaPizzaStore, NewYorkPizzaStore. Each subclass overrides `createPizza`
and returns its own particular style of pizza (ie: a ChicagoPizza or a
CaliforniaPizza). The main take away is that there is only one method,
`createPizza`, that does anything. By subclassing and overriding this method we
can offer aditional flexibility beyond what's possible with the Simple Factory.

### Abstract Factory

Unlike the Factory Method pattern, **Abstract Factory** defines any number of
methods which return Products.

> The Abstract Factory Pattern provides an interface
> for creating families of related or dependent objects
> without specifying their concrete classes.
*Elisabeth Freeman, Head First Design Patterns*

Again in _Head First Design Patterns_, an Abstract Factory pattern is used to
provide different Pizza ingredients depending on the type of Pizza. For
instance, a ChicagoPizza would be given a ChicagoPizzaIngredients factory with
methods like `createDough`, `createSauce`, `createCheese`, etc. A
CaliforniaPizzaIngredients factory would also implement `createDough`,
`createSauce` and `createCheese`. In this way the factories would be
interchangeable.

The authors are keen to point out that the methods of the Abstract Factory
(`createDough`, `createSauce`, etc) look very similar to the Factory Method
(`createPizza`). One way of thinking about things is that an Abstract Factory
can be composed of Factory Methods.

The Factory Method in JavaScript
--------------------------------

Since I've already shown a basic Simple Factory let's take a stab at doing the
Factory Method in JS. We'll continue with the PizzaStore theme since I've
already spelled out how each pattern applies to it. We're going to do this
without the use of the `new` keyword and instead we'll take advantage of
JavaScript's prototypes. How you ask?

### The very awesome Object.create

ECMAScript 5 introduced a new method of the `Object` prototype called `create`.
You can read up on it in full detail [on
MDN.](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create)
In a nutshell it lets you pass in a prototype and receive a new object which
points to that prototype. `Object.create` is actually a simple Factory Method!
Here's an example:

```js
var firstPizzaStore = Object.create(PizzaStore);
firstPizzaStore.createPizza(); // returns 'Generic pizza created'
```

One very cool feature of `Object.create` is that it accepts a properties object which is then mixed in to the returned object. The code can get a little verbose since it uses [defineProperty syntax](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/defineProperty) so instead let's steal a function from [Yehuda Katz](http://yehudakatz.com/2011/08/12/understanding-prototypes-in-javascript/) which lets us do something very similar.

```js
var fromPrototype = function(prototype, object) {
  var newObject = Object.create(prototype);
  for (var prop in object) {
    if (object.hasOwnProperty(prop)) {
      newObject[prop] = object[prop];
    }
  }
  return newObject;
};
```

Now that we have that we can continue on our way. One quick caveat though! Some browsers \*cough\* **IE** \*cough\* don't support `Object.create` so we need to shim it. Thankfully MDN has got our back:

```js
// Polyfill
if (!Object.create) {
  Object.create = function (o) {
    if (arguments.length > 1) {
      throw new Error('Object.create implementation only accepts the first parameter.');
    }
    function F() {}
    F.prototype = o;
    return new F();
  };
}
```

Drop that into your page and you should be able to use Object.create like we are
above. Note that the shim does not support the second properties object. For our
purposes that's ok but definitely keep it in mind if you're thinking of using
it.

### Back to the Factory Method

With `Object.create` and `fromPrototype` in hand we're ready to tackle our first
Factory Method.

Let's start by creating a PizzaStore:

```js
// Define the Pizza product
var Pizza = {
  description: 'Plain Generic Pizza'
};

// And the basic PizzaStore
var PizzaStore = {
  createPizza: function(type) {
    if (type == 'cheese') {
      return fromPrototype(Pizza, {
        description: 'Cheesy, Generic Pizza'
      });
    } else if (type == 'veggie') {
      return fromPrototype(Pizza, {
        description: 'Veggie, Generic Pizza'
      });
    }
  }
};
```

Easy enough. Ok now let's extend the PizzaStore so we have two variations: ChicagoPizzaStore and CaliforniaPizzaStore.

```js
var ChicagoPizzaStore = fromPrototype(PizzaStore, {
  createPizza: function(type) {
    if (type == 'cheese') {
      return fromPrototype(Pizza, {
        description: 'Cheesy, Deep-dish Chicago Pizza'
      });
    } else if (type == 'veggie') {
      return fromPrototype(Pizza, {
        description: 'Veggie, Deep-dish Chicago Pizza'
      });
    }
  }
});

var CaliforniaPizzaStore = fromPrototype(PizzaStore, {
  createPizza: function(type) {
    if (type == 'cheese') {
      return fromPrototype(Pizza, {
        description: 'Cheesy, Tasty California Pizza'
      });
    } else if (type == 'veggie') {
      return fromPrototype(Pizza, {
        description: 'Veggie, Tasty California Pizza'
      });
    }
  }
});

// Elsewhere in our app...
var chicagoStore = Object.create(ChicagoPizzaStore);
var pizza = chicagoStore.createPizza('veggie');
console.log(pizza.description); // returns 'Veggie, Deep-dish Chicago Pizza'
```

The Abstract Factory in JavaScript
----------------------------------

Since we have a variety of pizza styles we might also have a variety of ingredients. Let's see if we can accomodate all the different kinds.

```js
var Ingredients = {
  createDough: function() {
    return 'generic dough';
  },
  createSauce: function() {
    return 'generic sauce';
  },
  createCrust: function() {
    return 'generic crust';
  }
};

Ingredients.createChicagoStyle = function() {
  return fromPrototype(Ingredients, {
    createDough: function() {
      return 'thick, heavy dough';
    },
    createSauce: function() {
      return 'rich marinara';
    },
    createCrust: function() {
      return 'deep-dish';
    }
  });
};

Ingredients.createCaliforniaStyle = function() {
  return fromPrototype(Ingredients, {
    createDough: function() {
      return 'light, fluffy dough';
    },
    createSauce: function() {
      return 'tangy red sauce';
    },
    createCrust: function() {
      return 'thin and crispy';
    }
  });
};
```


In the above example `Ingredients` is our Abstract Factory. We know that for every
different kind of pizza we'll need different ingredients and therefore a new Factory Method. We also know that we have different styles of pizza so we'll need Chicago style ingredients and California style ingredients. When a client wishes to grab some ingredients for a particular kind of pizza they just say:

```js
var californiaIngredients = Ingredients.createCaliforniaStyle();
californiaIngredients.createCrust(); // returns 'thin and crispy';
```

The object that is returned by the call `createCaliforniaStyle` is the concrete implementation of our Abstract Ingredients object. In other words, if `Ingredients` is the Abstract Factory, then the object returned by `createCaliforniaStyle` could also be thought of as a `CaliforniaIngredients` object. It is a _subclass_ of `Ingredients` if you want to think of it that way. The returned object extends `Ingredients` and overrides its Factory Methods with its own methods. In so doing we provide a lot of additional flexibility to our app. If we want to add a Hawaiian style ingredients we just add a `createHawaiianStyle` method.

If you recall from [the previous article on Decorators](https://robdodson.me/blog/2012/08/27/javascript-design-patterns-decorator/) we talked about the **Open-Closed Principle** which states that "classes should be open for extension but closed for modification." You'll notice that adding a `createHawaiianStyle` method would actually violate this principle so it should be noted that when using an Abstract Factory approach you'll probably have to reopen the class/object a few times to modify it. Not ideal but depending on your use case this might not be such big deal and you might prefer the flexibility and organization that the factory offers.

**[Grab the Example Source](https://github.com/robdodson/JavaScript-Design-Patterns/tree/master/factory/)**

Related Patterns
----------------

* Template Methods: Factory Methods are usually called within Template Methods.
* [Singleton](https://robdodson.me/blog/2012/08/08/javascript-design-patterns-singleton/): A concrete factory is often a singleton.

Gamma, Erich; Helm, Richard; Johnson, Ralph; Vlissides, John (1994-10-31). Design Patterns: Elements of Reusable Object-Oriented Software. Pearson Education (USA).

#### [Table of Contents](https://robdodson.me/blog/2012/08/03/javascript-design-patterns/)