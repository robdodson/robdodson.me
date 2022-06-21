---
title: Design by Configuration Sucks
tags:
  - Chain
  - Design Patterns
date: 2012-05-11T02:08:00.000Z
updated: 2014-12-30T07:05:34.000Z
---

### What is design by configuration?

As an experienced developer if you find that you are performing the same actions over and over naturally your brain will start to think "Hey, this isn't very DRY". DRY, or the principle of "Don't Repeat Yourself" is pretty common dogma for most developers. How many times have you heard something like, "If you're doing it twice, you're doing it wrong." Typically when I do an action more than once I start looking for ways to wrap the work into functions or objects. This process can easily lead to what some refer to as "Design by Configuration," or breaking your work into configurable operations.

To explore this concept a bit more, and why I think it's rather brittle, let's come up with a hypothetical. In our scenario we're working for a large company redesigning their web presence. On each page we have widgets of various shapes and sizes. Here's an example of some:

```html
<div class="widget-container grey-background rounded-corners">
  <div class="widget" title="Awesome Widget" data-foo="bar">
    <p>Hey I'm an awesome widget!</p>
  </div>
</div>

<div class="widget-container red-background square-corners">
  <div class="widget" title="Stellar Widget" data-foo="baz">
    <p>Bodly going where no widget has gone before...</p>
  </div>
</div>
```

You've probably already noticed that our two widgets are nearly identical with only subtle differences in the classes, titles and paragraph content. That seems like a great candidate for automation! Because we don't know the names of, or how many classes we might support, we'll try to make it really flexible so we can pass in tons of different values.

```js
function makeWidget(attributes) {
  var classes, title, data, paragraph, widget;

  classes = attributes['classes'] || '';
  title = attributes['title'] || '';
  data = attributes['data'] || '';
  paragraph = attributes['paragraph'] || '';

  widget =
    '<div class="' +
    classes +
    '">' +
    '<div class="widget" title="' +
    title +
    '" data-foo="' +
    data +
    '">' +
    '<p>' +
    paragraph +
    '</p>' +
    '</div>' +
    '</div>';
  $('body').append($(widget));
}

makeWidget({
  classes: 'widget-container grey-background rounded-corners',
  title: 'Hello World!',
  data: 'ribeye',
  paragraph: 'Neato paragraph!',
});
```

You can play around with the previous code snippet and create your own widgets in the console or on jsFiddle. Writing a little function like this seems pretty standard for a lot of cases and I don't want to argue against it entirely but I do want to point out a few gotchas.

### Everything was perfect. Until it wasn't

Let's say that our code works perfectly. We do about 95% of the project and toward the end the client mentions an extra widget that slipped their mind. They'd like it to act just like all the other widgets but they also want to add an additional class to the `p` tag. "Not a problem," you think, "I'll just add a paragraphClasses attribute to our hash."

```js
function makeWidget(attributes) {
  var classes, title, data, paragraph, paragraphClasses;
  widget;

  classes = attributes['classes'] || '';
  title = attributes['title'] || '';
  data = attributes['data'] || '';
  paragraph = attributes['paragraph'] || '';
  paragraphClasses = attributes['paragraphClasses'] || '';

  widget =
    '<div class="' +
    classes +
    '">' +
    '<div class="widget" title="' +
    title +
    '" data-foo="' +
    data +
    '">' +
    '<p ' +
    paragraphClasses +
    '>' +
    paragraph +
    '</p>' +
    '</div>' +
    '</div>';
  $('body').append($(widget));
}

makeWidget({
  classes: 'widget-container grey-background rounded-corners',
  title: 'Hello World!',
  data: 'ribeye',
  paragraph: 'Neato paragraph!',
});
```

Easy enough right? Well, yeah... except you just changed one line that affects ALL of your widgets. Hope you got all those quotation marks perfect!

Later on your client decides that they'd like to add one more widget but this time it should have two paragraph tags instead of one. That puts us in a bit of a dilemma... We could modify our `makeWidget` function to maybe check if there's a `subParagraph` attribute, or we could just hand code this one widget on this one page. Er..did I say one page? Well actually the client just called and said this widget will need to appear on _4_ pages.

At this point we can either hack our makeWidget function, create an entirely new function like `makeSuperWidget` or we could hand code a custom widget in 4 places and hope that if there are any changes we remember to update all 4. Typically I think most people choose either the first or second option, figuring that the changes to the original function are small enough or that creating a new function is still much DRYer than hand coding the thing 4 times.

At this point I feel like we've now fallen into the trap of design by configuration. Basically we've setup our function to accept configuration parameters but the core elements are static and extremely hard to change. We can add lots of classes to our containing div and our first p tag but what if we want to add other attributes? Do we need to break open the code every time?

I think a better solution looks a lot like the syntax for D3.js, which provides helpers to make the process of widget creation easier, but it doesn't completely remove the developer from the process. Here's some pseudo code to illustrate what I think might be a better approach:

```js
widget = make('div')
  .attr('class', 'widget-container grey-background rounded-corners')
  .attr('title', 'Sweet containing div')
  .attr('data-zerp', 'porkchops')
  .append('div')
  .attr('class', 'widget')
  .attr('title', 'Slick inner div')
  .attr('data-foo', 'short-rib')
  .attr('data-bar', 'cutlet')
  .attr('data-baz', 'filet')
  .append('p')
  .html('I can haz contents?')
  .sibling('p')
  .html('I too can haz contents?');
```

Unfortunately this is still a lot of code and my first solution to slim it down is to create a helper function. At that point we're basically back to design by configuration... I'm not entirely ready to give up on this approach because I feel like their _might_ be something here, I'm just not sure what yet. I think the design by configuration problem falls right into that sweet spot between not needing to create a factory and obviously needing to create a factory. I'll try to explore this more in a later post. For now it's time for bed.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
