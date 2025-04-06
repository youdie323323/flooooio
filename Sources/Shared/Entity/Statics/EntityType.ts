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
}

export const MOB_TYPES: Array<MobType> = [
    MobType.BEE,
    MobType.SPIDER,

    MobType.BEETLE,
    MobType.SANDSTORM,
    MobType.CACTUS,
    MobType.SCORPION,
    MobType.LADYBUG_SHINY,

    MobType.STARFISH,
    MobType.JELLYFISH,
    MobType.BUBBLE,
    MobType.SPONGE,
    MobType.SHELL,

    MobType.CENTIPEDE,
    MobType.CENTIPEDE_EVIL,
    MobType.CENTIPEDE_DESERT,
] as const;

export const PETAL_TYPES: Array<PetalType> = [
    PetalType.BASIC,
    PetalType.FASTER,
    PetalType.EGG_BEETLE,
    PetalType.BUBBLE,
    PetalType.YIN_YANG,
    PetalType.STICK,
] as const;