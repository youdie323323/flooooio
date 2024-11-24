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

export const MOON_VALUES = Object.values(Mood);

// IMPORTANT: This will used for index

export enum Rarities {
    COMMON = 0,
    UNUSUAL = 1,
    RARE = 2,
    EPIC = 3,
    LEGENDARY = 4,
    MYTHIC = 5,
    ULTRA = 6,
    SUPER = 7,
}

let currentEntityType: number = 0;
function getNextEntityType(): number {
    if (currentEntityType > 255) {
        throw new RangeError("Rarity type overflow")
    }
    return currentEntityType++;
}

export enum MobType {
    BEE = getNextEntityType(),
    STARFISH = getNextEntityType(),
    JELLYFISH = getNextEntityType(),
    BEETLE = getNextEntityType(),
    BUBBLE = getNextEntityType(),
}

export enum PetalType {
    BASIC = getNextEntityType(),
    FASTER = getNextEntityType(),
    BEETLE_EGG = getNextEntityType(),
    BUBBLE = getNextEntityType(),
}

export enum Packet {
    // Client
    MOVE,
    MOOD,
    SWAP_PETAL,
    CHAT,

    WAVE_ROOM_CREATE,
    WAVE_ROOM_JOIN,
    WAVE_ROOM_JOIN_PUBLIC,
    WAVE_ROOM_LEAVE,
    WAVE_ROOM_GAME_LEAVE,
    WAVE_ROOM_CHANGE_READY,
    WAVE_ROOM_CHANGE_VISIBLE,

    // Server
    UPDATE,
    SELF_ID,

    WAVE_ROOM_UPDATE,
    WAVE_ROOM_SELF_ID,
    WAVE_ROOM_JOIN_FAILED,
    WAVE_ROOM_STARTING,
}