var Queue = require('../src/Queue');

describe("Queue", function() {
  var queue;

  beforeEach(function() {
    queue = new Queue();
  });

  describe("#enqueue", function() {
    it("should enqueue passed item", function() {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue._items[0]).toBe(1);
      expect(queue._items[1]).toBe(2);
      expect(queue._items[2]).toBe(3);
    });
  });

  describe("#dequeue", function() {
    it("should dequeue the first item", function() {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      var item1 = queue.dequeue();
      var item2 = queue.dequeue();
      var item3 = queue.dequeue();
      var item4 = queue.dequeue();
      expect(item1).toBe(1);
      expect(item2).toBe(2);
      expect(item3).toBe(3);
      expect(item4).toBeUndefined();
    });
  });

  describe("#first", function() {
    it("should return the first item", function() {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.first()).toBe(1);
      expect(queue._items[0]).toBe(1);
      expect(queue._items[1]).toBe(2);
      expect(queue._items[2]).toBe(3);
    });
  });

  describe("#last", function() {
    it("should return the last item", function() {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.last()).toBe(3);
      expect(queue._items[0]).toBe(1);
      expect(queue._items[1]).toBe(2);
      expect(queue._items[2]).toBe(3);
    });
  });

  describe("#size", function() {
    it("should return the size", function() {
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size()).toBe(3);
    });
  });
});
