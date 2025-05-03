pub const StringPtr = [*:0]u8;
pub const ConstStringPtr = [*:0]const u8;

/// Alias for `*anyopaque`
pub const OpaquePtr = *anyopaque;
pub const ConstOpaquePtr = *const anyopaque;