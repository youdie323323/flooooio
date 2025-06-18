const std = @import("std");
const io = std.io;
const mem = std.mem;
const Clientbound = @import("Packet/Clientbound.zig");
const Serverbound = @import("Packet/Serverbound.zig");
const WebSocket = @import("../WebAssembly/Interop/WebSocket.zig").WebSocket;
const Timer = @import("../WebAssembly/Interop/Timer.zig");

const ClientWebSocket = @This();

const OwnContextWebSocket = WebSocket(*ClientWebSocket);

pub const DefaultPacketStream = io.FixedBufferStream([]const u8);

allocator: mem.Allocator,

socket: *OwnContextWebSocket = undefined,
clientbound: Clientbound,
serverbound: Serverbound,

prng: std.Random.DefaultPrng,

var fuzzing_ws: *OwnContextWebSocket = undefined;

var prev_fuzzing_timer: ?Timer.TimerId = null;

fn tryFuzz() callconv(.c) void {
    const random = fuzzing_ws.ctx.prng.random();
    const packet_type = random.intRangeAtMost(u8, 0, 8);

    switch (packet_type) {
        0 => {
            // Random movement
            const angle = std.math.tau * random.float(f32);
            const magnitude = random.float(f32);

            fuzzing_ws.ctx.serverbound.sendWaveChangeMove(angle, magnitude) catch {};
        },
        1 => {
            // Random mood
            const mood = random.intRangeAtMost(u8, 0, 255);

            fuzzing_ws.ctx.serverbound.sendWaveChangeMood(mood) catch {};
        },
        2 => {
            // Random petal swap
            const index = random.intRangeAtMost(u8, 0, 7);

            fuzzing_ws.ctx.serverbound.sendWaveSwapPetal(index) catch {};
        },
        3 => {
            // Random chat
            const messages = [_][]const u8{ "Hello!", "Test", "Fuzzing", "Random", "Message" };
            const msg = messages[random.intRangeAtMost(usize, 0, messages.len - 1)];

            fuzzing_ws.ctx.serverbound.sendWaveChat(msg) catch {};
        },
        4 => {
            // Random room create
            const biome = random.intRangeAtMost(u8, 0, 255);

            fuzzing_ws.ctx.serverbound.sendWaveRoomCreate(biome) catch {};
        },
        5 => {
            // Random room join
            const codes = [_][]const u8{ "ABCD", "EFGH", "IJKL", "MNOP", "abc-abcabc", "abc-141421" };
            const code = codes[random.intRangeAtMost(usize, 0, codes.len - 1)];

            fuzzing_ws.ctx.serverbound.sendWaveRoomJoin(code) catch {};
        },
        6 => {
            // Random ready state
            const state = random.intRangeAtMost(u8, 0, 1);

            fuzzing_ws.ctx.serverbound.sendWaveRoomChangeReady(state) catch {};
        },
        7 => {
            // Random visibility
            const visible = random.intRangeAtMost(u8, 0, 1);

            fuzzing_ws.ctx.serverbound.sendWaveRoomChangeVisible(visible) catch {};
        },
        8 => {
            // Random leave
            if (random.boolean()) {
                fuzzing_ws.ctx.serverbound.sendWaveLeave() catch {};
            } else {
                fuzzing_ws.ctx.serverbound.sendWaveRoomLeave() catch {};
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

        .clientbound = Clientbound.init(
            allocator,
            client,
        ),
        .serverbound = Serverbound.init(
            allocator,
            client,
        ),

        .prng = std.Random.DefaultPrng.init(@intCast(std.time.milliTimestamp())),
    };

    return client;
}

pub fn connect(self: *ClientWebSocket, host: []const u8) !void {
    const protocol =
        if (OwnContextWebSocket.isSecure())
            "wss://"
        else
            "ws://";

    const url = try std.fmt.allocPrint(self.allocator, "{s}{s}/ws", .{ protocol, host });
    defer self.allocator.free(url);

    self.socket = try OwnContextWebSocket.init(self, url);

    // {
    //     if (prev_fuzzing_timer) |id| Timer.clearInterval(id);
    //
    //     fuzzing_ws = self.socket;
    //
    //     prev_fuzzing_timer = Timer.setInterval(tryFuzz, 50);
    // }

    self.socket.on_message = onMessage;
    self.socket.on_open = onOpen;
}

pub fn deinit(self: *ClientWebSocket) void {
    self.socket.deinit();

    self.clientbound.deinit();
    self.serverbound.deinit();

    self.allocator.destroy(self);

    self.* = undefined;
}

fn onMessage(ws: *OwnContextWebSocket, data: []const u8) void {
    ws.ctx.clientbound.read(data) catch |err| std.debug.print("{}\n", .{err});
}

fn onOpen(ws: *OwnContextWebSocket) void {
    ws.ctx.serverbound.sendWaveRoomFindPublic(.garden) catch unreachable;
    ws.ctx.serverbound.sendWaveRoomChangeReady(.ready) catch unreachable;
}
