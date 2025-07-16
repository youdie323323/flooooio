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

pub const PetalType = enum(PureEntityType) {
    basic = @intFromEnum(MobType.web_projectile) + 1,
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
    /// A enum mixed MobType and PetalType.
    /// Since enum fields are collide, each enum with prefixed with mob or petal, with underscore.
    pub const Mixed = blk: {
        const mob_type_fields = meta.fields(MobType);
        const petal_type_fields = meta.fields(PetalType);

        var fields: [mob_type_fields.len + petal_type_fields.len]std.builtin.Type.EnumField = undefined;

        var i = 0;

        for (mob_type_fields) |field| {
            fields[i] = .{ .name = "mob_" ++ field.name, .value = field.value };

            i += 1;
        }

        for (petal_type_fields) |field| {
            fields[i] = .{ .name = "petal_" ++ field.name, .value = field.value };

            i += 1;
        }

        break :blk @Type(.{ .@"enum" = .{
            .tag_type = PureEntityType,
            .fields = &fields,
            .decls = &.{},
            .is_exhaustive = true,
        } });
    };

    mob: MobType,
    petal: PetalType,

    /// Returns direct entity type within this type.
    pub fn get(self: @This()) PureEntityType {
        switch (self) {
            inline .mob => |m| return @intFromEnum(m),
            inline .petal => |p| return @intFromEnum(p),
        }
    }

    /// Returns Mixed within this type.
    pub fn getMixed(self: @This()) Mixed {
        return @enumFromInt(self.get());
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
