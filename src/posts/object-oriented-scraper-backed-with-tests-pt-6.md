---
title: Object Oriented Scraper Backed with Tests Pt. 6
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
  - BDD
date: 2012-05-13T14:52:00.000Z
updated: 2014-12-30T07:19:31.000Z
exclude: true
---

Yesterday we verified that our `Crawler` was able to hit a document and, given the right selector, pull down a list of words and their frequency on the page. We also created a custom exception to be used whenever the selector fails to pull down the right content. I'm going to repeat this process today with the `get_metadata_by_selector`. If there's time we'll try to output another file with our data, otherwise that'll be tomorrow's homeworkd :D

Let's take a moment to look at today's metadata to figure out what we'd like our output to reflect.

    - Time: 8:03 am
    - Mood: Happy, Drowsy, Peaceful
    - Sleep: 5.5
    - Hunger: 3
    - Coffee: 0

That's the actual markdown that goes into the editor but it gets converted into a `ul`. I don't _think_ you can pass a CSS class to markdown syntax otherwise I'd use one here. We could go back and wrap everything in regular HTML tags but since we know that our metadata is going to be the last ul per entry we'll just use that knowledge to build our selector. Obviously a more robust solution would use a CSS class so that might be a good refactoring for the future.

I figure for now we'll just parse the metadata into a Hash that'll look something like this:

```ruby
{
  datetime: 2012-05-13T08:03:00-07:00,
  mood: ['Happy', 'Drowsy', 'Peaceful'],
  sleep: 5.5,
  hunger: 3.0,
  coffee: 0.0
}
```

In the final iteration we'll toss all of our Metadata Hashes into an ordered Array so we can visualize them over time.

### Red, Green, Refactor

Ok, time for a failing test. Let's make sure that our selector pulls something down and if it doesn't we should raise the custom `SelectionError` we defined yesterday. I'm already seeing some repetitive code in our Crawler so I'm refactoring it. Where we need to get a group of XML nodes from the document via selector I've created a private helper called `nodes_by_selector`. This is also where we'll raise our exception if nothing came back. I'm also cleaning up some of the word cruff from our public API so instead of `get_words_by_selector` it's not just `words_by_selector`. The same goes for our metadata method.

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

    def words_by_selector(selector)
      nodes = nodes_by_selector(selector)
      nodes.each do |node|
        words = words_from_string(node.content)
        count_frequency(words)
      end

      sorted = @counts.sort_by { |word, count| count }
      sorted.reverse!
      sorted.map { |word, count| "#{word}: #{count}"}
    end

    def metadata_by_selector(selector)
      nodes = nodes_by_selector(selector)
    end

  private

    def nodes_by_selector(selector)
      nodes = doc.css(selector)
      raise Tentacles::SelectionError,
        'The selector did not return an results!' if nodes.empty?
      nodes
    end

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

Going back to the tests we need to refactor a bit for any place that's been broken. Immediately I saw that my `nodes_by_selector` method was not initially returning the nodes so I added that back in. The tests brought that to my attention before I had to do any potentially painful debugging. Beyond that we just need to fix up our method names:

```ruby
require_relative '../lib/tentacles/crawler'
require 'fakeweb'

describe Tentacles::Crawler do

  before do
    # Create a mock options object
    @options = {
      uri: 'http://robdodson.me',
      post_selector: '.entry-content',
      metadata_selector: '.personal-metadata'
    }

    # Create a mock web request
    FakeWeb.register_uri(:get, @options[:uri],
                          :body => '<div class="' + @options[:post_selector].delete(".") +
                          '">Hello Hello Hello World World Foobar!</div>')
  end

  describe "constructors" do
    describe "#from_uri" do
      it "should respond" do
        Tentacles::Crawler.should respond_to(:from_uri)
      end

      it "should return an instance" do
        crawler = Tentacles::Crawler.from_uri(@options[:uri])
        crawler.should be_an_instance_of(Tentacles::Crawler)
      end
    end
  end

  describe "instances" do
    before do
      @crawler = Tentacles::Crawler.from_uri(@options[:uri])
    end

    subject { @crawler }

    it { should respond_to(:words_by_selector) }
    it { should respond_to(:metadata_by_selector) }

    context "post-construct" do
      it "should have the right document" do
        @crawler.doc.content.should =~ /Hello Hello Hello World World Foobar!/
      end
    end

    describe "#words_by_selector" do
      it "should produce an Array of keywords" do
        expected_array = ['hello: 3', 'world: 2', 'foobar: 1']
        actual_array = @crawler.words_by_selector(@options[:post_selector])
        actual_array.should eq(expected_array)
      end

      it "should raise an exception if nothing was returned" do
        expect { @crawler.words_by_selector('some-gibberish-selector') }.to raise_error(Tentacles::SelectionError, 'The selector did not return an results!')
      end
    end

    describe "#metadata_by_selector" do
      it "should raise an exception if nothing was returned" do
        expect { @crawler.metadata_by_selector('some-gibberish-selector') }.to raise_error(Tentacles::SelectionError, 'The selector did not return an results!')
      end
    end
  end
end
```

We've got a duplicate test in there where both `#words_by_selector` and `#metadata_by_selector` are checking that they both raise an exception if nothing comes down. Let's see if we can refactor those into an RSpec shared example. I'm not sure if this is a best practice or not but here's my implementation:

```ruby
shared_examples_for "all selector methods" do
  describe "when selection has no nodes" do
    it "should raise an exception" do
      expect { @crawler.send(selector_method, 'some-gibberish-selector') }.to raise_error(Tentacles::SelectionError, 'The selector did not return an results!')
    end
  end
end

### ...

describe "#words_by_selector" do
  it_behaves_like "all selector methods" do
    let(:selector_method) { :words_by_selector }
  end

# ...

end

describe "#metadata_by_selector" do
  it_behaves_like "all selector methods" do
    let(:selector_method) { :metadata_by_selector }
  end
end
```

Basically we're putting our method name as a symbol into a variable using `let` and then calling that method in the shared_examples_for block. Notice how we're using `@crawler.send(selector_method, ...)`? In this case `selector_method` refers to our method name symbol.

If you run this in RSpec's nested mode it looks pretty cool:

```bash
    Tentacles::Crawler
      constructors
        #from_uri
          should respond
          should return an instance
      instances
        should respond to #words_by_selector
        should respond to #metadata_by_selector
        post-construct
          should have the right document
        #words_by_selector
          should produce an Array of keywords
          behaves like all selector methods
            when selection has no nodes
              should raise an exception
        #metadata_by_selector
          behaves like all selector methods
            when selection has no nodes
              should raise an exception
```

Ok, so we know that all of our selector methods raise the proper exception if they are called with a bunk selector. Now let's make sure we can get our metadata downloaded and structured.

Unfortunately I'm realizing that if the `ul` for our metadata is part of the post then those words get counted along with everything else, which is not what I want. I need to figure out how to exclude that content...

I could either tell my crawler to explicitly ignore that content or wrap my blog entry in an even more specific class and just select that. I guess that'll be an exercise for tomorrow :\

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Happy, Drowsy, Peaceful
- Sleep: 5.5
- Hunger: 3
- Coffee: 0
