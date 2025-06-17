const std = @import("std");
const math = std.math;
const json = std.json;
const ObjectId = @import("MachObjects/objs.zig").ObjectId;
const Entity = @import("Entity.zig").Entity;
const EntityType = @import("../Florr/Native/Entity/EntityType.zig").EntityType;
const EntityRarity = @import("../Florr/Native/Entity/EntityRarity.zig").EntityRarity;
const EntityProfiles = @import("../Florr/Native/Entity/EntityProfiles.zig");
const MobType = @import("../Florr/Native/Entity/EntityType.zig").MobType;
const PureRenderer = @import("Renderers/Renderer.zig");
const starfish = @import("Renderers/Mob/MobStarfishRenderer.zig");

const MobImpl = @This();

pub const Super = Entity(MobImpl);

pub const Renderer = @import("Renderers/Mob/MobRenderingDispatcher.zig").MobRenderingDispatcher;

comptime { // Validate
    PureRenderer.validateEntityImplementation(MobImpl);
}

const Segments = std.AutoHashMap(ObjectId, void);

const StarfishLegDistances = [starfish.leg_amount]f32;

/// Linkable mob types defined in wave_mob_spawner.go.
const linkable_mob_types = [_]MobType{
    .centipede,
    .centipede_desert,
    .centipede_evil,
    .leech,
};

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
connected_segments: ?Segments,

/// Leg distances of starfish.
/// Value is null if mob is not starfish.
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
            std.mem.indexOf(MobType, &linkable_mob_types, &.{@"type".mob}) != null
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
            @as(StarfishLegDistances, @splat(starfish.undestroyed_leg_distance))
        else
            null,
    };
}

pub fn deinit(self: *MobImpl, _: std.mem.Allocator, _: *Super) void {
    self.connecting_segment = undefined;
    if (self.connected_segments) |*s| s.deinit();

    self.leg_distances = undefined;

    self.* = undefined;
}

/// Returns a stat within this mob.
pub inline fn stat(self: MobImpl, allocator: std.mem.Allocator) !?json.Value {
    const type_value_string = try std.fmt.allocPrint(allocator, "{}", .{self.type.get()});
    defer allocator.free(type_value_string);

    const profiles =
        if (self.type.isMob())
            EntityProfiles.mobProfiles()
        else
            EntityProfiles.petalProfiles();

    return if (profiles.value.object.get(type_value_string)) |prof| blk: {
        const rarity_value_string = try std.fmt.allocPrint(allocator, "{}", .{@intFromEnum(self.rarity)});
        defer allocator.free(rarity_value_string);

        break :blk prof.object.get(rarity_value_string);
    } else null;
}

/// Basic operation of connected_segments.
pub usingnamespace struct {
    pub fn isConnectedBy(self: *MobImpl, other: ObjectId) bool {
        if (self.connected_segments) |s| {
            return s.contains(other);
        }

        return false;
    }

    pub fn addConnectedSegment(self: *MobImpl, segment: ObjectId) !void {
        if (self.connected_segments) |*s| {
            try s.put(segment, {});
        }
    }

    pub fn removeConnectedSegment(self: *MobImpl, segment: ObjectId) void {
        if (self.connected_segments) |*s| {
            _ = s.remove(segment);
        }
    }
};
