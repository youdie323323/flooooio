const Clientbound = @This();

pub const Reader = Client.DefaultPacketStream.Reader;
pub const Handler = *const fn (stream: *const Reader) anyerror!void;

const NoEofError = Client.DefaultPacketStream.Reader.NoEofError;

const Handlers = std.AutoHashMap(Opcode.Clientbound, Handler);

client: *Client,

handlers: Handlers,
default_handlers: Handlers,

pub fn init(
    allocator: mem.Allocator,
    client: *Client,
) !Clientbound {
    var self: Clientbound = .{
        .client = client,

        .handlers = .init(allocator),
        .default_handlers = .init(allocator),
    };

    try self.putDefaultHandlers();

    return self;
}

pub fn deinit(self: *Clientbound) void {
    self.handlers.deinit();
    self.default_handlers.deinit();

    self.* = undefined;
}

var shared_buf: [256]u8 = undefined;

// Prepare fbs of shared_buf
var shared_fbs = io.fixedBufferStream(&shared_buf);

pub fn readCString(reader: *const Reader) (NoEofError || error{StreamTooLong} || @TypeOf(shared_fbs).Writer.Error)![]const u8 {
    defer shared_fbs.reset();

    try reader.streamUntilDelimiter(shared_fbs.writer(), 0, shared_buf.len);

    return shared_fbs.getWritten();
}

/// Reads a float16 from stream.
pub fn readFloat16(stream: *const Reader) NoEofError!f16 {
    var buffer: [2]u8 align(@alignOf(f16)) = undefined;

    _ = try stream.readAll(&buffer);

    return mem.bytesAsValue(f16, &buffer).*;
}

/// Reads a float32 from stream.
pub fn readFloat32(stream: *const Reader) NoEofError!f32 {
    var buffer: [4]u8 align(@alignOf(f32)) = undefined;

    _ = try stream.readAll(&buffer);

    return mem.bytesAsValue(f32, &buffer).*;
}

/// Reads a float64 from stream.
pub fn readFloat64(stream: *const Reader) NoEofError!f64 {
    var buffer: [8]u8 align(@alignOf(f64)) = undefined;

    _ = try stream.readAll(&buffer);

    return mem.bytesAsValue(f64, &buffer).*;
}

/// Reads a boolean from stream.
pub fn readBool(stream: *const Reader) NoEofError!bool {
    return try stream.readByte() != 0;
}

pub fn read(self: *const Clientbound, data: []const u8) !void {
    var fbs = io.fixedBufferStream(data);
    const stream = fbs.reader();

    const opcode = try stream.readEnum(Opcode.Clientbound, .little);

    if (self.handlers.get(opcode) orelse self.default_handlers.get(opcode)) |handler|
        try handler(&stream)
    else
        std.log.warn("Unhandled packet type: {}", .{opcode});
}

/// Puts a custom handler.
pub fn putHandler(
    self: *Clientbound,
    opcode: Opcode.Clientbound,
    handler: Handler,
) !void {
    try self.handlers.put(opcode, handler);
}

/// Clear all custom handlers.
pub fn clearHandlers(self: *Clientbound) void {
    self.handlers.clearRetainingCapacity();
}

/// Puts all default handlers.
fn putDefaultHandlers(self: *Clientbound) mem.Allocator.Error!void {
    try self.default_handlers.put(.kick, handleKick);
}

fn handleKick(stream: *const Reader) anyerror!void {
    const reason = try stream.readEnum(Opcode.Clientbound.KickReason, .little);

    switch (reason) {
        inline .outdated_client => {},
        inline .cheat_detected => {},
    }
}

const std = @import("std");
const io = std.io;
const mem = std.mem;

const Network = @import("Network.zig");
const Client = Network.Client;
const Opcode = Network.Opcode;
