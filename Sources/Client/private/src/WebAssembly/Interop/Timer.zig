pub const TimerID = u32;

pub const TimerHandler = *const fn () callconv(.c) void;

extern "4" fn @"0"(handler: TimerHandler, delay: f32) TimerID;

extern "4" fn @"1"(handler: TimerHandler, delay: f32) TimerID;

extern "4" fn @"2"(id: TimerID) void;

extern "4" fn @"3"(id: TimerID) void;

pub inline fn setInterval(handler: TimerHandler, delay: f32) TimerID {
    return @"0"(handler, delay);
}

pub inline fn setTimeout(handler: TimerHandler, delay: f32) TimerID {
    return @"1"(handler, delay);
}

pub inline fn clearInterval(id: TimerID) void {
    @"2"(id);
}

pub inline fn clearTimeout(id: TimerID) void {
    @"3"(id);
}
