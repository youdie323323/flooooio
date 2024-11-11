export enum PacketKind {
    // Client
    MOVE,
    MOOD,
    SWAP_PETAL,

    CREATE_WAVE_ROOM,
    JOIN_WAVE_ROOM,
    WAVE_ROOM_READY,
    WAVE_ROOM_CHANGE_VISIBLE,
    WAVE_ROOM_LEAVE,

    // Server
    UPDATE,
    WAVE_UPDATE,
    WAVE_SELF_ID,
    WAVE_CODE_INVALID,
    WAVE_START,
    SELF_ID,
}