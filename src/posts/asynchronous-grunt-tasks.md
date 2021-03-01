---
title: Asynchronous Grunt Tasks
tags:
  - grunt
date: 2012-11-29T16:15:00.000Z
updated: 2014-12-31T00:45:31.000Z
---

*Update: Thanks to [@waynemoir](https://twitter.com/waynemoir) for updating the example source to work with Grunt ~0.4.*

After my last post [@stevensacks](https://twitter.com/stevensacks) tweeted at me that he was having issues getting node FileSystem commands to work in grunt. After a bit of poking around I noticed that there was no call to grunt's `async` method, which was probably preventing the process from finishing properly. So today's post is a primer on async grunt processes, and how to make sure your node and grunt syntax is setup correctly.

## [Grab the Example Source](https://github.com/robdodson/async-grunt-tasks)

I've provided a simple grunt project at the link above. Take a look at the `tasks` folder and you should see two custom tasks, `grunt-read-write-local.js` and `grunt-read-write-web.js`. The former will read a local file and write its contents to a new file. The latter will request a webpage and write its contents to a static file.

There are two asynchronous APIs at play here (Node's and Grunt's) and it's important to understand both.

In Node an async operation will usually provide a callback, such is the case for [fs.readFile](http://nodejs.org/api/fs.html#fs_fs_readfile_filename_encoding_callback), or it will use an event dispatch, for instance in an http request we listen for the [data event.](http://nodejs.org/api/http.html#http_event_data)

Grunt, on the other hand, uses a token or a kind of promise. You grab a reference to grunt's `done` function and you wait till your node process has finished before calling it. If you take a look at `grunt-read-write-local.js` you can see that we first call the async method to let grunt know it needs to wait:

```js
var done = this.async();
```

and as we finish writing our file we tell grunt that everything completed succesfully and it's ok to carry on:

```js
// Write the contents of the target file to the new location
fs.writeFile(pathToWrite, data, function (err) {
  if (err) throw err;
  console.log(pathToWrite + ' saved!');
  // Tell grunt the async task is complete
  done();
});
```

We do something similar in our `grunt-read-write-web` task but this time we work with [Stream events.](http://nodejs.org/api/stream.html#stream_stream)

```js
// Tell grunt this task is asynchronous.
var done = this.async();

http.get(pathToRead, function(res) {
  // Pipe the data from the response stream to
  // a static file.
  res.pipe(fs.createWriteStream(pathToWrite));
  // Tell grunt the async task is complete
  res.on('end', function() {
    console.log(pathToWrite + ' saved!');
    done();
  });
}).on('error', function(e) {
  console.log("Got error: " + e.message);
  // Tell grunt the async task failed
  done(false);
});
```

The response returned by an http request implements the [ReadableStream](http://nodejs.org/api/stream.html#stream_readable_stream) interface so it will emit `data` and `end` events. Node Streams have a great feature called [pipes](http://nodejs.org/api/stream.html#stream_stream_pipe_destination_options) which handle the work of consuming data events and writing them to a destination. Sexy :) We still listen for the `end` event coming from our request so we can notify grunt that the process has finished and it can move on.

## [Grab the Example Source](https://github.com/robdodson/async-grunt-tasks)

If you want to test it all out make sure you run `npm install` first to pull down any dependencies. Then kick things off by running `grunt`. I'm thinking my next post might be all about [Streams](http://nodejs.org/api/stream.html#stream_stream) in node since they're such a cool concept. Thanks to [@maxogden](https://twitter.com/maxogden) and [@dominictarr](https://twitter.com/dominictarr) for their great posts on the subject of streams.

- [Node Streams: How do they work? -- Max Ogden](http://maxogden.com/node-streams.html)
- [High Level Style in JavaScript -- Dominic Tarr](https://gist.github.com/2401787)