---
title: "Shadow DOM: JavaScript"
tags:
  - Web Components
  - Shadow DOM
date: 2013-09-03T03:46:00.000Z
updated: 2015-01-01T21:10:25.000Z
---

We're getting to a point where we've covered most of what there is to know about [templates](/blog/2013/03/16/html5-template-tag-introduction/), [imports](/blog/2013/08/20/exploring-html-imports/) and shadow DOM ([1](/blog/2013/08/26/shadow-dom-introduction/), [2](/blog/2013/08/27/shadow-dom-the-basics/), [3](/blog/2013/08/28/shadow-dom-styles/), [4](/blog/2013/08/29/shadow-dom-styles-cont-dot/)). The end goal for all of these technologies is **custom elements**, but we're not *quite* there yet. I want you to understand the basics of working with JavaScript and the shadow DOM before diving head first into making your own elements. So in this post I'm going to explain some things to watch out for, in particular around how events work. With this knowledge under your belt you'll be in a good place to start creating your own custom elements.

Let's get crackin'!

*Before we get started I wanted to thank Eric Bidelman for his [amazing article on advanced Shadow DOM](http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom-301/). Most of this article is my interpretation of his post and I'm only covering a subset of what he presented. Definitely go read [everything on HTML5 Rocks that pertains to Web Components](http://www.html5rocks.com/en/tutorials/#webcomponents) when you get a chance.*

## Support [#](#)

In order to try the examples I suggest you use Chrome v35 or later as it has native support for all of these features.

## JavaScript Scope [#](#)

Remember when I spent all of that time [explaining how Shadow DOM CSS was encapsulated and protected from the parent document](/blog/2013/08/28/shadow-dom-styles/) and how awesome that all was? You might also think that JavaScript works the same way—*I did at first*—but that's actually not the case. With a few exceptions, which I'll discuss later, JavaScript in the Shadow DOM works pretty much exactly as it always has. That means all the best practices you've learned over the years still apply.

Here's an example of what I'm talking about.

    <body>
      <div id="host"></div>
      <template>
        <h1>Hello World!</h1>
        <script>
        var foo = 'bar';
        </script>
      </template>
      <script>
        var host = document.querySelector('#host');
        var root = host.createShadowRoot();
        var template = document.querySelector('template');
        root.appendChild(document.importNode(template.content, true));
        console.log('window.foo = ' + window.foo);
      </script>
    </body>
    

![Shadow DOM global variable](/images/2015/01/shadow-dom-js1.jpg)

