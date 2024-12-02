export enum Biomes {
    GARDEN,
    DESERT,
    OCEAN,
}

export const BIOME_VALUES = Object.values(Biomes);

export enum Mood {
    NORMAL,
    ANGRY,
    SAD,
}

export const MOOD_VALUES = Object.values(Mood);

let currentEntityType: number = 0;
function getNextEntityType(): number {
    if (currentEntityType > 255) {
        throw new RangeError("Entity type overflow");
    }
    return currentEntityType++;
}

export enum MobType {
    BEE = getNextEntityType(),
    STARFISH = getNextEntityType(),
    JELLYFISH = getNextEntityType(),
    BEETLE = getNextEntityType(),
    BUBBLE = getNextEntityType(),

    CENTIPEDE = getNextEntityType(),
    CENTIPEDE_EVIL = getNextEntityType(),
    CENTIPEDE_DESERT = getNextEntityType(),
}

export enum PetalType {
    BASIC = getNextEntityType(),
    FASTER = getNextEntityType(),
    BEETLE_EGG = getNextEntityType(),
    BUBBLE = getNextEntityType(),
}