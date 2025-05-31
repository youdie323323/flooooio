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

pub const EntityType = union(enum) {
    mob: MobType,
    petal: PetalType,
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
