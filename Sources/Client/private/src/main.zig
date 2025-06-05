const std = @import("std");
const builtin = std.builtin;
const math = std.math;

const event = @import("./WebAssembly/Interop/Event.zig");
const dom = @import("./WebAssembly/Interop/Dom.zig");
const ws = @import("./WebSocket/ws.zig");

const CanvasContext = @import("./WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const Color = @import("./WebAssembly/Interop/Canvas2D/Color.zig");
const Path2D = @import("./WebAssembly/Interop/Canvas2D/Path2D.zig");

const timer = @import("./WebAssembly/Interop/Timer.zig");

const UI = @import("./UI/UI.zig");

const TileMap = @import("./Tile/TileMap.zig");

const PlayerImpl = @import("./Entity/Player.zig");
const MobImpl = @import("./Entity/Mob.zig");
const renderEntity = @import("./Entity/Renderers/Renderer.zig").renderEntity;
const MobRenderingDispatcher = @import("./Entity/Renderers/MobRenderingDispatcher.zig").MobRenderingDispatcher;

const mach_objects = @import("./Entity/MachObjects/objs.zig");

const cpp = @cImport({
    @cDefine("BOOST_NO_RTTI", {});
    @cDefine("BOOST_NO_EXCEPTIONS", {});
    @cDefine("BOOST_EXCEPTION_DISABLE", {});
    @cInclude("parse_svg.h");
});

const allocator = @import("./mem.zig").allocator;

/// Global context of this application.
var ctx: *CanvasContext = undefined;

var current_ui: UI = undefined;

// var tile_map: TileMap = undefined;

var client: *ws.ClientWebSocket = undefined;

var width: f32 = 0;
var height: f32 = 0;

fn onResize(_: ?*const event.Event) callconv(.c) void {
    const dpr = dom.devicePixelRatio();

    width = @as(f32, @floatFromInt(dom.clientWidth())) * dpr;
    height = @as(f32, @floatFromInt(dom.clientHeight())) * dpr;

    ctx.setSize(
        @intFromFloat(width),
        @intFromFloat(height),
    );
}

fn onWheel(_: ?*const event.Event) callconv(.c) void {
    players.lock();

    var slice = players.slice();

    while (slice.next()) |p| {
        var player = players.getValue(p);

        player.hurt_t = 1;

        player.impl.is_developer = !player.impl.is_developer;

        players.setValue(p, player);
    }

    players.unlock();
}

var players: mach_objects.Objects(PlayerImpl.Super) = undefined;
var mobs: mach_objects.Objects(MobImpl.Super) = undefined;

var i: f32 = 0;

fn handleWaveUpdate(stream: *ws.ClientBound.Reader) anyerror!void {
    { // Read wave informations
        const wave_progress = try stream.readInt(u16, .little);

        const wave_progress_timer = try ws.ClientBound.readFloat32(stream);

        std.debug.print("{} {}\n", .{ wave_progress, wave_progress_timer });
    }
}

// This function overrides C main
// main(_: c_int, _: [*][*]u8) c_int
export fn main() c_int {
    std.debug.print("main()\n", .{});

    client = ws.ClientWebSocket.init(allocator) catch unreachable;

    client.client_bound.putHandler(ws.opcode.ClientBound.wave_update, handleWaveUpdate) catch unreachable;

    client.connect("localhost:8080") catch unreachable;

    ctx = CanvasContext.createCanvasContextFromElement("canvas", false);

    cpp.parseSvg(@embedFile("./Tile/Tiles/grass_c_0.svg"), @ptrCast(&ctx));

    onResize(null);

    event.addGlobalEventListener(.window, .resize, onResize);
    event.addEventListener("canvas", .wheel, onWheel);

    current_ui = UI.init(allocator, ctx) catch unreachable;

    { // Initialize DOD models
        // Initalize objects
        players.init(allocator);
        mobs.init(allocator);

        // Initialize renderer static values
        PlayerImpl.Renderer.initStatic();
        MobImpl.Renderer.initStatic();

        {
            players.lock();

            var player = PlayerImpl.Super.init(
                PlayerImpl.init(allocator),
                -1,
                @splat(1000),
                0,
                50,
                1,
            );

            player.hurt_t = 1;

            player.is_dead = true;

            _ = players.new(player) catch unreachable;

            players.unlock();
        }

        _ = timer.setInterval(struct {
            fn call() callconv(.c) void {
                const mob = MobImpl.Super.init(
                    MobImpl.init(
                        allocator,
                        .{ .mob = .starfish },
                        .mythic,
                        false,
                        false,
                        null,
                        null,
                    ),
                    -1,
                    @splat(i * 10),
                    0,
                    40,
                    1,
                );

                i += 1;

                mobs.lock();

                _ = mobs.new(mob) catch unreachable;

                mobs.unlock();
            }
        }.call, 500);
    }

    draw(-1);

    return 0;
}

var last_timestamp: i64 = 0;
var delta_time: f32 = 0;
var prev_timestamp: i64 = 0;

fn draw(_: f32) callconv(.c) void {
    last_timestamp = std.time.milliTimestamp();
    delta_time = @floatFromInt(last_timestamp - prev_timestamp);
    prev_timestamp = last_timestamp;

    ctx.save();

    current_ui.render();

    { // Render entities
        {
            players.lock();

            var slice = players.slice();

            while (slice.next()) |p| {
                var player = players.getValue(p);

                renderEntity(PlayerImpl, &.{
                    .ctx = ctx,
                    .entity = &player,
                    .is_specimen = false,
                });

                player.update(delta_time);

                players.setValue(p, player);
            }

            players.unlock();
        }

        {
            mobs.lock();

            var slice = mobs.slice();

            while (slice.next()) |m| {
                var mob = mobs.getValue(m);

                renderEntity(MobImpl, &.{
                    .ctx = ctx,
                    .entity = &mob,
                    .is_specimen = false,
                });

                // mob.update(delta_time);

                mobs.setValue(m, mob);
            }

            mobs.unlock();
        }
    }

    ctx.restore();

    { // Show fps
        ctx.save();
        defer ctx.restore();

        const fps =
            if (delta_time > 0)
                1000 / delta_time
            else
                0;

        ctx.setLineJoin(.round);
        ctx.setLineCap(.round);
        ctx.setTextAlign(.right);

        ctx.fillColor(comptime Color.comptimeFromHexColorCode("#FFFFFF"));

        ctx.prepareFontProperties(30);

        var buf: [32]u8 = undefined;
        const fps_text = std.fmt.bufPrint(&buf, "FPS: {d:.1}", .{fps}) catch unreachable;

        ctx.strokeText(fps_text, width, height);
        ctx.fillText(fps_text, width, height);
    }

    _ = CanvasContext.requestAnimationFrame(draw);
}
