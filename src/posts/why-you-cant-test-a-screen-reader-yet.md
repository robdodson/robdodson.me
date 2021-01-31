---
title: Why you can't test a screen reader (yet)!
date: 2018-01-02T17:42:55.000Z
updated: 2018-01-07T01:57:23.000Z
---

When I first started to learn about accessibility I wanted to write automated tests to ensure that assistive technology devices, like screen readers, were interpreting my pages correctly. Because I'm not a daily screen reader user, I figured it would be easy for a regression to slip in unnoticed.

This idea, testing a screen reader, proved much harder than I thought. It's actually a bit of a holy grail in the accessibility space. Something that many have dreamed of, but few—if any—have achieved.

To understand why this is, it helps to know a bit about the process your page goes through when it finally gets announced by a screen reader.

## The Accessibility Tree

When Chrome parses the DOM and the CSSOM it produces a tree of nodes. You may have heard folks on my team refer to this as the **render tree**. It tells the browser what to paint on screen, and when to omit things hidden by CSS.

But what many don't know is that during this process there's a second tree created called the **accessibility tree**. This tree removes all the nodes which are semantically uninteresting and computes the roles/states/properties for the remaining nodes. Similar to the render tree, it will also remove nodes hidden by CSS.

So, given the following HTML:

    <html>
    <head>
      <title>How old are you?</title>
    </head>
    <body>
      <label for="age">Age</label>
      <input id="age" name="age" value="42">
      <div>
        <button>Back</button>
        <button>Next</button>
      </div>
    </body>
    </html>
    

Chrome would produce an accessibility tree that looks something like:

    id=1 role=WebArea name="How old are you?"
        id=2 role=Label name="Age"
        id=3 role=TextField labelledByIds=[2] value="42"
        id=4 role=Group
            id=5 role=Button name="Back"
            id=6 role=Button name="Next"
    

Next Chrome needs to convert these nodes into something the user's operating system can understand. On Windows it will produce a tree of IAccessible objects, and on macOS it will use NSAccessibility objects. Finally, this tree of OS-specific nodes gets handed off to a screen reader, which interprets it, and chooses what to say.

*If you're really interested, you can check out [this doc which explains a lot more about how accessibility works in Chromium](https://chromium.googlesource.com/chromium/src/+/lkgr/docs/accessibility/overview.md).*

So it's pretty tricky to know what any specific browser + OS + screen reader combo will announce. There are differences in how each browser builds its accessibility tree, there are differences in how well each browser supports ARIA, and there are differences in how the various screen readers interpret the information browsers give to them. Oof!

## So how do we test this stuff?

Rather than test what a screen reader announces, a better place to start might be to test the accessibility tree itself. This avoids some of the layers of indirection mentioned above.

If you [follow me on twitter](https://twitter.com/rob_dodson), you've probably heard me mention a new standard we're working on called the [Accessibility Object Model](https://github.com/wicg/aom) or "AOM", for short. There are a number of features AOM seeks to achieve, but one that I'm most excited about is the ability to compute the accessibility information for a given node.

    const { role } = await window.getComputedAccessibleNode(element);
    assert(role, 'button');
    

*Note, this API is still being sketched out so the final version may be different from the snippet above.*

When this lands (hopefully in 2018) we should be able to start writing unit and integration tests that ensure our components are properly represented in the browser's accessibility tree. That's pretty darn close to Holy Grail territory!

Aside from AOM, there are linters and auditors we can use today, like [eslint-plugin-jsx-a11y](https://github.com/evcohen/eslint-plugin-jsx-a11y), [Lighthouse](https://developers.google.com/web/tools/lighthouse/), [axe](https://github.com/dequelabs/axe-core), and [pa11y](http://pa11y.org/). Ultimately we'll want to use a combination of these tools plus AOM tests to monitor the accessibility of our apps. If you haven't seen Jesse Beach's talk, [Scaling accessibility improvements with tools and process at Facebook](https://www.youtube.com/watch?v=vmA4TS3IbVQ), I recommend you give it a look to see how an organization the size of Facebook is integrating these tools into their process.

To wrap up, I think testing the output of a screen reader may still be a ways off, but in 2018 we're going to have more tools in our toolbox than ever before. If you want to learn more about accessibility fundamentals you can check out this [free Udacity course](https://bit.ly/web-a11y) and if you'd like to start incorporating more accessibility work into your team practice take a look at [my session from this year's Google I/O](https://www.youtube.com/watch?v=A5XzoDT37iM). I'm really excited to see what you all build in 2018 😁

Happy new year!

Rob
