/** Represents the current state of a wave room */
export enum WaveRoomState {
    // State waiting, mean waiting for players
    Waiting,
    // State started, mean game playing
    Started,
    // State ended, mean game over
    Ended,
}

/** Determines if a wave room is public or private */
export enum WaveRoomVisibleState {
    Public,
    Private,
}

export const VISIBLE_STATE_VALUES = Object.values(WaveRoomVisibleState);

/** Indicates if a player is ready to start the wave */
export enum WaveRoomPlayerReadyState {
    Unready,
    Ready,
}

export const PLAYER_STATE_VALUES = Object.values(WaveRoomPlayerReadyState);
