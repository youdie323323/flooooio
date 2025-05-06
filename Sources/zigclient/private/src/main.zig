const std = @import("std");
const builtin = std.builtin;
const math = std.math;

// Use fba for block auto-memory growing
var buffer: [4096]u8 = undefined;
var fba = std.heap.FixedBufferAllocator.init(&buffer);
const allocator = fba.allocator();

// Exports alloc and free

pub export fn alloc(n: usize) [*]u8 {
    const slice = allocator.alloc(u8, n) catch unreachable;

    return slice.ptr;
}

pub export fn free(ptr: [*]u8, n: usize) void {
    const slice = ptr[0..n];

    allocator.free(slice);
}

const event = @import("./WasmInterop/Event.zig");
const dom = @import("./WasmInterop/Dom.zig");
const WebSocket = @import("./WasmInterop/WebSocket.zig");

const Entity = @import("./Entity/Entity.zig");

const requestAnimationFrame = @import("./WasmInterop/animationFrame.zig").requestAnimationFrame;

const CanvasContext = @import("./WasmInterop/Canvas/CanvasContext.zig");
const Path2D = @import("./WasmInterop/Canvas/Path2D.zig");

const UI = @import("./UI/UI.zig");

const TileMap = @import("./Tile/TileMap.zig");

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

export fn main() void {
    std.debug.print("main()", .{});

    ws = WebSocket.connect("ws://localhost:8080/ws");

    ctx = CanvasContext.getCanvasContextFromElement("canvas", false);

    onResize(null);

    event.addGlobalEventListener(.window, .resize, onResize);

    event.addGlobalEventListener(.window, .wheel, onWheel);

    current_ui = UI.init(allocator, ctx);

    const tile_ctx = CanvasContext.createCanvasContext(256 * 4, 256 * 4, false);

    tile_ctx.drawSVG(@embedFile("./Tile/Tiles/grass_c_0.svg"));

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

    draw(-1);
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
