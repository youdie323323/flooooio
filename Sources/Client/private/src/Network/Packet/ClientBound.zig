const std = @import("std");
const io = std.io;
const mem = std.mem;
const Opcode = @import("./Opcode.zig");
const ClientWebSocket = @import("../ClientWebSocket.zig");

const ClientBound = @This();

pub const Reader = ClientWebSocket.DefaultPacketStream.Reader;
pub const Handler = *const fn (stream: *Reader) anyerror!void;

const HandlerMap = std.AutoHashMap(Opcode.ClientBound, Handler);

client: *ClientWebSocket,
handlers: HandlerMap,
default_handlers: HandlerMap,

pub fn init(
    allocator: mem.Allocator,
    client: *ClientWebSocket,
) ClientBound {
    return .{
        .client = client,
        .handlers = HandlerMap.init(allocator),
        .default_handlers = HandlerMap.init(allocator),
    };
}

pub fn deinit(self: *ClientBound) void {
    self.handlers.deinit();
    self.default_handlers.deinit();
    
    self.* = undefined;
}

pub fn read(self: ClientBound, data: []const u8) !void {
    var fbs = io.fixedBufferStream(data);
    var stream = fbs.reader();

    const packet_type = try stream.readEnum(Opcode.ClientBound, .little);

    if (self.handlers.get(packet_type) orelse self.default_handlers.get(packet_type)) |handler| {
        try handler(&stream);
    } else {
        std.log.warn("Unhandled packet type: {}", .{packet_type});
    }
}

pub fn putHandler(
    self: *ClientBound,
    opcode: Opcode.ClientBound,
    handler: Handler,
) !void {
    try self.handlers.put(opcode, handler);
}

pub fn clearHandlers(self: *ClientBound) void {
    self.handlers.clearRetainingCapacity();
}

fn registerDefaultHandlers(self: *ClientBound) mem.Allocator.Error!void {
    try self.default_handlers.put(.connection_kicked, handleConnectionKick);
}

fn handleConnectionKick(stream: *Reader) !void {
    const reason = try stream.readEnum(Opcode.ClientBoundConnectionKickReason, .little);

    switch (reason) {
        .outdated_client => {},

        .cheat_detected => {},
    }
}
