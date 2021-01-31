---
title: Object Oriented Scraper Backed with Tests
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
date: 2012-05-07T01:09:00.000Z
updated: 2014-12-30T06:53:11.000Z
---

*I just drank a ton of coffee and I'm blasting music in my headphones so this post my bit a bit more scatter-shot than most since I can't really focus :]*

Yesterday I managed to build a pretty naive scraper using Nokogiri which would count how often each word was used in the first 10 posts of this blog. Basically scraping the home URL of the site and grabbing everything inside of the `div.entry-content` selector.

Today I want to convert it into a more OO library so it's a bit more modular and reusable. I also want to back everything with RSpec tests to get into the practice. While it won't be true TDD I'll try to write the tests for the library before putting the classes together.

### Design Decisions

I'm calling the project `Tentacles` for now since it relates to my Octopress blog. I'm still trying to figure out exactly what the end product will be. So far I know that I want it to produce a page of statistics about my blog. I figure that for now it can be just one page with stats that cover the entire blog. In the future I might want to make it more granular so that each post can get special attention. For now it's easiest for me if I just think of the whole blog as a big data set and this page as the output.

I also know that since Octopress is heavily integrated with Rake that I'd probably like to trigger the process as part of a Rake task. IMO the logical place would be to amend Octopress' `rake generate` so that it not only builds our static pages but it also produces our statistics. Down the line I might want to change this but for now it seems OK to me.

Finally I figure I'll want to have some kind of configuration file so the parser knows what to look for.

For now I'm fine with the output being a plain text file with a few stats on it. We'll work on making the output more robust after we've figure out the basics of our module and integrated it with Rake.

Here's the folder structure I'm using:

- tentacles

- bin      *<--- contains our executable program*
- tentacles

- lib      *<--- contains our library of classes*
- crawler.rb
- config.yml
- runner.rb

- spec      *<--- contains our RSpec tests*
- crawler_spec.rb
- runner_spec.rb

### Playing with IRB

One of the first issues I've run up against is figuring out how to play with my classes in IRB. Being new to Ruby I tend to build everything in one folder. Since this is my first time embarking on some actual modular structure I'm unsure how to require or include a module in IRB. What I've settled on for now is to `cd` into my lib folder and use the `-I` flag to set the `$LOAD_PATH`.

Here's the `grep` from the irb man page.

    -I path        Same as `ruby -I' .  Specifies $LOAD_PATH directory
    

So we end up in `tentacles/lib` and call IRB like so:

    irb -I .
    

And now we can require our classes

    irb -I .
    1.9.3-p125 :001 > require 'runner'
     => true # sweeet
    

### Skeletons

I'm going to create a basic `Runner` class so we can verify that the stuff in IRB is working properly.

Here's what I've thrown together:

    module Tentacles
      class Runner
    
        def initialize(config)
          # Load in our config file
        end
    
        def run
          puts 'run run run!'
        end
    
      end
    end
    

and here's how we test it in IRB.

    irb -I .
    require 'runner'
    
    runner = Tentacles::Runner.new('foo')
     => #<Tentacles::Runner:0x007faeb284ec30> 
    
    runner.run
    run run run!
     => nil 
    

Looks good so far!

### Tests

OK on to the tests then. I'm going to be using RSpec so if you don't have that setup already you should do a `gem install rspec`.

I'm a total noob when it comes to testing so let me take my best stab at this...

I'm going to write tests for `Runner` first since it's already stubbed out. I want to make sure of the following things:

- It should respond to the `run` method
- When I pass it an invalid config file it should throw an error
- When I pass it an empty string or nil in place of config it should throw an error

For now that's the only public API this object has. Pretty simple but of course I'm immediately running into issues. Here's what my spec looks like:

    require_relative '../lib/tentacles/runner'
    
    describe Tentacles::Runner do
    
      before do
        @runner = Tentacles::Runner.new('config.yml')
      end
    
      subject { @runner }
    
      it { should respond_to(:run) }
    
      describe "when passing the config file" do
        it "should raise an error if the config file is missing" do
          expect { runner = Tentacles::Runner.new('') }.to raise_error(Errno::ENOENT)
          expect { runner = Tentacles::Runner.new(nil) }.to raise_error(TypeError)
        end
      end
    end
    

and here's what runner.rb looks like:

    require 'yaml'
    
    module Tentacles
      class Runner
    
        def initialize(config)
          @config = YAML.load(File.open(config))
        end
    
        def run      
          'Runner should be running'
        end
      end
    end
    

aaaaaand here's the error:

    1) Tentacles::Runner 
         Failure/Error: @runner = Tentacles::Runner.new('config.yml')
         Errno::ENOENT:
           No such file or directory - config.yml
         # ./lib/tentacles/runner.rb:10:in `initialize'
         # ./lib/tentacles/runner.rb:10:in `open'
         # ./lib/tentacles/runner.rb:10:in `initialize'
         # ./spec/runner_spec.rb:8:in `new'
         # ./spec/runner_spec.rb:8:in `block (2 levels) in <top (required)>'
    

It looks like the test is bailing out on my `before` block when I try to create an instance of runner and pass it the config file. Folks on IRC are kind enough to point out that `require` and methods run in RSpec don't necessarily have the same scope so trying `../lib/tentacles/config.yml` won't work either. The solution is to use `File.dirname(__FILE__) + '/../lib/tentacles/config.yml'`. Since I don't want my line lengths to get any longer I define a helper module and give it a `relative_path` method which should spit out `File.dirname(__FILE__)`.

    module Helpers
      def relative_path
        File.dirname(__FILE__)
      end
    end
    

After I include it my tests look like this:

    require_relative '../lib/tentacles/runner'
    require 'helpers'
    
    describe Tentacles::Runner do
      include Helpers
    
      before do
        @runner = Tentacles::Runner.new(relative_path + '/../lib/tentacles/config.yml')
      end
    
      subject { @runner }
    
      it { should respond_to(:run) }
    
      describe "when passing the config file" do
        it "should raise an error if the config file is missing" do
          expect { runner = Tentacles::Runner.new('') }.to raise_error(Errno::ENOENT)
          expect { runner = Tentacles::Runner.new(nil) }.to raise_error(TypeError)
        end
    
        it "should raise an error if the config file is invalid" do
          expect { runner = Tentacles::Runner.new(relative_path + '/mocks/invalid_yaml.yml') }.to raise_error(Psych::SyntaxError)
        end
      end
    
    end
    

You'll also notice I added a test for an invalid yml file. Basically I created a mocks folder and tossed in a yaml file that's full of gibberish. Probably not the best way to mock stuff but whatever, i'm learning!

With that all of our tests for `Tentacles::Runner` are passing. Yay! But now it's 10:37pm and I gotta call it a night. We'll continue tomorrow by writing tests for `Tentacles::Crawler`. See ya!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Wired, Lazy
- Sleep: 7.5
- Hunger: 0
- Coffee: 2
