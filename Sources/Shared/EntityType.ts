let currentEntityType: number = 0;
function getNextEntityType(): number {
    if (currentEntityType > 255) {
        throw new RangeError("Entity type overflow");
    }
    return currentEntityType++;
}

export enum MobType {
    Bee = getNextEntityType(),
    Spider = getNextEntityType(),
    Starfish = getNextEntityType(),
    Jellyfish = getNextEntityType(),
    Beetle = getNextEntityType(),
    Bubble = getNextEntityType(),

    Centipede = getNextEntityType(),
    CentipedeEvil = getNextEntityType(),
    CentipedeDesert = getNextEntityType(),
}

export enum PetalType {
    Basic = getNextEntityType(),
    Faster = getNextEntityType(),
    BeetleEgg = getNextEntityType(),
    Bubble = getNextEntityType(),
    YinYang = getNextEntityType(),
}