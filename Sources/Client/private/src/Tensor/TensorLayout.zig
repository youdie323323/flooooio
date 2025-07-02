//! Another implementation of this similar to Pytorch:C10 is to make a union with a dynamic
//! memory member variable that allows for extending the tensor modes beyond the static
//! storage size. Unfortunately, that incurs the cost of checking which member is in use.
//!
//! A potential work around is to return a slice (or some reference object) and use that.
//! That is cumbersome though, especially for internal implementation details.

const std = @import("std");
const testing = std.testing;

pub const WiseOrder = enum(u1) {
    row,
    col,
};

/// Compile-time integer that represents dimension.
pub const Rank = comptime_int;

pub const Size = usize;

pub const SizeAndStride = struct {
    size: Size = 0,
    stride: Size = 0,
};

/// Vector-represented general-purpose sizes.
pub fn Sizes(comptime rank: Rank) type {
    return @Vector(rank, Size);
}

inline fn ensureNoOptionalSizes(
    comptime rank: Rank,
    sizes: ?Sizes(rank),
) Sizes(rank) {
    return if (sizes) |s|
        s
    else
        @splat(0);
}

inline fn inferStridesFromSizes(
    comptime rank: Rank,
    comptime order: WiseOrder,
    sizes: ?Sizes(rank),
) Sizes(rank) {
    if (rank == 1)
        return @splat(0);

    if (sizes) |data| {
        var strides: Sizes(rank) = undefined;

        const rank_sub_1: Rank = comptime rank - 1;

        var n: Size = 1;

        switch (order) {
            inline .row => {
                comptime var i = rank_sub_1;

                inline while (i > 0) : (i -= 1) {
                    strides[i] = n;

                    n *= data[i];
                }

                strides[0] = n;
            },

            inline .col => {
                inline for (0..rank_sub_1) |i| {
                    strides[i] = n;

                    n *= data[i];
                }

                strides[rank_sub_1] = n;
            },
        }

        return strides;
    } else {
        return @splat(0); // Zero seems like a sensible default...
    }
}

pub inline fn defaultPermutation(comptime rank: Rank) Sizes(rank) {
    var tmp: Sizes(rank) = undefined;

    inline for (0..rank) |i| {
        tmp[i] = i;
    }

    return tmp;
}

pub fn TensorLayout(
    comptime rank: Rank,
    comptime order: WiseOrder,
    comptime sizes: Sizes(rank),
) type {
    return struct {
        sizes: Sizes(rank) = undefined,
        strides: Sizes(rank) = undefined,

        permutation: Sizes(rank) = undefined,

        pub fn init() @This() {
            return .{
                .sizes = ensureNoOptionalSizes(rank, sizes),
                .strides = inferStridesFromSizes(rank, order, sizes),

                .permutation = defaultPermutation(rank),
            };
        }

        pub fn initSizeAndStride(self: @This(), comptime at: comptime_int) SizeAndStride {
            return .{
                .size = self.sizes[at],
                .stride = self.strides[at],
            };
        }

        pub fn setSizeAndStride(self: *@This(), comptime at: comptime_int, pair: SizeAndStride) void {
            self.sizes[at] = pair.size;
            self.strides[at] = pair.stride;
        }
    };
}

test TensorLayout {
    {
        const s1 = TensorLayout(3, .row, .{ 3, 2, 2 }).init();

        try testing.expectEqual(s1.sizes[0], 3);
        try testing.expectEqual(s1.sizes[1], 2);
        try testing.expectEqual(s1.sizes[2], 2);
        try testing.expectEqual(s1.strides[0], 4);
        try testing.expectEqual(s1.strides[1], 2);
        try testing.expectEqual(s1.strides[2], 1);
    }

    {
        const s1 = TensorLayout(3, .col, .{ 3, 2, 2 }).init();

        try testing.expectEqual(s1.sizes[0], 3);
        try testing.expectEqual(s1.sizes[1], 2);
        try testing.expectEqual(s1.sizes[2], 2);
        try testing.expectEqual(s1.strides[0], 1);
        try testing.expectEqual(s1.strides[1], 3);
        try testing.expectEqual(s1.strides[2], 6);
    }
}
