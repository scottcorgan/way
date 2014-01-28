# way

Simple, Standalone/Connect/Express routes

## install

```
npm install way --save
```

## Usage

### Express/Connect

```js
var http = require('http');
var connect = require('connect');
var route = require('way');

var app = connect();
app.use(route({
  method: 'GET',
  path: '/my-path',
  before: function (req, res, next) {
    // Do something here
    next();
  },
  handler: function (req, res) {
    res.end('you got served!');
  }
}));

http.createServer(app).listen(3000);
```

### Standalone

```js
var connect = require('connect');
var route = require('way');

var myRoute = route({
  method: 'GET',
  path: '/my-path',
  before: function (req, res, next) {
    // Do something here
    next();
  },
  handler: function (req, res) {
    res.end('you got served!');
  }
});

http.createServe(function (req, res) {
  myRoute(req, res);
}).listen(3000);

```

## Api

### route(options)

#### Options

* `path` - the route. This pathname works exactly like Express routes. (i.e. `/users/:id/friends/:friendId`, etc.)
* `method` - http method type - `GET`, `POST`, etc. Defaults to `GET`.
* `before ` - a single function or an array of functions to run before the handler.
  * they take the following method signature (similare to Connect/Express middleware):
  ```js
  route({
    before: function (req, res, next) {
      next();
    }
  });
  ```
* `handler` - the final method called on the matching route.
  * this uses the following method signature:
  ```js
  route({
    handler: function (req, res) {
      res.end('done');
    }
  });
  ```
  
## Run Tests

```
npm install
npm test
```