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

const EntityId = @import("Entity/Entity.zig").EntityId;
const EntityType = @import("Entity/EntityType.zig").EntityType;
const MobType = @import("Entity/EntityType.zig").MobType;
const PetalType = @import("Entity/EntityType.zig").PetalType;
const EntityRarity = @import("Entity/EntityRarity.zig").EntityRarity;

const PlayerImpl = @import("Entity/Player.zig");
const pmood = @import("Entity/PlayerMood.zig");

const MobImpl = @import("Entity/Mob.zig");
const renderEntity = @import("Entity/Renderers/Renderer.zig").renderEntity;
const MobRenderingDispatcher = @import("Entity/Renderers/Mob/MobRenderingDispatcher.zig").MobRenderingDispatcher;

const mach_objects = @import("Entity/MachObjects/objs.zig");

const EntityProfiles = @import("Florr/Native/Entity/EntityProfiles.zig");

const tile = @import("Tile/TileRenderer.zig");

const allocator = @import("mem.zig").allocator;

/// Global context of this application.
var ctx: *CanvasContext = undefined;

var tile_ctx: *CanvasContext = undefined;

var ui: UI = undefined;

var client: *ws.ClientWebSocket = undefined;

var width: f32 = 0;
var height: f32 = 0;

var base_scale: f32 = 1;
var antenna_scale: f32 = 1;

const base_width: f32 = 1300;
const base_height: f32 = 650;

var mouse_x_offset: f32 = 0;
var mouse_y_offset: f32 = 0;

var interpolated_mouse_x: f32 = 0;
var interpolated_mouse_y: f32 = 0;

const movement_helper_start_distance: f32 = 30;

inline fn drawMovementHelper(self_player: *const PlayerImpl.Super, delta_time: f32) void {
    _ = self_player;

    { // Interpolate mouse x and y
        const delta_time_50 = delta_time * 0.02;

        interpolated_mouse_x = math.lerp(interpolated_mouse_x, mouse_x_offset / antenna_scale, delta_time_50);
        interpolated_mouse_y = math.lerp(interpolated_mouse_y, mouse_y_offset / antenna_scale, delta_time_50);
    }

    const distance =
        math.hypot(interpolated_mouse_x, interpolated_mouse_y) / base_scale;

    const alpha: f32 =
        if (100 > distance)
            (@max(distance - 50, 0) / 50)
        else
            1;

    // Dont rendundant rendering
    if (0 >= alpha) return;

    ctx.save();
    defer ctx.restore();

    const width_relative = width / base_scale;
    const height_relative = height / base_scale;

    ctx.translate(width_relative / 2, height_relative / 2);
    ctx.rotate(math.atan2(interpolated_mouse_y, interpolated_mouse_x));
    ctx.scale(antenna_scale, antenna_scale);

    ctx.beginPath();

    ctx.moveTo(movement_helper_start_distance, 0);
    ctx.lineTo(distance, 0);
    ctx.lineTo(distance - 24, -18);
    ctx.moveTo(distance, 0);
    ctx.lineTo(distance - 24, 18);

    ctx.setLineJoin(.round);
    ctx.setLineCap(.round);
    ctx.setGlobalAlpha(alpha * 0.2);
    ctx.setLineWidth(12);
    ctx.strokeColor(comptime Color.comptimeFromHexColorCode("#000000"));
    ctx.stroke();
}

const Vector2 = @Vector(2, f32);

const two_vector = @as(Vector2, @splat(2));

fn onMouseEvent(event_type: event.EventType, e: *const event.MouseEvent) callconv(.c) bool {
    switch (event_type) {
        .mouse_move => {
            mouse_x_offset, mouse_y_offset =
                Vector2{
                    @floatFromInt(e.client_x),
                    @floatFromInt(e.client_y),
                } -
                (Vector2{
                    width,
                    height,
                } / two_vector);

            const angle = math.atan2(mouse_y_offset, mouse_x_offset);
            const distance = math.hypot(mouse_x_offset, mouse_y_offset) / base_scale;

            client.serverbound.sendWaveChangeMove(
                angle,
                if (100 > distance)
                    distance / 100
                else
                    1,
            ) catch
                return false;
        },

        .mouse_up => {
            antenna_scale -= 0.025;
        },

        else => {},
    }

    return true;
}

