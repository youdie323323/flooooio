const std = @import("std");
const Opcode = @This();

pub const Serverbound = enum(u8) {
    wave_change_move,
    wave_change_mood,
    wave_swap_petal,

    wave_send_chat,

    wave_room_create,
    wave_room_join,
    wave_room_find_public,

    wave_room_change_ready,
    wave_room_change_visible,
    wave_room_change_name,

    wave_leave,
    wave_room_leave,

    ack,
};

pub const Clientbound = enum(u8) {
    wave_self_id,
    wave_room_self_id,

    wave_update,
    wave_room_update,

    wave_room_join_failed,

    wave_started,

    wave_chat_receiv,

    connection_kicked,
};

pub const ClientboundConnectionKickReason = enum(u8) {
    outdated_client,
    cheat_detected,
};

const kick_reason_messages = std.StaticStringMap([]const u8).initComptime(.{
    .{ @tagName(ClientboundConnectionKickReason.outdated_client), "Outdated client" },
    .{ @tagName(ClientboundConnectionKickReason.cheat_detected), "Cheat detected" },
});

pub inline fn getKickReasonMessage(reason: ClientboundConnectionKickReason) ?[]const u8 {
    return kick_reason_messages.get(@tagName(reason));
}
