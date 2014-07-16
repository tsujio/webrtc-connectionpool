function Cache(capacity, callbackOnCacheOut) {
  this._items = {};
  this._useHistory = [];
  this._capacity = capacity;
  this._callbackOnCacheOut = callbackOnCacheOut;
};

Cache.prototype = {
  get: function(key, silent) {
    if (!this._items[key]) {
      return undefined;
    }
    if (!silent) {
      this._updateUseHistory(key);
    }
    return this._items[key];
  },

  set: function(key, item) {
    this._items[key] = item;
    this._updateUseHistory(key);
    if (Object.keys(this._items).length > this._capacity) {
      var keysToRemove = this._useHistory.slice(this._capacity);
      this._useHistory = this._useHistory.slice(0, this._capacity);
      for (var i = 0; i < keysToRemove.length; i++) {
        var itemToRemove = this._items[keysToRemove[i]];
        delete this._items[keysToRemove[i]];
        this._callbackOnCacheOut(itemToRemove);
      };
    }
  },

  remove: function(key) {
    if (!this._items[key]) {
      return;
    }
    var newUseHistory = [];
    for (var i = 0; i < this._useHistory.length; i++) {
      if (this._useHistory[i] !== key) {
        newUseHistory.push(this._useHistory[i]);
      }
    }
    this._useHistory = newUseHistory;
    var itemToRemove = this._items[key];
    delete this._items[key];
    this._callbackOnCacheOut(itemToRemove);
  },

  clear: function() {
    var keys = Object.keys(this._items);
    for (var i = 0; i < keys.length; i++) {
      this._callbackOnCacheOut(this._items[keys[i]]);
    }
    this._items = {};
    this._useHistory = [];
  },

  touch: function(key) {
    if (this._items[key]) {
      this._updateUseHistory(key);
    }
  },

  has: function(key) {
    return !!this._items[key];
  },

  keys: function() {
    return Object.keys(this._items);
  },

  _updateUseHistory: function(key) {
    for (var i = 0; i < this._useHistory.length; i++) {
      if (this._useHistory[i] === key) {
        this._useHistory.splice(i, 1);
        break;
      }
    }
    this._useHistory.unshift(key);
  }
};

module.exports = Cache;
