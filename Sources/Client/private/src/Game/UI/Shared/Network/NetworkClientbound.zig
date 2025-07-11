const std = @import("std");
const io = std.io;
const mem = std.mem;
const Opcode = @import("NetworkPacketOpcode.zig");
const NetworkClient = @import("NetworkClient.zig");

const Clientbound = @This();

pub const Reader = NetworkClient.DefaultPacketStream.Reader;
pub const Handler = *const fn (stream: *Reader) anyerror!void;

const NoEofError = NetworkClient.DefaultPacketStream.Reader.NoEofError;

const Handlers = std.AutoHashMap(Opcode.Clientbound, Handler);

client: *NetworkClient,

handlers: Handlers,
default_handlers: Handlers,

pub fn init(
    allocator: mem.Allocator,
    client: *NetworkClient,
) Clientbound {
    return .{
        .client = client,

        .handlers = .init(allocator),
        .default_handlers = .init(allocator),
    };
}

pub fn deinit(self: *Clientbound) void {
    self.handlers.deinit();
    self.default_handlers.deinit();

    self.* = undefined;
}

var shared_buf: [256]u8 = undefined;

// Prepare fbs of shared_buf
var shared_fbs = io.fixedBufferStream(&shared_buf);

pub fn readCString(reader: *Reader) (NoEofError || error{StreamTooLong} || @TypeOf(shared_fbs).Writer.Error)![]const u8 {
    defer shared_fbs.reset();

    try reader.streamUntilDelimiter(shared_fbs.writer(), 0, shared_buf.len);

    return shared_fbs.getWritten();
}

/// Reads a float16 from stream.
pub fn readFloat16(stream: *Reader) NoEofError!f16 {
    var buffer: [2]u8 align(@alignOf(f16)) = undefined;

    _ = try stream.readAll(&buffer);

    return std.mem.bytesAsValue(f16, &buffer).*;
}

/// Reads a float32 from stream.
pub fn readFloat32(stream: *Reader) NoEofError!f32 {
    var buffer: [4]u8 align(@alignOf(f32)) = undefined;

    _ = try stream.readAll(&buffer);

    return std.mem.bytesAsValue(f32, &buffer).*;
}

/// Reads a float64 from stream.
pub fn readFloat64(stream: *Reader) NoEofError!f64 {
    var buffer: [8]u8 align(@alignOf(f64)) = undefined;

    _ = try stream.readAll(&buffer);

    return std.mem.bytesAsValue(f64, &buffer).*;
}

/// Reads a bool from stream, consumes one byte.
pub fn readBool(stream: *Reader) NoEofError!bool {
    return try stream.readByte() != 0;
}

pub fn read(self: *const Clientbound, data: []const u8) !void {
    var fbs = io.fixedBufferStream(data);
    var stream = fbs.reader();

    const packet_type = try stream.readEnum(Opcode.Clientbound, .little);

    if (self.handlers.get(packet_type) orelse self.default_handlers.get(packet_type)) |handler|
        try handler(&stream)
    else
        std.log.warn("Unhandled packet type: {}", .{packet_type});
}

/// Puts custom handler.
pub fn putHandler(
    self: *Clientbound,
    op: Opcode.Clientbound,
    handler: Handler,
) !void {
    try self.handlers.put(op, handler);
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
    const reason = try stream.readEnum(Opcode.ClientboundConnectionKickReason, .little);

    switch (reason) {
        .outdated_client => {},
        .cheat_detected => {},
    }
}
