---
title: Which elements support shadow DOM?
tags:
  - Shadow DOM
  - Web Components
excerpt: A quick look at which elements do—and don't—support shadow DOM.
date: 2019-01-13T16:56:36.000Z
updated: 2019-01-13T16:56:36.000Z
---

[Oliver on twitter asked](https://twitter.com/Oliver41618769/status/1084275850441355265):

> *Is there a list somewhere of which HTML elements can and can't have a shadow DOM?*

As it turns out, there is! (Big thanks to [Anne van Kesteren](https://annevankesteren.nl/) for [showing us the way](https://twitter.com/annevk/status/1084426928965238787?s=19)).

> If [context object](https://dom.spec.whatwg.org/#context-object)’s [local name](https://dom.spec.whatwg.org/#concept-element-local-name) is **not** a [valid custom element name](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name), `article`, `aside`, `blockquote`, `body`, `div`, `footer`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `header`, `main`, `nav`, `p`, `section`, or `span`, then [throw](https://heycam.github.io/webidl/#dfn-throw) a `NotSupportedError``DOMException`.

Here's a quick example using `div`:

<!-- glitch embed -->

## Exceptions

It's worth calling out that `button`, `input`, `select`, `img`, and `a` are not on this list and will throw an error if you try to attach a shadow root to them. If you need to use them you'll probably need to look into either wrapping these elements or using [a type extension](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#High-level_view).
