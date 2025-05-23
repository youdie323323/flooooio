/** Represents the current state of a wave room */
export const enum WaveRoomState {
    // State waiting, mean waiting for players
    WAITING,
    // State started, mean playing game currently
    PLAYING,
    // State ended, mean already game over
    ENDED,
}

/** Determines if a wave room is public or private */
export const enum WaveRoomVisibleState {
    PUBLIC,
    PRIVATE,
}

/** Indicates if a player is ready to start the wave */
export const enum WaveRoomPlayerReadyState {
    PREPARING,
    READY,
}