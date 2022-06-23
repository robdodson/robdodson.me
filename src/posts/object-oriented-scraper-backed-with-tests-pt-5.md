---
title: Object Oriented Scraper Backed with Tests Pt. 5
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
  - FakeWeb
  - BDD
date: 2012-05-12T14:02:00.000Z
updated: 2014-12-30T07:18:03.000Z
exclude: true
---

Last night I got the `Crawler` passing its test for `#get_words_by_selector`. This morning I realize that when someone sends in a junk selector I want to raise an exception of some kind. Since I don't know much about Ruby Exceptions I'm doing a little digging...Ruby has both `throw`/`catch` and `raise`/`rescue` so what's the difference between throw/catch and raise/rescue in Ruby?

### Throwing exceptions for control flow

There's a great guest post by Avdi Grimm on [RubyLearning](http://rubylearning.com/blog/2011/07/12/throw-catch-raise-rescue-im-so-confused/) which covers this topic in depth. To summarize `throw`/`catch` is mainly used when doing _exceptions as control flow_. In other words, if you need to break out of a deeply nested loop or some other expensive operation you can throw an exception symbol which can be caught someone high up the call stack. Initially this rubbed me the wrong way since I know that things like `goto` and `labels` are a bad practice. Someone else raised this point in the comments to which Avid responded:

> There is a fundamental difference between throw/catch and goto. Goto, in languages which support it, pays no attention to the stack. Any resources which were allocated before the goto are simply left dangling unless they are manually cleaned up.

> throw/catch, like exception handling, unwinds the stack, triggering ensure blocks along the way. So, for example, if you throw inside an `open() {…}` block, the open file will be closed on the way up to the catch() block.

### Raising exceptions for everything else

With `throw`/`catch` out of the way that leaves `raise`/`rescue` to handle everything else. I'm willing to bet that 99% of error code should probably be raising exceptions and throw/catch should only be used in situations where you need the control flow behavior. With that knowledge in hand I need to decide between one of Ruby's built-in Exceptions or defining one of my own. Let's define one of our own so we can get that experience under our belt.

### Creating an exception subclass in Ruby

One tip I picked up while doing my research into `raise` and `throw` is that any exception that doesn't subclass StandardError will not be caught by default. Here's an example to illustrate:

```ruby
###
# First we define an exception class which doesn't
# inherit from StandardError. As a result it won't
# be caught by a simple rescue. Instead we would
# need to rescue by its class name
###
class MyBadException < Exception
end

def miss_bad_exception
  raise MyBadException.new
  rescue
  p "I'll never be called :("
end

miss_bad_exception
MyBadException: MyBadException
  from (irb):4:in `miss_bad_exception'
  from (irb):8
  from /Users/Rob/.rvm/rubies/ruby-1.9.3-p125/bin/irb:16:in `<main>

# See that calling the method produces an uncaught exception...


###
# Next we'll subclass StandardError. As a result
# we won't have to explicitly define our class name
# for a rescue to work.
###
class MyGoodException < StandardError
end

def save_good_exception
  raise MyGoodException.new
  rescue
  p "I'm saved! My hero!"
end

save_good_exception
"I'm saved! My hero!"

# Yay! Our exception was caught!
```

We'll call our Exception `SelectorError` to indicate that the provided selector did not return any results. For reference I often refer to [this chart on RubyLearning](http://rubylearning.com/satishtalim/ruby_exceptions.html) when I want to see a list of all the available Exception classes. In our case we'll just inherit from StandardError.

```ruby
module Tentacles
  class SelectionError < StandardError
  end
end
```

I don't think we actually need to do much more than that. The ability to pass a payload message should come from the super class so I think we're good to go. Here's our updated spec:

```ruby
it "should raise an exception if nothing was returned" do
  expect { @crawler.get_words_by_selector('some-gibberish-selector') }.to raise_error(Tentacles::SelectionError, 'The selector did not return an results!')
end
```

Initially the test fails so now we need to update our `Crawler` to check if nothing was returned and raise the custom exception.

Here's our updated `Crawler` with additional require and updated method.

```ruby
require 'open-uri'
require 'nokogiri'
require_relative 'selection_error'

module Tentacles
  class Crawler

    attr_reader :doc

    def self.from_uri(uri)
      new(uri)
    end

    def initialize(uri)
      @uri = uri
      @doc = Nokogiri::HTML(open(@uri))
      @counts = Hash.new(0)
    end

    def get_words_by_selector(selector)
      entries = doc.css(selector)
      raise Tentacles::SelectionError,
        'The selector did not return an results!' if entries.empty?
      entries.each do |entry|
        words = words_from_string(entry.content)
        count_frequency(words)
      end

      sorted = @counts.sort_by { |word, count| count }
      sorted.reverse!
      sorted.map { |word, count| "#{word}: #{count}"}
    end

    def get_metadata_by_selector(selector)
      # TODO
    end

  private

    def words_from_string(string)
      string.downcase.scan(/[\w']+/)
    end

    def count_frequency(word_list)
      for word in word_list
        @counts[word] += 1
      end
      @counts
    end
  end
end
```

All tests passing, we're good to go :)

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Alert, Awake, Anxious
- Sleep: 8
- Hunger: 3
- Coffee: 0