fn onScreenEvent(_: event.EventType, e: *const event.ScreenEvent) callconv(.c) bool {
    const dpr: Vector2 = @splat(dom.devicePixelRatio());

    width, height =
        Vector2{
            @floatFromInt(e.inner_width),
            @floatFromInt(e.inner_height),
        } * dpr;

    base_scale = @max(
        width / base_width,
        height / base_height,
    );

    ctx.setSize(
        @intFromFloat(width),
        @intFromFloat(height),
    );

    return true;
}

pub const Players = mach_objects.Objects(PlayerImpl.Super, .id);
pub const Mobs = mach_objects.Objects(MobImpl.Super, .id);

var players: Players = undefined;
var mobs: Mobs = undefined;

const EntityKind = enum(u8) {
    player = 0,
    mob = 1,
    petal = 2,
};

inline fn internalAngleToRadians(angle: f32) f32 {
    return (angle / 255) * math.tau;
}

var wave_self_id: EntityId = undefined;

fn handleWaveSelfId(stream: *ws.Clientbound.Reader) anyerror!void {
    wave_self_id = try ws.Clientbound.readVarUint32(stream);
}

/// Possible objects length.
const FiniteObjectCount = u16;

var wave_progress: u16 = 0;

var wave_progress_timer: f32 = 0;

var wave_progress_red_gage_timer: f32 = 0;

var wave_ended: bool = false;

var wave_map_radius: u16 = 0;

