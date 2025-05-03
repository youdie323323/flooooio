const std = @import("std");
const Allocator = std.mem.Allocator;
const DoublyLinkedList = std.DoublyLinkedList;
const testing = std.testing;
const Mutex = std.Thread.RwLock;
const Atomic = std.atomic;

/// Concurrent LRUCache using RWLock
pub fn LruCache(comptime K: type, comptime V: type) type {
    return struct {
        const HashMapForString = std.StringHashMap(*Node);
        const GeneralHashMap = std.HashMap(K, *Node, std.hash_map.AutoContext(K), std.hash_map.default_max_load_percentage);

        allocator: Allocator,
        hashmap: if (K == []const u8) HashMapForString else GeneralHashMap,
        list: DoublyLinkedList(LruEntry),
        max_items: usize,
        len: usize,

        const Self = @This();

        pub const LruEntry = struct {
            key: K,
            value: V,

            const Self = @This();

            pub fn init(key: K, val: V) LruEntry {
                return LruEntry{
                    .key = key,
                    .value = val,
                };
            }
        };

        const Node = DoublyLinkedList(LruEntry).Node;

        fn initNode(self: *Self, key: K, val: V) error{OutOfMemory}!*Node {
            self.len += 1;

            const node = try self.allocator.create(Node);

            node.* = .{ .data = LruEntry.init(key, val) };

            return node;
        }

        fn deinitNode(self: *Self, node: *Node) void {
            self.len -= 1;

            self.allocator.destroy(node);
        }

        pub fn init(allocator: Allocator, max_items: usize) error{OutOfMemory}!Self {
            const hashmap =
                if (K == []const u8)
                    HashMapForString.init(allocator)
                else
                    GeneralHashMap.init(allocator);

            var self = Self{
                .allocator = allocator,
                .hashmap = hashmap,
                .list = DoublyLinkedList(LruEntry){},
                .max_items = max_items,
                .len = 0,
            };

            // pre allocate enough capacity for max items since we will use
            // assumed capacity and non-clobber methods
            try self.hashmap.ensureTotalCapacity(self.max_items);

            return self;
        }

        pub fn deinit(self: *Self) void {
            while (self.list.pop()) |node| {
                self.deinitNode(node);
            }

            self.hashmap.deinit();
        }

        /// Recycles an old node if LruCache capacity is full. If replaced, first element of tuple is replaced
        /// Entry (otherwise null) and second element of tuple is inserted Entry.
        fn recycleOrCreateNode(self: *Self, key: K, value: V) error{OutOfMemory}!struct { ?LruEntry, LruEntry } {
            if (self.list.len == self.max_items) {
                const recycled_node = self.list.popFirst().?;
                _ = self.hashmap.swap(recycled_node.data.key);

                recycled_node.data.key = key;
                recycled_node.data.value = value;

                self.list.append(recycled_node);
                self.hashmap.putAssumeCapacityNoClobber(key, recycled_node);

                return .{ recycled_node.data, recycled_node.data };
            }

            // Key not exist, alloc a new node
            const node = try self.initNode(key, value);

            self.hashmap.putAssumeCapacityNoClobber(key, node);
            self.list.append(node);

            return .{ null, node.data };
        }

        fn internalInsert(self: *Self, key: K, value: V) LruEntry {
            // if key exists, we update it
            if (self.hashmap.get(key)) |existing_node| {
                existing_node.data.value = value;

                self.reorder(existing_node);

                return existing_node.data;
            }

            const replaced_and_created_node = self.recycleOrCreateNode(key, value) catch unreachable;

            const new_lru_entry = replaced_and_created_node[1];

            return new_lru_entry;
        }

        /// Inserts key/value if key doesn't exist, updates only value if it does.
        /// In any case, it will affect cache ordering.
        pub fn insert(self: *Self, key: K, value: V) error{OutOfMemory}!void {
            _ = self.internalInsert(key, value);

            return;
        }

        /// Whether or not contains key.
        /// NOTE: doesn't affect cache ordering.
        pub fn contains(self: *Self, key: K) bool {
            return self.hashmap.contains(key);
        }

        /// Most recently used entry
        pub fn mru(self: *Self) ?LruEntry {
            if (self.list.last) |node| {
                return node.data;
            }

            return null;
        }

        /// Least recently used entry.
        pub fn lru(self: *Self) ?LruEntry {
            if (self.list.first) |node| {
                return node.data;
            }

            return null;
        }

        /// reorder Node to the top.
        fn reorder(self: *Self, node: *Node) void {
            self.list.remove(node);
            self.list.append(node);
        }

        /// Gets value associated with key if exists.
        pub fn get(self: *Self, key: K) ?V {
            if (self.hashmap.get(key)) |node| {
                self.list.remove(node);
                self.list.append(node);

                return node.data.value;
            }

            return null;
        }

        pub fn pop(self: *Self, k: K) ?V {
            if (self.hashmap.fetchSwapRemove(k)) |kv| {
                const node = kv.value;

                self.list.remove(node);
                defer self.deinitNode(node);

                return node.data.value;
            }

            return null;
        }

        pub fn peek(self: *Self, key: K) ?V {
            if (self.hashmap.get(key)) |node| {
                return node.data.value;
            }

            return null;
        }

        /// Puts a key-value pair into cache. If the key already exists in the cache, then it updates
        /// the key's value and returns the old value. Otherwise, `null` is returned.
        pub fn put(self: *Self, key: K, value: V) ?V {
            if (self.hashmap.getEntry(key)) |existing_entry| {
                const existing_node: *Node = existing_entry.value_ptr.*;

                const old_value = existing_node.data.value;

                existing_node.data.value = value;

                self.reorder(existing_node);

                return old_value;
            }

            _ = self.internalInsert(key, value);

            return null;
        }

        /// Removes key from cache. Returns true if found, false if not.
        pub fn remove(self: *Self, key: K) bool {
            if (self.hashmap.fetchSwapRemove(key)) |kv| {
                const node = kv.value;

                self.list.remove(node);
                self.deinitNode(node);

                return true;
            }

            return false;
        }
    };
}
