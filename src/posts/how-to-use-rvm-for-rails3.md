---
title: A Basic RVM Tutorial for Rails 3
tags:
  - Rails
  - Rails 3
  - Ruby
  - rvm
date: 2011-09-23T14:33:00.000Z
updated: 2015-01-02T09:04:06.000Z
---

### What is RVM?

[RVM](https://rvm.io//) is a great Ruby and gem management tool that should probably be the first thing you install if you’re learning Rails (or Ruby for that matter). The main benefit of RVM is that it helps to keep your rubies and your gems organized into discrete folders which can easily be thrown away and recreated. If you’ve ever had a gem explode on you, then you know how great a feature like this is. I’ll cover the basics of using RVM in this post to quickly get you up and running. This tutorial is written for the OSX terminal, if you're on Windows...um...kill yourself.

### How to Install RVM

First download and run the RVM installation script. Thankfully the authors have made this nice and easy for you. Just copy and paste the following into your command line:

```bash
curl -L get.rvm.io | bash -s stable
```

Next you’re going to want to make sure that RVM gets loaded into your shell sessions. The easiest way to do this is to open up your .bash_profile file located in your user's home directory (that's what the ~ stands for in your terminal) and add the following to the bottom:

```bash
[[ -s "$HOME/.rvm/scripts/rvm" ]] && . "$HOME/.rvm/scripts/rvm" # This loads RVM into a shell session.
```

Then quit your terminal window and open it up again. You should be able to type: `rvm -v` to verify that RVM is loaded and ready for use. If instead it just returns the prompt then you've probably missed a step along the way. Check out the [RVM installation page](https://rvm.io/rvm/install/) and double check that you've done everything correctly.

### A Guided Tour of RVM's Inner Workings

To get us started lets look around inside the .rvm directory. Try the following:

```bash
cd ~/.rvm
ls
```

When you list out the contents of rvm you’ll see several folders but the ones we’re most interested in are gems and rubies. The gems folder is going to hold all of our gems after we create a _gemset_. The rubies folder holds different versions of ruby for us to play with. The really cool thing about RVM is that it lets you swap versions of ruby and different gemsets around so you can test out new packages without blowing stuff up. Made a mistake and installed the wrong gems? Just blow away the gemset and start over, no need to track everything down and uninstall it. RVM also lets you ensure that you have the same gems running for your dev, test and production environments :)

Now that you have RVM installed, the next thing you’ll want to do is to install the latest version of Ruby. If you haven’t previously installed Ruby and you’re on OSX then typing `ruby -v` into the command line should produce something like this:

`ruby 1.8.7 (2009-06-12 patchlevel 174) [universal-darwin10.0]`

We’re going to leave the default version of Ruby installed on our machine, and instead install a new version using RVM. The current latest version of Ruby is 1.9.3, so try typing:

```bash
rvm install 1.9.3
```

It will take a little while to run but if all goes well we should have a brand new working copy of Ruby.

Now try:

```
rvm use 1.9.3
ruby -v
# ruby 1.9.3p125 (2012-02-16 revision 34643) [x86_64-darwin11.2.0]
which ruby
# /Users/Rob/.rvm/rubies/ruby-1.9.3-p125/bin/ruby
```

We can see that not only are we running the latest version of ruby, but instead of being stashed in some random system folder somewhere, it’s being kept inside of a directory in RVM. To make sure that every time we open terminal we are using this new version of ruby we’ll simply say:

```
rvm use 1.9.3 --default
```

That will tell RVM to use this version as its default Ruby any time we open a terminal session.

### What are RVM Gemsets?

I have to admit that when I first started using Ruby I found the concept of gems really confusing. In Flash or JavaScript if you want to use some code you just download the folder from github and include it in your project. Ruby does something similar with gems except it tries to automate the process for you and often times this can lead to busted projects. Because some gems rely on other gems it isn’t unheard of to have two gems in conflict which means your project won’t run and if you’re new to ruby or rails this can be just enough to make you call it quits. Here is where RVM really shines because it makes it OK to screw up your gems by sequestering them into their own little packages which you can recreate and destroy at will.

Lets get started by typing:

```bash
rvm gemset create my-new-gemset
```

You should get a confirmation that a new gemset was created as well as a path to the new gemset. Let’s go take a look at that path.

```bash
# Make sure to use the path RVM provided you.
cd /Users/RobDodson/.rvm/gems/ruby-1.9.3-p125@my-new-gemset
ls
```

Right now the folder is empty because we haven’t told RVM to install any gems into this gemset. Let’s change that by first assigning our current instance of ruby to this set.

```bash
rvm 1.9.3@my-new-gemset --default
```

The @ character tells RVM that we want to assign this gemset to our current ruby instance. The default flag is just there since I tend to forget to make my gemsets defaults and RVM will reset to whatever the prior default was the last time the flag was set. Let’s verify that things worked by typing:

```bash
rvm current
```

Which should output: `ruby-1.9.3-p125@my-new-gemset`. Similarly you could type:

```bash
rvm gemset list
```

To see a list of all your gemsets with a hash rocket next to the one currently in use.

### How to Install Gems with RVM

Ok, so lets install some gems then. We’ll start by installing the Nokogiri gem, just as a test. But before we do this let me give you a little warning. In a lot of documentation you'll see people installing gems with the `sudo` keyword at the beginning of the commmand. If you're not using RVM then doing it this way makes sense. However if you ARE using RVM then _you should never install a gem with `sudo`!_ In short, RVM does command line wizardry and installing gems with `sudo` will place them outside of the .rvm directory. You'll think you've installed a gem properly but really it'll be somewhere in the system folder. To install a gem using RVM we simply leave off the `sudo` keyword. Let's try one by typing:

```bash
gem install nokogiri
```

After the installation has finished we should be able to see our new gem. If you’re still inside of the gems directory from earlier you can do a `cd gems`

otherwise you’ll need to dig into it with a path that looks like this

`cd /Users/RobDodson/.rvm/gems/ruby-1.9.3-p125@my-new-gemset/gems`

Now if you type `ls` you should see your version of nokogiri. Let’s pause for a moment and consider what just happened. If you use Ruby Gems without RVM then everything will be installed in the system folder. If we wanted to have 2 different versions of nokogiri we would need to make sure that there wasn’t any kind of conflict in our gems directory. Since we’re using RVM to manage our gems, we’re able to tell Ruby Gems to put one version of nokogiri in the ‘my-new-gemset’ directory and another version in the ‘some-other-gemset’ directory. This is a great feature, especially when you want to try out an upgrade or a different version of a particular library. Rather than having to uninstall your working gem, you can just create a new gemset. If things blow up then you can throw it away and revert back to the previous gemset.

Lets make another gemset and this time install a new instance of Rails.

```bash
rvm create gemset my-new-rails-setup
rvm 1.9.3@my-new-rails-setup
gem install rails
```

Now lets go into the folder for that gemset. Again the path should look similar to this:

`cd /Users/RobDodson/.rvm/gems/ruby-1.9.3-p125@my-new-rails-setup/gems`

Type `ls` this time and you’ll see _WAY_ more gems. Imagine that we wanted to test our application on a different version of Rails. Managing all those gems in one directory would be a huge pain but thankfully RVM is taking care of that for us. If we decide that this version of rails is not for us we can just delte the gemset with:

```bash
rvm gemset delete my-new-rails-setup
```

And recreate it however we want :D

That wraps it up for today. If you have any questions you can post a comment or hit me up on twitter [@rob_dodson](http://twitter.com/robdodson).

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
