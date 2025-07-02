const std = @import("std");
const testing = std.testing;

const Sizes = @import("TensorLayout.zig").Sizes;
const Rank = @import("TensorLayout.zig").Rank;
const TensorLayout = @import("TensorLayout.zig").TensorLayout;
const WiseOrder = @import("TensorLayout.zig").WiseOrder;

const parsePermutateExpession = @import("TensorExpression.zig").parsePermutateExpession;
const Expression = @import("TensorExpression.zig").Expression;

pub fn permutate(
    comptime rank: Rank,
    comptime order: WiseOrder,
    comptime sizes: Sizes(rank),
    comptime expr: Expression,
    layout: *TensorLayout(rank, order, sizes),
) void {
    var tmp: TensorLayout(rank, order, sizes) = undefined;

    // Cast vector to array for iterate
    // See https://github.com/ziglang/zig/issues/5761 for know why need this
    const permutation_array: [rank]comptime_int = comptime parsePermutateExpession(rank, expr);

    inline for (permutation_array, 0..) |at, i| {
        tmp.setSizeAndStride(i, layout.initSizeAndStride(at));

        tmp.permutation[i] = at;
    }

    layout.* = tmp;
}

test permutate {
    var layout = TensorLayout(3, .row, .{ 10, 20, 30 }).init();

    try testing.expectEqual(layout.permutation[0], 0);
    try testing.expectEqual(layout.permutation[1], 1);
    try testing.expectEqual(layout.permutation[2], 2);
    try testing.expectEqual(layout.sizes[0], 10);
    try testing.expectEqual(layout.sizes[1], 20);
    try testing.expectEqual(layout.sizes[2], 30);

    permutate(3, .row, .{ 10, 20, 30 }, "ijk->kji", &layout);

    try testing.expectEqual(layout.permutation[0], 2);
    try testing.expectEqual(layout.permutation[1], 1);
    try testing.expectEqual(layout.permutation[2], 0);
    try testing.expectEqual(layout.sizes[0], 30);
    try testing.expectEqual(layout.sizes[1], 20);
    try testing.expectEqual(layout.sizes[2], 10);
}
