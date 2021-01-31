---
title: Wrapping up the Word Count Spider
tags:
  - Ruby
  - Chain
date: 2012-06-22T07:31:00.000Z
updated: 2014-12-31T00:13:45.000Z
---

Yeesh, I gotta stop writing so late at night... Last night I was trying to get my spider to follow all the links on the blog's archive page and then sum up all the words from every post. Unfortunately I was way too tired to get that to actually work. Tonight I finished that step of the process but it required some ugly code and refactoring our unit tests. Without further adieu...

    require 'yaml'
    require 'json'
    require_relative 'options'
    require_relative 'crawler'
    
    module Tentacles
      class Runner
    
        def initialize(config)
          @options = Tentacles::Options.new(config)
          @path = File.dirname(__FILE__) + '/../../output/'
          @filename = 'word_count.json'
        end
    
        def run      
          @crawler = Tentacles::Crawler.from_uri(@options.uri)
          output = @crawler.words_by_selector(@options.post_selector, @options.ignored_post_selector)
    
          Dir.mkdir(@path) unless Dir.exists?(@path)
          
          File.open(@path + @filename, "w") do |file|
            file.puts JSON.pretty_generate(output)
          end
        end
      end
    end
    

    require 'open-uri'
    require 'nokogiri'
    require 'mechanize'
    
    module Tentacles
      class Crawler
    
        attr_reader :doc
    
        def self.from_uri(uri)
          new(uri)
        end
    
        def initialize(uri)
          # Create a new instance of Mechanize and grab our page
          @agent = Mechanize.new
    
          @uri = uri
          @page = @agent.get(@uri)
          @counts = Hash.new(0)
        end
    
        def words_by_selector(selector, ignored_selector = nil)
          # Get all the links on the page
          post_links = @page.links.find_all { |l| l.attributes.parent.name == 'h1' }
          post_links.shift # Get rid of the first anchor since it's the site header
          post_links.each do |link|
            post = link.click
            @doc = post.parser
            nodes = nodes_by_selector(selector)
            nodes.each do |node|
              if ignored_selector
                ignored = node.css(ignored_selector)
                ignored.remove()
              end
              words = words_from_string(node.content)
              count_frequency(words)
            end
          end
    
          sorted = @counts.sort_by { |word, count| count }
          sorted.reverse!
          sorted.map! do |word, count|
            { word: word, count: count }
          end
          { word_count: sorted }
        end
    
        def metadata_by_selector(selector)
          node = nodes_by_selector(selector).first
          metadata = {}
          node.children.each do |child|
            child.content
          end      
        end
    
      private
    
        def nodes_by_selector(selector)
          nodes = @doc.css(selector)
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
    

One of the first things I realized what that my paths to the output folder were getting all weird depending on the context in which I was running my tests. So I switched to using Ruby's `__FILE__` to create paths relative to our crawler. `words_by_selector` is kind of gross with some nested iterators but whatever, it works. We will probably need to refactor it when we get the metadata spider working. For now I'm just glad that it actually visits all the pages and produces the right output.

    require_relative '../lib/tentacles/runner'
    require 'helpers'
    require 'fakeweb'
    
    describe Tentacles::Runner do
      include Helpers
    
      before do
        @runner = Tentacles::Runner.new(relative_path + '/../lib/tentacles/config.yml')
    
        # Create a mock options object
        @options = {
          uri: 'http://robdodson.me/blog/archives',
          post_selector: '.entry-content',
          ignored_post_selector: 'ul:last-child',
          metadata_selector: '.entry-content ul:last-child'
        }
        @path = File.dirname(__FILE__) + '/../output/'
        @filename = 'word_count.json' 
      end
    
      subject { @runner }
    
      it { should respond_to(:run) }
    
      describe "when parsing the config file" do
        it "should raise an error if the config file is missing" do
          expect { runner = Tentacles::Runner.new('') }.to raise_error(Errno::ENOENT)
          expect { runner = Tentacles::Runner.new(nil) }.to raise_error(TypeError)
        end
    
        it "should raise an error if the config file is invalid" do
          expect { runner = Tentacles::Runner.new(relative_path + '/mocks/invalid_yaml.yml') }.to raise_error(Psych::SyntaxError)
        end
    
        it "should create a directory for our output" do
          @runner.run
          Dir.exists?(@path).should be_true
        end
    
        it "should output the correct JSON" do
          @runner.run
          File.open(@path + @filename) do |file|
            file.each_line do |line|
              puts line
            end
          end
        end
      end
    end
    

Our spec also needed updating so it could find the output directory properly. One downside to our current hacked-together setup is that I haven't produced a proper mock for things so the test takes FOREVER to run. Something like 30+ seconds because it's actually crawling our site instead of just hitting a dummy file. Definitely need to fix that at some point :)

But once we get it all working the output from robdodson.me ends up looking like this:

    {
      "word_count": [
        {
          "word": "the",
          "count": 1678
        },
        {
          "word": "to",
          "count": 1548
        },
        {
          "word": "a",
          "count": 1023
        },
        {
          "word": "i",
          "count": 792
        },
        {
          "word": "it",
          "count": 730
        },
        {
          "word": "and",
          "count": 718
        },
        {
          "word": "this",
          "count": 661
        },
        {
          "word": "of",
          "count": 658
        },
        {
          "word": "you",
          "count": 640
        },
        {
          "word": "that",
          "count": 585
        },
        {
          "word": "we",
          "count": 569
        }
    ... .
    

We can use that JSON to start graphing which I'll hopefully have time to get into before going to Europe. We shall seeeeee. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired
- Sleep: 6
- Hunger: 0
- Coffee: 1
