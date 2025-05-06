const std = @import("std");
const mem = std.mem;
const math = std.math;
const Allocator = mem.Allocator;

/// Double-ended queue ported from Rust's standard library, which is provided under MIT License.
/// It can be found at https://github.com/rust-lang/rust/blob/master/LICENSE-MIT
pub fn Deque(comptime T: type) type {
    return struct {
        allocator: Allocator,
        /// tail and head are pointers into the buffer. Tail always points
        /// to the first element that could be read, Head always points
        /// to where data should be written.
        /// If tail == head the buffer is empty. The length of the ringbuffer
        /// is defined as the distance between the two.
        tail: usize,
        head: usize,
        /// Users should **NOT** use this field directly.
        /// In order to access an item with an index, use `get` method.
        /// If you want to iterate over the items, call `iterator` method to get an iterator.
        buf: []T,

        const Self = @This();

        const initial_capacity = 7; // 2^3 - 1
        const minimum_capacity = 1; // 2 - 1

        /// Creates an empty deque.
        /// Deinitialize with `deinit`.
        pub fn init(allocator: Allocator) Allocator.Error!Self {
            return initCapacity(allocator, initial_capacity);
        }

        /// Creates an empty deque with space for at least `capacity` elements.
        ///
        /// Note that there is no guarantee that the created Deque has the specified capacity.
        /// If it is too large, this method gives up meeting the capacity requirement.
        /// In that case, it will instead create a Deque with the default capacity anyway.
        ///
        /// Deinitialize with `deinit`.
        pub fn initCapacity(allocator: Allocator, capacity: usize) Allocator.Error!Self {
            const effective_cap =
                math.ceilPowerOfTwo(usize, @max(capacity +| 1, minimum_capacity + 1)) catch
                    math.ceilPowerOfTwoAssert(usize, initial_capacity + 1);

            const buf = try allocator.alloc(T, effective_cap);

            return Self{
                .allocator = allocator,
                .tail = 0,
                .head = 0,
                .buf = buf,
            };
        }

        /// Release all allocated memory.
        pub fn deinit(self: Self) void {
            self.allocator.free(self.buf);
        }

        /// Returns the length of the already-allocated buffer.
        pub inline fn cap(self: Self) usize {
            return self.buf.len;
        }

        /// Returns the number of elements in the deque.
        pub inline fn len(self: Self) usize {
            return count(self.tail, self.head, self.cap());
        }

        /// Gets the pointer to the element with the given index, if any.
        /// Otherwise it returns `null`.
        pub fn get(self: Self, index: usize) ?*T {
            if (index >= self.len()) return null;

            const idx = self.wrapAdd(self.tail, index);

            return &self.buf[idx];
        }

        /// Gets the pointer to the first element, if any.
        pub fn front(self: Self) ?*T {
            return self.get(0);
        }

        /// Gets the pointer to the last element, if any.
        pub fn back(self: Self) ?*T {
            const last_idx = math.sub(usize, self.len(), 1) catch return null;

            return self.get(last_idx);
        }

        /// Adds the given element to the back of the deque.
        pub fn pushBack(self: *Self, item: T) Allocator.Error!void {
            if (self.isFull()) {
                try self.grow();
            }

            const head = self.head;

            self.head = self.wrapAdd(self.head, 1);

            self.buf[head] = item;
        }

        /// Adds the given element to the front of the deque.
        pub fn pushFront(self: *Self, item: T) Allocator.Error!void {
            if (self.isFull()) try self.grow();

            self.tail = self.wrapSub(self.tail, 1);

            const tail = self.tail;

            self.buf[tail] = item;
        }

        /// Pops and returns the last element of the deque.
        pub fn popBack(self: *Self) ?T {
            if (self.len() == 0) return null;

            self.head = self.wrapSub(self.head, 1);

            const head = self.head;

            const item = self.buf[head];

            self.buf[head] = undefined;

            return item;
        }

        /// Pops and returns the first element of the deque.
        pub fn popFront(self: *Self) ?T {
            if (self.len() == 0) return null;

            const tail = self.tail;

            self.tail = self.wrapAdd(self.tail, 1);

            const item = self.buf[tail];

            self.buf[tail] = undefined;

            return item;
        }

        /// Adds all the elements in the given slice to the back of the deque.
        pub fn appendSlice(self: *Self, items: []const T) Allocator.Error!void {
            for (items) |item| {
                try self.pushBack(item);
            }
        }

        /// Adds all the elements in the given slice to the front of the deque.
        pub fn prependSlice(self: *Self, items: []const T) Allocator.Error!void {
            if (items.len == 0) return;

            var i: usize = items.len - 1;

            while (true) : (i -= 1) {
                const item = items[i];

                try self.pushFront(item);

                if (i == 0) break;
            }
        }

        pub const Iterator = struct {
            head: usize,
            tail: usize,
            ring: []T,

            pub fn next(it: *Iterator) ?*T {
                if (it.head == it.tail) return null;

                const tail = it.tail;

                it.tail = wrapIndex(it.tail +% 1, it.ring.len);

                return &it.ring[tail];
            }

            pub fn nextBack(it: *Iterator) ?*T {
                if (it.head == it.tail) return null;

                it.head = wrapIndex(it.head -% 1, it.ring.len);
                
                return &it.ring[it.head];
            }
        };

        /// Returns an iterator over the deque.
        /// Modifying the deque may invalidate this iterator.
        pub fn iterator(self: Self) Iterator {
            return .{
                .head = self.head,
                .tail = self.tail,
                .ring = self.buf,
            };
        }

        /// Returns `true` if the buffer is at full capacity.
        inline fn isFull(self: Self) bool {
            return self.cap() - self.len() == 1;
        }

        inline fn grow(self: *Self) Allocator.Error!void {
            const old_cap = self.cap();

            // Reserve additional space to accomodate more items
            self.buf = try self.allocator.realloc(self.buf, old_cap * 2);

            // Update `tail` and `head` pointers accordingly
            self.handleCapacityIncrease(old_cap);
        }

        /// Updates `tail` and `head` values to handle the fact that we just reallocated the internal buffer.
        inline fn handleCapacityIncrease(self: *Self, old_capacity: usize) void {
            const new_capacity = self.cap();

            // Move the shortest contiguous section of the ring buffer.
            // There are three cases to consider:
            //
            // (A) No need to update
            //          T             H
            // before: [o o o o o o o . ]
            //
            // after : [o o o o o o o . . . . . . . . . ]
            //          T             H
            //
            //
            // (B) [..H] needs to be moved
            //              H T
            // before: [o o . o o o o o ]
            //          ---
            //           |_______________.
            //                           |
            //                           v
            //                          ---
            // after : [. . . o o o o o o o . . . . . . ]
            //                T             H
            //
            //
            // (C) [T..old_capacity] needs to be moved
            //                    H T
            // before: [o o o o o . o o ]
            //                      ---
            //                       |_______________.
            //                                       |
            //                                       v
            //                                      ---
            // after : [o o o o o . . . . . . . . . o o ]
            //                    H                 T

            if (self.tail > self.head) {
                const old_capacity_minus_tail = old_capacity - self.tail;

                if (self.head < old_capacity_minus_tail) {
                    // (B)
                    self.copyNonOverlapping(old_capacity, 0, self.head);

                    self.head += old_capacity;
                } else {
                    // (C)
                    const new_tail = new_capacity - old_capacity_minus_tail;

                    self.copyNonOverlapping(new_tail, self.tail, old_capacity_minus_tail);

                    self.tail = new_tail;
                }
            }
        }

        inline fn copyNonOverlapping(self: *Self, dest: usize, src: usize, length: usize) void {
            @memcpy(self.buf[dest .. dest + length], self.buf[src .. src + length]);
        }

        inline fn wrapAdd(self: Self, idx: usize, addend: usize) usize {
            return wrapIndex(idx +% addend, self.cap());
        }

        inline fn wrapSub(self: Self, idx: usize, subtrahend: usize) usize {
            return wrapIndex(idx -% subtrahend, self.cap());
        }
    };
}

inline fn count(tail: usize, head: usize, size: usize) usize {
    return (head -% tail) & (size - 1);
}

inline fn wrapIndex(index: usize, size: usize) usize {
    return index & (size - 1);
}
