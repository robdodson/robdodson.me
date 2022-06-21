---
title: Object Oriented Scraper Backed with Tests Pt. 8
tags:
  - Ruby
  - Chain
  - Nokogiri
  - RSpec
  - BDD
date: 2012-05-16T14:42:00.000Z
updated: 2014-12-30T07:25:30.000Z
---

Yesterday's I refactored my specs and crawler to support ignoring selections. While I started parsing the metadata I quickly realized that certain bits were rather specific and needed to have custom parsing methods. Today I'm going to write some format objects to help with all that.

Our metadata on the page looks like this:

```bash
Time: 7:42 am
Mood: Awake, Alert, Focused
Sleep: 6
Hunger: 0
Coffee: 0
```

Sleep, hunger and coffee are all floats, so one object could be just `FloatFormat`. Mood should produce an `Array` of objects so we could have a `CollectionFormat`. Finally time is going to combine the time listed in the metadata and the post date. We'll make a `DateTimeFormat` for that. These could all be methods of one big Format object as well but experience tells me that you need to be careful of monolithic actors that consume tons of different data types and spit out results. Those classes have a tendency to bloat very easily as project requirements change. I think it's better to produce classes which can be extended or abstracted as needs arise.

So we know _who_ is going to format but we still don't know _how_. I think I'd like to build a manifest which matches the metadata category to a format. Maybe something like this?

```
{
  'Time'    => DateTimeFormat,
  'Mood'    => CollectionFormat,
  'Sleep'   => FloatFormat,
  'Hunger'  => FloatFormat,
  'Coffee'  => FloatFormat
}
```

I could probably look at each item and "detect" what kind of format it needs but I'd rather be explicit. If, for instance, I want to add another format, it's a lot easier to just change my manifest file vs. hacking on some detection scheme. I think we can just produce this manifest file in YAML and load it in at runtime. One thing I don't like about this approach is that it specifically names our format classes. You could generalize it so that it just matches a category to the desired output data, for instance `'Coffee' => Float` but then you run into problems with flexibility. What if Coffee still needed to output a float but had to go through a different Format than Hunger or Sleep? With that in mind we'll stick to the plan already laid out.

```
time:     DateTimeFormat
mood:     CollectionFormat
sleep:    FloatFormat
hunger:   FloatFormat
coffee:   FloatFormat
```

### The Format object

I would love it if I could use the Format object as a module and just call a method on it from Crawler. It might look like this:

```ruby
def metadata_by_selector(selector)
  node = nodes_by_selector(selector).first
  metadata = {}
  node.children.each do |child|
    Tentacles::Format.insert(child, metadata)
  end
end
```

The only problem is `Format` needs to load in and parse its formats.yml file before it's any good to us. There's some interesting talk of the [Module#autoload method](http://www.subelsky.com/2008/05/using-rubys-autoload-method-to.html) but that's not quite what I need...

Seems like I can't find any good documentation on this so instead we'll make it an instance of the class. Also I'm lazy so I'm going to have that instance load its own formats.yml file. Normally I like to only have one entry point for configuration files but...whatever.

### How do I convert a string into a class name in Ruby?

Well we know we can load our YAML file but all of our format classes are going to come in as strings. I did some digging to figure out how to convert the string into an actual class that can then be instantiated. If you just want to convert a String into a class you can use `Object.const_get('Foobar').new` but that's not going to work for us since our code is wrapped in a module. To convert a string into a module class we'll need to use the name of our module: `Tentacles.const_get('DateTimeFormat').new`.

With that in mind I want to spec out a simple test that passes in string of metadata and receives a printed notification that the right formatter has been created. We'll then refactor it to actually use the formatter on the string.

```ruby
require_relative '../lib/tentacles/format'
require_relative '../lib/tentacles/date_time_format'

describe Tentacles::Format do
  describe "when asked to parse some metadata" do
    it "should create the right formatter" do
      @format = Tentacles::Format.new
      @format.parse('Time: 8:03 am').should be_an_instance_of(Tentacles::DateTimeFormat)
    end
  end
end


require 'yaml'
require_relative 'date_time_format'

module Tentacles
  class Format
    def initialize
      @categories = YAML.load(File.open(File.dirname(__FILE__) + '/formats.yml'))
    end

    def parse(data)
      category = data.split(':')[0]
      category.downcase!
      Tentacles.const_get(@categories[category]).new
    end
  end
end


module Tentacles
  class DateTimeFormat
    def initialize
      puts 'DateTimeFormat created!'
    end
  end
end
```

Now let's take it a step further so we can convert an actual time into a DateTime object. Here's our updated spec:

```ruby
require_relative '../lib/tentacles/format'
require 'date'

describe Tentacles::Format do
  describe "when asked to parse some metadata" do
    it "should create the right formatter" do
      @format = Tentacles::Format.new
      @format.parse('Time: 8:03 am').should be_an_instance_of(Date)
    end
  end
end
```

To pull this off we'll need the help of at least 2 new gems: [Chronic](http://rubygems.org/gems/chronic) and [ActiveSupport](http://rubygems.org/gems/activesupport). Chronic is a natural language parser which can convert strings into useable timestamps. ActiveSupport is a library of extensions originally created for Rails which have been abstracted into a general purpose toolset. We're going to combine these two gems to turn the phrase "8:03 am" into a Ruby DateTime.

Gotta first update the Gemfile with our new dependencies and run `bundle install`.

```ruby
source 'https://rubygems.org'

gem 'rspec', '2.9.0'
gem 'nokogiri', '~>1.5.2'
gem 'awesome_print', '~>1.0.2'
gem 'fakeweb', '~>1.3.0'
gem 'chronic', '~> 0.6.7'
gem 'activesupport', '~> 3.2.3'
```

Next we bang out a quick parse method inside of DateTimeFormat. Our Tentacles::Format is going to delegate its parse call to whichever subordinate formatter it creates. Code speaks louder than words:

```ruby
require 'yaml'
require_relative 'date_time_format'

module Tentacles
  class Format
    def initialize
      @categories = YAML.load(File.open(File.dirname(__FILE__) + '/formats.yml'))
    end

    # Create a formatter based on the content of the passed
    # in data. Delegate the parse call to this new formatter
    def parse(data)
      category, *content = data.split(':')
      category.downcase!
      formatter = Tentacles.const_get(@categories[category]).new
      formatter.parse(content)
    end
  end
end


require 'chronic'
require 'active_support/core_ext/string/conversions.rb'

module Tentacles
  class DateTimeFormat
    def initialize
      puts 'DateTimeFormat created!'
    end

    def parse(content)
      Chronic.parse(content.join(':')).to_datetime
    end
  end
end
```

With all that in place our test should pass. Nice!!!!!! We're well on our way to processing the remaining metadata. Tomorrow I'll whip up our other formats and figure out how to pull the date out of a blog post so we can combine that with the time to get a proper DateTime.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Awake, Alert, Focused
- Sleep: 6
- Hunger: 0
- Coffee: 1
