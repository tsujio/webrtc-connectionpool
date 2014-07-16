(function() {
  var NODE_NUM = 20;
  var nodes = [];
  var config = {
    peer: {
      options: {
        key: 'lwjd5qra8257b9'
      }
    },

    connectionPoolSize: 3,
  };

  function Node() {
    var self = this;

    this._requests = {};

    // Setup ConnectionFactory
    this._connectionFactory = new ConnectionFactory(config);

    // ConnectionFactory opened
    this._connectionFactory.onopen = function(peerId) {
      console.log("ConnectionFactory opened: " + peerId);
      nodes.push(self);
      console.log(nodes.length + " nodes now opened.");

      // Send request at a certain interval
      setInterval(function() {
        // Choose node to request at random
        var nodeToConnect = nodes[Math.floor(nodes.length * Math.random())];
        if (nodeToConnect.getPeerId() !== self.getPeerId()) {
          // Create connection
          self._connectionFactory.create(nodeToConnect.getPeerId(), function(connection, error) {
            // Failed to create connection
            if (error) {
              console.log(error);
              return;
            }

            // Set listeners to connection
            self._setupConnection(connection);

            var request = { type: 'request', requestId: Math.random().toString() };

            // Check response returns within a fixed time
            self._requests[request.requestId] = request;
            setTimeout(function() {
              if (self._requests[request.requestId]) {
                console.error("ERROR: Request timed out (requests seems to be too frequent).");
                delete self._requests[request.requestId];
              }
            }, 10000);

            // Send request
            console.log("Sending request...");
            connection.send(request);
          });
        }
      }, 2000 * NODE_NUM);
    };

    // Connection from remote
    this._connectionFactory.onconnection = function(connection) {
      self._setupConnection(connection);
    };

    // ConnectionFactory error
    this._connectionFactory.onerror = function(error) {
      console.log("ConnectionFactory error", error);
    }
  };

  Node.prototype = {
    getPeerId: function() {
      return this._connectionFactory.getPeerId();
    },

    _setupConnection: function(connection) {
      var self = this;

      // Received data
      connection.ondata = function(data) {
        if (data.type === 'request') {
          // Received request

          // Create connection (because the connection which received request may have been closed by remote)
          self._connectionFactory.create(connection.getRemotePeerId(), function(connection, error) {
            // Failed to create connection
            if (error) {
              console.log(error);
              return;
            }

            // Send response
            connection.send({ type: 'response', requestId: data.requestId });
          });
        } else {
          // Received response
          console.log("Got response.");
          delete self._requests[data.requestId];
        }
      };

      // Connection error
      connection.onerror = function(error) {
        console.log("Connection error", error);
      };
    },
  };

  // Create nodes
  var i = 0;
  setInterval(function() {
    if (i < NODE_NUM) {
      var node = new Node();
      i++;
    }
  }, 2000);
})();
