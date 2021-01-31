---
title: "D3 Basics: The Linear Scale"
tags:
  - Chain
  - D3
date: 2012-05-04T14:21:00.000Z
updated: 2014-12-30T06:48:52.000Z
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

.label {
  font-size: 12 px;
  fill: #FFF;
}

.point {
  stroke: #666;
  fill: red;
}
</code></pre>
  

In [the last post](http://localhost:4000/blog/2012/05/03/d3-basics-an-introduction-to-scales/) we did a basic introduction to the concept of scales in [D3.js](http://d3js.org/). Today we'll look at our first scale and write some code to visualize it.

### Linear Scales

The most basic scale in D3 is the `linear scale` which maps a continous `domain` to an output range. To define a linear domain we'll need to first come up with a data set. Fibonacci numbers work well, so let's declare a variable `data` like so:

    var data = [1, 1, 2, 3, 5, 8];
    

The data set will represent our scale's input domain. The next step is defining an output range. Since we're going to be graphing these numbers we want our range to represent screen coordinates. Let's go ahead and declare a `width` and a `height` variable and set them to 320 by 150.

    var width = 320,
        height = 150;
    

We now have everything we need to create our first scale.

    var x = d3.scale.linear()
            .domain([0, d3.max(data)])
            .range([0, width]);
    

D3 methods often return a value of `self` meaning you can chain method calls onto one another. If you're used to jQuery this should be a common idiom for you. You'll notice that both the domain and the range functions accept arrays as parameters. Typically the domain only receives two values, the minimum and maximum of our data set. Likewise the range will be given the minimum and maximum of our output space. You could pass in multiple values to create a polylinear scale but that's outside the scope of our dicussion today.

In the domain function we're using a helper called `d3.max`. Similar to `Math.max`, it looks at our data set and figures out what is the largest value. While `Math.max` only works on two numbers, `d3.max` will iterate over an entire `Array` for us.

If you've been following along in your own file you should be able to open your console and type `x(8)` to get 300.

With just this information alone we have enough to build our first graph.

Fibonacci Sequence Chart 1.0

(function() {
<p>var data = [1, 1, 2, 3, 5, 8];<br>
var width = 320<br>
height = 150;</p>
<p>var x = d3.scale.linear()<br>
.domain([0, d3.max(data)])<br>
.range([0, width]);</p>
<p>var svg = d3.select('#linear-scale-chart-1').append('svg')<br>
.attr('width', width)<br>
.attr('height', height)<br>
.attr('class', 'chart');</p>
<p>svg.selectAll('.chart')<br>
.data(data)<br>
.enter().append('rect')<br>
.attr('class', 'bar')<br>
//.attr('y', function(d, i) { return i * 20 })<br>
.attr('y', function(d, i) { return i * 20; })<br>
.attr('width', function(d) { return x(d); })<br>
.attr('height', 15);</p>
<p>})();<br>

    var data = [1, 1, 2, 3, 5, 8];
    var width = 320
        height = 150;
    
    var x = d3.scale.linear()
            .domain([0, d3.max(data)])  
            .range([0, width]);
    
    var svg = d3.select('body').append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'chart');
    
    svg.selectAll('.chart')
            .data(data)
          .enter().append('rect')
            .attr('class', 'bar')
            .attr('y', function(d, i) { return i * 20 })
            .attr('width', function(d) { return x(d); })
            .attr('height', 15);
    

    .chart {
      font-family: Arial, sans-serif;
      font-size: 10px;
    }
    
    .bar {
      fill: steelblue;
    }
    

### Break It Down

Let's go through the JavaScript piece by piece to outline what happened.

    var data = [1, 1, 2, 3, 5, 8];
    var width = 320
        height = 150;
    
    var x = d3.scale.linear()
            .domain([0, d3.max(data)])
            .range([0, width]);
    

The first block should be pretty familar at this point. We've declared our Fibonacci data, our explicit width and height and defined our scale. Nothing new here.

    var svg = d3.select('body').append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'chart');
    

In the next section we're declaring our `SVG` element. We use a D3 selection to grab the `body` tag and we append an `svg` tag onto it. Since D3 uses method-chaining we can keep assigning attributes to our SVG element. We declare the width and the height to match the explicit values set earlier and finally we give it a class name of `chart`.

    svg.selectAll('.chart')
            .data(data)
          .enter().append('rect')
            .attr('class', 'bar')
            .attr('y', function(d, i) { return i * 20 })
            .attr('width', function(d) { return x(d); })
            .attr('height', 15);
    

This last section is where it all ties together. Since we stored our SVG element in a variable called `svg` we're able to easily reference it again. We instruct D3 to create a `join` by calling the `data` method and passing in our `Array` of values. When D3 performs a join it steps through each element in the array and attempts to match it to a figure that already exists on the page. If nothing exists it will call the `enter` function. At this point it steps through the array again, passing the values to us so we can define new shapes. [For a much more in-depth explanation of joins refer back to this article.](http://bost.ocks.org/mike/join/)

In our case we're appending SVG `Rects` but it could just as easily be circles or other shapes. We give each rect a class of `bar` so we can style it with CSS. When we declare the `y` attribute instead of using an explicit value we create an `accessor`, a little helper function which takes a piece of data and an optional index as its arguments. In this case `d` will equal subsequent elements in our data array and `i` will equal their indices. For a much clearer picture of what's happening you can change it to read:

    .attr('y', function(d, i) { console.log('d = data[' + i + '] = ', d); return i * 20 })
    

which will give you the following output.

    d = data[0] = 1
    d = data[1] = 1
    d = data[2] = 2
    d = data[3] = 3
    d = data[4] = 5
    d = data[5] = 8
    

Since we're just trying to space out our bars along the y-axis we don't really care about the value of `d`. Instead we'll use the index, `i`, to offset each bar by a value of i * 20.

In the last two lines we're going to finally use our linear scale to define our bar's width. Here they are again as a refresher.

    .attr('width', function(d) { return x(d); })
    .attr('height', 15);
    

As each element of the array is passed to our width accessor it's run through the scale and the output returned. Since 8 is our maximum value it should extend all the way to the end of our range.

The final call is just an explicit height for each bar. Depending on the scale this bit can be automated but for simplicity sake we'll just use a hard coded value so we can get something on screen.

### Conclusion

Now that we've got one scale under our belt the others should be pretty easy to digest. Over the next couple of posts we'll focus on ordinal scales followed by time scales. Stay tuned and ping me if you have any questions. Thanks!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
