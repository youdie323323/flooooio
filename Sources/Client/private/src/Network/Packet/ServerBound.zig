const std = @import("std");
const io = std.io;
const mem = std.mem;
const math = std.math;
const Opcode = @import("./Opcode.zig");
const ClientWebSocket = @import("../ClientWebSocket.zig");

const ServerBound = @This();

const PacketLayouts = struct {
    /// Constant which represents an empty structure field.
    pub const empty: std.builtin.Type.StructField = .{
        .name = "",
        .type = undefined,
        .default_value_ptr = null,
        .is_comptime = false,
        .alignment = 0,
    };

    /// Ensures the type matches the wanted type kind
    pub inline fn ensure(comptime T: type, comptime kind: std.builtin.TypeId) ?std.meta.TagPayload(std.builtin.Type, kind) {
        return if (@typeInfo(T) == kind) @field(@typeInfo(T), @tagName(kind)) else null;
    }

    /// Returns the index of the field by name which is in an array of structure fields.
    /// If the field cannot be found, returns null.
    pub fn indexByName(comptime fields: []const std.builtin.Type.StructField, name: []const u8) ?usize {
        for (fields, 0..) |field, i| {
            if (std.mem.eql(u8, field.name, name)) return i;
        }

        return null;
    }

    /// Mixes fields from structure extend into structure super.
    pub fn Mix(comptime Super: type, comptime Extend: type) type {
        const superInfo = ensure(Super, .@"struct") orelse @panic("Super type must be a struct");
        const extendInfo = ensure(Extend, .@"struct") orelse @panic("Extend type must be a struct");

        if (extendInfo.layout != superInfo.layout) @compileError("Super and extend struct layouts must be the same");
        if (extendInfo.backing_integer != superInfo.backing_integer) @compileError("Super and extend struct backing integers must be the same");

        var totalFields = superInfo.fields.len;

        for (extendInfo.fields) |field| {
            if (indexByName(superInfo.fields, field.name) == null) totalFields += 1;
        }

        var fields: [totalFields]std.builtin.Type.StructField = [_]std.builtin.Type.StructField{empty} ** totalFields;

        for (superInfo.fields, 0..) |src, i| {
            fields[i] = src;
        }

        var i: usize = 0;

        for (extendInfo.fields) |src| {
            const index = indexByName(&fields, src.name) orelse blk: {
                i += 1;

                break :blk (i + superInfo.fields.len - 1);
            };

            fields[index] = src;
        }

        return @Type(.{
            .@"struct" = .{
                .layout = superInfo.layout,
                .backing_integer = superInfo.backing_integer,
                .fields = &fields,
                .decls = &.{},
                .is_tuple = false,
            },
        });
    }

    fn OpcodeMixin(comptime op: Opcode.ServerBound, comptime T: type) type {
        return Mix(
            extern struct {
                opcode: Opcode.ServerBound = op,
            },
            T,
        );
    }

    pub const WaveChangeMovePacket = OpcodeMixin(.wave_change_move, extern struct {
        angle: u8,
        magnitude: u8,
    });

    pub const WaveChangeMoodPacket = OpcodeMixin(.wave_change_mood, extern struct {
        flag: u8,
    });

    pub const WaveSwapPetalPacket = OpcodeMixin(.wave_swap_petal, extern struct {
        index: u8,
    });

    pub const WaveRoomCreatePacket = OpcodeMixin(.wave_room_create, extern struct {
        biome: u8,
    });

    pub const WaveRoomFindPublicPacket = OpcodeMixin(.wave_room_find_public, extern struct {
        biome: u8,
    });

    pub const WaveRoomChangeReadyPacket = OpcodeMixin(.wave_room_change_ready, extern struct {
        state: u8,
    });

    pub const WaveRoomChangeVisiblePacket = OpcodeMixin(.wave_room_change_visible, extern struct {
        state: u8,
    });

    pub const WaveLeavePacket = OpcodeMixin(.wave_leave, extern struct {});

    pub const WaveRoomLeavePacket = OpcodeMixin(.wave_room_leave, extern struct {});
};

