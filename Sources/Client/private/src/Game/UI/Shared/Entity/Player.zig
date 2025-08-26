const PlayerImpl = PureRenderer.ValidatedImpl(@This());

pub const Super = Entity(PlayerImpl);

pub const Renderer = PlayerRenderingDispatcher;

/// Mood flags when player is poisoned.
/// If player is poisoned, player's mood is always locked to sad.
const poisoned_mood_flags: [2]bool = .{ false, true };

/// Mood of this player.
mood: PlayerMood.MoodBitSet = .initEmpty(),

/// Name of this player.
name: []const u8,

/// Time properties for face pupil.
angry_t: f32 = 0,
sad_t: f32 = 0,

/// Whether this player is already eliminated from server yet.
was_eliminated: bool = false,

/// Whether this player is dev flower.
is_developer: bool = false,

pub fn init(
    _: mem.Allocator,
    name: []const u8,
) PlayerImpl {
    return .{ .name = name };
}

pub fn deinit(self: *PlayerImpl, _: mem.Allocator, _: *Super) void {
    self.* = undefined;
}

pub fn update(self: *PlayerImpl, entity: *Super, delta_time: f32) void {
    if (entity.is_dead) {
        self.sad_t = 1;
        self.angry_t = 0;
    } else {
        const delta_time_100 = delta_time * comptime (1.0 / 100.0);

        const is_angry, const is_sad =
            if (entity.is_poisoned)
                poisoned_mood_flags
            else
                PlayerMood.decodeMood(self.mood);

        self.angry_t = math.clamp(self.angry_t + (if (is_angry) delta_time_100 else -delta_time_100), 0, 1);
        self.sad_t = math.clamp(self.sad_t + (if (!is_angry and is_sad) delta_time_100 else -delta_time_100), 0, 1);
    }
}

const std = @import("std");
const math = std.math;
const mem = std.mem;

const Entity = @import("Entity.zig").Entity;
const PlayerMood = @import("PlayerMood.zig");
const PureRenderer = @import("Renderers/Renderer.zig");
const PlayerRenderingDispatcher = @import("Renderers/Player/PlayerRenderingDispatcher.zig").PlayerRenderingDispatcher;
