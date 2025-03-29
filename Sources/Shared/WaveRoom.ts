/** Represents the current state of a wave room */
export enum WaveRoomState {
    // State waiting, mean waiting for players
    WAITING,
    // State started, mean playing game currently
    PLAYING,
    // State ended, mean already game over
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
    PREPARING,
    READY,
}

export const PLAYER_STATE_VALUES = Object.values(WaveRoomPlayerReadyState);
