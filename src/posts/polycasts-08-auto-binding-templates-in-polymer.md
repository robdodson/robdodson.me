---
title: "Polycasts #08: Auto-binding templates in Polymer"
date: 2015-02-07T04:44:27.000Z
updated: 2015-02-07T04:51:04.000Z
---

Thinking in components is a great way to organize your application into well defined chunks. But there often comes a point where you've got a bunch of components that you've created and now you're stuck trying to wire them together at the highest level.

I've had a lot of folks ask me if they should create an `<x-app>` element so they can leverage the power of Polymer's databinding system throughout their entire application. While it should be ok to create an `<x-app>` element (at least from an SEO standpoint it doesn't *seem* to mess up Google search) it can still rub some folks the wrong way. That's where the `auto-binding` template comes into play.

An `auto-binding` template is a type extension element which takes all of the content inside of it, stamps it to the page, and activates any data bindings. It's super easy to get rolling, and it's how I start pretty much all of my applications now. Enjoy, and be sure to [subscribe to the Google Developers channel](https://www.youtube.com/user/GoogleDevelopers) for more Polycasts! *It's how I justify my continued employment ;)*
