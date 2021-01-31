---
title: Pangrams in Ruby
tags:
  - Ruby
  - Chain
date: 2012-05-10T06:15:00.000Z
updated: 2014-12-30T07:01:38.000Z
---

I'm a big fan of sites like [RubyQuiz](http://www.rubyquiz.com/) and [CodeEval](http://www.codeeval.com/). In my opinion doing short puzzles and brain-teasers is a great way to explore a language. Here's one such puzzle taken from CodeEval which asks that you devise a program to read in a file, parse each line and decide if it is a pangram or not.

> The sentence 'A quick brown fox jumps over the lazy dog' contains every single letter in the alphabet. Such sentences are called pangrams. You are to write a program, which takes a sentence, and returns all the letters it is missing (which prevent it from being a pangram). You should ignore the case of the letters in sentence, and your return should be all lower case letters, in alphabetical order. You should also ignore all non US-ASCII characters.In case the input sentence is already a pangram, print out the string NULL

Here's my first attempt. Hopefully I can come back to this post in a few weeks and try it again in a bit more elegant fashion :)

    File.open(ARGV[0]).each_line do |line|
      
      missing_letters = []
      
      unless line.chomp.empty?
        line.chomp!
        line.downcase!
        ('a'..'z').each do |l|
          if line.index(l).nil?
            missing_letters << l
          end
        end
      end
      
      if missing_letters.empty?
        puts "NULL"
      else
        puts missing_letters.join('')
      end
    end
    

And here's some input:

    A quick brown fox jumps over the lazy dog
    A slow yellow fox crawls under the proactive dog
    AbC
    

To run it from the command line you'll need to pass in the path to the sentece file as an argument. Here's what it would look like if `pangrams.rb` and `sentences.txt` were in the same folder:

    ruby pangrams.rb sentences.txt 
    
    # outputs...
    NULL
    bjkmqz
    defghijklmnopqrstuvwxyz
    

Play around with this, throw some different sentence combinations at it to see what it spits out. Then try to write your own implementation. A good next step would be to modify the script so it can support empty lines in the text file.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
