const std = @import("std");
const mem = std.mem;

fn stemWindows(path: []const u8) []const u8 {
    const filename = std.fs.path.basenameWindows(path);
    const index = mem.lastIndexOfScalar(u8, filename, '.') orelse return filename[0..];
    if (index == 0) return path;
    return filename[0..index];
}

pub fn log(
    comptime src: std.builtin.SourceLocation,
    comptime message_level: std.log.Level,
    comptime format: []const u8,
    args: anytype,
) void {
    if (comptime !std.log.logEnabled(message_level, .default)) return;

    const level_txt = comptime ("(" ++ message_level.asText() ++ "): ");

    const now = std.time.timestamp();

    const hours: u8 = @intCast(@divTrunc(@mod(now, 86400), 3600));
    const minutes: u8 = @intCast(@divTrunc(@mod(now, 3600), 60));
    const seconds: u8 = @intCast(@mod(now, 60));

    var buf: [2 + 1 + 2 + 1 + 2 + 1]u8 = undefined;

    const now_string = std.fmt.bufPrint(&buf, "{d:0>2}:{d:0>2}:{d:0>2} ", .{ hours, minutes, seconds }) catch return;

    // Flooooio does implement each zig file name as struct name, so this is best way to extract struct name
    const file_name = comptime stemWindows(src.file);

    const prefix2 =
        comptime std.fmt.comptimePrint("[{s}::{s}] ", .{ file_name, src.fn_name });

    const stderr = std.io.getStdErr().writer();
    
    var bw = std.io.bufferedWriter(stderr);
    const writer = bw.writer();

    std.debug.lockStdErr();
    defer std.debug.unlockStdErr();

    nosuspend {
        writer.print(comptime (level_txt ++ prefix2), .{}) catch return;
        writer.writeAll(now_string) catch return;
        writer.print(format ++ "\n", args) catch return;

        bw.flush() catch return;
    }
}
