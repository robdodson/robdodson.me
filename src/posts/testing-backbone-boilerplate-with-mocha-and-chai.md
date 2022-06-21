---
title: Getting started with Mocha and Chai
tags:
  - Chain
  - BDD
  - Mocha
  - Chai
date: 2012-05-27T21:08:00.000Z
updated: 2015-01-02T09:00:11.000Z
---

Since I was previously doing so much RSpec I want to try to bring some of that over to my JavaScript work. Lately I've been working with the Backbone Boilerplate which is a wonderful jump-start for folks who want to get up and running with AMD and Backbone. Today I'm going to see if I can get a working BDD setup going which will run some very basic tests. In a future post I'll use this new setup to do some BDD with Backbone Boilerplate.

### Setting up Mocha and Chai

I chose Mocha over Jasmine because I've already worked with Jasmine so there wasn't much mystery there and also because I've heard really good things about Mocha. I think it's cool that if I choose to do a Node.js project Mocha will be able to test both my server and client code.

Unfortunately the documentation for both Mocha and Chai is rather terse when it comes to actually explaining how to get either library working for client side testing. I guess that's understandable since their primary focus is Node but after over an hour of poking around both sites I still don't have anything that functions...

Copying over both the mocha and chai directories into my project I've noticed that each one has a test/browser folder which is refered to in the documentation. Seems like this is how I run my specs. Mocha has a failing set of specs on its opts.html file but otherwise everything seems to pass. Chai has failures in its spec regarding its deep equals operations... Let's see if we can forge ahead and write a test in just mocha.

Here's my html runner setup:

```html
<html>
  <head>
    <meta charset="utf-8" />
    <title>Mocha Tests</title>
    <link rel="stylesheet" href="mocha/mocha.css" />
    <script src="../assets/js/libs/jquery.js"></script>
    <script src="mocha/mocha.js"></script>
    <script>
      mocha.setup('bdd');
    </script>
    <script src="test.foobar.js"></script>
    <script>
      $(function () {
        mocha.run();
      });
    </script>
  </head>
  <body>
    <div id="mocha"></div>
  </body>
</html>
```

And here's my first failing test:

```js
describe('Foobar', function () {
  describe('#sayHello()', function () {
    it('should return some text', function () {
      var foobar = {
        sayHello: function () {
          return 'Hello World!';
        },
      };

      assert(foobar.sayHello() === 'funky chicken');
    });
  });
});
```

Using just the above I see the mocha runner fire up but then it immediately breaks saying that `assert` is not defined. Well...great. [I'm basing my work on this example](http://visionmedia.github.com/mocha/#browser-support) but I realize now that I removed the line which included `expect.js`. Without expect.js we don't have anything to do exceptions for us because Mocha doesn't include any by default.

![Assert is not defined](/images/2014/12/no_assert.png)

Looking at some other Mocha examples in the github repo I noticed that they explicitly define the `assert` method inside the runner. We'll do the same to get things working. Here's my updated runner which now functions as expected. Note the addition of `assert` after we call `mocha.setup('bdd')`.

```html
<html>
  <head>
    <meta charset="utf-8" />
    <title>Mocha Tests</title>
    <link rel="stylesheet" href="mocha/mocha.css" />
    <script src="../assets/js/libs/jquery.js"></script>
    <script src="mocha/mocha.js"></script>
    <script>
      mocha.setup('bdd');
    </script>
    <script>
      function assert(expr, msg) {
        if (!expr) throw new Error(msg || 'failed');
      }
    </script>
    <script src="test.foobar.js"></script>
    <script>
      $(function () {
        mocha.run();
      });
    </script>
  </head>
  <body>
    <div id="mocha"></div>
  </body>
</html>
```

Since our `assert` method takes a `msg` param we can add that to our test so we get some useful feedback when it fails. Here's the updated spec.

```js
describe('Foobar', function () {
  describe('#sayHello()', function () {
    it('should return some text', function () {
      var foobar = {
        sayHello: function () {
          return 'Hello World!';
        },
      };

      assert(
        foobar.sayHello() === 'funky chicken',
        'Was expecting "Hello World!"'
      );
    });
  });
});
```

That should fail and give us the appropriate message. Changing 'funky chicken' to 'Hello World!' will make the test pass. Yay that only took a few hours...

OK, let's forge ahead and see if we can get chai working so we can use some nicer expectations than our weak `assert`. I'm including chai.js in place of our `assert` function.

```html
<html>
  <head>
    <meta charset="utf-8" />
    <title>Mocha Tests</title>
    <link rel="stylesheet" href="mocha/mocha.css" />
    <script src="../assets/js/libs/jquery.js"></script>
    <script src="chai/chai.js"></script>
    <!-- added chai.js instead of assert -->
    <script src="mocha/mocha.js"></script>
    <script>
      mocha.setup('bdd');
    </script>
    <script src="test.foobar.js"></script>
    <script>
      $(function () {
        mocha.run();
      });
    </script>
  </head>
  <body>
    <div id="mocha"></div>
  </body>
</html>
```

Next we need to update our spec. Chai has 3 different styles of assertions: `assert`, `expect` and `should`. I'll show you how to use each in our foobar spec:

```js
var assert = chai.assert,
  expect = chai.expect,
  should = chai.should(); // Note that should has to be executed

var foobar = {
  sayHello: function () {
    return 'Hello World!';
  },
};

describe('Foobar', function () {
  describe('#sayHello()', function () {
    it('should work with assert', function () {
      assert.equal(foobar.sayHello(), 'funky chicken!');
    });

    it('should work with expect', function () {
      expect(foobar.sayHello()).to.equal('funky chicken!');
    });

    it('should work with should', function () {
      foobar.sayHello().should.equal('funky chicken!');
    });
  });
});
```

![Our failing Chai tests](/images/2014/12/failing_chai_tests.png)

Changing all those funky chickens to 'Hello World!' should get the tests passing again and now we can use any syntax we like.

![Finally some passing Chai tests!](/images/2014/12/passing_chai_tests.png)

Now all is well and good except the tests that come with Chai are failing in a few places. It looks like some of Chai's methods are borked on my system.

![Chai failing its own tests](/images/2014/12/broken_chai_tests.png)

That does _not_ fill me with confidence. I think there's a very high probability that being a newbie I'm doing something wrong so [I've tweeted to Jake Luer, the author of Chai, to figure out if perhaps I'm missing something or if the tools are actually broken.](https://twitter.com/rob_dodson/status/206893206435151872/photo/1) In the meantime I'm not comfortable using a testing framework that's broken.

Sigh... well tomorrow I'll try to import some modules and if Jake hasn't gotten back to me by then I'll use Jasmine to do those tests. Till then!

- Update: Looks like I managed to clone Chai right as they were updating the repo. Pulling the latest fixed everything. See the comment thread below\*

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Awake, Caffeinated, Curious
- Sleep: 7
- Hunger: 0
- Coffee: 1
