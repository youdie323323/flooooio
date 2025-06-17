const std = @import("std");
const ascii = std.ascii;
const debug = std.debug;
const mem = std.mem;
const math = std.math;

const Color = @This();

const Rgb = @Vector(3, u8);

const FloatingRgb = @Vector(3, f32);

/// Converts f32 rgb to u8 rgb.
inline fn toRgb(frgb: FloatingRgb) Rgb {
    return @intFromFloat(frgb);
}

/// Converts u8 rgb to f32 rgb.
inline fn toFloatingRgb(rgb: Rgb) FloatingRgb {
    return @floatFromInt(rgb);
}

const white = comptimeFromCSSColorName("white").rgb;

const fwhite = toFloatingRgb(white);

rgb: Rgb,

pub inline fn init(rgb: Rgb) Color {
    return .{ .rgb = rgb };
}

inline fn mulSafe(self: Color, comptime strength: FloatingRgb) Rgb {
    const result = toFloatingRgb(self.rgb) * strength;

    // Clamping lower bound redundant here since xy (x >= 0, y >= 0) always >= 0.

    return toRgb(@min(result, fwhite));
}

test "mulSafe @select vs @min" {
    var i: usize = 0;
    const iterations = 10000000;

    var timer = try std.time.Timer.start();

    var total_select: u64 = 0;
    var total_min: u64 = 0;

    var prng = std.Random.DefaultPrng.init(0);
    var random = prng.random();

    while (i < iterations) : (i += 1) {
        const result: FloatingRgb = .{ random.float(f32), random.float(f32), random.float(f32) };

        {
            timer.reset();

            _ = @select(
                f32,
                result > fwhite,
                fwhite,
                result,
            );

            total_select += timer.read();
        }

        {
            timer.reset();

            _ = @min(result, fwhite);

            total_min += timer.read();
        }
    }

    const avg_select = @as(f64, @floatFromInt(total_select)) / @as(f64, @floatFromInt(iterations));
    const avg_min = @as(f64, @floatFromInt(total_min)) / @as(f64, @floatFromInt(iterations));

    std.debug.print("Average time for @select: {d:.2} ns\n", .{avg_select});
    std.debug.print("Average time for @min: {d:.2} ns\n", .{avg_min});
    std.debug.print("Ratio (select/min): {d:.2}\n", .{avg_select / avg_min});
}

pub inline fn darkened(self: Color, comptime strength: f32) Color {
    comptime debug.assert(strength <= 1);

    const strength_c: FloatingRgb = comptime @splat(1 - strength);

    return init(self.mulSafe(strength_c));
}

pub inline fn lightened(self: Color, comptime strength: f32) Color {
    comptime debug.assert(strength > 0);

    const strength_a: FloatingRgb = comptime @splat(1 + strength);

    return init(self.mulSafe(strength_a));
}

/// Interpolate between two colors.
pub inline fn interpolate(self: Color, other: Color, t: f32) Color {
    return init(
        toRgb(
            math.lerp(
                toFloatingRgb(self.rgb),
                toFloatingRgb(other.rgb),
                @as(FloatingRgb, @splat(t)),
            ),
        ),
    );
}

/// N-dimensionally interpolates colors.
pub fn multiColorInterpolate(colors: []const Color, t: f32) Color {
    const last = colors.len - 1;

    const segment = t * @as(f32, @floatFromInt(last));
    const index = @floor(segment);

    const index_usize: usize = @intFromFloat(index);

    if (index_usize >= last) return colors[last];

    return interpolate(colors[index_usize], colors[index_usize + 1], segment - index);
}

pub fn comptimeFromAnyString(comptime str: []const u8) Color {
    comptime {
        if (str.len == 0) @compileError("fromAnyString not valid with empty string");

        if (comptimeIsValidHexColorCode(str)) return comptimeFromHexColorCode(str);

        if (comptimeIsValidRgbString(str)) return comptimeFromRgbString(str);

        return comptimeFromCSSColorName(str);
    }
}

const HexColorCode = *const ["#abcdef".len]u8;

const HexColor = u24;

inline fn comptimeIsValidHexColorCode(comptime code: HexColorCode) bool {
    comptime {
        // Checking length here is redundant because already constrained with type
        return mem.startsWith(u8, code, "#") and for (code[1..]) |c| {
            if (!std.ascii.isHex(c)) break false;
        } else true;
    }
}

/// Convert hex color code to Color.
pub fn comptimeFromHexColorCode(comptime code: HexColorCode) Color {
    comptime {
        if (!comptimeIsValidHexColorCode(code)) @compileError("color code " ++ code ++ " is not valid");

        const value = std.fmt.parseInt(HexColor, code[1..], 16) catch
            @compileError("invalid hex color: " ++ code);

        return comptimeFromHex(value);
    }
}

