---
title: Object Oriented Scraper Backed With Tests pt. 2
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
date: 2012-05-08T01:48:00.000Z
updated: 2014-12-30T06:58:01.000Z
---

I'm picking up from where I left off last night. If you look back at the [previous post](/blog/2012/05/06/object-oriented-scraper-backed-with-tests/) we ended with a spec'd out `Runner` object. Now we need to build our `Crawler` which will slurp up all the content from our posts and return them as meaningful data.

Our Crawler will have 2 main responsibilities. First it will iterate over a post and return a Hash of words and their usage count. Second, it will iterate over a post and pull out any metadata and associate that with a Date. These are rather simple goals and if you remember from our original scraper we were actually hitting every post on the main page. I think I'd like to nail down these simple functions and then refactor the Crawler to accept a corpus page full of links—[like our archives page](http://robdodson.me/blog/archives/)—which it will follow and parse. Right now I want to start small.

Here's a list of what I _think_ would be good tests for our `Crawler`.

- It should return an instance in exchange for a valid URI. Since the URI comes from the Runner and that's already being tested we'll assume that the URI we're given is valid.
- It should respond to a `get_word_counts` method.
- The get_word_counts method should accept a selector `String` and return a `Hash` of words and their counts. Since the selector will be coming from the Runner we'll assume it's valid too but first we'll need to put another test in our `runner_spec.rb`.
- It should respond to a `get_metadata` method.
- The get_metadata method should also accept a selector `String` and return a `Hash` with a valid `Date` and each piece of metadata categorized. Let's see how far we can take this by converting strings related to time into `Time` objects and any categories with multiple entries into `Arrays`.

I'm actually going to copy and paste the above list into my specs and start buliding from there.

....

Hmm... actually I'm not. Something about this doesn't feel right. `Runner` has accrued too much responsibility. It's supposed to validate 3 different strings parsed from a YAML file which it loads and then it also has to deal with creating and running the `Crawler`. I think it's time for another object. Which we'll call `Options`. Options will be in charge of loading our YAML and verifying that all the values are valid. `Runner` will create both an Options and a Crawler object and pass the values from Options to Crawler. This is actaully also in line with the Pickaxe book's Anagrams example, so we have a nice guide to follow in that.

OK so `Options`, eh? Well we'll need to spec out its responsibilities. I think we can just take the tests we wrote for Runner and move them over to Options.

After doing this for while I've ended up with a TON of tests...only to validate 3 variables.

```ruby
require_relative '../lib/tentacles/options'
require 'yaml'
require 'uri'
require 'helpers'

describe Tentacles::Options do
  include Helpers

  before do
    @options = Tentacles::Options.new(relative_path + '/../lib/tentacles/config.yml')
  end

  subject { @options }

  it { should respond_to(:uri) }
  it { should respond_to(:post_selector) }
  it { should respond_to(:metadata_selector) }

  describe "when parsing the config file" do
    it "should raise an exception if the config file is missing" do
      expect { options = Tentacles::Options.new('') }.to raise_error(Errno::ENOENT)
      expect { options = Tentacles::Options.new(nil) }.to raise_error(TypeError)
    end

    it "should raise an exception if the config file is invalid" do
      expect { options = Tentacles::Options.new(relative_path + '/mocks/invalid_yaml.yml') }.to raise_error(Psych::SyntaxError)
    end
  end

  describe "when parsing the URI" do
    it "should display the right URI" do
      uri = URI.parse('http://robdodson.me')
      @options.uri.should eq(uri)
    end

    it "should raise an exception if uri is empty" do
      expect { options = Tentacles::Options.new(relative_path + '/mocks/blank_uri.yml') }.to raise_error(Psych::SyntaxError)
    end

    it "should raise an exception if uri is invalid" do
      expect { options = Tentacles::Options.new(relative_path + '/mocks/invalid_uri.yml') }.to raise_error(Psych::SyntaxError)
    end
  end

  describe "when parsing the post selector" do
    it "should have a post_selector" do
      @options.post_selector.should be('.entry-content')
    end

    it "should raise an exception if the post selector is empty" do
      expect { options = Tentacles::Options.new(relative_path + '/mocks/blank_uri.yml') }.to raise_error(Psych::SyntaxError)
    end
  end

  describe "when parsing the metadata selector" do
    it "should have a metadata_selector" do
      @options.metadata_selector.should be('.personal-metadata')
    end

    it "should raise an exception if the metadata selector is empty" do
      expect { options = Tentacles::Options.new(relative_path + '/mocks/blank_uri.yml') }.to raise_error(Psych::SyntaxError)
    end
  end
end
```

