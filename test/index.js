var expect = require('expect.js');
var Way = require('../');
var Route = require('../lib/route');
var request = require('supertest');
var connect = require('connect');

describe('adding a route', function () {
  it('adds a route to the routing table', function () {
    var way = new Way();
    var routes = {'get': {'/': new Route()}};
    
    way.route({
      method: 'GET',
      path: '/'
    });
    
    expect(way._routes.toString()).to.equal(routes.toString());
  });
  
  it('lowercases the route method', function () {
    var way = new Way();
    way.route({
      method: 'GET',
      path: '/'
    });
    
    expect(way._routes['get']['/']).to.not.equal(undefined);
  });
  
  it('forces a path for the route', function () {
    var way = new Way();
    var threwError = false;
    
    try{
      way.route();
    }
    catch (e) {
      threwError = true;
    }
    finally {
      expect(threwError).to.equal(true);
    }
  });
  
  it('defaults to GET method if none is provided', function () {
    var way = new Way();
    way.route({
      path: '/path'
    });
    
    expect(way._routes.get).to.not.equal(undefined);
  });
  
  it('instantiates a route object as the value of the route', function () {
    var way = new Way();
    way.route({
      path: '/path'
    });
    
    expect(way._routes.get['/path']).to.be.a(Route);
  });
});

describe('path lookup', function (t) {
  it('determines if there is a matching exact route', function () {
    var way = new Way();
    way.route({
      method: 'GET',
      path: '/pathname'
    });
    
    expect(way.lookup('/pathname', 'GET')).to.not.equal(undefined);
    expect(way.lookup('/pathname', 'GET').route).to.not.equal(undefined);
    expect(way.lookup('/pathname', 'GET').params).to.not.equal(undefined);
    expect(way.lookup('/no-route', 'GET')).to.equal(undefined);
  });
  
  it('matches a route based on a glob', function () {
    var way = new Way();
    way.route({
      method: 'POST',
      path: '**'
    });
    
    expect(way.lookup('/any/route/matches', 'POST')).to.not.equal(undefined);
  });
  
  it('matches a route and passes params from route onto request object', function () {
    var way = new Way();
    way.route({
      method: 'POST',
      path: '/users/:id/friends/:friendId'
    });
    var route = way.lookup('/users/123/friends/456', 'POST');
    
    expect(route.params.id).to.equal('123');
    expect(route.params.friendId).to.equal('456');
  });
});

describe('serving routes', function () {
  it('serves a route', function (done) {
    var app = connect();
    var way = new Way();
    
    app.use(way.route({
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
    var app = connect();
    var way = new Way();
    
    app.use(way.route({
      path: '/',
      handler: function () {}
    }));
    
    request(app)
      .get('/path')
      .expect(404)
      .end(done);
  });
});

