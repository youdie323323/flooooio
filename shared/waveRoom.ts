/** Represents the current state of a wave room */
export enum WaveRoomState {
    WAITING,
    STARTED,
    ENDED,
}

/** Determines if a wave room is public or private */
export enum WaveRoomVisibleState {
    PUBLIC,
    PRIVATE,
}

export const VISIBLE_STATE_VALUES = Object.values(WaveRoomVisibleState);

/** Indicates if a player is ready to start the wave */
export enum WaveRoomPlayerReadyState {
    UNREADY,
    READY,
}

export const PLAYER_STATE_VALUES = Object.values(WaveRoomPlayerReadyState);
