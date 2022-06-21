---
title: Publish your Node library to npm
tags:
  - Chain
  - Node
  - npm
date: 2012-06-17T06:06:00.000Z
updated: 2014-12-31T00:00:41.000Z
---

Alright, [contuing from yesterday](http://robdodson.me/blog/2012/06/15/how-to-run-a-node-script-from-the-command-line/) we want to take our little Node module and make it available to the world as a really awesome command line tool.

The first thing we need to do is register an NPM account.

`npm adduser`

Fill in your credentials and it should be ready to go.

If we have any dependencies they should be added to our `package.json` file. Our simple `compliment` program doesn't need any extra libraries but we'll add `xml2json` just to demonstrate how it's done.

```json
{
  "name": "compliment",
  "version": "0.0.1",
  "description": "Tell us how awesome we are.",
  "preferGlobal": "true",
  "bin": { "compliment": "compliment.js" },
  "author": "Rob Dodson",
  "dependencies": {
    "xml2json": "0.2.4"
  },
  "engines": { "node": "*" }
}
```

Since we've changed our `package.json` we need to run `npm link` again to install the dependency. After that you should have a `node_modules/` folder in your project root.

Let's put this baby under version control!

```bash
git init
echo node_modules/ >> .gitignore # node_modules should be installed by npm
git add .
git commit -am 'Initial commit'
```

Final step:

```bash
npm publish
```

# BOOMJAMS! We have us an npm module! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Hyper
- Sleep: 5
- Hunger: 1
- Coffee: 1
