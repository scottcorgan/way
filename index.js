var merge = require('merge');
var Piston = require('piston');

var route = function (options) {
  return route.create(options);
};

route.table = new Piston();

route.create = function (options) {
  route.table.register(options);
  
  return function (req, res, next) {
    next = next || function () {};
    
    var entry = route.lookup(req.url, req.method);
    
    if (!entry) return next();
    
    entry.value.handle(merge(req, entry), res);
  };
};

route.lookup = function (pathname, method) {
  return route.table.lookup(pathname, method);
};



route._resetRoutes = function () {
  route.table.reset();
};

function pluck (arr, key) {
  return arr.map(function (item) {
    return item[key];
  });
}

module.exports = route;