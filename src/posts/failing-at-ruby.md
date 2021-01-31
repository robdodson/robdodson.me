---
title: Failing at Ruby
tags:
  - Ruby
  - Chain
  - Nokogiri
date: 2012-06-23T08:08:00.000Z
updated: 2014-12-31T00:14:41.000Z
---

I'm just getting my ass kicked by Ruby tonight so I don't have much to show. Trying to just get my metadata scraping to output something currently looks like this:

    require 'open-uri'
    require 'nokogiri'
    require 'mechanize'
    require_relative 'selection_error'
    
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
          # Get rid of the first anchor since it's the site header
          post_links.shift 
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
          metadata = { posts: [] }
    
          # Get all the links on the page
          post_links = @page.links.find_all { |l| l.attributes.parent.name == 'h1' }
          # Get rid of the first anchor since it's the site header
          post_links.shift
          post_links.each do |link|
            post = link.click
            @doc = post.parser
            time = @doc.css('time')[0]
            post_data = {}
            post_data[:date] = { date: time['datetime'] }
            post_data[:stats] = []
            nodes = nodes_by_selector(selector)
            nodes.each do |node|
              node.children.each do |child|
                post_data[:stats].push(child.content)
              end                
            end
            metadata[:posts].push(post_data)
          end
          p metadata
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
    

Really ugly code that still doesn't work. My biggest problem with Ruby is that I don't have very good debugging tools and that frustrates the shit out of me. I'm so used to the visual debuggers in the Chrome Dev tools that doing everything with `p` or `puts` is just soul-crushing.

Right now my biggest problem is that data isn't being returned from the spider for whatever reason. This is especially annoying because the operation takes a while to run... I should slim it down but my brain is too tired to re-write the code. I'm kind of hoping for a lucky break. Advice to anyone just starting out in programming, do not do exactly what I'm doing right now.

Ok so after getting my ass totally handed to me by Ruby here's a working version of the spider that grabs the proper metadata.

    require 'open-uri'
    require 'nokogiri'
    require 'mechanize'
    require_relative 'selection_error'
    
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
          # # Get all the links on the page
          # post_links = @page.links.find_all { |l| l.attributes.parent.name == 'h1' }
          # # Get rid of the first anchor since it's the site header
          # post_links.shift 
          # post_links.each do |link|
          #   post = link.click
          #   @doc = post.parser
          #   nodes = nodes_by_selector(selector)
          #   nodes.each do |node|
          #     if ignored_selector
          #       ignored = node.css(ignored_selector)
          #       ignored.remove()
          #     end
          #     words = words_from_string(node.content)
          #     count_frequency(words)
          #   end
          # end
    
          # sorted = @counts.sort_by { |word, count| count }
          # sorted.reverse!
          # sorted.map! do |word, count|
          #   { word: word, count: count }
          # end
          # { word_count: sorted }
        end
    
        def metadata_by_selector(selector)
          metadata = { posts: [] }
          puts 'starting'
          p metadata
          # Get all the links on the page
          post_links = @page.links.find_all { |l| l.attributes.parent.name == 'h1' }
          # Get rid of the first anchor since it's the site header
          post_links.shift
          post_links.each do |link|
            post = link.click
            @doc = post.parser
            time = @doc.css('time')[0]
            post_data = {}
            post_data[:date] = time['datetime']
            post_data[:stats] = []
            nodes = nodes_by_selector(selector)
            nodes.each do |node|
              node.children.each do |child|
                unless child.content.chomp.empty?
                  post_data[:stats].push(child.content)
                end
              end                
            end
            metadata[:posts].push(post_data)
            puts 'post added'
            p metadata
          end
          puts 'returning'
          p metadata
          metadata
        end
    
      private
    
        def nodes_by_selector(selector)
          nodes = @doc.css(selector)
          # raise Tentacles::SelectionError, 
          #   'The selector did not return an results!' if nodes.empty?
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
    

I had to comment out the `Tentacles::SelectionError` because it was throwing and saying it wasn't getting any content with a selector even though it was. Not sure wtf is going on there but I'm sure it has to do with the fact that it's 1:30 a.m. I have a rule that nothing good happens after 11pm when it comes to coding. Tonight has lived up to that. Anyway the above should put out a hash which when converted to JSON looks like this:

    {
      "posts": [
        {
          "date": "2012-06-22T00:31:00-07:00",
          "stats": [
            "Time: 12:31 am",
            "Mood: Tired",
            "Sleep: 6",
            "Hunger: 0",
            "Coffee: 1"
          ]
        },
        {
          "date": "2012-06-21T01:27:00-07:00",
          "stats": [
            "Time: 1:28 am",
            "Mood: Tired, Annoyed",
            "Sleep: 6",
            "Hunger: 0",
            "Coffee: 1"
          ]
        },
        {
          "date": "2012-06-20T00:09:00-07:00",
          "stats": [
            "Time: 12:10 am",
            "Mood: Tired, Introspective",
            "Sleep: 4.5",
            "Hunger: 2",
            "Coffee: 1"
          ]
        },
    ... .
    

I'm pretty certain I could have done this with Node in a fraction of the time if only because Node is much easier to debug with Chrome Dev tools using node-inspector. While I love the Ruby language I definitely do not like debugging it...

Tomorrow I might write some JS to give my brain a break. I'm thoroughly pissed off at Ruby for the evening. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Pissed
- Sleep: 6
- Hunger: 0
- Coffee: 1
