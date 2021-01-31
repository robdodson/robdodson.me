---
title: "Shadow DOM: The Basics"
tags:
  - Web Components
  - Shadow DOM
date: 2013-08-27T15:52:00.000Z
updated: 2016-12-15T17:59:39.000Z
---

**This post relates to the old Shadow DOM v0 specs and is now out of date. Many of the concepts are the same but Shadow DOM has recently been updated to the v1 specs and some of the syntax has changed. [Take a look at this excellent primer for an up to date guide on Shadow DOM v1](https://developers.google.com/web/fundamentals/getting-started/primers/shadowdom)**

In my [previous post](/blog/2013/08/26/shadow-dom-introduction/), I introduced the **Shadow DOM** and made the case for why it is important. Today, we'll get our hands dirty with some code! By the end of this post, you'll be able to create your own encapsulated widgets that pull in content from the outside world and rearrange their bits and pieces to produce something wholly different.

Let's get started!

## Support [#](#)

In order to try the examples, I suggest you use Google Chrome, v33 or greater.

## A Basic Example [#](#)

Let's take a look at a very simple HTML document.

    <body>
      <div class="my-widget">
        <h1>My Widget Header</h1>
        <p>Some my-widget content</p>
      </div>
      <div class="my-other-widget">
        <h1>My Other Widget Header</h1>
        <p>Some my-other-widget content</p>
      </div>
    </body>
    

When HTML gets converted to the DOM, every element is considered to be a **node**. When you have a group of these nodes nested inside one another, it is known as a **node tree**.

![A basic node tree](/images/2015/01/tree-chart.svg)

What's unique about shadow DOM is that it allows us to create our own node trees, known as **shadow trees**.  These shadow trees encapsulate their contents and render only what they choose. This means we can inject text, rearrange content, add styles, etc. Here's an example:

    <div class="widget">Hello, world!</div>
    <script>
      var host = document.querySelector('.widget');
      var root = host.createShadowRoot();
      root.textContent = 'Im inside yr div!';
    </script>
    

![Our first shadow dom](/images/2015/01/shadow-dom-basic1.jpg)

Using the code above, we've replaced the text content of our `.widget` div using a shadow tree. To create a shadow tree, we first specify that a node should act as a **shadow host**. In this case, we use `.widget` as our shadow host. Then we add a new node to our shadow host, known as a **shadow root**. The shadow root acts as the first node in your shadow tree and all other nodes descend from it.

If you were to inspect this element in the Chrome Dev Tools, it would look something like this:

![Inspecting our first shadow dom](/images/2015/01/shadow-dom-basic-inspect-2.png)

Do you see how `#shadow-root` is grayed out? That's the shadow root we just created. **The takeaway is that the content inside of the shadow host is *not* rendered. Instead, the content inside of the shadow root is what gets rendered.**

This is why, when we run our example, we see `Im inside yr div!` instead of `Hello, world!`

We can visualize this process in another graph:

![Shadow tree graph](/images/2015/01/tree-of-trees.svg)

Let's do one more example, to help it all sink in.

## A Basic Example (cont.) [#](#)

    <body>
      <div class="widget">Hello, world!</div>
      <script>
        var host = document.querySelector('.widget');
        var root = host.createShadowRoot();
        
        var header = document.createElement('h1');
        header.textContent = 'A Wild Shadow Header Appeared!';
        
        var paragraph = document.createElement('p');
        paragraph.textContent = 'Some sneaky shadow text';
    
        root.appendChild(header);
        root.appendChild(paragraph);
      </script>
    </body>
    

![A slightly more advanced shadow dom sketch](/images/2015/01/shadow-dom-basic-cont1.jpg)

I'm taking our previous example and adding two additional elements to it. I've done this to illustrate that working with the shadow DOM is really not so different from working with the regular DOM. You still create elements and use `appendChild` or `insertBefore` to add them to a parent. In the Chrome Dev Tools it looks like this:

![Inspecting our shadow dom](/images/2015/01/shadow-dom-basic-cont-insepect.png)

Just like before, the content in the *shadow host*, `Hello, world!`, is not rendered. Instead the content in the *shadow root* is rendered.

"That's easy enough," you might say. "But what if I actually *want* the content in my shadow host to render?"

Well, dear reader, you'll be happy to know, that's not only possible but it's actually one of the killer features of shadow DOM. Let's keep going and I'll show you how!

## Content [#](#)

In our last two examples, we've completely replaced the content in our shadow hosts with whatever was inside our shadow root. While this is a neat trick, in practice, it's not very useful. What would be really great is if we could take the **content** from our shadow host and then use the structure of the shadow root for the **implementation**. Separating the content from the implementation like this allows us to be much more flexible with how our page actually renders.

First things first, to use the content in our shadow host we're going to need to employ the new `<content>` tag. Here's an example:

    <body>
      <div class="pokemon">
        Jigglypuff
      </div>
    
      <template class="pokemon-template">
        <h1>A Wild <content></content> Appeared!</h1>
      </template>
    
      <script>
        var host = document.querySelector('.pokemon');
        var root = host.createShadowRoot();
        var template = document.querySelector('.pokemon-template');
        root.appendChild(document.importNode(template.content, true));
      </script>
    </body>
    

![Mixing content and presentation](/images/2015/01/shadow-dom-content1.jpg)

Using the `<content>` tag, we've created an **insertion point** that **projects** the text from the `.pokemon` div, so it appears within our shadow `<h1>`. Insertion points are very powerful because they allow us to change the order in which things render without physically altering the source. It also means that we can be selective about what gets rendered.

You may have noticed that we're using a [template tag](/blog/2013/03/16/html5-template-tag-introduction/) instead of building our shadow DOM entirely in JavaScript. I've found that using `<template>` tags makes the process of working with the shadow DOM much easier.

Let's look at a more advanced example to demonstrate how to work with multiple insertion points.

## Selects [#](#)

    <body>
      <div class="bio">
        <span class="first-name">Rob</span>
        <span class="last-name">Dodson</span>
        <span class="city">San Francisco</span>
        <span class="state">California</span>
        <p>
          I specialize in Front-End development (HTML/CSS/JavaScript) with a touch of Node and Ruby sprinkled in. I’m also a writer and occasional daily blogger. Though I’m originally from the South, these days I live and work in beautiful San Francisco, California.
        </p>
      </div>
    
      <template class="bio-template">
        <dl>
          <dt>First Name</dt>
          <dd><content select=".first-name"></content></dd>
          <dt>Last Name</dt>
          <dd><content select=".last-name"></content></dd>
          <dt>City</dt>
          <dd><content select=".city"></content></dd>
          <dt>State</dt>
          <dd><content select=".state"></content></dd>
        </dl>
        <p><content select=""></content></p>
      </template>
    
      <script>
        var host = document.querySelector('.bio');
        var root = host.createShadowRoot();
        var template = document.querySelector('.bio-template');
        root.appendChild(template.content);
      </script>
    </body>
    

![Using content selects](/images/2015/01/shadow-dom-selects1.jpg)

In this example, we're building a very simple biography widget. Because each definition field needs specific content, we have to tell the `<content>` tag to be selective about where things are inserted. To do this, we use the `select` attribute. The `select` attribute uses CSS selectors to pick out which items it wishes to display.

For instance, `<content select=".last-name">` looks inside the shadow host for any element with a matching class of `.last-name`. If it finds a match, it will render its content inside of the shadow DOM.

### Changing Order

Insertion points allow us to change the rendering order of our presentation without needing to modify the structure of our content. **Remember, the content is what lives in the shadow host and the implementation is what lives in the shadow root/shadow DOM.** A good example would be to swap the rendering order of the first and last names.

    <template class="bio-template">
      <dl>
        <dt>Last Name</dt>
        <dd><content select=".last-name"></content></dd>
        <dt>First Name</dt>
        <dd><content select=".first-name"></content></dd>
        <dt>City</dt>
        <dd><content select=".city"></content></dd>
        <dt>State</dt>
        <dd><content select=".state"></content></dd>
      </dl>
      <p><content select=""></content></p>
    </template>
    

![Changing the order of our selects](/images/2015/01/shadow-dom-selects2.jpg)

By simply changing the structure of our `template`, we've altered the presentation, but the order of the content remains the same. To understand what I mean, take a look at the Chrome Dev Tools.

![Changing the order of our selects](/images/2015/01/shadow-dom-selects-inspect.png)

As you can see, `.first-name` is still the first child in the shadow host, but we've made it appear as if it comes after `.last-name`. We did this by changing the order of our insertion points. That's pretty powerful when you think about it.

### Greedy Insertion Points

You may have noticed, at the end of the `.bio-template`, we have a `<content>` tag with an empty string inside of its `select` attribute.

    <p><content select=""></content></p>
    

This is considered a wildcard selection and it will grab any content in the shadow host that is left over. The following three selections are all equivalent:

    <content></content>
    <conent select=""></conent>
    <content select="*"></content>
    

As an experiment, let's move this wildcard selection to the top of our `template`.

    <template class="bio-template">
      <p><content select=""></content></p>
      <dl>
        <dt>Last Name</dt>
        <dd><content select=".last-name"></content></dd>
        <dt>First Name</dt>
        <dd><content select=".first-name"></content></dd>
        <dt>City</dt>
        <dd><content select=".city"></content></dd>
        <dt>State</dt>
        <dd><content select=".state"></content></dd>
      </dl>
    </template>
    

![](/images/2015/01/shadow-dom-selects3.jpg)

You'll notice that it completely changes the presentation of our widget by moving all content inside of the `<p>` tag. That's because selections are greedy and items may only be selected one time. Since we have a wildcard selection at the top of our template, it grabs all of the content from the shadow host and doesn't leave anything for the other `selects`.

Dominic Cooney ([@coonsta](http://twitter.com/coonsta)) does a great job of describing this in his post on [Shadow DOM 101](http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom/). In it, he compares the selection process to party invitations.

> The content element is the invitation that lets content from the document into the backstage Shadow DOM rendering party. These invitations are delivered in order; who gets an invitation depends on to whom it is addressed (that is, the select attribute.) Content, once invited, always accepts the invitation (who wouldn’t?!) and off it goes. If a subsequent invitation is sent to that address again, well, nobody is home, and it doesn’t come to your party.

Mastering selects and insertion points can be pretty tricky, so Eric Bidelman ([@ebidel](http://twitter.com/ebidel)) created an [insertion point visualizer](http://html5-demos.appspot.com/static/shadowdom-visualizer/index.html) to help illustrate the concepts.

He also created this handy video explaining it :)

## Conclusion [#](#)

We still have a lot more to talk about, but for today, let's wrap things up. Tomorrow, we'll dig into CSS style encapsulation and later JavaScript and user interaction. As always, if you have questions [hit me up on twitter](http://twitter.com/rob_dodson) or leave a comment. Thanks!

## [Continue to Shadow DOM: Styles →](/blog/2013/08/28/shadow-dom-styles/)
