var Peer = require('peerjs');

function PeerAgent(config) {
  var self = this;

  this._connectionOpenTimeout = config.connectionOpenTimeout >= 0 ?
    config.connectionOpenTimeout : 30000;
  this.onopen = function() {};
  this.onconnectionopened = function() {};
  this.onconnection = function() {};
  this.onclose = function() {};
  this.onerror = function() {};
  this._waitingTimer = null;

  var peerConfig = config.peer ? config.peer : {};
  if (!peerConfig.id) {
    this._peer = new Peer(peerConfig.options);
  } else {
    this._peer = new Peer(peerConfig.id, peerConfig.options);
  }

  this._peer.on('open', function(id) {
    self._peer.on('connection', function(conn) {
      conn.on('open', function() {
        self.onconnection(conn.peer, conn);
      });
    });

    self._peer.on('close', function() {
      self.onclose();
    });

    self.onopen(id);
  });

  this._peer.on('disconnected', function() {
    if (!self._peer.destroyed) {
      self._peer.reconnect();
    }
  });

  this._peer.on('error', function(error) {
    var match = error.message.match(/Could not connect to peer (\w+)/);
    if (match) {
      if (!self.isWaitingForOpeningConnection()) {
        return;
      }

      clearTimeout(self._waitingTimer);
      self._waitingTimer = null;

      var peerId = match[1];
      callbacks.onconnectionopened(peerId, null, error);
      return;
    }

    self.onerror(error);
  });
};

PeerAgent.prototype = {
  connect: function(peerId) {
    var self = this;

    if (this.isWaitingForOpeningConnection()) {
      this.onconnectionopened(peerId, null, new Error("Invalid state."));
    }

    var conn = this._peer.connect(peerId);
    if (!conn) {
      this.onconnectionopened(peerId, null, new Error("Failed to open connection to " + peerId + "."));
      return;
    }

    this._waitingTimer = setTimeout(function() {
      if (!self.isWaitingForOpeningConnection()) {
        return;
      }

      self._waitingTimer = null;

      self.onconnectionopened(peerId, null, new Error("Opening connection to " + peerId + " timed out."));
    }, this._connectionOpenTimeout);

    conn.on('open', function() {
      if (!self.isWaitingForOpeningConnection()) {
        conn.close();
        return;
      }

      clearTimeout(self._waitingTimer);
      self._waitingTimer = null;

      self.onconnectionopened(peerId, conn);
    });
  },

  isWaitingForOpeningConnection: function() {
    return this._waitingTimer !== null;
  },

  destroy: function() {
    this._peer.destroy();
  },

  getPeerId: function() {
    return this._peer.id;
  }
};

module.exports = PeerAgent;
