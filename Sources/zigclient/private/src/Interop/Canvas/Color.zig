const std = @import("std");
const Color = @This();

const Rgb = @Vector(3, u8);

const max_u8_vector = Rgb{ 255, 255, 255 };

rgb: Rgb,

pub inline fn darkened(self: Color, comptime strength: f32) Color {
    comptime std.debug.assert(strength <= 1);

    const strength_c = comptime @as(Rgb, @splat(1 - strength));

    return Color{ .rgb = self.rgb * strength_c };
}

pub inline fn lightened(self: Color, comptime strength: f32) Color {
    comptime std.debug.assert(strength > 0);

    const strength_a = comptime @as(Rgb, @splat(1 + strength));

    const result = @mulWithOverflow(self.rgb, strength_a);
    if (result[1]) return max_u8_vector;

    return Color{ .rgb = result[0] };
}

pub fn fromHex(comptime hex: *const [6:0]u8) Color {
    comptime {
        const r = std.fmt.parseInt(u8, hex[0..2], 16) catch unreachable;
        const g = std.fmt.parseInt(u8, hex[2..4], 16) catch unreachable;
        const b = std.fmt.parseInt(u8, hex[4..6], 16) catch unreachable;

        return Color{ .rgb = Rgb{ r, g, b } };
    }
}
