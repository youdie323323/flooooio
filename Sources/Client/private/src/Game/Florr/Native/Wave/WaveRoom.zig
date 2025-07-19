pub const PlayerId = u16;

/// State of the wave room.
pub const State = enum(u8) {
    /// Waiting, meaning waiting for players (not starting).
    waiting,
    /// Playing, meaning playing currently.
    playing,
    /// Ended, meaning game is already over.
    ended,
};

/// Visibility of the wave room.
pub const Visibility = enum(u8) {
    public,
    private,
};

/// Player ready state.
pub const PlayerReadyState = enum(u8) {
    preparing,
    ready,
};
