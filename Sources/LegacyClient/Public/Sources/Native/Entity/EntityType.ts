export const enum MobType {
    BEE,
    SPIDER,
    HORNET,

    BEETLE,
    SANDSTORM,
    CACTUS,
    SCORPION,
    LADYBUG_SHINY,

    STARFISH,
    JELLYFISH,
    BUBBLE,
    SPONGE,
    SHELL,
    CRAB,
    LEECH,

    CENTIPEDE,
    CENTIPEDE_EVIL,
    CENTIPEDE_DESERT,

    MISSILE_PROJECTILE,
    WEB_PROJECTILE,
}

export const enum PetalType {
    // Dont forgot to update to last index every time adding the type
    BASIC = MobType.WEB_PROJECTILE + 1,
    FASTER,
    EGG_BEETLE,
    BUBBLE,
    YIN_YANG,
    MYSTERIOUS_STICK,
    SAND,
    LIGHTNING,
    CLAW,
    FANG,
    YGGDRASIL,
    WEB,
    STINGER,
    WING,
}

export const PETAL_TYPES = [
    PetalType.BASIC,
    PetalType.FASTER,
    PetalType.EGG_BEETLE,
    PetalType.BUBBLE,
    PetalType.YIN_YANG,
    PetalType.MYSTERIOUS_STICK,
    PetalType.SAND,
    PetalType.LIGHTNING,
    PetalType.CLAW,
    PetalType.FANG,
    PetalType.YGGDRASIL,
    PetalType.WEB,
    PetalType.STINGER,
    PetalType.WING,
] as const;