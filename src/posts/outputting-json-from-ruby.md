---
title: Outputting JSON from Ruby
tags:
  - Ruby
  - Chain
  - JSON
date: 2012-06-18T15:19:00.000Z
updated: 2014-12-31T00:05:28.000Z
exclude: true
---

[Last night](http://robdodson.me/blog/2012/06/17/object-oriented-scraper-backed-with-tests-pt-dot-dot-dot-9/) I got the scraper to write an output.txt file which listed all the contents of `words_by_selector`. Today I want to make it write to JSON instead of plain text and I want to back it with some tests.

## Updating our tests

Our current test for `words_by_selector` looks like this:

```ruby
it "should produce the correct Array of keywords" do
  expected_array = ['hello: 3', 'world: 2', 'foobar: 1']
  actual_array = @crawler.words_by_selector(@options[:post_selector], @options[:ignored_post_selector])
  actual_array.should eq(expected_array)
end
```

We're going to need to break that sucker so it'll produce something more like this:

```ruby
it "should produce the correct Hash of keywords" do
  expected_hash = {
      word_count: [
        {
          word: 'hello',
          count: 3
        },
        {
          word: 'world',
          count: 2
        },
        {
          word: 'foobar',
          count: 1
        },
      ]
    }

  actual_hash = @crawler.words_by_selector(@options[:post_selector], @options[:ignored_post_selector])
  actual_hash.should eq(expected_hash)
end
```

And we update `words_by_selector` to look like this:

```ruby
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
  sorted.map! do |word, count|
    { word: word, count: count }
  end
  { word_count: sorted }
end
```

Our new test should pass. Feel free to flip one of the numbers in the expected_hash to 99 or something to see it fail.

Now let's make sure the runner takes the content out of the crawler and writes it to a JSON file.

```ruby
it "should create a directory for our output" do
  @runner.run
  Dir.exists?('../../output').should be_true
end

it "should output the correct JSON" do
  @runner.run
  File.open("../../output/word_count.json") do |file|
    file.each_line do |line|
      puts line
    end
  end
end
```

And in runner.rb...

```ruby
def run
  @crawler = Tentacles::Crawler.from_uri(@options.uri)
  output = @crawler.words_by_selector(@options.post_selector, 'ul:last-child')

  Dir.mkdir('../../output') unless Dir.exists?('../../output')

  File.open("../../output/word_count.json", "w") do |file|
    file.puts JSON.pretty_generate(output)
  end
end
```

And there we go. Our first decent output from the crawler :D -Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Awake
- Sleep: 6
- Hunger: 4
- Coffee: 0
