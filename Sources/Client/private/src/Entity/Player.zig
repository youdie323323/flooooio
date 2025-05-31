const std = @import("std");
const math = std.math;
const Entity = @import("./Entity.zig").Entity;
const MoodBitSet = @import("./PlayerMood.zig").MoodBitSet;
const MoodFlags = @import("./PlayerMood.zig").MoodFlags;
const decodeMood = @import("./PlayerMood.zig").decodeMood;

var delta_time = @import("./Entity.zig").delta_time;

pub const PlayerImpl = struct {
    mood: MoodBitSet = MoodBitSet.initEmpty(),

    angry_t: f32 = 0,
    sad_t: f32 = 0,

    /// Whether this player is already eliminated from server yet.
    was_eliminated: bool = false,

    /// Whether this player is dev flower.
    is_developer: bool = false,

    pub fn init(_: std.mem.Allocator) PlayerImpl {
        return .{};
    }

    pub fn update(self: *PlayerImpl, entity: anytype) void {
        if (entity.is_dead) {
            self.sad_t = 1;
            self.angry_t = 0;
        } else {
            const mood_mouth_speed = delta_time / 100;

            var is_angry, var is_sad = decodeMood(self.mood);

            if (entity.is_poisoned) {
                is_angry = false;
                is_sad = false;
            }

            self.angry_t = math.clamp(self.angry_t + (if (is_angry) mood_mouth_speed else -mood_mouth_speed), 0, 1);
            self.sad_t = math.clamp(self.sad_t + (if (!is_angry and is_sad) mood_mouth_speed else -mood_mouth_speed), 0, 1);
        }
    }
};

pub const Player = Entity(PlayerImpl);
