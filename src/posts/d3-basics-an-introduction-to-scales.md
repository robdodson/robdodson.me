---
title: "D3 Basics: An Introduction To Scales"
tags:
  - Chain
  - D3
date: 2012-05-03T17:04:00.000Z
updated: 2014-12-30T06:42:24.000Z
---

## Heads up!

I wrote this post a few years ago when I was on Octopress. The code no longer works now that I've migrated to Ghost, but I'm keeping the post up in case any of it is useful for those who come along after -- Rob

<pre><code>.chart {
  font-family: Arial, sans-serif;
  font-size: 10px;
}

.bar {
  fill: steelblue;
}

.axis path, .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}
</code></pre>
  

  var data = [1, 1, 2, 3, 5, 8];

  var margin = {top: 40, right: 40, bottom: 40, left: 40},
      width = $('.entry-content').width(),
      height = 300;

  $(window).resize(function() {
    width = $('.entry-content').width();
  });

After selections, scales are probably the most frequently used element in D3 because they faciliate such great control over data and screen space. I want to spend several posts documenting how scales work to help out anyone who is struggling with the concept. We'll start with a high level overview of what a scale is in D3 and then explore the individual objects to learn their nuances.

### What Are D3 Scales?

Essentially a scale is a convenience function for mapping input data to an output range, typically x/y positions or width/height. Scales can also be used to link data to arbitrary values like categories or days of the week, or to quantize data into "buckets".

There are two universal properties for any scale: the `domain` and the `range`. The `domain` serves as the input for your graph while the `range` represents the output.

#### Domain

Since the `domain` corresponds to our graph's input it can be either *continuous* or *discrete*. You might think of a continous data set as any number from 1 to infinity while a discrete set would be every `Date` from January 1, 2012 to January 10, 2012. The takeaway is that continous data is essentially unbounded and discrete data is finite and easily quantified.

#### Range

The `range` defines the potential output that the scale can generate. Values from the domain are mapped to values in the range. Let's look at two examples to help clarify.

Say you have an *identity scale*, meaning whatever value you use for input will also be returned as the output. We'll call the scale `x`. If `x` has an input `domain` of 0 - 100 and an output `range` of 0 - 100, then your `scale of 1` will be 1. Your `scale of 50` will be 50. Here's another way to write it:

    x(50) // returns 50
    

Now let's change the scale a bit. Let's say that `x` still has an input `domain` of 0 - 100 but now it has an output `range` of `0 - 10`. What do you think our `scale of 50` will return? ... If you guessed 5 then you are the smart! Because we limited our potential output down to any number between 0 and 10 it narrowed the mapping from our `domain` to our `range`. Being able to expand or contract this mapping is the main value in using a D3 scale. If it's still not quite sinking in check out this great visual from [Jerome Cukier](http://www.jeromecukier.net/) ([@jcukier](https://twitter.com/#!/jcukier)).

![An example of how scales work](/images/2014/12/d3scale1.png)

Jerome has [an excelent blog post](http://www.jeromecukier.net/blog/2011/08/11/d3-scales-and-color/) covering scales in D3 which inspired me to write my own post. Definitely read his as well! I feel like a great way to learn something is to not only read about it a bunch but to write about it. Hearing different views on the same topic often helps me solidify a concept.

### Class Work Time

var x = d3.scale.linear()
    .domain([0, 100])
    .range([0, 10]);

I've included `d3` on the page so you can play around with it. Go ahead, bust open your developer tools or firebug and type `d3` into the console. It should return an Object full of methods.

Let's do some experiments with our `x` scale from earlier. Type the following to see what you get.

    x(0);
    x(25);
    x(99);
    x(100);
    

In D3 a scale is both a `Function` and an `Object`. You can invoke a scale by using parenthesis: `x(100)` or you can set a property to change its behavior: `x.range([0, 1000])`. Let's try that! In the console type:

    x.range([0, 1000]);
    

Our scale's range used to be 0 - 10. Now that we've changed it to 0 - 1000, what do you think `x(100)` will equal? Keep in mind that 100 is the highest value in our domain. If you're not sure try it in the console. Actually try it in the console regardless of how sure you are! The console is cool as shit!

### To Be Continued...

Scales are a huge topic so we'll stop here for now. In the next post we'll talk about `linear`, `time` and `ordinal` scales; once you've mastered them everything else becomes a lot easier. Stay tuned :)

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
