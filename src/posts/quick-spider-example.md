---
title: Quick Spider Example
tags:
  - Ruby
  - Chain
  - Nokogiri
  - Mechanize
date: 2012-06-21T08:27:00.000Z
updated: 2014-12-31T00:08:09.000Z
---

    require 'mechanize'
    
    # Create a new instance of Mechanize and grab our page
    agent = Mechanize.new
    page = agent.get('http://robdodson.me/blog/archives/')
    
    
    
    # Find all the links on the page that are contained within
    # h1 tags.
    post_links = page.links.find_all { |l| l.attributes.parent.name == 'h1' }
    post_links.shift
    
    
    
    # Follow each link and print out its title
    post_links.each do |link|
        post = link.click
        doc = post.parser
        p doc.css('.entry-title').text
    end
    

Having a horrible time getting anything to run tonight. The code from above is a continuation from yesterday's post except this time we're finding every link on the page, then following that link and spitting out its title. Using this formula you could build something entirely recursive which acts as a full blown spider.

Unfortunately getting this to integrate into the existing app is not working for me tonight. Coding anything after 11 pm is usually a bad call, so I'm going to shut it down and try again in the morning.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Annoyed
- Sleep: 6
- Hunger: 0
- Coffee: 1
