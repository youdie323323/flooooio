const std = @import("std");
const Color = @This();

r: u8,
g: u8,
b: u8,

pub inline fn darkened(self: Color, comptime strength: f64) Color {
    const strength_c = comptime (1 - strength);

    return Color{
        .r = @floor(self.r * strength_c),
        .g = @floor(self.g * strength_c),
        .b = @floor(self.b * strength_c),
    };
}

pub inline fn lightened(self: Color, comptime strength: f64) Color {
    const strength_a = comptime (1 + strength);

    return Color{
        .r = @min(255, @floor(self.r * strength_a)),
        .g = @min(255, @floor(self.g * strength_a)),
        .b = @min(255, @floor(self.b * strength_a)),
    };
}

pub fn fromHex(comptime hex: *const [6:0]u8) Color {
    comptime {
        const r = std.fmt.parseInt(u8, hex[0..2], 16) catch unreachable;
        const g = std.fmt.parseInt(u8, hex[2..4], 16) catch unreachable;
        const b = std.fmt.parseInt(u8, hex[4..6], 16) catch unreachable;

        return Color{ .r = r, .g = g, .b = b };
    }
}
