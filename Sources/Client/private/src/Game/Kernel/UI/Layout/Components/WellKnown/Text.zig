const Text = @This();

pub fn calculateStrokeWidth(comptime width: comptime_float) comptime_float {
    return comptime (width / 8.333333830038736);
}

pub fn setupFont(ctx: *CanvasContext, comptime pixel: comptime_float) void {
    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);
    ctx.setStandardFont(pixel);
    ctx.setLineWidth(comptime calculateStrokeWidth(pixel));
    ctx.strokeColor(comptime .comptimeFromHex(0x000000));
}

const std = @import("std");

const CanvasContext = @import("../../../../WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const Color = @import("../../../../WebAssembly/Interop/Canvas2D/Color.zig");
