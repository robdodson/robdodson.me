---
title: Debug LESS with Chrome Developer Tools
tags:
  - LESS
  - Chrome
date: 2012-12-28T16:32:00.000Z
updated: 2014-12-31T00:49:13.000Z
---

*11/19/2013: Updated to work with LESS v1.5.1 which now has support for v3 source maps*

If you've spent much time with preprocessors like LESS you've probably discovered their one rather crippling flaw: debugging. With thousands of lines of LESS code suddenly turning into even more thousands of lines of CSS, it can become nearly impossible to tell where a particular style originated. Thankfully the Chrome team is addressing this problem with their recent support for **CSS source maps.**

Today I'll teach you how to rework your LESS preprocessor so it plays nice with Chrome and reunites you with your old friend: the CSS inspector.

Just to whet your appetite here's a teaser of what we're going to accomplish.

![A preview of the Inspector showing LESS debugging](/images/2014/12/less-preview.png)

You'll notice, over on the right, instead of your typical `style.css: 7` it says `modules.less: 7`. That's right, the developer tools are looking at the generated CSS and source mapping it back to the LESS file!

Clicking on the line number will dive into the LESS file itself.

![The inspector revealing the actual LESS file](/images/2014/12/less-preview2.png)

To achieve this effect, we'll need to tell the LESS compiler to generate a source map file when it spits out our CSS. A source map tells the debugger how to find its way from generated output back to the source file.

*Important: If you use less.js to compile your LESS in the browser, the techniques we'll be covering will not work for you. Please see [this ticket](https://code.google.com/p/chromium/issues/detail?id=285786) for more information.*

## Setting Up Chrome [#](#)

Fire up the developer tools and click the gear in the bottom right.

![Chrome Developer tools options](/images/2014/12/chrome-options.png)

In the left hand sidebar click `General`. Scroll down to where it says `Sources` and click `Enable CSS source maps`.

![Enable CSS source maps](/images/2014/12/enable-css-source-maps.jpg)

## Processors [#](#)

There are a quite a few ways to convert your LESS into properly source mapped CSS code. You can use the `lessc` command line tool, or have the server do it with a tool like [less-middleware](https://github.com/emberfeather/less.js-middleware) for [connect](http://www.senchalabs.org/connect/). As I mentioned previously, you can also compile LESS on the client-side using `less.js`, but [the current implementation of source maps in Chrome does not support this.](https://code.google.com/p/chromium/issues/detail?id=285786)

### lessc [#](#)

If you've [installed LESS using npm](https://github.com/less/less.js/#getting-started), check that you've got the latest version. You'll need `1.5.0` or above.

    $ lessc --version
    lessc 1.5.1 (LESS Compiler) [JavaScript]
    

If your version is not `1.5.0` or greater, you should run `npm update -g less`.

### Outputting a source map

Let's imagine your project has a directory structure like this:

    css/
    less/
      index.less
      modules.less
      variables.less
    index.html
    

`index.less` imports all of the other LESS files, so that's the one we want to compile to CSS. Our goal is to have an `index.css` and `index.css.map` file inside of the `css/` folder when everything is finished.

    css/
      index.css
      index.css.map
    less/
      index.less
      modules.less
      variables.less
    index.html
    

To do this with `lessc` we'll run the following command from the root of the project:

`lessc less/index.less > css/index.css --source-map=css/index.css.map --source-map-basepath=css`

Kind of a mouthful, I know.

The first bit is just compiling our LESS file to a CSS file in the `css/` dir.

    lessc less/index.less > css/index.css
    

The `--source-map` flag tells `lessc` where to put the souce map file. In this case we want it inside the `css/` dir as well.

    --source-map=css/index.css.map
    

The `--source-map-basepath` flag tells `lessc`

### less-middleware [#](#)

You might need to update your version of the middleware to whatever's the latest, which looks like 0.1.9 as of this writing.

In your app you'll need to add the `dumpLineNumbers` options to the middleware's config.

    app.use(lessMiddleware({
      src: __dirname + 'path/to/src',
      dest: __dirname + 'path/to/dest',
      dumpLineNumbers: 'mediaquery'
    }));
    

After that you should be all set. Make sure any minification is turned off or it will screw up the source maps.

## Conclusion

Personally I've found this trick *extremely* useful when working with large LESS codebases. I've seen some chatter that Stylus might also support this trick so if you have first-hand experience debugging Stylus with Chrome please drop me a comment. Otherwise I might do a follow up showing how to achieve similar results in that language.

Any questions or comments hit me up in the discussion area below.

-- Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
