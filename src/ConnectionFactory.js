var PeerAgent = require('./PeerAgent');
var Connection = require('./Connection');
var Cache = require('./Cache');
var Queue = require('./Queue');
var Util = require('./Util');

function ConnectionFactory(config) {
  Util.initializeDebugLog(config.debug);

  this._peerAgent = null;
  this._connectionPool = new Cache(
    config.connectionPoolSize >= 0 ? config.connectionPoolSize : 10, function(connection) {
      connection.destroy();
    });
  this._callbackQueue = new Queue();
  this.onopen = function() {};
  this.onerror = function() {};
  this.onconnection = function() {};
  this.version = Util.version.join('.');

  this._setupPeerAgent(config);
};

ConnectionFactory.prototype = {
  _setupPeerAgent: function(config) {
    var self = this;

    this._peerAgent = new PeerAgent(config);

    this._peerAgent.onopen = function(peerId) {
      self.onopen(peerId);
    };

    this._peerAgent.onconnectionopened = function(peerId, conn, error) {
      if (error) {
        self._invokeNextCallback(peerId, null, error);
        return;
      }

      if (self._connectionPool.has(peerId)) {
        self._connectionPool.remove(peerId);
      }

      var connection = new Connection(conn, self, config);
      self._invokeNextCallback(peerId, connection);
    };

    this._peerAgent.onconnection = function(peerId, conn) {
      if (self._connectionPool.has(peerId)) {
        self._connectionPool.remove(peerId);
      }

      var connection = new Connection(conn, self, config);
      self.onconnection(connection);
    };

    this._peerAgent.onclose = function() {
    };

    this._peerAgent.onerror = function(error) {
      self.onerror(error);
    };
  },

  create: function(remotePeerId, callback) {
    var self = this;

    if (!remotePeerId) {
      callback(null, new Error("Invalid peer id."));
      return;
    }

    this._callbackQueue.enqueue({
      peerId: remotePeerId,
      callback: callback
    });

    this._createConnectionAndInvokeNextCallback();
  },

  _createConnectionAndInvokeNextCallback: function() {
    var self = this;

    var callbackInfo = this._callbackQueue.first();
    if (!callbackInfo) {
      return;
    }

    if (this._peerAgent.isWaitingForOpeningConnection()) {
      return;
    }

    if (this._connectionPool.has(callbackInfo.peerId)) {
      var connection = this._connectionPool.get(callbackInfo.peerId);
      if (connection.isAvailable()) {
        this._invokeNextCallback(connection.getRemotePeerId(), connection);
        return;
      }

      this._connectionPool.remove(connection.getRemotePeerId());
    }

    this._peerAgent.connect(callbackInfo.peerId);
  },

  _invokeNextCallback: function(peerId, connection, error) {
    var self = this;

    setTimeout(function() {
      self._createConnectionAndInvokeNextCallback();
    }, 0);

    var callbackInfo = this._callbackQueue.dequeue();
    if (!callbackInfo) {
      console.warn("Unknown situation.");
      return;
    }
    if (callbackInfo.peerId !== peerId) {
      callbackInfo.callback(null, new Error("Unknown situation."));
      return;
    }
    callbackInfo.callback(connection, error);
  },

  addConnection: function(connection) {
    var _connection = this._connectionPool.get(connection.getRemotePeerId(), true);
    if (_connection && _connection.id !== connection.id) {
      this._connectionPool.remove(_connection.getRemotePeerId());
    }
    this._connectionPool.set(connection.getRemotePeerId(), connection);
  },

  removeConnection: function(remotePeerId) {
    this._connectionPool.remove(remotePeerId);
  },

  destroy: function() {
    this._connectionPool.clear();
    this._peerAgent.destroy();
  },

  getPeerId: function() {
    return this._peerAgent.getPeerId();
  }
};

module.exports = ConnectionFactory;