client: *ClientWebSocket,

pub fn init(client: *ClientWebSocket) ServerBound {
    return .{
        .client = client,
    };
}

pub fn deinit(_: ServerBound) void {}

inline fn calculateNormalizedAngle(angle: f32) f32 {
    const normalized = @mod(angle, math.tau);

    return (normalized / math.tau) * 255;
}

pub fn writeCString(stream: anytype, text: []const u8) !void {
    try stream.writeAll(text);
    try stream.writeByte(0);
}

var shared_buffer: [1024]u8 = undefined;

pub inline fn send(self: ServerBound, buf: []const u8) !void {
    _ = try self.client.socket.send(buf);
}

pub fn sendWaveChangeMove(self: ServerBound, angle: f32, magnitude: f32) !void {
    const packet: PacketLayouts.WaveChangeMovePacket = .{
        .angle = @intFromFloat(@round(calculateNormalizedAngle(angle))),
        .magnitude = @intFromFloat(@round(magnitude * 255)),
    };

    try self.send(std.mem.asBytes(&packet));
}

pub fn sendWaveChangeMood(self: ServerBound, flag: u8) !void {
    const packet: PacketLayouts.WaveChangeMoodPacket = .{ .flag = flag };

    try self.send(std.mem.asBytes(&packet));
}

pub fn sendWaveSwapPetal(self: ServerBound, index: u8) !void {
    const packet: PacketLayouts.WaveSwapPetalPacket = .{ .index = index };

    try self.send(std.mem.asBytes(&packet));
}

pub fn sendWaveChat(self: ServerBound, message: []const u8) !void {
    var fbs = io.fixedBufferStream(&shared_buffer);
    var stream = fbs.writer();

    try stream.writeByte(@intFromEnum(Opcode.ServerBound.wave_send_chat));
    try writeCString(&stream, message);

    try self.send(fbs.getWritten());
}

pub fn sendWaveRoomCreate(self: ServerBound, biome: u8) !void {
    const packet: PacketLayouts.WaveRoomCreatePacket = .{ .biome = biome };

    try self.send(std.mem.asBytes(&packet));
}

pub fn sendWaveRoomJoin(self: ServerBound, code: []const u8) !void {
    var fbs = io.fixedBufferStream(&shared_buffer);
    var stream = fbs.writer();

    try stream.writeByte(@intFromEnum(Opcode.ServerBound.wave_room_join));
    try writeCString(&stream, code);

    try self.send(fbs.getWritten());
}

pub fn sendWaveRoomFindPublic(self: ServerBound, biome: u8) !void {
    const packet: PacketLayouts.WaveRoomFindPublicPacket = .{ .biome = biome };

    try self.send(std.mem.asBytes(&packet));
}

pub fn sendWaveRoomChangeReady(self: ServerBound, state: u8) !void {
    const packet: PacketLayouts.WaveRoomChangeReadyPacket = .{ .state = state };

    try self.send(std.mem.asBytes(&packet));
}

pub fn sendWaveRoomChangeVisible(self: ServerBound, state: u8) !void {
    const packet: PacketLayouts.WaveRoomChangeVisiblePacket = .{ .state = state };

    try self.send(std.mem.asBytes(&packet));
}

pub fn sendWaveRoomChangeName(self: ServerBound, name: []const u8) !void {
    var fbs = io.fixedBufferStream(&shared_buffer);
    var stream = fbs.writer();

    try stream.writeByte(@intFromEnum(Opcode.ServerBound.wave_room_change_name));
    try writeCString(&stream, name);

    try self.send(fbs.getWritten());
}

pub fn sendWaveLeave(self: ServerBound) !void {
    const packet: PacketLayouts.WaveLeavePacket = .{};

    try self.send(std.mem.asBytes(&packet));
}

pub fn sendWaveRoomLeave(self: ServerBound) !void {
    const packet: PacketLayouts.WaveRoomLeavePacket = .{};

    try self.send(std.mem.asBytes(&packet));
}
