var debug = require('debug')('pigsty')
var PigstyPlugin = require('pigsty-plugin');
var Insert = require('./insert');
var db = require('./query');
var Sensors = require('./sensors');

MysqlPlugin.prototype = new PigstyPlugin();
MysqlPlugin.prototype.constructor = PigstyPlugin;

function MysqlPlugin(options) {
  var self = this;
  PigstyPlugin.call(this, options);
  self.options = options;
  
};

MysqlPlugin.prototype.configure = function(callback) {
  debug('configuring pigsty-mysql');
};

MysqlPlugin.prototype.start = function(callback) {
  var self = this;
  self.db = db(self.options);
  self.sensors = new Sensors({ db: self.db });
};

MysqlPlugin.prototype.stop = function(callback) {
  var self = this;
  // TODO: stop db?
  if (self.db) {
    self.db.stop();
    self.db = null;
  }
};

MysqlPlugin.prototype.send = function(event) {
  var self = this;
  var event_inserter = new Insert({
    db: self.db,
    event: event,
    sensors: self.sensors
  });

  event_inserter.on('error', function(err) {
    console.error("plugin error:", err);
    self.emit('error', err);
  });

  event_inserter.run();
};

module.exports = function(options) {
  return new MysqlPlugin(options);
};