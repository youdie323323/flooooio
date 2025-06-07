const std = @import("std");
const io = std.io;
const mem = std.mem;
const math = std.math;
const opcode = @import("./Opcode.zig");
const wr = @import("../../Florr/OwnNative/Wave/WaveRoom.zig");
const Biome = @import("../../Florr/Native/Biome.zig").Biome;
const pmood = @import("../../Entity/PlayerMood.zig");
const ClientWebSocket = @import("../ClientWebSocket.zig");

const Serverbound = @This();

pub const Writer = ClientWebSocket.DefaultPacketStream.Writer;

client: *ClientWebSocket,

pub fn init(
    _: mem.Allocator,
    client: *ClientWebSocket,
) Serverbound {
    return .{
        .client = client,
    };
}

pub fn deinit(self: *Serverbound) void {
    self.* = undefined;
}

inline fn calculateNormalizedAngle(angle: f32) f32 {
    const normalized = @mod(angle, math.tau);

    return (normalized / math.tau) * 255;
}

pub inline fn writeCString(stream: anytype, str: []const u8) !void {
    try stream.writeAll(str);
    try stream.writeByte(0);
}

var shared_buf: [512]u8 = undefined;

// Prepare fbs of shared_stringable_buffer
var shared_fbs = io.fixedBufferStream(&shared_buf);
var shared_stream = shared_fbs.writer();

pub inline fn send(self: Serverbound, buf: []const u8) !void {
    _ = try self.client.socket.send(buf);
}

pub fn sendWaveChangeMove(self: Serverbound, angle: f32, magnitude: f32) !void {
    try shared_stream.writeByte(@intFromEnum(opcode.Serverbound.wave_change_move));

    try shared_stream.writeByte(@intFromFloat(@round(calculateNormalizedAngle(angle))));
    try shared_stream.writeByte(@intFromFloat(@round(magnitude * 255)));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveChangeMood(self: Serverbound, set: pmood.MoodBitSet) !void {
    try shared_stream.writeByte(@intFromEnum(opcode.Serverbound.wave_change_mood));

    try shared_stream.writeByte(@intCast(set.mask));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveSwapPetal(self: Serverbound, index: u8) !void {
    try shared_stream.writeByte(@intFromEnum(opcode.Serverbound.wave_swap_petal));

    try shared_stream.writeByte(index);

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveChat(self: Serverbound, message: []const u8) !void {
    try shared_stream.writeByte(@intFromEnum(opcode.Serverbound.wave_send_chat));

    try writeCString(&shared_stream, message);

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomCreate(self: Serverbound, biome: Biome) !void {
    try shared_stream.writeByte(@intFromEnum(opcode.Serverbound.wave_room_create));

    try shared_stream.writeByte(@intFromEnum(biome));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomJoin(self: Serverbound, code: []const u8) !void {
    try shared_stream.writeByte(@intFromEnum(opcode.Serverbound.wave_room_join));

    try writeCString(&shared_stream, code);

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomFindPublic(self: Serverbound, biome: Biome) !void {
    try shared_stream.writeByte(@intFromEnum(opcode.Serverbound.wave_room_find_public));

    try shared_stream.writeByte(@intFromEnum(biome));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomChangeReady(self: Serverbound, state: wr.PlayerReadyState) !void {
    try shared_stream.writeByte(@intFromEnum(opcode.Serverbound.wave_room_change_ready));

    try shared_stream.writeByte(@intFromEnum(state));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomChangeVisible(self: Serverbound, state: wr.VisibleState) !void {
    try shared_stream.writeByte(@intFromEnum(opcode.Serverbound.wave_room_change_visible));

    try shared_stream.writeByte(@intFromEnum(state));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomChangeName(self: Serverbound, name: []const u8) !void {
    try shared_stream.writeByte(@intFromEnum(opcode.Serverbound.wave_room_change_name));

    try writeCString(&shared_stream, name);

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveLeave(self: Serverbound) !void {
    try shared_stream.writeByte(@intFromEnum(opcode.Serverbound.wave_leave));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}

pub fn sendWaveRoomLeave(self: Serverbound) !void {
    try shared_stream.writeByte(@intFromEnum(opcode.Serverbound.wave_room_leave));

    try self.send(shared_fbs.getWritten());

    shared_fbs.reset();
}
