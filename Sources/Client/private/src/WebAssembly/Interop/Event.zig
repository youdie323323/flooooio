//! Mouse event handling module.
//! Provides functionality for registering and managing mouse event listeners
//! in a web context.
const std = @import("std");
const mem = @import("../../mem.zig");

/// Mouse event definition.
pub usingnamespace struct {
    /// Represents a mouse event with position and state information.
    pub const MouseEvent = extern struct {
        // zig fmt: off
        // TODO: for some reason timestamp be a broken value
        timestamp: f64,       // HEAPF64[ptr >> 3]

        screen_x: i32,        // HEAP32[ptr + 2] 
        screen_y: i32,        // HEAP32[ptr + 3]

        client_x: i32,        // HEAP32[ptr + 4]
        client_y: i32,        // HEAP32[ptr + 5]

        ctrl_key: i32,        // HEAP32[ptr + 6]
        shift_key: i32,       // HEAP32[ptr + 7]
        alt_key: i32,         // HEAP32[ptr + 8]
        meta_key: i32,        // HEAP32[ptr + 9]

        button: i16,          // HEAP16[2 * ptr + 20]
        buttons: i16,         // HEAP16[2 * ptr + 21]
        
        movement_x: i32,      // HEAP32[ptr + 11]
        movement_y: i32,      // HEAP32[ptr + 12]

        relative_x: i32,      // HEAP32[ptr + 13]
        relative_y: i32,      // HEAP32[ptr + 14]
        // zig fmt: on
    };

    /// Callback function type for mouse event handlers.
    /// Returns true to indicate the event was handled.
    pub const MouseEventCallback = *allowzero const fn (event_type: MouseEventType, event: *const MouseEvent) callconv(.c) bool;

    /// Types of mouse events that can be handled.
    pub const MouseEventType = enum(u32) {
        down = 5,
        up = 6,
        move = 8,
        enter = 33,
        leave = 34,
    };

    pub const GlobalEventTarget = enum(u8) {
        document = 0,
        window = 1,
    };

    /// Function represents js function that register mouse events.
    const MouseEventRegister = *const fn (target: usize, use_capture: bool, callback: MouseEventCallback) callconv(.c) void;

    extern "1" fn @"0"(target: usize, use_capture: bool, callback: MouseEventCallback) callconv(.c) void;
    extern "1" fn @"1"(target: usize, use_capture: bool, callback: MouseEventCallback) callconv(.c) void;
    extern "1" fn @"2"(target: usize, use_capture: bool, callback: MouseEventCallback) callconv(.c) void;
    extern "1" fn @"3"(target: usize, use_capture: bool, callback: MouseEventCallback) callconv(.c) void;
    extern "1" fn @"4"(target: usize, use_capture: bool, callback: MouseEventCallback) callconv(.c) void;

    /// Gets the appropriate event handler function for the given event type.
    inline fn getEventHandler(comptime event_type: MouseEventType) MouseEventRegister {
        return comptime switch (event_type) {
            .down => @"0",
            .enter => @"1",
            .leave => @"2",
            .move => @"3",
            .up => @"4",
        };
    }

    /// Add mouse event listener to a target element or global target.
    pub fn addMouseEventListener(
        comptime target: GlobalEventTarget,
        comptime use_capture: bool,
        comptime callback: MouseEventCallback,
        comptime event_type: MouseEventType,
    ) void {
        getEventHandler(event_type)(comptime @intFromEnum(target), use_capture, callback);
    }

    /// Add mouse event listener to an element by selector.
    pub fn addMouseEventListenerBySelector(
        comptime selector: []const u8,
        comptime use_capture: bool,
        comptime callback: MouseEventCallback,
        comptime event_type: MouseEventType,
    ) void {
        const selector_ptr = mem.allocCString(selector);

        getEventHandler(event_type)(selector_ptr, use_capture, callback);

        mem.freeCString(selector_ptr);
    }

    pub fn removeMouseEventListener(
        comptime target: GlobalEventTarget,
        comptime event_type: MouseEventType,
    ) void {
        getEventHandler(event_type)(comptime @intFromEnum(target), false, @ptrFromInt(0));
    }

    pub fn removeMouseEventListenerBySelector(
        comptime selector: []const u8,
        comptime event_type: MouseEventType,
    ) void {
        const selector_ptr = mem.allocCString(selector);

        getEventHandler(event_type)(selector_ptr, false, @ptrFromInt(0));

        mem.freeCString(selector_ptr);
    }
};
