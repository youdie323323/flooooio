const std = @import("std");
const bindgen = @import("./Bindgen/lib.zig");

pub const EventType = enum(u32) {
    drag,
    focus,
    input,
    key,
    mouse,
    pointer,
    resize,
    scroll,
    touch,
    wheel,
};

pub const MouseButton = enum(u8) {
    none,
    primary = 1,
    secondary = 2,
    middle = 4,
};

pub const PointerType = enum(u8) {
    mouse,
    pen,
    touch,
};

pub const WheelDeltaMode = enum(u8) {
    pixel,
    line,
    page,
};

pub const KeyModifier = enum(u8) {
    shift = 1,
    ctrl = 2,
    alt = 4,
    meta = 8,
};

pub const GlobalEventTargetType = enum(u8) {
    window,
    document_head,
    document_body,
};

/// Various browser window related information.
pub const WindowInfo = extern struct {
    inner_width: u16,
    inner_height: u16,
    /// Horizontal scroll offset in fractional CSS pixels.
    scrollX: f32,
    /// Vertical scroll offset in fractional CSS pixels.
    scrollY: f32,
    /// Current device pixel ratio.
    dpr: u8,
    /// Encoded bitmask indicating fullscreen status / capability:
    /// - 1 (bit 0): fullscreen active
    /// - 2 (bit 1): fullscreen supported
    fullscreen: u8,

    /// Returns true if fullscreen mode is currently active (see `.fullscreen`).
    pub inline fn isFullscreen(self: *const WindowInfo) bool {
        return self.fullscreen & 1 != 0;
    }

    /// Returns true if fullscreen mode is supported (see `.fullscreen`).
    pub inline fn hasFullscreen(self: *const WindowInfo) bool {
        return self.fullscreen & 2 != 0;
    }
};

pub const DragEvent = extern struct {
    /// Mouse X position in the local space of the element's bounding rect.
    clientX: i16 = 0,
    /// Mouse Y position in the local space of the element's bounding rect.
    clientY: i16 = 0,
    /// If non-zero, data that is being dragged during a drag & drop operation can
    /// be obtained via various DnD related API calls (only available when called
    /// from event handler).
    is_data_transfer: u8 = 0,
    /// Encoded bitmask of currently pressed modifier keys, see `KeyModifier` enum.
    modifiers: u8 = 0,
    /// Encoded bitmask of all currently pressed mouse buttons, see `MouseButton` enum.
    buttons: u8 = 0,
    /// Event related mouse button ID (if any).
    button: MouseButton,
};

pub const InputEvent = extern struct {
    /// Value of the targeted input element.
    /// The memory is owned by the DOM API and will be freed immediately after the
    /// event handler has returned.
    value: bindgen.ConstStringPtr,
    /// Length of the value string
    len: u32,

    pub inline fn getValue(self: *const InputEvent) [:0]const u8 {
        return self.value[0..self.len :0];
    }
};

pub const KeyboardEvent = extern struct {
    /// Value/name of the key pressed.
    key: [15:0]u8,
    /// Number of characters of the `key` string.
    len: u8 = 0,
    /// Encoded bitmask of currently pressed modifier keys, see `KeyModifier` enum.
    modifiers: u8 = 0,
    /// Non-zero value indicates key is being held down such that it's automatically
    /// repeating.
    repeat: u8 = 0,

    pub inline fn getKey(self: *const KeyboardEvent) [:0]const u8 {
        return self.key[0..@as(usize, self.len) :0];
    }

    pub inline fn hasModifier(self: *const KeyboardEvent, mod: KeyModifier) bool {
        return self.modifiers & @intFromEnum(mod) != 0;
    }
};

pub const MouseEvent = extern struct {
    /// Mouse X position in the local space of the element's bounding rect.
    clientX: i16 = 0,
    /// Mouse Y position in the local space of the element's bounding rect.
    clientY: i16 = 0,
    /// Encoded bitmask of currently pressed modifier keys, see `KeyModifier` enum.
    modifiers: u8 = 0,
    /// Encoded bitmask of all currently pressed mouse buttons, see `MouseButton` enum.
    buttons: u8 = 0,
    /// Event related mouse button ID (if any).
    button: MouseButton,
};

