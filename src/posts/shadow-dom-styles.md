---
title: "Shadow DOM: Styles"
tags:
  - Web Components
  - Shadow DOM
date: 2013-08-28T17:56:00.000Z
updated: 2015-01-01T20:36:41.000Z
---

[Yesterday's post](/blog/2013/08/27/shadow-dom-the-basics/) was all about coding and structuring your first Shadow DOM elements. But I'm sure most of you were wondering, how do we style these things?!

The use of CSS in Shadow DOM is an interesting and large topic. So large, in fact, that I'm going to split it up over the next couple of posts.

*If you want to cut to the chase, I've put together a [Shadow DOM CSS Cheat sheet](/blog/2014/04/10/shadow-dom-css-cheat-sheet/) which you can use as a reference.*

Today we'll learn the basics of using CSS within the **shadow boundary**, and also how to style our **shadow hosts**.

*Before we get started I wanted to thank Eric Bidelman for his [amazing article on styling the Shadow DOM](http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom-201/). Most of this article is my interpretation of his post. Definitely go read [everything on HTML5 Rocks that pertains to Web Components](http://www.html5rocks.com/en/tutorials/#webcomponents) when you get a chance.*

## Support [#](#)

In order to try the examples I suggest you use Chrome v33 or later since it has native support for the features I'll show.

## Style Encapsulation [#](#)

Astute readers probably noticed that I used a new term in the introduction for this post. That term is **shadow boundary** and it refers to the barrier that separates the regular DOM (the "light" DOM) from the shadow DOM. One of the primary benefits of the shadow boundary is that it prevents styles that are in the main document from leaking into the shadow DOM. This means that even though you might have a selector in your main document for all `<h3>` tags, that style will not be applied to your shadow DOM element unless you specifically allow it.

Examples? Yes, let's.

    <body>
        <style>
          button {
            font-size: 18px;
            font-family: cursive;
          }
        </style>
        <button>I'm a regular button</button>
        <div></div>
    
        <script>
          var host = document.querySelector('div');
          var root = host.createShadowRoot();
          root.innerHTML = '<style>button { font-size: 24px; color: blue; } </style>' +
                           '<button>I\'m a shadow button</button>'
        </script>
      </body>
    

![Shadow DOM style encapsulation](/images/2015/01/shadow-dom-styles1.jpg)

Here we have two buttons. One is in the regular DOM, and the other is in the shadow DOM. You'll notice that the style tag at the top of the page instructs all buttons to use a cursive font and to have a `font-size` of 18px.

    <style>
      button {
        font-size: 18px;
        font-family: cursive;
      }
    </style>
    

Because of the shadow boundary, the second button ignores this style tag and instead implements its own look. We never specifically override the `font-family` to change it back to sans serif, it just uses the typical browser defaults.

Keep in mind that the shadow boundary also protects the main document from the shadow DOM. You'll notice that our shadow button has a `color` of blue. But the button in the original document maintains its default appearance.

This kind of **scoping** is pretty amazing. For years we've struggled with style sheets that always seem to get bigger and bigger. Over time it can be difficult to add new styles because you're worried you'll break something elsewhere on the page. The style boundaries provided to us by the shadow DOM means that we can finally start to think about our CSS in a more local, component specific way.

## Styling :host [#](#)

I often think of the shadow host as if it's the exterior of a building. Inside there's all the inner workings of my widget and outside there should be a nice facade. In many cases you'll want to apply some style to this exterior and that's where the `:host` selector comes into play.

    <body>
      <style>
        .widget {
          text-align: center;
        }
      </style>
    
      <div class="widget">
        <p>Hello World!</p>
      </div>
    
      <script>
        var host = document.querySelector('.widget');
        var root = host.createShadowRoot();
        root.innerHTML = '<style>' +
                         ':host {' +
                         '  border: 2px dashed red;' +
                         '  text-align: left;' +
                         '  font-size: 28px;' +
                         '} ' +
                         '</style>' +
                         '<content></content>';
      </script>
    </body>
    

![Shadow DOM host styles](/images/2015/01/shadow-dom-styles2.jpg)

Adding a red border to our widget doesn't seem like much but there's actually a number of interesting things happening here. For starters, notice that styles applied to the `:host` are inherited by elements within the shadow DOM. So our `<p>` ends up with a `font-size` of 28px.

Also notice that the page is able to set the `text-align` inside the `:host` to center. The `:host` selector has low specificity by design, so it's easier for the document to override it if it needs to. In this case the document style for `.widget` beats out the shadow style for `:host`.

## Styling by :host Type [#](#)

Because `:host` is a pseudo selector we can apply it to more than one tag to change the appearance of our component. Let's do another example to demonstrate.

    <body>
      <p>My Paragraph</p>
      <div>My Div</div>
      <button>My Button</button>
    
      <!-- Our template -->
      <template class="shadow-template">
        <style>
          :host(p) {
            color: blue;
          }
    
          :host(div) {
            color: green;
          }
    
          :host(button) {
            color: red;
          }
    
          :host(*) {
            font-size: 24px;
          }
        </style>
        <content select=""></content>
      </template>
    
      <script>
        // Create a shadow root for each element
        var root1 = document.querySelector('p').createShadowRoot();
        var root2 = document.querySelector('div').createShadowRoot();
        var root3 = document.querySelector('button').createShadowRoot();
    
        // We'll use the same template for each shadow root
        var template = document.querySelector('.shadow-template');
    
        // Stamp the template into each shadow root. Notice how
        // the different :host styles affect the appearance
        root1.appendChild(document.importNode(template.content, true));
        root2.appendChild(document.importNode(template.content, true));
        root3.appendChild(document.importNode(template.content, true));
      </script>
    </body>
    

![Shadow DOM styling by host type](/images/2015/01/shadow-dom-styles3.jpg)

*I've switched to using a [template tag](/blog/2013/03/16/html5-template-tag-introduction/) for this example since it makes working with the Shadow DOM a lot easier.*

As you can see from the example above, we're able to change the look of our component by matching the `:host` selector to a specific tag. We can also match against classes, IDs, attributes, etc. Really any valid CSS will do.

For instance, you could have `.widget-fixed`, `.widget-flex` and `.widget-fluid``:hosts` if you wanted to build a highly responsive component. Or `.valid` and `.error``:hosts` for form elements.

By using the `*` selector we're able to create default styles which will apply to any `:host`, in this case setting all components to a `font-size` of 24px. This way you can construct the basic look for your component and then augment it with different `:host` types.

What about theming hosts based on their parent element? Well, there's a selector for that too!

## Theming [#](#)

    <body>
      <div class="serious">
        <p class="serious-widget">
          I am super serious, guys.
        </p>
      </div>
    
      <div class="playful">
        <p class="playful-widget">
          Pretty little clouds...
        </p>
      </div>
    
      <template class="widget-template">
        <style>
          :host-context(.serious) {
            width: 200px;
            height: 50px;
            padding: 50px;
            font-family: monospace;
            font-weight: bold;
            font-size: 24px;
            color: black;
            background: tomato;
          }
    
          :host-context(.playful) {
            width: 200px;
            height: 50px;
            padding: 50px;
            font-family: cursive;
            font-size: 24px;
            color: white;
            background: deepskyblue;
          }
        </style>
        <content></content>
      </template>
      <script>
        var root1 = document.querySelector('.serious-widget').createShadowRoot();
        var root2 = document.querySelector('.playful-widget').createShadowRoot();
        var template = document.querySelector('.widget-template');
        root1.appendChild(document.importNode(template.content, true));
        root2.appendChild(document.importNode(template.content, true));
      </script>
    </body>
    

![Shadow DOM theming](/images/2015/01/shadow-dom-styles5.jpg)

Using `:host-context()` syntax we're able to completely change the look of our widget based on the containing element. This is pretty neat! I'm sure you've all used the child selector before, `.parent > .child`, but have you ever wished for a parent selector, `.parent < .child`? Now it's possible, but only with the shadow DOM. I wonder if we'll see this syntax tracked back to normal CSS someday?

## Styling :host States [#](#)

One of the best uses of the `:host` tag is for styling states like `:hover` or `:active`. For instance, let's say you want to add a green border to a button when the user rolls over it. Easy!

    <body>
      <button>My Button</button>
    
      <template class="button-template">
        <style>
          :host {
            font-size: 18px;
            cursor: pointer;
          }
          :host(:hover) {
            border: 2px solid green;
          }
        </style>
        <content></content>
      </template>
      <script>
        var host = document.querySelector('button');
        var root = host.createShadowRoot();
        var template = document.querySelector('.button-template');
        root.appendChild(template.content.cloneNode(true));
      </script>
    </body>
    

![Shadow DOM host state](/images/2015/01/shadow-dom-styles4.jpg)

Nothing fancy but hopefully it gets your imagination going a bit. What other states do you think you could create?

## Conclusion [#](#)

There's still a lot more to talk about when it comes to styling the Shadow DOM. Let's take a break for today and pick it up again tomorrow. As always if you have questions [hit me up on twitter](http://twitter.com/rob_dodson) or leave a comment. Thanks!

## [Continue to Shadow DOM: Styles (cont.) →](/blog/2013/08/29/shadow-dom-styles-cont-dot/)
