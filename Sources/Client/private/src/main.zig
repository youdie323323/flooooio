/// Global canvas context of this application.
var ctx: *CanvasContext = undefined;

var client: *Network.NetworkClient = undefined;

var width: f32 = 0;
var height: f32 = 0;

var base_scale: f32 = 1;
var antenna_scale: f32 = 0.6;

const base_width: comptime_float = 1300;
const base_height: comptime_float = 650;

var mouse_x_offset: f32 = 0;
var mouse_y_offset: f32 = 0;

var interpolated_mouse_x: f32 = 0;
var interpolated_mouse_y: f32 = 0;

const movement_helper_start_distance: comptime_float = 30;

fn drawMovementHelper(player: *const PlayerImpl.Super, delta_time: f32) void {
    // Dont draw if player is dead
    if (player.is_dead) return;

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
    ctx.strokeColor(comptime .comptimeFromHex(0x000000));
    ctx.stroke();
}

const Vector2 = @Vector(2, f32);

const two_vector: Vector2 = @splat(2);

/// Client-sided self player mood.
var self_mood: PlayerMood.MoodBitSet = .initEmpty();

fn onMouseEvent(@"type": Event.EventType, event: *const Event.MouseEvent) callconv(.c) bool {
    switch (@"type") {
        inline .mouse_move => {
            const screen_vector: Vector2 = .{
                width,
                height,
            };
            const screen_center_vector = screen_vector / two_vector;

            const mouse_pos_vector: Vector2 = .{
                @floatFromInt(event.client_x),
                @floatFromInt(event.client_y),
            };

            mouse_x_offset, mouse_y_offset =
                mouse_pos_vector - screen_center_vector;

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

        inline .mouse_down, .mouse_up => { // Update mood
            const target_mood: usize =
                @intFromEnum(
                    if (event.button == 0)
                        PlayerMood.MoodFlags.angry
                    else if (event.button == 2)
                        PlayerMood.MoodFlags.sad
                    else
                        return true,
                );

            if (@"type" == .mouse_down)
                self_mood.set(target_mood)
            else
                self_mood.unset(target_mood);

            client.out.sendWaveChangeMood(self_mood) catch return false;
        },

        inline else => return false,
    }

    return true;
}

fn onScreenEvent(_: Event.EventType, event: *const Event.ScreenEvent) callconv(.c) bool {
    const dpr: Vector2 = @splat(Dom.devicePixelRatio());

    const screen_vector: Vector2 = .{
        @floatFromInt(event.inner_width),
        @floatFromInt(event.inner_height),
    };

    width, height =
        screen_vector * dpr;

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

var wave_room_biome: Biome = .garden;

fn handleWaveRoomUpdate(stream: *const Network.Reader) anyerror!void {
    { // Read player informations
        const players_count = try stream.readByte();

        for (0..players_count) |_| {
            const player_id = try leb.readUleb128(WaveRoom.PlayerId, stream);

            const player_name = try Network.readCString(stream);

            const player_ready_state = try stream.readEnum(WaveRoom.PlayerReadyState, .little);

            _ = player_id;

            _ = player_name;

            _ = player_ready_state;
        }
    }

    const wave_room_code = try Network.readCString(stream);

    const wave_room_state = try stream.readEnum(WaveRoom.State, .little);

    const wave_room_visibility = try stream.readEnum(WaveRoom.Visibility, .little);

    wave_room_biome = try stream.readEnum(Biome, .little);

    _ = wave_room_code;

    _ = wave_room_state;

    _ = wave_room_visibility;
}

/// Possible abstract objects length.
const FiniteObjectCount = u16;

const EntityKind = enum(u8) {
    player = 0,
    mob = 1,
    petal = 2,
};

var wave_progress: u16 = 0;

var wave_progress_timer: f32 = 0;

var wave_progress_red_gage_timer: f32 = 0;

var wave_ended: bool = false;

var wave_map_radius: u16 = 0;

pub const Players = Mach.Objects(PlayerImpl.Super, .id);
pub const Mobs = Mach.Objects(MobImpl.Super, .id);

var mobs: Mobs = undefined;
var petals: Mobs = undefined;
var players: Players = undefined;

/// Reusable mob render context between entity renders.
var mob_rctx: RenderContext(MobImpl.Super) = undefined;

/// Reusable player render context between entity renders.
var player_rctx: RenderContext(PlayerImpl.Super) = undefined;

fn byteToRadians(angle: f32) f32 {
    return (angle / 255) * math.tau;
}

var wave_self_id: EntityId = undefined;

fn handleWaveSelfId(stream: *const Network.Reader) anyerror!void {
    wave_self_id = try leb.readUleb128(EntityId, stream);
}

var lightning_bounces: std.ArrayListUnmanaged(UIWaveLightningBounce) = .empty;

fn handleWaveUpdate(stream: *const Network.Reader) anyerror!void {
    { // Read wave informations
        wave_progress = try leb.readUleb128(u16, stream);

        wave_progress_timer = try Network.readFloat32(stream);

        wave_progress_red_gage_timer = try Network.readFloat32(stream);

        wave_ended = try Network.readBool(stream);

        wave_map_radius = try leb.readUleb128(u16, stream);
    }

    // Lock objects

    mobs.lock();
    defer mobs.unlock();

    petals.lock();
    defer petals.unlock();

    players.lock();
    defer players.unlock();

    { // Read eliminated entities
        const eliminated_entities_count = try leb.readUleb128(FiniteObjectCount, stream);

        for (0..eliminated_entities_count) |_| {
            const entity_id = try leb.readUleb128(EntityId, stream);

            if (mobs.search(entity_id)) |obj_id| {
                var mob = mobs.get(obj_id);

                mob.is_dead = true;

                mob.dead_t = 0;

                mobs.set(obj_id, mob);

                continue;
            }

            if (petals.search(entity_id)) |obj_id| {
                var petal = petals.get(obj_id);

                petal.is_dead = true;

                petal.dead_t = 0;

                petals.set(obj_id, petal);

                continue;
            }

            if (players.search(entity_id)) |obj_id| {
                var player = players.get(obj_id);

                player.impl.was_eliminated = true;

                player.is_dead = true;

                player.dead_t = 0;

                players.set(obj_id, player);

                continue;
            }
        }
    }

    { // Read lighning bounces
        const lightning_bounces_count = try leb.readUleb128(FiniteObjectCount, stream);

        for (0..lightning_bounces_count) |_| {
            const points_count = try leb.readUleb128(FiniteObjectCount, stream);

            var points: std.ArrayListUnmanaged(UIWaveLightningBounce.Vector2) = .empty;

            for (0..points_count) |_| {
                try points.append(allocator, .{
                    try Network.readFloat32(stream),
                    try Network.readFloat32(stream),
                });
            }

            try lightning_bounces.append(allocator, try .init(allocator, &points));
        }
    }

    { // Read entities
        const entities_count = try leb.readUleb128(FiniteObjectCount, stream);

        for (0..entities_count) |_| {
            const entity_kind = try stream.readEnum(EntityKind, .little);

            switch (entity_kind) {
                inline .mob => {
                    const mob_id = try leb.readUleb128(EntityId, stream);

                    const mob_x = try Network.readFloat32(stream);
                    const mob_y = try Network.readFloat32(stream);

                    const mob_angle = byteToRadians(try Network.readFloat32(stream));

                    const mob_health = try Network.readFloat32(stream);

                    const mob_size = try Network.readFloat32(stream);

                    const mob_type: EntityType = .{ .mob = try stream.readEnum(MobType, .little) };

                    const mob_rarity = try stream.readEnum(EntityRarity, .little);

                    const mob_bool_flags = try stream.readStruct(packed struct {
                        is_pet: bool,
                        is_first_segment: bool,
                        has_connecting_segment: bool,
                        is_poisoned: bool,
                        was_proper_damaged: bool,
                    });

                    var mob_connecting_segment: ?Mach.ObjectId = null;

                    if (mob_bool_flags.has_connecting_segment) {
                        const mob_connecting_segment_id = try leb.readUleb128(EntityId, stream);

                        mob_connecting_segment = mobs.search(mob_connecting_segment_id);
                    }

                    var this_mob_obj_id: Mach.ObjectId = undefined;

                    if (mobs.search(mob_id)) |obj_id| {
                        this_mob_obj_id = obj_id;

                        var mob = mobs.get(obj_id);

                        { // Update next properties
                            mob.next_pos[0] = mob_x;
                            mob.next_pos[1] = mob_y;

                            mob.next_angle = mob_angle;

                            mob.next_size = mob_size;
                        }

                        { // Update health properties
                            // TODO: not same as original code

                            if (mob_bool_flags.was_proper_damaged) {
                                mob.red_health_timer = 1;
                                mob.hurt_t = 1;
                            }

                            mob.next_health = @max(0, mob_health);
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

                        mobs.set(obj_id, mob);
                    } else {
                        const mob: MobImpl.Super = .init(
                            .init(
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
                            if (mob_type.get() == @intFromEnum(MobType.web_projectile))
                                0
                            else
                                mob_size,
                            mob_health,
                        );

                        this_mob_obj_id = try mobs.new(mob);
                    }

                    if (mob_connecting_segment) |obj_id| {
                        var mob = mobs.get(obj_id);

                        // If connected segment mob havent this mob as connected segment, add it then update
                        if (!mob.impl.isConnectedBy(this_mob_obj_id)) {
                            try mob.impl.addConnectedSegment(this_mob_obj_id);

                            mobs.set(obj_id, mob);
                        }
                    }
                },

                inline .petal => {
                    // Petal treated as mob

                    // TODO: in server, the id may collide between player, mob, petal because their pool is separated
                    // So may need to separate mobs objects for petals
                    // That chance is 1 / math.maxInt(u16) but that possibly collidable (and can cause error)
                    const petal_id = try leb.readUleb128(EntityId, stream);

                    const petal_x = try Network.readFloat32(stream);
                    const petal_y = try Network.readFloat32(stream);

                    const petal_angle = byteToRadians(try Network.readFloat32(stream));

                    const petal_health = try Network.readFloat32(stream);

                    const petal_size = try Network.readFloat32(stream);

                    const petal_type: EntityType = .{ .petal = try stream.readEnum(PetalType, .little) };

                    const petal_rarity = try stream.readEnum(EntityRarity, .little);

                    const petal_bool_flags = try stream.readStruct(packed struct {
                        was_proper_damaged: bool,
                    });

                    if (petals.search(petal_id)) |obj_id| {
                        var petal = petals.get(obj_id);

                        { // Update next properties
                            petal.next_pos[0] = petal_x;
                            petal.next_pos[1] = petal_y;

                            petal.next_angle = petal_angle;

                            petal.next_size = petal_size;
                        }

                        { // Update health properties
                            if (petal_bool_flags.was_proper_damaged) {
                                petal.red_health_timer = 1;
                                petal.hurt_t = 1;
                            }

                            petal.next_health = @max(0, petal_health);
                        }

                        { // Update old properties
                            petal.old_pos = petal.pos;

                            petal.old_angle = petal.angle;

                            petal.old_size = petal.size;

                            petal.old_health = petal.health;
                        }

                        petal.update_t = 0;

                        petals.set(obj_id, petal);
                    } else {
                        const petal: MobImpl.Super = .init(
                            .init(
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

                        _ = try petals.new(petal);
                    }
                },

                inline .player => {
                    const player_id = try leb.readUleb128(EntityId, stream);

                    const player_x = try Network.readFloat32(stream);
                    const player_y = try Network.readFloat32(stream);

                    const player_angle = byteToRadians(try Network.readFloat32(stream));

                    const player_health = try Network.readFloat32(stream);

                    const player_size = try Network.readFloat32(stream);

                    const player_mood_mask: PlayerMood.MoodBitSet.MaskInt = @intCast(try stream.readByte());

                    const player_name = try Network.readCString(stream);

                    const player_bool_flags = try stream.readStruct(packed struct {
                        is_dead: bool,
                        is_developer: bool,
                        is_poisoned: bool,
                        was_proper_damaged: bool,
                    });

                    if (players.search(player_id)) |obj_id| {
                        var player = players.get(obj_id);

                        { // Update next properties
                            player.next_pos[0] = player_x;
                            player.next_pos[1] = player_y;

                            player.next_angle = player_angle;

                            player.next_size = player_size;
                        }

                        { // Update health properties
                            // TODO: we need to identify damage type which poison damage and normal damage,
                            // since we want damage effect in poison effect applied
                            if (player_bool_flags.was_proper_damaged) {
                                player.red_health_timer = 1;
                                player.hurt_t = 1;
                            }

                            player.next_health = @max(0, player_health);
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

                        players.set(obj_id, player);
                    } else {
                        const player: PlayerImpl.Super = .init(
                            .init(
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
            }
        }
    }

    try client.out.sendAck(
        @intFromFloat(width),
        @intFromFloat(height),
    );
}

// This function overrides C main
// main(_: c_int, _: [*][*]u8) c_int
export fn main() c_int {
    std.log.debug("main()", .{});

    // Initialize tilesets
    Biome.initTilesets(allocator);

    // Initialize main canvas context
    ctx = CanvasContext.createCanvasContextBySelector(allocator, "canvas", false);

    _ = UITitle.init(allocator);

    { // Initialize client websocket
        client = Network.NetworkClient.init(allocator) catch unreachable;

        client.in.putHandler(.wave_room_update, handleWaveRoomUpdate) catch unreachable;

        client.in.putHandler(.wave_self_id, handleWaveSelfId) catch unreachable;
        client.in.putHandler(.wave_update, handleWaveUpdate) catch unreachable;

        client.connect("localhost:8080") catch unreachable;
    }

    { // Initialize dom events
        Event.addEventListenerBySelector("canvas", .mouse_move, onMouseEvent, false);
        Event.addEventListenerBySelector("canvas", .mouse_up, onMouseEvent, false);
        Event.addEventListenerBySelector("canvas", .mouse_down, onMouseEvent, false);

        Event.addEventListener(.window, .screen_resize, onScreenEvent, false);

        { // Force fire event to correct init size
            var virtual_screen_event = std.mem.zeroes(Event.ScreenEvent);

            virtual_screen_event.inner_width = Dom.clientWidth();
            virtual_screen_event.inner_height = Dom.clientHeight();

            _ = onScreenEvent(.screen_resize, &virtual_screen_event);
        }
    }

    { // Initialize DOD models
        // Initalize objects
        mobs.init(allocator);
        petals.init(allocator);
        players.init(allocator);

        // Initialize renderer static values
        PlayerImpl.Renderer.staticInit(allocator);
        MobImpl.Renderer.staticInit(allocator);

        // Setup render contexts

        mob_rctx = .{
            .ctx = ctx,
            .entity = undefined,
            .is_specimen = false,
            .players = &players,
            .mobs = &mobs,
            .petals = &petals,
        };

        player_rctx = .{
            .ctx = ctx,
            .entity = undefined,
            .is_specimen = false,
            .players = &players,
            .mobs = &mobs,
            .petals = &petals,
        };
    }

    // Initialize lightning bounce
    UIWaveLightningBounce.staticInit();

    draw(-1);

    return 0;
}

var last_timestamp: i64 = 0;
var prev_timestamp: i64 = 0;

fn draw(_: f32) callconv(.c) void {
    // Ensure next frame with defer
    defer _ = CanvasContext.requestAnimationFrame(draw);

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
            players.get(obj_id)
        else
            null;

    if (self_player) |*player| blk: {
        const tileset = wave_room_biome.tileset() orelse break :blk;

        TileRenderer.renderGameTileset(.{
            .ctx = ctx,

            .tileset = tileset,

            .tile_size = @splat(300),

            .radius = @splat(@floatFromInt(wave_map_radius)),

            .pos = player.pos,

            .screen = .{
                width_relative,
                height_relative,
            },

            .scale = @splat(antenna_scale),
        });
    }

    if (self_player) |*player| // Draw movement helper
        drawMovementHelper(player, delta_time);

    { // Render entities
        const center_width = width / 2;
        const center_height = height / 2;

        if (self_player) |*player| {
            const x, const y = player.pos;

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

            var slice = mobs.sortedSlice(
                allocator,
                struct {
                    pub fn impl(lhs: MobImpl.Super, rhs: MobImpl.Super) bool {
                        return lhs.impl.type.mob == .web_projectile and
                            rhs.impl.type.mob != .web_projectile;
                    }
                }.impl,
            ) catch
                // We using defer for next raf, so this is ok
                return;
                
            defer slice.deinit();

            while (slice.next()) |obj_id| {
                var mob = mobs.get(obj_id);

                mob.update(delta_time);

                if (mob.is_dead and mob.dead_t > 1) {
                    var inner_slice = mobs.slice();

                    while (inner_slice.next()) |inner_obj_id| {
                        var inner_mob = mobs.get(inner_obj_id);

                        if (inner_mob.impl.isConnectedBy(obj_id)) {
                            inner_mob.impl.removeConnectedSegment(obj_id);

                            mobs.set(inner_obj_id, inner_mob);
                        }
                    }

                    mob.deinit(allocator);

                    mobs.delete(obj_id);

                    continue;
                }

                mob_rctx.entity = &mob;

                renderEntity(MobImpl, &mob_rctx);

                mobs.set(obj_id, mob);
            }
        }

        {
            petals.lock();
            defer petals.unlock();

            var slice = petals.slice();

            while (slice.next()) |obj_id| {
                var petal = petals.get(obj_id);

                petal.update(delta_time);

                if (petal.is_dead and petal.dead_t > 1) {
                    petal.deinit(allocator);

                    petals.delete(obj_id);

                    continue;
                }

                mob_rctx.entity = &petal;

                renderEntity(MobImpl, &mob_rctx);

                petals.set(obj_id, petal);
            }
        }

        {
            players.lock();
            defer players.unlock();

            var slice = players.slice();

            while (slice.next()) |obj_id| {
                var player = players.get(obj_id);

                player.update(delta_time);

                // Only remove when disconnected
                if (player.impl.was_eliminated and player.dead_t > 1) {
                    player.deinit(allocator);

                    players.delete(obj_id);

                    continue;
                }

                player_rctx.entity = &player;

                renderEntity(PlayerImpl, &player_rctx);

                players.set(obj_id, player);
            }
        }

        { // Lightning bounces
            ctx.strokeColor(comptime .comptimeFromHex(0xFFFFFF));
            ctx.setLineCap(.round);

            const delta_time_500 = delta_time * 0.002;

            var i = lightning_bounces.items.len;

            while (i > 0) : (i -= 1) {
                const i_sub_1 = i - 1;

                const bounce = &lightning_bounces.items[i_sub_1];

                bounce.t -= delta_time_500;

                if (bounce.t <= 0) {
                    _ = lightning_bounces.orderedRemove(i_sub_1);

                    continue;
                }

                ctx.setGlobalAlpha(bounce.t);
                ctx.setLineWidth(5 * bounce.t);
                ctx.strokePath(bounce.path);
            }
        }
    }

    ctx.restore();
}

const std = @import("std");
const builtin = std.builtin;
const math = std.math;
const leb = std.leb;

const Event = @import("Game/Kernel/WebAssembly/Interop/Event.zig");
const Dom = @import("Game/Kernel/WebAssembly/Interop/Dom.zig");
const Timer = @import("Game/Kernel/WebAssembly/Interop/Timer.zig");

const Network = @import("Game/UI/Shared/Network/Network.zig");

const CanvasContext = @import("Game/Kernel/WebAssembly/Interop/Canvas2D/CanvasContext.zig");
const Path2D = @import("Game/Kernel/WebAssembly/Interop/Canvas2D/Path2D.zig");

const EntityId = @import("Game/UI/Shared/Entity/Entity.zig").EntityId;
const EntityType = @import("Game/UI/Shared/Entity/EntityType.zig").EntityType;
const MobType = @import("Game/UI/Shared/Entity/EntityType.zig").MobType;
const PetalType = @import("Game/UI/Shared/Entity/EntityType.zig").PetalType;
const EntityRarity = @import("Game/UI/Shared/Entity/EntityRarity.zig").EntityRarity;

const PlayerImpl = @import("Game/UI/Shared/Entity/Player.zig");
const PlayerMood = @import("Game/UI/Shared/Entity/PlayerMood.zig");

const MobImpl = @import("Game/UI/Shared/Entity/Mob.zig");
const renderEntity = @import("Game/UI/Shared/Entity/Renderers/Renderer.zig").renderEntity;
const RenderContext = @import("Game/UI/Shared/Entity/Renderers/Renderer.zig").RenderContext;

const Mach = @import("Mach/Mach.zig");

const EntityProfiles = @import("Game/Florr/Native/Entity/EntityProfiles.zig");

const WaveRoom = @import("Game/Florr/Native/Wave/WaveRoom.zig");

const Biome = @import("Game/Florr/Native/Biome.zig").Biome;

const TileRenderer = @import("Game/UI/Shared/Tile/TileRenderer.zig");

const UITitle = @import("Game/UI/Title/UITitle.zig");

const UIWaveLightningBounce = @import("Game/UI/Wave/UIWaveLightningBounce.zig");

const allocator = @import("Mem.zig").allocator;
