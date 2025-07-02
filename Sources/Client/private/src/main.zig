const std = @import("std");
const builtin = std.builtin;
const math = std.math;
const leb = std.leb;

const event = @import("Game/WebAssembly/Interop/Event.zig");
const dom = @import("Game/WebAssembly/Interop/Dom.zig");
const ws = @import("Game/WebSocket/ws.zig");

const CanvasContext = @import("Game/WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const Color = @import("Game/WebAssembly/Interop/Canvas2D/Color.zig");
const Path2D = @import("Game/WebAssembly/Interop/Canvas2D/Path2D.zig");

const timer = @import("Game/WebAssembly/Interop/Timer.zig");

const UI = @import("Game/UI/UI.zig");

const EntityId = @import("Game/Entity/Entity.zig").EntityId;
const EntityType = @import("Game/Entity/EntityType.zig").EntityType;
const MobType = @import("Game/Entity/EntityType.zig").MobType;
const PetalType = @import("Game/Entity/EntityType.zig").PetalType;
const EntityRarity = @import("Game/Entity/EntityRarity.zig").EntityRarity;

const PlayerImpl = @import("Game/Entity/Player.zig");
const pmood = @import("Game/Entity/PlayerMood.zig");

const MobImpl = @import("Game/Entity/Mob.zig");
const renderEntity = @import("Game/Entity/Renderers/Renderer.zig").renderEntity;
const MobRenderingDispatcher = @import("Game/Entity/Renderers/Mob/MobRenderingDispatcher.zig").MobRenderingDispatcher;

const mach_objects = @import("Game/Entity/MachObjects/objs.zig");

const EntityProfiles = @import("Game/Florr/Native/Entity/EntityProfiles.zig");

const tile = @import("Game/Tile/TileRenderer.zig");

const allocator = @import("mem.zig").allocator;

/// Global canvas context of this application.
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
    // Dont draw if player is dead
    if (self_player.is_dead) return;

    { // Interpolate mouse x and y
        const delta_time_50_safelerp = @min(1, delta_time * 0.02);

        interpolated_mouse_x = math.lerp(interpolated_mouse_x, mouse_x_offset / antenna_scale, delta_time_50_safelerp);
        interpolated_mouse_y = math.lerp(interpolated_mouse_y, mouse_y_offset / antenna_scale, delta_time_50_safelerp);
    }

    const distance = math.hypot(interpolated_mouse_x, interpolated_mouse_y) / base_scale;

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

const two_vector: Vector2 = @splat(2);

var self_mood: pmood.MoodBitSet = .initEmpty();

fn onMouseEvent(event_type: event.EventType, e: *const event.MouseEvent) callconv(.c) bool {
    switch (event_type) {
        .mouse_move => {
            const center = Vector2{
                width,
                height,
            } / two_vector;

            mouse_x_offset, mouse_y_offset =
                Vector2{
                    @floatFromInt(e.client_x),
                    @floatFromInt(e.client_y),
                } -
                center;

            const angle = math.atan2(mouse_y_offset, mouse_x_offset);
            const distance = math.hypot(mouse_x_offset, mouse_y_offset) / base_scale;

            client.out.sendWaveChangeMove(
                angle,
                if (100 > distance)
                    distance / 100
                else
                    1,
            ) catch return false;
        },

        .mouse_down, .mouse_up => { // Update mood
            const target_mood: usize =
                @intFromEnum(
                    if (e.button == 0)
                        pmood.MoodFlags.angry
                    else if (e.button == 2)
                        pmood.MoodFlags.sad
                    else
                        return true,
                );

            if (event_type == .mouse_down)
                self_mood.set(target_mood)
            else
                self_mood.unset(target_mood);

            client.out.sendWaveChangeMood(self_mood) catch return false;
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

fn handleWaveSelfId(stream: *ws.Reader) anyerror!void {
    wave_self_id = try leb.readUleb128(u32, stream);
}

/// Possible abstract objects length.
const FiniteObjectCount = u16;

var wave_progress: u16 = 0;

var wave_progress_timer: f32 = 0;

var wave_progress_red_gage_timer: f32 = 0;

var wave_ended: bool = false;

var wave_map_radius: u16 = 0;

fn handleWaveUpdate(stream: *ws.Reader) anyerror!void {
    { // Read wave informations
        wave_progress = try leb.readUleb128(u16, stream);

        wave_progress_timer = try ws.readFloat32(stream);

        wave_progress_red_gage_timer = try ws.readFloat32(stream);

        wave_ended = try ws.readBool(stream);

        wave_map_radius = try leb.readUleb128(u16, stream);
    }

    // Lock objects

    mobs.lock();
    defer mobs.unlock();

    players.lock();
    defer players.unlock();

    { // Read eliminated entities
        const eliminated_entities_count = try leb.readUleb128(FiniteObjectCount, stream);

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
        const lightning_bounces_count = try leb.readUleb128(FiniteObjectCount, stream);

        for (0..lightning_bounces_count) |_| {
            const points_count = try leb.readUleb128(FiniteObjectCount, stream);

            for (0..points_count) |_| {
                _ = try ws.readFloat32(stream); // X
                _ = try ws.readFloat32(stream); // Y
            }
        }
    }

    { // Read entities
        const entities_count = try leb.readUleb128(FiniteObjectCount, stream);

        for (0..entities_count) |_| {
            const entity_kind = try stream.readEnum(EntityKind, .little);

            switch (entity_kind) {
                .player => {
                    const player_id = try stream.readInt(EntityId, .little);

                    const player_x = try ws.readFloat32(stream);
                    const player_y = try ws.readFloat32(stream);

                    const player_angle = internalAngleToRadians(try ws.readFloat32(stream));

                    const player_health = try ws.readFloat32(stream);

                    const player_size = try ws.readFloat32(stream);

                    const player_mood_mask: pmood.MoodBitSet.MaskInt = @intCast(try stream.readByte());

                    const player_name = try ws.readCString(stream);

                    const player_bool_flags = try stream.readStruct(packed struct {
                        is_dead: bool,
                        is_developer: bool,
                        is_poisoned: bool,
                    });

                    if (players.search(player_id)) |obj_id| {
                        var player = players.getValue(obj_id);

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

                        players.setValue(obj_id, player);
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

                    const mob_x = try ws.readFloat32(stream);
                    const mob_y = try ws.readFloat32(stream);

                    const mob_angle = internalAngleToRadians(try ws.readFloat32(stream));

                    const mob_health = try ws.readFloat32(stream);

                    const mob_size = try ws.readFloat32(stream);

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

                    if (mobs.search(mob_id)) |obj_id| {
                        var mob = mobs.getValue(obj_id);

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

                        mobs.setValue(obj_id, mob);
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

                    // TODO: this is broken, because the mob_connecting_segment was not updated before this mob gets an zero object
                    if (mob_connecting_segment) |obj_id| {
                        var mob = mobs.getValue(obj_id);

                        // If connected segment mob hasnt this mob as connected segment, add it then update
                        if (!mob.impl.isConnectedBy(mob_id)) {
                            try mob.impl.addConnectedSegment(mob_id);

                            mobs.setValue(obj_id, mob);
                        }
                    }
                },

                .petal => {
                    // Petal treated as mob

                    // TODO: in server, the id may collide between player, mob, petal because their pool is separated
                    // So may need to separate mobs objects for petals
                    // That chance is 1 / math.maxInt(u32) but that possibly collidable (and can cause error)
                    const petal_id = try stream.readInt(EntityId, .little);

                    const petal_x = try ws.readFloat32(stream);
                    const petal_y = try ws.readFloat32(stream);

                    const petal_angle = internalAngleToRadians(try ws.readFloat32(stream));

                    const petal_health = try ws.readFloat32(stream);

                    const petal_size = try ws.readFloat32(stream);

                    const petal_type: EntityType = .{ .petal = try stream.readEnum(PetalType, .little) };

                    const petal_rarity = try stream.readEnum(EntityRarity, .little);

                    if (mobs.search(petal_id)) |obj_id| {
                        var petal = mobs.getValue(obj_id);

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

                        mobs.setValue(obj_id, petal);
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

    try client.out.sendAck(
        @intFromFloat(width),
        @intFromFloat(height),
    );
}

var ui_talent: UITalent = .{};

const wheel_t_multiplier: f32 = 1.0 / 5_000.0;

fn onWheel(_: event.EventType, e: *const event.WheelEvent) callconv(.c) bool {
    const delta_y_f32: f32 = @floatCast(e.delta_y);

    ui_talent.target_t += delta_y_f32 * wheel_t_multiplier;
    ui_talent.target_t = math.clamp(ui_talent.target_t, 0, 1);

    return true;
}

const UITalent = struct {
    const k: f32 = 5;

    const talent_radius: f32 = 25;

    const time_interpolation_factor: f32 = 0.05;

    const pi2: f32 = math.pi / 2.0;

    comptime columns: [14][3]bool = .{
        // Col 1
        .{
            true,
            false,
            true,
        },
        // Col 2
        .{
            false,
            false,
            true,
        },
        // Col 3
        .{
            true,
            true,
            true,
        },
        // Col 3
        .{
            true,
            true,
            true,
        },
        // Col 3
        .{
            true,
            true,
            true,
        },
        // Col 3
        .{
            true,
            true,
            true,
        },
        // Col 3
        .{
            true,
            true,
            true,
        },
        // Col 3
        .{
            true,
            true,
            true,
        },
        // Col 3
        .{
            true,
            true,
            true,
        },
        // Col 3
        .{
            true,
            true,
            true,
        },
        // Col 3
        .{
            true,
            true,
            true,
        },
        // Col 3
        .{
            true,
            true,
            true,
        },
        // Col 3
        .{
            true,
            true,
            true,
        },
        // Col 3
        .{
            true,
            true,
            true,
        },
    },

    /// Camera position.
    camera: Vector2 = .{ 300, 300 },

    t: f32 = 0,
    target_t: f32 = 0,

    /// Calculate column n ratio.
    inline fn calculateCnT(self: UITalent, n: f32) f32 {
        const columns_len_f32: f32 = @floatFromInt(self.columns.len + 1);

        return n / columns_len_f32;
    }

    /// Calculate delta t using global t and t_{C_{n}}.
    inline fn calculateCnDeltaT(self: UITalent, n: f32) f32 {
        return self.calculateCnT(n) - self.t;
    }

    /// Calculate theta of C_{n}.
    inline fn calculateThetaCn(self: UITalent, n: f32) ?f32 {
        const delta_t = self.calculateCnDeltaT(n);
        if (0 > delta_t) return null;

        return pi2 - k * delta_t;
    }

    pub fn render(self: *UITalent) void {
        // Interpolate time
        self.t = math.lerp(self.t, self.target_t, time_interpolation_factor);

        ctx.save();
        defer ctx.restore();

        ctx.fillColor(comptime Color.comptimeFromHexColorCode("#ff0000"));

        for (self.columns, 0..) |column, j| {
            const n_f32: f32 = @floatFromInt(j + 1);

            const column_theta = self.calculateThetaCn(n_f32) orelse continue;

            const column_len = column.len - 1;

            const column_delta_t = @abs(pi2 - column_theta);
            const column_delta_t_vector: Vector2 = .{ 0, 0 };

            const column_camera = self.camera + column_delta_t_vector;

            const row_space = 2 * (4 - column_delta_t * 0.5) * talent_radius;

            const column_vector: Vector2 = .{ @sin(column_theta), @cos(column_theta) };

            for (column, 0..) |row, i| {
                if (!row) continue;

                const i_invert: f32 = @floatFromInt(column_len - i);
                const row_render_position_multiplier: Vector2 = @splat(i_invert * row_space + 50);

                const rx, const ry = column_camera + column_vector * row_render_position_multiplier;

                ctx.beginPath();

                ctx.arc(rx, ry, talent_radius, 0, math.tau, false);

                ctx.fill();
            }
        }
    }
};

// This function overrides C main
// main(_: c_int, _: [*][*]u8) c_int
export fn main() c_int {
    std.log.debug("main()", .{});

    // Init entity profiles
    EntityProfiles.staticInit();

    ctx = CanvasContext.createCanvasContextBySelector(allocator, "canvas", false);

    { // Initialize client websocket
        client = ws.ClientWebSocket.init(allocator) catch unreachable;

        client.in.putHandler(ws.opcode.Clientbound.wave_self_id, handleWaveSelfId) catch unreachable;
        client.in.putHandler(ws.opcode.Clientbound.wave_update, handleWaveUpdate) catch unreachable;

        client.connect("localhost:8080") catch unreachable;
    }

    { // Initialize dom events
        event.addEventListenerBySelector("canvas", .mouse_move, onMouseEvent, false);
        event.addEventListenerBySelector("canvas", .mouse_up, onMouseEvent, false);
        event.addEventListenerBySelector("canvas", .mouse_down, onMouseEvent, false);

        event.addEventListener(.window, .screen_resize, onScreenEvent, false);

        { // Force fire event to correct init size
            var virtual_screen_event = std.mem.zeroes(event.ScreenEvent);

            virtual_screen_event.inner_width = dom.clientWidth();
            virtual_screen_event.inner_height = dom.clientHeight();

            _ = onScreenEvent(.screen_resize, &virtual_screen_event);
        }

        event.addEventListenerBySelector("canvas", .wheel, onWheel, false);
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

        tile_ctx.drawSVG(@embedFile("Game/Tile/Tiles/desert_c_2.svg"));
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
        if (players.search(wave_self_id)) |obj_id|
            players.getValue(obj_id)
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

    ui_talent.render();

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

            while (slice.next()) |obj_id| {
                var mob = mobs.getValue(obj_id);

                mob.update(delta_time);

                // Only remove when disconnected
                if (mob.is_dead and mob.dead_t > 1) {
                    var inner_slice = mobs.slice();

                    // TODO: currently this operation is O(n) but having connecting segment in mob, this can done in O(1)
                    while (inner_slice.next()) |inner_obj_id| {
                        var inner_mob = mobs.getValue(inner_obj_id);

                        if (inner_mob.impl.isConnectedBy(obj_id)) {
                            inner_mob.impl.removeConnectedSegment(obj_id);

                            mobs.setValue(inner_obj_id, inner_mob);
                        }
                    }

                    mob.deinit(allocator);

                    mobs.delete(obj_id);

                    continue;
                }

                renderEntity(MobImpl, &.{
                    .ctx = ctx,
                    .entity = &mob,
                    .is_specimen = false,
                    .players = &players,
                    .mobs = &mobs,
                });

                mobs.setValue(obj_id, mob);
            }
        }

        {
            players.lock();
            defer players.unlock();

            var slice = players.slice();

            while (slice.next()) |obj_id| {
                var player = players.getValue(obj_id);

                player.update(delta_time);

                // Only remove when disconnected
                if (player.impl.was_eliminated and player.dead_t > 1) {
                    player.deinit(allocator);

                    players.delete(obj_id);

                    continue;
                }

                renderEntity(PlayerImpl, &.{
                    .ctx = ctx,
                    .entity = &player,
                    .is_specimen = false,
                    .players = &players,
                    .mobs = &mobs,
                });

                players.setValue(obj_id, player);
            }
        }
    }

    ctx.restore();

    _ = CanvasContext.requestAnimationFrame(draw);
}
