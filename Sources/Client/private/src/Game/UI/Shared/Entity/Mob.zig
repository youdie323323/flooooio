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
            Segments.init(allocator)
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

pub fn update(self: *@This(), _: *Super, delta_time: f32) void {
    self.total_t += delta_time * 0.025;
}

/// Calculate beak angle for mob.
pub fn calculateBeakAngle(self: MobImpl, comptime multiplier: comptime_float) f32 {
    // No need to modulo self.total_t in 0~τ since sin allow τ+

    return @sin(self.total_t) * multiplier;
}

/// Returns a stat within this mob.
pub fn stat(self: MobImpl) !?json.Value {
    const profiles =
        if (self.type.isMob())
            EntityProfiles.mobProfiles()
        else
            EntityProfiles.petalProfiles();

    var buf: [fmt.comptimePrint("{}", .{PureEntityType}).len]u8 = undefined;

    const type_str = try std.fmt.bufPrint(&buf, "{}", .{self.type.get()});

    return if (profiles.value.object.get(type_str)) |prof| blk: {
        const rarity_str = try std.fmt.bufPrint(&buf, "{}", .{@intFromEnum(self.rarity)});

        break :blk prof.object.get(rarity_str);
    } else null;
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

const ObjectId = @import("MachObjects/objs.zig").ObjectId;
const Entity = @import("Entity.zig").Entity;
const EntityType = @import("EntityType.zig").EntityType;
const PureEntityType = @import("EntityType.zig").PureEntityType;
const MobType = @import("EntityType.zig").MobType;
const EntityRarity = @import("EntityRarity.zig").EntityRarity;
const EntityProfiles = @import("../../../Florr/Native/Entity/EntityProfiles.zig");
const PureRenderer = @import("Renderers/Renderer.zig");
const MobStarfishRenderer = @import("Renderers/Mob/MobStarfishRenderer.zig");
const MobRenderingDispatcher = @import("Renderers/Mob/MobRenderingDispatcher.zig").MobRenderingDispatcher;
