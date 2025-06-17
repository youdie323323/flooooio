const std = @import("std");
const json = std.json;
const MobType = @import("./EntityType.zig").MobType;
const comptime_allocator = @import("../../../mem.zig").comptime_allocator;

const EntityProfiles = json.Parsed(json.Value);

pub const mob_profiles: EntityProfiles = json.parseFromSlice(
    json.Value,
    comptime_allocator,
    @embedFile("ProfileData/mob_profiles.json"),
    .{},
) catch |e|
    @compileError(std.fmt.comptimePrint("error occured during parse mob profiles: {}\n", .{e}));

pub const petal_profiles: EntityProfiles = json.parseFromSlice(
    json.Value,
    comptime_allocator,
    @embedFile("ProfileData/petal_profiles.json"),
    .{},
) catch |e|
    @compileError(std.fmt.comptimePrint("error occured during parse petal profiles: {}\n", .{e}));

/// Returns pointer to mob profiles to access from outside of this file.
pub inline fn mobProfiles() *EntityProfiles {
    return &mob_profiles;
}

/// Returns pointer to petal profiles to access from outside of this file.
pub inline fn petalProfiles() *EntityProfiles {
    return &petal_profiles;
}
