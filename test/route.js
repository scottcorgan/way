var expect = require('expect.js');
var Route = require('../lib/route');

describe('a route object', function () {
  it('supports a single before method', function () {
    var before = function () {
    };
    var route = new Route({
      before: before
    });
    
    expect(route._beforeHandler[0]).to.equal(before);
  });

  it('supports multiple before methods', function () {
    var before = [
      function () {},
      function () {}
    ];
    var route = new Route({
      before: before
    });
    
    expect(route._beforeHandler.length).to.equal(before.length);
  });

  it('runs the before methods', function (done) {
    var beforeRan = false;
    var before = function (req, res, next) {
      beforeRan = true;
      next();
    };
    var route = new Route({
      before: before
    });
    
    route.before({}, {}, function (err) {
      expect(beforeRan).to.equal(true);
      done();
    });
  });

  it('runs multiple before methods', function (done) {
    var beforeRan1 = false;
    var beforeRan2 = false;
    var before1 = function (req, res, next) {
      beforeRan1 = true;
      next();
    };
    var before2 = function (req, res, next) {
      beforeRan2 = true;
      next();
    };
    
    var route = new Route({
      before: [before1, before2]
    });
    
    route.before({}, {}, function (err) {
      expect(beforeRan1).to.equal(true);
      expect(beforeRan2).to.equal(true);
      done();
    });
  });

  it('runs the handler after the before methods', function (done) {
    var ranBefore = false;
    var req = 'req';
    var res = 'res';
    
    var before = function (req, res, next) {
      ranBefore = true;
      next();
    };
    var route = new Route({
      before: [before],
      handler: function (_req, _res) {
        expect(ranBefore).to.equal(true);
        expect(req).to.equal(_req);
        expect(res).to.equal(_res);
        done();
      }
    });
    
    route.handle(req, res);
  });
});