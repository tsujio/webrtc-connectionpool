var Cache = require('../src/Cache');

describe("Cache", function() {
  var cache;
  var Item = function(key) { this.key = key; };
  var items;

  beforeEach(function() {
    cache = new Cache(3, jasmine.createSpy('callbackOnCacheOut'));
    items = [];
    for (var i = 0; i < 5; i++) {
      items.push(new Item('key' + i));
    }
  });

  describe("#get", function() {
    it("should return specified item", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      expect(cache.get(items[0].key).key).toBe(items[0].key);
      expect(cache.get(items[1].key).key).toBe(items[1].key);
      expect(cache.get(items[2].key).key).toBe(items[2].key);
      expect(cache.get(items[3].key)).toBeUndefined();
    });

    it("should update use history", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      expect(cache._useHistory.length).toBe(3);
      expect(cache._useHistory[0]).toBe(items[2].key);
      expect(cache._useHistory[1]).toBe(items[1].key);
      expect(cache._useHistory[2]).toBe(items[0].key);
      cache.get(items[0].key);
      expect(cache._useHistory.length).toBe(3);
      expect(cache._useHistory[0]).toBe(items[0].key);
      expect(cache._useHistory[1]).toBe(items[2].key);
      expect(cache._useHistory[2]).toBe(items[1].key);
      cache.get(items[2].key);
      expect(cache._useHistory.length).toBe(3);
      expect(cache._useHistory[0]).toBe(items[2].key);
      expect(cache._useHistory[1]).toBe(items[0].key);
      expect(cache._useHistory[2]).toBe(items[1].key);
      cache.get(items[2].key);
      expect(cache._useHistory.length).toBe(3);
      expect(cache._useHistory[0]).toBe(items[2].key);
      expect(cache._useHistory[1]).toBe(items[0].key);
      expect(cache._useHistory[2]).toBe(items[1].key);
      cache.get(items[3].key);
      expect(cache._useHistory.length).toBe(3);
      expect(cache._useHistory[0]).toBe(items[2].key);
      expect(cache._useHistory[1]).toBe(items[0].key);
      expect(cache._useHistory[2]).toBe(items[1].key);
    });

    it("should not update use history if silent is true", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      expect(cache._useHistory.length).toBe(3);
      expect(cache._useHistory[0]).toBe(items[2].key);
      expect(cache._useHistory[1]).toBe(items[1].key);
      expect(cache._useHistory[2]).toBe(items[0].key);
      cache.get(items[0].key, true);
      expect(cache._useHistory.length).toBe(3);
      expect(cache._useHistory[0]).toBe(items[2].key);
      expect(cache._useHistory[1]).toBe(items[1].key);
      expect(cache._useHistory[2]).toBe(items[0].key);
    });
  });

  describe("#set", function() {
    it("should set passed item", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      expect(cache._items[items[0].key].key).toBe(items[0].key);
      expect(cache._items[items[1].key].key).toBe(items[1].key);
      expect(cache._items[items[2].key].key).toBe(items[2].key);
    });

    it("should remove items when exceeding the capacity", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      cache.set(items[3].key, items[3]);
      cache.set(items[4].key, items[4]);
      expect(cache._items[items[0].key]).toBeUndefined();
      expect(cache._items[items[1].key]).toBeUndefined();
      expect(cache._items[items[2].key].key).toBe(items[2].key);
      expect(cache._items[items[3].key].key).toBe(items[3].key);
      expect(cache._items[items[4].key].key).toBe(items[4].key);
    });

    it("should invoke callback when exceeding the capacity", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      cache.set(items[3].key, items[3]);
      expect(cache._callbackOnCacheOut.callCount).toBe(1);
      expect(cache._callbackOnCacheOut).toHaveBeenCalledWith(items[0]);
      cache.set(items[4].key, items[4]);
      expect(cache._callbackOnCacheOut.callCount).toBe(2);
      expect(cache._callbackOnCacheOut).toHaveBeenCalledWith(items[1]);
    });
  });

  describe("#remove", function() {
    it("should remove specified item", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      cache.remove(items[0].key);
      expect(cache._items[items[0].key]).toBeUndefined();
      expect(cache._items[items[1].key].key).toBe(items[1].key);
      expect(cache._items[items[2].key].key).toBe(items[2].key);
      expect(cache._useHistory.length).toBe(2);
      expect(cache._useHistory[0]).toBe(items[2].key);
      expect(cache._useHistory[1]).toBe(items[1].key);
    });

    it("should invoke callback", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      cache.remove(items[0].key);
      expect(cache._callbackOnCacheOut.callCount).toBe(1);
      expect(cache._callbackOnCacheOut).toHaveBeenCalledWith(items[0]);
    });
  });

  describe("#clear", function() {
    it("should clear cache", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      cache.clear();
      expect(Object.keys(cache._items).length).toBe(0);
      expect(cache._useHistory.length).toBe(0);
    });

    it("should invoke callback", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      cache.clear();
      expect(cache._callbackOnCacheOut.callCount).toBe(3);
      expect(cache._callbackOnCacheOut).toHaveBeenCalledWith(items[0]);
      expect(cache._callbackOnCacheOut).toHaveBeenCalledWith(items[1]);
      expect(cache._callbackOnCacheOut).toHaveBeenCalledWith(items[2]);
    });
  });

  describe("#touch", function() {
    it("should update use history", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      cache.touch(items[1].key);
      expect(cache._useHistory.length).toBe(3);
      expect(cache._useHistory[0]).toBe(items[1].key);
      expect(cache._useHistory[1]).toBe(items[2].key);
      expect(cache._useHistory[2]).toBe(items[0].key);
    });

    it("should not update use history if passed an item which doesn't cached", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      cache.touch(items[3].key);
      expect(cache._useHistory.length).toBe(3);
      expect(cache._useHistory[0]).toBe(items[2].key);
      expect(cache._useHistory[1]).toBe(items[1].key);
      expect(cache._useHistory[2]).toBe(items[0].key);
    });
  });

  describe("#has", function() {
    it("should return whether specified item is cached or not", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      expect(cache.has(items[0].key)).toBeTruthy();
      expect(cache.has(items[1].key)).toBeTruthy();
      expect(cache.has(items[2].key)).toBeTruthy();
      expect(cache.has(items[3].key)).toBeFalsy();
    });
  });

  describe("#keys", function() {
    it("should return cached keys", function() {
      cache.set(items[0].key, items[0]);
      cache.set(items[1].key, items[1]);
      cache.set(items[2].key, items[2]);
      expect(cache.keys().length).toBe(3);
      expect(cache.keys().indexOf(items[0].key)).not.toBe(-1);
      expect(cache.keys().indexOf(items[1].key)).not.toBe(-1);
      expect(cache.keys().indexOf(items[2].key)).not.toBe(-1);
      expect(cache.keys().indexOf(items[3].key)).toBe(-1);
    });
  });
});
