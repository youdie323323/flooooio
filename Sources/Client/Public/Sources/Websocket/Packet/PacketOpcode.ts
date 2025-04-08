export const enum Serverbound {
    WAVE_CHANGE_MOVE,
    WAVE_CHANGE_MOOD,
    WAVE_SWAP_PETAL,
    WAVE_SEND_CHAT,

    WAVE_ROOM_CREATE,
    
    WAVE_ROOM_JOIN,

    WAVE_ROOM_FIND_PUBLIC,

    WAVE_ROOM_CHANGE_READY,
    WAVE_ROOM_CHANGE_VISIBLE,
    WAVE_ROOM_CHANGE_NAME,

    WAVE_ROOM_LEAVE,
    WAVE_LEAVE,
}

export const enum Clientbound {
    WAVE_SELF_ID,
    WAVE_ROOM_SELF_ID,

    WAVE_UPDATE,
    WAVE_ROOM_UPDATE,

    WAVE_ROOM_JOIN_FAILED,

    WAVE_STARTED,

    WAVE_CHAT_RECEIV,

    CONNECTION_KICKED,
}

export const enum ClientboundConnectionKickReason {
    OUTDATED_CLIENT,
    CHEAT_DETECTED,
}

type DisplayConnectionKickReason = Capitalize<string>;

export const DISPLAY_KICK_REASON = {
    [ClientboundConnectionKickReason.OUTDATED_CLIENT]: "Outdated client",
    [ClientboundConnectionKickReason.CHEAT_DETECTED]: "Cheat detected",
} as const satisfies Record<ClientboundConnectionKickReason, DisplayConnectionKickReason>;