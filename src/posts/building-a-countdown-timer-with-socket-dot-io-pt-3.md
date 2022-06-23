---
title: Building a Countdown Timer with Socket.io pt. 3
tags:
  - Chain
  - Node
  - Express
  - Socket.io
date: 2012-06-08T02:41:00.000Z
updated: 2015-01-02T08:56:38.000Z
---

Today's the day we wrap up our countdown timer and deploy it to Heroku. But before we launch this puppy we need to clean house a little and spice up the visual appeal.

- [Getting Started](http://robdodson.me/blog/2012/06/04/deploying-your-first-node-dot-js-and-socket-dot-io-app-to-heroku/)
- [Click here for part 1.](http://robdodson.me/blog/2012/06/05/building-a-countdown-timer-with-socket-dot-io/)
- [Click here for part 2.](http://robdodson.me/blog/2012/06/06/building-a-countdown-timer-with-socket-dot-io-pt-2/)

### Refactoring the Stopwatch

While the Stopwatch from our last post worked OK there are a spots that can be improved. For starters I'd like to separate the formatting of the time from the `onTick` method. Mainly because I want to be able to pull the current time out whenever someone hits reset or a new connection is made. Here's how I updated Stopwatch to accomodate these changes:

```js
var util = require('util'),
  events = require('events');
_ = require('underscore');

// ---------------------------------------------
// Constructor
// ---------------------------------------------
function Stopwatch() {
  if (false === this instanceof Stopwatch) {
    return new Stopwatch();
  }

  this.hour = 3600000;
  this.minute = 60000;
  this.second = 1000;
  this.time = this.hour;
  this.interval = undefined;

  events.EventEmitter.call(this);

  // Use Underscore to bind all of our methods
  // to the proper context
  _.bindAll(this);
}

// ---------------------------------------------
// Inherit from EventEmitter
// ---------------------------------------------
util.inherits(Stopwatch, events.EventEmitter);

// ---------------------------------------------
// Methods
// ---------------------------------------------
Stopwatch.prototype.start = function() {
  if (this.interval) {
    return;
  }

  console.log('Starting Stopwatch!');
  // note the use of _.bindAll in the constructor
  // with bindAll we can pass one of our methods to
  // setInterval and have it called with the proper 'this' value
  this.interval = setInterval(this.onTick, this.second);
  this.emit('start:stopwatch');
};

Stopwatch.prototype.stop = function() {
  console.log('Stopping Stopwatch!');
  if (this.interval) {
    clearInterval(this.interval);
    this.interval = undefined;
    this.emit('stop:stopwatch');
  }
};

Stopwatch.prototype.reset = function() {
  console.log('Resetting Stopwatch!');
  this.time = this.hour;
  this.emit('reset:stopwatch', this.formatTime(this.time));
};

Stopwatch.prototype.onTick = function() {
  this.time -= this.second;

  var formattedTime = this.formatTime(this.time);
  this.emit('tick:stopwatch', formattedTime);

  if (this.time === 0) {
    this.stop();
  }
};

Stopwatch.prototype.formatTime = function(time) {
  var remainder = time,
    numHours,
    numMinutes,
    numSeconds,
    output = '';

  numHours = String(parseInt(remainder / this.hour, 10));
  remainder -= this.hour * numHours;

  numMinutes = String(parseInt(remainder / this.minute, 10));
  remainder -= this.minute * numMinutes;

  numSeconds = String(parseInt(remainder / this.second, 10));

  output = _.map([numHours, numMinutes, numSeconds], function(str) {
    if (str.length === 1) {
      str = '0' + str;
    }
    return str;
  }).join(':');

  return output;
};

Stopwatch.prototype.getTime = function() {
  return this.formatTime(this.time);
};

// ---------------------------------------------
// Export
// ---------------------------------------------
module.exports = Stopwatch;
```

I also namespaced the events so they would be easier to read when mixed in with the socket.io events. During the refactoring I noticed there were a lot of actors listening to, emitting or calling something like `start`. I'm not sure if there are common socket.io namespacing patterns but I based what I did on Backbone events and I think it works out well enough.

### Cleaning up app.js

These changes to `Stopwatch` also require us to update the `app.js` that uses it.

```js
var stopwatch = new Stopwatch();
stopwatch.on('tick:stopwatch', function(time) {
  io.sockets.emit('time', {time: time});
});

stopwatch.on('reset:stopwatch', function(time) {
  io.sockets.emit('time', {time: time});
});

stopwatch.start();

io.sockets.on('connection', function(socket) {
  io.sockets.emit('time', {time: stopwatch.getTime()});

  socket.on('click:start', function() {
    stopwatch.start();
  });

  socket.on('click:stop', function() {
    stopwatch.stop();
  });

  socket.on('click:reset', function() {
    stopwatch.reset();
  });
});
```

I've made it so whenever a user resets or connects to the page they get the latest time. And of course whenever the stopwatch ticks they'll get an update as well. I think it might also be nice if pressing start dispatched the latest time, I should probably add that... ;)

### Tweaking the views

Lastly I've updated the view by adding some more buttons to correspond to the start/stop and reset methods. I've also wrapped everything in a container to make it easier to position:

```html
<div id="wrapper">
  <div id="countdown"></div>
  <button id="start" class="thoughtbot">Start</button>
  <button id="stop" class="thoughtbot">Stop</button>
  <button id="reset" class="thoughtbot">Reset</button>
</div>
```

```js
var socket = io.connect(window.location.hostname);

socket.on('time', function(data) {
  $('#countdown').html(data.time);
});

$('#start').click(function() {
  socket.emit('click:start');
});

$('#stop').click(function() {
  socket.emit('click:stop');
});

$('#reset').click(function() {
  socket.emit('click:reset');
});
```

Also notice that the socket events coming from the view have been namespaced as well.

### Improving the type

Next up I want to enhance the type using [one of Google's webfonts.](http://www.google.com/webfonts) I chose a font called `Black Ops One` which seemed appropriately militaristic. Setting it up was as easy as adding one line to my `layout.ejs`

```html
<link
  href="http://fonts.googleapis.com/css?family=Black+Ops+One"
  rel="stylesheet"
  type="text/css"
/>
```

and my `main.css` file:

```css
#countdown {
  font-family: 'Black Ops One', cursive;
  font-size: 90px;
}
```

Finally I chose to use some funky buttons from [Chad Mazzola's CSS3 Buttons project.](https://github.com/ubuwaits/css3-buttons) I went with the Thoughtbot buttons since they were red and awesome. The styles are pretty long so I'm just going to post my entire `main.css` for you to see:

```css
#wrapper {
  width: 475px;
  height: 171px;
  margin: 100px auto;
}

#countdown {
  font-family: 'Black Ops One', cursive;
  font-size: 90px;
}

button.thoughtbot {
  background-color: #ee432e;
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, #ee432e),
    color-stop(50%, #c63929),
    color-stop(50%, #b51700),
    color-stop(100%, #891100)
  );
  background-image: -webkit-linear-gradient(
    top,
    #ee432e 0%,
    #c63929 50%,
    #b51700 50%,
    #891100 100%
  );
  background-image: -moz-linear-gradient(top, #ee432e 0%, #c63929 50%, #b51700 50%, #891100 100%);
  background-image: -ms-linear-gradient(top, #ee432e 0%, #c63929 50%, #b51700 50%, #891100 100%);
  background-image: -o-linear-gradient(top, #ee432e 0%, #c63929 50%, #b51700 50%, #891100 100%);
  background-image: linear-gradient(top, #ee432e 0%, #c63929 50%, #b51700 50%, #891100 100%);
  border: 1px solid #951100;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
  -webkit-box-shadow: inset 0px 0px 0px 1px rgba(255, 115, 100, 0.4), 0 1px 3px #333333;
  -moz-box-shadow: inset 0px 0px 0px 1px rgba(255, 115, 100, 0.4), 0 1px 3px #333333;
  box-shadow: inset 0px 0px 0px 1px rgba(255, 115, 100, 0.4), 0 1px 3px #333333;
  color: #fff;
  font: bold 20px 'helvetica neue', helvetica, arial, sans-serif;
  line-height: 1;
  padding: 12px 0 14px 0;
  text-align: center;
  text-shadow: 0px -1px 1px rgba(0, 0, 0, 0.8);
  width: 150px;
}

button.thoughtbot:hover {
  background-color: #f37873;
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, #f37873),
    color-stop(50%, #db504d),
    color-stop(50%, #cb0500),
    color-stop(100%, #a20601)
  );
  background-image: -webkit-linear-gradient(
    top,
    #f37873 0%,
    #db504d 50%,
    #cb0500 50%,
    #a20601 100%
  );
  background-image: -moz-linear-gradient(top, #f37873 0%, #db504d 50%, #cb0500 50%, #a20601 100%);
  background-image: -ms-linear-gradient(top, #f37873 0%, #db504d 50%, #cb0500 50%, #a20601 100%);
  background-image: -o-linear-gradient(top, #f37873 0%, #db504d 50%, #cb0500 50%, #a20601 100%);
  background-image: linear-gradient(top, #f37873 0%, #db504d 50%, #cb0500 50%, #a20601 100%);
  cursor: pointer;
}

button.thoughtbot:active {
  background-color: #d43c28;
  background-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0%, #d43c28),
    color-stop(50%, #ad3224),
    color-stop(50%, #9c1500),
    color-stop(100%, #700d00)
  );
  background-image: -webkit-linear-gradient(
    top,
    #d43c28 0%,
    #ad3224 50%,
    #9c1500 50%,
    #700d00 100%
  );
  background-image: -moz-linear-gradient(top, #d43c28 0%, #ad3224 50%, #9c1500 50%, #700d00 100%);
  background-image: -ms-linear-gradient(top, #d43c28 0%, #ad3224 50%, #9c1500 50%, #700d00 100%);
  background-image: -o-linear-gradient(top, #d43c28 0%, #ad3224 50%, #9c1500 50%, #700d00 100%);
  background-image: linear-gradient(top, #d43c28 0%, #ad3224 50%, #9c1500 50%, #700d00 100%);
  -webkit-box-shadow: inset 0px 0px 0px 1px rgba(255, 115, 100, 0.4);
  -moz-box-shadow: inset 0px 0px 0px 1px rgba(255, 115, 100, 0.4);
  box-shadow: inset 0px 0px 0px 1px rgba(255, 115, 100, 0.4);
}
```

![Defcon final](/images/2014/12/defcon_final.png)

SWEEEEEEET! I'll go ahead and host it on Heroku but first I have to find out what the cost of leaving Node.js/Socket.io running indefinitely would be. Till then you should be able to get a local version of all this working or [just clone the Github repo](https://github.com/robdodson/defcon) and now you too can have your very own Defcon stopwatch. enjoy! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Lazy
- Sleep: 6
- Hunger: 3
- Coffee: 1
