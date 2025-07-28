//! Event handling module.
//! Provides functionality for registering and managing event listeners
//! in a web context.

pub const GlobalEventTarget = enum(usize) {
    document = 0,
    window = 1,
};

/// Type of events that can be handled.
pub const EventType = enum(usize) {
    mouse_down = 5,
    mouse_up = 6,
    mouse_move = 8,
    mouse_enter = 33,
    mouse_leave = 34,

    screen_resize = 10,

    wheel = 9,

    /// Returns event within this event type.
    pub fn Event(comptime self: @This()) type {
        return comptime switch (self) {
            .mouse_down, .mouse_enter, .mouse_leave, .mouse_move, .mouse_up => MouseEvent,

            .screen_resize => UIEvent,

            .wheel => WheelEvent,
        };
    }

    /// Gets the appropriate event register function for the given event type.
    pub fn registerer(comptime self: @This()) EventRegisterer(self.Event()) {
        return comptime switch (self) {
            .mouse_down => MouseEvent.@"0",
            .mouse_enter => MouseEvent.@"1",
            .mouse_leave => MouseEvent.@"2",
            .mouse_move => MouseEvent.@"3",
            .mouse_up => MouseEvent.@"4",

            .screen_resize => UIEvent.@"5",

            .wheel => WheelEvent.@"6",
        };
    }
};

/// Type represents js function that register events.
fn EventRegisterer(comptime Event: type) type {
    return *const fn (target: usize, use_capture: bool, callback: EventCallback(Event)) callconv(.c) void;
}

/// Callback function generic type for event handlers.
/// Returns true to indicate the event was handled.
/// Null pointer of this will removing a handler.
pub fn EventCallback(comptime Event: type) type {
    return *allowzero const fn (@"type": EventType, event: *const Event) callconv(.c) bool;
}

/// Adds event listener to a target element or global target.
pub fn addEventListener(
    comptime target: GlobalEventTarget,
    comptime @"type": EventType,
    comptime callback: EventCallback(@"type".Event()),
    comptime use_capture: bool,
) void {
    const registerer = comptime @"type".registerer();

    registerer(comptime @intFromEnum(target), use_capture, callback);
}

/// Adds event listener to an element by selector.
pub fn addEventListenerBySelector(
    comptime selector: []const u8,
    comptime @"type": EventType,
    comptime callback: EventCallback(@"type".Event()),
    comptime use_capture: bool,
) void {
    const registerer = comptime @"type".registerer();

    const selector_ptr = Mem.allocCString(selector);

    registerer(@intFromPtr(selector_ptr), use_capture, callback);

    Mem.freeCString(selector_ptr);
}

/// Removes event listener of a target element or global target.
pub fn removeEventListener(
    comptime target: GlobalEventTarget,
    comptime @"type": EventType,
) void {
    const registerer = comptime @"type".registerer();

    registerer(comptime @intFromEnum(target), false, @ptrFromInt(0));
}

/// Removes event listener of element by selector.
pub fn removeEventListenerBySelector(
    comptime selector: []const u8,
    comptime @"type": EventType,
) void {
    const registerer = comptime @"type".registerer();

    const selector_ptr = Mem.allocCString(selector);

    registerer(@intFromPtr(selector_ptr), false, @ptrFromInt(0));

    Mem.freeCString(selector_ptr);
}

pub const UIEvent = extern struct {
    detail: i32,

    document_body_client_width: i32,
    document_body_client_height: i32,

    window_inner_width: i32,
    window_inner_height: i32,

    window_outer_width: i32,
    window_outer_height: i32,

    scroll_top: i32,
    scroll_left: i32,

    pub extern "1" fn @"5"(target: usize, use_capture: bool, callback: EventCallback(UIEvent)) callconv(.c) void;
};

pub const MouseEvent = extern struct {
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

    target_x: i32,
    target_y: i32,

    pub extern "1" fn @"0"(target: usize, use_capture: bool, callback: EventCallback(MouseEvent)) callconv(.c) void;
    pub extern "1" fn @"1"(target: usize, use_capture: bool, callback: EventCallback(MouseEvent)) callconv(.c) void;
    pub extern "1" fn @"2"(target: usize, use_capture: bool, callback: EventCallback(MouseEvent)) callconv(.c) void;
    pub extern "1" fn @"3"(target: usize, use_capture: bool, callback: EventCallback(MouseEvent)) callconv(.c) void;
    pub extern "1" fn @"4"(target: usize, use_capture: bool, callback: EventCallback(MouseEvent)) callconv(.c) void;
};

pub const WheelEvent = extern struct {
    mouse: MouseEvent,

    delta_x: f64,
    delta_y: f64,
    delta_z: f64,

    delta_mode: i32,

    pub extern "1" fn @"6"(target: usize, use_capture: bool, callback: EventCallback(WheelEvent)) callconv(.c) void;
};

const std = @import("std");

const Mem = @import("../../../../Mem.zig");
