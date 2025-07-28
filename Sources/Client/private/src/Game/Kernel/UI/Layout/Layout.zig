const std = @import("std");
const Layout = @This();

const NumberOrPercentage = union(enum) {
    number: f32,
    percentage: []const u8,
};

const LayoutOptions = struct {
    x: ?NumberOrPercentage = .{ .number = 0 },
    y: ?NumberOrPercentage = .{ .number = 0 },

    w: NumberOrPercentage,
    h: NumberOrPercentage,

    invert_x_coordinate: bool = false,
    invert_y_coordinate: bool = false,

    align_from_center_x: bool = false,
    align_from_center_y: bool = false,
};

const LayoutContext = struct {
    container_w: f32,
    container_h: f32,

    origin_x: f32 = 0,
    origin_y: f32 = 0,
};

const LayoutResult = struct {
    x: f32,
    y: f32,
    w: f32,
    h: f32,
};

fn parseSize(size: NumberOrPercentage, container_size: f32) f32 {
    return switch (size) {
        inline .number => |n| n,
        inline .percentage => |p| blk: {
            const percentage = std.fmt.parseFloat(f32, p) catch 0;
            
            break :blk (percentage / 100.0) * container_size;
        },
    };
}

pub fn layout(options: LayoutOptions, context: LayoutContext) LayoutResult {
    const w = parseSize(options.w, context.container_w);
    const h = parseSize(options.h, context.container_h);

    var x: f32 = 0;
    var y: f32 = 0;

    // Handle X coordinate
    if (options.x) |x_val| {
        switch (x_val) {
            .percentage => |p| {
                x = parseSize(.{ .percentage = p }, context.container_w);
            },
            .number => |n| {
                x = n;

                if (options.invert_x_coordinate) {
                    x = context.container_w - x;
                }

                if (options.align_from_center_x) {
                    x = (context.container_w / 2) + x;
                }
            },
        }
    }

    // Handle Y coordinate
    if (options.y) |y_val| {
        switch (y_val) {
            .percentage => |p| {
                y = parseSize(.{ .percentage = p }, context.container_h);
            },
            .number => |n| {
                y = n;

                if (options.invert_y_coordinate) {
                    y = context.container_h - y;
                }

                if (options.align_from_center_y) {
                    y = (context.container_h / 2) + y;
                }
            },
        }
    }

    return .{
        .x = x + context.origin_x,
        .y = y + context.origin_y,
        .w = w,
        .h = h,
    };
}
