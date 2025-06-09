pub const TimerId = u32;

pub const TimerHandler = *const fn () callconv(.c) void;

extern "4" fn @"0"(handler: TimerHandler, delay: f32) TimerId;

extern "4" fn @"1"(handler: TimerHandler, delay: f32) TimerId;

extern "4" fn @"2"(id: TimerId) void;

extern "4" fn @"3"(id: TimerId) void;

pub inline fn setInterval(handler: TimerHandler, delay: f32) TimerId {
    return @"0"(handler, delay);
}

pub inline fn setTimeout(handler: TimerHandler, delay: f32) TimerId {
    return @"1"(handler, delay);
}

pub inline fn clearInterval(id: TimerId) void {
    @"2"(id);
}

pub inline fn clearTimeout(id: TimerId) void {
    @"3"(id);
}
