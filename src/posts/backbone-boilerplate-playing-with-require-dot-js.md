---
title: 'Backbone Boilerplate: Playing with RequireJS'
tags:
  - Chain
  - Backbone
  - Backbone Boilerplate
  - RequireJS
date: 2012-05-18T15:07:00.000Z
updated: 2015-01-02T09:02:26.000Z
---

I want to keep playing with require.js and AMD modules today so I can really internalize the concepts around them. I'm going to go through the examples in [the require documentation](http://requirejs.org/docs/api.html#jsfiles) starting with loading regular scripts and then defining modules and loading those.

Here is our boilerplate HTML. It's a standard HTML5 file which just includes require.js at the bottom of the page.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />

    <title>Require.js Sandbox</title>

    <!-- Application styles -->
    <link rel="stylesheet" href="/assets/css/index.css" />
  </head>

  <body>
    <!-- Main container -->
    <div role="main" id="main"></div>

    <!-- Application source -->
    <script src="/assets/js/libs/require.js"></script>
  </body>
</html>
```

I'm also going to define a file called foo.js which will just console log "Hello World!". To update our HTML we'll add the following script tag after the call to include require.js

```html
<script>
  require(['foo']);
</script>
```

And as expected the console outputs 'Hello World!'. Let's step it up a notch and define a module. Our first module will just return an object literal [like in this example.](http://requirejs.org/docs/api.html#defsimple) It will be a `Person` module with our name and city. We'll place it in an `app` folder in the root of our project. So our stucture looks like this:

```
index.html
|
|_ app/
  |
  |_ person.js
|
|_ assets/
  |
  |_ js/
    |
    |_ libs/
      |
      |_ require.js
```

The `Person` module just needs to implement a define function which takes an object as an argument. It looks like this:

```js
define({
  name: 'Rob Dodson',
  city: 'San Francisco'
});
```

And in our updated index.html we're going to require that module.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />

    <title>Require.js Sandbox</title>

    <!-- Application styles -->
    <link rel="stylesheet" href="/assets/css/index.css" />
  </head>

  <body>
    <!-- Main container -->
    <div role="main" id="main"></div>

    <!-- Application source -->
    <script src="/assets/js/libs/require.js"></script>
    <script>
      require(['app/person'], function(person) {
        console.log(person.name);
        console.log(person.city);
      });
    </script>
  </body>
</html>
```

Opening up that page in the browser should give us the proper output in the console.

### AMD modules for dummies

Let's stop here for a moment to understand what's going on. In one file we implemented a `define` function and in another place we implemented a `require` function. In the most basic sense this is all we really need to do to start using AMD. I think the concept of javascript modules is really weird for most folks but if you're coming from a language like Java or Flash just think of define and require as two different interfaces that have to be implemented in order to recreate the `import` functionality that you're used to. Require.js is going to make sure everything loads properly so long as we stick to this convention.

If you're coming from more of a design background and you're used to having one big javascript file think of these modules as a way to break off pieces of code which you might otherwise put into separate script files. And I'm not talking one or two script files, I'm talking like 20 or 30. You could try to manage loading all of those dependencies yourself but that will be challenging. If you are building a blog then this probably isn't a big deal for you. In that case a few included js files is fine. But if you're trying to build a responsive web app for mobile then you're going to want to only load the bits of code you absolutely need. If a page doesn't require 90% of your JS then don't waste the time downloading it over a shitty AT&T connection.

Ok let's write a module that's a bit more realistic. We'll use a function to return our object so it's kind of like a constructor.

```js
'use strict';

define(function() {
  var estimated_age = 99 + 1;
  var spookySaying = 'I vant to suck your blooood!';

  return {
    name: 'Dracula',
    home: 'Florida',
    age: estimated_age,
    saySomethingSpooky: function() {
      console.log(spookySaying);
    }
  };
});
```

This is a simple monster object. Notice that we build a variable called `estimated_age` right before defining our object literal. We then return this variable. If we ask for the monster's age it will return this value. It's worth noting that this makes the `estimated_age` variable private since it only lives in the scope of the anonymous function returning our object literal. We've also got a method, `saySomethingSpooky` which will print out another private variable `spookySaying`. Wow it's _almost_ the JavaScript classes I've always dreamed of! Before you go thinking that remember that modules are not instanceable, meaning, when you load in a module it works like a [Singleton](http://en.wikipedia.org/wiki/Singleton_pattern) almost. You can't go monster.new() all over the place.. it just doesn't work that way. Don't get disouraged though, this is still pretty cool so let's continue...

Next up is a module with dependencies. We'll make the monster depend on his coffin.

```js
'use strict';

define(function() {
  var color = 'Blackest black';

  return {
    color: color,
    open: function() {
      console.log('*creeeeeek*');
    }
  };
});

('use strict');

define(['./coffin'], function(coffin) {
  var estimated_age = 99 + 1;
  var spookySaying = 'I vant to suck your blooood!';

  return {
    name: 'Dracula',
    home: 'Florida',
    age: estimated_age,
    saySomethingSpooky: function() {
      console.log(spookySaying);
    },
    goToSleep: function() {
      console.log('Time for bed!');
      coffin.open();
    }
  };
});
```

```html
<script data-main="" src="/assets/js/libs/require.js"></script>
<script>
  require(['app/monster'], function(monster) {
    monster.saySomethingSpooky();
    monster.goToSleep();
  });
</script>
```

You can see that we've created a dependency for our monster, it has to load the coffin module before it's ready to be loaded itself. Otherwise it won't be able to run `goToSleep()` properly. Require.js will sort all of this out so long as we declare our dependencies as the first argument to the `define` function.

We aren't limited to objects though, we can also return functions (which are objects in their own right). For instance if we wanted to define a helper module that greets people we could do something like this:

```js
'use strict';

define(function() {
  return function(name) {
    return 'Why hello, ' + name;
  };
});
```

then in our index we'll just use the `greet` function as if it were globally available.

```js
require(['app/greet'], function(greet) {
  console.log(greet('Rob'));
});
```

bear in mind that each module requires an http request to load it so you don't want to go overboard defining helper function modules. Note the extra http request in the profiler which loads greet.js.

Ok that's it for today. I'll try to continue on Saturday!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
