const std = @import("std");
const meta = std.meta;
const Color = @import("../../WebAssembly/Interop/Canvas/Color.zig");

pub const Rarity = enum(u8) {
    common,
    unusual,
    rare,
    epic,
    legendary,
    mythic,
    ultra,
};

const rarity_fields = meta.fields(Rarity);

pub const max_rarities: u8 = rarity_fields[rarity_fields.len - 1].value;

const rarity_names = std.StaticStringMap([]const u8).initComptime(.{
    .{ @tagName(Rarity.common), "Common" },
    .{ @tagName(Rarity.unusual), "Unusual" },
    .{ @tagName(Rarity.rare), "Rare" },
    .{ @tagName(Rarity.epic), "Epic" },
    .{ @tagName(Rarity.legendary), "Legendary" },
    .{ @tagName(Rarity.mythic), "Mythic" },
    .{ @tagName(Rarity.ultra), "Ultra" },
});

const rarity_colors = std.StaticStringMap(Color).initComptime(.{
    .{ @tagName(Rarity.common), Color.comptimeFromHexColorCode("#7EEF6D") },
    .{ @tagName(Rarity.unusual), Color.comptimeFromHexColorCode("#FFE65D") },
    .{ @tagName(Rarity.rare), Color.comptimeFromHexColorCode("#4D52E3") },
    .{ @tagName(Rarity.epic), Color.comptimeFromHexColorCode("#861FDE") },
    .{ @tagName(Rarity.legendary), Color.comptimeFromHexColorCode("#DE1F1F") },
    .{ @tagName(Rarity.mythic), Color.comptimeFromHexColorCode("#1FDBDE") },
    .{ @tagName(Rarity.ultra), Color.comptimeFromHexColorCode("#373737") },
});

pub inline fn getRarityName(rarity: Rarity) ?[]const u8 {
    return rarity_names.get(@tagName(rarity));
}

pub inline fn getRarityColor(rarity: Rarity) ?Color {
    return rarity_colors.get(@tagName(rarity));
}
