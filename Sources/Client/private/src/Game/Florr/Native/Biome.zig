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
    .garden = .comptimeFromHex(0x1EA761),
    .desert = .comptimeFromHex(0xECDCb8),
    .ocean = .comptimeFromHex(0x4E77A7),
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
