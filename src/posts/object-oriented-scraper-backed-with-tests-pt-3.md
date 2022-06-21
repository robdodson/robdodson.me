---
title: Object Oriented Scraper Backed With Tests Pt. 3
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
  - FakeWeb
date: 2012-05-09T04:03:00.000Z
updated: 2014-12-30T06:59:53.000Z
---

I did some cleanup this morning on the `Options` class and the `options_spec`, mainly to remove items that seemed like they shouldn't be tested. Here's where I'm currently at:

```ruby
require 'yaml'

module Tentacles
  class Options

    attr_reader :uri
    attr_reader :post_selector
    attr_reader :metadata_selector

    def initialize(config)
      @config = YAML.load(File.open(config))

      @config.each do |key, value|
        raise IOError, "#{key} is undefined!" if key.nil?
      end

      @uri = URI.parse(@config["uri"])
      raise IOError, 'Invalid uri!' if @uri.scheme.nil? || @uri.host.nil?

      @post_selector = @config["post_selector"]
      @metadata_selector = @config["metadata_selector"]
    end
  end
end


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

  describe "#initialize" do
    describe "when parsing the URI" do

      context "when URI is valid" do
        it "should display the right URI" do
          uri = URI.parse('http://robdodson.me')
          @options.uri.should eq(uri)
        end
      end

      context "when URI is invalid" do
        it "should raise an exception" do
          expect { options = Tentacles::Options.new(relative_path + '/mocks/invalid_uri.yml') }.to raise_error(URI::InvalidURIError)
        end
      end

      context "when URI does not contain a scheme" do
        it "should raise an IO exception" do
          expect { options = Tentacles::Options.new(relative_path + '/mocks/no_scheme_or_host_uri.yml') }.to raise_error(IOError)
        end
      end

      context "when URI does not contain a host" do
        it "should raise an IO exception" do
          expect { options = Tentacles::Options.new(relative_path + '/mocks/no_scheme_or_host_uri.yml') }.to raise_error(IOError)
        end
      end
    end
  end
end
```

Previously I was testing against `@config = YAML.load(File.open(config))` to see if it would throw an error when passed `nil` or empty string for the argument. I've since realized that's basically testing [Ruby Core](http://www.ruby-doc.org/core-1.9.3/) to see if it's working as described in the docs...which seems silly to me. Now if I were _handling_ those exceptions and doing something in response, then yeah, I would want to test it. But since I'm allowing the program to explode if you try to load an empty config file I figure it's best to just let the core or stdlib do their thing and assume that it was well tested. Having said that I think we've got decent coverage on `Options` and can move back to the `Runner` and then the `Crawler`.

By the way, if you want a more visual representation of our tests you can run `bundle exec rspec -f html -o index.html` which will generate an html file showing what passed/failed and is still pending.

### Mocking Nokogiri requests with FakeWeb

I was curious if it would be possible to mock the Nokogiri requests from our `Crawler` so I did a bit of googling. It looks like the best options would be either [Artifice](https://github.com/wycats/artifice) or [FakeWeb](http://fakeweb.rubyforge.org/). I'm not super familiar with Rack and I don't want to write a separate app just to mock a few calls so I've decided to go with FakeWeb.

First we add it to our Gemfile

```ruby
source 'https://rubygems.org'

gem 'rspec', '2.9.0'
gem 'nokogiri', '~>1.5.2'
gem 'awesome_print', '~>1.0.2'
gem 'fakeweb', '~>1.3.0'
```

and do the usual `bundle install`. Next we'll stub out our `crawler_spec` and verify that it's at least detecting all the methods on the class.

```ruby
require_relative '../lib/tentacles/crawler'

describe Tentacles::Crawler do

  before do
    # A mock for our options object
    options = {
      uri: 'http://robdodson.me',
      post_selector: '.entry-content',
      metadata_selector: '.personal-metadata'
    }

    @crawler = Tentacles::Crawler.from_uri(options[:uri])
  end

  subject { @crawler }

  it { should respond_to(:get_words_by_selector) }
  it { should respond_to(:get_metadata_by_selector) }

end
```

I also want to verify that my class responds to an alternative constructor. Rather than just saying `Crawler.new` I'd prefer to use `Crawler.from_uri`. It doesn't serve much of a purpose but I think it's a good exercise. Here's the modified test to support it.

```ruby
require_relative '../lib/tentacles/crawler'

describe Tentacles::Crawler do

  describe "constructors" do
    describe "#from_uri" do
      it "should respond" do
        Tentacles::Crawler.should respond_to(:from_uri)
      end

      it "should return an instance" do
        crawler = Tentacles::Crawler.from_uri('http://robdodson.me')
        crawler.should be_an_instance_of(Tentacles::Crawler)
      end
    end
  end

  before do
    options = {
      uri: 'http://robdodson.me',
      post_selector: '.entry-content',
      metadata_selector: '.personal-metadata'
    }

    @crawler = Tentacles::Crawler.from_uri(options[:uri])
  end

  subject { @crawler }

  it { should respond_to(:get_words_by_selector) }
  it { should respond_to(:get_metadata_by_selector) }

end
```

And here is our `Crawler` class based largely on our original Crawler [from the first post.](http://robdodson.me/blog/2012/05/05/building-a-simple-scraper-with-nokogiri-in-ruby/)

```ruby
require 'open-uri'
require 'nokogiri'

module Tentacles
  class Crawler
    def self.from_uri(uri)
      new(uri)
    end

    def initialize(uri)
      @uri = uri
      @doc = Nokogiri::HTML(open(@uri))
      @counts = Hash.new(0)
    end

    def get_words_by_selector(selector)
      entries = doc.css('div.entry-content')
      puts "Parsing #{entries.length} entries"
      entries.each do |entry|
        words = words_from_string(entry.content)
        count_frequency(words)
      end

      sorted  = @counts.sort_by { |word, count| count }
      puts sorted.map { |word, count| "#{word}: #{count}"}
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

If we run the specs now they _should_ pass but they're **EXTREMELY** slow! Just 4 examples takes 6 seconds O_O. Can you spot the source of all that lag? Take a look at what happens inside of `Crawler#initialize`. Notice how it's creating a new Nokogiri doc every time? Since we have a `before` block in our spec that means that each test (after the before) is going out and parsing our website. Let's see if FakeWeb can help us out some.

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
    FakeWeb.register_uri(:get, @options[:uri], :body => "Hello World! Hello San Francisco!")
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

    it { should respond_to(:get_words_by_selector) }
    it { should respond_to(:get_metadata_by_selector) }
  end
end
```

While it's not the prettiest test ever written it does get the job done. 0.00359 seconds for 4 examples _down from 6 seconds!_ That's going to wrap it up for tonight. Tomorrow we'll finish off the spec and the implementation and finally get some data coming down from the live site. Until then!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
