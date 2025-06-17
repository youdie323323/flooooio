const std = @import("std");
const meta = std.meta;

pub const MobType = enum(u8) {
    bee,
    spider,
    hornet,

    beetle,
    sandstorm,
    cactus,
    scorpion,
    ladybug_shiny,

    starfish,
    jellyfish,
    bubble,
    sponge,
    shell,
    crab,
    leech,

    centipede,
    centipede_evil,
    centipede_desert,

    missile_projectile,
    web_projectile,
};

const mob_type_fields = meta.fields(MobType);

pub const mob_type_last_index: u8 = mob_type_fields[mob_type_fields.len - 1].value;

pub const PetalType = enum(u8) {
    basic = mob_type_last_index + 1,
    faster,
    egg_beetle,
    bubble,
    yin_yang,
    mysterious_stick,
    sand,
    lightning,
    claw,
    fang,
    yggdrasil,
    web,
    stinger,
    wing,
    magnet,
};

pub const EntityType = union(enum(u8)) {
    mob: MobType,
    petal: PetalType,

    /// Returns direct entity type within this type.
    pub inline fn get(self: EntityType) u8 {
        switch (self) {
            .mob => |m| return @intFromEnum(m),
            .petal => |p| return @intFromEnum(p),
        }
    }

    pub inline fn isMob(self: EntityType) bool {
        return switch (self) {
            inline .mob => true,
            inline .petal => false,
        };
    }

    pub inline fn isPetal(self: EntityType) bool {
        return switch (self) {
            inline .mob => false,
            inline .petal => true,
        };
    }
};

pub const petal_types = [_]PetalType{
    .basic,
    .faster,
    .egg_beetle,
    .bubble,
    .yin_yang,
    .mysterious_stick,
    .sand,
    .lightning,
    .claw,
    .fang,
    .yggdrasil,
    .web,
    .stinger,
    .wing,
    .magnet,
};
