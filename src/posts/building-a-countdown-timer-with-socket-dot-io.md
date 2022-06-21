---
title: Building a Countdown Timer with Socket.io
tags:
  - Chain
  - Node
  - Express
  - Socket.io
date: 2012-06-05T15:07:00.000Z
updated: 2015-01-02T08:57:25.000Z
---

Yesterday I put together a very simple Node/Socket.io application and showed how to deploy it to Heroku. Today I'm going to keep going with that app to see if I can get the functionality that I want. The app is a basic stopwatch so that shouldn't be too hard. If you want to catch up [checkout yesterday's article](http://robdodson.me/blog/2012/06/04/deploying-your-first-node-dot-js-and-socket-dot-io-app-to-heroku/) which explains setting everything up.

- [Getting Started](http://robdodson.me/blog/2012/06/04/deploying-your-first-node-dot-js-and-socket-dot-io-app-to-heroku/)
- [Click here for part 2.](http://robdodson.me/blog/2012/06/06/building-a-countdown-timer-with-socket-dot-io-pt-2/)
- [Click here for part 3.](http://robdodson.me/blog/2012/06/07/building-a-countdown-timer-with-socket-dot-io-pt-3/)

### Countdown

Just to get the ball rolling I'm going to write a little code in my `app.js` file right at the bottom to setup a very crude counter.

```js
var countdown = 1000;
setInterval(function () {
  countdown--;
  io.sockets.emit('timer', { countdown: countdown });
}, 1000);

io.sockets.on('connection', function (socket) {
  socket.on('reset', function (data) {
    countdown = 1000;
    io.sockets.emit('timer', { countdown: countdown });
  });
});
```

Elsewhere in my client-side js I'm going to listen for the `timer` event and update my DOM elements.

```js
var socket = io.connect(window.location.hostname);

socket.on('timer', function (data) {
  $('#counter').html(data.countdown);
});

$('#reset').click(function () {
  socket.emit('reset');
});
```

You'll also need to update your index.ejs file so it reads like this:

```html
<div id="counter"></div>
<button id="reset">Reset!</button>
```

Every second we'll decrement our countdown variable and broadcast its new value. If a client sends us a `reset` event we'll restart the timer and immediately broadcast the update to anyone connected. I noticed that since I'm using `xhr-polling` it can sometimes take a while for the timer to show up in my browser so keep that in mind.

While this implementation isn't pretty it does get us a little bit further down the road. Unfortunately I've been tripped up by a bunch of Node's module issues so I have to cut tonight's post short :\

Hopefully better luck tomorrow. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Sedate, Sleepy
- Sleep: 5
- Hunger: 4
- Coffee: 0
