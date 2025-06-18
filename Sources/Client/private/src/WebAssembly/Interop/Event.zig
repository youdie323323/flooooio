//! Mouse event handling module.
//! Provides functionality for registering and managing mouse event listeners
//! in a web context.
const std = @import("std");
const mem = @import("../../mem.zig");

const event = @This();

pub const GlobalEventTarget = enum(u8) {
    document = 0,
    window = 1,
};

/// Types of mouse events that can be handled.
pub const EventType = enum(u32) {
    mouse_down = 5,
    mouse_up = 6,
    mouse_move = 8,
    mouse_enter = 33,
    mouse_leave = 34,

    screen_resize = 10,
};

/// Function represents js function that register events.
fn EventRegister(comptime Event: type) type {
    return *const fn (target: usize, use_capture: bool, callback: EventCallback(Event)) callconv(.c) void;
}

/// Gets the appropriate event register function for the given event type.
inline fn getEventRegister(comptime event_type: EventType) EventRegister(EventFromEventType(event_type)) {
    return comptime switch (event_type) {
        .mouse_down => event.@"0",
        .mouse_enter => event.@"1",
        .mouse_leave => event.@"2",
        .mouse_move => event.@"3",
        .mouse_up => event.@"4",

        .screen_resize => event.@"5",
    };
}

/// Gets the appropriate event for the given event type.
fn EventFromEventType(comptime event_type: EventType) type {
    return comptime switch (event_type) {
        .mouse_down, .mouse_enter, .mouse_leave, .mouse_move, .mouse_up => event.MouseEvent,
        .screen_resize => event.ScreenEvent,
    };
}

/// Callback function generic type for event handlers.
/// Returns true to indicate the event was handled.
/// Null pointer of this will removing handler.
pub fn EventCallback(comptime Event: type) type {
    return *allowzero const fn (event_type: EventType, event: *const Event) callconv(.c) bool;
}

/// Adds event listener to a target element or global target.
pub fn addEventListener(
    comptime target: GlobalEventTarget,
    comptime event_type: EventType,
    comptime callback: EventCallback(EventFromEventType(event_type)),
    comptime use_capture: bool,
) void {
    (comptime getEventRegister(event_type))(comptime @intFromEnum(target), use_capture, callback);
}

/// Adds event listener to an element by selector.
pub fn addEventListenerBySelector(
    comptime selector: []const u8,
    comptime event_type: EventType,
    comptime callback: EventCallback(EventFromEventType(event_type)),
    comptime use_capture: bool,
) void {
    const selector_ptr = mem.allocCString(selector);

    (comptime getEventRegister(event_type))(@intFromPtr(selector_ptr), use_capture, callback);

    mem.freeCString(selector_ptr);
}

/// Removes event listener of a target element or global target.
pub fn removeEventListener(
    comptime target: GlobalEventTarget,
    comptime event_type: EventType,
) void {
    (comptime getEventRegister(event_type))(comptime @intFromEnum(target), false, @ptrFromInt(0));
}

/// Removes event listener of element by selector.
pub fn removeEventListenerBySelector(
    comptime selector: []const u8,
    comptime event_type: EventType,
) void {
    const selector_ptr = mem.allocCString(selector);

    (comptime getEventRegister(event_type))(@intFromPtr(selector_ptr), false, @ptrFromInt(0));

    mem.freeCString(selector_ptr);
}

/// Mouse event definition.
pub usingnamespace struct {
    /// Represents a mouse event data.
    pub const MouseEvent = extern struct {
        // TODO: for some reason timestamp will be a broken value
        timestamp: f64,

        screen_x: i32,
        screen_y: i32,

        client_x: i32,
        client_y: i32,

        ctrl_key: i32,
        shift_key: i32,
        alt_key: i32,
        meta_key: i32,

        button: i16,
        buttons: i16,

        movement_x: i32,
        movement_y: i32,

        relative_x: i32,
        relative_y: i32,
    };

    pub extern "1" fn @"0"(target: usize, use_capture: bool, callback: EventCallback(MouseEvent)) callconv(.c) void;
    pub extern "1" fn @"1"(target: usize, use_capture: bool, callback: EventCallback(MouseEvent)) callconv(.c) void;
    pub extern "1" fn @"2"(target: usize, use_capture: bool, callback: EventCallback(MouseEvent)) callconv(.c) void;
    pub extern "1" fn @"3"(target: usize, use_capture: bool, callback: EventCallback(MouseEvent)) callconv(.c) void;
    pub extern "1" fn @"4"(target: usize, use_capture: bool, callback: EventCallback(MouseEvent)) callconv(.c) void;
};

/// Screen event definition.
pub usingnamespace struct {
    /// Represents a mouse event data.
    pub const ScreenEvent = extern struct {
        detail: i32,

        client_width: i32,
        client_height: i32,

        inner_width: i32,
        inner_height: i32,

        outer_width: i32,
        outer_height: i32,

        page_x_offset: i32,
        page_y_offset: i32,
    };

    pub extern "1" fn @"5"(target: usize, use_capture: bool, callback: EventCallback(ScreenEvent)) callconv(.c) void;
};
