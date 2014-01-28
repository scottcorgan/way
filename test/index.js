var expect = require('expect.js');
var Way = require('../');
var route = require('../');
var Route = require('../lib/route');
var request = require('supertest');
var connect = require('connect');

describe('adding a route', function () {
  it('adds a route to the routing table', function () {
    route._resetRoutes();
    
    var routes = {'get': {'/': new Route()}};
    var middleware = route({
      method: 'GET',
      path: '/'
    });
    
    expect(route._routes.toString()).to.equal(routes.toString());
  });
  
  it('lowercases the route method', function () {
    route._resetRoutes();
    
    var middleware = route({
      method: 'GET',
      path: '/'
    });
    
    expect(route._routes['get']['/']).to.not.equal(undefined);
  });
  
  it('forces a path for the route', function () {
    route._resetRoutes();
    
    var threwError = false;
    
    try{
      route();
    }
    catch (e) {
      threwError = true;
    }
    finally {
      expect(threwError).to.equal(true);
    }
  });
  
  it('defaults to GET method if none is provided', function () {
    route._resetRoutes();
    var middleware = route({
      path: '/path'
    });
    
    expect(route._routes.get).to.not.equal(undefined);
  });
  
  it('instantiates a route object as the value of the route', function () {
    route._resetRoutes();
    route({
      path: '/path'
    });
    
    expect(route._routes.get['/path']).to.be.a(Route);
  });
  
  it('adds an array of routes in a single middleware', function () {
    route._resetRoutes();;
    
    route([
      {
        path: '/path',
        handle: function () {}
      },
      {
        path: '/another-path',
        handle: function () {}
      }
    ]);
    
    expect(route._routes.get['/path']).to.not.equal(undefined);
    expect(route._routes.get['/another-path']).to.not.equal(undefined);
  });
});

describe('path lookup', function (t) {
  it('determines if there is a matching exact route', function () {
    route._resetRoutes();
    route({
      method: 'GET',
      path: '/pathname'
    });
    
    expect(route.lookup('/pathname', 'GET')).to.not.equal(undefined);
    expect(route.lookup('/pathname', 'GET').route).to.not.equal(undefined);
    expect(route.lookup('/pathname', 'GET').params).to.not.equal(undefined);
    expect(route.lookup('/no-route', 'GET')).to.equal(undefined);
  });
  
  it('matches a route based on a glob', function () {
    route._resetRoutes();
    route({
      method: 'POST',
      path: '**'
    });
    
    expect(route.lookup('/any/route/matches', 'POST')).to.not.equal(undefined);
  });
  
  it('matches a route and passes params from route onto request object', function () {
    route._resetRoutes();
    route({
      method: 'POST',
      path: '/users/:id/friends/:friendId'
    });
    
    var matchedRoute = route.lookup('/users/123/friends/456', 'POST');
    
    expect(matchedRoute.params.id).to.equal('123');
    expect(matchedRoute.params.friendId).to.equal('456');
  });
});

describe('serving routes', function () {
  it('serves a route', function (done) {
    route._resetRoutes();
    var app = connect();
    
    app.use(route({
      path: '/path',
      handler: function (req, res) {
        res.end('handled');
      }
    }));
    
    request(app)
      .get('/path')
      .expect('handled')
      .expect(200)
      .end(done);
  });
  
  it('skips the routing if no matching route is found', function (done) {
    route._resetRoutes();
    var app = connect();
    
    app.use(route({
      path: '/',
      handler: function () {}
    }));
    
    request(app)
      .get('/path')
      .expect(404)
      .end(done);
  });
  
  it('sends a response from the before methods', function (done) {
    route._resetRoutes();
    var app = connect();
    
    app.use(route({
      path: '/path',
      before: function (req, res, next) {
        res.end('from before');
      },
      handler: function () {}
    }));
    
    request(app)
      .get('/path')
      .expect('from before')
      .expect(200)
      .end(done);
  });
  
  it('serves a route after looping through all before methods in order', function (done) {
    route._resetRoutes();
    var app = connect();
    
    var before1 = false;
    var before2 = false;
    var beforeSequence = [];
    
    app.use(route({
      path: '/path',
      before: [
        function (req, res, next) {
          before1 = true;
          beforeSequence.push('before1');
          next();
        },
        function (req, res, next) {
          before2 = true;
          beforeSequence.push('before2');
          next();
        }
      ],
      handler: function (req, res) {
        res.end('handler');
      }
    }));
    
    request(app)
      .get('/path')
      .expect(200)
      .expect('handler')
      .end(function () {
        expect(before1).to.equal(true);
        expect(before2).to.equal(true);
        expect(beforeSequence).to.eql(['before1', 'before2']);
        done();
      });
  });
  
  it('serves a route when multiple routes are defined', function (done) {
    route._resetRoutes();
    var app = connect();
    
    app.use(route({
      path: '/path',
      handler: function (req, res) {
        res.end('path');
      }
    }));
    
    app.use(route({
      path: '/another-route',
      handler: function (req, res) {
        res.end('another route');
      }
    }));
    
    request(app)
      .get('/another-route')
      .expect(200)
      .expect('another route')
      .end(done);
  });
  
  it('serves a route that was added as an array of routes', function (done) {
    route._resetRoutes();
    var app = connect();
    var routes = [
      {
        path: '/path',
        handler: function (req, res) {
          res.end('path');
        }
      },
      {
        path: '/another-route',
        handler: function (req, res) {
          res.end('another-route');
        }
      }
    ];
    
    app.use(route(routes));
    
    request(app)
      .get('/another-route')
      .expect(200)
      .expect('another-route')
      .end(done);
  });
});

