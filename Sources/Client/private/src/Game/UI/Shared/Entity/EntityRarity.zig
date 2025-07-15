pub const EntityRarity = enum(u8) {
    const names: std.EnumMap(EntityRarity, []const u8) = .init(.{
        .common = "Common",
        .unusual = "Unusual",
        .rare = "Rare",
        .epic = "Epic",
        .legendary = "Legendary",
        .mythic = "Mythic",
        .ultra = "Ultra",
    });

    const colors: std.EnumMap(EntityRarity, Color) = .init(.{
        .common = .comptimeFromHexColorCode("#7EEF6D"),
        .unusual = .comptimeFromHexColorCode("#FFE65D"),
        .rare = .comptimeFromHexColorCode("#4D52E3"),
        .epic = .comptimeFromHexColorCode("#861FDE"),
        .legendary = .comptimeFromHexColorCode("#DE1F1F"),
        .mythic = .comptimeFromHexColorCode("#1FDBDE"),
        .ultra = .comptimeFromHexColorCode("#373737"),
    });

    pub fn name(self: EntityRarity) ?[]const u8 {
        return names.get(self);
    }

    pub fn color(self: EntityRarity) ?Color {
        return colors.get(self);
    }

    /// Converts EntityRarity to MobRarity.
    pub fn toMobRarity(self: EntityRarity) MobRarity {
        return @enumFromInt(@intFromEnum(self));
    }

    common,
    unusual,
    rare,
    epic,
    legendary,
    mythic,
    ultra,

    /// Rarity definition especially for mob, since ultra+ mob cannot be spawned.
    /// This should not used for something like function arguments, since mob and petal using same EntityRarity as its rarity declaration.
    /// Just for comptime operations.
    pub const MobRarity = enum(u8) {
        common,
        unusual,
        rare,
        epic,
        legendary,
        mythic,
    };
};

const std = @import("std");
const meta = std.meta;

const Color = @import("../../../Kernel/WebAssembly/Interop/Canvas2D/Color.zig");
