---
title: Take Control of your App with the JavaScript State Pattern
tags:
  - Chain
  - Design Patterns
  - JavaScript
date: 2012-06-03T01:22:00.000Z
updated: 2015-01-02T08:58:40.000Z
exclude: true
---

Last week I wrote a post about [communicating between views in Backbone.js](http://robdodson.me/blog/2012/05/25/backbone-events-framework-communication/) and since then it has easily become my most popular article. The comments have forced me to think about the ways in which I typically manage state in very large Flash applications and how that might translate to JavaScript and Backbone. Today I want to present my all time favorite design pattern, the State pattern, and illustrate how it can help you maintain control of your application. I want to warn you that I'm going to show a rather large block of what looks like repetitive code because I want the pattern to be obvious. In tomorrow's post we'll clean it up and try it out with a Backbone Model and View.

### The State pattern?

Ok let's get started. I want to write a video player so I'm going to need an object that can handle `play`, `stop` and `pause` states. I would say that there are probably a ton of video players out there that have `play`, `stop` and `pause` methods on them, and I bet many look kind of like this:

```js
play: function() {
    if (this.status == 'playing') {
        return;
    } else if (this.status == 'stopped') {
        // play the video
    } else if (this.status == 'paused') {
        // unpause and play
    }
    // else if ...
}
```

Or maybe instead of a long conditional there's a switch statement or something. But _essentially_ you're querying some variable somewhere to check what state the object is in and you're branching your logic as a result. Now, I would argue that this is a really brittle process and probably error prone. You could imagine that in each of those conditional blocks there might be several lines of code: preparing to play, stopping the video, tearing down this or that... Or perhaps if you're moving from one state to another you want to animate something on screen, maybe do some ajax, who knows!? Really no matter what you're doing if you're tossing it into these big conditionals it's going to become a nightmare to manage.

Alternatives? Ok, let's think of our video player in terms of the actions that it performs. Our player can play, it can stop and it can pause. What if instead of play, pause and stop acting as methods on our object, we make each of those states into its _own_ object? So when the play state object is told to play it says 'Hey! I'm already playing. No need to change' and when it's told to stop it says 'Ah stopping, eh? Let me defer to my friend the Stop state object'.

To illustrate this I've written a very simple player which just logs what it's doing as you ask it to change state. I want to point out that this code is neither DRY nor very useful in a real world situation but it's intended to illustrate a point. Hopefully when you see the repetition you'll quickly say to yourself 'Hey! Those state objects could be made into a more general/abstract parent object.' That would be the correct mindset but I thought that if I skipped this part the pattern might not be obvious for those new to it.

```js
var player = {
  state: undefined,
  states: {
    playing: {
      initialize: function(target) {
        this.target = target;
      },
      enter: function() {
        console.log('setting up the playing state');
      },
      execute: function() {
        console.log('playing!');
      },
      play: function() {
        console.log('already playing!');
      },
      stop: function() {
        this.target.changeState(this.target.states.stopping);
      },
      pause: function() {
        this.target.changeState(this.target.states.pausing);
      },
      exit: function() {
        console.log('tearing down the playing state');
      }
    },
    stopping: {
      initialize: function(target) {
        this.target = target;
      },
      enter: function() {
        console.log('setting up the stopping state');
      },
      execute: function() {
        console.log('stopping!');
      },
      play: function() {
        this.target.changeState(this.target.states.playing);
      },
      stop: function() {
        console.log('already stopped!');
      },
      pause: function() {
        this.target.changeState(this.target.states.pausing);
      },
      exit: function() {
        console.log('tearing down the stopping state');
      }
    },
    pausing: {
      initialize: function(target) {
        this.target = target;
      },
      enter: function() {
        console.log('setting up the pausing state');
      },
      execute: function() {
        console.log('pausing!');
      },
      play: function() {
        this.target.changeState(this.target.states.playing);
      },
      stop: function() {
        this.target.changeState(this.target.states.stopping);
      },
      pause: function() {
        console.log('already paused!');
      },
      exit: function() {
        console.log('tearing down the pausing state!');
      }
    }
  },
  initialize: function() {
    this.states.playing.initialize(this);
    this.states.stopping.initialize(this);
    this.states.pausing.initialize(this);
    this.state = this.states.stopping;
  },
  play: function() {
    this.state.play();
  },
  stop: function() {
    this.state.stop();
  },
  pause: function() {
    this.state.pause();
  },
  changeState: function(state) {
    if (this.state !== state) {
      this.state.exit();
      this.state = state;
      this.state.enter();
      this.state.execute();
    }
  }
};
```

Lots of code, I know. But there is serious value in digesting this pattern so stick with me here and I'll go through it bit by bit. Let's start at the top where we define our object:

```js
var player = {
  state: undefined,
  states: {
    playing: {
      initialize: function(target) {
        this.target = target;
      },
      enter: function() {
        console.log('setting up the playing state');
      },
      execute: function() {
        console.log('playing!');
      },
      play: function() {
        console.log('already playing!');
      },
      stop: function() {
        this.target.changeState(this.target.states.stopping);
      },
      pause: function() {
        this.target.changeState(this.target.states.pausing);
      },
      exit: function() {
        console.log('tearing down the playing state');
      }
    }
    // ... .
  }
};
```

First we declare our object and give it a property of `state` which we set to `undefined` for now. We're going to be creating state object to delegate all of our method calls to so once we're ready to use our player we'll set its initial state.

The `states` object (note the plurality) holds all of the different state objects that our player can use. In this version we've defined `playing`, `stopping` and `pausing` but you could also add states like `buffering` or `initializing`. Keep in mind that this pattern can be applied to just about anything. For instance, if you were making a game with an old prospector his state objects could be `mining`, `drinking` and `sleeping`. The main thing to remember is that **your state objects should all define the exact same public methods**.

We can skip the `stopping` and `pausing` states since they're nearly identical to the `playing` state. Instead let's jump down to the bottom and look at the last bit.

```js
initialize: function() {
  this.states.playing.initialize(this);
  this.states.stopping.initialize(this);
  this.states.pausing.initialize(this);
  this.state = this.states.stopping;
},
play: function() {
  this.state.play();
},
stop: function() {
  this.state.stop();
},
pause: function() {
  this.state.pause();
},
changeState: function(state) {
  if (this.state !== state) {
    this.state.exit();
    this.state = state;
    this.state.enter();
    this.state.execute();
  }
}
```

In our player's initialize function we give each state a reference to the player object so we can tell it to `changeState`. We also set our initial state to be the stopping state.

Now let's look at the `play` method. Do you see how it defers the call to whatever object is currently set as the player's `state`? Since `this.state` refers to `this.states.stopping` we're effectively calling the `play` method of the `stopping` state object. Go look at the other state objects to see how they respond to having their `play` methods called. In the case of `states.stopping`, calling `play` is going to tell its `target` (which is just a reference to the player) to `changeState`, passing in the `states.playing` state.

`changeState` is kind of an awesome method because it does a ton of work but it does it very elegantly and efficiently. For starters it makes sure that the state we've asked to change to is actually different than our current state. Then it tells our current state to `exit()`. A state's `exit()` method is a great place to tear down any constructs that we may have built to support that action. Next it sets our current state to the new state. Lastly, it calls `enter()` (a good place to build up supporting constructs) and `execute()`, which is where we do the main work of our state. That's pretty straightforward right?

Since `play`, `pause` and `stop` are members of our player's public API, **all of our states must also implement those methods.** Otherwise you would get an error if you called `play()` on the object and its state did not support that method. Keep this in mind when you're designing your state objects.

### Aaaaand we're off!

Let's look at our player in action:

```js
// We start off in the stopping state
// So when we call stop...
player.initialize();
player.stop();

=> 'already stopped!'

// Let's move to the playing state
player.play();

=> 'tearing down the stopping state'
=> 'setting up the playing state'
=> 'playing!'

// Quick call pause!
player.pause();

=> 'tearing down the playing state'
=> 'setting up the pausing state'
=> 'pausing!'

// Um... call pause like 3 times cuz
// I'm a button masher!!!
player.pause();
player.pause();
player.pause();

=> 'already paused!'
=> 'already paused!'
=> 'already paused!'

// OK call play again!
player.play();

=> 'tearing down the pausing state!'
=> 'setting up the playing state'
=> 'playing!'
```

### I like it, but...

Before you run for the hills due to the sheer volume of boilerplate code I want to remind you that almost all of this repetition can easily be cleaned up. If we defined a base state that all of our other states extended then they would only need to override the methods that they cared about. For instance, the `stopping` state and `pausing` state both tell their target to `changeState` when someone calls `play`. This kind of functionality is easily moved into a base state. Also if you have no need for `enter` and `exit` methods those can be removed or also thrown into the base state. I'll dig into this more tomorrow but for now play around with the example and leave some feedback if you have comments or suggestions. Thanks!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Drunk
- Sleep: 7
- Hunger: 0
- Coffee: 1
