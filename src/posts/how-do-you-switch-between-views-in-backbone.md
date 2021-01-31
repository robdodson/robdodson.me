---
title: How do you switch between views in Backbone
tags:
  - Chain
  - Backbone
date: 2012-05-23T14:56:00.000Z
updated: 2014-12-30T07:48:03.000Z
---

I'm going to try to approach some of my future articles as more of a question/answer setup so they don't turn into these sprawling tutorials. Today I want to focus on moving between views in Backbone.js. I'm starting with some very simple templates and three views: LeftView, MiddleView, RightView. To do this quickly we'll make it so each view is essentially a big button which, when clicked on, should animate to the middle of the screen.

Here's what one of my templates looks like:

    <div id="right-container" class="container">
      Everyone knows I'm right.
    </div> 
    

One of the first thing I'm noticing is that all of my templates seem to be wrapped in an extra div. Since this extra div is block displayed I can't get my items to line up next to each other... Oh! T[he problem is because I haven't specified a tagName for my views.](http://stackoverflow.com/questions/7894253/backbone-js-turning-off-wrap-by-div-in-render) I think I can actually do everything in the View declaration without needing a template.

    Example.Views.Right = Backbone.View.extend({
      tagName: 'div',
      id: 'right-container',
      className: 'container'
    });
    

That should create our view for us with the proper tag, class and id attributes. My containers are just colored squares so I don't need to populate them with any content. If I did want to use this approach I could add more content like this:

    Example.Views.Right = Backbone.View.extend({
      tagName: 'div',
      id: 'right-container',
      className: 'container',
      initialize: function() {
        this.el.innerHTML = "Hello World!";
      }
    });
    

Or I could render a template. Again for our purposes we just want to move some colored blocks around so the first approach is sufficient.

Here is our most basic `Router` showing how to add the views to stage. Since we aren't using a template we can just call the regular render function and append the returned element to the DOM.

    var Router = Backbone.Router.extend({
      routes: {
        "": "index"
      },
    
      index: function() {
        var leftView = new Example.Views.Left();
        var middleView = new Example.Views.Middle();
        var rightView = new Example.Views.Right();
    
        // Attach the views to the DOM
        $("#main").append(leftView.render().el);
        $("#main").append(middleView.render().el);
        $("#main").append(rightView.render().el);
    
      }
    });
    

Here are my very simple styles:

    .container {
      width: 300px;
      height: 300px;
      display: inline-block;
      margin-right: 50px;
    }
    
    #left-container {
      background: #F00;
    }
    
    #middle-container {
      background: #0F0;
    }
    
    #right-container {
      background: #00F;
    }
    

We should now have a very simple horizontal layout.

### Composite Views

Well I'd like to center my views in the middle of the screen but moving each item individually is going to be pretty challenging. I think the better idea would be to wrap my views in a containing view which can then be easily centered on screen.

Here's what that looks like:

    Example.Views.Sections = Backbone.View.extend({
      tagName: 'div',
      id: 'sections',
      leftView: undefined,
      middleView: undefined,
      rightView: undefined,
    
      initialize: function() {
        this.leftView = new Example.Views.Left();
        this.middleView = new Example.Views.Middle();
        this.rightView = new Example.Views.Right();
    
        this.$el.append(this.leftView.render().el);
        this.$el.append(this.middleView.render().el);
        this.$el.append(this.rightView.render().el);
      },
    
      // We should do this work with events instead of methods
      setInitialPosition: function() {
        this.$el.css({left: $(window).width() / 2 - this.$el.width() / 2 });
      }
    });
    

Our Sections view is going to contain our 3 subordinate views. When it gets added to the DOM, `initialize` will run and create our subviews. I've also defined a method `setInitialPosition` which centers our view on screen. Tomorrow I'll replace this with an event handler that fires whenever our element is added to the DOM. For now I'm too lazy to look up the supported events :D

The sections view is absolutely positioned and it's width and height are explicitly defined in the css. In the short term here's how we've updated things:

    #sections {
      display: inline-block;
      position: absolute;
      width: 1000px;
      height: 300px;
      top: 50px;
      left: 0;
    }
    
    .container {
      width: 300px;
      height: 300px;
    }
    
    #left-container {
      background: #F00;
      position: absolute;
      top: 0;
      left: 0;
    }
    
    #middle-container {
      background: #0F0;
      position: absolute;
      top: 0;
      left: 350px;
    }
    
    #right-container {
      background: #00F;
      position: absolute;
      top: 0;
      left: 700px;
    }
    

I wanted to give each view a 50px margin on each side so in the short term all these values are hard coded. I'll think about how to make things more dynamic.

Let's listen to when the user clicks on a view. When we hear that we'll animate the whole sections container over so that view is centered on screen.

We'll need to add an events hash to our Sections view. Since all of our children implement the same `.container` class we may as well listen for a click on that.

    events: {
      "click .container":    "onChildClicked"
    }
    

In our handler, `onChildClicked`, we'll figure out which child was actually clicked and then animate ourselves accordingly. Here's the entire object for your reference with the handler at the bottom.

    Example.Views.Sections = Backbone.View.extend({
      tagName: 'div',
      id: 'sections',
    
      leftView: undefined,
      middleView: undefined,
      rightView: undefined,
    
      events: {
        "click .container":    "onChildClicked"
      },
    
      initialize: function() {
        this.leftView = new Example.Views.Left();
        this.middleView = new Example.Views.Middle();
        this.rightView = new Example.Views.Right();
    
        this.$el.append(this.leftView.render().el);
        this.$el.append(this.middleView.render().el);
        this.$el.append(this.rightView.render().el);
      },
    
      // We should do this work with events instead of methods
      setInitialPosition: function() {
        this.$el.css({left: $(window).width() / 2 - this.$el.width() / 2 });
      },
    
      // Whenever a child is clicked let's animate so it is
      // centered on screen
      onChildClicked: function($e) {
          var $target = $($e.target);
          
          switch($e.target.id) {
            case 'left-container':
              this.$el.animate({
                left: $(window).width() / 2 - $target.width() / 2
              });
              break;
            
            case 'middle-container':
              this.$el.animate({
                left: $(window).width() / 2 - this.$el.width() / 2
              });
              break;
    
            case 'right-container':
              this.$el.animate({
                left: $(window).width() / 2 - this.$el.width() + $target.width() / 2
              });
              break;
          }
        }
    });
    

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Laggy, Pensive
- Sleep: 5
- Hunger: 0
- Coffee: 0