/// Convert u24 representation of color code to Color.
pub fn comptimeFromHex(comptime hex: HexColor) Color {
    comptime {
        const r: u8 = (hex >> 16) & 0xFF;
        const g: u8 = (hex >> 8) & 0xFF;
        const b: u8 = hex & 0xFF;

        return init(.{ r, g, b });
    }
}

const minimum_required_rgb_string_length = "rgb(r,g,b)".len;

inline fn comptimeIsValidRgbString(comptime str: []const u8) bool {
    comptime {
        return str.len >= minimum_required_rgb_string_length and mem.startsWith(u8, str, "rgb(") and str[str.len - 1] == ')';
    }
}

/// Convert rgb string to Color.
pub fn comptimeFromRgbString(comptime str: []const u8) Color {
    comptime {
        if (!comptimeIsValidRgbString(str)) @compileError("rgb string " ++ str ++ " is not valid");

        const content = str[4 .. str.len - 1];

        var iter = mem.tokenizeScalar(u8, content, ',');

        const r = std.fmt.parseInt(u8, mem.trim(u8, iter.next() orelse
            @compileError("missing r value"), " "), 10) catch
            @compileError("invalid r value");

        const g = std.fmt.parseInt(u8, mem.trim(u8, iter.next() orelse
            @compileError("missing g value"), " "), 10) catch
            @compileError("invalid g value");

        const b = std.fmt.parseInt(u8, mem.trim(u8, iter.next() orelse
            @compileError("missing b value"), " "), 10) catch
            @compileError("invalid b value");

        return init(.{ r, g, b });
    }
}

