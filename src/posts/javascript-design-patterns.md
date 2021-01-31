---
title: "JavaScript Design Patterns: Table of Contents"
tags:
  - Design Patterns
  - JavaScript
date: 2012-08-03T16:39:00.000Z
updated: 2015-01-02T08:53:08.000Z
---

### Creational

- Abstract Factory
- Builder
- Factory Method
- Object Pool
- Prototype
- [Singleton](http://robdodson.me/blog/2012/08/08/javascript-design-patterns-singleton/)

### Structural

- Adapter
- Bridge
- Composite
- [Decorator](http://robdodson.me/blog/2012/08/27/javascript-design-patterns-decorator/)
- Facade
- Flyweight
- Private Class Data
- Proxy

### Behavioral

- Chain of Responsibility
- Command
- Interpreter
- [Iterator](http://robdodson.me/blog/2012/08/10/javascript-design-patterns-iterator/)
- Mediator
- Memento
- Null Object
- [Observer](http://robdodson.me/blog/2012/08/16/javascript-design-patterns-observer/)
- State
- [Strategy](http://robdodson.me/blog/2012/08/03/javascript-design-patterns-strategy/)
- Template Method
- Visitor
- Monad Pattern / Promises

I've been trying to think up [a new chain](http://robdodson.me/blog/2012/06/25/ending-my-first-chain/) since coming back from Europe but nothing was enticing me. Then a few days ago I had a conversation with one of my friends in which we discussed using Promises in JavaScript. And later on we discussed Builders. I was doing my best to explain the two but really wished that I had a resource where I could just show some simple code examples. It occurred to me that I've always wanted to go through the [Gang of Four book](http://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612/ref=sr_1_1?ie=UTF8&amp;qid=1344014497&amp;sr=8-1&amp;keywords=design+patterns) and just write my own interpretation of each pattern. Since I'm currently working primarily in JavaScript I thought it might be an interesting challenge to convert their examples, often in strongly typed languages, to something as dynamic and loosey-goosey as JS.

I know there are a lot of people out there who [aren't too](http://www.codinghorror.com/blog/2005/09/head-first-design-patterns.html)[keen on](http://thinkrelevance.com/blog/2007/05/17/design-patterns-are-code-smells) design patterns but that's not to say that they shouldn't be used or studied. There's a lot of code out there that starts with `jQuery.click()` or `addEventListener` or `.on()` and all of them are implementations of the Observer pattern. Finding this reusable approach is the main point of patterns and along with it comes a shared vocabulary that can be passed on to other developers. Rather than saying "Let's defer the methods of our object that are subject to change to well encapsulated algorithms." We can just say "A Strategy pattern might be nice here."

Patterns should be used with caution as not everything fits so neatly into their paradigms. It's often said that a beginner never met a pattern he didn't like. In my experiences I've been burned by pattern overuse and at other times they have legitimately saved my ass. It's also true that many patterns don't really work or aren't appropriate for particular languages. For instance, the GoF book was written *primarily for languages which shared features of C++ and SmallTalk*. I totally agree with this sentiment but I feel like along the way we'll discover what does and doesn't make sense in a dynamic language like JS and hopefully we can toss in some new patterns of our own. Already to the list I've added Promises which I use quite frequently and find to be a wonderful alternative to JavaScript's oft seen pyramid of callbacks.

Again, this is all about learning and experimenting. In my opinion a good understanding of design patterns is a threshold that needs to be crossed at some point in your career. I’m committed to doing this twice a week for the next several weeks so hopefully by the end of it we’ll have a useful resource that others can benefit from. Stay tuned!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
