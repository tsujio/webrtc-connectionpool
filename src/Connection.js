var Packet = require('./Packet');
var Util = require('./Util');

function Connection(conn, connectionFactory, config) {
  var self = this;

  this.id = Util.generateRandomId(8);
  this._conn = conn;
  this._connectionFactory = connectionFactory;
  this._connectionCloseDelay = config.connectionCloseDelay >= 0 ?
    config.connectionCloseDelay : 30000;
  this._destroyed = false;
  this._finReceived = false;
  this.ondata = function() {};
  this.onerror = function() {};
  this._silentConnectionCloseTimer = setTimeout(function() {
    self.destroy();
  }, config.silentConnectionCloseTimeout >= 0 ? config.silentConnectionCloseTimeout : 180000);

  this._conn.on('data', function(data) {
    var packet;
    try {
      packet = Packet.fromJson(data);
    } catch (e) {
      console.error(e);
      return;
    }

    if (packet.flags.FIN) {
      self._finReceived = true;
      self.destroy();
      return;
    }

    if (self.isAvailable()) {
      if (self._silentConnectionCloseTimer) {
        clearTimeout(self._silentConnectionCloseTimer);
        self._silentConnectionCloseTimer = null;
      }
      self._connectionFactory.addConnection(self);
    } else {
      self.destroy();
    }

    self.ondata(packet.payload);
  });

  this._conn.on('close', function() {
    if (!self._destroyed) {
      self.destroy();
    }
  });

  this._conn.on('error', function(error) {
    self.onerror(error);
  });
};

Connection.prototype = {
  send: function(data, callback) {
    if (!callback) {
      callback = function() {};
    }

    var packet = Packet.create({}, data);

    if (!this.isAvailable()) {
      this.destroy();
      callback(new Error("Connection is not available."));
      return;
    }

    try {
      this._conn.send(packet.toJson());
    } catch (e) {
      this.destroy();
      callback(e);
      return;
    }

    if (self._silentConnectionCloseTimer) {
      clearTimeout(self._silentConnectionCloseTimer);
      self._silentConnectionCloseTimer = null;
    }
    this._connectionFactory.addConnection(this);

    callback();
  },

  destroy: function() {
    var self = this;

    if (!this._destroyed) {
      if (!this._finReceived) {
        var packet = Packet.create({FIN: true}, {});
        this._conn.send(packet.toJson());
      }

      this._destroyed = true;

      setTimeout(function() {
        self._conn.close();
      }, this._connectionCloseDelay);
    }
  },

  getRemotePeerId: function() {
    return this._conn.peer;
  },

  isAvailable: function() {
    return !this._finReceived && !this._destroyed && this._conn.open;
  }
};

module.exports = Connection;
