pub const Biome = enum {
    garden,
    desert,
    ocean,
};

const biome_names: std.EnumMap(Biome, []const u8) = .init(.{
    .garden = "Garden",
    .desert = "Desert",
    .ocean = "Ocean",
});

const biome_colors: std.EnumMap(Biome, Color) = .init(.{
    .garden = .comptimeFromHexColorCode("#1ea761"),
    .desert = .comptimeFromHexColorCode("#ecdcb8"),
    .ocean = .comptimeFromHexColorCode("#4e77a7"),
});

pub fn name(biome: Biome) ?[]const u8 {
    return biome_names.get(biome);
}

pub fn color(biome: Biome) ?Color {
    return biome_colors.get(biome);
}

const std = @import("std");
const meta = std.meta;

const Color = @import("../../Kernel/WebAssembly/Interop/Canvas2D/Color.zig");