fn handleWaveUpdate(stream: *ws.Clientbound.Reader) anyerror!void {
    { // Read wave informations
        wave_progress = try ws.Clientbound.readVarUint16(stream);

        wave_progress_timer = try ws.Clientbound.readFloat32(stream);

        wave_progress_red_gage_timer = try ws.Clientbound.readFloat32(stream);

        wave_ended = try ws.Clientbound.readBool(stream);

        wave_map_radius = try ws.Clientbound.readVarUint16(stream);
    }

    // Lock objects

    mobs.lock();
    defer mobs.unlock();

    players.lock();
    defer players.unlock();

    { // Read eliminated entities
        const eliminated_entities_count: FiniteObjectCount = try ws.Clientbound.readVarUint16(stream);

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
        const lightning_bounces_count: FiniteObjectCount = try ws.Clientbound.readVarUint16(stream);

        for (0..lightning_bounces_count) |_| {
            const points_count: FiniteObjectCount = try ws.Clientbound.readVarUint16(stream);

            for (0..points_count) |_| {
                _ = try ws.Clientbound.readFloat32(stream); // X
                _ = try ws.Clientbound.readFloat32(stream); // Y
            }
        }
    }

    { // Read entities
        const entities_count: FiniteObjectCount = try ws.Clientbound.readVarUint16(stream);

        for (0..entities_count) |_| {
            const entity_kind = try stream.readEnum(EntityKind, .little);

            switch (entity_kind) {
                .player => {
                    const player_id = try stream.readInt(EntityId, .little);

                    const player_x = try ws.Clientbound.readFloat32(stream);
                    const player_y = try ws.Clientbound.readFloat32(stream);

                    const player_angle = internalAngleToRadians(try ws.Clientbound.readFloat32(stream));

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

                    const mob_angle = internalAngleToRadians(try ws.Clientbound.readFloat32(stream));

                    const mob_health = try ws.Clientbound.readFloat32(stream);

                    const mob_size = try ws.Clientbound.readFloat32(stream);

                    const mob_type: EntityType = .{ .mob = try stream.readEnum(MobType, .little) };

                    const mob_rarity = try stream.readEnum(EntityRarity, .little);

                    const mob_bool_flags = try stream.readStruct(packed struct {
                        is_pet: bool,
                        is_first_segment: bool,
                        has_connecting_segment: bool,
                        is_poisoned: bool,
                    });

                    var mob_connecting_segment: ?mach_objects.ObjectId = null;

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

                .petal => {
                    // Petal treated as mob

                    // TODO: in server, the id may collide between player, mob, petal because their pool is separated
                    // So may need to separate mobs objects for petals
                    // That chance is 1 / math.maxInt(u32) but that possibly collidable (and can cause error)
                    const petal_id = try stream.readInt(EntityId, .little);

                    const petal_x = try ws.Clientbound.readFloat32(stream);
                    const petal_y = try ws.Clientbound.readFloat32(stream);

                    const petal_angle = internalAngleToRadians(try ws.Clientbound.readFloat32(stream));

                    const petal_health = try ws.Clientbound.readFloat32(stream);

                    const petal_size = try ws.Clientbound.readFloat32(stream);

                    const petal_type: EntityType = .{ .petal = try stream.readEnum(PetalType, .little) };

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

    try client.serverbound.sendAck(
        @intFromFloat(width),
        @intFromFloat(height),
    );
}

// This function overrides C main
// main(_: c_int, _: [*][*]u8) c_int
export fn main() c_int {
    std.log.debug("main()", .{});

    // Init entity profiles
    EntityProfiles.staticInit();

    ctx = CanvasContext.createCanvasContextFromElement(allocator, "canvas", false);

    { // Initialize client websocket
        client = ws.ClientWebSocket.init(allocator) catch unreachable;

        client.clientbound.putHandler(ws.opcode.Clientbound.wave_self_id, handleWaveSelfId) catch unreachable;
        client.clientbound.putHandler(ws.opcode.Clientbound.wave_update, handleWaveUpdate) catch unreachable;

        client.connect("localhost:8080") catch unreachable;
    }

    { // Initialize dom events
        event.addEventListenerBySelector("canvas", .mouse_move, onMouseEvent, false);
        event.addEventListenerBySelector("canvas", .mouse_up, onMouseEvent, false);

        event.addEventListener(.window, .screen_resize, onScreenEvent, false);

        { // Invoke event to correct init size
            var pseudo_screen_event = std.mem.zeroes(event.ScreenEvent);

            pseudo_screen_event.inner_width = dom.clientWidth();
            pseudo_screen_event.inner_height = dom.clientHeight();

            _ = onScreenEvent(.screen_resize, &pseudo_screen_event);
        }
    }

    { // Initialize ui
        ui = UI.init(allocator, ctx) catch unreachable;
    }

    { // Initialize DOD models
        // Initalize objects
        players.init(allocator);
        mobs.init(allocator);

        // Initialize renderer static values
        PlayerImpl.Renderer.staticInit(allocator);
        MobImpl.Renderer.staticInit(allocator);
    }

    { // Initialize tile map
        tile_ctx = CanvasContext.createCanvasContext(allocator, 256 * 4, 256 * 4, false);

        tile_ctx.drawSVG(@embedFile("Tile/Tiles/desert_c_2.svg"));
    }

    draw(-1);

    return 0;
}

var last_timestamp: i64 = 0;
var prev_timestamp: i64 = 0;

fn draw(_: f32) callconv(.c) void {
    last_timestamp = std.time.milliTimestamp();

    const delta_time: f32 = @floatFromInt(last_timestamp - prev_timestamp);

    prev_timestamp = last_timestamp;

    // Clear canvas
    ctx.clearContextRect();

    ctx.save();

    ctx.scale(base_scale, base_scale);

    const width_relative = width / base_scale;
    const height_relative = height / base_scale;

    const self_player =
        if (players.search(wave_self_id)) |o|
            players.getValue(o)
        else
            null;

    if (self_player) |p|
        tile.renderGameTileset(.{
            .ctx = ctx,

            .tileset = &.{tile_ctx},

            .tile_size = @splat(300),

            .radius = @splat(@floatFromInt(wave_map_radius)),

            .pos = p.pos,

            .screen = .{
                width_relative,
                height_relative,
            },

            .scale = @splat(antenna_scale),
        });

    // Render ui
    ui.render();

    if (self_player) |*p| // Draw movement helper
        drawMovementHelper(p, delta_time);

    { // Render entities
        const center_width = width / 2;
        const center_height = height / 2;

        if (self_player) |p| {
            const x, const y = p.pos;

            const view_scale = base_scale * antenna_scale;

            ctx.setTransform(
                view_scale,
                0,
                0,
                view_scale,
                center_width - x * view_scale,
                center_height - y * view_scale,
            );
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
    }

    ctx.restore();

    _ = CanvasContext.requestAnimationFrame(draw);
}
