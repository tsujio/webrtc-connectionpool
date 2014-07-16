function Queue(items) {
  this._items = [];

  if (items) {
    for (var i = 0; i < items.length; i++) {
      this._items.push(items[i]);
    }
  }
};

Queue.prototype = {
  enqueue: function(item) {
    this._items.push(item);
  },

  dequeue: function() {
    if (this._items.length === 0) {
      return undefined;
    }
    return this._items.shift();
  },

  first: function() {
    if (this._items.length === 0) {
      return undefined;
    }
    return this._items[0];
  },

  last: function() {
    if (this._items.length === 0) {
      return undefined;
    }
    return this._items[this._items.length - 1];
  },

  size: function() {
    return this._items.length;
  },
};

module.exports = Queue;
