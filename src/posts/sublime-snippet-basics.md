---
title: Sublime Snippet Basics
tags:
  - Chain
  - Sublime
date: 2012-06-25T05:48:00.000Z
updated: 2014-12-31T00:21:39.000Z
---

[Yesterday I covered some tips and tricks](http://robdodson.me/blog/2012/06/23/sublime-text-2-tips-and-shortcuts/) I've learned over the past few months of using Sublime. Something I didn't touch on is Sublime's Snippet architecture.

Essentially a snippet is a little piece of code that gets executed when you type some characters and hit the `tab` key. For instance I have a snippet that spits out `console.log()` whenever I type `lg` and press `tab`. One clever feature of snippets is that they can be bound to a keyboard shortcut if the key binding calls the `insert_snippet` command and passes the path to the snippet file as an argument. For example:

```json
{
  "keys": ["super+shift+r"],
  "command": "insert_snippet",
  "args": {
    "name": "Packages/XML/long-tag.sublime-snippet"
  }
}
```

That will tell Sublime that when I press `cmd+shift+r` it should act as if I triggered the long-tag snippet for XML files. Basically that will let me highlight some text, hit `cmd+shift+r` and then I can type some HTML or XML tags to wrap my text. Cool. So let's go about writing our own snippet to learn a bit more about this process.

## Getting Started

The previously mentioned snippet is great for wrapping an item in HTML/XML tags but it totally breaks if we need to wrap our selection in anything not existing within brackets: `</>`. Since I write a lot of Markdown I'm always wrapping text in some kind of markdown syntax, `*like this*`, but there's no easy way to do this. The aforementioned snippet is close so we're going to copy it and tweak it to do what we need.

[The documentation on snippets for Sublime is short and full of good information. I suggest you read it before continuing on.](http://docs.sublimetext.info/en/latest/reference/snippets.html)

We're going to copy the file located at `/Library/Application\ Support/Sublime\ Text\ 2/Packages/XML` and move it into our `/Packages/User` directory. I chose to rename the file to `wrap-anything.sublime-snippet`. The original snippet looks like this:

```xml
<snippet>
    <content><![CDATA[<${1:p}>${2:$SELECTION}</${1/([^ ]+).*/$1/}>]]></content>
    <tabTrigger>&lt;</tabTrigger>
    <scope>text.xml</scope>
    <description>Long Tag</description>
</snippet>
```

`<content>` is where we put everything that's going to be spit out by our snippet when it's executed. Items are wrapped in a `CDATA` tag so they don't interfere with the rest of the XML.

The first part `<${1:p}>` outputs a `<` followed by a variable, `$1` which has a default value of the letter "p" and it closes with a `>`. If our snippet only contained this bit of code then when we ran it the output would be `<p>`.

The second part uses one of the environment variables [talked about in the snippet documentation.](http://docs.sublimetext.info/en/latest/reference/snippets.html)`$SELECTION` will take whatever we've highlighted and make it part of the snippet output. You'll notice this variable is prefixed with a `2:` meaning it's our second variable and it's default output is going to be whatever was highlighted. The 2 also indicates that if the user hits `tab` this is the second place they'll go.

The third part contains a block of regex which, I think, just matches whatever the user types after the snippet has executed. My regex sucks so correct me if I'm wrong.

`<tabTrigger>` indicates what character should be typed before hitting `tab` to fire off the snippet. In this case it's a `<`

`<scope>` defines where the snippet should run I believe.. But I'm not entirely sure. The documentation just says "Scope selector to activate this snippet." I didn't see a text.xml file anywhere in the `Packages/XML/` folder and I know this snippet works in non-xml files so...yeah..._shrug_

`<description>` lets you describe the thing. duh.

OK let's make our own simplified snippet:

```xml
    <snippet>
        <content><![CDATA[${1:`}${2:$SELECTION}${1}]]></content>
        <tabTrigger></tabTrigger>
        <scope></scope>
        <description>Wrap any block of text</description>
    </snippet>
```

Our snippet is less sophisticated than the previous one since we've excluded the regex. With the above snippet located in our `Packages/User/` folder we can tie it to a keyboard shortcut like so:

```json
{ "keys": ["super+r"], "command": "insert_snippet", "args": { "name": "Packages/User/wrap-anything.sublime-snippet" } },
```

Now when we hit `cmd+r` it will let us wrap our current selection in whatever we want :)

For good measure here's a really useful console.log snippet that's triggered by typing `lg` and then pressing `tab`.

```xml
<snippet>
    <content><![CDATA[console.log(${1});]]></content>
    <tabTrigger>lg</tabTrigger>
    <scope>source.js</scope>
    <description>console.log()</description>
</snippet>
```

No need to bind this to a keyboard shortcut (unless you want to) because it defines a tab trigger. I know this wasn't super in-depth but hopefully it gives you a little bit of a start. [Read the documentation on snippets](http://docs.sublimetext.info/en/latest/reference/snippets.html) and tighten up your regex! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Lazy
- Sleep: 5
- Hunger: 0
- Coffee: 1
