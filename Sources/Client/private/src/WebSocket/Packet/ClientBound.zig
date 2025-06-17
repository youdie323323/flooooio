const std = @import("std");
const io = std.io;
const mem = std.mem;
const opcode = @import("Opcode.zig");
const ClientWebSocket = @import("../ClientWebSocket.zig");

const Clientbound = @This();

pub const Reader = ClientWebSocket.DefaultPacketStream.Reader;
pub const Handler = *const fn (stream: *Reader) anyerror!void;

const NoEofError = ClientWebSocket.DefaultPacketStream.Reader.NoEofError;

const Handlers = std.AutoHashMap(opcode.Clientbound, Handler);

client: *ClientWebSocket,
handlers: Handlers,
default_handlers: Handlers,

var shared_buf: [256]u8 = undefined;

// Prepare fbs of shared_buf
var shared_fbs = io.fixedBufferStream(&shared_buf);

pub inline fn readCString(reader: *Reader) (NoEofError || error{StreamTooLong} || @TypeOf(shared_fbs).Writer.Error)![]const u8 {
    defer shared_fbs.reset();

    try reader.streamUntilDelimiter(shared_fbs.writer(), 0, shared_buf.len);

    return shared_fbs.getWritten();
}

/// Static declaration of varint encoding algorithm, compatible with go binary varint.
pub usingnamespace struct {
    /// Maximum length of a varint-encoded N-bit integer.
    pub const max_varint_len_16: u8 = 3;
    pub const max_varint_len_32: u8 = 5;
    pub const max_varint_len_64: u8 = 10;

    pub const ReadError = NoEofError || error{
        Overflow,
    };

    pub inline fn readVarUint64(stream: *Reader) ReadError!u64 {
        var x: u64 = 0;
        var s: u6 = 0;

        inline for (0..max_varint_len_64) |_| {
            const b = try stream.readByte();
            if (b < 0x80) return x | (@as(u64, b) << s);

            x |= (@as(u64, b & 0x7f) << s);
            s += 7;
        }

        return ReadError.Overflow;
    }

    pub inline fn readVarInt64(stream: *Reader) ReadError!i64 {
        const ux = try readVarUint64(stream);

        const x: i64 = @intCast(ux >> 1);

        if (ux & 1 != 0) {
            return ~x;
        }

        return x;
    }

    pub inline fn readVarUint32(stream: *Reader) ReadError!u32 {
        var x: u32 = 0;
        var s: u5 = 0;

        inline for (0..max_varint_len_32) |_| {
            const b = try stream.readByte();
            if (b < 0x80) return x | (@as(u32, b) << s);

            x |= (@as(u32, b & 0x7f) << s);
            s += 7;
        }

        return ReadError.Overflow;
    }

    pub inline fn readVarInt32(stream: *Reader) ReadError!i32 {
        const ux = try readVarUint32(stream);

        const x: i32 = @intCast(ux >> 1);

        if (ux & 1 != 0) {
            return ~x;
        }

        return x;
    }

    pub inline fn readVarUint16(stream: *Reader) ReadError!u16 {
        var x: u16 = 0;
        var s: u4 = 0;

        inline for (0..max_varint_len_16) |_| {
            const b = try stream.readByte();
            if (b < 0x80) return x | (@as(u16, b) << s);

            x |= (@as(u16, b & 0x7f) << s);
            s += 7;
        }

        return ReadError.Overflow;
    }

    pub inline fn readVarInt16(stream: *Reader) ReadError!i16 {
        const ux = try readVarUint16(stream);

        const x: i16 = @intCast(ux >> 1);

        if (ux & 1 != 0) {
            return ~x;
        }

        return x;
    }

    pub inline fn readVarFloat(comptime T: type, stream: *Reader) ReadError!T {
        return @bitCast(switch (T) {
            f16 => try readVarUint16(stream),
            f32 => try readVarUint32(stream),
            f64 => try readVarUint64(stream),
            else => @compileError(std.fmt.comptimePrint("unsupported float type: {}", .{T})),
        });
    }
};

/// Reads a f16 from stream, consumes 2 byte.
pub inline fn readFloat16(stream: *Reader) NoEofError!f16 {
    var buffer: [2]u8 align(@alignOf(f16)) = undefined;

    _ = try stream.readAll(&buffer);

    return std.mem.bytesAsValue(f16, &buffer).*;
}

/// Reads a f32 from stream, consumes 4 byte.
pub inline fn readFloat32(stream: *Reader) NoEofError!f32 {
    var buffer: [4]u8 align(@alignOf(f32)) = undefined;

    _ = try stream.readAll(&buffer);

    return std.mem.bytesAsValue(f32, &buffer).*;
}

/// Reads a f64 from stream, consumes 8 byte.
pub inline fn readFloat64(stream: *Reader) NoEofError!f64 {
    var buffer: [8]u8 align(@alignOf(f64)) = undefined;

    _ = try stream.readAll(&buffer);

    return std.mem.bytesAsValue(f64, &buffer).*;
}

/// Reads a bool from stream, consumes one byte.
pub inline fn readBool(stream: *Reader) NoEofError!bool {
    return try stream.readByte() != 0;
}

pub fn init(
    allocator: mem.Allocator,
    client: *ClientWebSocket,
) Clientbound {
    return .{
        .client = client,
        .handlers = Handlers.init(allocator),
        .default_handlers = Handlers.init(allocator),
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
    op: opcode.Clientbound,
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
    const reason = try stream.readEnum(opcode.ClientboundConnectionKickReason, .little);

    switch (reason) {
        .outdated_client => {},
        .cheat_detected => {},
    }
}
