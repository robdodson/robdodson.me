---
title: Virtual Host in Mountain Lion with Apache
tags:
  - Apache
  - OS X
date: 2012-10-03T06:16:00.000Z
updated: 2014-12-31T00:41:57.000Z
---

If you're using Mountain Lion and have the need to setup a vhost it can be a little tricky to get the ball rolling. I'm going to do my best to detail the process that I use to set everything up. Hopefully you can use these same steps to square aware your system.

## Command Line Fu!

Ok we're going to pretty much do everything in Terminal so if that scares you now might be a good time to install [MAMP](http://www.mamp.info/en/index.html) instead ;)

## Step 1: Enable httpd-vhosts.conf

OK first thing to do is navigate to your apache installation and open it up in your text editor of choice.

    cd /etc/apache2
    mate httpd.conf // you can use anything to open it up: vim, nano, etc.
    

You're looking for the line:

    #Include /private/etc/apache2/extra/httpd-vhosts.conf
    

Remove the `#` to uncomment it.

It might be wrapped in a block that looks like this:

    <IfDefine WEBSHARING_ON>
    ...
    </IfDefine>
    

Comment out those lines using `#`. We want our httpd-vhosts file to always be loaded. It should look kind of like this:

    #<IfDefine WEBSHARING_ON>
    
    ... a bunch of stuff ...
    
    Include /private/etc/apache2/extra/httpd-vhosts.conf
    
    ... a buncha other stuff ...
    
    #</IfDefine>
    

## Step 2: Enable PHP

In the `httpd.conf` file search for this line:

    #LoadModule php5_module libexec/apache2/libphp5.so
    

Remove the `#` so PHP will be enabled.

## Step 3: Add a vhost

OK let's add our first vhost.

    mate /etc/apache2/extra/httpd-vhosts.conf
    

This is your list of virtual hosts. There should be some example vhosts in here. Let's create a new one:

    <VirtualHost *:80>
        ServerName mysite.dev
        DocumentRoot "/Users/Rob/Developer/mysite"
        <Directory "/Users/Rob/Developer/mysite">
            DirectoryIndex index.php index.html
            AllowOverride all
            Options -MultiViews
            Order allow,deny
            Allow from all
        </Directory>
    </VirtualHost>
    

There are a few other options you can use but I'm ignoring them for now. `ServerName` is what we'll be typing into our browser address bar. `DocumentRoot` and `Directory` point to the location of the project files on our hard drive. Note that `DirectoryIndex` will check for index.php first and then check for index.html. If you want to just use .html you can remove the bit about index.php

## Step 4: Add the vhost to your hosts file

Next let's add our new host to our hosts file.

    mate /etc/hosts
    

You should see a line that looks like this:

    127.0.0.1 localhost
    

Add this line underneath so it looks like this:

    127.0.0.1 localhost
    127.0.0.1 mysite.dev
    

## Step 5: Restart Apache

OK let's reboot apache!

    sudo apachectl restart
    

## Step 6: Cross your fingers!

Head over to your browser and try it out. Make sure you use `http://` at the beginning or it will just try to google your hostname.

    http://mysite.dev
    

With any luck you should see your site! If everything worked go back to terminal and paste in this line:

    sudo launchctl load -w /System/Library/LaunchDaemons/org.apache.httpd.plist
    

That will tell apache to start whenever the system starts. A word of warning: Whenever you change anything in httpd.conf, httpd-vhosts.conf or your hosts file you'll have to restart apache with `sudo apachectl restart` otherwise your changes won't show up in the browser.

Good Luck!
