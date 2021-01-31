---
title: Object Oriented Scraper Backed with Tests Pt. 7
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
  - BDD
date: 2012-05-16T04:33:00.000Z
updated: 2014-12-30T07:24:17.000Z
---

During my last post I realized that including my metadata in the blog post as only a ul meant that all the words were being scraped as part of the keyword frequency search. After thinking about it for a while I think I'm going to give the keyword search method an optional value which it can use to ignore or delete certain nodes.

Thankfully I have my tests in place to validate what our final output should look like. Which means I'm basically hacking away at Nokogiri to get things to pass. Here's what I finally settle on:

    def words_by_selector(selector, ignored_selector = nil)
      node = nodes_by_selector(selector).first
      if ignored_selector
        ignored = node.css(ignored_selector)
        ignored.remove()
      end
      words = words_from_string(node.content)
      count_frequency(words)
    
      sorted = @counts.sort_by { |word, count| count }
      sorted.reverse!
      sorted.map { |word, count| "#{word}: #{count}"}
    end
    

I think the code is pretty self explanatory. Moving on to the metadata we expect a Hash that looks like this:

    {
      datetime: 2012-05-13T08:03:00-07:00,
      mood: ['Happy', 'Drowsy', 'Peaceful'],
      sleep: 5.5,
      hunger: 3.0,
      coffee: 0.0
    }
    

As I'm playing back and forth with the metadata selector methods I'm realizing that writing non-brittle tests is extremely difficult!

I'm noticing that some of the metadata, when broken into Strings, don't parse very well. For instance:

`Time: 8:03` splits up into `["Time", " 8", "03"]`

We can use a splat operator to clean that up a bit for us:

    def metadata_by_selector(selector)
      node = nodes_by_selector(selector).first
      metadata = {}
      node.children.each do |child|
        key, *value = child.content.split(':')
        puts "#{key}: #{value}"
      end      
    end
    

The above should produce something like:

    Time: [" 8", "03 am"]
    Mood: [" Happy, Drowsy, Peaceful"]
    Sleep: [" 5.5"]
    Hunger: [" 3"]
    Coffee: [" 0"]
    

Close... but still not perfect. I think the best thing to do would be to write some formatter objects or functions to handle the different kinds of metadata. We'll tackle that tomorrow.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Fat, Tired, Drunk
- Sleep: 6
- Hunger: 0
- Coffee: 1