pub const PointerEvent = extern struct {
    /// Mouse X position in the local space of the element's bounding rect.
    clientX: i16 = 0,
    /// Mouse Y position in the local space of the element's bounding rect.
    clientY: i16 = 0,
    /// Unique pointer ID.
    id: u32 = 0,
    /// Normalized pressure value 0..1 .
    pressure: f32 = 0,
    /// The plane angle (in degrees, in the range of -90 to 90) between the Y-Z
    /// plane and the plane containing both the pointer (e.g. pen stylus) axis and
    /// the Y axis.
    tiltX: i8 = 0,
    /// The plane angle (in degrees, in the range of -90 to 90) between the X-Z
    /// plane and the plane containing both the pointer (e.g. pen stylus) axis and
    /// the X axis.
    tiltY: i8 = 0,
    /// The clockwise rotation of the pointer (e.g. pen stylus) around its major
    /// axis in degrees, with a value in the range 0 to 359.
    twist: u16 = 0,
    pointer_type: PointerType,
    /// Non-zero if event's pointer is the primary pointer (in a multitouch scenario).
    isPrimary: u8,
    /// Encoded bitmask of currently pressed modifier keys, see `KeyModifier` enum.
    modifiers: u8 = 0,
    /// Encoded bitmask of all currently pressed mouse buttons, see `MouseButton` enum.
    buttons: u8 = 0,
    /// Event related mouse button ID (if any).
    button: MouseButton,
};

/// This event isnt exit actually.
pub const ResizeEvent = extern struct {
    /// Window inner width in pixels.
    width: u16,
    /// Window inner height in pixels.
    height: u16,
};

/// This event isnt exit actually.
pub const ScrollEvent = extern struct {
    /// Horizontal scroll offset in fractional CSS pixels.
    scrollX: f32,
    /// Vertical scroll offset in fractional CSS pixels.
    scrollY: f32,
};

pub const TouchEvent = extern struct {
    /// Touch X position in the local space of the element's bounding rect.
    clientX: i16 = 0,
    /// Touch Y position in the local space of the element's bounding rect.
    clientY: i16 = 0,
    /// Encoded bitmask of currently pressed modifier keys, see `KeyModifier` enum.
    modifiers: u8 = 0,
};

pub const WheelEvent = extern struct {
    /// Scroll X delta
    deltaX: i16 = 0,
    /// Scroll Y delta
    deltaY: i16 = 0,
    /// Scroll Z delta
    deltaZ: i16 = 0,
    /// Delta mode
    mode: WheelDeltaMode,
    /// Encoded bitmask of currently pressed modifier keys, see `KeyModifier` enum.
    modifiers: u8 = 0,
    /// Encoded bitmask of currently pressed mouse buttons, see `MouseButton` enum.
    buttons: u8 = 0,
    /// Event related mouse button ID (if any).
    button: MouseButton,
};

pub const EventBody = extern union {
    drag: DragEvent,
    input: InputEvent,
    key: KeyboardEvent,
    mouse: MouseEvent,
    pointer: PointerEvent,
    resize: ResizeEvent,
    scroll: ScrollEvent,
    touch: TouchEvent,
    wheel: WheelEvent,
};

pub const Event = extern struct {
    type: EventType,
    /// Event details / payload. Currently, only the following event types have a
    /// defined body:
    ///
    /// - drag
    /// - input
    /// - key
    /// - mouse
    /// - pointer
    /// - resize
    /// - scroll
    /// - touch
    /// - wheel
    body: EventBody,
};

/// Event listener function. Takes an event.
pub const EventListener = *const fn (event: *const Event) callconv(.c) void;

pub const EventListenerId = u16;

extern "1" fn @"0"(global_event_target_type: GlobalEventTargetType, event_type: EventType, listener: EventListener) void;

extern "1" fn @"1"(pointer: [*]const u8, length: u32, event_type: EventType, listener: EventListener) void;

pub inline fn addGlobalEventListener(global_event_target_type: GlobalEventTargetType, event_type: EventType, listener: EventListener) void {
    @"0"(global_event_target_type, event_type, listener);
}

pub inline fn addEventListener(element_id: []const u8, event_type: EventType, listener: EventListener) void {
    @"1"(element_id.ptr, element_id.len, event_type, listener);
}

/// Removes the listener for given ID.
extern "1" fn @"2"(listener_id: EventListenerId) void;

pub inline fn removeEventListener(listener_id: EventListenerId) void {
    @"2"(listener_id);
}

/// Calls .preventDefault() on currently processed event
/// (only to be called from an EventListener!)
extern "1" fn @"3"() void;

/// Calls .stopPropagation() on currently processed event
/// (only to be called from an EventListener!)
extern "1" fn @"4"() void;

/// Calls .stopImmediatePropagation() on currently processed event
/// (only to be called from an EventListener!)
extern "1" fn @"5"() void;

pub inline fn preventDefault() void {
    @"3"();
}

pub inline fn stopPropagation() void {
    @"4"();
}

pub inline fn stopImmediatePropagation() void {
    @"5"();
}