Here's my implementation of `options.rb`

```ruby
require 'yaml'

module Tentacles
  class Options

    attr_reader :uri
    attr_reader :post_selector
    attr_reader :metadata_selector

    def initialize(config)
      @config = YAML.load(File.open(config))

      @uri = URI.parse(@config[:uri])
      raise IOError, 'invalid uri!' if @uri.scheme.nil? || @uri.host.nil?

      @post_selector = @config[:post_selector]
      raise IOError, 'post_selector is not defined' if @post_selector.empty?

      @metadata_selector = @config[:metadata_selector]
      raise IOError, 'metadata_selector is not defined' if @metadata_selector.empty?
    end
  end
end
```

Seems like now might be a good time to pause for a bit. When I look at those tests I see a lot of places where I'm testing Classes that have probably already been tested. I feel like you can safely assume that if you pass `YAML.load` a bunch of junk it's going to throw an error. Is there any value in testing something like that for my own implementation? I'm guessing not. However I do think it's important that I test the 3 exceptions that I wrote. I'll get all the tests to pass and then I'll go back and clean it up.

### Making the Tests Pass

I like to comment out my spec file and go line by line making each test pass as I go. I'm pretty good at writing failing tests (heh) so this approach adheres well to the red, green, refactor mantra.

Starting out I have a problem in the first block which checks my `attr_readers`:

```ruby
it { should respond_to(:uri) }
it { should respond_to(:post_selector) }
it { should respond_to(:metadata_selector) }
```

Let's see if I can get just the first test to pass... I comment out everything inside of Options and notice that YAML does not use symbols for keys. It seems like loaded YAML uses Strings for keys. After changing my symbol keys to strings my first block of tests pass.

```ruby
require 'yaml'

module Tentacles
  class Options

    attr_reader :uri
    attr_reader :post_selector
    attr_reader :metadata_selector

    def initialize(config)
      @config = YAML.load(File.open(config))

      @uri = URI.parse(@config["uri"])
      raise IOError, 'invalid uri!' if @uri.scheme.nil? || @uri.host.nil?

      @post_selector = @config["post_selector"]
      raise IOError, 'post_selector is not defined' if @post_selector.empty?

      @metadata_selector = @config["metadata_selector"]
      raise IOError, 'metadata_selector is not defined' if @metadata_selector.empty?
    end
  end
end
```

The next block passes quite easily because it's ported over from the `Runner` class

```ruby
describe "when parsing the config file" do
  it "should raise an exception if the config file is missing" do
    expect { options = Tentacles::Options.new('') }.to raise_error(Errno::ENOENT)
    expect { options = Tentacles::Options.new(nil) }.to raise_error(TypeError)
  end

  it "should raise an exception if the config file is invalid" do
    expect { options = Tentacles::Options.new(relative_path + '/mocks/invalid_yaml.yml') }.to raise_error(Psych::SyntaxError)
  end
end
```

After that we run into some issues because our next set of tested exceptions have the wrong class.

```ruby
describe "when parsing the URI" do
  it "should display the right URI" do
    uri = URI.parse('http://robdodson.me')
    @options.uri.should eq(uri)
  end

  it "should raise an exception if uri is empty" do
    expect { options = Tentacles::Options.new(relative_path + '/mocks/blank_uri.yml') }.to raise_error(Psych::SyntaxError)
  end

  it "should raise an exception if uri is invalid" do
    expect { options = Tentacles::Options.new(relative_path + '/mocks/invalid_uri.yml') }.to raise_error(Psych::SyntaxError)
  end
end
```

Changing the last two exceptions to expect `Errno::ENOENT` and `URI::InvalidURIError` in that order fixes things and we're all green again.

In the next block we have 2 failing tests because the first one is using improper syntax. Instead of `be` we should be using `eq`. Seems like in RSpec `be` is equivalent to `===` and not `==`. Also we have another PSYCH::SyntaxError that needs to be replaced with `Errno::ENOENT`. Here's what we end up with after making those changes:

```ruby
describe "when parsing the post selector" do
  it "should have a post_selector" do
    @options.post_selector.should eq('.entry-content')
  end

  it "should raise an exception if the post selector is empty" do
    expect { options = Tentacles::Options.new(relative_path + '/mocks/blank_uri.yml') }.to raise_error(Errno::ENOENT)
  end
end
```

Ugh, hate to cut it short but looks like I'm going down a rabbit hole with validation. I'll pickup tomorrow to see if we can iron a lot of this out.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Calm, Hot, Tired
- Sleep: 7
- Hunger: 6.5
- Coffee: 0
