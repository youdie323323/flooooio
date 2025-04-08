export const enum MobType {
    BEE,
    SPIDER,

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

    CENTIPEDE,
    CENTIPEDE_EVIL,
    CENTIPEDE_DESERT,
}

export const enum PetalType {
    // Dont forgot to update to last index every time adding the type
    BASIC = MobType.CENTIPEDE_DESERT + 1,
    FASTER,
    EGG_BEETLE,
    BUBBLE,
    YIN_YANG,
    STICK,
    SAND,
    LIGHTNING,
    CLAW,
    FANG,
    YGGDRASIL,
}

export const PETAL_TYPES = [
    PetalType.BASIC,
    PetalType.FASTER,
    PetalType.EGG_BEETLE,
    PetalType.BUBBLE,
    PetalType.YIN_YANG,
    PetalType.STICK,
    PetalType.SAND,
    PetalType.LIGHTNING,
    PetalType.CLAW,
    PetalType.FANG,
    PetalType.YGGDRASIL,
] as const;