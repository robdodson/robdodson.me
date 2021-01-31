---
title: Using jQuery Deferred to Load an Underscore Template
tags:
  - Chain
  - jQuery
  - Promises
  - Underscore
date: 2012-05-30T15:53:00.000Z
updated: 2014-12-30T08:09:30.000Z
---

Today's post is meant to scratch an itch I had the other day regarding templates. My friend wanted to load an underscore template along with some JSON data but wasn't sure what the best approach would be.

Since I'm using Backbone Boilerplate I've gotten used to having my template loading method already stubbed out for me. Here's the one they use:

    fetchTemplate: function(path, done) {
      var JST = window.JST = window.JST || {};
      var def = new $.Deferred();
    
      // Should be an instant synchronous way of getting the template, if it
      // exists in the JST object.
      if (JST[path]) {
        if (_.isFunction(done)) {
          done(JST[path]);
        }
    
        return def.resolve(JST[path]);
      }
    
      // Fetch it asynchronously if not available from JST, ensure that
      // template requests are never cached and prevent global ajax event
      // handlers from firing.
      $.ajax({
        url: path,
        type: "get",
        dataType: "text",
        cache: false,
        global: false,
    
        success: function(contents) {
          JST[path] = _.template(contents);
    
          // Set the global JST cache and return the template
          if (_.isFunction(done)) {
            done(JST[path]);
          }
    
          // Resolve the template deferred
          def.resolve(JST[path]);
        }
      });
    
      // Ensure a normalized return value (Promise)
      return def.promise();
    }
    

Not having previous experience working with [jQuery.Deferred](http://api.jquery.com/category/deferred-object/) I was initially put-off by the idea of just copy/pasting this function over to him, especially since I couldn't explain what was going on. I knew that I probably wanted to use Deferreds and Promises but I wasn't sure how best to explain the concepts nor did this method seem to do much in the way of loading JSON, it was just for loading templates. Since my friend only wanted to load 1 template and 1 JSON file I thought it best for us to start small, and to write something that we could easily debug. Knowing I wanted to use Deferreds I found [this wonderful article by Addy Osmani and Julian Aubourg](http://msdn.microsoft.com/en-us/magazine/gg723713.aspx) detailing how Deferreds work. It is VERY comprehensive and for our purposes I only needed to read the first few paragraphs before I had enough to start.

In a nutshell deferreds are objects which contain promises (also objects). Promises can be in various states, `pending`, `resolved` or `rejected`. Once you have a deferred (or it's promise) you can hook functions on to it so when it changes from a `pending` to `resolved` state all those functions fire. It's actually the promise that changes state but you can use the deferred like a promise because in most cases it will just proxy the calls to its promise object. Using deferreds can be nice for several reasons. For starters, you can avoid the jQuery *pyramid of doom*

    
    // NOOOOOOoooooooooo
    
    $.ajax({
      url: 'foo.php',
      success: function() {
        $.ajax({
          url: 'bar.php',
          success: function() {
            $.ajax({
              url: 'baz.php',
              success: function() {
                ...
              }
            })
          }
        })
      }
    })
    
    

Secondly your deferreds/promises are little tokens that you can hand out from your services so other actors don't have to get all up in your ajax guts. Someone makes an API request, you give em a token, when it resolves they play with the data.

    function doSomethingWithHugeData(data) {
      console.log("man, look at all these 1's and 0's!");
    }
    
    var dfd = myService.getSomeHugeData();
    dfd.done(doSomethingWithHugeData);
    

This is a much nicer approach than passing in a callback that your service will need to execute whenever it finishes getting its data. Your service shouldn't care about your callbacks. It should care about getting data and letting people know when that data's been got! :D

### But I digress...

We were *trying* to load some JSON and a template, so let's get back to the task at hand. Since we know that we have two ajax calls, one for the JSON and one for the template, and we know that we don't really want to do anything till both of these calls have completed we've got a perfect use case for [$.when](http://api.jquery.com/jQuery.when/). `when` accepts a list of deferreds/promises and acts as one big deferred, waiting for all of its children to resolve before it resolves. This is a nice way to build a sequencer. In our case we're going to take  two ajax calls and toss them into `$.when`. When it resolves we'll use `$.then` to tell it what our success and failure callbacks should be.

    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Deferred Sandbox</title>
        <script src="jquery.js"></script>
        <script src="underscore.js"></script>
      </head>
      <body>
        <div id="main"></div>
    
        <script>
          $(function() {
    
            function successFunc(jsonRes, templateRes) {
              var json = _.first(jsonRes);
              var template = _.first(templateRes);
              var compiled = _.template(template, json);
              $('#main').html(compiled);
            }
    
            function failureFunc() {
              console.log('fail whale!');
            }
            
            $.when(
              $.ajax("person.json"),
              $.ajax("person.template.html")
            ).then(successFunc, failureFunc);
    
          });
        </script>
    
      </body>
    </html>
    

In our case everything is in the same folder as index.html so there's no need for any paths. Keep in mind that in most (all?) browsers you'll need to be running a local server for the above code to actually work. In Chrome, at least, you can't run an html file from file:// and have it load external resources, it'll complain that the access-origin is not allowed.

Let me take a moment to explain `$.then` a little bit. We know that `$.ajax` returns a deferred, and that the deferred's promise can be in three states: `pending`, `resolved`, `rejected`. So if we did something like this:

    var dfd = $.ajax('foobar.php');
    

`dfd` would be a deferred object with a `pending` promise. Deferred's let us link methods up to them for when their state changes. These methods are: `done()`, `fail()`, `always()`, `progress()`, and `then()`. There are more but [I'll let the documentation explain them.](http://api.jquery.com/category/deferred-object/)`done()` and `fail()` each accept either a single callback or an array of callbacks to be fired when the deferred changes to either the `resolved` or `rejected` state.

    function successFunc() {
      console.log('success! do stuff with data!');
    }
    
    function failureFunc() {
      console.log('failure! um...give up!');
    }
    
    var service = {
      getJSON: function() {
        return $.ajax('person.json');
      }
    };
    
    service.getJSON()
    .done(successFunc)
    .fail(failureFunc);
    
    

`always()` fires its callbacks regardless of whether the deferred was `resolved` or `rejected`. This might be a good place to put any cleanup code. `progress()` is fired during any progress events that the process might emit. Finally there's `then()` which is what we're using in our template example. `then()` is essentially shorthand for `done()` and `fail()` so you can pass it two callbacks or two arrays of success/fail callbacks.

Hopefully that's helpful for you all and you can go back and clean up some of those pyramids that might be lingering in your code. Till tomorrow! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Reserved, Sedate
- Sleep: 7
- Hunger: 4
- Coffee: 0
