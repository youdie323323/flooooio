const std = @import("std");
const io = std.io;
const mem = std.mem;
const opcode = @import("./Opcode.zig");
const ClientWebSocket = @import("../ClientWebSocket.zig");

const Clientbound = @This();

pub const Reader = ClientWebSocket.DefaultPacketStream.Reader;
pub const Handler = *const fn (stream: *Reader) anyerror!void;

const HandlerMap = std.AutoHashMap(opcode.Clientbound, Handler);

client: *ClientWebSocket,
handlers: HandlerMap,
default_handlers: HandlerMap,

pub fn readFloat16(stream: anytype) ClientWebSocket.DefaultPacketStream.ReadError!f16 {
    var buffer: [2]u8 align(@alignOf(f16)) = undefined;

    _ = try stream.readAll(&buffer);

    return std.mem.bytesAsValue(f16, &buffer).*;
}

pub fn readFloat32(stream: anytype) ClientWebSocket.DefaultPacketStream.ReadError!f32 {
    var buffer: [4]u8 align(@alignOf(f32)) = undefined;

    _ = try stream.readAll(&buffer);

    return std.mem.bytesAsValue(f32, &buffer).*;
}

pub fn readFloat64(stream: anytype) ClientWebSocket.DefaultPacketStream.ReadError!f64 {
    var buffer: [8]u8 align(@alignOf(f64)) = undefined;

    _ = try stream.readAll(&buffer);

    return std.mem.bytesAsValue(f64, &buffer).*;
}

pub fn init(
    allocator: mem.Allocator,
    client: *ClientWebSocket,
) Clientbound {
    return .{
        .client = client,
        .handlers = HandlerMap.init(allocator),
        .default_handlers = HandlerMap.init(allocator),
    };
}

pub fn deinit(self: *Clientbound) void {
    self.handlers.deinit();
    self.default_handlers.deinit();

    self.* = undefined;
}

pub fn read(self: Clientbound, data: []const u8) !void {
    var fbs = io.fixedBufferStream(data);
    var stream = fbs.reader();

    const packet_type = try stream.readEnum(opcode.Clientbound, .little);

    if (self.handlers.get(packet_type) orelse self.default_handlers.get(packet_type)) |handler| {
        try handler(&stream);
    } else {
        std.log.warn("Unhandled packet type: {}", .{packet_type});
    }
}

/// Puts custom handler.
pub fn putHandler(
    self: *Clientbound,
    cb: opcode.Clientbound,
    handler: Handler,
) !void {
    try self.handlers.put(cb, handler);
}

/// Clear all custom handlers.
pub fn clearHandlers(self: *Clientbound) void {
    self.handlers.clearRetainingCapacity();
}

/// Puts all default handlers.
fn putDefaultHandlers(self: *Clientbound) mem.Allocator.Error!void {
    try self.default_handlers.put(.connection_kicked, handleConnectionKick);
}

fn handleConnectionKick(stream: *Reader) !void {
    const reason = try stream.readEnum(opcode.ClientboundConnectionKickReason, .little);

    switch (reason) {
        .outdated_client => {},

        .cheat_detected => {},
    }
}
