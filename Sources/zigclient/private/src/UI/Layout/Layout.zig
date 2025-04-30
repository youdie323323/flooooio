const std = @import("std");
const Layout = @This();

const NumberOrPercentage = union(enum) {
    number: f64,
    percentage: []const u8,
};

const LayoutOptions = struct {
    x: ?NumberOrPercentage = .{ .number = 0 },
    y: ?NumberOrPercentage = .{ .number = 0 },

    w: NumberOrPercentage,
    h: NumberOrPercentage,

    invertXCoordinate: bool = false,
    invertYCoordinate: bool = false,

    alignFromCenterX: bool = false,
    alignFromCenterY: bool = false,
};

const LayoutContext = struct {
    containerWidth: f64,
    containerHeight: f64,

    originX: f64 = 0,
    originY: f64 = 0,
};

const LayoutResult = struct {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
};

fn parseSize(size: NumberOrPercentage, containerSize: f64) f64 {
    return switch (size) {
        .number => |n| n,
        .percentage => |p| blk: {
            const percentage = std.fmt.parseFloat(f64, p) catch 0;
            break :blk (percentage / 100.0) * containerSize;
        },
    };
}

pub fn layout(options: LayoutOptions, context: LayoutContext) LayoutResult {
    const w = parseSize(options.w, context.containerWidth);
    const h = parseSize(options.h, context.containerHeight);

    var x: f64 = 0;
    var y: f64 = 0;

    // Handle X coordinate
    if (options.x) |xVal| {
        switch (xVal) {
            .percentage => |p| {
                x = parseSize(.{ .percentage = p }, context.containerWidth);
            },
            .number => |n| {
                x = n;
                if (options.invertXCoordinate) {
                    x = context.containerWidth - x;
                }
                if (options.alignFromCenterX) {
                    x = (context.containerWidth / 2) + x;
                }
            },
        }
    }

    // Handle Y coordinate
    if (options.y) |yVal| {
        switch (yVal) {
            .percentage => |p| {
                y = parseSize(.{ .percentage = p }, context.containerHeight);
            },
            .number => |n| {
                y = n;
                if (options.invertYCoordinate) {
                    y = context.containerHeight - y;
                }
                if (options.alignFromCenterY) {
                    y = (context.containerHeight / 2) + y;
                }
            },
        }
    }

    return LayoutResult{
        .x = x + context.originX,
        .y = y + context.originY,
        .w = w,
        .h = h,
    };
}
