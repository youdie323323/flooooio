const Serverbound = @This();

pub const Writer = Client.DefaultPacketStream.Writer;

client: *Client,

pub fn init(
    _: mem.Allocator,
    client: *Client,
) Serverbound {
    return .{
        .client = client,
    };
}

pub fn deinit(self: *Serverbound) void {
    self.* = undefined;
}

pub fn writeCString(stream: *Writer, str: []const u8) !void {
    try stream.writeAll(str);
    try stream.writeByte(0);
}

var shared_buf: [256]u8 = undefined;

// Prepare fbs of shared_buf
var shared_fbs = io.fixedBufferStream(&shared_buf);
var shared_stream = shared_fbs.writer();

pub fn send(self: *const Serverbound, buf: []const u8) !void {
    _ = self.client.socket.send(buf);
}

fn normalizeAngle(angle: f32) f32 {
    const normalized = @mod(angle, math.tau);

    return (normalized / math.tau) * 255;
}

pub fn sendWaveChangeMove(self: *const Serverbound, angle: f32, magnitude: f32) !void {
    try shared_stream.writeByte(comptime @intFromEnum(Opcode.Serverbound.wave_change_move));

    try shared_stream.writeByte(@intFromFloat(@round(normalizeAngle(angle))));
    try shared_stream.writeByte(@intFromFloat(@round(magnitude * 255)));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveChangeMood(self: *const Serverbound, set: PlayerMood.MoodBitSet) !void {
    try shared_stream.writeByte(comptime @intFromEnum(Opcode.Serverbound.wave_change_mood));

    try shared_stream.writeByte(@intCast(set.mask));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveSwapPetal(self: *const Serverbound, index: u8) !void {
    try shared_stream.writeByte(comptime @intFromEnum(Opcode.Serverbound.wave_swap_petal));

    try shared_stream.writeByte(index);

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveChat(self: *const Serverbound, message: []const u8) !void {
    try shared_stream.writeByte(comptime @intFromEnum(Opcode.Serverbound.wave_send_chat));

    try writeCString(&shared_stream, message);

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomCreate(self: *const Serverbound, biome: Biome) !void {
    try shared_stream.writeByte(comptime @intFromEnum(Opcode.Serverbound.wave_room_create));

    try shared_stream.writeByte(@intFromEnum(biome));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomJoin(self: *const Serverbound, code: []const u8) !void {
    try shared_stream.writeByte(comptime @intFromEnum(Opcode.Serverbound.wave_room_join));

    try writeCString(&shared_stream, code);

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomFindPublic(self: *const Serverbound, biome: Biome) !void {
    try shared_stream.writeByte(comptime @intFromEnum(Opcode.Serverbound.wave_room_find_public));

    try shared_stream.writeByte(@intFromEnum(biome));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomChangeReady(self: *const Serverbound, state: Wr.PlayerReadyState) !void {
    try shared_stream.writeByte(comptime @intFromEnum(Opcode.Serverbound.wave_room_change_ready));

    try shared_stream.writeByte(@intFromEnum(state));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomChangeVisible(self: *const Serverbound, state: Wr.Visibility) !void {
    try shared_stream.writeByte(comptime @intFromEnum(Opcode.Serverbound.wave_room_change_visible));

    try shared_stream.writeByte(@intFromEnum(state));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomChangeName(self: *const Serverbound, name: []const u8) !void {
    try shared_stream.writeByte(comptime @intFromEnum(Opcode.Serverbound.wave_room_change_name));

    try writeCString(&shared_stream, name);

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveLeave(self: *const Serverbound) !void {
    try shared_stream.writeByte(comptime @intFromEnum(Opcode.Serverbound.wave_leave));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomLeave(self: *const Serverbound) !void {
    try shared_stream.writeByte(comptime @intFromEnum(Opcode.Serverbound.wave_room_leave));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendAck(self: *const Serverbound, width: u16, height: u16) !void {
    try shared_stream.writeByte(comptime @intFromEnum(Opcode.Serverbound.ack));

    try shared_stream.writeInt(u16, width, .little);
    try shared_stream.writeInt(u16, height, .little);

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

const std = @import("std");
const io = std.io;
const mem = std.mem;
const math = std.math;
const leb = std.leb;

const Network = @import("Network.zig");
const Client = Network.Client;
const Opcode = Network.Opcode;

const Wr = @import("../Wave/WaveRoom.zig");
const Biome = @import("../../../Florr/Native/Biome.zig").Biome;
const PlayerMood = @import("../Entity/PlayerMood.zig");

