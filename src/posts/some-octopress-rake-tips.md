---
title: Some Octopress Rake Tips
tags:
  - Octopress
  - Chain
  - Rake
date: 2012-06-12T02:04:00.000Z
updated: 2014-12-30T23:43:39.000Z
---

This is a quick post just to scratch one of my own itches. I've been using Octopress every single day for around two months now and the generation time for my blog is slowly starting to creep up. I'd heard that you could isolate a post and just preview/generate it instead of doing the whole blog every time but it wasn't until today that I finally decided to look into it.

Turns out it's really simple. Let's say we are going through our usual steps of creating a new post:

`rake new_post["Today is a Wonderful Day"]`

Now that we have our post ready we can isolate it from all the others:

`rake isolate[wonderful-day]`

Notice I didn't pass in the entire filename? That's because the Rake task inspects each of our posts and stashes anything that doesn't include the String 'wonderful-day' in the filename.

    Dir.glob("#{source_dir}/#{posts_dir}/*.*") do |post|
        FileUtils.mv post, stash_dir unless post.include?(args.filename)
    end
    

Now that our post is isolated we can preview it, like we always do:

`rake preview`

Write a little bit, save, and hit `localhost:4000` to see your super speedy blog post!

When we're all done we integrate the post back in with the rest of our blog.

`rake integrate`

And finally we generate and deploy it, which can be done in a single command:

`rake gen_deploy`

There are a few other useful rake tasks, you can see the whole list by running:

`rake -T`

    rake clean                     # Clean out caches: .pygments-cache, .gist-cache, .sass-cache
    rake copydot[source,dest]      # copy dot files for deployment
    rake deploy                    # Default deploy task
    rake gen_deploy                # Generate website and deploy
    rake generate                  # Generate jekyll site
    rake install[theme]            # Initial setup for Octopress: copies the default theme into the path of Jekyll's generator.
    rake integrate                 # Move all stashed posts back into the posts directory, ready for site generation.
    rake isolate[filename]         # Move all other posts than the one currently being worked on to a temporary stash location (stas...
    rake list                      # list tasks
    rake new_page[filename]        # Create a new page in source/(filename)/index.markdown
    rake new_post[title]           # Begin a new post in source/_posts
    rake preview                   # preview the site in a web browser
    rake push                      # deploy public directory to github pages
    rake rsync                     # Deploy website via rsync
    rake set_root_dir[dir]         # Update configurations to support publishing to root or sub directory
    rake setup_github_pages[repo]  # Set up _deploy folder and deploy branch for Github Pages deployment
    rake update_source[theme]      # Move source to source.old, install source theme updates, replace source/_includes/navigation.ht...
    rake update_style[theme]       # Move sass to sass.old, install sass theme updates, replace sass/custom with sass.old/custom
    rake watch                     # Watch the site and regenerate when it changes
    

I'm looking forward to trying out Octopress 2.1 as it includes [a more streamlined generate task](https://github.com/imathis/octopress/pull/207) as well as some other nifty features. - Rob

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Caffeinated
- Sleep: 7
- Hunger: 0
- Coffee: 1
