pub const PureEntityType = u8;

pub const MobType = enum(PureEntityType) {
    bee,
    spider,
    hornet,
    baby_ant,
    worker_ant,
    soldier_ant,

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

pub const mob_type_last_index: PureEntityType = mob_type_fields[mob_type_fields.len - 1].value;

pub const PetalType = enum(PureEntityType) {
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

pub const EntityType = union(enum(PureEntityType)) {
    mob: MobType,
    petal: PetalType,

    /// Returns direct entity type within this type.
    pub fn get(self: @This()) PureEntityType {
        switch (self) {
            .mob => |m| return @intFromEnum(m),
            .petal => |p| return @intFromEnum(p),
        }
    }

    /// Returns whether this EntityType is mob type.
    pub fn isMob(self: @This()) bool {
        return switch (self) {
            inline .mob => true,
            inline .petal => false,
        };
    }

    /// Returns whether this mob is specific mob type.
    pub fn isMobTypeOf(self: @This(), @"type": MobType) bool {
        return self.get() == @intFromEnum(@"type");
    }

    /// Returns whether this EntityType is petal type.
    pub fn isPetal(self: @This()) bool {
        return switch (self) {
            inline .mob => false,
            inline .petal => true,
        };
    }

    /// Returns whether this petal is specific mob type.
    pub fn isPetalTypeOf(self: @This(), @"type": PetalType) bool {
        return self.get() == @intFromEnum(@"type");
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

const std = @import("std");
const meta = std.meta;