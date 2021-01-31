---
title: D3.js and Octopress
tags:
  - Octopress
  - Chain
  - D3
date: 2012-05-02T14:20:00.000Z
updated: 2014-12-30T06:38:00.000Z
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

This morning I was hoping to cover some of the basics of using D3.js. Along the way I realized I really wanted people to be able to see the graphs on the blog itself. I *could* have used JSFiddle, but I didn't like all that chrome repeated across the page. So I came up with my own solution with a little bit of hacking :)

I'll have to save the basics for tomorrow since I've already spent way too much time just getting this setup. But I will offer a brief explanation of D3 and how I got it working on Octopress.

### What is D3.js?

D3 (formerly Protovis) is a library written by [Mike Bostock](http://bost.ocks.org/mike/) ([@mbostock](https://twitter.com/#!/mbostock)) which allows you to easily manipulate a DOM using data sets. While the implications of that statement are somewhat vague, D3 is generally used for doing data visualizations primarily in SVG. D3 can also work with regular DOM nodes however SVG is often the best tool to use if you're trying to draw a graph of some kind.

As a quick demo, here's a bar chart which visualizes an `Array` of Fibonacci numbers: `[1, 1, 2, 3, 5, 8]`

(function() {
<p>function draw() {</p>
<pre><code>$('#chart-1').empty();

var x = d3.scale.linear()
    .domain([0, d3.max(data)])
    .range([0, width - margin.left - margin.right]);

var y = d3.scale.ordinal()
    .domain(d3.range(data.length))
    .rangeRoundBands([height - margin.top - margin.bottom, 0], 0.2);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .tickPadding(8);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left')
    .tickPadding(8)
    .tickSize(0);

var svg = d3.select('#chart-1').append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'chart')
  .append('g')
    .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

svg.selectAll('.chart')
    .data(data)
  .enter().append('rect')
    .attr('class', 'bar')
    .attr('y', function(d, i) { return y(i) })
    .attr('width', x)
    .attr('height', y.rangeBand());

svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0, ' + y.rangeExtent()[1] + ')')
    .call(xAxis);

svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
  .selectAll('text')
    .text(function(d) { return String.fromCharCode(d + 65); });
</code></pre>
<p>}</p>
<p>draw();</p>
<p>$(window).resize(function() {<br>
draw();<br>
});</p>
<p>})();<br>

Break open your developer tools and inspect the graph above. You'll notice that it's just SVG elements. For many the 2 best aspects of D3 are 1) That it works with regular SVG elements and 2) That it doesn't wrap that functionality in arbitrary objects which require a lot of configuration. This second aspect is where many graphing libraries fall short. As Justin Palmer ([@Caged](https://twitter.com/#!/caged)) [points out on his blog](http://dealloc.me/2011/06/24/d3-is-not-a-graphing-library.html):

> As long as you stay within the confines of the template, it’s simple, but, anytime you want customize a specific aspect of the original template, more configuration options are added to the library. You should avoid “design by configuration.”

D3 handles this by dumping the idea of templated visuals. There is no `makeBarGraph()` function in D3; instead you work directly with your data and the SVG elements. Essentially what you see is what you get, which can make the initial learning curve pretty steep. But because it's so non-prescriptive you can build just about anything with it.

### How do you integrate D3 and Octopress?

