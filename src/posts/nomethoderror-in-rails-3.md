---
title: NoMethodError in Rails 3
tags:
  - Rails
  - Rails 3
  - Errors
  - Ruby
date: 2011-09-20T14:33:00.000Z
updated: 2014-12-30T06:03:21.000Z
---

Coming from Actionscript 3 I’m pretty used to all of the different errors that the Flash compiler and runtime typically throw at me. But now that I’ve started teaching myself Ruby on Rails 3 I’m having to learn a whole new lexicon of messages which generally amount to “Something blow’d up...”

For my own benefit, and hopefully for the benefit of others, I’m going to post the errors and solutions that I come up with. Hopefully since I’m a total newbie, explaining things from my perspective will help other people who are new to the language as well.

To start of we have the `NoMethodError`.
![NoMethodError](/images/2014/12/no_method_error.jpg)

You get a `NoMethodError` when you try to call a method which either doesn’t exist on an Object, or the Object itself doesn’t exist. Since `Nil` is actually an object in Ruby (it’s an instance of `NilClass`) this error can sometimes be a bit misleading (especially if you come from a language where Nil or Null is represented by a primitive or a data type like in Actionscript 3).

The real reason this occurs is either because the Object itself is Nil (and you probably didn’t intend that) or you forgot to define the method on your Object. In Flash you would get an error saying you can’t call a method on a null object reference, since null is just a primitive data type. But in Ruby, it says that the method you wanted didn’t exist because you called it on an ACTUAL NilClass object and NilClass doesn't define whatever method name you passed.

### Resolution

1. If your error says “undefined method ‘some_method_name’ for NilClass:Class” (like it does in the picture) then you’ve accidentally tried to call a method on an Object which doesn’t really exist. You probably just didn’t pass or instantiate the Object properly.

2. If you see the correct class type in the error then you’ve just failed to declare that method or perhaps mistyped its name. Verify that the method exists in the class and that you don’t have any spelling errors :)

You should follow me on Twitter [here](http://twitter.com/rob_dodson).
