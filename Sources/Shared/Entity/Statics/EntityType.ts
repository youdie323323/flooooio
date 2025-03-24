export const enum MobType {
    BEE,
    SPIDER,

    BEETLE,

    STARFISH,
    JELLYFISH,
    BUBBLE,
    SPONGE,

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
}

export const PETAL_TYPES: Array<PetalType> = [
    PetalType.BASIC,
    PetalType.FASTER,
    PetalType.EGG_BEETLE,
    PetalType.BUBBLE,
    PetalType.YIN_YANG,
] as const;

export const MOB_TYPES: Array<MobType> = [
    MobType.BEE,
    MobType.SPIDER,
    MobType.STARFISH,
    MobType.JELLYFISH,
    MobType.BEETLE,
    MobType.BUBBLE,
    MobType.CENTIPEDE,
    MobType.CENTIPEDE_EVIL,
    MobType.CENTIPEDE_DESERT,
] as const;