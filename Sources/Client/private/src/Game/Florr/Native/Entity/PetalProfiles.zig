pub const PetalStat = struct {
    pub const ContinuousSuppliedFields = struct {
        reload: f32,
        usage_reload: ?f32 = null,
        count: usize = 1,

        extra: ?EntityExtra = null,
    };

    damage: f32,
    health: f32,
    reload: f32,
    usage_reload: ?f32 = null,
    count: usize = 1,

    extra: ?EntityExtra = null,
};

const PetalStats = EntityStats(PetalStat);

pub const PetalData = struct {
    /// Internationalization of this mob.
    i18n: struct {
        name: []const u8,
        description: []const u8,
    },

    collision: EntityCollision,

    stats: PetalStats,

    /// Returns stat by specified rarity.
    pub fn statByRarity(self: *const PetalData, rarity: EntityRarity) ?PetalStat {
        return self.stats.get(rarity);
    }
};

const petal_power_factor: std.EnumMap(EntityRarity, f32) = .init(.{
    .common = 1,
    .unusual = 1.3,
    .rare = 1.8,
    .epic = 2.4,
    .legendary = 3.2,
    .mythic = 4,
    .ultra = 10,
});

const petal_health_factor: std.EnumMap(EntityRarity, f32) = .init(.{
    .common = 1,
    .unusual = 1.2,
    .rare = 1.4,
    .epic = 1.7,
    .legendary = 2.1,
    .mythic = 2.5,
    .ultra = 5,
});

/// Calculate stats by pre-defined factors using base hp and damage.
fn statsByConstantContinunous(
    comptime base_damage: comptime_float,
    comptime base_hp: comptime_float,
    comptime supplied_fields: std.EnumMap(EntityRarity, PetalStat.ContinuousSuppliedFields),
) PetalStats {
    comptime {
        var stats: PetalStats = undefined;

        for (std.meta.fields(EntityRarity)) |field| {
            const rarity = @field(EntityRarity, field.name);

            const supplied_field = supplied_fields.get(rarity) orelse
                @compileError(fmt.comptimePrint("Petal needed field not defined with rarity: {any}", rarity));

            const power_factor = petal_power_factor.get(rarity) orelse
                @compileError(fmt.comptimePrint("Petal power factor not defined with rarity: {any}", rarity));

            const health_factor = petal_health_factor.get(rarity) orelse
                @compileError(fmt.comptimePrint("Petal health factor not defined with rarity: {any}", rarity));

            stats.put(rarity, .{
                .damage = power_factor * base_damage,
                .health = health_factor * base_hp,
                .reload = supplied_field.reload,
                .usage_reload = supplied_field.usage_reload,
                .count = supplied_field.count,

                .extra = supplied_field.extra,
            });
        }

        return stats;
    }
}

