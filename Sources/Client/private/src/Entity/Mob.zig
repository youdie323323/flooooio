const std = @import("std");
const math = std.math;
const ObjectId = @import("MachObjects/objs.zig").ObjectId;
const Entity = @import("./Entity.zig").Entity;
const EntityType = @import("./EntityType.zig").EntityType;
const EntityRarity = @import("../Florr/Native/Entity/EntityRarity.zig").EntityRarity;
const MobType = @import("./EntityType.zig").MobType;

const starfish = @import("./Renderers/MobStarfishRenderer.zig");

const MobImpl = @This();

const Segments = std.HashMap(ObjectId, void, std.hash_map.AutoContext(ObjectId), 80);

pub const Super = Entity(MobImpl);

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
connecting_segment: ?ObjectId,
/// List of mobs that connected to this mob.
connected_segments: Segments,

/// Leg distances of starfish.
/// Value is null if not starfish.
leg_distances: ?[starfish.leg_amount]f32,

pub fn init(
    allocator: std.mem.Allocator,
    @"type": EntityType,
    rarity: EntityRarity,
    is_pet: bool,
    is_first_segment: bool,
    connecting_segment: ?ObjectId,
) MobImpl {
    return .{
        // Using type identifier directly is detected as keyword
        .type = @"type",

        .rarity = rarity,

        .is_pet = is_pet,

        .is_first_segment = is_first_segment,
        .connecting_segment = connecting_segment,
        .connected_segments = Segments.init(allocator),

        .leg_distances = if (@"type".get() == @intFromEnum(MobType.starfish)) generateDefaultStarfishLegDistance() else null,
    };
}

pub fn deinit(self: *MobImpl, _: std.mem.Allocator, _: *Super) void {
    self.connecting_segment = undefined;
    self.connected_segments.deinit();

    self.leg_distances = undefined;

    self.* = undefined;
}

/// Definition for basic operation of connected_segments.
const SegmentMethods = struct {
    pub fn isConnectedBy(self: *MobImpl, other: ObjectId) bool {
        return self.connected_segments.contains(other);
    }

    pub fn addConnectedSegment(self: *MobImpl, segment: ObjectId) !void {
        try self.connected_segments.put(segment, {});
    }

    pub fn removeConnectedSegment(self: *MobImpl, segment: ObjectId) void {
        _ = self.connected_segments.remove(segment);
    }
};

pub usingnamespace SegmentMethods;

pub fn generateDefaultStarfishLegDistance() [starfish.leg_amount]f32 {
    var distances: [starfish.leg_amount]f32 = undefined;

    for (&distances) |*distance| {
        distance.* = starfish.undestroyed_leg_distance;
    }

    return distances;
}
