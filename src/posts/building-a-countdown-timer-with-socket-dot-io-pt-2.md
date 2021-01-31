---
title: Building a Countdown Timer with Socket.io pt. 2
tags:
  - Chain
  - Node
  - Express
  - Socket.io
date: 2012-06-06T14:47:00.000Z
updated: 2015-01-02T08:57:08.000Z
---

[Continuing from yesterday's post](http://robdodson.me/blog/2012/06/05/building-a-countdown-timer-with-socket-dot-io/) we started out with a rather crude timer and today I want to upgrade it to a full fledged model, `Stopwatch`, which dispatches events for the view to hook on to.

- [Getting Started](http://robdodson.me/blog/2012/06/04/deploying-your-first-node-dot-js-and-socket-dot-io-app-to-heroku/)
- [Click here for part 1.](http://robdodson.me/blog/2012/06/05/building-a-countdown-timer-with-socket-dot-io/)
- [Click here for part 3.](http://robdodson.me/blog/2012/06/07/building-a-countdown-timer-with-socket-dot-io-pt-3/)

### Extend Node's EventEmitter

We want to extend Node's EventEmitter object in order for our Stopwatch to dispatch its tick events. [Following this great article by Jan Van Ryswyck](http://elegantcode.com/2011/02/21/taking-baby-steps-with-node-js-implementing-events/) I've arrived at something that looks like this:

    var util = require('util'),
        events = require('events');
    
    function Stopwatch() {
        if(false === (this instanceof Stopwatch)) {
            return new Stopwatch();
        }
    
        events.EventEmitter.call(this);
    
        var self = this;
        setInterval(function() {
            self.emit('tick');
        }, 1000);
    };
    
    util.inherits(Stopwatch, events.EventEmitter);
    module.exports = Stopwatch;
    

In our app.js we'll need to `require` our new Stopwatch module, create an instance of it, and add a listener for the tick event. Here's the abbreviated version:

    var Stopwatch = require('./models/stopwatch');
    
    ...
    
    var stopwatch = new Stopwatch();
    stopwatch.on('tick', function() {
      console.log('stopwatch tick!');
    });
    

If all goes well when you restart your server you should see 'stopwatch tick!' arriving every second.

### Add to the prototype the RIGHT way

This next part is what tripped me up the other night and since it was rather late in the evening I was too out of it to figure out what was going wrong.

To recap, we've created a model called `Stopwatch`, we gave it a constructor function and we told it to extend `events.EventEmitter`.

Now I want to add a new method to my stopwatch but here's where you might run into a real gotcha. If you're like me you'd probably add it like this:

    var util = require('util'),
        events = require('events');
    
    function Stopwatch() {
        if(false === (this instanceof Stopwatch)) {
            return new Stopwatch();
        }
    
        events.EventEmitter.call(this);
    };
    
    Stopwatch.prototype.foobar = function() {
        console.log('foobar!');
    }
    
    util.inherits(Stopwatch, events.EventEmitter);
    
    module.exports = Stopwatch;
    

Aaaand your app would explode like this:

    [ERROR] TypeError
    TypeError: Object #<Stopwatch> has no method 'foobar'
    

That's because we can only add new methods **after calling `util.inherits`.** The proper way would look like this:

    
    var util = require('util'),
        events = require('events');
    
    function Stopwatch() {
        if(false === (this instanceof Stopwatch)) {
            return new Stopwatch();
        }
    
        events.EventEmitter.call(this);
    };
    
    util.inherits(Stopwatch, events.EventEmitter);
    
    Stopwatch.prototype.foobar = function() {
        console.log('foobar!');
    }
    
    module.exports = Stopwatch;
    
    

This is also the approach [taken in the documentation.](http://nodejs.org/api/util.html#util_util_inherits_constructor_superconstructor) Guess it pays to rtfm :D

Here's what my final `Stopwatch` looks like:

    var util    = require('util'),
        events  = require('events')
        _       = require('underscore');
    
    // ---------------------------------------------
    // Constructor
    // ---------------------------------------------
    function Stopwatch() {
        if(false === (this instanceof Stopwatch)) {
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
        _.bindAll(this, 'start', 'stop', 'reset', 'onTick');
    };
    
    // ---------------------------------------------
    // Inherit from EventEmitter
    // ---------------------------------------------
    util.inherits(Stopwatch, events.EventEmitter);
    
    // ---------------------------------------------
    // Methods
    // ---------------------------------------------
    Stopwatch.prototype.start = function() {
        console.log('Starting Stopwatch!');
        // note the use of _.bindAll in the constructor
        // with bindAll we can pass one of our methods to
        // setInterval and have it called with the proper 'this' value
        this.interval = setInterval(this.onTick, this.second);
        this.emit('start');
    };
    
    Stopwatch.prototype.stop = function() {
        console.log('Stopping Stopwatch!');
        if (this.interval) {
            clearInterval(this.interval);
            this.emit('stop');
        }
    };
    
    Stopwatch.prototype.reset = function() {
        console.log('Resetting Stopwatch!');
        this.time = this.hour;
        this.emit('reset');
    };
    
    Stopwatch.prototype.onTick = function() {
        var remainder = this.time,
            numHours,
            numMinutes,
            numSeconds,
            output = "";
    
        if (this.time === 0) {
            this.stop();
            return;
        }
        
        numHours = String(parseInt(remainder / this.hour, 10));
        remainder -= this.hour * numHours;
        
        numMinutes = String(parseInt(remainder / this.minute, 10));
        remainder -= this.minute * numMinutes;
        
        numSeconds = String(parseInt(remainder / this.second, 10));
        
        output = _.map([numHours, numMinutes, numSeconds], function(str) {
            if (str.length === 1) {
                str = "0" + str;
            }
            return str;
        }).join(":");
        
        this.emit('tick', output);
        this.time -= this.second;
    };
    
    // ---------------------------------------------
    // Export
    // ---------------------------------------------
    module.exports = Stopwatch;
    

And here's how I'm using it in `app.js`

    var Stopwatch = require('./models/stopwatch');
    
    ...
    
    var stopwatch = new Stopwatch();
    stopwatch.on('tick', function(time) {
      console.log('tick: ' + time);
    });
    stopwatch.start();
    

Running the above should give you something like this in your console:

    tick: 01:00:00
    tick: 00:59:59
    tick: 00:59:58
    tick: 00:59:57
    

Ok that's it for today. Tomorrow we'll connect all this goodness to a View. If you have questions or feedback feel free to leave a comment. Thanks! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired
- Sleep: 6
- Hunger: 4
- Coffee: 0
