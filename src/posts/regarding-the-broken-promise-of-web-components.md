---
title: Regarding the broken promise of Web Components
date: 2017-03-16T01:01:38.000Z
updated: 2017-06-18T05:25:31.000Z
---

After reading an article titled [The broken promise of Web Components](https://dmitriid.com/blog/2017/03/the-broken-promise-of-web-components/) and typing out the world's longest comment response I figured it'd be better if I try to distill my thoughts into a blog post. I'll address each of the points raised by the author as their own section.

## After years of effort Web Components have been a waste of time

Something I've learned from working with the Chrome team is that browser makers view shipping something in the platform very differently from the web dev audience. Once you ship something in the browser, the assumption is it's there "forever", at a minimum several years, possibly decades. This means big changes are often undertaken in a slow process that to outside observers feels downright glacial.

Web Components are a big change and as a result they've moved pretty slowly. Along the way some parts got dropped or reworked but that's a good thing. Using an ES6 Class instead of building a prototype Object to create a Custom Element is a much nicer approach, but required revising the Custom Elements spec. It's frustrating because it delayed native Custom Element support for folks, but the final product is better.

I'd still like things to move faster, but in 2016 we saw Safari add support for Custom Elements and Shadow DOM, and it looks like Firefox may be on track to do the same in 2017 (fingers crossed). It's taken a (very) long time, but I do think we're getting close to having full cross-browser support soon.

## React built a better mouse trap

React is awesome and drives a ton of discussion among folks who work on Web Components. My perspective is that the ideas in React and the ideas in Web Components are not mutually exclusive. Instead, we should roll those patterns into how we build components and make sure we have a good story for interoperability.

Whether you choose to use React or Web Components (or both) I think ultimately comes down to personal style and project constraints. Let's say in another year or two Web Components become fully supported and you're asked to build a UI library to scale across a huge company with tons of developers on different stacks. Web Components would fit that job very well. Or let's say you're a marketing agency making a site for a product launch. There's only one team invovled and everyone is already familiar with React. It would make sense to just use React for the whole thing. There are a lot of scenarios that fall in between these two examples but really it comes down to using the right tool for the job.

As a bit of an aside, I also feel like a lot of folks often overlook the fact that libraries like [Amp](https://www.ampproject.org) are in fact Web Components (specifically Custom Elements), and Amp is incredibly successful. Their elements are performant and meet a need for publishers. Often times the Web Components discussion descends into Framework X versus Framework Y, but taking a step back reveals there are other applications for these standards that we may have overlooked.

## The DOM is slow

Abstractions like React/JSX which help you manage your DOM updates are great, but they don't come free of cost. A major bottleneck for page load times is large javascript bundles being downloaded which then take a very long time to parse on underpowered mobile hardware. Here's a great talk on the subject by my teammate Sam Saccone: [https://www.youtube.com/watch?v=RWLzUnESylc](https://www.youtube.com/watch?v=RWLzUnESylc)

The important takeaway is that React (or really any library that provides an abstraction over the DOM, including Polymer) is not a silver bullet. If you end up shipping megabytes of slow-to-parse javascript, then you've just shifted the problem around. The fix is to make sure you're splitting up your bundles, and only loading what you need, when you need it.

## Using JSX and Virtual DOM is nicer than using DOM APIs directly

The DOM APIs are meant to be low level tools that we can build abstractions on top of. JSX is a great tool but the use case cited by the author (JSX + ReactDOM) is just sugar over the native DOM APIs. As a result, there's no reason why you can't use JSX with Web Components, and libraries like [SkateJS](https://github.com/skatejs/skatejs) do this today.

## There's no standardized data binding system

A frustration cited in the blog post is that there's no standardized data binding system and that Polymer had to invent their own. Originally there *was* a proposed standard, called [Model Driven Views](https://github.com/toolkitchen/mdv), and (if I understand my history correctly) this is what Polymer's binding system was originally based on. But this proposal never caught on. I've heard anecdotally that it was too difficult to get the various stakeholders (including framework authors) to agree on exactly *how* data binding should work in the platform.

Today many developers prefer the look of JSX to template bindings (MDV style) and with things like Observables and ES6 Proxies on the horizon, I'm not sure what this space will look like in a few years. It may just be too volatile to standardize right now. Competition in this space is a good thing though. Over time it helps us zero in on a solution that makes everyone happy.

## Working with string attributes is annoying

Because a Custom Element is really just a class instance, you can (and should) provide a properties interface using ES6 class getters/setters. That way you don't have to rely on attributes for anything other than initial configuration (if you want to). [I wrote up a blog post on how to do this here](https://medium.com/dev-channel/custom-elements-that-work-anywhere-898e1dd2bc48#.5rnqw871f).

This means properties (not attributes) can be the source of truth for your element. And libraries like Angular2 already support this in their binding system when communicating with Web Components.

Evangelizing component authoring best practices that use this approach is something I'm currently pursuing along with the help of my teammates so stay tuned for more in this department :)

## Wrapping up

I completely understand the frustration expressed by the author in this post. As someone working on Web Components for years (and years) at this point I'm like "OMG CAN WE PLEASE BE DONE SOON!" But I'm actually more excited for the work I'm doing this year than I was in 2016.

I think we're finally getting on solid footing when it comes to browsers shipping native implementations. The standards have stopped moving around so we can start publishing best practices. And folks are taking Web Components in new and interesting directions. I've already mentioned [SkateJS](https://github.com/skatejs/skatejs), but just the other day I discovered [Switzerland](https://github.com/Wildhoney/Switzerland), and the Polymer team is close to releasing Polymer 2.0. Also the Amp team just wrapped up a [two day conference](https://www.ampproject.org/amp-conf-2017/) where they showed off all the cool stuff they've been working on ([videos available on their YouTube channel](https://www.youtube.com/channel/UCXPBsjgKKG2HqsKBhWA4uQw)).

So yeah, as crazy as it sounds given how long things have taken, I think 2017 is going to be a good year for Web Components. There are still hard problems to tackle but I think we'll get there. And just like any tool, the final result won't be a panacea, but it will solve real problems and serve as a building block to address future issues in the platform.
