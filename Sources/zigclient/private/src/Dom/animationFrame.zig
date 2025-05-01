/// Function signature for Raf (requestAnimationFrame) event handler.
pub const RafCallback = *const fn (time: f64) callconv(.C) void;

pub extern "env" fn requestAnimationFrame(callback: RafCallback) u32;