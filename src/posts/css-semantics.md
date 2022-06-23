---
title: 'CSS Semantics: Best Practices'
tags:
  - Chain
  - CSS
  - OOCSS
  - SMACSS
date: 2012-06-09T14:19:00.000Z
updated: 2015-01-02T08:55:53.000Z
---CSS is, for me, one of the most challenging and nerve wracking aspects of my job. With most programming languages there are frameworks and guides and heuristics that all make up a suite of best practices. CSS doesn't _really_ have anything like this and as a result it's kind of a mish-mash of good rules to follow, definite don'ts, and lots and lots of grey area. Since I'm starting a new CSS heavy project, and because I want to further my own understanding in this realm, I'm going to spend a few posts exploring the topic of what makes good, maintainable CSS. Along the way I'm also going to point out a few frameworks that I've been looking at, in particular [OOCSS](http://oocss.org/) and [SMACSS.](http://smacss.com/) But lets kick things off with a discussion of what it means to write good, semantic CSS selectors and we'll follow up with frameworks in our next post.

## Define Semantic

When I was trolling the interwebs for talks on writing large-scale maintainable CSS I somehow managed to come across [this article on css-tricks comparing the semantics of various css selectors.](http://css-tricks.com/semantic-class-names/) After reading it I had this weird feeling like maybe I haven't been putting as much thought into my css selectors as I should. My selectors need to be highly semantic, but what does that really _mean?_

Trying to look up the definition of "semantic" is kind of a fun, albeit a slightly annoying task since most definitions look like this:

_Of, relating to, or according to the science of semantics._

Well...thanks. [The wonderful Wordnik site has a great list of definitions](http://www.wordnik.com/words/semantic) the most useful of which is probably this:

_Reflecting intended structure and meaning._

So a semantic CSS selector should reflect the intended structure or meaning of the element it is applied to. Hmm...that's still a rather broad definition but at least we have a starting point. If I have a `div` that holds a bunch of news articles there's probably a gradient of increasingly more semantic names I could use for it.

```html
<div class="container"></div>

<div class="article-box"></div>

<div class="newsstand"></div>
```

On the far end of the spectrum, `container` is about as generic as you can get and basically restates that something is a `div`. While I've been guilty of doing this in the past, if you're saying a containing HTML Element is a 'container' you're restating the obvious and should probably work on improving the name.

`article-box` is much more descriptive than just `container` so I'd say it has a higher semantic "score". But there is the potential for some semantic weirdness here, for instance, if we decide at a later date that we want our articles to be contained in a horizontal list it might make less sense to call it an "article-_box_". So maybe `article-container` is semantically similar but also a bit more flexible?

Finally we have `newsstand` which is highly semantic and probably my favorite of the bunch. `newsstand` describes what our element _is_ but it doesn't bother delving into how our element works. As a result `newsstand` can work however we want, it can be list like, or grid like, tabular, etc and it won't matter. You might argue that this would be a good place to use an ID instead of a class but that decision should be weighed carefully. You have to make sure that 3 months or a year from now there isn't the potential of having two newsstands on the same page.

### If we only worked on contrived examples...

Of course there's a litany of cases where highly semantic naming just doesn't quite cut it. Often times we're given a layout which has a few primary areas (columns, headers, footer) and the designer is putting all sorts of content into those divisions. On one page it could be news articles, then a list of search results, then a directory of users, and so on. I would argue that for major layout elements it's ok to use less semantic names, and in fact this is probably a good idea. So things like `column_1`, `flex-box`, `constrained-container`, are all specifying, at varying degrees, what the element is doing. They are less semantically rich than, say, `rolodex` or `id-badge`, but that's because their very intention is to be generic.

### What about helpers?

_Preface: I know about SASS and LESS. Let's pretend they don't exist for a moment :D_

Here is an area where I recently got very tripped up and I'm still not entirely sure what the best approach might be. Let's say you have a brand color, something like Facebook's blue, and you need to apply it to all sorts of different and unrelated elements. If you're like me then your brain starts thinking, "Well, that blue value is essentially a variable that I'd like to reuse. Maybe I should just make a helper style for it..." and so you produce something like this in a helpers.css file:

```css
.light-blue {
    #00C
}
```

Now our HTML has little `light-blue`s sprinkled on top of it and we don't have to worry about declaring that same blue value over and over again in our styles. But what happens when our company decides to rebrand and now our primary color is a bright red? Uh oh...You definitely don't want to have to change HTML _and_ CSS just to update a color.

[Neal G on CSS-Tricks made a very good comment regarding this scenario:](http://css-tricks.com/semantic-class-names/#comment-102571)

> Perhaps an easier way to explain semantic CSS is simply, don't name your classes or ids anything related to a CSS property. A property could be color, font-family, float, border, background etc.

[Also from the Web Designer Depot](http://www.webdesignerdepot.com/2009/05/10-best-css-practices-to-improve-your-code/)

> Name your elements based on what they are, not what they look like. For example, .comment-blue is much less versatile than .comment-beta, and .post-largefont is more limiting than .post-title.

Perhaps a better helper would have been `.brand-color` but again this is a contrived example. What about all the _other_ colors on the site. And what about helpers that wrap commonly used styles like `float: left` and `clear: both`?

The debate is pretty hot and heavy [on the css-tricks article.](http://css-tricks.com/semantic-class-names) Just seach for the word 'float' and you'll see some pretty interesting discussions on it. My opinion is that you probably don't want to tack a bunch of `.bright-red` or `.larger` classes everywhere but at the same time something like `.float-right` can be extremely useful and [in some cases forcing semantics into a design can actually make things worse](http://css-tricks.com/semantic-class-names/#comment-102906) especially for [less technically inclined clients.](http://css-tricks.com/semantic-class-names/#comment-103076)

As a bit of a homework assignment I would recommend looking into a few of the resources I'm posting below. Obviouslyl take everything with a grain of salt, there isn't any true gospel for CSS so do what works best for you. I'll cover OOCSS and SMACSS in my next post, till then, thanks for reading! - Rob

[What Makes For a Semantic Class Name?](http://css-tricks.com/semantic-class-names/)

[Our Best Practices Are Killing Us](http://www.stubbornella.org/content/2011/04/28/our-best-practices-are-killing-us/)

[Github CSS Style Guide](https://github.com/styleguide/css)

[CSS Wizardry: CSS Guidelines](https://github.com/csswizardry/CSS-Guidelines/blob/master/CSS%20Guidelines.md)
