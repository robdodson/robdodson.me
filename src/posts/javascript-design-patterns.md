---
title: "JavaScript Design Patterns: Table of Contents"
tags:
  - Design Patterns
  - JavaScript
date: 2012-08-03T16:39:00.000Z
updated: 2015-01-02T08:53:08.000Z
---

### Creational

-   Abstract Factory
-   Builder
-   Factory Method
-   Object Pool
-   Prototype
-   [Singleton](/posts/javascript-design-patterns-singleton/)

### Structural

-   Adapter
-   Bridge
-   Composite
-   [Decorator](/posts/javascript-design-patterns-decorator/)
-   Facade
-   Flyweight
-   Private Class Data
-   Proxy

### Behavioral

-   Chain of Responsibility
-   Command
-   Interpreter
-   [Iterator](/posts/javascript-design-patterns-iterator/)
-   Mediator
-   Memento
-   Null Object
-   [Observer](/posts/javascript-design-patterns-observer/)
-   State
-   [Strategy](/posts/javascript-design-patterns-strategy/)
-   Template Method
-   Visitor
-   Monad Pattern / Promises

I've been trying to think up [a new chain](/ending-my-first-chain/) since coming back from Europe but nothing was enticing me. Then a few days ago I had a conversation with one of my friends in which we discussed using Promises in JavaScript. And later on we discussed Builders. I was doing my best to explain the two but really wished that I had a resource where I could just show some simple code examples. It occurred to me that I've always wanted to go through the [Gang of Four book](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612/ref=sr_1_1?ie=UTF8&qid=1344014497&sr=8-1&keywords=design+patterns) and just write my own interpretation of each pattern. Since I'm currently working primarily in JavaScript I thought it might be an interesting challenge to convert their examples, often in strongly typed languages, to something as dynamic and loosey-goosey as JS.

I know there are a lot of people out there who aren't too keen on design patterns but that's not to say that they shouldn't be used or studied.

Patterns should be used with caution as not everything fits so neatly into their paradigms. It's often said that a beginner never met a pattern they didn't like. In my experiences I've been burned by pattern overuse and at other times they've really helped me solve a novel problem.

It's also true that many patterns don't really work or aren't appropriate for particular languages. For instance, the GoF book was written primarily for languages which shared features of C++ and SmallTalk. My hope is that along the way we'll discover what does and doesn't make sense in a dynamic language like JS. Already to the list I've added Promises which I use quite frequently and find to be a wonderful alternative to JavaScript's oft seen pyramid of callbacks.

Again, this is all about learning and experimenting. I’m committed to doing this twice a week for the next several weeks so hopefully by the end of it we’ll have a useful resource that others can benefit from. Stay tuned!