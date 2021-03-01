---
title: Don't use jQuery plugins with Shadow DOM
date: 2017-06-25T00:00:44.000Z
updated: 2017-06-29T17:19:54.000Z
---

This is a post I should have written a loooong time ago...

**tl;dr:** jQuery plugins don't work inside of Shadow DOM because typically they try to query for something starting at the document level and the shadow root blocks this.

## A super handwavy explanation of jQuery plugins (featuring shitty drawings)

jQuery plugins work by latching on to an element, stamping a template inside of it, and then (often times) querying for items in that template using `$()`.

For example, you might initialize a [WYSIWG](https://en.wikipedia.org/wiki/WYSIWYG) plugin like this:

```html
<div class=".container"></div>
<script>
  $('.container').wysiwg({ // options });
</script>
```

At which point it will fill the `.container` element with some template markup.

![Diagram of document, container, and template markup.](/images/2017/06/jquery-sd-1.png)

Often times the plugin will want to reference specific nodes in the template to give them behaviors. In the above diagram the `.foo` element represents a footer with a few controls inside of it. The plugin *may* attempt to use `$('.foo')` to reach this element. It's important to note that `$('.foo')` is equivalent to `document.querySelector('.foo')`.

![Diagram of querying from the document to the .foo element](/images/2017/06/jquery-sd-2.png)

## How is this different with Shadow DOM?

The primary thing to note about Shadow DOM is that it provides ***DOM encapsulation*** as well as style scoping.

![Diagram of a shadow root creating a boundary around the .container element](/images/2017/06/jquery-sd-3.png)

In other words, you can't query for something inside of a `shadow root` unless you start the query from within the `shadow root` itself. If you try to query from the document level (or really any point outside of the `shadow root`), the shadow boundary will block you.

![Diagram of shadow boundary blocking a query](/images/2017/06/jquery-sd-4.png)

This is actually an intended feature of Shadow DOM. I don't know if you've ever been in a situation where you *accidentally* query something inside of a jQuery plugin (or maybe a plugin accidentally queries some other element on your page) but it can lead to breakages pretty fast. By encapsulating a component's DOM we can prevent such scenarios from happening. This also means that components built with Shadow DOM can be safely dropped into big framework apps and they won't blow up the world.

## But the plugin works in Firefox!

Complicating this whole issue is the fact that effectively polyfilling Shadow DOM can be pretty tricky. As a result folks might see a situation where the plugin seems to work in Firefox (which currently does not support Shadow DOM) but breaks in Chrome or Safari. If you're seeing this behavior then you're almost certainly running into a situation where native Shadow DOM is preventing the plugin from querying something inside of a `shadow root`.

## So... how do I fix it?

Yeah this is where things get a bit tricky. There's no silver bullet fix to this issue. If you're putting a jQuery plugin inside of a component's Shadow DOM, then your component is probably too big. See if you can factor it down into smaller pieces. Maybe the plugin could end up being a leaf node that just sits along side your other Web Components.

Another alternative is to see if you can distribute the plugin as a "Light DOM" child of the component using [Shadow DOM's `<slot>` element](https://www.webpackbin.com/bins/-KnRWY0uGYLO6oBIx73l). You'll need to write some extra code to get access to your distributed children and install listeners on them, but this might be  a workable solution depending on how your page is setup.

## Conclusion

jQuery plugins are great but they were created in an era before Shadow DOM. Trying to mix the two will more often than not lead to bugs and confusion. If you're having a hard time getting them to work in your app, ask yourself if *everything* needs to be in the Shadow DOM, or if it might be better to only use Shadow DOM for the UI components where you know you want a strong encapsulation boundary.
