//! A In-memory cache implementation with S3FIFO [S3-FIFO](https://s3fifo.com/) as the eviction policy.
//!
//! S3FIFO improves cache hit ratio noticeably compared to LRU.

const std = @import("std");
const AtomicU8 = std.atomic.Value(u8);
const Allocator = std.mem.Allocator;
const DoublyLinkedList = std.DoublyLinkedList;

/// Maximum frequency limit for an entry in the cache.
const max_freq: u8 = 3;

pub fn S3fifo(comptime K: type, comptime V: type) type {
    return struct {
        const Small = DoublyLinkedList(Entry);
        const Main = DoublyLinkedList(Entry);
        const Ghost = DoublyLinkedList(K);

        const StringKeyHashMap = std.StringArrayHashMap(*Node);
        const NonStringKeyHashMap = std.AutoArrayHashMap(K, *Node);

        const Entries =
            if (K == []const u8)
                StringKeyHashMap
            else
                NonStringKeyHashMap;

        allocator: Allocator,
        /// Small queue for entries with low frequency.
        small: Small,
        /// Main queue for entries with high frequency.
        main: Main,
        /// Ghost queue for evicted entries.
        ghost: Ghost,
        /// Map of all entries for quick access.
        entries: Entries,
        max_cache_size: usize,
        max_main_size: usize,
        len: usize,

        const Self = @This();

        /// Represents an entry in the cache.
        pub const Entry = struct {
            key: K,
            value: V,
            /// Frequency of access of this entry.
            feq: AtomicU8,

            const Self = @This();

            /// Creates a new entry with the given key and value.
            pub inline fn init(key: K, val: V) Entry {
                return Entry{
                    .key = key,
                    .value = val,
                    .feq = AtomicU8.init(0),
                };
            }
        };

        const Node = Main.Node;

        const GhostNode = Ghost.Node;

        inline fn initNode(self: *Self, key: K, val: V) error{OutOfMemory}!*Node {
            self.len += 1;

            const node = try self.allocator.create(Node);

            node.* = .{ .data = Entry.init(key, val) };

            return node;
        }

        inline fn deinitNode(self: *Self, node: *Node) void {
            self.len -= 1;

            self.allocator.destroy(node);
        }

        /// Creates a new cache with the given maximum size.
        pub fn init(allocator: Allocator, max_cache_size: usize) Self {
            const max_small_size = max_cache_size / 10;
            const max_main_size = max_cache_size - max_small_size;

            return Self{
                .allocator = allocator,
                .small = DoublyLinkedList(Entry){},
                .main = DoublyLinkedList(Entry){},
                .ghost = DoublyLinkedList(K){},
                .entries = Entries.init(allocator),
                .max_cache_size = max_cache_size,
                .max_main_size = max_main_size,
                .len = 0,
            };
        }

        pub fn deinit(self: *Self) void {
            while (self.small.pop()) |node| {
                self.deinitNode(node);
            }

            while (self.ghost.pop()) |node| : (self.len -= 1) {
                self.allocator.destroy(node);
            }

            while (self.main.pop()) |node| {
                self.deinitNode(node);
            }

            self.entries.deinit();
        }

        /// Returns a reference to the value of the given key if it exists in the cache.
        pub fn get(self: *Self, key: K) ?V {
            if (self.entries.get(key)) |node| {
                const freq = @min(node.data.feq.load(.seq_cst) + 1, max_freq);

                node.data.feq.store(freq, .seq_cst);

                return node.data.value;
            } else {
                return null;
            }
        }

        /// Inserts a new entry with the given key and value into the cache.
        pub fn insert(self: *Self, key: K, value: V) error{OutOfMemory}!void {
            try self.evict();

            const node = try self.initNode(key, value);

            if (self.entries.contains(key)) {
                self.main.append(node);
            } else {
                try self.entries.put(key, node);

                self.small.append(node);
            }
        }

        inline fn insertMain(self: *Self, tail: *Node) void {
            self.len += 1;

            self.main.prepend(tail);
        }

        inline fn insertGhost(self: *Self, tail: *Node) !void {
            if (self.ghost.len >= self.max_main_size) {
                const key = self.ghost.popFirst().?;

                self.allocator.destroy(key);

                _ = self.entries.swapRemove(key.data);

                self.len -= 1;
            }

            const node = try self.allocator.create(GhostNode);

            node.* = .{ .data = tail.data.key };

            self.ghost.append(node);

            self.len += 1;
        }

        inline fn evict(self: *Self) !void {
            if (self.small.len + self.main.len >= self.max_cache_size) {
                if (self.main.len >= self.max_main_size or self.small.len == 0) {
                    self.evictMain();
                } else {
                    try self.evictSmall();
                }
            }
        }

        inline fn evictMain(self: *Self) void {
            while (self.main.popFirst()) |tail| {
                const freq = tail.data.feq.load(.seq_cst);
                if (freq > 0) {
                    tail.data.feq.store(freq - 1, .seq_cst);

                    self.main.append(tail);
                } else {
                    _ = self.entries.swapRemove(tail.data.key);
                    
                    self.deinitNode(tail);

                    break;
                }
            }
        }

        inline fn evictSmall(self: *Self) !void {
            while (self.small.popFirst()) |tail| {
                if (tail.data.feq.load(.seq_cst) > 1) {
                    self.insertMain(tail);
                } else {
                    try self.insertGhost(tail);

                    self.deinitNode(tail);

                    break;
                }
            }
        }
    };
}
