---
title: Setting up Android Studio on Yosemite
tags:
  - Android
  - Android Studio
  - Java
date: 2014-12-31T06:01:12.000Z
updated: 2015-01-24T21:02:50.000Z
---

I've set out to learn some of the Android framework this quarter, which means setting up Java and the lastest version of Android Studio.

As it happens, I formatted my laptop today and did a clean install of Yosemite so my machine is about as stock as they come. As I was setting up Android Studio, I ran into some hiccups and thought I'd document them for anyone else running into similar issues.

## Step 1: Install Android Studio

After downloading Android Studio and firing it up for the first time, I was immediately confronted with an error:

> Android Studio was unable to find a valid JVM

I realized I hadn't yet setup Java on my machine so I followed [the link from the Android Studio docs to download the JDK](http://www.oracle.com/technetwork/java/javase/downloads/index.html) and installed Java 7. Hopping over to my command line, I verified the install by running `javac -version` which output `javac 1.7.0_71`.

Tried restarting Android Studio and...

> Android Studio was unable to find a valid JVM

Crap.

## Step 2: Google furiously

At this point, I must admit that I'm no Java expert. I followed the instructions to download the JDK but there are a ton of links on that page... maybe I made a mistake?

Thankfully [this StackOverflow thread](https://stackoverflow.com/questions/27369269/android-studio-was-unable-to-find-a-valid-jvm-related-to-mac-os/27369596) saved the day.

The accepted answer recommends hacking on the `info.plist` inside the Android Studio package. There's discussion in the comments pointing out that **this is no longer a recommended practice**.

I finally found [this answer](https://stackoverflow.com/a/27369494) which recommends [downloading the latest JVM from Oracle](https://www.java.com/en/download/) and then [downloading this Java bundle from Apple](https://support.apple.com/kb/DL1572?viewlocale=en_US&locale=en_US). After installing both packages I'm now able to fire up Android Studio (and I didn't have to hack on any of the internals). Yay!

## Step 3: Reflect

I've tried setting up Java in Eclipse before, and even previously in Android Studio. For some reason it's always a pain and super discouraging. I think it would be great if [the Android Studio guide](https://developer.android.com/sdk/installing/index.html?pkg=studio) contained a bit more explaination about exactly what I need to install to get up and running. Just pointing folks to [this page](http://www.oracle.com/technetwork/java/javase/downloads/index.html) and telling them to install the JDK is frought with peril. There are a million links on that page and almost no information hierarchy. If there are specific items I should click, gimme some screenshots.

Also, the error message from Android Studio is very unhelpful.

> Android Studio was unable to find a valid JVM

That was literally the first thing I saw when I started Android Studio. There's no "Hey click this link to find out how you can remedy this." Just an OK button that closes the app. Add a link to a troubleshooting guide and I think you'll save a handful of folks who were struggling like I was.

## Update 01/24/2015

Looks like there's [a ticket to address this issue](https://code.google.com/p/android/issues/detail?id=82378). According to the team:

> In the next version of Android Studio, if no java 6 is found but 7 (or greater) is found then it will use that instead. We still recommend running studio with Java 6 due to improved font rendering, but there is no work around needed if, for example, only java 8 is found.

So it seems like much of the confusion is around using Java 7 (or 8) instead of Java 6. If 6 is the required version it would be nice to link directly to it instead of pointing everyone to the JDK download page which has the latest versions at the top. Still, I'm happy to see this issue is being resolved.