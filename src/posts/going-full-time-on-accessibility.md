---
title: Going full-time on accessibility
date: 2018-06-27T02:47:00.000Z
updated: 2019-01-13T01:10:12.000Z
tags:
  - Accessibility
draft: true
---

This is a post that I should have written ages ago but better late than never :)

If you [follow me on twitter](https://twitter.com/rob_dodson) you may have noticed that a few years back I started talking more about accessibility and less about web components and Polymer. This all began when my teammate, Alice Boxhall, asked me to co-author a course on [accessibility fundamentals](https://bit.ly/web-a11y). Initially, I thought, “oh, this will be a great way for me to learn more about a topic area that I’m deficient in.” But as we wrapped up the course, my work and interest in the topic continued to grow. Teams—both internal and external—began reaching out to me, asking for help to make their sites and components accessible. I quickly realized that the state of accessibility is pretty dismal and it feels like it’s only getting worse.

After discussing it with my managers, I began to shift more of my time from web components over to accessibility. These days I spend around 80% of my time working on accessibility, and reserve the remainder for web components projects like [custom-elements-everywhere](https://custom-elements-everywhere.com/).

But because I never announced I was shifting gears, this change sent a mixed message to developers. I’ve heard a few devs say things like “Rob stopped doing Polycasts. Looks like Polymer is on the way out,” or “web components are dead!” Really, this couldn’t be further from the truth. Browsers operate on a very long timeline, and web components are here to stay. Currently we’re looking at how new accessibility APIs can be combined with them to do some pretty amazing stuff. For instance, as part of [AOM](https://github.com/WICG/aom), we’re exploring if a custom element with shadow DOM can [declare its default semantics](https://github.com/WICG/aom/blob/gh-pages/explainer.md#use-case-1-setting-non-reflected-default-accessibility-properties-for-web-components), without the developer needing to sprinkle a bunch of ARIA around. These are the kinds of cool things you can build once you have a standard component model in place. I’m pretty confident more specs in the near future will use custom elements as an extension point.

So no, Web Components and Polymer aren’t going anywhere. There are amazing folks like [Monica](https://twitter.com/notwaldorf), [Elliott](https://twitter.com/Elliott_Marquez), and [Justin](https://twitter.com/justinfagnani) leading the charge for Polymer's outreach and developer education. And if you haven’t had a chance yet, you should watch the team’s I/O talks [[1](https://www.youtube.com/watch?v=7CUO7PyD5zA&amp;t=1547s), [2](https://www.youtube.com/watch?v=we3lLo-UFtk&amp;t=1s)] cuz they’re amazing. Personally, I’m just spending more time with a topic that I’m super nerdy about. And hopefully—if I do my job well—you will start to get a bit more nerdy about it too! :)

Rob
