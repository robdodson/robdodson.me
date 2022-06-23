---
title: How to Run a Node Script from the Command Line
tags:
  - Chain
  - Node
  - npm
date: 2012-06-16T02:46:00.000Z
updated: 2014-12-30T23:55:32.000Z
---

## First write some code

Make a new directory called `compliment` and create two files inside of it: `comliment.js` and `package.json`.

In `compliment.js` we're just going to print out some kind words.

```bash
#! /usr/bin/env node

console.log('you. are. AWESOME!');
```

Simple enough right? Just make sure you include that shebang up at the top which directs the system to use Node to execute our script.

## Package it up

Ok now that we have our little script we'll give its `package.json` some love.

```json
{
  "name": "compliment",
  "version": "0.0.1",
  "description": "Tell us how awesome we are.",
  "bin": {"compliment": "compliment.js"},
  "author": "Rob Dodson",
  "engines": {"node": "*"}
}
```

Most of that should be self explanatory. The key aspect is the `bin` section where you tell it to translate `compliment` into `compliment.js`. To install it all we have to do is run `npm link`. After you've done that you should be able to type `compliment` and hear how awesome you are!

## Publish it

When you're ready to distribute your binary to the world you can run:

```bash
npm publish
```

You'll be prompted to sign in to npm if you haven't already. After that you should see output confirming
that your package has been published.