const css_name_map = std.StaticStringMap(HexColor).initComptime(.{
    .{ "aliceblue", 0xf0f8ff },
    .{ "antiquewhite", 0xfaebd7 },
    .{ "aqua", 0x00ffff },
    .{ "aquamarine", 0x7fffd4 },
    .{ "azure", 0xf0ffff },
    .{ "beige", 0xf5f5dc },
    .{ "bisque", 0xffe4c4 },
    .{ "black", 0x000000 },
    .{ "blanchedalmond", 0xffebcd },
    .{ "blue", 0x0000ff },
    .{ "blueviolet", 0x8a2be2 },
    .{ "brown", 0xa52a2a },
    .{ "burlywood", 0xdeb887 },
    .{ "cadetblue", 0x5f9ea0 },
    .{ "chartreuse", 0x7fff00 },
    .{ "chocolate", 0xd2691e },
    .{ "coral", 0xff7f50 },
    .{ "cornflowerblue", 0x6495ed },
    .{ "cornsilk", 0xfff8dc },
    .{ "crimson", 0xdc143c },
    .{ "cyan", 0x00ffff },
    .{ "darkblue", 0x00008b },
    .{ "darkcyan", 0x008b8b },
    .{ "darkgoldenrod", 0xb8860b },
    .{ "darkgray", 0xa9a9a9 },
    .{ "darkgreen", 0x006400 },
    .{ "darkgrey", 0xa9a9a9 },
    .{ "darkkhaki", 0xbdb76b },
    .{ "darkmagenta", 0x8b008b },
    .{ "darkolivegreen", 0x556b2f },
    .{ "darkorange", 0xff8c00 },
    .{ "darkorchid", 0x9932cc },
    .{ "darkred", 0x8b0000 },
    .{ "darksalmon", 0xe9967a },
    .{ "darkseagreen", 0x8fbc8f },
    .{ "darkslateblue", 0x483d8b },
    .{ "darkslategray", 0x2f4f4f },
    .{ "darkslategrey", 0x2f4f4f },
    .{ "darkturquoise", 0x00ced1 },
    .{ "darkviolet", 0x9400d3 },
    .{ "deeppink", 0xff1493 },
    .{ "deepskyblue", 0x00bfff },
    .{ "dimgray", 0x696969 },
    .{ "dimgrey", 0x696969 },
    .{ "dodgerblue", 0x1e90ff },
    .{ "firebrick", 0xb22222 },
    .{ "floralwhite", 0xfffaf0 },
    .{ "forestgreen", 0x228b22 },
    .{ "fuchsia", 0xff00ff },
    .{ "gainsboro", 0xdcdcdc },
    .{ "ghostwhite", 0xf8f8ff },
    .{ "goldenrod", 0xdaa520 },
    .{ "gold", 0xffd700 },
    .{ "gray", 0x808080 },
    .{ "green", 0x008000 },
    .{ "greenyellow", 0xadff2f },
    .{ "grey", 0x808080 },
    .{ "honeydew", 0xf0fff0 },
    .{ "hotpink", 0xff69b4 },
    .{ "indianred", 0xcd5c5c },
    .{ "indigo", 0x4b0082 },
    .{ "ivory", 0xfffff0 },
    .{ "khaki", 0xf0e68c },
    .{ "lavenderblush", 0xfff0f5 },
    .{ "lavender", 0xe6e6fa },
    .{ "lawngreen", 0x7cfc00 },
    .{ "lemonchiffon", 0xfffacd },
    .{ "lightblue", 0xadd8e6 },
    .{ "lightcoral", 0xf08080 },
    .{ "lightcyan", 0xe0ffff },
    .{ "lightgoldenrodyellow", 0xfafad2 },
    .{ "lightgray", 0xd3d3d3 },
    .{ "lightgreen", 0x90ee90 },
    .{ "lightgrey", 0xd3d3d3 },
    .{ "lightpink", 0xffb6c1 },
    .{ "lightsalmon", 0xffa07a },
    .{ "lightseagreen", 0x20b2aa },
    .{ "lightskyblue", 0x87cefa },
    .{ "lightslategray", 0x778899 },
    .{ "lightslategrey", 0x778899 },
    .{ "lightsteelblue", 0xb0c4de },
    .{ "lightyellow", 0xffffe0 },
    .{ "lime", 0x00ff00 },
    .{ "limegreen", 0x32cd32 },
    .{ "linen", 0xfaf0e6 },
    .{ "magenta", 0xff00ff },
    .{ "maroon", 0x800000 },
    .{ "mediumaquamarine", 0x66cdaa },
    .{ "mediumblue", 0x0000cd },
    .{ "mediumorchid", 0xba55d3 },
    .{ "mediumpurple", 0x9370db },
    .{ "mediumseagreen", 0x3cb371 },
    .{ "mediumslateblue", 0x7b68ee },
    .{ "mediumspringgreen", 0x00fa9a },
    .{ "mediumturquoise", 0x48d1cc },
    .{ "mediumvioletred", 0xc71585 },
    .{ "midnightblue", 0x191970 },
    .{ "mintcream", 0xf5fffa },
    .{ "mistyrose", 0xffe4e1 },
    .{ "moccasin", 0xffe4b5 },
    .{ "navajowhite", 0xffdead },
    .{ "navy", 0x000080 },
    .{ "oldlace", 0xfdf5e6 },
    .{ "olive", 0x808000 },
    .{ "olivedrab", 0x6b8e23 },
    .{ "orange", 0xffa500 },
    .{ "orangered", 0xff4500 },
    .{ "orchid", 0xda70d6 },
    .{ "palegoldenrod", 0xeee8aa },
    .{ "palegreen", 0x98fb98 },
    .{ "paleturquoise", 0xafeeee },
    .{ "palevioletred", 0xdb7093 },
    .{ "papayawhip", 0xffefd5 },
    .{ "peachpuff", 0xffdab9 },
    .{ "peru", 0xcd853f },
    .{ "pink", 0xffc0cb },
    .{ "plum", 0xdda0dd },
    .{ "powderblue", 0xb0e0e6 },
    .{ "purple", 0x800080 },
    .{ "red", 0xff0000 },
    .{ "rosybrown", 0xbc8f8f },
    .{ "royalblue", 0x4169e1 },
    .{ "saddlebrown", 0x8b4513 },
    .{ "salmon", 0xfa8072 },
    .{ "sandybrown", 0xf4a460 },
    .{ "seagreen", 0x2e8b57 },
    .{ "seashell", 0xfff5ee },
    .{ "sienna", 0xa0522d },
    .{ "silver", 0xc0c0c0 },
    .{ "skyblue", 0x87ceeb },
    .{ "slateblue", 0x6a5acd },
    .{ "slategray", 0x708090 },
    .{ "slategrey", 0x708090 },
    .{ "snow", 0xfffafa },
    .{ "springgreen", 0x00ff7f },
    .{ "steelblue", 0x4682b4 },
    .{ "tan", 0xd2b48c },
    .{ "teal", 0x008080 },
    .{ "thistle", 0xd8bfd8 },
    .{ "tomato", 0xff6347 },
    .{ "turquoise", 0x40e0d0 },
    .{ "violet", 0xee82ee },
    .{ "wheat", 0xf5deb3 },
    .{ "white", 0xffffff },
    .{ "whitesmoke", 0xf5f5f5 },
    .{ "yellow", 0xffff00 },
    .{ "yellowgreen", 0x9acd32 },
});

/// Returns a Color based on its CSS color name.
/// Color sources taken from W3C wiki:
/// https://www.w3.org/wiki/CSS/Properties/color/keywords
pub fn comptimeFromCSSColorName(comptime name: []const u8) Color {
    comptime {
        if (name.len == 0) @compileError("empty name not allowed for fromName");

        if (css_name_map.get(name)) |color| return comptimeFromHex(color);

        @compileError("css color name " ++ name ++ " is not valid");
    }
}
