---
title: Building a Simple Scraper with Nokogiri in Ruby
tags:
  - Ruby
  - Chain
  - Nokogiri
date: 2012-05-06T04:08:00.000Z
updated: 2014-12-30T06:50:26.000Z
---

Since I've been talking so much about [D3.js](http://d3js.org/) lately I thought it might be fun to start a little project which combines D3 and Ruby. The idea is to build a very simple page scraper that counts how often certain words are used in each post. I've also decided to start adding a little block of metadata at the end of each post so I can graph that over time as well.

So how do we get started? Well first we'll need to build a page scraper of some kind. This program will have to consume the contents of an HTML page, find the node that contains our blog post and count up how often each word reoccurs. For right now that should be more than enough to get us started. We'll look at grabbing the metadata and drawing graphs in future posts. I should point out that this idea was inspired by the wonderful site [750words.com](http://smarterware.org/5359/taking-on-the-750-words-march-challenge) which creates [a beautiful exploration section](http://smarterware.org/5359/taking-on-the-750-words-march-challenge) any time you write a new journal entry. Definitely check out that site, it's amazing.

### Hello Noko

I decided early on that I wanted the scraper to use [Nokogiri](http://nokogiri.org/) because I've heard so much about it. As the authors describe it:

> Nokogiri (鋸) is an HTML, XML, SAX, and Reader parser. Among Nokogiri’s many features is the ability to search documents via XPath or CSS3 selectors.

Using CSS selectors means that working with Nokogiri is a lot like working with jQuery. Here's a quick demonstration:

```ruby
require 'open-uri'
require 'nokogiri'

doc = Nokogiri::HTML(open('https://www.google.com/search?q=unicorns'))

doc.css('h3.r a').each do |link|
  puts link.content
end
```

Easy enough, right? Taking it a step further let's iterate over each element on the page and place them into a `Hash`.

```ruby
require 'open-uri'
require 'nokogiri'

@counts = Hash.new(0)

def words_from_string(string)
  string.downcase.scan(/[\w']+/)
end

def count_frequency(word_list)
  for word in word_list
    @counts[word] += 1
  end
  @counts
end

doc = Nokogiri::HTML(open('http://robdodson.me'))

####
# Search for nodes by css
entries = doc.css('div.entry-content')
puts "Parsing #{entries.length} entries"
entries.each do |entry|
  words = words_from_string(entry.content)
  count_frequency(words)
end

sorted  = @counts.sort_by { |word, count| count }
puts sorted.map { |word, count| "#{word}: #{count}"}
```

The output from this script should look (kind of) like this:

```
...
ruby: 66
rvm: 66
our: 68
can: 71
3: 75
if: 77
for: 82
your: 88
2: 88
is: 91
this: 91
s: 94
we: 95
that: 106
i: 118
in: 119
it: 125
1: 128
and: 149
of: 170
a: 231
you: 233
to: 342
the: 382
```

It looks like our regex could use a bit of work so it doesn't grab singular letters like 's' or numbers, but it's definitely a good start. Tomorrow we'll put everything into a `Module` and back it with tests.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Relaxed, Tired
- Sleep: 6.5
- Hunger: 5
- Coffee: 1
