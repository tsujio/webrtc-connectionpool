Util = {
  version: [1, 0, 0],

  generateRandomId: function(length) {
    var id = "";
    while (id.length < length) {
      id += Math.random().toString(36).substr(2);
    }
    return id.substr(0, length);
  },

  initializeDebugLog: function(enabled) {
    Util.debug = function() {
      if (enabled) {
        var args = Array.prototype.slice.call(arguments);
        var d = new Date()
        var timeStr = [d.getHours(), d.getMinutes(), d.getSeconds()].join(':') + ':';
        args.unshift(timeStr);
        console.log.apply(console, args);
      }
    };
  },
};

module.exports = Util;
