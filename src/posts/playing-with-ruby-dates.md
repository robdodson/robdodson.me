---
title: Playing with Ruby Dates
tags:
  - Ruby
  - Chain
  - Dates
  - Chronic
  - Active Support
date: 2012-04-28T14:30:00.000Z
updated: 2014-12-30T06:20:32.000Z
---

One of [my previous projects](https://vimeo.com/40633070) involved a ton of work using Flash's built in Date object. We ended up rolling our own Calendar library which was both tedious and time consuming to debug. Now that I'm digging into Ruby for my newest project, I wanted to see what features the language has to offer. So far I'm *really* impressed and that's after only a few hours of exploration. I'll detail some of the tricks I've learned along the way so hopefully other newcomers can benefit.

### Ruby Date Object Basics

We can start off by firing up IRB and requiring the `date` class. Let's do a really simple example first and just generate today.

    require 'date'
    
    today = Date.today
     => #<Date: 2012-04-28 ((2456046j,0s,0n),+0s,2299161j)>
    

Now lets try a bit of Ruby's sugar to generate tomorrow's date.

    tomorrow = today + 1
     => #<Date: 2012-04-29 ((2456047j,0s,0n),+0s,2299161j)> 
    

Pretty straightforward, right? Since there is usually more than one way to do something in Ruby we could have achieved the same results using any of the following.

    today.succ
     => #<Date: 2012-04-29 ((2456047j,0s,0n),+0s,2299161j)>
    
    today.next
     => #<Date: 2012-04-29 ((2456047j,0s,0n),+0s,2299161j)> 
    
    today.next_day
     => #<Date: 2012-04-29 ((2456047j,0s,0n),+0s,2299161j)> 
    

As [someone on StackOverflow pointed out](http://stackoverflow.com/questions/962544/one-line-hash-creation-in-ruby): `Date` objects are also `Comparable`, so you can construct a `Range`. If you wanted to collect every day from the previous week into an array you could do the following:

    last_week = today - 7
    every_day_last_week = (last_week..today).to_a
    

or...

    today.downto(today - 7).to_a
    

There are also some cute booleans tossed into the mix for figuring out the day of the week.

    today.friday?
     => false
    
    today.saturday?
     => true
    

### How to Use Chronic

[Chronic](https://github.com/mojombo/chronic/) is a Ruby natural language date/time parser written by [Tom Preston-Werner](http://tom.preston-werner.com/) ([@mojombo](https://twitter.com/#!/mojombo)) which takes surprisingly human readable text and converts it to dates.

Covering everything that Chronic supports could take a while so definitely go check out the docs. Below is just a quick example to demonstrate how cool it is.

    require 'chronic'
    
    Chronic.parse('yesterday')
     => 2012-04-27 12:00:00 -0700
    
    Chronic.parse('yesterday').to_date
     => #<Date: 2012-04-27 ((2456045j,0s,0n),+0s,2299161j)> 
    
    Chronic.parse('last monday')
     => 2012-04-23 12:00:00 -0700 
    
    Chronic.parse('3 months ago this friday at 3:45pm')
     => 2012-02-04 15:45:00 -0800
    

### How to Use Active Support for Dates

Active Support is a library extracted from Rails which adds a ton of sugar to the Ruby language. As the author's describe it:

> Active Support is a collection of various utility classes and standard library extensions that were found useful for Rails. All these additions have hence been collected in this bundle as a way to gather all that sugar that makes Ruby sweeter.

It's broken into several pieces so you can choose to load only the parts that you'll actually be using. *I'm going to write an upcoming article on Active Support. For now we'll just require it all.*

    require 'active_support/all'
    
    t = Date.today
     => Sat, 28 Apr 2012
    
    t.class
     => Date 
    

You'll notice that Active Support has changed the way our date's `to_s` is formatted so it's more human readable. It also added shortcuts for creating Dates on either side of today.

    yesterday = Date.yesterday
     => Fri, 27 Apr 2012 
     
    tomorrow = Date.tomorrow
     => Sun, 29 Apr 2012
    

Included as well are some nice convenience booleans: `past?`, `today?`, and `future?`

    tomorrow.future?
     => true
    

If you've ever had to write a Calendar that can support weeks, especially those that straddle two different months, you'll appreciate the simplicity of the helpers Active Support adds.

    today = Date.today
     => Sat, 28 Apr 2012
    
    today.beginning_of_week
     => Mon, 23 Apr 2012
    
    today.next_week
     => Mon, 30 Apr 2012
    
    # You can also choose to make the week start on an arbitrary day, like Sunday
    today.beginning_of_week(:sunday)
     => Sun, 22 Apr 2012
    

We aren't limited to weeks though. Active Support adds methods for days, months and years. For example:

    today.years_ago(10)
     => Sun, 28 Apr 2002
    

By extending `FixNum` to support additional Date methods certain operations become much more readable.

    today + 1.year
     => Sun, 28 Apr 2013
    

These extensions are referred to as `durations`[in the documentation](http://guides.rubyonrails.org/active_support_core_extensions.html).

Which brings us back to one of our first examples of finding the date 7 days ago. With Active Support it's as easy as...

    7.days.ago
     => 2012-04-21 08:44:02 -0700
    

Pretty cool! Active Support adds *A LOT* more than just Date helpers and I'll try to cover it more in some future articles. Definitely [check out the documentation](http://guides.rubyonrails.org/active_support_core_extensions.html) (you can [skip to the Date section](http://guides.rubyonrails.org/active_support_core_extensions.html#extensions-to-date) since it's pretty immense).

Source:

[http://stackoverflow.com/questions/962544/one-line-hash-creation-in-ruby](http://stackoverflow.com/questions/962544/one-line-hash-creation-in-ruby)
[http://www.developer.com/open/article.php/3729206/Telling-Time-with-Ruby.htm](http://www.developer.com/open/article.php/3729206/Telling-Time-with-Ruby.htm)
[http://guides.rubyonrails.org/active_support_core_extensions.html](http://guides.rubyonrails.org/active_support_core_extensions.html)

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

[Photo credit](https://www.flickr.com/photos/125167502@N02/14363795854/in/set-72157645053557074)
