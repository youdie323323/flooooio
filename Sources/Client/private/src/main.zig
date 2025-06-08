const std = @import("std");
const builtin = std.builtin;
const math = std.math;

const event = @import("WebAssembly/Interop/Event.zig");
const dom = @import("WebAssembly/Interop/Dom.zig");
const ws = @import("WebSocket/ws.zig");

const CanvasContext = @import("WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const Color = @import("WebAssembly/Interop/Canvas2D/Color.zig");
const Path2D = @import("WebAssembly/Interop/Canvas2D/Path2D.zig");

const timer = @import("WebAssembly/Interop/Timer.zig");

const UI = @import("UI/UI.zig");

const TileMap = @import("Tile/TileMap.zig");

const EntityId = @import("Entity/Entity.zig").EntityId;
const EntityType = @import("Entity/EntityType.zig").EntityType;
const EntityRarity = @import("Florr/Native/Entity/EntityRarity.zig").EntityRarity;

const PlayerImpl = @import("Entity/Player.zig");
const pmood = @import("Entity/PlayerMood.zig");

const MobImpl = @import("Entity/Mob.zig");
const renderEntity = @import("Entity/Renderers/Renderer.zig").renderEntity;
const MobRenderingDispatcher = @import("Entity/Renderers/MobRenderingDispatcher.zig").MobRenderingDispatcher;

const mach_objects = @import("Entity/MachObjects/objs.zig");

const allocator = @import("mem.zig").allocator;

/// Global context of this application.
var ctx: *CanvasContext = undefined;

var ui: UI = undefined;

var client: *ws.ClientWebSocket = undefined;

var width: u16 = 0;
var height: u16 = 0;

fn onResize(_: ?*const event.Event) callconv(.c) void {
    const dpr = dom.devicePixelRatio();

    width = @intFromFloat(@as(f32, @floatFromInt(dom.clientWidth())) * dpr);
    height = @intFromFloat(@as(f32, @floatFromInt(dom.clientHeight())) * dpr);

    ctx.setSize(
        width,
        height,
    );
}

fn onWheel(_: ?*const event.Event) callconv(.c) void {
    players.lock();
    defer players.unlock();

    var slice = players.slice();

    while (slice.next()) |p| {
        var player = players.getValue(p);

        player.hurt_t = 1;

        player.impl.is_developer = !player.impl.is_developer;

        players.setValue(p, player);
    }
}

pub const Players = mach_objects.Objects(PlayerImpl.Super, .id);
pub const Mobs = mach_objects.Objects(MobImpl.Super, .id);

var players: Players = undefined;
var mobs: Mobs = undefined;

const EntityKind = enum(u8) {
    player,
    mob,
    petal,
};

inline fn angleToRad(angle: f32) f32 {
    return angle / 255 * math.tau;
}

var wave_self_id: EntityId = undefined;

fn handleWaveSelfId(stream: *ws.Clientbound.Reader) anyerror!void {
    wave_self_id = try stream.readInt(EntityId, .little);
}

var i: usize = 0;

fn handleWaveUpdate(stream: *ws.Clientbound.Reader) anyerror!void {
    { // Read wave informations
        const wave_progress = try stream.readInt(u16, .little);

        const wave_progress_timer = try ws.Clientbound.readFloat32(stream);

        const wave_progress_red_gage_timer = try ws.Clientbound.readFloat32(stream);

        const wave_ended = try stream.readByte() != 0;

        const wave_map_radius = try stream.readInt(u16, .little);

        _ = wave_progress;

        _ = wave_progress_timer;

        _ = wave_progress_red_gage_timer;

        _ = wave_ended;

        _ = wave_map_radius;

        // std.debug.print("{} {} {} {} {}\n", .{ wave_progress, wave_progress_timer, wave_progress_red_gage_timer, wave_ended, wave_map_radius });
    }

    // Lock objects

    mobs.lock();
    defer mobs.unlock();

    players.lock();
    defer players.unlock();

    { // Read eliminated entities
        const eliminated_entities_count = try stream.readInt(u16, .little);

        for (0..eliminated_entities_count) |_| {
            const entity_id = try stream.readInt(EntityId, .little);

            if (mobs.search(entity_id)) |o| {
                var mob = mobs.getValue(o);

                mob.is_dead = true;

                mob.dead_t = 0;

                mobs.setValue(o, mob);

                continue;
            }

            if (players.search(entity_id)) |o| {
                var player = players.getValue(o);

                player.impl.was_eliminated = true;

                player.is_dead = true;

                player.dead_t = 0;

                players.setValue(o, player);

                continue;
            }
        }
    }

    { // Read lighning bounces
        const lightning_bounces_count = try stream.readInt(u16, .little);

        for (0..lightning_bounces_count) |_| {
            const coordinates_count = try stream.readInt(u16, .little);

            for (0..coordinates_count) |_| {
                _ = try ws.Clientbound.readFloat32(stream); // X
                _ = try ws.Clientbound.readFloat32(stream); // Y
            }
        }
    }

    { // Read entities
        const entities_count = try stream.readInt(u16, .little);

        for (0..entities_count) |_| {
            const entity_kind = try stream.readEnum(EntityKind, .little);

            switch (entity_kind) {
                .player => {
                    const player_id = try stream.readInt(EntityId, .little);

                    const player_x = try ws.Clientbound.readFloat32(stream);
                    const player_y = try ws.Clientbound.readFloat32(stream);

                    const player_angle = angleToRad(try ws.Clientbound.readFloat32(stream));

                    const player_health = try ws.Clientbound.readFloat32(stream);

                    const player_size = try ws.Clientbound.readFloat32(stream);

                    const player_mood_mask: pmood.MoodBitSet.MaskInt = @intCast(try stream.readByte());

                    const player_name = try ws.Clientbound.readCString(stream);

                    const player_bool_flags = try stream.readStruct(packed struct {
                        is_dead: bool,
                        is_developer: bool,
                        is_poisoned: bool,
                    });

                    if (players.search(player_id)) |o| {
                        var player = players.getValue(o);

                        { // Update next properties
                            player.next_pos[0] = player_x;
                            player.next_pos[1] = player_y;

                            player.next_angle = player_angle;

                            player.next_size = player_size;
                        }

                        { // Update health properties
                            if (!player.is_poisoned and player_health < player.next_health) {
                                player.red_health_timer = 1;
                                player.hurt_t = 1;
                            } else if (player_health > player.next_health) {
                                player.red_health_timer = 0;
                            }

                            player.next_health = player_health;
                        }

                        { // Update common properties
                            player.impl.mood.mask = player_mood_mask;

                            player.impl.name = player_name;

                            player.is_dead = player_bool_flags.is_dead;

                            player.impl.is_developer = player_bool_flags.is_developer;

                            player.is_poisoned = player_bool_flags.is_poisoned;
                        }

                        { // Update old properties
                            player.old_pos = player.pos;

                            player.old_angle = player.angle;

                            player.old_size = player.size;

                            player.old_health = player.health;
                        }

                        player.update_t = 0;

                        players.setValue(o, player);
                    } else {
                        const player = PlayerImpl.Super.init(
                            PlayerImpl.init(
                                allocator,
                                pmood.initPartial(player_mood_mask),
                                player_name,
                            ),
                            player_id,
                            .{ player_x, player_y },
                            player_angle,
                            player_size,
                            player_health,
                        );

                        _ = try players.new(player);
                    }
                },

                .mob => {
                    const mob_id = try stream.readInt(EntityId, .little);

                    const mob_x = try ws.Clientbound.readFloat32(stream);
                    const mob_y = try ws.Clientbound.readFloat32(stream);

                    const mob_angle = angleToRad(try ws.Clientbound.readFloat32(stream));

                    const mob_health = try ws.Clientbound.readFloat32(stream);

                    const mob_size = try ws.Clientbound.readFloat32(stream);

                    const mob_type: EntityType = .{ .mob = @enumFromInt(try stream.readByte()) };

                    const mob_rarity = try stream.readEnum(EntityRarity, .little);

                    const mob_bool_flags = try stream.readStruct(packed struct {
                        is_pet: bool,
                        is_first_segment: bool,
                        has_connecting_segment: bool,
                        is_poisoned: bool,
                    });

                    var mob_connecting_segment: ?mach_objects.ObjectID = null;

                    if (mob_bool_flags.has_connecting_segment) {
                        const mob_connecting_segment_id = try stream.readInt(EntityId, .little);

                        mob_connecting_segment = mobs.search(mob_connecting_segment_id);
                    }

                    if (mobs.search(mob_id)) |o| {
                        var mob = mobs.getValue(o);

                        { // Update next properties
                            mob.next_pos[0] = mob_x;
                            mob.next_pos[1] = mob_y;

                            mob.next_angle = mob_angle;

                            mob.next_size = mob_size;
                        }

                        { // Update health properties
                            // TODO: not same as original code

                            if (!mob.is_poisoned and mob_health < mob.next_health) {
                                mob.red_health_timer = 1;
                                mob.hurt_t = 1;
                            } else if (mob_health > mob.next_health) {
                                mob.red_health_timer = 0;
                            }

                            mob.next_health = mob_health;
                        }

                        { // Update common properties
                            mob.impl.connecting_segment = mob_connecting_segment;

                            mob.is_poisoned = mob_bool_flags.is_poisoned;
                        }

                        { // Update old properties
                            mob.old_pos = mob.pos;

                            mob.old_angle = mob.angle;

                            mob.old_size = mob.size;

                            mob.old_health = mob.health;
                        }

                        mob.update_t = 0;

                        mobs.setValue(o, mob);
                    } else {
                        const mob = MobImpl.Super.init(
                            MobImpl.init(
                                allocator,
                                mob_type,
                                mob_rarity,
                                mob_bool_flags.is_pet,
                                mob_bool_flags.is_first_segment,
                                mob_connecting_segment,
                            ),
                            mob_id,
                            .{ mob_x, mob_y },
                            mob_angle,
                            mob_size,
                            mob_health,
                        );

                        _ = try mobs.new(mob);
                    }

                    if (mob_connecting_segment) |o| {
                        var mob = mobs.getValue(o);

                        if (!mob.impl.isConnectedBy(mob_id))
                            try mob.impl.addConnectedSegment(mob_id);

                        mobs.setValue(o, mob);
                    }
                },

                .petal => { // Petal treated as mob
                    const petal_id = try stream.readInt(EntityId, .little);

                    const petal_x = try ws.Clientbound.readFloat32(stream);
                    const petal_y = try ws.Clientbound.readFloat32(stream);

                    const petal_angle = angleToRad(try ws.Clientbound.readFloat32(stream));

                    const petal_health = try ws.Clientbound.readFloat32(stream);

                    const petal_size = try ws.Clientbound.readFloat32(stream);

                    const petal_type: EntityType = .{ .petal = @enumFromInt(try stream.readByte()) };

                    const petal_rarity = try stream.readEnum(EntityRarity, .little);

                    if (mobs.search(petal_id)) |o| {
                        var petal = mobs.getValue(o);

                        { // Update next properties
                            petal.next_pos[0] = petal_x;
                            petal.next_pos[1] = petal_y;

                            petal.next_angle = petal_angle;

                            petal.next_size = petal_size;
                        }

                        { // Update health properties
                            if (petal_health < petal.next_health) {
                                petal.red_health_timer = 1;
                                petal.hurt_t = 1;
                            } else if (petal_health > petal.next_health) {
                                petal.red_health_timer = 0;
                            }

                            petal.next_health = petal_health;
                        }

                        { // Update old properties
                            petal.old_pos = petal.pos;

                            petal.old_angle = petal.angle;

                            petal.old_size = petal.size;

                            petal.old_health = petal.health;
                        }

                        petal.update_t = 0;

                        mobs.setValue(o, petal);
                    } else {
                        const petal = MobImpl.Super.init(
                            MobImpl.init(
                                allocator,
                                petal_type,
                                petal_rarity,
                                false,
                                false,
                                null,
                            ),
                            petal_id,
                            .{ petal_x, petal_y },
                            petal_angle,
                            petal_size,
                            petal_health,
                        );

                        _ = try mobs.new(petal);
                    }
                },
            }
        }
    }

    try client.server_bound.sendAck(width, height);

    i += 1;
}

// This function overrides C main
// main(_: c_int, _: [*][*]u8) c_int
export fn main() c_int {
    std.debug.print("main()\n", .{});

    ctx = CanvasContext.createCanvasContextFromElement(allocator, "canvas", false);

    {
        client = ws.ClientWebSocket.init(allocator) catch unreachable;

        client.client_bound.putHandler(ws.opcode.Clientbound.wave_self_id, handleWaveSelfId) catch unreachable;
        client.client_bound.putHandler(ws.opcode.Clientbound.wave_update, handleWaveUpdate) catch unreachable;

        client.connect("localhost:8080") catch unreachable;
    }

    {
        event.addGlobalEventListener(.window, .resize, onResize);
        event.addEventListener("canvas", .wheel, onWheel);

        onResize(null);
    }

    {
        ui = UI.init(allocator, ctx) catch unreachable;
    }

    { // Initialize DOD models
        // Initalize objects
        players.init(allocator);
        mobs.init(allocator);

        // Initialize renderer static values
        PlayerImpl.Renderer.initStatic(allocator);
        MobImpl.Renderer.initStatic(allocator);
    }

    // {
    //     const tile_ctx = CanvasContext.createCanvasContext(allocator, 256 * 4, 256 * 4, false);

    //     tile_ctx.drawSVG(@embedFile("./Tile/Tiles/desert_c_2.svg"));

    //     tile_map = TileMap.init(allocator, .{
    //         .tile_size = @splat(512),
    //         .chunk_border = @splat(1),
    //         .layers = &.{
    //             .{
    //                 .tiles = &.{tile_ctx},
    //                 .data = &.{
    //                     &.{ 0, 0 },
    //                     &.{ 0, 0 },
    //                 },
    //             },
    //         },
    //     }) catch unreachable;
    // }

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

    // Clear canvas
    ctx.clearContextRect();

    ctx.save();

    ui.render();

    { // Render entities
        const self_player =
            if (players.search(wave_self_id)) |o|
                players.getValue(o)
            else
                null;

        if (self_player) |p| {
            const center_width = @as(f32, @floatFromInt(width)) / 2;
            const center_height = @as(f32, @floatFromInt(height)) / 2;

            const p_x, const p_y = p.pos;

            ctx.setTransform(
                1,
                0,
                0,
                1,
                center_width - p_x,
                center_height - p_y,
            );
        }

        {
            players.lock();
            defer players.unlock();

            var slice = players.slice();

            while (slice.next()) |o| {
                var player = players.getValue(o);

                player.update(delta_time);

                // Only remove when disconnected
                if (player.impl.was_eliminated and player.dead_t > 1) {
                    player.deinit(allocator);

                    players.delete(o);

                    continue;
                }

                renderEntity(PlayerImpl, &.{
                    .ctx = ctx,
                    .entity = &player,
                    .is_specimen = false,
                    .players = &players,
                    .mobs = &mobs,
                });

                players.setValue(o, player);
            }
        }

        {
            mobs.lock();
            defer mobs.unlock();

            var slice = mobs.slice();

            while (slice.next()) |o| {
                var mob = mobs.getValue(o);

                mob.update(delta_time);

                // Only remove when disconnected
                if (mob.is_dead and mob.dead_t > 1) {
                    var inner_slice = mobs.slice();

                    while (inner_slice.next()) |inner_o| {
                        var inner_mob = mobs.getValue(inner_o);

                        if (inner_mob.impl.isConnectedBy(o)) {
                            inner_mob.impl.removeConnectedSegment(o);

                            mobs.setValue(inner_o, inner_mob);
                        }
                    }

                    mob.deinit(allocator);

                    mobs.delete(o);

                    continue;
                }

                renderEntity(MobImpl, &.{
                    .ctx = ctx,
                    .entity = &mob,
                    .is_specimen = false,
                    .players = &players,
                    .mobs = &mobs,
                });

                mobs.setValue(o, mob);
            }
        }
    }

    ctx.restore();

    _ = CanvasContext.requestAnimationFrame(draw);
}
