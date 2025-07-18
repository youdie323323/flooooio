pub const MobStat = struct {
    pub const ContinuousSuppliedFields = struct {
        extra: ?EntityExtra = null,
    };

    damage: f32,
    health: f32,

    extra: ?EntityExtra = null,
};

const MobStats = EntityStats(MobStat);

const MobI18n = struct {
    name: []const u8,
    description: []const u8,
};

pub const MobData = struct {
    /// Internationalization of this mob.
    i18n: MobI18n,

    collision: EntityCollision,

    stats: MobStats,

    /// Returns stat by specified rarity.
    pub fn statByRarity(self: *const MobData, rarity: EntityRarity) ?MobStat {
        // Returning null only happens when rarity is ultra
        // But mob rarity cannot be ultra, so no need to care about

        return self.stats.get(rarity);
    }
};

const mob_power_factor: std.EnumMap(MobRarity, f32) = .init(.{
    .common = 1,
    .unusual = 1.1,
    .rare = 1.3,
    .epic = 1.6,
    .legendary = 2,
    .mythic = 2.5,
});

const mob_health_factor: std.EnumMap(MobRarity, f32) = .init(.{
    .common = 1,
    .unusual = 1.6,
    .rare = 2.5,
    .epic = 4,
    .legendary = 25,
    .mythic = 50,
});

/// Calculate stats by pre-defined factors using base hp and damage.
fn statsByConstantContinunous(
    comptime base_damage: comptime_float,
    comptime base_hp: comptime_float,
    comptime supplied_fields: std.EnumMap(MobRarity, MobStat.ContinuousSuppliedFields),
) MobStats {
    comptime {
        var stats: MobStats = undefined;

        for (std.meta.fields(MobRarity)) |field| {
            const rarity = @field(EntityRarity, field.name);
            const mob_rarity = rarity.toMobRarity();

            const needed_field = supplied_fields.get(mob_rarity) orelse
                @compileError(fmt.comptimePrint("Mob needed field not defined with rarity: {any}", mob_rarity));

            const power_factor = mob_power_factor.get(mob_rarity) orelse
                @compileError(fmt.comptimePrint("Mob power factor not defined with rarity: {any}", mob_rarity));

            const health_factor = mob_health_factor.get(mob_rarity) orelse
                @compileError(fmt.comptimePrint("Mob health factor not defined with rarity: {any}", mob_rarity));

            stats.put(rarity, .{
                .damage = power_factor * base_damage,
                .health = health_factor * base_hp,

                .extra = needed_field.extra,
            });
        }

        return stats;
    }
}

fn createCentiData(i18n: MobI18n) MobData {
    comptime {
        return .{
            .i18n = i18n,

            .collision = .{
                .fraction = 35,
                .radius = 35,
            },

            .stats = statsByConstantContinunous(10, 50, .initFull(.{})),
        };
    }
}

