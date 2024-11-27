export enum ServerBound {
    MOVE,
    MOOD,
    SWAP_PETAL,
    CHAT_SENT,

    WAVE_ROOM_CREATE,
    
    WAVE_ROOM_JOIN,
    WAVE_ROOM_JOIN_PUBLIC,

    WAVE_ROOM_CHANGE_READY,
    WAVE_ROOM_CHANGE_VISIBLE,

    WAVE_LEAVE,

    WAVE_ROOM_LEAVE,
}

export enum ClientBound {
    WAVE_UPDATE,
    SELF_ID,

    WAVE_ROOM_UPDATE,
    WAVE_ROOM_SELF_ID,
    WAVE_ROOM_JOIN_FAILED,
    WAVE_STARTING,

    CONNECTION_KICKED,

    CHAT_RECV,
}

export enum ClientboundConnectionKickReason {
    OUTDATED_CLIENT,
    ANTICHEAT_DETECTED,
}