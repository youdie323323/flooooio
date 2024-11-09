export enum PacketKind {
    // Client
    MOVE,
    MOOD,
    SWAP_PETAL,

    CREATE_WAVE_ROOM,
    JOIN_WAVE_ROOM,

    // Server
    UPDATE,
    WAVE_UPDATE,
    WAVE_SELF_ID,
    WAVE_CODE_INVALID,
    SELF_ID,
}