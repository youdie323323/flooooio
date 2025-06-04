const std = @import("std");
const meta = std.meta;
const Color = @import("../../WebAssembly/Interop/Canvas/Color.zig");

pub const Biome = enum(u8) {
    garden,
    desert,
    ocean,
};

const biome_names = std.StaticStringMap([]const u8).initComptime(.{
    .{ @tagName(Biome.garden), "Garden" },
    .{ @tagName(Biome.desert), "Desert" },
    .{ @tagName(Biome.ocean), "Ocean" },
});

const biome_colors = std.StaticStringMap(Color).initComptime(.{
    .{ @tagName(Biome.garden), Color.comptimeFromHexColorCode("#1ea761") },
    .{ @tagName(Biome.desert), Color.comptimeFromHexColorCode("#ecdcb8") },
    .{ @tagName(Biome.ocean), Color.comptimeFromHexColorCode("#4e77a7") },
});

pub inline fn getBiomeName(biome: Biome) ?[]const u8 {
    return biome_names.get(@tagName(biome));
}

pub inline fn getBiomeColor(biome: Biome) ?Color {
    return biome_colors.get(@tagName(biome));
}
