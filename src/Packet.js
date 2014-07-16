var Util = require('./Util');

function Packet(id, version, flags, payload) {
  if (typeof id !== 'string' || typeof version !== 'object' || typeof flags !== 'object') {
    throw new Error("[Packet] Invalid argument.");
  }

  if (version[0] !== Util.version[0]) {
    throw new Error("[Packet] Incompatible version: " + version.join('.'));
  }

  this.id = id;
  this.version = version;
  this.flags = flags;
  this.payload = payload;
};

Packet.create = function(flags, payload) {
  return new Packet(Util.generateRandomId(8), Util.version, flags, payload);
};

Packet.fromJson = function(json) {
  if (typeof json !== 'object') {
    throw new Error("[Packet] Invalid argument.");
  }
  return new Packet(json.id, json.version, json.flags, json.payload);
};

Packet.prototype = {
  toJson: function() {
    return {
      id: this.id,
      version: this.version,
      flags: this.flags,
      payload: this.payload,
    };
  }
};

module.exports = Packet;
