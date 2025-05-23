const std = @import("std");
const Opcode = @This();

pub const ServerBound = enum(u8) {
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
};

pub const ClientBound = enum(u8) {
    wave_self_id,
    wave_room_self_id,

    wave_update,
    wave_room_update,

    wave_room_join_failed,

    wave_started,

    wave_chat_receiv,

    connection_kicked,
};

pub const ClientBoundConnectionKickReason = enum(u8) {
    outdated_client,
    cheat_detected,
};

pub const display_kick_reason = std.StaticStringMap([]const u8).initComptime(.{
    .{ "outdated_client", "Outdated client" },
    .{ "cheat_detected", "Cheat detected" },
});
