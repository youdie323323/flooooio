const std = @import("std");
const builtin = std.builtin;
const math = std.math;

const event = @import("./WebAssembly/Interop/Event.zig");
const dom = @import("./WebAssembly/Interop/Dom.zig");
const ClientWebsocket = @import("./Network/ClientWebSocket.zig");

const CanvasContext = @import("./WebAssembly/Interop/Canvas/CanvasContext.zig");
const Path2D = @import("./WebAssembly/Interop/Canvas/Path2D.zig");

const UI = @import("./UI/UI.zig");

const TileMap = @import("./Tile/TileMap.zig");

const cpp = @cImport({
    @cDefine("BOOST_NO_RTTI", {});
    @cDefine("BOOST_NO_EXCEPTIONS", {});
    @cDefine("BOOST_EXCEPTION_DISABLE", {});
    @cInclude("parse_svg.h");
});

const allocator = @import("./mem.zig").allocator;

var ctx: CanvasContext = undefined;
var current_ui: UI = undefined;

var tile_map: TileMap = undefined;

var client: *ClientWebsocket = undefined;

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

// This function overrides C main
// main(_: c_int, _: [*][*]u8) c_int
export fn main() c_int {
    cpp.parseSvg(@embedFile("./Tile/Tiles/grass_c_0.svg"));

    std.debug.print("main()\n", .{});

    client = ClientWebsocket.init(allocator) catch unreachable;
    
    client.connect("localhost:8080") catch unreachable;

    ctx = CanvasContext.getCanvasContextFromElement("canvas", false);

    onResize(null);

    event.addGlobalEventListener(.window, .resize, onResize);

    event.addEventListener("canvas", .wheel, onWheel);

    current_ui = UI.init(allocator, ctx) catch unreachable;

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

    draw(-1);

    return 0;
}

var i: f32 = 0;

var scale: f32 = 1;

fn draw(_: f64) callconv(.c) void {
    const sin_i = @as(f32, @floatCast(@abs(@sin(i))));

    const screen: TileMap.Vector2 = @floatFromInt(ctx.getSize());
    const position: TileMap.Vector2 = @splat(sin_i * 5000);

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

    _ = CanvasContext.requestAnimationFrame(draw);
}
