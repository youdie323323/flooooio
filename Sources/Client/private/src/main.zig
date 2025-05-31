const std = @import("std");
const builtin = std.builtin;
const math = std.math;

const event = @import("./WebAssembly/Interop/Event.zig");
const dom = @import("./WebAssembly/Interop/Dom.zig");
const ClientWebsocket = @import("./WebSocket/ClientWebSocket.zig");

const CanvasContext = @import("./WebAssembly/Interop/Canvas/CanvasContext.zig");
const Path2D = @import("./WebAssembly/Interop/Canvas/Path2D.zig");

const UI = @import("./UI/UI.zig");

const TileMap = @import("./Tile/TileMap.zig");

const Player = @import("./Entity/Player.zig").Player;
const PlayerImpl = @import("./Entity/Player.zig").PlayerImpl;

const mach_objects = @import("./Entity/MachObjects/main.zig");

const cpp = @cImport({
    @cDefine("BOOST_NO_RTTI", {});
    @cDefine("BOOST_NO_EXCEPTIONS", {});
    @cDefine("BOOST_EXCEPTION_DISABLE", {});
    @cInclude("parse_svg.h");
});

const allocator = @import("./mem.zig").allocator;

var ctx: CanvasContext = undefined;
var current_ui: UI = undefined;

// var tile_map: TileMap = undefined;

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

var players: mach_objects.Objects(.{}, Player) = undefined;

// This function overrides C main
// main(_: c_int, _: [*][*]u8) c_int
export fn main() c_int {
    std.debug.print("main()\n", .{});

    client = ClientWebsocket.init(allocator) catch unreachable;

    client.connect("localhost:8080") catch unreachable;

    ctx = CanvasContext.getCanvasContextFromElement("canvas", false);

    cpp.parseSvg(@embedFile("./Tile/Tiles/grass_c_0.svg"), @ptrCast(&ctx));

    onResize(null);

    event.addGlobalEventListener(.window, .resize, onResize);

    current_ui = UI.init(allocator, ctx) catch unreachable;

    {
        players.init(allocator);

        players.lock();
        defer players.unlock();

        const new_player_obj_id = players.new(
            Player.init(allocator, PlayerImpl.init(allocator), -1, 1, 1, 1, 1, 1),
        ) catch unreachable;

        var slice = players.slice();

        while (slice.next()) |player_obj_id| {
            var player = players.getValue(player_obj_id);

            player.update();

            players.setValue(player_obj_id, player);
        }

        const new_player = players.getValue(new_player_obj_id);
        std.debug.print("player: {}\n", .{new_player});
    }

    draw(-1);

    return 0;
}

fn draw(_: f64) callconv(.c) void {
    ctx.save();

    current_ui.render();

    ctx.restore();

    _ = CanvasContext.requestAnimationFrame(draw);
}
