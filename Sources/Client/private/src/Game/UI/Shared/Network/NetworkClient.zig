const NetworkClient = @This();

const OwnContextWebSocket = WebSocket(*NetworkClient);

pub const DefaultPacketStream = io.FixedBufferStream([]const u8);

allocator: mem.Allocator,

socket: *OwnContextWebSocket = undefined,

/// WEBSOCKET protocol from server to client.
in: Clientbound,
/// WEBSOCKET protocol from client to server.
out: Serverbound,

pub fn init(allocator: mem.Allocator) !*NetworkClient {
    const client = try allocator.create(NetworkClient);
    errdefer allocator.destroy(client);

    client.* = .{
        .allocator = allocator,

        .in = try .init(
            allocator,
            client,
        ),
        .out = .init(
            allocator,
            client,
        ),
    };

    return client;
}

pub fn connect(self: *NetworkClient, host: []const u8) !void {
    const protocol =
        if (OwnContextWebSocket.isSecure())
            "wss://"
        else
            "ws://";

    const url = try std.fmt.allocPrint(self.allocator, "{s}{s}/ws", .{ protocol, host });
    defer self.allocator.free(url);

    self.socket = try .init(self, url);

    self.socket.on_message = onMessage;
    self.socket.on_open = onOpen;
}

pub fn deinit(self: *NetworkClient) void {
    self.socket.deinit();

    self.in.deinit();
    self.out.deinit();

    self.allocator.destroy(self);

    self.* = undefined;
}

fn onMessage(ws: *OwnContextWebSocket, data: []const u8) void {
    ws.ctx.in.read(data) catch return;
}

fn onOpen(ws: *OwnContextWebSocket) void {
    ws.ctx.out.sendWaveRoomFindPublic(.garden) catch return;
    ws.ctx.out.sendWaveRoomChangeReady(.ready) catch return;
}

const std = @import("std");
const io = std.io;
const mem = std.mem;

const Timer = @import("../../../Kernel/WebAssembly/Interop/Timer.zig");
const WebSocket = @import("../../../Kernel/WebAssembly/Interop/WebSocket.zig").WebSocket;
const Clientbound = @import("NetworkClientbound.zig");
const Serverbound = @import("NetworkServerbound.zig");