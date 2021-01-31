---
title: Repeating Templates in Polymer
tags:
  - Web Components
  - Template
  - Polymer
date: 2013-11-12T23:14:00.000Z
updated: 2015-01-02T05:26:38.000Z
---

I ran into a little issue this afternoon working with templates in Polymer and I wanted to quickly jot down my thoughts in case others bump up against this.

## Bindings

Bindings allow you to easily pipe some data into your markup from a JavaScript object. If you've worked with a library like Mustache or Handlebars before then they should feel familiar.

In Polymer land, the `<template>` tag has been extended so it supports a few handy binding attributes. These include `bind`, `repeat`, `if`, and `ref`.

## How Not to Do It

Because every Polymer element starts off with a template inside of it, I figured I could write my element like this:

    <polymer-element name="polymer-letters">
      <template repeat="&#123;{ letter in letters }}">
        &#123;{ letter }}
      </template>
      <script>
        Polymer('polymer-letters', {
          letters: ['a', 'b', 'c']
        });
      </script>
    </polymer-element>
    

But unfortunately that does not work #sadtrombone.

## The Right Way

Polymer uses the first `template` element to create Shadow DOM, so if you want to use a binding **you'll need to nest it *inside* another template.**

Our updated example would look like this:

    <polymer-element name="polymer-letters">
      <template>
        <template repeat="&#123;{ letter in letters }}">
          &#123;{ letter }}
        </template>
      </template>
      <script>
        Polymer('polymer-letters', {
          letters: ['a', 'b', 'c']
        });
      </script>
    </polymer-element>
    

And here it is running on CodePen:

See the Pen [Polymer Template Bindings](http://codepen.io/robdodson/pen/wxrqf) by Rob Dodson ([@robdodson](http://codepen.io/robdodson)) on [CodePen](http://codepen.io)

I mentioned this to Eric Bidelman and he opened [a ticket to improve the docs](https://github.com/Polymer/docs/issues/191), so keep an eye out for that. Hope this helps some of you that may have been stuck :) This has been fixed in the latest Polymer docs. yay!
