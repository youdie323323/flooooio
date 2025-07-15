pub const EntityCollision = struct {
    /// Division factor of the size of the scaling that is pre-invoked when drawing. 1 means no scaling.
    fraction: f32,
    /// Radius of circle.
    radius: f32,
};

pub const EntityExtra = std.StaticStringMap(f32);

/// Returns stat map using stat specified.
pub fn EntityStats(comptime Stat: type) type {
    return std.EnumMap(EntityRarity, Stat);
}

const std = @import("std");

const EntityRarity = @import("../../../UI/Shared/Entity/EntityRarity.zig").EntityRarity;
