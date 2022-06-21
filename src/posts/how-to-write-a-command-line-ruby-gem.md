---
title: How To Write a Command Line Ruby Gem
tags:
  - Ruby
  - Chain
date: 2012-06-14T15:17:00.000Z
updated: 2014-12-30T23:54:23.000Z
---

So [yesterday we saw how to setup and run ruby scripts as executables from the command line.](http://robdodson.me/blog/2012/06/13/writing-a-command-line-tool-in-ruby/) While this is pretty rad, it definitely has its limitations. For one, it's not very portable and secondly it just isn't very flexible or powerful. If we stuck with this approach we'd need to write our own semantic versioning, we'd have to setup a way to make sure that all of our required 3rd party gems get installed properly... really it'll just be a big mess if we try to hand-roll it.

Instead we're going to turn to Bundler to help us manage our files and turn our command line tool into a ruby gem. I'm going to start fresh and create a totally new tool, called `zerp`. I don't know what `zerp`'s purpose will be in the long run, but today we're going to make it print some text to verify everything is working.

## New RVM Gemset

Before I do anything with gems I want to make sure I have a cleanroom of sorts. So if anything goes horribly wrong I can just throw everything away and start over. To do this we'll use RVM to create a new gemset.

```bash
rvm gemset create zerp
rvm gemset use zerp
```

If you run `rvm current` you should see something like this: `ruby-1.9.3-p125@zerp`

Now that we have our cleanroom we can template out a new gem.

## Bundle Gem

If bundler is not one of our global gems we can go ahead and install it with `gem install bundler`. You can do `gem list` to see what gems are in your global set.

With Bundler in hand we will generate the boilerplate for our new gem:

`bundle gem zerp`

This will create a new folder called `zerp/` and fill it with several files. `cd` into `zerp/` and take a look around.

```bash
drwxr-xr-x  10 Rob  staff   340B Jun 14 08:38 .
drwxr-xr-x  21 Rob  staff   714B Jun 14 08:38 ..
drwxr-xr-x  11 Rob  staff   374B Jun 14 08:38 .git
-rw-r--r--   1 Rob  staff   154B Jun 14 08:38 .gitignore
-rw-r--r--   1 Rob  staff    89B Jun 14 08:38 Gemfile
-rw-r--r--   1 Rob  staff   1.0K Jun 14 08:38 LICENSE
-rw-r--r--   1 Rob  staff   490B Jun 14 08:38 README.md
-rw-r--r--   1 Rob  staff    48B Jun 14 08:38 Rakefile
drwxr-xr-x   4 Rob  staff   136B Jun 14 08:38 lib
-rw-r--r--   1 Rob  staff   626B Jun 14 08:38 zerp.gemspec
```

Bundler has already setup a git project for us, as well as including a folder structure for our library. [This article from rails-bestpractices.com does a great job of explaining what everything in the boilerplate is.](http://rails-bestpractices.com/blog/posts/8-using-bundler-and-rvm-to-build-a-rubygem)

## Zee Codez!

Our project contains a folder called `lib` which is where we'll store our Ruby code. Open up `lib/zerp.rb`. We'll populate it with an example class called `Chatter` which'll spit out our version of Hello World.

```ruby
require "zerp/version"

module Zerp
  class Chatter
    def say_hello
      puts 'This is zerp. Coming in loud and clear. Over.'
    end
  end
end
```

## Executable

It wouldn't be much of a CLI without an executable. For that we'll need to create a folder called `bin` in the root of our project. Next create a file called `zerp` without any kind of file extension. We're going to require our `Chatter` class and tell it to `say_hello`.

```bash
#!/usr/bin/env ruby

require 'zerp'

chatter = Zerp::Chatter.new
chatter.say_hello
```

The shebang `#!/usr/bin/env ruby` tells the system that it should use Ruby to execute our code. After that we require our 'zerp' module defined previously. Finally we instantiate `Zerp::Chatter` and tell it to `say_hello`. If all goes well it should respond with

```bash
This is zerp. Coming in loud and clear. Over.
```

Let's see if we can make that happen.

## Gemspec

We're going to open the `zerp.gemspec` and make it look like so:

```ruby
# -*- encoding: utf-8 -*-
require File.expand_path('../lib/zerp/version', __FILE__)

Gem::Specification.new do |gem|
  gem.authors       = ["Rob Dodson"]
  gem.email         = ["lets.email.rob@theawesomegmails.com"]
  gem.description   = %q{When a problem comes along..You must zerp it}
  gem.summary       = %q{Now zerp it..Into shape}
  gem.homepage      = "http://robdodson.me"

  gem.files         = `git ls-files`.split($\)
  gem.executables   = ["zerp"]
  gem.test_files    = gem.files.grep(%r{^(test|spec|features)/})
  gem.name          = "zerp"
  gem.require_paths = ["lib"]
  gem.version       = Zerp::VERSION
end
```

The main thing I did was to correct the two 'TODO' entries, and to change the `gem.executables` line from

```ruby
gem.files.grep(%r{^bin/}).map{ |f| File.basename(f) }
```

to

```ruby
gem.executables   = ["zerp"]
```

For reaons unknown to me the previous code wasn't picking up my executable properly so I replaced it with `["zerp"]`. I got the idea from [Project Sprouts which also uses this technique and seems to work fine on my system.](https://github.com/lukebayes/project-sprouts/blob/master/sprout.gemspec)

Alright we're done! Let's test this thing!

## Cross your fingers

To install the Gem we'll use Rake's `install` task. Go ahead and run `rake install` from the root of the project. It should create a `pkg` directory and notify us via the terminal that our gem was installed succesfully. Moment of truth time...type `zerp` into the terminal. If you see `This is zerp. Coming in loud and clear. Over.` then you're good to go. After you've committed everything to Github and setup a RubyGems account you should be able to run `rake release` to send your gem out into the world where it can wow the jaded masses and delight with all its wonders. Good Luck! - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Awake, Antsy
- Sleep: 6
- Hunger: 2
- Coffee: 0
