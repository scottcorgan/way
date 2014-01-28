var pathToRegexp = require('path-to-regexp');
var zipObject = require('zip-object');
var merge = require('merge');
var Route = require('./lib/route');

var Way = function () {
  this._routes = {};
};

Way.prototype.route = function (options) {
  var way = this;
  
  if (Array.isArray(options)) {
    options.forEach(function (option) {
      way.route(option);
    });
  }
  else{
    if (!options.path) throw new Error('A route requires a path');
    if (!options.method) options.method = 'GET';
    
    var routeMethod = this._routes[options.method.toLowerCase()] || (this._routes[options.method.toLowerCase()] = {});
    routeMethod[options.path] = new Route(options);
  }
  
  return function (req, res, next) {
    var entry = way.lookup(req.url, req.method);
    
    if (!entry) return next();
    
    entry.route.handle(merge(req, entry), res);
  };
};

Way.prototype.lookup = function (pathname, method) {
  var methodTable = this._routes[method.toLowerCase()];
  var keys = Object.keys(methodTable);
  var len = keys.length;
  var i = 0;
  var paramKeys = [];
  var paramValues = [];
  var key;
  var rexp;
  
  for(i; i < len; i += 1) {
    key = keys[i];
    rexp = pathToRegexp(key, paramKeys);
    
    if (pathname.match(rexp)) {
      paramValues = pathname.match(rexp).slice(1);
      
      return {
        route: methodTable[key],
        params: zipObject(pluck(paramKeys, 'name'), paramValues)
      }
    }
  }
};

function pluck (arr, key) {
  return arr.map(function (item) {
    return item[key];
  });
}

module.exports = Way;