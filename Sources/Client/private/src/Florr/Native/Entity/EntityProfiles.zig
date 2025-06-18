const std = @import("std");
const json = std.json;
const MobType = @import("../../../Entity/EntityType.zig").MobType;
const allocator = @import("../../../mem.zig").allocator;

const EntityProfiles = json.Parsed(json.Value);

pub var mob_profiles: EntityProfiles = undefined;

/// Returns pointer to mob profiles to access from outside of this file.
pub inline fn mobProfiles() *EntityProfiles {
    return &mob_profiles;
}

pub var petal_profiles: EntityProfiles = undefined;

/// Returns pointer to petal profiles to access from outside of this file.
pub inline fn petalProfiles() *EntityProfiles {
    return &petal_profiles;
}

pub fn staticInit() void {
    mob_profiles = json.parseFromSlice(
        json.Value,
        allocator,
        @embedFile("ProfileData/mob_profiles.json"),
        .{},
    ) catch |e| {
        std.debug.print("error occured during parse mob profiles: {}\n", .{e});

        unreachable;
    };

    petal_profiles = json.parseFromSlice(
        json.Value,
        allocator,
        @embedFile("ProfileData/petal_profiles.json"),
        .{},
    ) catch |e| {
        std.debug.print("error occured during parse petal profiles: {}\n", .{e});

        unreachable;
    };
}
