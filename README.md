webrtc-connectionpool
=================

A library of [peerjs](https://github.com/peers/peerjs) implementing connection pool.

# Usage

## Including Libraries
```html
<script type="text/javascript" src="path/to/peer.js"></script>
<script type="text/javascript" src="path/to/webrtc-connectionpool.js"></script>
```

## Setup
```javascript
var connectionFactory = new ConnectionFactory({
  // An object to pass to the Peer constructor.
  // See the PeerJS document for details.
  peer: {
    id: 'yourid',
    options: {
      host: ...,
      ...
    }
  },

  // The capacity of the connection pool.
  connectionPoolSize: 10 
});

connectionFactory.onopen = function(myPeerId) {
  console.log("Setup ConnectionFactory: " + myPeerId);
};

connectionFactory.onconnection = function(connection) {
  console.log("Connection from " + connection.getRemotePeerId());

  connection.ondata = function(data) {
    console.log("Received data: " + data);
  };

  connection.onerror = function(error) {
    console.log("ERROR: " + error);
  };
};

connectionFactory.onerror = function(error) {
  console.log("ERROR: " + error);
};
```

## Create Connection and Send
```javascript
connectionFactory.create(peerIdToConnect, function(connection, error) {
  if (error) {
    console.log("Failed to create connection: " + error);
    return;
  }

  connection.ondata = function(data) {
    console.log("Received data: " + data);
  };

  connection.onerror = function(error) {
    console.log("ERROR: " + error);
  };

  connection.send(data);
});
```

## Destroy ConnectionFactory
```javascript
connectionFactory.destroy();
```
