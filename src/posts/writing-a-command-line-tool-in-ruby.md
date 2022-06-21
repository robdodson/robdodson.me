---
title: Writing a Command Line Tool in Ruby
tags:
  - Ruby
  - Chain
date: 2012-06-13T14:29:00.000Z
updated: 2014-12-30T23:47:54.000Z
---

Yesterday I tried to do a post on creating your first Ruby Gem as a command line tool. [It didn't go very well.](http://robdodson.me/blog/2012/06/12/messing-around-with-gems/) In an effort to better understand what goes on with command line tools I'm going to start from the most basic, a ruby script that is in our `PATH`.

I've previously added the folder `~/bin` to my PATH so I know that if I drop an executable script in there I should be able to run it by just typing its name. Let's give that a shot. First we'll make a new file just called `sherp` without any file extension. Make sure to `chmod 755 sherpa` so that it's executable. Then we'll add the following:

```bash
#!/usr/bin/env ruby

puts 'I am the sherpa!!!'
```

If I now type `sherpa` into the command line, it should fire back `I am the sherpa!!!`

Ok cool so we've got that part working. Now let's see if we can get some arguments in there. We'll iterate the `ARGV` object to see what comes in.

```bash
#!/usr/bin/env ruby

ARGV.each do |arg|
    puts arg
end
```

With that little bit of code we should be able to pass just about anything to our command and have it echoed back.

```bash
sherpa foo bar baz

=> foo
=> bar
=> baz
```

Ok cool. Now let's step this up a notch or two. Let's say we want to send in commands and options. For that we'll use the built-in [OptionParser](http://ruby-doc.org/stdlib-1.9.3/libdoc/optparse/rdoc/OptionParser.html). Here's [a link to the article I've been following which details how to use the OptionParser.](http://rubylearning.com/blog/2011/01/03/how-do-i-make-a-command-line-tool-in-ruby/) In my case, I'm going to tell `sherpa` to either `say_hello` or `say_goodbye`. When I pass in the `-n` flag it should accept a name, otherwise it will use the name 'Master'. So the line `sherpa say_hello -n Rob` should produce `Hello Rob` and likewise if I left off the option and just used `sherpa say_hello` it should produce `Hello Master`.

Here's the code to accomplish this:

```bash
    #!/usr/bin/env ruby

    require 'optparse'

    options = {}

    opt_parser = OptionParser.new do |opt|
      opt.banner = "Usage: opt_parser COMMAND [OPTIONS]"
      opt.separator  ""
      opt.separator  "Commands"
      opt.separator  "     name: the name the sherpa should use when addressing you"
      opt.separator  ""
      opt.separator  "Options"

      opt.on("-n","--name NAME","tell the sherpa what to call you") do |name|
        options[:name] = name
      end

      opt.on("-h","--help","help") do
        puts opt_parser
      end
    end

    opt_parser.parse!
    name = options[:name] || 'Master'

    case ARGV[0]
    when "say_hello"
      puts "Hello #{name}"
    when "say_goodbye"
      puts "Goodbye #{name}"
    else
      puts opt_parser
    end
```

And there we go, our first command line Ruby tool. I'll pick it up tomorrow to try to improve upon it. We're starting small but at least we have something that works!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Patient
- Sleep: 6
- Hunger: 1
- Coffee: 0
