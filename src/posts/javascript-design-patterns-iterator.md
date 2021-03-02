---
title: "JavaScript Design Patterns: Iterator"
tags:
  - Design Patterns
  - JavaScript
  - Iterator
date: 2012-08-10T22:45:00.000Z
updated: 2014-12-31T00:35:44.000Z
---

#### [Table of Contents](/javascript-design-patterns/)

If you're coming from Ruby or Java you probably think of an Iterator as an object which gives you a consistent interface for traversing a collection of some kind. If you're coming from JavaScript or Actionscript you probably just think of an iterator as the `i` value in a `for` loop. The term has mixed meanings but in this case we're refering to the former, an object which gives us a consistent interface for iterating over a collection of some kind. If you've never used them before that might seem kind of silly. "If I need to loop over something I'm just going to loop over it!" For many use cases that's totally fine. Where Iterator objects are useful is in situations where you might need to loop in an async fashion (stopping and restarting) or if you want to preclude an object from knowing too much about the inner workings of a collection.

Formal Definition
-----------------

> Provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.

### Also Known As

-   Cursor

Example Time
------------

The code for an Iterator should be pretty easy to grok if you've worked with loops before. Here is a simple example which returns an Iterator for looping over an Array by every third value.

```js
var iterator = (function() {

	var index = 0,
		data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		length = data.length;

	return {
		next: function() {
			var element;
			if (!this.hasNext()) {
				return null;
			}
			element = data[index];
			index += 3;
			return element;
		},
		hasNext: function() {
			return index < length;
		},
		rewind: function() {
			index = 0;
			return data[index];
		},
		current: function() {
			return data[index];
		}
	}

}());
```

Our iterator has a handful of useful operations including `next`, `hasNext`, `rewind` and `current`.

`next` will return the next value and advance the index by 3.

`hasNext` will check to see if calling `next` will actually return an item. Good for indicating when we've reached the end of a collection.

`rewind` will reset the index to zero so we can loop over the collection again.

`current` will return the current item at the index without advancing the index.

Let's put these into play to see how it works:

```js
while(iterator.hasNext()) {
	console.log(iterator.next());
}

iterator.rewind();
console.log(iterator.current());
```

If we ran the above we'd see the following output in the console.

```
1
4
7
10
1
```

Since the iterator is mainting its own state if we need to stop iteration at any point we just don't call `next`. Using exclusively `for` loops we'd have to check against a flag of some kind, store our current position and then rebuild the loop starting from that point.

Not just for Arrays
-------------------

As I mentioned before the Iterator gives us a consistent interface for traversing a collection, which means it can iterate over _any_ object. Calendar Dates, Linked Lists, Node Graphs, whatever! Here's an example of an iterator that traverses a simple Hash.

```js
var iterator = (function() {
	var data = { foo: 'foo', bar: 'bar', baz: 'baz' },
		keys = Object.keys(data),
		index = 0,
		length = keys.length;

	return {
		next: function() {
			var element;
			if (!this.hasNext()) {
				return null;
			}
			element = data[keys[index]];
			index++;
			return element;
		},
		hasNext: function() {
			return index < length;
		},
		rewind: function() {
			index = 0;
			return data[keys[index]];
		},
		current: function() {
			return data[keys[index]];
		}
	}
}());
```

Notice how the interface is identical to our previous Iterator? That's one of the key aspects to this pattern: Regardless of the _type_ of collection, we can define a consistent interface to loop through it. It also means that the client doesn't need to know anything about the implementation of the actual collection, and by wrapping it in a closure we can prevent the client from _editing_ the collection. Personally I like the idea of certain services handing out iterators rather than a wholesale dump of all the data. As always use whichever tool is appropriate for the context.

One quick note regarding Hashes. Previous versions of the ECMA spec did not require that Hash keys be kept in order. While most modern browsers _do_ keep them in order there are some funky inconsistencies. For instance, if you write out the following Hash:

```js
var hash = { 'foo': 'foo', 'bar': 'bar', '1': 'hello', '2': 'world' };
```

Google Chrome will swap the order of the keys such that they appear like this:

```js
{ '1': 'hello', '2': 'world', 'foo': 'foo', 'bar': 'bar' };
```

There are some interesting discussions on StackOverflow which cover this topic but it's a bit outside the scope of this article. If you're interested you can find them here:

-   [How to keep an Javascript object/array ordered while also maintaining key lookups?](https://stackoverflow.com/questions/5773950/how-to-keep-an-javascript-object-array-ordered-while-also-maintaining-key-lookup)
-   [Javascript data structure for fast lookup and ordered looping?](https://stackoverflow.com/questions/3549894/javascript-data-structure-for-fast-lookup-and-ordered-looping)

JavaScript 1.7
--------------

Although not widely supported yet, JavaScript 1.7 includes a built in Iterator object which can be used to wrap an Array or Hash with just a single line of code.

```html
<script type="application/javascript;version=1.7">
	var lang = { name: 'JavaScript', birthYear: 1995 };
	var it = Iterator(lang);
</script>
```

The above script block will not work in Chrome but it should work in the latest version of Firefox. Note the `type` attribute of the script tag which instructs the interpreter to handle the code as JS 1.7.

For some further reading on the topic checkout the MDN article which covers [Iterators in JavaScript 1.7](https://developer.mozilla.org/en-US/docs/JavaScript/Guide/Iterators_and_Generators)

[Grab the Example Source](https://github.com/robdodson/JavaScript-Design-Patterns/tree/master/iterator/)
--------------------------------------------------------------------------------------------------------

Related Patterns
----------------

-   Composite: Iterators are often applied to recursive structures such as Composites.
-   Factory Method: Polymorphic iterators rely on factory methods to instantiate the appropriate Iterator subclass.
-   Memento: Often used in conjunction with the Iterator pattern. An iterator can use a memento to capture the state of an iteration. The iterator stores the memento internally.

Gamma, Erich; Helm, Richard; Johnson, Ralph; Vlissides, John (1994-10-31). Design Patterns: Elements of Reusable Object-Oriented Software. Pearson Education (USA).

- - -

  

#### [Table of Contents](/javascript-design-patterns/)

Thanks for reading!

You should follow me on Twitter [here.](https://twitter.com/rob_dodson)