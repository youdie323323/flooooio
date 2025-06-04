const std = @import("std");
const meta = std.meta;
const Color = @import("../../../WebAssembly/Interop/Canvas/Color.zig");

pub const EntityRarity = enum(u8) {
    common,
    unusual,
    rare,
    epic,
    legendary,
    mythic,
    ultra,
};

const rarity_fields = meta.fields(EntityRarity);

pub const max_rarities: u8 = rarity_fields[rarity_fields.len - 1].value;

const rarity_names = std.StaticStringMap([]const u8).initComptime(.{
    .{ @tagName(EntityRarity.common), "Common" },
    .{ @tagName(EntityRarity.unusual), "Unusual" },
    .{ @tagName(EntityRarity.rare), "Rare" },
    .{ @tagName(EntityRarity.epic), "Epic" },
    .{ @tagName(EntityRarity.legendary), "Legendary" },
    .{ @tagName(EntityRarity.mythic), "Mythic" },
    .{ @tagName(EntityRarity.ultra), "Ultra" },
});

const rarity_colors = std.StaticStringMap(Color).initComptime(.{
    .{ @tagName(EntityRarity.common), Color.comptimeFromHexColorCode("#7EEF6D") },
    .{ @tagName(EntityRarity.unusual), Color.comptimeFromHexColorCode("#FFE65D") },
    .{ @tagName(EntityRarity.rare), Color.comptimeFromHexColorCode("#4D52E3") },
    .{ @tagName(EntityRarity.epic), Color.comptimeFromHexColorCode("#861FDE") },
    .{ @tagName(EntityRarity.legendary), Color.comptimeFromHexColorCode("#DE1F1F") },
    .{ @tagName(EntityRarity.mythic), Color.comptimeFromHexColorCode("#1FDBDE") },
    .{ @tagName(EntityRarity.ultra), Color.comptimeFromHexColorCode("#373737") },
});

pub inline fn getRarityName(rarity: EntityRarity) ?[]const u8 {
    return rarity_names.get(@tagName(rarity));
}

pub inline fn getRarityColor(rarity: EntityRarity) ?Color {
    return rarity_colors.get(@tagName(rarity));
}
