---
title: The future of accessibility for custom elements
date: 2017-10-02T20:17:28.000Z
updated: 2017-12-22T20:02:27.000Z
---

When users of assistive technology, like a screen reader, navigate a web page, it’s vitally important that the semantic meaning of the various controls is communicated.

For example, if a screen reader visits a login button:

```html
<button>Sign in</button>
```

—it  would announce, “Sign in, button”. This tells the user about the affordance available to them—whether something is a button that may be pressed, for example, or if it’s just a block of text content with no other semantics.

Additionally, built-in elements support keyboard-based usage, which is important for users who can’t use a pointing device—whether they are unable to see the pointer, or don’t have the physical ability. This is why accessibility experts always urge developers to mark up their pages with the built-in elements.

[Custom elements](https://developers.google.com/web/fundamentals/web-components/customelements), by contrast, have no implicit semantics or keyboard support.

When you define a new tag, the browser really has no way of knowing if you’re trying to build a button, or a slider, or just a fancy text container. Adding these features back in requires a fair bit of work on the developer’s part and it can be difficult to reach parity with the native equivalents.

## `<howto-component>`

Recently we launched a project called [HowTo: Components](https://github.com/GoogleChromeLabs/howto-components) which demonstrates how to build accessible custom elements. Many folks have since asked us why we’re bothering to implement things like [checkbox](https://github.com/GoogleChromeLabs/howto-components/tree/master/elements/howto-checkbox) since there is already an accessible, native version.

Taking an even cursory look at any web framework shows that developers are going to keep building  custom checkboxes, even though it’s arguably more work than using a built-in element. We’ll get to why that is in a moment, but given that’s the case, we’d like to educate developers on the best practices for doing so. Here we take inspiration from the [ARIA Authoring Practices Guide](https://www.w3.org/TR/wai-aria-practices-1.1/), and in fact all of the HowTo: Components are based on their examples. We just want to illustrate how to do them as custom elements.

So, why do developers keep reinventing this wheel?

## Built-in elements are great. Until you try to style them.

`<input>` is like the Swiss Army Knife of elements. It contains multiple different types (text, date, file...) and each of them is difficult to style. Have you ever tried to style an `<input type="file">`? It **sucks**. Here's how Mark Otto, co-creator of Bootstrap, recommends styling them on his site, [wtfforms](http://wtfforms.com):

> The file input is the most gnarly of the bunch. Here's how it works:

> - We wrap the `<input>` in a `<label>` so the custom control properly triggers the file browser.
> - We hide the default file `<input>` via `opacity`.
> - We use `:after` to generate a custom background and directive (Choose file...).
> - We use `:before` to generate and position the Browse button.
> - We declare a height on the `<input>` for proper spacing for surrounding content.
> - We add an explicit label text for assistive technologies with an `aria-label` attribute.

> In other words, it's an entirely custom element, all generated via CSS.

Not fun. I think a large reason so many sites are inaccessible is because developers run into these styling limitations and decide to just roll their own controls—without adding back in the necessary semantics and keyboard support.

> So why is it so hard to style the built-in form elements? Can't browsers make this as easy as styling a `<div>` or an `<h1>`?

Not really. Elements like `<input>` and `<select>` aren’t always implemented in terms of regular DOM elements. Sometimes they are, which is why there are articles on CSS hacks for styling `<input type="range">`. Other times they are rendered directly by the operating system - this is why a standard `<select>` comes up looking like any other native drop-down list on the platform you’re using. They are specified as a kind of black box, meaning it’s up to the browser to figure out their internals, so exposing styling hooks for them is quite difficult and often very limited. It is entirely possible that **we may never be able to style these elements to the degree we want**.

The alternative is to expose the magic behavior that these elements have as new web platform APIs. Not only will this allow us to create more flexible versions of `<input>` and `<select>`, but we can also expand the grammar to include other elements like `<multi-select-autocomplete-thing>`.

This is why I am so passionate about custom elements. In my mind, it is where the future of accessibility lives. I deeply want to be able to stop hacking CSS on top of `<select>`. I want to make my own badass, extensible, styleable, accessible elements that are just as good as the built-ins!

So as well as modeling best practices with today’s technologies, I’m hoping that HowTo: Components can help us identify areas where we can create better APIs for the next generation of web technology. We want to get to a point where we’re not forced to choose between the impossible task of styling the existing set of built-in elements, or the fiddly, error-prone and largely forgotten job of re-implementing accessibility for every new custom element.

## How do we get there?

The first step is to make sure our custom elements have the right semantics.

I’m excited for the potential of the new [Accessibility Object Model (AOM)](https://github.com/wicg/aom) proposal to help us out here. AOM lets an element define its semantics directly in the accessibility tree.

What’s the accessibility tree you ask? Ah ha! [We have a article for you!](https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/the-accessibility-tree)

As I mentioned before, a custom element is, semantically speaking, just a `<span>`, whereas the native `<button>` element has built-in accessibility because it has an implicit role of "button". While we could have our `<custom-button>` sprout ARIA attributes to define its semantics, this can get ugly fast. To recreate a `<input type="slider">` as a custom element would end up looking like:

```html
<custom-slider min="0" max="5" value="3" role="slider"
  tabindex="0" aria-valuemin="0" aria-valuemax="5"
  aria-valuenow="3" aria-valuetext="3"></custom-slider>
```
    

And because ARIA is exclusively an HTML attributes API, it means we need to touch the DOM every time we want to update our semantic state. For an individual element this isn't so bad, but if you have hundreds of controls (perhaps inside of a table or list), having each of them call `setAttribute()` multiple times at startup could lead to a performance bottleneck.

With AOM your element can just define its semantics in its constructor like so:

```js
class CustomSlider extends HTMLElement {
  constructor() {
    super();
    this.accessibleNode.role = 'slider';
    this.accessibleNode.valueMin = 0;
    this.accessibleNode.valueMax = 5;
    this.accessibleNode.valueNow = 3;
    this.accessibleNode.valueText = 3;
  }
}
```

—and the consumer of your element doesn't have to see it sprouting attributes all over the place. Effectively, `<input type="slider">` and `<custom-slider>` become indistinguishable at the semantic level.

Some folks have even proposed giving custom elements access to a special "private" `accessibleNode` so the author can define immutable default semantics. This would mean that one could safely override an element's role, then delete that override, and things would safely fallback. For example:

```js
// default role is "slider"
// set using private accessibleNode by the element author
<custom-slider id="mySlider">

// element consumer changes role to "button"
mySlider.accessibleNode.role = "button"

// element consumer nulls role
mySlider.accessibleNode.role = null

// element falls back to default role
getComputedAccessibility(mySlider.accessibleNode).role // returns 'slider'

// note: the ability to compute the accessibility tree is
// a phase 4 AOM proposal. The line above is pseudo code :)
```

## But wait, there's more...

Another major pain point of using ARIA is the fact that all relationships must be defined using ID references. On numerous projects I've had to auto-generate unique IDs to make this system work:

```html
<custom-listbox role="listbox" aria-describedby="generated-id1 generated-id2" aria-activedescendant="generated-id3">
```

Furthermore, new standards like [Shadow DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom) create scoping boundaries for IDs. If you need to point `aria-labelledby` or `aria-activedescendant` at something on the other side of this shadow boundary, you're out of luck!

AOM fixes this by allowing you to build relationships using object references. In the above example we could rewrite our listbox with:

```js
el.accessibleNode.describedBy = 
    new AccessibleNodeList([accessibleNode1, accessibleNode2]);
el.accessibleNode.activeDescendant = accessibleNode3;
```

The `accessibleNodes` in the above example just come from referencing other elements on the page. No more generated IDs or cluttering up the DOM. Nice!

## Wait, wasn’t there something called is=”” for custom elements?

A counter proposal to adding all of these semantics yourself is to just inherit from the built-in elements. For custom elements this idea was specced as “[customized built-ins](https://developers.google.com/web/fundamentals/web-components/customelements#extendhtml)”. With customized built-ins you could inherit from something like [HTMLInputElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement) and then do `<input is=”custom-checkbox”>`.

Unfortunately customized built-ins have not really caught on with all of the browsers, mainly because they suffer from a few gnarly issues. Chief among these is the fact that if you inherit from another element like `<select>`, and add your own shadow root, it will blow away all of the default styling and behavior of the element. Since the primary reason you were extending the element in the first place was probably to style it, this just ends up creating more problems.

I think in the near term, new primitives like AOM and an [as of yet unspecified form submission callback](https://github.com/w3c/webcomponents/issues/187) offer a better alternative when it comes to replicating the built-in elements. Because custom elements still require JavaScript to boot up there are still open questions around progressive enhancement, but my hope is that increasingly exposing primitives will help us find other ways to solve that issue.

## Wrapping up

These are not entirely custom element concerns. Really, any component (React, Angular, etc) should be able to benefit from proposals like AOM. But custom elements are the only *standards-based* way to define a component that can be shared amongst frameworks, so solving things at that level seems very useful.

Our plan with HowTo: Components is to continue to build custom element equivalents of the built-ins so we can educate developers, and push these standards forward. We’ll also be updating the docs to [explicitly call out the limitations](https://github.com/GoogleChromeLabs/howto-components/pull/121) custom elements currently face, and when using a built-in might make more sense. We would love help landing all of the [ARIA Authoring Practices examples](https://www.w3.org/TR/wai-aria-practices-1.1/) as custom elements and plan to push things even further in future quarters by exploring more complex widget types. If you’re interested in pitching in, please feel free to open up a pull request over at the [HowTo: Components repo](https://github.com/GoogleChromeLabs/howto-components) and if you want to learn more about AOM you can check it out in [the Web Incubation Community Group repo](https://github.com/wicg/aom).

*Big thanks to [Alice Boxhall](https://twitter.com/sundress), [Matt Gaunt](https://twitter.com/gauntface), and [Surma](https://twitter.com/dassurma) for reviewing this blog post.*
