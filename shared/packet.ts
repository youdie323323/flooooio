export enum PacketKind {
    // Client
    MOVE,
    MOOD,
    SWAP_PETAL,

    // Server
    UPDATE,
    INIT,
}

export enum MoodKind {
    NORMAL,
    ANGRY,
    SAD,
}

export const MOON_KIND_VALUES = Object.values(MoodKind);

export interface PacketType {
    type: PacketKind;
    [key: string]: any;
}