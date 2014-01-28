var asArray = require('as-array');
var drainer = require('drainer');

var Route = function (options) {
  options = options || {};
  
  this._beforeHandler = asArray(options.before);
  this._handler = options.handler;
  
  this.before = drainer(this._beforeHandler);  
};

Route.prototype.handle = function (req, res) {
  var route = this;
  
  this.before(req, res, function (err, req, res) {
    route._handler(req, res);
  });
};

module.exports = Route;