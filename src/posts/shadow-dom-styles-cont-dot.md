---
title: "Shadow DOM: Styles (cont.)"
tags:
  - Web Components
  - Shadow DOM
date: 2013-08-29T18:11:00.000Z
updated: 2015-01-02T08:47:55.000Z
---

In [yesterday's post](/blog/2013/08/28/shadow-dom-styles/) we covered the basics of working with styles in Shadow DOM. But we've only just scratched the surface! Today we'll continue from where we left off and explore how to work with **distributed nodes** and how to poke holes in our components so the outside world can reach in and customize 'em.

*Before we get started I wanted to thank Eric Bidelman for his [amazing article on styling the Shadow DOM](http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom-201/). Most of this article is my interpretation of his post. Definitely go read [everything on HTML5 Rocks that pertains to Web Components](http://www.html5rocks.com/en/tutorials/#webcomponents) when you get a chance.*

## Support [#](#)

In order to try the examples I suggest you use Chrome v33 or later since it has native support for all of these features.

## Distributed Nodes [#](#)

From reading various blog posts I learned that when working with the shadow DOM you should make sure to keep your content separate from your presentation. In other words, if you have a button that's going to display some text, that text should come from the page and not be buried in a shadow DOM template. Contents which come from the page and are added to the shadow DOM using the `<content>` tag are know as **distributed nodes**.

Initially I struggled to understand how it was possible to style these distributed nodes. I kept writing my CSS like this:

    <div class="some-shadow-host">
      <button>Hello World!</button>
    </div>
    
    <template>
      <style>
        :host {
          ...
        }
    
        button {
          font-size: 18px;
        }
      </style>
      <content></content>
    </template>
    

Thinking that if `button` came from the shadow host I should be able to just style it once it was inside my `<content>` tag. But that's not quite how things work. Instead, distributed nodes need to be styled with the `::content` pseudo selector. This actually makes sense because we might want buttons inside of our shadow template to be styled differently from buttons which appear inside of our `<content>` tags.

Let's look at an exmaple:

    <body>
      <div class="widget">
        <button>Distributed Awesomesauce</button>
      </div>
    
      <template class="widget-template">
        <style>
          ::content > button {
            font-size: 18px;
            color: white;
            background: tomato;
            border-radius: 10px;
            border: none;
            padding: 10px;
          }
        </style>
        <content select=""></content>
      </template>
    
      <script>
        var host = document.querySelector('.widget');
        var root = host.createShadowRoot();
        var template = document.querySelector('.widget-template');
        root.appendChild(document.importNode(template.content, true));
      </script>
    </body>
    

![Styling distributed shadow DOM nodes](/images/2015/01/shadow-dom-distributed.jpg)

Here we're pulling in the `button` from our `.widget` shadow host and tossing it into our `<content>` tag. Using the `::content` pseudo selector, we target the `button` as a child with `>` and set our fancy pants styles.

## ::shadow [#](#)

Up to this point we've celebrated the encapsulation benefits of the shadow DOM but sometimes you want to let the user poke a few holes in the shadow boundary so they can style your component.

Let's say you're creating a sign in form. Inside of your template you've defined the text size for the inputs but you'd like the user to be able to change this so it fits better with her site. Using the `::shadow` pseudo selector we can pierce the shadow boundary, thereby giving the user total freedom to override our defaults if they so choose.

    <head>
      <style>
        .sign-up::shadow #username,
        .sign-up::shadow #password {
          font-size: 18px;
          border: 1px solid red;
        }
    
        .sign-up::shadow #btn {
          font-size: 18px;
        }
      </style>
    </head>
    <body>
      <div class="sign-up"></div>
    
      <template class="sign-up-template">
        <style>
          #username,
          #password {
            font-size: 10px;
          }
        </style>
        <div>
          <input type="text" id="username" placeholder="username">
        </div>
        <div>
          <input type="password" id="password" placeholder="password">
        </div>
        <button id="btn">Sign Up!</button>
      </template>
    
      <script>
        var host = document.querySelector('.sign-up');
        var root = host.createShadowRoot();
        var template = document.querySelector('.sign-up-template');
        root.appendChild(document.importNode(template.content, true));
      </script>
    </body>
    

![Styling with ::shadow](/images/2015/01/shadow-dom-shadow.jpg)

## /deep/ [#](#)

One downside to working with `::shadow` is that it is only able to pierce one layer of shadow boundaries. If you have multiple shadow trees nested inside one another, it's much easier to use the `/deep/` combinator.

    <head>
      <style>
        #foo /deep/ button {
          color: red;
        }
      </style>
    </head>
    <body>
      <div id="foo"></div>
      
      <template>
        <div id="bar"></div>
      </template>
    
      <script>
        var host1 = document.querySelector('#foo');
        var root1 = host1.createShadowRoot();
        var template = document.querySelector('template');
        root1.appendChild(document.importNode(template.content, true));
        
        var host2 = root1.querySelector('#bar');
        var root2 = host2.createShadowRoot();
        root2.innerHTML = '<button>Click me</button>';
      </script>
    </body>
    

## Conclusion [#](#)

If you've read over [the last post](/blog/2013/08/28/shadow-dom-styles/) and this one then you now know as much about styling the shadow DOM as I do. But we haven't even talked about JavaScript yet! We'll save that for tomorrow's post :) As always if you have questions [hit me up on twitter](http://twitter.com/rob_dodson) or leave a comment. Thanks!
