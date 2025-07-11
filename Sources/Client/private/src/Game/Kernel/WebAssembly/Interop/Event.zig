//! Event handling module.
//! Provides functionality for registering and managing event listeners
//! in a web context.
//! 
pub const GlobalEventTarget = enum(u8) {
    document = 0,
    window = 1,
};

/// Types of events that can be handled.
pub const EventType = enum(u32) {
    mouse_down = 5,
    mouse_up = 6,
    mouse_move = 8,
    mouse_enter = 33,
    mouse_leave = 34,

    screen_resize = 10,

    wheel = 9,
};

/// Function represents js function that register events.
fn EventRegisterer(comptime Event: type) type {
    return *const fn (target: usize, use_capture: bool, callback: EventCallback(Event)) callconv(.c) void;
}

/// Gets the appropriate event register function for the given event type.
fn getEventRegistererFromEventType(comptime event_type: EventType) EventRegisterer(EventFromEventType(event_type)) {
    comptime {
        return switch (event_type) {
            .mouse_down => @This().@"0",
            .mouse_enter => @This().@"1",
            .mouse_leave => @This().@"2",
            .mouse_move => @This().@"3",
            .mouse_up => @This().@"4",

            .screen_resize => @This().@"5",

            .wheel => @This().@"6",
        };
    }
}

/// Gets the appropriate event for the given event type.
fn EventFromEventType(comptime event_type: EventType) type {
    return comptime switch (event_type) {
        .mouse_down, .mouse_enter, .mouse_leave, .mouse_move, .mouse_up => @This().MouseEvent,

        .screen_resize => @This().ScreenEvent,

        .wheel => @This().WheelEvent,
    };
}

/// Callback function generic type for event handlers.
/// Returns true to indicate the event was handled.
/// Null pointer of this will removing a handler.
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
    const registerer = comptime getEventRegistererFromEventType(event_type);

    registerer(comptime @intFromEnum(target), use_capture, callback);
}

/// Adds event listener to an element by selector.
pub fn addEventListenerBySelector(
    comptime selector: []const u8,
    comptime event_type: EventType,
    comptime callback: EventCallback(EventFromEventType(event_type)),
    comptime use_capture: bool,
) void {
    const registerer = comptime getEventRegistererFromEventType(event_type);

    const selector_ptr = Mem.allocCString(selector);

    registerer(@intFromPtr(selector_ptr), use_capture, callback);

    Mem.freeCString(selector_ptr);
}

/// Removes event listener of a target element or global target.
pub fn removeEventListener(
    comptime target: GlobalEventTarget,
    comptime event_type: EventType,
) void {
    const registerer = comptime getEventRegistererFromEventType(event_type);

    registerer(comptime @intFromEnum(target), false, @ptrFromInt(0));
}

/// Removes event listener of element by selector.
pub fn removeEventListenerBySelector(
    comptime selector: []const u8,
    comptime event_type: EventType,
) void {
    const registerer = comptime getEventRegistererFromEventType(event_type);

    const selector_ptr = Mem.allocCString(selector);

    registerer(@intFromPtr(selector_ptr), false, @ptrFromInt(0));

    Mem.freeCString(selector_ptr);
}

/// Screen event definition.
pub usingnamespace struct {
    /// Represents a screen event data.
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

/// Wheel event definition.
pub usingnamespace struct {
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

    /// Represents a wheel event data.
    pub const WheelEvent = extern struct {
        // MouseEvent properties

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

        // WheelEvent properties

        delta_x: f64,
        delta_y: f64,
        delta_z: f64,

        delta_mode: i32,
    };

    pub extern "1" fn @"6"(target: usize, use_capture: bool, callback: EventCallback(WheelEvent)) callconv(.c) void;
};

const std = @import("std");

const Mem = @import("../../../../Mem.zig");
