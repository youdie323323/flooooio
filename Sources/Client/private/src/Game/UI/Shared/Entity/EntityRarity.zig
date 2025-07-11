const std = @import("std");
const meta = std.meta;
const Color = @import("../../../Kernel/WebAssembly/Interop/Canvas2D/Color.zig");

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

pub const max_rarities = rarity_fields[rarity_fields.len - 1].value;

const rarity_names: std.EnumMap(EntityRarity, []const u8) = .init(.{
    .common = "Common",
    .unusual = "Unusual",
    .rare = "Rare",
    .epic = "Epic",
    .legendary = "Legendary",
    .mythic = "Mythic",
    .ultra = "Ultra",
});

const rarity_colors: std.EnumMap(EntityRarity, Color) = .init(.{
    .common = .comptimeFromHexColorCode("#7EEF6D"),
    .unusual = .comptimeFromHexColorCode("#FFE65D"),
    .rare = .comptimeFromHexColorCode("#4D52E3"),
    .epic = .comptimeFromHexColorCode("#861FDE"),
    .legendary = .comptimeFromHexColorCode("#DE1F1F"),
    .mythic = .comptimeFromHexColorCode("#1FDBDE"),
    .ultra = .comptimeFromHexColorCode("#373737"),
});

pub fn rarityName(rarity: EntityRarity) ?[]const u8 {
    return rarity_names.get(rarity);
}

pub fn rarityColor(rarity: EntityRarity) ?Color {
    return rarity_colors.get(rarity);
}
