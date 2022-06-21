---
title: Crawling pages with Mechanize and Nokogiri
tags:
  - Ruby
  - Chain
  - Nokogiri
  - Mechanize
date: 2012-06-20T07:09:00.000Z
updated: 2014-12-31T00:07:12.000Z
---

Short post tonight because I spent so much time figuring out the code. It's late and my brain is firing on about 1 cylinder so it took longer than I expected to get everything working.

The scraper that I'm building is supposed to work like a spider and crawl of the pages of my blog. I wasn't sure what the best way to do that was so I started Googling and came up with [Mechanize.](http://mechanize.rubyforge.org/) There are other tools built on top of Mechanize, like [Wombat](https://github.com/felipecsl/wombat), but since my task is so simple I figured I could just write everything I needed with Mechanize and Nokogiri. It's usually a better idea to work with simple tools when you're first grasping concepts so you don't get lost in the weeds of some high powered framework.

Since it's late I'll let the code do the talking:

```ruby
require 'mechanize'

# Create a new instance of Mechanize and grab our page
agent = Mechanize.new
page = agent.get('http://robdodson.me/blog/archives/')

# Find all the links on the page that are contained within
# h1 tags.
post_links = page.links.find_all { |l| l.attributes.parent.name == 'h1' }

# Click on one of our post links and store the response
post = post_links[1].click
doc = page.parser # Same as Nokogiri::HTML(page.body)
p doc
```

This code is hopefully easy enough to digest. After I get the page I find all of the links which are wrapped inside of an `h1`. Just as an example I `click` a link from the list using Array syntax and store the response in another var. You _could_ click all of the links by iterating through the post_links object, and that's what we'll tackle tomorrow. For now I just follow 1 link and use a convenience method to parse the page with Nokogiri. After that we have a Nokogiri `doc` ready to be manipulated however we see fit.

[Here's a link to the Gist](https://gist.github.com/2958538) if you'd like to tweak or play with the code. Pop it into `irb` and give it a shot. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Tired, Introspective
- Sleep: 4.5
- Hunger: 2
- Coffee: 1
