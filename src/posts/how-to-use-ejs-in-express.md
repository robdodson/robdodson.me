---
title: How to use EJS in Express
tags:
  - Chain
  - Node
  - Express
  - EJS
date: 2012-05-31T18:34:00.000Z
updated: 2016-05-04T02:54:30.000Z
---

_Update: If you're starting a fresh project with Express it's much easier to just run `express --ejs`. That will scaffold out an Express app for you with EJS ready to go!_

Here's a quick explanation of how to use EJS instead of Jade in your Express projects. This is super easy and covered well in the documentation but I wanted to put it here since that's what I worked on today :)

To start I'll create a new project from the command line:

```bash
express foobar
cd foobar
npm install
```

Now that I have my foobar project created I need to install `ejs`.

```bash
npm install ejs --save
```

If you're within your project directory this will place ejs in the `node_modules` dir. Let's also add it to our package.json.

```json
{
  "name": "foobar",
  "version": "0.0.1",
  "private": true,
  "dependencies": {
    "express": "~2.5.8",
    "ejs": "~0.7.1"
  }
}
```

The tilde operator means that we require ejs verion 0.7.1 or greater but only up to the next major release. So the following are equivalent: `"~1.2" = ">=1.2.0 <2.0.0"`. For a deeper explanation of package.json and NPM in general [checkout this great post](http://howtonode.org/introduction-to-npm).

### Leaving Jade for EJS

If you're using the boilerplate that Express generates then it should be setup to use Jade as the rendering engine for its views. I think that Jade is cool but I need to baby step into Node/Express and make sure I understand everything that's going on instead of trying to consume so many different tools at once. With this in mind I decided to switch from Jade to EJS at least in the beginning because the syntax has no learning curve. To change your rendering engine you'll need to either add or edit the following call:

```js
app.set('view engine', 'ejs');
```

The boilerplate should have this set to `jade` inside of a configuration block. Once we've changed that line to read `ejs` we're ready to start writing some views.

### Setting up your layout

By default Express' boilerplate will look for a file named layout in our views directory. Let's write one called `layout.ejs`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Pivotal Search</title>
    <meta name="description" content="" />
    <meta name="author" content="" />

    <!-- HTML5 shim, for IE6-8 support of HTML elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- styles -->
    <link href="stylesheets/style.css" rel="stylesheet" />
  </head>
  <body>
    <%- body %>
  </body>
</html>
```

This is all really straightforward with the exception of the `<%- body %>` line which basically works like a `yield` in erb. Whatever template we pass to Express' `response.render()` function will fill this dependency, here's an example:

```js
app.get('/', function (req, res) {
  res.render('index', { title: 'The index page!' });
});
```

```html
<div class="title"><%= title %></div>
```

![Rendering the index template](/images/2014/12/rendering_the_index_template.png)

Furthermore we can use partials with Express and EJS like so:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Pivotal Search</title>
    <meta name="description" content="" />
    <meta name="author" content="" />

    <!-- HTML5 shim, for IE6-8 support of HTML elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- styles -->
    <link href="stylesheets/style.css" rel="stylesheet" />
  </head>
  <body>
    <%- partial('header.ejs') %> <%- body %>
  </body>
</html>

<header>My awesome header!</header>
<hr />
```

![Rendering the header partial](/images/2014/12/rendering_the_header_partial.png)

And there ya go! Simple but hopefully useful if you're just getting started like I am :) - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Eager, Alert
- Sleep: 7
- Hunger: 7
- Coffee: 0
