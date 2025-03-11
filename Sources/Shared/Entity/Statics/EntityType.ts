export const enum MobType {
    Bee,
    Spider,
    Starfish,
    Jellyfish,
    Beetle,
    Bubble,

    Centipede,
    CentipedeEvil,
    CentipedeDesert,
}

export const enum PetalType {
    // Dont forgot to update to last index every time adding the type
    Basic = MobType.CentipedeDesert + 1,
    Faster,
    BeetleEgg,
    Bubble,
    YinYang,
}

export const PETAL_TYPES: Array<PetalType> = [
    PetalType.Basic,
    PetalType.Faster,
    PetalType.BeetleEgg,
    PetalType.Bubble,
    PetalType.YinYang,
] as const;

export const MOB_TYPES: Array<MobType> = [
    MobType.Bee,
    MobType.Spider,
    MobType.Starfish,
    MobType.Jellyfish,
    MobType.Beetle,
    MobType.Bubble,
    MobType.Centipede,
    MobType.CentipedeEvil,
    MobType.CentipedeDesert,
] as const;