const MobImpl = @This();

pub const Super = Entity(MobImpl);

pub const Renderer = MobRenderingDispatcher;

comptime { // Validate
    PureRenderer.validateEntityImplementation(MobImpl);
}

const StarfishLegDistances = [MobStarfishRenderer.leg_amount]f32;

const Segments = std.AutoHashMap(ObjectId, void);

/// Linkable mob types defined in wave_mob_spawner.go.
const linkable_mob_types = [_]MobType{
    .centipede,
    .centipede_desert,
    .centipede_evil,
    .leech,
};

/// Type of this mob.
type: EntityType,

/// Rarity of this mob.
rarity: EntityRarity,

/// Whether this mob is pet.
is_pet: bool,

/// Total time increases continuously constantly, that not affected by moving counter or something.
total_t: f32 = 0,

/// Whether this mob is first generated segment in segment chain.
is_first_segment: bool,
/// Connected segment of this mob.
connecting_segment: ?ObjectId,
/// List of mobs that connected to this mob.
connected_segments: ?Segments,

/// Leg distances of starfish.
/// Value is null if this mob is not starfish.
leg_distances: ?StarfishLegDistances,

pub fn init(
    allocator: std.mem.Allocator,
    @"type": EntityType,
    rarity: EntityRarity,
    is_pet: bool,
    is_first_segment: bool,
    connecting_segment: ?ObjectId,
) MobImpl {
    const is_linkable =
        if (@"type".isMob())
            std.mem.indexOfScalar(MobType, &linkable_mob_types, @"type".mob) != null
        else
            false;

    return .{
        // Using "type" identifier directly detected as keyword, @"type" will avoid that
        .type = @"type",

        .rarity = rarity,

        .is_pet = is_pet,

        .is_first_segment = is_first_segment,
        .connecting_segment = connecting_segment,
        .connected_segments = if (is_linkable)
            .init(allocator)
        else
            null,

        .leg_distances = if (@"type".get() == @intFromEnum(MobType.starfish))
            // Splat doesnt allow nullable type
            @as(StarfishLegDistances, @splat(MobStarfishRenderer.undestroyed_leg_distance))
        else
            null,
    };
}

pub fn deinit(self: *MobImpl, _: std.mem.Allocator, _: *Super) void {
    if (self.connected_segments) |*s|
        s.deinit();

    self.* = undefined;
}

pub fn update(self: *MobImpl, _: *Super, delta_time: f32) void {
    self.total_t += delta_time * 0.025;
}

/// Calculate beak angle for mob.
pub fn calculateBeakAngle(self: *const MobImpl, comptime multiplier: comptime_float) f32 {
    // No need to modulo self.total_t in 0~τ since sin allow τ+

    return @sin(self.total_t) * multiplier;
}

/// Returns a mob profile within this mob.
/// Caller must guarantees this mob is mob.
pub fn mobProfile(self: *const MobImpl) ?MobData {
    debug.assert(self.type.isMob());

    return mob_profiles.get(self.type.mob);
}

/// Returns a mob stat within this mob.
/// Caller must guarantees this mob is mob.
pub fn mobStat(self: *const MobImpl) ?MobStat {
    return self.mobProfile().?.statByRarity(self.rarity);
}

/// Returns a petal profile within this petal.
/// Caller must guarantees this mob is petal.
pub fn petalProfile(self: *const MobImpl) ?PetalData {
    debug.assert(self.type.isPetal());

    return petal_profiles.get(self.type.petal);
}

/// Returns a petal stat within this petal.
/// Caller must guarantees this mob is petal.
pub fn petalStat(self: *const MobImpl) ?PetalStat {
    return self.petalProfile().?.statByRarity(self.rarity);
}

// Define segment methods

pub fn isConnectedBy(self: *MobImpl, other: ObjectId) bool {
    if (self.connected_segments) |s|
        return s.contains(other);

    return false;
}

pub fn addConnectedSegment(self: *MobImpl, segment: ObjectId) !void {
    if (self.connected_segments) |*s|
        try s.put(segment, {});
}

pub fn removeConnectedSegment(self: *MobImpl, segment: ObjectId) void {
    if (self.connected_segments) |*s|
        _ = s.remove(segment);
}

const std = @import("std");
const math = std.math;
const json = std.json;
const fmt = std.fmt;
const debug = std.debug;

const ObjectId = @import("../../../../Mach/Mach.zig").ObjectId;

const Entity = @import("Entity.zig").Entity;
const EntityType = @import("EntityType.zig").EntityType;
const PureEntityType = @import("EntityType.zig").PureEntityType;
const MobType = @import("EntityType.zig").MobType;
const EntityRarity = @import("EntityRarity.zig").EntityRarity;

const mob_profiles = @import("../../../Florr/Native/Entity/MobProfiles.zig").mob_profiles;
const MobStat = @import("../../../Florr/Native/Entity/MobProfiles.zig").MobStat;
const MobData = @import("../../../Florr/Native/Entity/MobProfiles.zig").MobData;
const petal_profiles = @import("../../../Florr/Native/Entity/PetalProfiles.zig").petal_profiles;
const PetalStat = @import("../../../Florr/Native/Entity/PetalProfiles.zig").PetalStat;
const PetalData = @import("../../../Florr/Native/Entity/PetalProfiles.zig").PetalData;

const PureRenderer = @import("Renderers/Renderer.zig");
const MobStarfishRenderer = @import("Renderers/Mob/MobStarfishRenderer.zig");
const MobRenderingDispatcher = @import("Renderers/Mob/MobRenderingDispatcher.zig").MobRenderingDispatcher;
