---
title: Mocking Requests with Mocha, Chai and Sinon
tags:
  - Chain
  - BDD
  - Node
  - Mocha
  - Chai
  - Express
  - Sinon
date: 2012-05-28T18:20:00.000Z
updated: 2014-12-30T08:05:53.000Z
---

[After a bit of a rocky start yesterday](http://robdodson.me/blog/2012/05/27/testing-backbone-boilerplate-with-mocha-and-chai/) I've finally got Mocha and Chai running in the browser which is great. Today I'd like to test out some of the async functionality of Mocha. This seems to be the big selling point for most people so we'll kick the tires a bit.

### Basic Async Tests with Mocha and Chai

I wrote a little Node service that we'll consume for testing purposes. This is my first [Node](http://nodejs.org/) and [Express](http://expressjs.com/) app so apologies if it's lamesauce. I used the `express` command to boilerplate a project called `pickles` with some very basic routes:

```js
// Routes

var count = 100;

app.get('/', function (req, res) {
  res.send('Welcome to the Pickle Store!');
});

app.get('/pickles', function (req, res) {
  res.json({
    count: count,
    message: 'oh boy, ' + count + ' pickles!',
  });
});

app.get('/pickles/add/:num', function (req, res) {
  count += parseInt(req.params.num);
  res.json({
    add: req.params.num,
    message: 'you added ' + req.params.num + ' pickles to the pickle barrel!',
  });
});

app.listen(3000, function () {
  console.log(
    'Express server listening on port %d in %s mode',
    app.address().port,
    app.settings.env
  );
});
```

We'll need to make sure our node service is running for our tests to work and all of our URLs will point at localhost:3000. Obviously you wouldn't want this for a production setting but it'll be fine for demonstration purposes.

Here is our really simple Mocha spec. We're actually creating a `pickelStore` object in the spec file itself so we can test against it.

```js
var expect = chai.expect;

var pickleStore = {
  pickles: function () {
    $.ajax({
      url: 'http://localhost:3000/pickles',
      dataType: 'json',
      success: function (data) {
        console.log(data);
      },
    });
  },
  add: function (num) {
    $.ajax({
      url: 'http://localhost:3000/pickles/add/' + num,
      dataType: 'json',
      success: function (data) {
        console.log(data);
      },
    });
  },
};

describe('Pickle Store', function () {
  describe('#pickles', function () {
    pickleStore.pickles();
  });
});
```

I just want to see if the ajax methods will run and hit our Node service but I'm running into the following issue in Chrome:

```
XMLHttpRequest cannot load http://localhost:3000/pickles. Origin null is not allowed by Access-Control-Allow-Origin.
```

Bummer... :(

OK, what's going on here... To StackOverflow! [Aaaand we have our response.](http://stackoverflow.com/questions/8456538/origin-null-is-not-allowed-by-access-control-allow-origin/8456586#8456586) After a bit of googling I came across [this post](http://www.stoimen.com/blog/2010/11/19/diving-into-node-js-very-first-app/) which mentions adding `res.header('Access-Control-Allow-Origin', '*');` to my Node responses. That does the trick. I also found [this post](http://www.stoimen.com/blog/2010/11/19/diving-into-node-js-very-first-app/) which describes setting up [CORS](https://developer.mozilla.org/en/http_access_control) with Express.

OK hopefully we're done with Node for now. I don't want this to turn into a node tutorial... Let's see if we can get the tests to perform using Mocha. We'll need some way to mock and spy on the ajax because I don't want to test the data coming from the actual service. I've realized I want to _simulate_ the service for client-side Mocha tests. In a future tutorial I'll test the service itself using the Node aspect of Mocha. Kind of silly to lead off this way but whatever, moving on!

### Enter Sinon.js

I'm going to use [Sinon.js](http://sinonjs.org/) to help me mock, stub, fake, spy and do whatever the heck else I need to make sure my client code is solid. After downloading the js file for Sinon you can just add it to our test/index.html under the line where we added mocha.

```html
<html>
  <head>
    <meta charset="utf-8" />
    <title>Mocha Tests</title>
    <link rel="stylesheet" href="mocha/mocha.css" />
    <script src="../assets/js/libs/jquery.js"></script>
    <script src="chai/chai.js"></script>
    <script src="mocha/mocha.js"></script>
    <script src="sinon/sinon.js"></script>
    <script>
      mocha.setup('bdd');
    </script>
    <script src="test.pickles.js"></script>
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

Now we can use Sinon in our `test.pickles.js` file to get a handled on our ajax. Let's first test that an ajax call is made when we run the `pickles()` method of the `pickleStore` object. We'll make sure this first test fails, then we'll change the spec to make it pass.

```js
var expect = chai.expect;

var pickleStore = {
  pickles: function () {
    $.ajax({
      url: 'http://localhost:3000/pickles',
      dataType: 'json',
      success: function (data) {
        console.log(data);
      },
    });
  },
  add: function (num) {
    $.ajax({
      url: 'http://localhost:3000/pickles/add/' + num,
      dataType: 'json',
      success: function (data) {
        console.log(data);
      },
    });
  },
};

describe('Pickle Store', function () {
  describe('#pickles', function () {
    // Use Sinon to replace jQuery's ajax method
    // with a spy.
    beforeEach(function () {
      sinon.spy($, 'ajax');
    });

    // Restor jQuery's ajax method to its
    // original state
    afterEach(function () {
      $.ajax.restore();
    });

    it('should make an ajax call', function (done) {
      pickleStore.pickles();
      expect($.ajax.calledOnce).to.be.false; // see if the spy WASN'T called
      done(); // let Mocha know we're done async testing
    });
  });
});
```

![Our first failing test with Mocha, Chai and Sinon. Yay!](/images/2014/12/first_failing_ajax_test.png)

Changing this line `expect($.ajax.calledOnce).to.be.false;` from `false` to `true` should make our test pass. Yay, first async test in the bag! Next let's try to fake a response from the server. But I'm realizing that the succesful server response should _do_ something to my pickleStore object, otherwise why do I care about the data? So I'm going to update pickelStore with the following success callback on its pickles method:

```js
var pickleStore = {
  count: 0,
  status: '',
  pickles: function () {
    var self = this;
    $.ajax({
      url: 'http://localhost:3000/pickles',
      dataType: 'json',
      success: function (data) {
        self.count = parseInt(data.count);
        self.status = data.status;
      },
    });
  },
  add: function (num) {
    $.ajax({
      url: 'http://localhost:3000/pickles/add/' + num,
      dataType: 'json',
      success: function (data) {
        console.log(data);
      },
    });
  },
};
```

Now we can test what happens after the server sends a succesful response. But how do we get that response and how do we force the success callback? For that we'll need to use Sinon's `stub.yieldsTo` method. It's mentioned in [the docs on this page](http://sinonjs.org/docs/#stubs) if you scroll down. `yieldsTo` lets us direct the path of our spy so it will not only pretend to be jQuery's `ajax` method, but it will also force itself into the `success` callback with an optional hash of parameters which simulate our service response. Sweet! We'll have to revise the `beforeEach` in our spec though otherwise Sinon will complain that we're wrapping `ajax` twice. The updated spec should look like this. Again, take note that we're going to make it fail first by expecting a count of 99 pickles instead of 100.

```js
describe('Pickle Store', function () {
  describe('#pickles', function () {
    // Use Sinon to replace jQuery's ajax method
    // with a spy. This spy will also come with
    // some success data.
    beforeEach(function () {
      sinon.stub($, 'ajax').yieldsTo('success', {
        count: '100',
        message: 'oh boy, 100 pickles!',
      });
    });

    // Restor jQuery's ajax method to its
    // original state
    afterEach(function () {
      $.ajax.restore();
    });

    it('should make an ajax call', function (done) {
      pickleStore.pickles();
      expect($.ajax.calledOnce).to.be.true;
      done();
    });

    it('should update the count', function (done) {
      pickleStore.pickles();
      expect(pickleStore.count).to.equal(99);
      done();
    });
  });
});
```

Failing as expected. Aaaaand we change the expected count to 100, voila! Passing tests again!

![Passing test with Sinon's yieldTo](/images/2014/12/passing_yield_test.png)

I'm adding the test for the status update as well so our final `#pickles` spec should look like this:

```js
describe('Pickle Store', function () {
  describe('#pickles', function () {
    // Use Sinon to replace jQuery's ajax method
    // with a spy. This spy will also come with
    // some success data.
    beforeEach(function () {
      sinon.stub($, 'ajax').yieldsTo('success', {
        count: '100',
        message: 'oh boy, 100 pickles!',
      });
    });

    // Restor jQuery's ajax method to its
    // original state
    afterEach(function () {
      $.ajax.restore();
    });

    it('should make an ajax call', function (done) {
      pickleStore.pickles();
      expect($.ajax.calledOnce).to.be.true;
      done();
    });

    it('should update the count', function (done) {
      pickleStore.pickles();
      expect(pickleStore.count).to.equal(100);
      done();
    });

    it('should update the status', function (done) {
      pickleStore.pickles();
      expect(pickleStore.status).to.equal('oh boy, 100 pickles!');
      done();
    });
  });
});
```

Now let's test the `#add` method before calling it a day. This method is interesting because all it can really do is update our status message. However, once it's called the value returned by `pickles()` should have incremented by whatever amount was passed to `add()`. Let's start by updating our `pickleStore` so it properly updates the status message after we've called add.

```js
var pickleStore = {
  count: 0,
  status: '',
  pickles: function () {
    var self = this;
    $.ajax({
      url: 'http://localhost:3000/pickles',
      dataType: 'json',
      success: function (data) {
        self.count = parseInt(data.count);
        self.status = data.message;
      },
    });
  },
  add: function (num) {
    var self = this;
    $.ajax({
      url: 'http://localhost:3000/pickles/add/' + num,
      dataType: 'json',
      success: function (data) {
        self.status = data.message; // <-- update the status message!
      },
    });
  },
};
```

Now that that's in there we'll write a failing spec.

```js
describe('#add', function () {
  var amount = 11;

  beforeEach(function () {
    sinon.stub($, 'ajax').yieldsTo('success', {
      add: amount,
      message: 'you added ' + amount + ' pickles to the pickle barrel!',
    });
  });

  afterEach(function () {
    $.ajax.restore();
  });

  it('should update the status with the correct amount', function (done) {
    pickleStore.add(amount);
    expect(pickleStore.status).to.equal(
      'you added ' + 99 + ' pickles to the pickle barrel!'
    );
    done();
  });
});
```

This is not unlike our previous spec, in fact it does even less since we're not checking count.

![Another failing test.](/images/2014/12/failing_add_test.png)

To make the test pass we change the 99 to `amount`. I originally wrote the add method thinking I would go back and check the total number of pickles but I've realized now that really that's more of a test for the service and not the front end. The front end shouldn't care if that arithmetic is happening properly, it should just consume data and update its UI. For tomorrow's post I'll try to get an AMD module in here so we can start playing with Backbone again. Thanks!

You should follow me on Twitter [here.](http://twitter.com/rob_dodson)

- Mood: Irritated, Antsy
- Sleep: 8
- Hunger: 5
- Coffee: 0
