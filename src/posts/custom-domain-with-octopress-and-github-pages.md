---
title: Custom Domain with Octopress and Github Pages
tags:
  - Octopress
  - Writing
  - Chain
date: 2012-04-30T13:52:00.000Z
updated: 2014-12-30T06:14:12.000Z
exclude: true
---

_I'm going to try to write this as a bit of a lightening post to see if I can bring down the time it takes me to produce something._

[Octopress](http://octopress.org/) is a blogging framework written by [Brandon Mathis](http://brandonmathis.com/) ([@imathis](https://twitter.com/#!/imathis)) which sits on top of [Jekyll](https://github.com/mojombo/jekyll). Jekyll is a static site generator, meaning there's no database associated with your blog. Instead of writing everything in a WSYWIG linked to MySQL (like Wordpress or Blogger) you produce text files using Markdown which are then converted to static HTML. There are 3 huge benefits to this approach. First, writing in Markdown is awesome. Once you learn the syntax it's incredibly fast and you don't have to spend time playing with a tiny little editor window just to add\*some**\*style** to your posts. Second, writing in your favorite text editor is also awesome. I produce everything in [Sublime Text 2](http://www.sublimetext.com/2) and every day I discover new tricks to make the process better. If you've ever had to write a blog post using one of those horrible little TinyMCE editors you will appreciate this feature. And lastly, static HTML is _fast_.

Octopress takes what Jekyll has started and adds some useful tasks and templates which make setting up your own blog a breeze. I'm going to quickly cover the steps needed to set everything up on Github Pages using a custom domain since that's something I struggled with when first starting out.

If you don't already have RVM installed you can [refer back to my previous post on getting setup](http://robdodson.me/blog/2011/09/23/how-to-use-rvm-for-rails3/). If you're unexperienced I highly recommend going the RVM route, though there's also [an explanation for setting up rbenv if you would prefer](https://github.com/sstephenson/rbenv#section_2). I should point out that I'm going to pretty much mirror [the Octopress setup guide](http://octopress.org/docs/setup/) but I'll add some tips toward the end for setting up a custom domain.

### Setup Octopress

You'll need at least Ruby 1.9.2 to install and run Octopress. As of right now the current version of Ruby is up to 1.9.3. I'd also recommend setting up a new RVM gemset just for your blog.

```bash
rvm install 1.9.3   # This will take a while
rvm gemset create octopress
rvm 1.9.3@octopress   # This will tell RVM to use our new gemset.
```

Next you'll need to clone and `bundle install` Octopress. When you `cd` into the directory it'll ask you to approve the .rvmrc file. An .rvmrc file basically tells RVM which ruby and gemset to use in a particular folder. Type `yes` and you'll probably get an error saying you're not using Ruby 1.9.2. This is ok, we're going to change what's in that file so ignore it for now.

```bash
git clone git://github.com/imathis/octopress.git octopress
cd octopress    # If you use RVM, You'll be asked if you trust the .rvmrc file (say yes).
```

Now let's tell RVM to use Ruby 1.9.3 with our custom Octopress gemset.

```bash
> .rvmrc    # This will empty the .rvmrc file
echo "rvm use 1.9.3@octopress" > .rvmrc
```

The next time you `cd` into the octopress directory you'll have to approve the new .rvmrc file. Next let's use [Bundler](http://gembundler.com/) to install our dependencies.

```bash
gem install bundler
bundle install
```

Finally we'll tell Octopress to setup its default theme.

```bash
rake install
```

If you get an error that looks like this:

```bash
rake aborted!
You have already activated rake 0.9.2.2, but your Gemfile requires rake 0.9.2. Using bundle exec may solve this.
```

then you already have a version of Rake in your global gemset. You can use `bundle exec rake install` which will use the version of Rake that bundler just installed in our gemset.

### Octopress on Github Pages

I prefer to host Octopress on [Github](http://github.com) pages because it's extemely easy (and free) to setup. The first step is to go to [Github](http://github.com) and create a new repository. The repository should be called "your_user_name.github.com". My name on Github is [robdodson](https://github.com/robdodson) so my repo is: [robdodson.github.com](https://github.com/robdodson/robdodson.github.com). Here's a quick explanation from the [Octopress deployment guide](http://octopress.org/docs/deploying/github/).

> Github Pages for users and organizations uses the master branch like the public directory on a web server, serving up the files at your Pages url `http://username.github.com`. As a result, you’ll want to work on the source for your blog in the source branch and commit the generated content to the master branch. Octopress has a configuration task that helps you set all this up.

Here's the task, let's run it:

```bash
rake setup_github_pages
```

This will setup your git branches and remotes to work with Github Pages. Basically Octopress uses 2 branches to manage your blog. The source branch contains all of our octopress files. The master branch contains only the generated blog posts and theme. This way when Github looks at the master branch of our repository it'll see a bunch of static HTML and serve it up as our website. As a result we use the built in octopress rake tasks to commit to master instead of pushing to it manually. Let's set that up now.

```bash
rake generate
rake deploy
```

This will generate your blog, copy the generated files into \_deploy/, add them to git, commit and push them up to the master branch. We still need to manually commit to our source branch though so lets do that next.

```bash
git add .
git commit -am 'Initial commit!'
git push origin source
```

### Octopress: Deploying a Blog Post

I won't go into too much detail here since [there's already a pretty comprehensive write up on the Octopress site for getting started](http://octopress.org/docs/blogging/). But let's do a quick post to get you familiar with everything.

You'll use Rake tasks to generate your blog posts, like so:

```bash
rake new_post["Hello World: The First of Many New Blog Posts"]
```

_Remember if rake cries just use `bundle exec` in front of your rake command._

This will spit out a markdown file for us in the `source/_posts` directory. Open up the new file using your favorite text editor. You should see a little block of [YAML Front Matter](https://github.com/mojombo/jekyll/wiki/yaml-front-matter) at the top which generates some useful metadata about our post. If you need to change a blog post's title in Octopress you'll have to update this YAML as well as the post's filename.

As I mentioned earlier your posts should be written in Markdown. [Here's a good Markdown cheat sheet to get you started](http://support.mashery.com/docs/customizing_your_portal/Markdown_Cheat_Sheet). _Tip: When you're writing in markdown you're also free to mix in HTML tags as they are ignored by the processor._ Write a quick block of text like "Hey, here's my first blog post!" and save it.

You can use `bundle exec rake preview` to fire up a local instance of your blog at `http://localhost:4000`. I usually leave this process running while I write so I can preview any of the markdown that I'm adding to the page. When you're done writing you'll need to generate and deploy the site to Github.

```bash
bundle exec rake generate
bundle exec rake deploy
```

And don't forget to commit your changes to source.

```bash
git add .
git commit -am 'Add my first blog post'
git push origin source
```

Now that we're all deployed you should be able to see your blog at "your_user_name.github.com".

### Setting up your Custom Domain with Octopress and Github

If you're cool using the Github subdomain then feel free to stick with it. However if you'd like to point a custom domain at your blog then here's how to go about it.

Create a new file in the `source` folder named `CNAME`. Add your domain name to this file. In my case the only contents of my CNAME are `robdodson.me`. If you're trying to use nested domains or subdomains you may need to [refer back to the Octopress documentation](http://octopress.org/docs/deploying/github/).

Now lets go through the familiar steps for deploying...

```bash
bundle exec rake generate
bundle exec rake deploy

git add .
git commit -am 'Create a CNAME record for my custom domain'
git push origin source
```

If you visit your repo you should see the CNAME record in the root of the master branch now (Octopress has copied it over for us as part of the generate task).

Next you'll need to update the DNS for your domain. Head over to your domain registrar and fire up their DNS manager. For a top level domain like `robdodson.me` we need to create an A record which points to the address for Github Pages: `204.232.175.78`. Save that change and now...we wait... Unfortunately, DNS can take several hours to update. If all goes according to plan then in a few hours "your_name.github.com" should resolve to "your_custom_domain.com".

A few quick gotchas...

If you're using Dreamhost then you may need to set the hosting preferences for the domain to DNS only. [See this thread for more explanation.](https://github.com/imathis/octopress/issues/518)

If adding `www` to the beginning of your domain seems to break things then make sure that your domain registrar has a CNAME record for www which points to your A record. I'm not a DNS expert but I _think_ this is the proper way to set that up.

Make sure you spelled your domain name correctly in the CNAME record that you pushed to Github. I spent almost an hour wondering why `robodson.me` wasn't resolving :\

If all else fails checkout the docs from [Github Pages](http://help.github.com/pages/) and [Octopress](http://octopress.org/docs/deploying/github/) on setting up a custom domain.

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)