/// Petal profiles definition.
pub const petal_profiles: std.EnumMap(PetalType, PetalData) = blk: {
    @setEvalBranchQuota(1_000_000);

    break :blk .init(.{
        .basic = .{
            .i18n = .{
                .name = "Basic",
                .description = "A nice petal, not too strong but not too weak.",
            },

            .collision = .{
                .fraction = 15,
                .radius = 15,
            },

            .stats = statsByConstantContinunous(10, 10, .init(.{
                .common = .{
                    .reload = 2.5,
                },
                .unusual = .{
                    .reload = 2.5,
                },
                .rare = .{
                    .reload = 2.5,
                },
                .epic = .{
                    .reload = 2.5,
                },
                .legendary = .{
                    .reload = 2.5,
                },
                .mythic = .{
                    .reload = 2.5,
                },
                .ultra = .{
                    .reload = 2.5,
                },
            })),
        },
        .faster = .{
            .i18n = .{
                .name = "Faster",
                .description = "It's so light it makes your other petals spin faster.",
            },

            .collision = .{
                .fraction = 15,
                .radius = 15,
            },

            .stats = statsByConstantContinunous(8, 5, .init(.{
                .common = .{
                    .reload = 0.8,

                    .extra = .initComptime(.{
                        .{ "rad", 0.15 },
                    }),
                },
                .unusual = .{
                    .reload = 0.8,

                    .extra = .initComptime(.{
                        .{ "rad", 0.195 },
                    }),
                },
                .rare = .{
                    .reload = 0.8,

                    .extra = .initComptime(.{
                        .{ "rad", 0.27 },
                    }),
                },
                .epic = .{
                    .reload = 0.8,

                    .extra = .initComptime(.{
                        .{ "rad", 0.36 },
                    }),
                },
                .legendary = .{
                    .reload = 0.8,

                    .extra = .initComptime(.{
                        .{ "rad", 0.48 },
                    }),
                },
                .mythic = .{
                    .reload = 0.8,

                    .extra = .initComptime(.{
                        .{ "rad", 1.2 },
                    }),
                },
                .ultra = .{
                    .reload = 0.8,

                    .extra = .initComptime(.{
                        .{ "rad", 3 },
                    }),
                },
            })),
        },
        .egg_beetle = .{
            .i18n = .{
                .name = "Beetle Egg",
                .description = "Something interesting might pop out of this.",
            },

            .collision = .{
                .fraction = 20,
                .radius = 40,
            },

            .stats = statsByConstantContinunous(1, 10, .init(.{
                .common = .{
                    .reload = 4,
                    .usage_reload = 2,
                },
                .unusual = .{
                    .reload = 4,
                    .usage_reload = 2,
                },
                .rare = .{
                    .reload = 4,
                    .usage_reload = 2,
                },
                .epic = .{
                    .reload = 4,
                    .usage_reload = 2,
                },
                .legendary = .{
                    .reload = 4,
                    .usage_reload = 2,
                },
                .mythic = .{
                    .reload = 4,
                    .usage_reload = 15,
                },
                .ultra = .{
                    .reload = 4,
                    .usage_reload = 15,
                },
            })),
        },
        .bubble = .{
            .i18n = .{
                .name = "Bubble",
                .description = "Physics are for the weak.",
            },

            .collision = .{
                .fraction = 15,
                .radius = 20,
            },

            .stats = .init(.{
                .common = .{
                    .damage = 0,
                    .health = 1,
                    .reload = 5.5,
                    .usage_reload = 0.5,
                },
                .unusual = .{
                    .damage = 0,
                    .health = 1,
                    .reload = 4.5,
                    .usage_reload = 0.5,
                },
                .rare = .{
                    .damage = 0,
                    .health = 1,
                    .reload = 3.5,
                    .usage_reload = 0.5,
                },
                .epic = .{
                    .damage = 0,
                    .health = 1,
                    .reload = 2.5,
                    .usage_reload = 0.5,
                },
                .legendary = .{
                    .damage = 0,
                    .health = 1,
                    .reload = 1.5,
                    .usage_reload = 0.5,
                },
                .mythic = .{
                    .damage = 0,
                    .health = 1,
                    .reload = 0.5,
                    .usage_reload = 0.5,
                },
                .ultra = .{
                    .damage = 0,
                    .health = 1,
                    .reload = 0.1,
                    .usage_reload = 0.1,
                },
            }),
        },
        .yin_yang = .{
            .i18n = .{
                .name = "Yin Yang",
                .description = "This mysterious petal affects the rotation of your petals in unpredictable ways.",
            },

            .collision = .{
                .fraction = 20,
                .radius = 20,
            },

            .stats = statsByConstantContinunous(7, 7, .init(.{
                .common = .{
                    .reload = 1,
                },
                .unusual = .{
                    .reload = 1,
                },
                .rare = .{
                    .reload = 1,
                },
                .epic = .{
                    .reload = 1,
                },
                .legendary = .{
                    .reload = 1,
                },
                .mythic = .{
                    .reload = 1,
                },
                .ultra = .{
                    .reload = 1,
                },
            })),
        },
        .mysterious_stick = .{
            .i18n = .{
                .name = "Stick",
                .description = "I DONT KNOW SHITTTT",
            },

            .collision = .{
                .fraction = 10,
                .radius = 10,
            },

            .stats = statsByConstantContinunous(1, 10, .init(.{
                .common = .{
                    .reload = 4,
                    .usage_reload = 10,
                },
                .unusual = .{
                    .reload = 4,
                    .usage_reload = 8,
                },
                .rare = .{
                    .reload = 4,
                    .usage_reload = 6,
                },
                .epic = .{
                    .reload = 4,
                    .usage_reload = 4,
                },
                .legendary = .{
                    .reload = 4,
                    .usage_reload = 2,
                },
                .mythic = .{
                    .reload = 4,
                    .usage_reload = 1,
                },
                .ultra = .{
                    .reload = 4,
                    .usage_reload = 0.1,
                },
            })),
        },
        .sand = .{
            .i18n = .{
                .name = "Sand",
                .description = "A bunch of sand particles.",
            },

            .collision = .{
                .fraction = 10,
                .radius = 7,
            },

            .stats = statsByConstantContinunous(5, 5, .init(.{
                .common = .{
                    .reload = 0.8,
                    .count = 4,
                },
                .unusual = .{
                    .reload = 0.8,
                    .count = 4,
                },
                .rare = .{
                    .reload = 0.8,
                    .count = 4,
                },
                .epic = .{
                    .reload = 0.8,
                    .count = 4,
                },
                .legendary = .{
                    .reload = 0.8,
                    .count = 4,
                },
                .mythic = .{
                    .reload = 0.4,
                    .count = 4,
                },
                .ultra = .{
                    .reload = 0.4,
                    .count = 4,
                },
            })),
        },
        .lightning = .{
            .i18n = .{
                .name = "Lightning",
                .description = "Strikes several nearby enemies.",
            },

            .collision = .{
                .fraction = 10,
                .radius = 12,
            },

            .stats = statsByConstantContinunous(0, 10, .init(.{
                .common = .{
                    .reload = 2.5,

                    .extra = .initComptime(.{
                        .{ "lightning", 12 },
                        .{ "bounces", 2 },
                    }),
                },
                .unusual = .{
                    .reload = 2.5,

                    .extra = .initComptime(.{
                        .{ "lightning", 15.6 },
                        .{ "bounces", 3 },
                    }),
                },
                .rare = .{
                    .reload = 2.5,

                    .extra = .initComptime(.{
                        .{ "lightning", 21.6 },
                        .{ "bounces", 4 },
                    }),
                },
                .epic = .{
                    .reload = 2.5,

                    .extra = .initComptime(.{
                        .{ "lightning", 28.8 },
                        .{ "bounces", 5 },
                    }),
                },
                .legendary = .{
                    .reload = 2.5,

                    .extra = .initComptime(.{
                        .{ "lightning", 38.4 },
                        .{ "bounces", 6 },
                    }),
                },
                .mythic = .{
                    .reload = 2.5,

                    .extra = .initComptime(.{
                        .{ "lightning", 48 },
                        .{ "bounces", 15 },
                    }),
                },
                .ultra = .{
                    .reload = 2.5,

                    .extra = .initComptime(.{
                        .{ "lightning", 120 },
                        .{ "bounces", 15 },
                    }),
                },
            })),
        },
        .claw = .{
            .i18n = .{
                .name = "Claw",
                .description = "Deals extra damage if victim is above 80% health. -50percentDamage versus other flowers.",
            },

            .collision = .{
                .fraction = 10,
                .radius = 15,
            },

            .stats = statsByConstantContinunous(10, 10, .init(.{
                .common = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "percentDamage", 9 },
                        .{ "limit", 100 },
                    }),
                },
                .unusual = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "percentDamage", 11.7 },
                        .{ "limit", 130 },
                    }),
                },
                .rare = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "percentDamage", 16.2 },
                        .{ "limit", 180 },
                    }),
                },
                .epic = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "percentDamage", 21.6 },
                        .{ "limit", 240 },
                    }),
                },
                .legendary = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "percentDamage", 28.8 },
                        .{ "limit", 320 },
                    }),
                },
                .mythic = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "percentDamage", 36 },
                        .{ "limit", 1200 },
                    }),
                },
                .ultra = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "percentDamage", 90 },
                        .{ "limit", 3000 },
                    }),
                },
            })),
        },
        .fang = .{
            .i18n = .{
                .name = "Fangs",
                .description = "Heals based on damage dealt by this petal.",
            },

            .collision = .{
                .fraction = 10,
                .radius = 13,
            },

            .stats = statsByConstantContinunous(10, 10, .init(.{
                .common = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "damageHealed", 100 },
                    }),
                },
                .unusual = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "damageHealed", 100 },
                    }),
                },
                .rare = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "damageHealed", 100 },
                    }),
                },
                .epic = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "damageHealed", 100 },
                    }),
                },
                .legendary = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "damageHealed", 100 },
                    }),
                },
                .mythic = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "damageHealed", 300 },
                    }),
                },
                .ultra = .{
                    .reload = 3.5,

                    .extra = .initComptime(.{
                        .{ "damageHealed", 500 },
                    }),
                },
            })),
        },
        .yggdrasil = .{
            .i18n = .{
                .name = "Yggdrasil",
                .description = "A dried leaf from the Yggdrasil tree. Rumored to be able to bring the fallen back to life.",
            },

            .collision = .{
                .fraction = 16,
                .radius = 28,
            },

            .stats = statsByConstantContinunous(10, 10, .init(.{
                .common = .{
                    .reload = 2.5,
                    .usage_reload = 15,
                },
                .unusual = .{
                    .reload = 2.5,
                    .usage_reload = 15,
                },
                .rare = .{
                    .reload = 2.5,
                    .usage_reload = 15,
                },
                .epic = .{
                    .reload = 2.5,
                    .usage_reload = 15,
                },
                .legendary = .{
                    .reload = 2.5,
                    .usage_reload = 15,
                },
                .mythic = .{
                    .reload = 2.5,
                    .usage_reload = 5,
                },
                .ultra = .{
                    .reload = 2.5,
                    .usage_reload = 0.5,
                },
            })),
        },
        .web = .{
            .i18n = .{
                .name = "Web",
                .description = "It's really sticky.",
            },

            .collision = .{
                .fraction = 10,
                .radius = 13,
            },

            .stats = statsByConstantContinunous(8, 5, .init(.{
                .common = .{
                    .reload = 3,
                    .usage_reload = 0.5,

                    .extra = .initComptime(.{
                        .{ "duration", 10 },
                        .{ "radius", 50 },
                    }),
                },
                .unusual = .{
                    .reload = 3,
                    .usage_reload = 0.5,

                    .extra = .initComptime(.{
                        .{ "duration", 10 },
                        .{ "radius", 60 },
                    }),
                },
                .rare = .{
                    .reload = 3,
                    .usage_reload = 0.5,

                    .extra = .initComptime(.{
                        .{ "duration", 10 },
                        .{ "radius", 70 },
                    }),
                },
                .epic = .{
                    .reload = 3,
                    .usage_reload = 0.5,

                    .extra = .initComptime(.{
                        .{ "duration", 10 },
                        .{ "radius", 80 },
                    }),
                },
                .legendary = .{
                    .reload = 3,
                    .usage_reload = 0.5,

                    .extra = .initComptime(.{
                        .{ "duration", 10 },
                        .{ "radius", 90 },
                    }),
                },
                .mythic = .{
                    .reload = 3,
                    .usage_reload = 0.5,

                    .extra = .initComptime(.{
                        .{ "duration", 10 },
                        .{ "radius", 200 },
                    }),
                },
                .ultra = .{
                    .reload = 3,
                    .usage_reload = 0.5,

                    .extra = .initComptime(.{
                        .{ "duration", 30 },
                        .{ "radius", 200 },
                    }),
                },
            })),
        },
        .stinger = .{
            .i18n = .{
                .name = "Stinger",
                .description = "Fuck you.",
            },

            .collision = .{
                .fraction = 10,
                .radius = 10,
            },

            .stats = .init(.{
                .common = .{
                    .damage = 35,
                    .health = 2,
                    .reload = 2.5,
                },
                .unusual = .{
                    .damage = 45.5,
                    .health = 2.4,
                    .reload = 2.5,
                },
                .rare = .{
                    .damage = 63,
                    .health = 2.8,
                    .reload = 2.5,
                },
                .epic = .{
                    .damage = 84,
                    .health = 3.4,
                    .reload = 2.5,
                },
                .legendary = .{
                    .damage = 112,
                    .health = 4.2,
                    .reload = 2.5,
                },
                .mythic = .{
                    .damage = 140,
                    .health = 5,
                    .reload = 2.5,
                    .count = 3,
                },
                .ultra = .{
                    .damage = 350,
                    .health = 10,
                    .reload = 2.5,
                    .count = 5,
                },
            }),
        },
        .wing = .{
            .i18n = .{
                .name = "Wing",
                .description = "Fuck you.",
            },

            .collision = .{
                .fraction = 10,
                .radius = 15,
            },

            .stats = statsByConstantContinunous(10, 15, .init(.{
                .common = .{
                    .reload = 1.25,
                },
                .unusual = .{
                    .reload = 1.25,
                },
                .rare = .{
                    .reload = 1.25,
                },
                .epic = .{
                    .reload = 1.25,
                },
                .legendary = .{
                    .reload = 1.25,
                },
                .mythic = .{
                    .reload = 0.13,
                },
                .ultra = .{
                    .reload = 0.13,
                },
            })),
        },
        .magnet = .{
            .i18n = .{
                .name = "Magnet",
                .description = "Fuck you.",
            },

            .collision = .{
                .fraction = 18,
                .radius = 40,
            },

            .stats = statsByConstantContinunous(5, 15, .init(.{
                .common = .{
                    .reload = 1.5,

                    .extra = .initComptime(.{
                        .{ "pickupRange", 150 },
                    }),
                },
                .unusual = .{
                    .reload = 1.5,

                    .extra = .initComptime(.{
                        .{ "pickupRange", 195 },
                    }),
                },
                .rare = .{
                    .reload = 1.5,

                    .extra = .initComptime(.{
                        .{ "pickupRange", 270 },
                    }),
                },
                .epic = .{
                    .reload = 1.5,

                    .extra = .initComptime(.{
                        .{ "pickupRange", 360 },
                    }),
                },
                .legendary = .{
                    .reload = 1.5,

                    .extra = .initComptime(.{
                        .{ "pickupRange", 480 },
                    }),
                },
                .mythic = .{
                    .reload = 1.5,

                    .extra = .initComptime(.{
                        .{ "pickupRange", 800 },
                    }),
                },
                .ultra = .{
                    .reload = 1.5,

                    .extra = .initComptime(.{
                        .{ "pickupRange", 2500 },
                    }),
                },
            })),
        },
    });
};

const std = @import("std");
const fmt = std.fmt;

const EntityExtra = @import("EntityProfiles.zig").EntityExtra;
const EntityCollision = @import("EntityProfiles.zig").EntityCollision;
const EntityStats = @import("EntityProfiles.zig").EntityStats;

const EntityRarity = @import("../../../UI/Shared/Entity/EntityRarity.zig").EntityRarity;

const PetalType = @import("../../../UI/Shared/Entity/EntityType.zig").PetalType;
