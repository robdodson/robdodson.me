---
title: Sublime Text 2 Tips and Shortcuts
tags:
  - Chain
  - Sublime
date: 2012-06-24T05:28:00.000Z
updated: 2014-12-31T00:17:50.000Z
---

I've been using Sublime Text 2 for probably two months now and in that time I've discovered tons of useful tricks. I figured I should start writing them down for anyone who might be interested. I'll try to explain the bits that seem esoteric because there are a lot of cool commands which only work in certain contexts.

## Finding your preferences

One of the first things you want to do with Sublime is to find your User key bindings. They're located under `Sublime Text 2 > Preferences > Key Bindings - User`

Sublime Text is very DIY so there isn't a fancy GUI to help you change keyboard shortcuts. Instead you use the preference file to override the default shortcuts. Like a lot of things in Sublime, this can at first seem annoying and non-intuitive. That is, until you realize that by doing it this way Sublime has actually given you the power to make _extremely_ awesome key bindings. Take some time to look around in this file. I still only understand a fraction of what all it does but the little bits I learn here and there give me all sorts of ideas for new shortcuts. Just remember, if you want to change a keyboard shortcut you should do it in the User's key bindings and not the Default key bindings.

**Pro Tip:** If you ever want to change a keyboard shortcut but can't figure out what command is currently running open up Sublime's built in terminal with ` ctrl+`` then type  `sublime.log_commands(True)`. Now when you execute your command from the menu you should see its name show up in the console. Just remember to turn logging off when you're done :)

## Sublime Package Control

If you only follow one piece of my advice make it this: [Install Sublime Package Control.](http://wbond.net/sublime_packages/package_control)

Package Control makes it extremely easy to manage your Sublime plugins. It also helps with discovering new ones, which is nice. Just install it if you haven't already, it's impossible to live without.

## Setting up a command line shortcut

I highly recommend setting up a symlink so you can easily open things with Sublime. [This article details how to go about it on OSX.](http://www.sublimetext.com/docs/2/osx_command_line.html)

CLI FTW!

## The Command Palette

OK, so hopefully you've setup Sublime Package Control. Maybe you've even installed some plugins. It's time for you to meet the Command Palette then. `cmd+shift+p` will open up the window and from here you can execute just about any command either native to Sublime or part of a plugin. It is super useful for all those things you don't run often enough to turn into full blown keyboard shortcuts. It's also useful if you know the name of a command but can't remember what section of the menu it lives under.

## Goto Anything...

So you want to fly around your project like a ninja on methamphetamines, eh? Then the shortcut you want is `cmd+p`. Once you've opened the dialog try typing a filename. Useful right? But wait, there's more...

If you preface what you're typing with a `@` it will look for "symbols" in the current file. Ex: `@foobar`. But just typing `@` will give you a nice file outline. The definition of what a symbol is depends on the file-type. In a Markdown file, for instance, it will list every header. In a JavaScript or Ruby file it will list every method of an object.

One last trick. If instead of an `@` you preface things with an `:` you can type a line number instead and hit enter to jump to that point. Ex: `:415`

There are other keyboard shortcuts for jumping to a line and going to a symbol but why bother when you can just use `cmd+p` and some easy prefixing.

## Splitting the editor windows

OK this one is also important and I can't recommend it enough. **Learn to split your editor windows.** I never used this feature in previous IDEs and now I wonder how I ever lived without it. Whether you have a unit test in one window and an implementation in the other, or some HTML and CSS, this feature is just always handy.

![Split panes in Sublime](/images/2014/12/sublime-split-panes.png)

I _live_ in split panes. They've changed my workflow significantly for the better. Less time switching between files and finding your place is an incredible advantage. You can access them through `View > Layouts`. It will behoove you to learn these keyboard shortcuts. Also learn the shortcuts for `View > Focus Group` and `View > Move File to Group`.

## Selections

There are some neat selections which come in handy depending on your context. Personally I use Expand Selection to Tag, `cmd+shift+a` quite frequently when writing HTML. I also use Expand Selection to Line, `cmd+L` and Expand Selection to Word, `cmd+D` a lot.

## Selections with Multiple Cursors

Multiple cursors... It's one of those things you didn't realize you needed until suddenly you had it and you were all like "WHAAAAAAAAT!"

There are a handful of ways to activate multiple cursors in Sublime. Hitting `cmd+D` to select multiples of the same word will put us into a multi-cursor context.

Another way to go about it is to highlight a block of text and hit `cmd+shift+L` which will split each line into its own selection. This is extremely useful when editing HTML where often times you have repeating elements and you want to tweak a class name on all of them.

You can also just hold `cmd` and click around your file to add more cursors. Or you can hold `ctrl+shift` and tap either the up or down arrows to add a new cursor in that direction.

## Moving Lines

`Edit > Line > Swap Line Up`

`Edit > Line > Swap Line Down`

`Edit > Line > Duplicate Line`

Learn em. Love em. I changed my keyboard shortcut for these so I can't recall what it is by default. Regardless I think I use these three commands more than any other so I would say if you only learn three shortcuts, make it these three.

**Pro Tip:** If you want to duplicate a block of code highlight it and hit `cmd+L` to select the new line before you hit `cmd+shift+D`. This way your duplicated block will appear on a new line, rather than next to the previous block of code.

## Wrap your lines

If you've installed the [Tag plugin](https://github.com/SublimeText/Tag) you should have some extra line wrapping methods. I would also recommend you install [ZenCoding](https://bitbucket.org/sublimator/sublime-2-zencoding). I'm suggesting this for two reasons:

1. You get awesome new features...
2. I can't remember if what I'm about to say is native to Sublime or part of a plugin.

OK with that out of the way...

Let's say you're working on some HTML and you have a block of text that you'd like to wrap in a `p` tag. No problemo! Highlight the text and hit `ctrl+shift+w` or `Edit > Tag > Wrap Selection in Tag`. There's a more advanced versions that comes with the ZenCoding plugin which lets you do really elaborate wrappings. I believe the keyboard shortcut for that is `ctrl+alt+w`. Personally I dislike using the `ctrl` key on my Mac laptop so I changed both of those keyboard shortcuts to the following:

```json
{ "keys": ["super+shift+r"], "command": "insert_snippet", "args": { "name": "Packages/XML/long-tag.sublime-snippet" } },
{ "keys": ["alt+shift+r"], "command": "wrap_zen_as_you_type",
"context": [
    {
      "operand": "text.html, text.xml",
      "operator": "equal",
      "match_all": true,
      "key": "selector"
    }
  ]
}
```

You'll notice that instead of just using a `wrap_in_tag` command name the first entry actually calls another command, `insert_snippet` and passes it an argument: `Packages/XML/long-tag.sublime.snippet` which is the location of a snippet file. Pretty cool trick!

Also note that Sublime uses the term "super" to refer to the command key

## Bookmarks!

If you're like me then you lose your place in large files. That's where bookmarks can be a big help. `cmd+F2` will add a new bookmark on the page. The bookmark is tied to the line so if you use the move line up/down commands it will move the bookmark as well (nice). To cycle through your bookmarks just hit F2. The rest of the bookmark commands are located in `Goto > Bookmarks`. Take note of the one that says `Select All Bookmarks` which will basically let you do a multi-selection on all of the lines you've already bookmarked.

## Marks

Marks are very similar to bookmarks but they serve a different purpose. They're located in `Edit > Mark` and their keyboard shortcuts are a little weird because you need to hit `cmd+K` and then a secondary shortcut like `cmd+space`. I find myself using Marks a few times a day to do large selections. For instance if you have a big block of HTML it can be very tricky to stay inside the proper scope if you're trying to delete all the contents of a very high level container. With Marks you can just put a mark on the opening line of the container, hit `cmd+shift+a` to select down to the bottom of the tag, and then hit `cmd+K, cmd+a` to select everything back to your previous mark. Marks can also be used to swap lines of text but I've never needed to do that in practice.

## Hide the Sidebar

To hide the sidebar hit `cmd+K, cmd+B`. Since I work on a laptop I often hide the sidebar to give myself that extra 100px of reading space.

## Turn off Minimap

Do you guys use that minimap thing in the top corner of the editor windows? I find it _incredibly_ distracting and it also takes up screen space. To disable it go to `View > Hide Minimap`.

## Saving a project

This one might be obvious for many of you but it wasn't something I was really taking advantage of until recently. Once you have a folder open it can be beneficial to save it as a project via the `Project > Save Project As...` command. Save the project files in the root of your app and then whenever you do `Project > Recent Projects...` it will open everything up with all your windows just as you left them.

To switch between projects use `ctrl+cmd+p`.

## Some awesome plugins

Sublime is all about plugins so here's a list of some of my favorites. Once you have Package Control installed you can just hit `cmd+shift+p` and type `discover`, then hit enter which will take you to a page listing tons of plugins. Try out some (or all) of the ones below. They're great :D

- AdvancedNewFile
- HtmlTidy
- Nettuts+ Fetch
- Prefixr
- RubyTest
- Shell Turtlestein
- SideBarEnhancements
- sublime-github
- Sublime-JSHint
- SublimeCodeIntel
- Tag
- ZenCoding

## Convert Case

If you highlight some text you can use `cmd+K, cmd+U` to uppercase it. Likewise you can use `cmd+K, cmd+L` to lowercase it.

## Spell Check :)

Finally I wouldn't be much of a blogger if I didn't point out the spell check feature. Hit `F6` to check your current file. Once you've turned it on the spell checker will stay on until you hit `F6` again.

## Hack the Planet!

We've only really scratched the surface of what Sublime is capable of. In the future I'd like to write more about its awesome Macros, Snippets and Plugin architecture. Till then, have fun hacking. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Lazy
- Sleep: 5
- Hunger: 5
- Coffee: 1
