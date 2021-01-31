---
title: Hacking the PATH variable in Sublime Text
tags:
  - Chain
  - Sublime
  - Python
date: 2012-05-15T03:26:00.000Z
updated: 2014-12-30T07:20:52.000Z
---

This is going to be a bit of a lightning post but I wanted to quickly show off how to edit the PATH variable that Sublime text uses. I should warn you that that I am neither an expert in Python nor am I a very seasoned Sublime user. So having said that take all of this with a grain of salt and use at your own risk.

### Our first (crappy) plugin!

Sublime has a great plugin architecture that makes it extremely easy to add to the platform. If you create a `.py` file in the `~/Library/Application Support/Sublime Text 2/Packages/User/` folder it will be loaded as soon as Sublime starts. Writing plugins seems to be actually quite easy based on their [documentation and examples.](http://www.sublimetext.com/docs/plugin-basics) We won't be following the typical plugin architecture since we're just trying to hack a system variable and that doesn't seem to necessitate the use of their built in modules.

Here's a script I'm calling `Pathway` at the moment.

    import os
    
    LOCAL = '/usr/local/bin:/usr/local/sbin:'
    HOME = '/Users/Rob'  ### !!! REPLACE WITH YOUR HOME PATH !!! ###
    RVM = HOME + '/.rvm/bin:'
      
    # Sublime's default path is
    # /usr/bin:/bin:/usr/sbin:/sbin
    os.environ['PATH'] += ':'
    os.environ['PATH'] += LOCAL
    os.environ['PATH'] += RVM
    
    print 'PATH = ' + os.environ['PATH']
    

If you add this file to the Sublime user's directory outlined above you should be able to hit cmd + ` to fire up the Sublime console which will print out our new PATH variable.

I would also recommend adding a shell plugin to Sublime. At the moment I use [Shell Turtlestein.](https://github.com/misfo/Shell-Turtlestein).

Now that I have my hacked path variable and my shell plugin I can check to see if RVM works. Using Shell Turtlestein you can hit `cmd-shift-c` to open a little console prompt. Typing `rvm current` returns our ruby version number and gemset. Nice! What's even nicer is this means I can now run Rake tasks from inside of Sublime!

I should point out if all you want to do is run Rake or Ant then there are already plugins for that sort of thing. My main effort in doing all this is to try to integrate the command line with Sublime a bit better. If *anyone* knows how to simply tell Sublime to use the path in my .bash_profile or .bashrc then I would gladly use that approach instead. But after crawling the forums for a while it looks like this is still a common problem with no good solution.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Happy, Peaceful, Hurried
- Sleep: 7
- Hunger: 6
- Coffee: 0