/// Mob profiles definition.
pub const mob_profiles: std.EnumMap(MobType, MobData) = blk: {
    @setEvalBranchQuota(1_000_000);

    break :blk .init(.{
        .bee = .{
            .i18n = .{
                .name = "Bee",
                .description = "It stings. Don't touch it.",
            },

            .collision = .{
                .fraction = 30,
                .radius = 25,
            },

            .stats = statsByConstantContinunous(50, 15, .initFull(.{})),
        },
        .spider = .{
            .i18n = .{
                .name = "Spider",
                .description = "Spooky.",
            },

            .collision = .{
                .fraction = 25,
                .radius = 45,
            },

            .stats = statsByConstantContinunous(25, 25, .initFull(.{})),
        },
        .hornet = .{
            .i18n = .{
                .name = "Hornet",
                .description = "These aren't quite as nice as the little bees.",
            },

            .collision = .{
                .fraction = 25,
                .radius = 20,
            },

            .stats = statsByConstantContinunous(50, 40, .initFull(.{})),
        },
        .baby_ant = .{
            .i18n = .{
                .name = "Baby Ant",
                .description = "Fuck you.",
            },

            .collision = .{
                .fraction = 30,
                .radius = 25,
            },

            .stats = statsByConstantContinunous(10, 10, .initFull(.{})),
        },
        .worker_ant = .{
            .i18n = .{
                .name = "Worker Ant",
                .description = "Fuck you.",
            },

            .collision = .{
                .fraction = 30,
                .radius = 20,
            },

            .stats = statsByConstantContinunous(10, 25, .initFull(.{})),
        },
        .soldier_ant = .{
            .i18n = .{
                .name = "Soldier Ant",
                .description = "Fuck you.",
            },

            .collision = .{
                .fraction = 30,
                .radius = 20,
            },

            .stats = statsByConstantContinunous(10, 40, .initFull(.{})),
        },
        .beetle = .{
            .i18n = .{
                .name = "Beetle",
                .description = "It's hungry and flowers are its favorite meal.",
            },

            .collision = .{
                .fraction = 40,
                .radius = 40,
            },

            .stats = statsByConstantContinunous(30, 40, .initFull(.{})),
        },
        .sandstorm = .{
            .i18n = .{
                .name = "Sandstorm",
                .description = "Darude (1999)",
            },

            .collision = .{
                .fraction = 20,
                .radius = 25,
            },

            .stats = statsByConstantContinunous(40, 50, .initFull(.{})),
        },
        .cactus = .{
            .i18n = .{
                .name = "Cactus",
                .description = "Avoid touching it, it hurts",
            },

            .collision = .{
                .fraction = 30,
                .radius = 36,
            },

            .stats = statsByConstantContinunous(30, 30, .initFull(.{})),
        },
        .scorpion = .{
            .i18n = .{
                .name = "Scorpion",
                .description = "IT STINGS",
            },

            .collision = .{
                .fraction = 30,
                .radius = 27.5,
            },

            .stats = statsByConstantContinunous(10, 60, .init(.{
                .common = .{
                    .extra = .initComptime(.{
                        .{ "totalPoison", 50 },
                        .{ "poisonDPS", 15 },
                    }),
                },
                .unusual = .{
                    .extra = .initComptime(.{
                        .{ "totalPoison", 55 },
                        .{ "poisonDPS", 16.5 },
                    }),
                },
                .rare = .{
                    .extra = .initComptime(.{
                        .{ "totalPoison", 65 },
                        .{ "poisonDPS", 19.5 },
                    }),
                },
                .epic = .{
                    .extra = .initComptime(.{
                        .{ "totalPoison", 80 },
                        .{ "poisonDPS", 24 },
                    }),
                },
                .legendary = .{
                    .extra = .initComptime(.{
                        .{ "totalPoison", 100 },
                        .{ "poisonDPS", 30 },
                    }),
                },
                .mythic = .{
                    .extra = .initComptime(.{
                        .{ "totalPoison", 125 },
                        .{ "poisonDPS", 37.5 },
                    }),
                },
            })),
        },
        .ladybug_shiny = .{
            .i18n = .{
                .name = "Shiny Ladybug",
                .description = "Shiny, cute and mostly harmless.",
            },

            .collision = .{
                .fraction = 30,
                .radius = 30,
            },

            .stats = statsByConstantContinunous(10, 35, .initFull(.{})),
        },
        .starfish = .{
            .i18n = .{
                .name = "Starfish",
                .description = "His name is Patrick",
            },

            .collision = .{
                .fraction = 25,
                .radius = 20,
            },

            .stats = statsByConstantContinunous(20, 60, .initFull(.{})),
        },
        .jellyfish = .{
            .i18n = .{
                .name = "Jellyfish",
                .description = "Makes the most delicious jam.",
            },

            .collision = .{
                .fraction = 20,
                .radius = 20,
            },

            .stats = statsByConstantContinunous(25, 50, .init(.{
                .common = .{
                    .extra = .initComptime(.{
                        .{ "lightning", 7 },
                        .{ "bounces", 1 },
                    }),
                },
                .unusual = .{
                    .extra = .initComptime(.{
                        .{ "lightning", 7.7 },
                        .{ "bounces", 2 },
                    }),
                },
                .rare = .{
                    .extra = .initComptime(.{
                        .{ "lightning", 9.1 },
                        .{ "bounces", 3 },
                    }),
                },
                .epic = .{
                    .extra = .initComptime(.{
                        .{ "lightning", 11.2 },
                        .{ "bounces", 4 },
                    }),
                },
                .legendary = .{
                    .extra = .initComptime(.{
                        .{ "lightning", 14 },
                        .{ "bounces", 5 },
                    }),
                },
                .mythic = .{
                    .extra = .initComptime(.{
                        .{ "lightning", 17.5 },
                        .{ "bounces", 10 },
                    }),
                },
            })),
        },
        .bubble = .{
            .i18n = .{
                .name = "Bubble",
                .description = "Pop",
            },

            .collision = .{
                .fraction = 20,
                .radius = 20,
            },

            .stats = statsByConstantContinunous(5, 5, .initFull(.{})),
        },
        .sponge = .{
            .i18n = .{
                .name = "Sponge",
                .description = "Bob",
            },

            .collision = .{
                .fraction = 25,
                .radius = 35,
            },

            .stats = statsByConstantContinunous(10, 40, .initFull(.{})),
        },
        .shell = .{
            .i18n = .{
                .name = "Shell",
                .description = "Not an advertisement.",
            },

            .collision = .{
                .fraction = 20,
                .radius = 30,
            },

            .stats = statsByConstantContinunous(10, 90, .initFull(.{})),
        },
        .crab = .{
            .i18n = .{
                .name = "Crab",
                .description = "Mr. Crab",
            },

            .collision = .{
                .fraction = 25,
                .radius = 20,
            },

            .stats = statsByConstantContinunous(25, 80, .initFull(.{})),
        },
        .leech = .{
            .i18n = .{
                .name = "Leech",
                .description = "Slurp slurp.",
            },

            .collision = .{
                .fraction = 20,
                .radius = 12.5,
            },

            .stats = statsByConstantContinunous(10, 70, .init(.{
                .common = .{
                    .extra = .initComptime(.{
                        .{ "lifesteal", 7 },
                    }),
                },
                .unusual = .{
                    .extra = .initComptime(.{
                        .{ "lifesteal", 7.7 },
                    }),
                },
                .rare = .{
                    .extra = .initComptime(.{
                        .{ "lifesteal", 9.1 },
                    }),
                },
                .epic = .{
                    .extra = .initComptime(.{
                        .{ "lifesteal", 11.2 },
                    }),
                },
                .legendary = .{
                    .extra = .initComptime(.{
                        .{ "lifesteal", 14 },
                    }),
                },
                .mythic = .{
                    .extra = .initComptime(.{
                        .{ "lifesteal", 17.5 },
                    }),
                },
            })),
        },
        .centipede = createCentiData(.{
            .name = "Centipede",
            .description = "It's just there doing its thing.",
        }),
        .centipede_evil = createCentiData(.{
            .name = "Centipede",
            .description = "This one loves flowers.",
        }),
        .centipede_desert = createCentiData(.{
            .name = "Centipede",
            .description = "Gotta go fast.",
        }),

        // Begin projectile
        .missile_projectile = .{
            .i18n = .{
                .name = "Missile",
                .description = "How did you see this?",
            },

            .collision = .{
                .fraction = 25,
                .radius = 10,
            },

            .stats = statsByConstantContinunous(10, 10, .initFull(.{})),
        },
        .web_projectile = .{
            .i18n = .{
                .name = "Web",
                .description = "How did you see this?",
            },

            .collision = .{
                .fraction = 70,
                .radius = 50,
            },

            .stats = .initFull(.{
                .damage = 0,
                .health = 1,
            }),
        },
    });
};

const std = @import("std");
const fmt = std.fmt;

const EntityExtra = @import("EntityProfiles.zig").EntityExtra;
const EntityCollision = @import("EntityProfiles.zig").EntityCollision;
const EntityStats = @import("EntityProfiles.zig").EntityStats;

const EntityRarity = @import("../../../UI/Shared/Entity/EntityRarity.zig").EntityRarity;
const MobRarity = EntityRarity.MobRarity;

const MobType = @import("../../../UI/Shared/Entity/EntityType.zig").MobType;
