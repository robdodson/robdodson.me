---
title: Object Oriented Scraper Backed with Tests Pt. 4
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
  - FakeWeb
date: 2012-05-11T14:20:00.000Z
updated: 2014-12-30T07:10:14.000Z
---

Continuing from our [previous post](http://robdodson.me/blog/2012/05/08/object-oriented-scraper-backed-with-tests-pt-3/) we're going to keep working on our `Crawler` and our specs to see if we can start pulling real data from our site.

The first thing I did this morning was to run my tests:

    bundle exec rspec spec/
    
    ..............
    
    Finished in 0.01271 seconds
    14 examples, 0 failures
    

As someone totally new to TDD/BDD this is kind of an awesome feeling. I left my code for a few days and now I can come back and verify that everything still works. We can take it even further and run rspec with a documentation formatter to get some pretty printed output:

    bundle exec rspec spec/ -cf d
    
    Tentacles::Crawler
      constructors
        #from_uri
          should respond
          should return an instance
      instances
        should respond to #get_words_by_selector
        should respond to #get_metadata_by_selector
    
    Tentacles::Options
      should respond to #uri
      should respond to #post_selector
      should respond to #metadata_selector
      #initialize
        when parsing the URI
          when URI is valid
            should display the right URI
          when URI is invalid
            should raise an exception
          when URI does not contain a scheme
            should raise an IO exception
          when URI does not contain a host
            should raise an IO exception
    
    Tentacles::Runner
      should respond to #run
      when parsing the config file
        should raise an error if the config file is missing
        should raise an error if the config file is invalid
    
    Finished in 0.01359 seconds
    14 examples, 0 failures
    

In rspec the `-c` flag enables color in the output. The `-f` flag sets a formatter and `d` specifies the documentation format.

    -f, --format FORMATTER           Choose a formatter.
                                           [p]rogress (default - dots)
                                           [d]ocumentation (group and example names)
                                           [h]tml
                                           [t]extmate
                                           custom formatter class name
    

Neat.

In `crawler_spec.rb` I'm going to add a test that checks to see if our instance has actually stored the content from our mocked web request.

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
    
        context "post-construct" do
          it "should have the right document" do
            @crawler.doc.content.should =~ /Hello World! Hello San Francisco!/
          end
        end
      end
    end
    

I want to write a test to parse the content for keywords but I realize now that our FakeWeb request returns a string without any classes or id's. Gotta go back and wrap it in some HTML to match our selectors. So I'm changing the mock web request to look like this:

    # Create a mock web request
        FakeWeb.register_uri(:get, @options[:uri],
                             :body => '<div class="' + @options[:post_selector] + '">Hello World! Hello San Francisco!</div>')
    

### Hello Hello Hello World!

After a lot of back and forth I finally get my test to pass. I realize along the way that there are a bunch of things I need to change. For starters having most of my words be the same count doesn't really help me to validate that my keyword counting is working all that well. So I'm changing our FakeWeb request and the subsequent specs which test against it.

    # Create a mock web request
        FakeWeb.register_uri(:get, @options[:uri],
                             :body => '<div class="' + @options[:post_selector].delete(".") + '">Hello Hello Hello World World Foobar!</div>')
    

        context "post-construct" do
          it "should have the right document" do
            @crawler.doc.content.should =~ /Hello Hello Hello World World Foobar!/
          end
        end
    

Next I need to make sure that my `get_words_by_selector` method is accepting a selector.

    def get_words_by_selector(selector)
          entries = doc.css('div.entry-content')
          entries.each do |entry|
            words = words_from_string(entry.content)
            count_frequency(words)
          end
    
          sorted = @counts.sort_by { |word, count| count }
          sorted.reverse!
          sorted.map { |word, count| "#{word}: #{count}"}
        end
    

I also realize that I'd like my Array of keywords to be in desceding order so I `reverse` it after the initial sort.

Next I'm going to write the test to verify that we've received a group of words, counted them up and tossed them into an Array in descending order:

        describe "#get_words_by_selector" do
          it "should produce an Array of keywords" do
            expected_array = ['hello: 3', 'world: 2', 'foobar: 1']
            actual_array = @crawler.get_words_by_selector(@options[:post_selector])
            actual_array.should eq(expected_array)
          end
        end
    

I actually wrote the test first and did everything else to make it pass. But at this point it should all be passing and we can verify that given a request with the appropriate selector we should be able to build a basic word frequency list. Yay!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Calm, Awake, Curious
- Sleep: 7
- Hunger: 4
- Coffee: 0
