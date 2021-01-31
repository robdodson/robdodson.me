---
title: Easily upgrade Ghost 0.x to 2.0
tags:
  - Ghost
excerpt: Upgrade from Ghost 0.x to 2.0 the quick and easy way.
date: 2019-01-14T00:40:51.000Z
updated: 2019-01-14T00:47:57.000Z
---

Over the weekend I updated my ancient [Ghost](https://ghost.org/) blog to version 2.0. This was harder than I expected so I wanted to share the strategy that worked for me. 

This will require nuking your old server—which sounds scary, but is *so* much easier than upgrading it in place. If all you're doing is running Ghost then it may be no big loss—it wasn't for me at least 😛

If you're doing a bunch of other stuff on your server then you may want to try a different guide.

It's also worth mentioning that in this post I'll use a one-click Ghost install on Digital Ocean so I don't have to deal with setting everything up myself. I am lazy 🤤

## Backup

1. Go to the **Labs** section of your Ghost admin page (`yourblog.com/ghost`) and click export to get your JSON data. You'll use this to recreate your posts.
2. Download your images. The easiest way to do this is with scp. [Here's a little cheatsheet if you're unfamiliar with it](https://devhints.io/scp).

```bash
cd /var/www/ghost/content
sudo zip -r images.zip images    
scp YOUR_USERNAME@YOUR_SERVER_IP:/var/www/ghost/images.zip /local/path/to/file
```

You can attempt to download your theme as well but if you're going from 0.x to 2.0 I think there's a *really good chance* it will not work.

## Locally migrate your post data

**This step is key**. You can't just import Ghost 0.x data into a Ghost 2.0 blog. You first have to import it into a Ghost 1.0 blog, export it again, and import *that* JSON into the 2.0 blog.

I tried to setup Ghost 1.0 on my previous server but it was a pain. I was running Ubuntu 14 but Ghost CLI will blow up if you're not running Ubuntu 16 or above. Better to just do these steps locally.

You'll need to install the [ghost-cli](https://docs.ghost.org/api/ghost-cli/) and create a local version of Ghost 1.0. You'll also want to make sure you're running Node 8 or above.

```bash
node --version # hopfully >=8, otherwise upgrade node first
npm install -g ghost-cli
mkdir ghost-v1
cd ghost-v1
ghost install --v1
```

This should fire up a server on `localhost` that you can access to setup your blog. Once you've done that, go to the **Labs** section of the Ghost admin page and import the JSON you downloaded earlier. You may see some warnings but I was able to safely ignore these. They seem related to duplicate content from 0.x to 1.0.

You can also replace the `content/images` directory with the one you downloaded from your old server.

If all goes well you should be able to preview your content in the Ghost 1.0 casper theme.

Finally, in the Labs section use the export command to retrieve your Ghost 1.0 JSON. You don't need to mess with the images because Ghost 0.x, 1.0, and 2.0 all seem to use the same directory structure for `/images`.

## Create a new Droplet

If you use DigitalOcean or another service that provides one-click installs, now's the time to create a new Ghost 2.0 instance, ideally running on Ubuntu 18.

Grab the IP for the new server but don't log into it just yet.

## Setup DNS and SSL

Go to your domain registrar and update your records to point at the IP for your new server. If you have a simple setup then you may just need to update the `A` record. It will take a while for the DNS to propagate (~15 minutes to an hour).

You can use [a DNS checker](https://dnschecker.org/) to verify that the domain is pointing at your server's IP.

## Login to the new server

When you first login the server *should* kickoff the ghost CLI install step. It will walk you through a few steps similar to the ones you did during the previous local install. Once it's finished, sign in to your Ghost admin, import your JSON, and use `scp` to copy over your images.

If all goes according to plan then you should be done. Yay! 🎉

As a last step you should consider doing some server hardening on your new Ghost instance. [This guide by Rob Ferguson](https://robferguson.org/blog/2017/08/12/migrating-from-ghost-0-x-to-ghost-1-x/#serverhardening) seems like a good next step.

I hope this blog post helps those of you in the same boat as me. Good luck!
