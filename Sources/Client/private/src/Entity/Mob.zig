const std = @import("std");
const math = std.math;
const Entity = @import("./Entity.zig").Entity;
const EntityType = @import("./EntityType.zig").EntityType;
const EntityRarity = @import("../Florr/Native/Entity/EntityRarity.zig").EntityRarity;
const MobType = @import("./EntityType.zig").MobType;

const starfish = @import("./Renderers/MobStarfishRenderer.zig");

const MobImpl = @This();

pub const Super = Entity(MobImpl);

const Segments = []*Super;

pub const Renderer = @import("./Renderers/MobRenderingDispatcher.zig").MobRenderingDispatcher;

/// Type of mob.
type: EntityType,

/// Rarity of mob.
rarity: EntityRarity,

/// Whether this mob is pet.
is_pet: bool,

/// Whether this mob is first generated segment in segment chain.
is_first_segment: bool,
/// Connected segment of this mob.
connecting_segment: ?*Super,
/// List of mobs that connected to this mob.
connected_segments: ?Segments,

/// Leg distances of starfish.
/// Value is null if not starfish.
leg_distances: ?[starfish.starfish_leg_amount]f32,

pub fn init(
    _: std.mem.Allocator,
    @"type": EntityType,
    rarity: EntityRarity,
    is_pet: bool,
    is_first_segment: bool,
    connecting_segment: ?*Super,
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

        .leg_distances = if (@"type".get() == @intFromEnum(MobType.starfish)) generateDefaultStarfishLegDistance() else null,
    };
}

pub fn deinit(self: *MobImpl, _: *Super) void {
    self.connecting_segment = undefined;
    self.connected_segments = undefined;
}

pub fn generateDefaultStarfishLegDistance() [starfish.starfish_leg_amount]f32 {
    var distances: [starfish.starfish_leg_amount]f32 = undefined;

    for (&distances) |*distance| {
        distance.* = starfish.undestroyed_leg_distance;
    }

    return distances;
}
