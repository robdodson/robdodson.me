---
title: Chrome/Blink devs discuss setImmediate
tags:
  - JavaScript
  - Chrome
  - Blink
  - WebKit
date: 2013-07-29T16:05:00.000Z
updated: 2015-01-02T08:50:12.000Z
---

Really interesting discussion of the pros and cons of the `setImmediate` function. For a little backstory checkout [this post](http://www.nczonline.net/blog/2013/07/09/the-case-for-setimmediate/) by [Nicholas Zakas](http://www.nczonline.net/blog/) ([@slicknet](http://twitter.com/slicknet))

Here's a nice tidbit from one of the Chrome devs:

> To perform work immediately before the next display - for example to batch up graphical updates as data is streamed in off the network - just make a one-off `requestAnimationFrame()` call.  To perform work immediately -after- a display, just call `setTimeout()` from inside the `requestAnimationFrame()` handler.

[The full thread is available here.](https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/Hn3GxRLXmR0)
