var pathToRegexp = require('path-to-regexp');
var zipObject = require('zip-object');
var merge = require('merge');
var Route = require('./lib/route');
var pathetic = require('pathetic');

var route = function (options) {
  return route.create(options);
};

route._routes = {};

route.create = function (options) {
  if (Array.isArray(options)) {
    options.forEach(route.create);
  }
  else{
    if (!options.path) throw new Error('A route requires a path');
    if (!options.method) options.method = 'GET';
    
    var routeMethod = route._routes[options.method.toLowerCase()] || (route._routes[options.method.toLowerCase()] = {});
    routeMethod[options.path] = new Route(options);
  }
  
  return function (req, res, next) {
    next = next || function () {};
    
    var entry = route.lookup(req.url, req.method);
    
    if (!entry) return next();
    
    entry.value.handle(merge(req, entry), res);
  };
};

route.lookup = function (pathname, method) {
  var routes = pathetic(route._routes[method.toLowerCase()]);
  return routes(pathname);
};



route._resetRoutes = function () {
  route._routes = {};
};

module.exports = route;












function pluck (arr, key) {
  return arr.map(function (item) {
    return item[key];
  });
}