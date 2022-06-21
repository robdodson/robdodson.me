---
title: Penner easing equations with GFX and CSS3
tags:
  - Chain
  - CSS3
  - GFX
  - jQuery
date: 2012-05-27T07:07:00.000Z
updated: 2014-12-30T07:54:45.000Z
---

This is going to be a bit of lightning post because it's rather late and I need to get to bed. I spent most of the day either eating dim sum or hanging out at the [SF Creative Coders BBQ](http://www.meetup.com/San-Francisco-Creative-Coders/) so I've neglected my blogging duties a bit.

I have something which will hopefully be useful for some folks who are getting into CSS3 animations with the Gfx plugin for jQuery. [I've blogged a bit about Gfx before](http://robdodson.me/blog/2012/05/22/css3-transitions-with-gfx/) and one of the first things I noticed was the lack of a built in easing library. Coming from the Flash world where [TweenLite is king](http://www.greensock.com/tweenlite/) I've grown very accustomed to using Robert Penner's easing equations for great effect. The same equations are used by the jQuery framework to do its animations. Thankfully [Matthew Lein was kind enough to convert those over to cubic-beziers](http://matthewlein.com/ceaser/) for those of us doing CSS3 animations. Since Gfx accepts cubic-beziers I moved the equations from Matthew's tool into an AMD compliant module and [put it up on Github.](https://github.com/robdodson/amd-css3-ease) It's very simple so if AMD isn't your thing you can just rip those parts out :D

Example usage looks something like this:

```js
// After requiring the ease module and
// passing it into your View with the
// name 'Ease'

this.$el.gfx(
  {
    translateY: '300px',
  },
  {
    duration: 500,
    easing: Ease.easeInExpo,
  }
);
```

Give it a shot and consider donating to Matthew's project or buying Robert Penner like a million beers!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Tipsy
- Sleep: 7
- Hunger: 0
- Coffee: 0
