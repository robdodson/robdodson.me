---
title: Let's Talk SMACSS
tags:
  - Chain
  - CSS
  - SMACSS
date: 2012-06-10T04:03:00.000Z
updated: 2015-01-02T08:55:18.000Z
---

In an effort to further my understanding of CSS best practices I've ended up with two sort of looming frameworks: [OOCSS](http://oocss.org/) and [SMACSS.](http://smacss.com/) After reading up on both I feel more drawn toward SMACSS, most likely because it features a lumberjack on its site. I want to give a quick summary of what SMACSS has to offer. In so doing I'm going to borrow liberally from the documentation and then explain my thinking as it relates to certain passages. Cool? OK.

## The Skinny

The ideas behind SMACSS were fostered over time by its creator, Jonathan Snook, who has worked on tons of sites, most notably YAHOO! Mail's latest redesign. SMACSS is not a library of ready-made code that you can just download like [Twitter's Bootstrap](http://twitter.github.com/bootstrap/) or [ZURB's Foundation.](http://foundation.zurb.com/) Instead it is a collection of design ideas and suggestions codefied in an easy to read ebook. Think of it as a tool to help you decide _how_ you're going to write your CSS, rather than something which will write your CSS for you.

The Core of the book, which is what I'm going to focus on today, is separated by stylesheet: Base Rules, Layout Rules, Module Rules, State Rules, and Theme Rules.

## Base Rules

> Base rules are the defaults. They are almost exclusively single element selectors but it could include attribute selectors, pseudo-class selectors, child selectors or sibling selectors. Essentially, a base style says that wherever this element is on the page, it should look like this. -- SMACSS, Categorizing CSS Rules

[Nicole Sullivan](http://www.stubbornella.org/content/), creator of OOCSS, suggests that we start with the smallest possible elements of our site and design up from there. In the SMACSS philosophy this process would start with our `base.css` file. Think of it as the place where we define the absolute most basic styles any element on our site can have.

```css
body,
form {
  margin: 0;
  padding: 0;
}

a {
  color: #039;
}

a:hover {
  color: #03f;
}
```

The idea is to give us a decent, even playing field where all of our core pieces are ready to be used in whatever fashion we see fit. You might find that you enjoy adding your css reset or normalization to a base.css file but personally I like to keep my reset separate to reduce clutter.

## Layout Rules

> Layout rules divide the page into sections. Layouts hold one or more modules together. -- SMACSS, Categorizing CSS Rules

Your layout rules are where prototypes start to come to life. Every site can be broken down into two very broad layers. The first is the scaffolding of the page and the second is the modules which live in the scaffolding.

To understand scaffolding, try looking at a website like [CNN](http://www.cnn.com/) and unfocusing your eyes. Once you're ignoring the words and pictures you should be able to easily describe the major areas of content: the header, the primary content, sidebars, etc. The rules which govern the positioning of those elements should live in `layout.css`.

```css
#header,
#article,
#footer {
  width: 960px;
  margin: auto;
}

#article {
  border: solid #ccc;
  border-width: 1px 0 0;
}
```

It's also a good place to put other generalized layout styles which might be used elsewhere in your site. For instance, a horizontal list for menu items or breadcrumbs:

```css
.h-list {
  margin: 0;
  padding: 0;
  list-style-type: none;
}
.h-list > li {
  display: inline-block;
  margin: 0 10px 0 0;

  /* IE7 hack to mimic inline-block on block elements */
  *display: inline;
  *zoom: 1;
}
```

These styles don't care about the color or background or any other specifics of their elements. They only care about how those elements will be layed out in space.

## Module Rules

> Modules are the reusable, modular parts of our design. They are the callouts, the sidebar sections, the product lists and so on. -- SMACSS, Categorizing CSS Rules

The module rules are where the majority of your site code will go, as this sheet defines all the little inhabitants of that second layer I mentioned, the modules _inside_ the scaffolding. Each module should be able to stand on its own, and as such, it might be a good idea to design them first in a separate file so there is no temptation to leverage styles already on the page. Once your module is complete you can drop it into your document and it _should_ play nice with everyone else.

Each module will typically start with a class name, and all subsequent selectors should work from this point down. Or if our module is going to be rather complex we can namespace our selectors. For instance:

```css
.pod {
  width: 100%;
}

.pod > h3 {
  color: #f00;
}

/* Or... */

.pod-title {
  color: #f00;
}
```

Whether you use descendant selectors or namespaced clases is really up to you and how complex your modules get. You definitely don't want to end up with classitis. The advantage to using `.pod-title` is that it doesn't tie us to an `h3`, however your markup might become a total mess if every single element requires its own class. Balance is key.

### Subclassing Modules

One very important concept to keep in mind is that of subclassing modules. Imagine a scenario where you have a widget which exists in your primary content area. One day your boss tells you to move it into the sidebar, and once it's there 99% of the styles should look the same, except the widget will now be about 3/4ths of its normal width and its text should be red instead of blue. Your first inclination might be to move the code for the widget into the sidebar and then to do something like this:

```css
/* DON'T DO THIS! */

.widget {
  width: 100px;
}

.widget .widget-title {
  color: #00f;
}

#sidebar .widget {
  width: 75px;
}

#sidebar .widget .widget-title {
  width: 75px;
}
```

By leveraging the parent context we've now locked ourselves into a specificity war. Any change to our second widget requires the `#sidebar` id, which also means that this second widget cannot live anywhere else. Rather than using the parent we should consider the widget that lives in the sidebar as an _extension_ of our original object.

```css
.widget {
  width: 100px;
}

.widget .widget-title {
  color: #00f;
}

/* Our Subclass */
.widget-constrained {
  width: 75px;
}

.widget-constrained .widget-title {
  color: #f00;
}
```

To use a subclass we should apply both the original and the subclass styles to our element:

```html
<div class="widget widget-constrained">...</div>
```

The benefit of doing it this way is that the styles are easier to read and also more flexible. Since there's no parent coupling our `widget-constrained` can be used in the sidebar, footer, modals, or anywhere else you'd like.

## State Rules

> State rules are ways to describe how our modules or layouts will look when in a particular state. Is it hidden or expanded? Is it active or inactive? They are about describing how a module or layout looks on screens that are smaller or bigger. They are also about describing how a module might look in different views like the home page or the inside page. -- SMACSS, Categorizing CSS Rules

The best example of what should go into a `states.css` is the classic error state.

```css
.is-error {
  border: 1px solid red;
}
```

Really anything that would potentially be added with JavaScript to illustrate a change in a module's state would be a good candidate. Some other ones that come to mind are `is-hidden` or `is-pressed`.

One rather sticky point to the whole idea of a `states.css` is that most of the states would need to either rely on being loaded after all your other stylesheets or have an `!important` added to them. I think for a lot of folks that is a dealbreaker, although in my opinion, if used properly, those few !importants can be very useful. For instance, if we add an `is-hidden` state to one of our elements I think it's perfectly ok to `!important` the `display: none`.

### Module States

An alternative to using `!important` all over the place is the idea of module states. So rather than `.is-pressed` in our `states.css` we would have `.is-btn-pressed` next to our `.btn` module in `modules.css`. I like this approach a lot and think it solves many of the places where `states.css` feels too general.

## Theme Rules

> Theme rules are similar to state rules in that they describe how modules or layouts might look. Most sites don’t require a layer of theming but it is good to be aware of it.

The primary consideration for theme rules are when your site is able to be reskinned and also if the typography can be changed.

Skinning a new module with a `theme.css` might look something like this:

```css
/* in modules.css */
.mod {
  border: 1px solid;
}

/* in theme.css */
.mod {
  border-color: blue;
}
```

Likewise if you need to switch to a different font or size, here is where you would do that. To be honest I don't currently need to make any of my projects skinnable so I haven't explored the ideas around `theme.css` all that much, but I do think it's a good idea to keep in the back of your hat.

## Wrap it up!

That does it for tonight. Hopefully you're a little more enlightened with regards to SMACSS. Definitely [checkout the SMACSS site](http://smacss.com/) and grab the book. And as always please feel free to [send me feedback on Twitter](https://twitter.com/rob_dodson).
