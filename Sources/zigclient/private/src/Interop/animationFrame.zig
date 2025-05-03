/// Function signature for Raf (requestAnimationFrame) event handler.
pub const RafCallback = *const fn (time: f64) callconv(.c) void;

extern "0" fn @"64"(callback: RafCallback) u32;

pub inline fn requestAnimationFrame(callback: RafCallback) u32 {
    return @"64"(callback);
}