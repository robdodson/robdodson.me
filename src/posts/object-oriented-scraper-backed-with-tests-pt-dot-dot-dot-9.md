---
title: Object Oriented Scraper Backed With Tests Pt...9?
tags:
  - Ruby
  - Chain
  - RSpec
date: 2012-06-18T05:43:00.000Z
updated: 2015-01-02T08:54:25.000Z
---

I just spent a few hours talking to my friend [Derek](http://derekbradley.com/)([@derekebradley](https://twitter.com/#!/derekebradley)) about Ruby and it occured to me that I never finished this scraper project. We got awfully far with it but then it kind of died on the vine. [Thankfully,](http://robdodson.me/blog/2012/05/06/object-oriented-scraper-backed-with-tests/)[I](http://robdodson.me/blog/2012/05/07/object-oriented-scraper-backed-with-tests-pt-2/)[wrote](http://robdodson.me/blog/2012/05/08/object-oriented-scraper-backed-with-tests-pt-3/)[it](http://robdodson.me/blog/2012/05/11/object-oriented-scraper-backed-with-tests-pt-4/)[all](http://robdodson.me/blog/2012/05/12/object-oriented-scraper-backed-with-tests-pt-5/)[down.](http://robdodson.me/blog/2012/05/13/object-oriented-scraper-backed-with-tests-pt-6/)[down.](http://robdodson.me/blog/2012/05/15/object-oriented-scraper-backed-with-tests-pt-7/)[down.](http://robdodson.me/blog/2012/05/16/object-oriented-scraper-backed-with-tests-pt-8/)

The fact of the matter is I didn't know where to take the data. I didn't have a design or a layout that I could put it all into. I want to change all that. I want to turn this into something useful. But first I have to make sense of all the code that was written so many weeks ago.

## Tests as documentation...bullshit.

Ok ok. I should say it's _total_ bullshit to call your tests the documentation because they are helpful. But the fact of the matter is you can get so crafty with RSpec that it makes the tests difficult to read in a useful way. I'm not saying they're illegible, it's just that they leverage features which adds to their thought deficit. Before you go off saying that I wrote them wrong and tests should be all the documentation you need...shutup. They're helpful but I would love it if I had written a bit of Markdown Readme to go with all this...

## Explain yourself

Let's see if I can regurgitate what this thing currently does in plain English.

- There's a config.yml file. It says what page to scrape, what the CSS selector for a post looks like and what the CSS selector for metadata looks like. The metadata is the list at the bottom of every page listing the time, amount of sleep, coffee, etc.

- There's a command line object, `tentacles`. It initiates `runner.rb`. `Runner` creates an instance of `Options`. `Options` loads the config.yml file and parses it, turning its properties into members of the options object.

- It actually doesn't do anything else beyond that. `runner.rb` stops right there but we have Rspec tests which fake data and check to see if our other classes work. Those other classes are...

- `crawler.rb` should be the real meat of our program. Funny, seeing as how I wrote all this, that I totally can't remember who does what...

- `crawler.rb` has two primary methods: `words_by_selector` and `metadata_by_selector`.

- `words_by_selector` returns an array of words and the number of times they've occurred. This array should be in order from most used to least used.

- `metadata_by_selector` returns the content of one of our metadata lists.... I think.

## Make it work

With Tim Gunn's mantra we're gonna make this thing work. The tests verify that everything should be at least somewhat functioning. Since I'm a little drunk I can't do a _super_ deep dive but let's see if we can get our runner to write out the contents of `words_by_selector` to a text file.

```ruby
require 'yaml'
require_relative 'options'
require_relative 'crawler'

module Tentacles
  class Runner

    def initialize(config)
      @options = Tentacles::Options.new(config)
    end

    def run
      @crawler = Tentacles::Crawler.from_uri(@options.uri)
      output = @crawler.words_by_selector(@options.post_selector, 'ul:last-child')
      File.open("output.txt", "w") do |file|
        output.each do |line|
          file.puts line
        end
      end
    end
  end
end
```

To get this working I `cd` into the lib/ folder where all the code lives and do an `irb -I .` so I can require the local files.

```ruby
require 'runner'
runner = Tentacles::Runner.new('config.yml')
runner.run
```

After doing that we _do_ get a text file, with copy that looks somewhat correct...

```bash
we: 8
to: 8
npm: 6
should: 5
package: 4
our: 4
compliment: 4
git: 3
0: 3
4: 3
need: 3
2: 3
it: 3
node_modules: 3
the: 3
have: 3
be: 3
json: 2
your: 2
any: 2
dependencies: 2
module: 2
and: 2
node: 2
add: 2
xml2json: 2
how: 2
s: 2
in: 2
you: 2
json1: 2
an: 2
3: 2
awesome: 2
version: 2
```

It looks like the copy from my most recent blog post, plus or minus a few words. Horrible regex aside it _kinda_ works and that's what we're after. Maybe tomorrow we can turn it into some JSON :D Till then. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Drunk, Sleepy
- Sleep: 3
- Hunger: 4
- Coffee: 1
