const std = @import("std");
const EventTarget = @This();

/// Add event listener on dom element.
extern "1" fn @"0"(element_id_pointer: [*]const u8, element_id_length: u32, event_type_pointer: [*]const u8, event_type_length: u32, callback: *const anyopaque) void;
/// Remove event listener from dom element.
extern "1" fn @"1"(element_id_pointer: [*]const u8, element_id_length: u32, event_type_pointer: [*]const u8, event_type_length: u32, callback: *const anyopaque) void;
/// Set attribute of element
extern "1" fn @"2"(element_id_pointer: [*]const u8, element_id_length: u32, key_pointer: [*]const u8, key_length: u32, value: u16) void;
/// Get attribute of element
extern "1" fn @"3"(element_id_pointer: [*]const u8, element_id_length: u32, key_pointer: [*]const u8, key_length: u32) u16;

// window if empty string.
pub inline fn addEventListener(element_id: []const u8, event_type: []const u8, callback: *const anyopaque) void {
    @"0"(element_id.ptr, element_id.len, event_type.ptr, event_type.len, callback);
}

// window if empty string.
pub inline fn removeEventListener(element_id: []const u8, event_type: []const u8, callback: *const anyopaque) void {
    @"1"(element_id.ptr, element_id.len, event_type.ptr, event_type.len, callback);
}

pub inline fn setProperty(element_id: []const u8, key: []const u8, value: u16) void {
    @"2"(element_id.ptr, element_id.len, key.ptr, key.len, value);
}

pub inline fn getProperty(element_id: []const u8, key: []const u8) u16 {
    return @"3"(element_id.ptr, element_id.len, key.ptr, key.len);
}