//! A In-memory cache implementation with S3FIFO [S3-FIFO](https://s3fifo.com/) as the eviction policy.
//!
//! S3FIFO improves cache hit ratio noticeably compared to LRU.

const std = @import("std");
const Allocator = std.mem.Allocator;
const DoublyLinkedList = std.DoublyLinkedList;
const Deque = @import("Deque.zig").Deque;

/// Maximum frequency limit for an entry in the cache.
const unused_max_freq: u2 = 3;

pub fn S3FIFO(
    comptime K: type,
    comptime V: type,
    comptime Context: type,
    /// Optional callback function for node eviction.
    comptime on_evict: ?fn (Context, K, V) void,
) type {
    return struct {
        const Self = @This();

        /// Represents an entry in the cache.
        const Entry = struct {
            key: K align(@alignOf(K)),
            value: V align(@alignOf(V)),
            /// Frequency of access of this entry.
            freq: u2 align(1) = 0,
        };

        const GhostEntry = std.meta.Tuple(&[_]type{ K, u2 });

        const GeneralPurposeList = DoublyLinkedList(Entry);

        const Small = GeneralPurposeList;
        const Main = GeneralPurposeList;
        const Ghost = Deque(GhostEntry);

        const Node = GeneralPurposeList.Node;

        inline fn initNode(self: *Self, key: K, value: V) !*Node {
            const node = try self.allocator.create(Node);

            node.* = .{
                .data = .{
                    .key = key,
                    .value = value,
                },
            };

            return node;
        }

        inline fn deinitNode(self: *Self, node: *Node) void {
            self.allocator.destroy(node);
        }

        const Entries =
            if (K == []const u8)
                std.StringArrayHashMap(*Node)
            else
                std.AutoArrayHashMap(K, *Node);

        allocator: Allocator,
        ctx: Context,

        /// Map of all entries for quick access.
        entries: Entries,
        /// Small queue for entries with low frequency.
        small: Small,
        /// Main queue for entries with high frequency.
        main: Main,
        /// Ghost queue for evicted entries.
        ghost: Ghost,

        max_cache_size: usize,
        max_main_size: usize,

        /// Creates a new cache with the given maximum size.
        pub fn init(
            allocator: Allocator,
            ctx: Context,
            max_cache_size: usize,
        ) Allocator.Error!Self {
            const max_small_size = max_cache_size / 10;
            const max_main_size = max_cache_size - max_small_size;

            return .{
                .allocator = allocator,
                .ctx = ctx,

                .entries = Entries.init(allocator),
                .small = .{},
                .main = .{},
                .ghost = try Ghost.init(allocator),

                .max_cache_size = max_cache_size,
                .max_main_size = max_main_size,
            };
        }

        pub fn deinit(self: *Self) void {
            while (self.small.pop()) |node| {
                self.deinitNode(node);
            }

            while (self.main.pop()) |node| {
                self.deinitNode(node);
            }

            self.ghost.deinit();

            self.entries.deinit();
        }

        /// Returns a reference to the value of the given key if it exists in the cache.
        pub fn get(self: *Self, key: K) ?V {
            if (self.entries.get(key)) |node| {
                node.data.freq = node.data.freq +% 1;

                return node.data.value;
            }

            return null;
        }

        /// Inserts a new entry with the given key and value into the cache.
        pub fn insert(self: *Self, key: K, value: V) Allocator.Error!void {
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
            tail.data.freq = 0;

            self.main.prepend(tail);
        }

        inline fn insertGhost(self: *Self, tail: *Node) Allocator.Error!void {
            if (self.ghost.len() == self.max_main_size) {
                const key, const freq = self.ghost.popBack().?;

                if (freq < 0) {
                    _ = self.entries.swapRemove(key);
                }
            }

            try self.ghost.pushFront(.{ tail.data.key, tail.data.freq });
        }

        inline fn notifyEviction(self: *Self, node: *Node) void {
            if (comptime on_evict) |T| {
                T(self.ctx, node.data.key, node.data.value);
            }
        }

        // Ensure there is at least one location free for a new item.
        inline fn evict(self: *Self) !void {
            while (self.small.len + self.main.len >= self.max_cache_size) {
                if (self.main.len >= self.max_main_size or self.small.len == 0) {
                    self.evictMain();
                } else {
                    try self.evictSmall();
                }
            }
        }

        inline fn evictSmall(self: *Self) !void {
            while (self.small.pop()) |tail| {
                if (tail.data.freq > 0) {
                    self.insertMain(tail);
                } else {
                    try self.insertGhost(tail);

                    self.notifyEviction(tail);

                    self.deinitNode(tail);

                    break;
                }
            }
        }

        inline fn evictMain(self: *Self) void {
            while (self.main.pop()) |tail| {
                if (tail.data.freq > 0) {
                    tail.data.freq -= 1;

                    self.main.prepend(tail);
                } else {
                    _ = self.entries.swapRemove(tail.data.key);

                    self.notifyEviction(tail);

                    self.deinitNode(tail);
                }
            }
        }
    };
}

test S3FIFO {
    var cache = S3FIFO(u32, u32, null).init(std.testing.allocator, 64) catch unreachable;
    defer cache.deinit();

    const start = std.time.nanoTimestamp();

    var i: u32 = 0;

    while (i < 1000000) : (i += 1) {
        _ = cache.get(i % 500);
    }

    const end = std.time.nanoTimestamp();
    const elapsed_ns: f64 = @floatFromInt(end - start);
    const time_per_get = elapsed_ns / 1000000;
    std.debug.print("Time per get: {d:.2}ns\n", .{time_per_get});
}