Even though we're using a template tag and our script block is inside the Shadow DOM, the `foo` variable still attaches itself to the `window`. There's no special magic to keep it out of the global scope. Instead we need to rely on our trusty friend, [the IIFE](http://en.wikipedia.org/wiki/Immediately-invoked_function_expression), to make sure everything stays protected.

    <template>
      <h1>Hello World!</h1>
      <script>
      (function () {
        var foo = 'bar';
      }());
      </script>
    </template>
    

![Shadow DOM IIFE](/images/2015/01/shadow-dom-js2.jpg)

That's more like it!

## Event Retargeting [#](#)

One place where Shadow DOM JavaScript really differs from conventional script is in regard to event dispatching. The thing to remember is that **events originating from nodes inside of the shadow DOM are retargeted so they appear to come from the shadow host.**

I know that doesn't really sink in without an example so try this out.

    <body>
      <input id="normal-text" type="text" value="I'm normal text">
    
      <div id="host"></div>
      
      <template>
        <input id="shadow-text" type="text" value="I'm shadow text">
      </template>
    
      <script>
        var host = document.querySelector('#host');
        var root = host.createShadowRoot();
        var template = document.querySelector('template');
        root.appendChild(document.importNode(template.content, true));
    
        document.addEventListener('click', function(e) {
          console.log(e.target.id + ' clicked!');
        });
      </script>
    </body>
    

[Shadow DOM Event Retargeting](http://jsbin.com/IpaNAMi/3/embed?console,output)

Click on each of the above text fields and checkout what the console outputs. When you click on the "normal text" field it logs the `id` of that input. However, when you click on the "shadow text" field it logs the `id` of the host element (which is just `#host`). This is because **events coming from shadow nodes have to be retargeted otherwise they would break encapsulation.** If the event target continued to point at `#shadow-text` then anyone could dig around inside of our Shadow DOM and start messing things up.

### Distributed Nodes

If you recall from the last post we talked about [distributed nodes](/blog/2013/08/29/shadow-dom-styles-cont-dot#distributed-nodes), which are bits of content taken from the shadow host and projected into the Shadow DOM. You might think that since these nodes appear in the Shadow DOM that their events would be retargeted as well. But that's not the case.

Heres' another example to demonstrate.

    <body>
      <input id="normal-text" type="text" value="I'm normal text">
    
      <div id="host">
        <input id="distributed-text" type="text" value="I'm distributed text">
      </div>
      
      <template>
        <div>
          <input id="shadow-text" type="text" value="I'm shadow text">
        </div>
        <div>
          <content></content>
        </div>
      </template>
    
      <script>
        var host = document.querySelector('#host');
        var root = host.createShadowRoot();
        var template = document.querySelector('template');
        root.appendChild(document.importNode(template.content, true));
    
        document.addEventListener('click', function(e) {
          console.log(e.target.id + ' clicked!');
        });
      </script>
    </body>
    

[Shadow DOM Event Retargeting](http://jsbin.com/UyIRUta/2/embed?console,output)

Like before, as you click on each input field you'll see the id of the event's target element. Clicking on the "distributed text" field shows that its event target remains intact. That's because a distributed node comes from the parent document, so the user already has access to it. There's no need to retarget its events and, in fact, you probably wouldn't want to. If a user gives you a button to style with Shadow DOM they're going to want to be able to listen to click events on it at some point.

## Blocked Events [#](#)

In some instances events are killed off rather than retargeted. The following events are always stopped at the root node and cannot be observed by the parent document:

- `abort`
- `error`
- `select`
- `change`
- `load`
- `reset`
- `resize`
- `scroll`
- `selectstart`

Here's an example to demonstrate what I mean.

    <body>
      <input id="normal-text" type="text" value="I'm normal text">
      
      <div id="host">
        <input id="distributed-text" type="text" value="I'm distributed text">
      </div>
      
      <template>
        <div>
          <content></content>
        </div>
        <div>
          <input id="shadow-text" type="text" value="I'm shadow text">
        </div>
      </template>
      <script>
        var host = document.querySelector('#host');
        var root = host.createShadowRoot();
        var template = document.querySelector('template');
        root.appendChild(document.importNode(template.content, true));
    
        document.addEventListener('select', function(e) {
          console.log(e.target.id + ' text selected!');
        });
      </script>
    </body>
    

[Shadow DOM Stopped Events](http://jsbin.com/oLuZePo/2/embed?console,output)

Here I'm listening for `select` events which are triggered whenever you click and drag to highlight some text. If you try highlighting the text inside of the "normal text" input it should log `normal-text text selected!`. The "distributed text" input reacts in a similar fashion. But if you try to highlight the text inside of the "shadow text" input, nothing appears in the console. The event has been killed at the shadow root so it can't bubble up to the document where our event listener lives. Keep this in mind if you think you need to use any of the above listed events in your Shadow DOM.

## Conclusion [#](#)

So nothing *too* bad I hope. A few gotchas with JavaScript events but otherwise things work pretty much like what we're accustomed to. If you read through the previous posts then you're ready to move on to Custom Elements and [Polymer](http://www.polymer-project.org/)! Refer back to these articles if you feel lost and as always be sure to [hit me up on twitter](http://twitter.com/rob_dodson) or leave a comment if you have any questions. Thanks!
