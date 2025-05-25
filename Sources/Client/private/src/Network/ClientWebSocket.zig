const std = @import("std");
const io = std.io;
const mem = std.mem;
const ClientBound = @import("./Packet/ClientBound.zig");
const ServerBound = @import("./Packet/ServerBound.zig");
const WebSocket = @import("../WebAssembly/Interop/WebSocket.zig").WebSocket;
const Timer = @import("../WebAssembly/Interop/Timer.zig");

const ClientWebSocket = @This();

const OwnContextWebSocket = WebSocket(*ClientWebSocket);

pub const DefaultPacketStream = io.FixedBufferStream([]const u8);

allocator: mem.Allocator,

socket: *OwnContextWebSocket = undefined,
packet_handler: ClientBound,
packet_writer: ServerBound,

prng: std.Random.DefaultPrng,

var fuzzing_ws: *OwnContextWebSocket = undefined;

var prev_fuzzing_timer: ?Timer.TimerID = null;

fn tryFuzz() callconv(.c) void {
    const random = fuzzing_ws.ctx.prng.random();
    const packet_type = random.intRangeAtMost(u8, 0, 8);

    switch (packet_type) {
        0 => {
            // Random movement
            const angle = random.float(f32) * std.math.tau;
            const magnitude = random.float(f32);

            fuzzing_ws.ctx.packet_writer.sendWaveChangeMove(angle, magnitude) catch {};
        },
        1 => {
            // Random mood
            const mood = random.intRangeAtMost(u8, 0, 255);

            fuzzing_ws.ctx.packet_writer.sendWaveChangeMood(mood) catch {};
        },
        2 => {
            // Random petal swap
            const index = random.intRangeAtMost(u8, 0, 7);

            fuzzing_ws.ctx.packet_writer.sendWaveSwapPetal(index) catch {};
        },
        3 => {
            // Random chat
            const messages = [_][]const u8{ "Hello!", "Test", "Fuzzing", "Random", "Message" };
            const msg = messages[random.intRangeAtMost(usize, 0, messages.len - 1)];

            fuzzing_ws.ctx.packet_writer.sendWaveChat(msg) catch {};
        },
        4 => {
            // Random room create
            const biome = random.intRangeAtMost(u8, 0, 255);

            fuzzing_ws.ctx.packet_writer.sendWaveRoomCreate(biome) catch {};
        },
        5 => {
            // Random room join
            const codes = [_][]const u8{ "ABCD", "EFGH", "IJKL", "MNOP" };
            const code = codes[random.intRangeAtMost(usize, 0, codes.len - 1)];

            fuzzing_ws.ctx.packet_writer.sendWaveRoomJoin(code) catch {};
        },
        6 => {
            // Random ready state
            const state = random.intRangeAtMost(u8, 0, 1);

            fuzzing_ws.ctx.packet_writer.sendWaveRoomChangeReady(state) catch {};
        },
        7 => {
            // Random visibility
            const visible = random.intRangeAtMost(u8, 0, 1);

            fuzzing_ws.ctx.packet_writer.sendWaveRoomChangeVisible(visible) catch {};
        },
        8 => {
            // Random leave
            if (random.boolean()) {
                fuzzing_ws.ctx.packet_writer.sendWaveLeave() catch {};
            } else {
                fuzzing_ws.ctx.packet_writer.sendWaveRoomLeave() catch {};
            }
        },
        else => unreachable,
    }
}

pub fn init(allocator: mem.Allocator) !*ClientWebSocket {
    const client = try allocator.create(ClientWebSocket);
    errdefer allocator.destroy(client);

    client.* = .{
        .allocator = allocator,

        .packet_handler = ClientBound.init(
            allocator,
            client,
        ),
        .packet_writer = ServerBound.init(client),

        .prng = std.Random.DefaultPrng.init(@intCast(std.time.milliTimestamp())),
    };

    return client;
}

pub fn connect(self: *ClientWebSocket, host: []const u8) !void {
    const protocol = if (OwnContextWebSocket.isSecure()) "wss://" else "ws://";
    const url = try std.fmt.allocPrint(self.allocator, "{s}{s}/ws", .{ protocol, host });
    defer self.allocator.free(url);

    self.socket = try OwnContextWebSocket.init(self, url);

    {
        if (prev_fuzzing_timer) |id| Timer.clearInterval(id);

        fuzzing_ws = self.socket;

        prev_fuzzing_timer = Timer.setInterval(tryFuzz, 50);
    }

    self.socket.on_message = onMessage;
}

pub fn deinit(self: *ClientWebSocket) void {
    self.socket.deinit();

    self.packet_handler.deinit();
    self.packet_writer.deinit();

    self.allocator.destroy(self);

    self.* = undefined;
}

fn onMessage(ws: *OwnContextWebSocket, data: []const u8) void {
    ws.ctx.packet_handler.read(data) catch unreachable;
}
