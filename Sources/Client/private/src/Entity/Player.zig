const std = @import("std");
const math = std.math;
const Entity = @import("Entity.zig").Entity;
const pmood = @import("PlayerMood.zig");
const PureRenderer = @import("Renderers/Renderer.zig");

pub const Super = Entity(@This());

pub const Renderer = @import("Renderers/Player/PlayerRenderingDispatcher.zig").PlayerRenderingDispatcher;

comptime { // Validate
    PureRenderer.validateEntityImplementation(@This());
}

/// Mood of player.
mood: pmood.MoodBitSet = .initEmpty(),

/// Name of player.
name: []const u8,

/// Time properties for face pupil.
angry_t: f32 = 0,
sad_t: f32 = 0,

/// Whether this player is already eliminated from server yet.
was_eliminated: bool = false,

/// Whether this player is dev flower.
is_developer: bool = false,

pub fn init(
    _: std.mem.Allocator,
    name: []const u8,
) @This() {
    return .{ .name = name };
}

pub fn deinit(self: *@This(), _: std.mem.Allocator, _: *Super) void {
    self.* = undefined;
}

pub fn update(self: *@This(), delta_time: f32, entity: *Super) void {
    if (entity.is_dead) {
        self.sad_t = 1;
        self.angry_t = 0;
    } else {
        const mood_mouth_speed = delta_time / 100;

        var is_angry, var is_sad = pmood.decodeMood(self.mood);

        if (entity.is_poisoned) {
            is_angry = false;
            is_sad = false;
        }

        self.angry_t = math.clamp(self.angry_t + (if (is_angry) mood_mouth_speed else -mood_mouth_speed), 0, 1);
        self.sad_t = math.clamp(self.sad_t + (if (!is_angry and is_sad) mood_mouth_speed else -mood_mouth_speed), 0, 1);
    }
}
