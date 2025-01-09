let currentEntityType: number = 0;
function getNextEntityType(): number {
    if (currentEntityType > 255) {
        throw new RangeError("Entity type overflow");
    }
    return currentEntityType++;
}

export enum MobType {
    BEE = getNextEntityType(),
    SPIDER = getNextEntityType(),
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
    YIN_YANG = getNextEntityType(),
}