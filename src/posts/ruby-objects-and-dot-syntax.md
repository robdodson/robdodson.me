---
title: Ruby Objects and Dot Syntax
tags:
  - Ruby
  - Chain
  - Dates
date: 2012-05-01T14:37:00.000Z
updated: 2014-12-30T06:25:03.000Z
---

Coming from JavaScript I'm very accustomed to doing something like this:

    var person = { name: 'Rob', city: 'San Francisco' }
    
    console.log( person.city );   // 'San Francisco'
    
    

Using dot syntax to access a `Hash` is second nature to me. That's why I was surprised when I ran into the following error yesterday while writing some Ruby.

    person = {name: 'Rob', city: 'San Francisco'}
     => {:name=>"Rob", :city=>"San Francisco"} 
    
    puts person.city
    
    NoMethodError: undefined method `city' for {:name=>"Rob", :city=>"San Francisco"}:Hash
    

"Hmm, weird," I thought. I know I've seen dot syntax used in Ruby before..what gives?

### Dot Syntax and the Ruby Hash Object

As it turns out Ruby does not support dot syntax for the `Hash` object. If I had wanted to access the `city` property from my previous example I should have done it using the symbol key like so:

    person[:city]
     => "San Francisco"
    

There are a few data structures that are very similar to `Hashes` and seeing those used in the wild perhaps threw me off. So I figured I'd write a post about the do's and dont's of dot syntax and how different object types react to it.

#### Class

The first and most obvious one is the `Class` object. Really I'm talking about instances of a `Class` here, for example an instance of class `Person` might have a `city` attribute. Here's what that would look like.

    class Person
      def initialize(name, city)
        @name = name
        @city = city
      end
    
      def name
        @name
      end
    
      def city
        @city
      end
    end
    
    person = Person.new('Rob', 'San Francisco')
     => #<Person:0x007ff15412a8c0 @name="Rob", @city="San Francisco">
    
    person.city
     => "San Francisco" 
    

Since I've defined methods for both `name` and `city`, using dot syntax to access those properties basically means we're calling those methods. The methods just return the instance variables, acting as getters. You can shorten this by using `attr_reader` or `attr_accessor`.

    class Person
      attr_accessor :name, :city
      def initialize(name, city)
        @name = name
        @city = city
      end
    end
    
    person = Person.new('Rob', 'San Francisco')
     => #<Person:0x007ff15412a8c0 @name="Rob", @city="San Francisco">
    
    person.city
     => "San Francisco" 
    

#### Struct

The `Struct` object is another commonly used element which allows dot access to its attributes. Quoting from [the documentation](http://www.ruby-doc.org/core-1.9.3/Struct.html):

> A Struct is a convenient way to bundle a number of attributes together, using accessor methods, without having to write an explicit class.

Examples speak louder than words so here's our `Person` again.

    Person = Struct.new(:name, :city)
     => Person 
    
    person = Person.new('Rob', 'San Francisco')
     => #<struct Person name="Rob", city="San Francisco">
    
    person.city
     => "San Francisco"
    

As I understand it a `Struct` is basically sealed after you've given it an initial definition. This means that you can't keep tacking on properties like you can with a `Hash`

    # Continuing from above...
    
    person.age = 28
    NoMethodError: undefined method `age=' for #<struct Person name="Rob", city="San Francisco">
    
    person[:age] = 28
    NameError: no member 'age' in struct
    

#### OpenStruct

Finally we come to the `OpenStruct` which has both dynamic attributes and dot syntax. [The documentation describes it like so](http://ruby-doc.org/stdlib-1.9.3/libdoc/ostruct/rdoc/OpenStruct.html):

> An OpenStruct is a data structure, similar to a Hash, that allows the definition of arbitrary attributes with their accompanying values.

And again here is our `Person` from before. Note that `OpenStruct` needs you to `require` it.

    require 'ostruct'
    
    person = OpenStruct.new
     => #<OpenStruct> 
    
    person.name = 'Rob'
     => "Rob" 
    
    person.city = 'San Francisco'
     => "San Francisco" 
    
    person.city
     => "San Francisco" 
    

If you noticed, we didn't need to define the attributes of our `Person` before creating an instance of it. This means we could keep adding attributes indefinitely. Want your person to respond to `age`? Just tack it on.

    person.age = 28
     => 28
    
    person.age
     => 28
    

For the sake of brevity you can pass in a `Hash` and `OpenStruct` will covert it for you.

    require 'ostruct'
    
    person = OpenStruct.new(name: 'Rob', city: 'San Francisco')
     => #<OpenStruct name="Rob", city="San Francisco"> 
    
    person.city
     => "San Francisco"
    

This all seems wonderful but there's one huge caveat which comes from the way `OpenStruct` finds all of these dynamic attributes. As [the documentation describes it](http://ruby-doc.org/stdlib-1.9.3/libdoc/ostruct/rdoc/OpenStruct.html):

> An OpenStruct utilizes Ruby’s method lookup structure to and find and define the necessary methods for properties. This is accomplished through the method method_missing and define_method.

> This should be a consideration if there is a concern about the performance of the objects that are created, as there is much more overhead in the setting of these properties compared to using a Hash or a Struct.

Definitely keep that in mind if you're writing time sensitive code. In those situations you'll want to use a `Hash` or a `Struct` instead.

Source:

[http://www.ruby-doc.org/core-1.9.3/Class.html](http://www.ruby-doc.org/core-1.9.3/Class.html)

[http://www.ruby-doc.org/core-1.9.3/Struct.html](http://www.ruby-doc.org/core-1.9.3/Struct.html)

[http://ruby-doc.org/stdlib-1.9.3/libdoc/ostruct/rdoc/OpenStruct.html](http://ruby-doc.org/stdlib-1.9.3/libdoc/ostruct/rdoc/OpenStruct.html)

[http://stackoverflow.com/questions/9356704/unable-to-use-dot-syntax-for-ruby-hash](http://stackoverflow.com/questions/9356704/unable-to-use-dot-syntax-for-ruby-hash)

[http://www.rubyist.net/~slagell/ruby/accessors.html](http://www.rubyist.net/~slagell/ruby/accessors.html)

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
