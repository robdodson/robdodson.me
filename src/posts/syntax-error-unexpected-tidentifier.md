---
title: 'Syntax Error: Unexpected tIDENTIFIER in Rails 3'
tags:
  - Rails
  - Rails 3
  - Errors
  - Ruby
date: 2011-09-21T14:33:00.000Z
updated: 2015-01-02T09:04:39.000Z
---

Today we’re going to look at this little gem, which is really nothing more than a syntax error. If you’re not used to Ruby’s syntax, this can be a particularly easy stumbling block.

For starters here’s the image you see in Rails 3 when things go South:

![Syntax Error: Unexpected tIDENTIFIER](/images/2014/12/unexpected_tidentifier.jpg)

Just to focus your attention, I’ll post the snippet of code that was causing the issue.

```ruby
<%= link_to "Goodbye" say_goodbye_path %>
```

Can you tell me what’s wrong with the code above? If you’re coming from a Ruby background it should be plainly obvious, but if you’re coming from more of an ECMAScript or Java/C/C++ background things might be a little more subtle. What if I rewrote it like this?

```ruby
linkTo("Goodbye" sayGoodbyePath);
```

Did you notice I left out a comma when passing my function arguments? The proper code would look something like this:

```ruby
# note the comma between arguments
<%= link_to "Goodbye", say_goodbye_path %>
```

If you want to explore this a bit more (and if you’re new to Ruby—trust me—you do) then strap in for a brief tangent.

### Ruby Says Goodbye to Braces (sort of)

One of Ruby’s double edged swords, especially if you’re coming from another language, is the exclusion of various syntactical elements to improve brevity and readability. In Actionscript 3 you might iterate over a list of items like this:

```ruby
for each (var person:Object in people) {
  trace(person.name);
}
```

However in Ruby you can write it much more succinctly:

```ruby
for person in @people
  puts person.name
end

# or...

@people.each do |person|
  puts person.name
end
```

Just that example alone doesn’t look so bad but where it gets tricky for a newcomer like myself is when the parenthesis wrapping a function’s arguments are excluded. This is the case in our original example and it can be pretty jarring for someone not used to that kind of shorthand. Suddenly I’m left wondering if I’m calling another function, or using a keyword, or some other idiom of the language that I don’t fully grasp.

It gets especially confusing when dealing with hashes as function arguments. Here’s a quote from [Agile Web Development with Rails, 4th Edition](http://pragprog.com/book/rails4/agile-web-development-with-rails) with some emphasis added:

> You can pass hashes as parameters on method calls. **Ruby allows you to omit the braces, but only if the hash is the last parameter of the call.** Rails makes extensive use of this feature…In effect, though, you can ignore that it’s a hash and pretend that Ruby has keyword arguments.

As you start to learn Rails you’ll see this kind of thing everywhere. At first I thought there was a special language construct that I was missing (similar to the ‘keyword’ referred to in the book) but in actuality it’s just hashes without the surrounding brackets. Common Rails practices take this to the extreme, mixing and omitting braces quite frequently. Take for example this validation:

```ruby
validates :email, presence:   true,
                    format:     { with: VALID_EMAIL_REGEX },
                    uniqueness: { case_sensitive: false }
```

To confuse the issue even further, the hash syntax changed from Ruby 1.8.7 to 1.9 allowing you to swap the place of the colon on your symbols. This makes newer Rails examples seem like they’re using another part of the language that you might not be familiar with. Below is an example, note the position of the colons:

```ruby
# Ruby 1.8.7 hash syntax
say_hello :name => 'Rob', :age => 27
say_hello(:name => 'Rob', :age => 27)
say_hello({:name => 'Rob', :age => 27})

# Ruby 1.9 hash syntax
say_hello name: 'Rob', age: 27
say_hello(name: 'Rob', age: 27)
say_hello({name: 'Rob', age: 27})
say_hello :name => 'Rob', :age => 27
say_hello(:name => 'Rob', :age => 27)
say_hello({:name => 'Rob', :age => 27})
```

All of the above code evaluates to the same thing (give it a shot in IRB). At this point we’re way off topic but I wanted to put this out there in case anyone else is struggling with these concepts. After getting used to the syntax (or lack thereof) these kinds of mistakes are easily cleared up, but for now just be mindful of what version of Ruby your examples are written in.

### Resolution

Check the syntax of your method call. Odds are you forgot a comma somewhere.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
