const std = @import("std");
const builtin = std.builtin;
const math = std.math;

const event = @import("./WebAssembly/Interop/Event.zig");
const dom = @import("./WebAssembly/Interop/Dom.zig");
const WebSocket = @import("./WebAssembly/Interop/WebSocket.zig");

const Entity = @import("./Entity/Entity.zig");

const requestAnimationFrame = @import("./WebAssembly/Interop/animationFrame.zig").requestAnimationFrame;

const CanvasContext = @import("./WebAssembly/Interop/Canvas/CanvasContext.zig");
const Path2D = @import("./WebAssembly/Interop/Canvas/Path2D.zig");

const UI = @import("./UI/UI.zig");

const TileMap = @import("./Tile/TileMap.zig");

const cpp = @cImport({
    @cInclude("parse_svg.h");
});

// Use fba for block auto-memory growing
var buffer: [0x1000]u8 = undefined;
var fba = std.heap.FixedBufferAllocator.init(&buffer);
const allocator = fba.allocator();

// Setting up the free/alloc functions also overrides malloc and free in C

const size_of_usize = @sizeOf(usize);

const align_of_usize = @alignOf(usize);

pub export fn malloc(size: usize) ?*anyopaque {
    const total_size = size_of_usize + size;
    const ptr = allocator.alignedAlloc(u8, align_of_usize, total_size) catch {
        // you should set errno here, auxiliary C function will work
        return null;
    };

    @as(*usize, @ptrCast(ptr)).* = total_size;

    return ptr.ptr + size_of_usize;
}

pub export fn free(ptr: ?*align(size_of_usize) anyopaque) void {
    const to_free = @as([*]align(size_of_usize) u8, @ptrCast(ptr.?)) - size_of_usize;
    const total_size = @as(*usize, @ptrCast(to_free)).*;

    allocator.free(to_free[0..total_size]);
}

var ctx: CanvasContext = undefined;
var current_ui: UI = undefined;

var tile_map: TileMap = undefined;

var ws: WebSocket = undefined;

fn onResize(_: ?*const event.Event) callconv(.c) void {
    const dpr = dom.devicePixelRatio();
    const w = @as(f32, @floatFromInt(dom.clientWidth())) * dpr;
    const h = @as(f32, @floatFromInt(dom.clientHeight())) * dpr;

    ctx.setSize(
        @intFromFloat(w),
        @intFromFloat(h),
    );
}

fn onWheel(_: ?*const event.Event) callconv(.c) void {
    scale -= 0.03;
}

export fn __main() void {
    cpp.parseSvg(@embedFile("./Tile/Tiles/grass_c_0.svg"));

    std.debug.print("main()", .{});

    ws = WebSocket.connect("ws://localhost:8080/ws");

    ctx = CanvasContext.getCanvasContextFromElement("canvas", false);

    onResize(null);

    event.addGlobalEventListener(.window, .resize, onResize);

    event.addGlobalEventListener(.window, .wheel, onWheel);

    current_ui = UI.init(allocator, ctx);

    var entity = Entity.init(1, 1, 1, 1, 1, 1);
    entity.update();

    const tile_ctx = CanvasContext.createCanvasContext(256 * 4, 256 * 4, false);

    tile_ctx.drawSVG(@embedFile("./Tile/Tiles/desert_c_2.svg"));

    tile_map = TileMap.init(allocator, .{
        .tile_size = @splat(512),
        .chunk_border = @splat(1),
        .layers = &.{
            .{
                .tiles = &.{tile_ctx},
                .data = &.{
                    &.{ 0, 0 },
                    &.{ 0, 0 },
                },
            },
        },
    }) catch unreachable;

    // draw(-1);
}

var i: f32 = 0;

var scale: f32 = 1;

fn draw(_: f64) callconv(.c) void {
    const sin_i = @as(f32, @floatCast(@abs(@sin(i))));

    const screen: TileMap.Vector2 = @floatFromInt(ctx.getSize());
    const position: TileMap.Vector2 = @splat(sin_i * 20000);

    ctx.save();

    current_ui.render();

    tile_map.draw(
        ctx,
        screen,
        position,
        scale,
    ) catch unreachable;

    ctx.restore();

    i += 0.002;

    _ = requestAnimationFrame(draw);
}
