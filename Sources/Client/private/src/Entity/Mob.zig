const std = @import("std");
const math = std.math;
const Entity = @import("./Entity.zig").Entity;
const EntityType = @import("./EntityType.zig").EntityType;
const Rarity = @import("../Florr/Native/Rarity.zig").Rarity;

var delta_time = @import("./Entity.zig").delta_time;

const Segments = []*Mob;

pub const MobImpl = struct {
    /// Type of mob.
    type: EntityType,

    /// Rarity of mob.
    rarity: Rarity,

    /// Whether this mob is pet.
    is_pet: bool,

    /// Whether this mob is first generated segment in segment chain.
    is_first_segment: bool,
    /// Connected segment of this mob.
    connecting_segment: ?*Mob,
    /// List of mobs that connected to this mob.
    connected_segments: ?Segments,

    pub fn init(
        _: std.mem.Allocator,
        @"type": EntityType,
        rarity: Rarity,
        is_pet: bool,
        is_first_segment: bool,
        connecting_segment: ?*Mob,
        connected_segments: ?Segments,
    ) MobImpl {
        return .{
            // Using type identifier directly is detected as keyword
            .type = @"type",

            .rarity = rarity,

            .is_pet = is_pet,

            .is_first_segment = is_first_segment,
            .connecting_segment = connecting_segment,
            .connected_segments = connected_segments,
        };
    }

    pub fn deinit(self: *MobImpl, _: anytype) void {
        self.connecting_segment = null;
    }
};

pub const Mob = Entity(MobImpl);