Since I want to write several more posts on D3 I figured it'd be good if I setup my own little system to help me generate most of the boilerplate. If you're lazy and want to skip to the end [here's a link to the template.](https://github.com/robdodson/octopress-templates)

#### Requiring D3

If you inspect the page you'll see that starting at the top of this post I'm requiring d3.js. There's a good chance I'll move that over into the site's header so it isn't required every time but if you're just doing a one off then that should be fine. Normally it's a good idea to require your javascript at the end of your page but I want to wrap all of my graphs in self-executing functions so they can seal their scope (and also because I'm lazy and want to use the same boilerplate stub code in each). As a result if you don't require d3 before the functions execute it'll throw an error.

I chose to put a copy of d3 into my Octopress `source/javascripts` so it would get compiled with the rest of my assets and deployed. If you'd prefer you can also grab D3 from the site.

    <script src="http://d3js.org/d3.v2.js"></script>
    

#### Adding the CSS

The next step is to add some CSS. Getting a `style` tag into the post ended up being trickier than I had first thought because Markdown strips out `style` tags. As a result every time I generate the site the CSS dissapears. The work around is to wrap the `style` tag in a `div` and put that at the top of the post.

Here are the basic styles I'm using:

    <div>
      <style type="text/css">
    
        .chart {
          font-family: Arial, sans-serif;
          font-size: 10px;
          margin-top: -40px;
        }
    
        .bar {
          fill: steelblue;
        }
    
        .axis path, .axis line {
          fill: none;
          stroke: #000;
          shape-rendering: crispEdges;
        }
    
      </style>
    </div>
    

#### Margins and Resizing

Now that we have D3 included on the page and our CSS styles are being respected it's time to setup some useful defaults in another `script` tag. Typically I'll define the dimensions of my graph area as well as any margins that I might want to use.

If I'm going to use the same data set throughout I might put that in as well so I don't have to declare it over and over again. In our case the array of Fibonacci numbers is there.

    <!-- Global Variables and Handlers: -->
    <script type="text/javascript">
    
      var data = [1, 1, 2, 3, 5, 8];
    
      var margin = {top: 40, right: 40, bottom: 40, left: 40},
          width = $('.entry-content').width(),
          height = 300;
    
      $(window).resize(function() {
        width = $('.entry-content').width();
      });
    
    </script>
    

The margin object can be really helpful when you're trying to move things around. For instance, to send something to the bottom of your graph you can just say `height - margin.top - margin.bottom`.

You'll notice that rather than giving it an explicit width I'm using jQuery to find our containing element's width. I'm trying to keep in line with the responsiveness of the Octopress theme so setting the width to match our containing element prevents the graph from breaking out if the user starts off with a small window.

I'm also including a handler for the `window` resize event. Whenever the user changes the size of their browser we'll update our global width variable and tell all of the dependent graphs to redraw themselves.

#### Our First Graph!

Finally I create a `div` to contain our visualization. Beneath the `div` I've included another script tag with a self-executing function. When run, the function will grab its sibling and populate it with an SVG element. Here's the code (don't freak out when you see it all, we'll go over what everything does in a later post).

    <!-- D3.js Chart -->
    <div id='chart-1'></div>
    <script type='text/javascript'>
    (function() {
    
      function draw() {
        
        $('#chart-1').empty();
    
        var x = d3.scale.linear()
            .domain([0, d3.max(data)])
            .range([0, width - margin.left - margin.right]);
    
        var y = d3.scale.ordinal()
            .domain(d3.range(data.length))
            .rangeRoundBands([height - margin.top - margin.bottom, 0], 0.2);
    
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .tickPadding(8);
    
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .tickPadding(8)
            .tickSize(0);
    
        var svg = d3.select('#chart-1').append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'chart')
          .append('g')
            .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    
        svg.selectAll('.chart')
            .data(data)
          .enter().append('rect')
            .attr('class', 'bar')
            .attr('y', function(d, i) { return y(i) })
            .attr('width', x)
            .attr('height', y.rangeBand());
    
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0, ' + y.rangeExtent()[1] + ')')
            .call(xAxis);
    
        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis)
          .selectAll('text')
            .text(function(d) { return String.fromCharCode(d + 65); });
        
      }
    
      draw();
    
      $(window).resize(function() {
        draw();
      });
    
    })();
    </script>
    

After we declare the self-executing function we include another function called `draw`. Using a separate function lets us later *redraw* the graph if the user resizes their browser. This also works on the iPhone when the user changes from portrait to landscape mode. Inside of `draw` we first make sure that the containing div is empty (otherwise we'd end up drawing graphs on top of one another). You can skip most of the D3 code—we'll cover that over the next couple of days—but take a look at the last few lines where we call `draw()` and add another handler for `window.resize`. Whenever the user changes their browser size our global `width` value will be updated, then our graphs will redraw themselves using this new width.

At the moment you need to add this handler to each of your visualizations. Not terrible but not very DRY either. I think in a future iteration I'll add a queue which holds a reference to each `draw` instance and calls them in sync. For now this is the quick and dirty way to get a graph up on Octopress. [You can download the entire post template from Github.](https://github.com/robdodson/octopress-templates) Enjoy!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
