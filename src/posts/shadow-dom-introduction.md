---
title: "Shadow DOM: Introduction"
tags:
  - Web Components
  - Shadow DOM
date: 2013-08-26T23:06:00.000Z
updated: 2015-01-01T18:39:22.000Z
---

The topic we'll be covering today, Shadow DOM, is big and at times rather confusing. It is also, potentially, one of the most transformative things to happen to web development in at least the last 5-10 years. Rather than attempt to cover it all in one post I'm going to split it up into a series of articles spread out over the coming weeks.

For now let's start with a general introduction: **What** is Shadow DOM and **why** is it important?

## The What (Briefly) [#](#)

Perhaps Shadow DOM is best explained with an example, and no example is better than the new `<video>` tag. Consider the one below:

The markup for this video is quite simple.

    <video id="video" controls="" preload="none" poster="http://media.w3.org/2010/05/sintel/poster.png">
      <source id="mp4" src="http://media.w3.org/2010/05/sintel/trailer.mp4" type="video/mp4">
      <source id="webm" src="http://media.w3.org/2010/05/sintel/trailer.webm" type="video/webm">
      <source id="ogv" src="http://media.w3.org/2010/05/sintel/trailer.ogv" type="video/ogg">
    </video>
    

Primarily there is a `<video>` tag with a few attributes and some nested `<source>` tags. But if you stop to think about it, there's actually *way* more going on here. The video player itself has play/pause buttons, a progress slider, a time code, volume controls and (once it is playing) a full screen toggle. So where is the code for all that coming from?

### The Shadows

[#](#)

As it turns out, each browser vendor has already written the code to make our video player work. They've just hidden it from us using the **Shadow DOM**. If you open the Chrome Dev Tools and click the option to `Show user agent shadow DOM` you can then inspect the video player in more detail.

![Enable Shadow DOM in the Dev Tools](/images/2015/01/show-shadow-dom.png)

![Inspect the video tag](/images/2015/01/video-shadow-dom.png)

Notice the grayed out `#shadow-root`? That's where all of our video player controls actually live. The browsers gray this content out to indicate that it is inside the Shadow DOM and not available to the rest of the page. Meaning, you cannot write CSS selectors which accidentally target it and you cannot write JavaScript to dig around inside of it. In effect, the markup and styles that power the UI of the `<video>` tag are encapsulated.

***So, what is the Shadow DOM?***

In a nutshell, Shadow DOM is a new part of the HTML spec which allows developers to encapsulate their HTML markup, CSS styles and JavaScript. Shadow DOM, along with a few other technologies which we'll cover later, gives developers the ability to build their own 1st class tags and APIs just like the `<video>` tag. Collectively, these new tags and APIs are referred to as **Web Components**.

## The Why [#](#)

If you've been developing web sites for a while you've probably heard of [Bootstrap](http://getbootstrap.com/). Bootstrap is a collection of UI components which comes with a set of style sheets, scripts and documented HTML patterns to tie it all together. Here is an example of the markup required for a Bootstrap [navbar](http://getbootstrap.com/components/#navbar):

    <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex6-collapse">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
        <a class="navbar-brand" href="#">Brand</a>
      </div>
      <div class="collapse navbar-collapse navbar-ex6-collapse">
        <ul class="nav navbar-nav">
          <li class="active"><a href="#">Home</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </div>
    </nav>
    

Because there is no way to package Bootstrap components you must write out the HTML *exactly* as it is documented. Often times that means copying and pasting code from the Bootstrap docs into your application. While you are able to quickly build a page using this approach, it also means that much of the markup in your application is something you didn't write and are not deeply familiar with. This can lead to all sorts of sneaky little bugs. It's also harder to quickly visually parse your work because so much of it is boilerplate.

Consider also that the Bootstrap style sheet is ~6,600 lines long, meaning, at any point, you could accidentally override a crucial selector and blow up a portion of your page. Your JavaScript will also need to coexist with the Bootstrap JavaScript and similarly respect its boundaries and never inadvertently trespass.

**It can be a lot to manage.**

And, of course, all of the above also applies to any 3rd party jQuery plugins, animation engines, charting libraries, modules, sprockets and widgets that are included in your application...

### The value prop of Shadow DOM

Let's imagine, instead, that the Bootstrap navbar works exactly like the `<video>` tag from our previous example. Maybe it looks something like this:

    <bootstrap-navbar fixed-top>
      <a href="#">Home</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </bootstrap-navbar>
    

That does seem a bit easier to wrangle, doesn't it?

Until recently such a thing was not possible. You've always been able to define your own tags in HTML but the browsers just treat them as `<div>`s and you get no special encapsulation benefits. More to the point, there's no way to hide all of the implementation details of your navbar, the markup has to exist somewhere on the page. And if you *really* want privacy you could use `iframes` but `iframes` are bloated and often difficult to work with. With the introduction of Shadow DOM all of that changes.

I'm sure by now you're tired of listening to me prattle on and you're ready for some code! Follow me on to our next post where we'll dive into Shadow DOM and walk through the basics.

## [Continue to Shadow DOM: Basics →](/blog/2013/08/27/shadow-dom-the-basics/)
