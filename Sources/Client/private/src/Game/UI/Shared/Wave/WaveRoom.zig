pub const PlayerId = u16;

/// State of a wave room.
pub const State = enum(u8) {
    /// Waiting, mean waiting for players (not starting).
    waiting,
    /// Playing, mean playing currently.
    playing,
    /// Ended, mean game is already over.
    ended,
};

/// Visibility of a wave room.
pub const Visibility = enum(u8) {
    public,
    private,
};

/// Player ready state in a wave room.
pub const PlayerReadyState = enum(u8) {
    preparing,
    ready,
};
