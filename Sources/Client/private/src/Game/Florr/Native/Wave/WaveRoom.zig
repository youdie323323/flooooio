/// Represents the state of the wave room.
pub const State = enum(u8) {
    /// Waiting, meaning waiting for players (not starting).
    waiting,
    /// Playing, meaning playing currently.
    playing,
    /// Ended, meaning game is already over.
    ended,
};

/// Represents the visible state of the wave room.
pub const VisibleState = enum(u8) {
    public,
    private,
};

/// Represents the player ready state in the wave room.
pub const PlayerReadyState = enum(u8) {
    preparing,
    ready,
};
