const std = @import("std");
const main = @import("../main.zig");
const WebSocket = @This();

pub const WebSocketId = u16;

id: WebSocketId,

const EventType = enum(u8) {
    message = 1,
    open = 2,
    @"error" = 3,
    close = 4,
};

/// Describes if current protocol is secure.
pub inline fn isSecure() bool {
    return @"0"();
}

/// Creates a new WebSocket connection.
pub inline fn connect(url: []const u8) WebSocket {
    const socket_id = @"1"(url.ptr, url.len);

    return .{ .id = socket_id };
}

/// Closes and destroys the WebSocket connection.
pub inline fn destroy(self: WebSocket) void {
    @"2"(self.id);
}

/// Returns true if the WebSocket is ready for communication.
pub inline fn isReady(self: WebSocket) bool {
    return @"3"(self.id);
}

/// Sends binary data through the WebSocket.
pub inline fn send(self: WebSocket, data: []const u8) bool {
    return @"4"(self.id, data.ptr, data.len) != 0;
}

pub const MessageEvent = struct {
    event_type: EventType,
    data: ?[]const u8,
};

/// Polls for the next WebSocket event.
pub inline fn poll(socket_id: WebSocketId) ?MessageEvent {
    var data_addr: u32 = undefined;
    var data_len: i32 = undefined;

    const event_type_raw = @"5"(socket_id, &data_addr, &data_len);
    if (event_type_raw == 0) return null;

    if (data_addr == 0 or data_len == 0) {
        return .{
            .event_type = @enumFromInt(event_type_raw),
            .data = null,
        };
    }

    return .{
        .event_type = @enumFromInt(event_type_raw),
        .data = @as([*]const u8, @ptrFromInt(data_addr))[0..@intCast(data_len)],
    };
}

export fn pollHandle(socket_id: WebSocketId) void {
    if (poll(socket_id)) |event| {
        switch (event.event_type) {
            .message => {
                if (event.data) |data| main.free(@ptrCast(@alignCast(@constCast(data.ptr))));
            },
            .open, .@"error", .close => {
                std.debug.print("Not message", .{});
            },
        }
    }
}

/// Checks if current protocol is secure.
extern "3" fn @"0"() bool;
/// Creates WebSocket connection.
extern "3" fn @"1"(pointer: [*]const u8, length: u32) WebSocketId;
/// Destroys WebSocket connection.
extern "3" fn @"2"(socket_id: WebSocketId) void;
/// Checks if WebSocket is ready.
extern "3" fn @"3"(socket_id: WebSocketId) bool;
/// Sends data through WebSocket.
extern "3" fn @"4"(socket_id: WebSocketId, pointer: [*]const u8, length: u32) u8;
/// Polls for WebSocket events.
extern "3" fn @"5"(socket_id: WebSocketId, data_addr_ptr: *u32, data_len_ptr: *i32) u8;
