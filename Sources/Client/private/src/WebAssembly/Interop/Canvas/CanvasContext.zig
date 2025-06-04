//! This module proivded minimal canvas operations for wasm.
//! Im not going to use C string here for performance reason.
//! Some method like @"textAlign = 'center'" is only for when value is statically determined.
const std = @import("std");
const Path2D = @import("Path2D.zig");
const Color = @import("./Color.zig");
const mem = @import("../../../mem.zig");
const CanvasContext = @This();

pub const Id = u16;

pub const LineCap = enum(u8) {
    butt,
    round,
    square,
};

pub const LineJoin = enum(u8) {
    round,
    bevel,
    miter,
};

pub const TextAlign = enum(u8) {
    left,
    right,
    center,
    start,
    end,
};

pub const TextBaseline = enum(u8) {
    top,
    hanging,
    middle,
    alphabetic,
    ideographic,
    bottom,
};

pub const TextDirection = enum(u8) {
    inherit,
    ltr,
    rtl,
};

pub const FontKerning = enum(u8) {
    auto,
    normal,
    none,
};

pub const FillRule = enum(u8) {
    nonzero,
    evenodd,
};

pub const PatternRepeat = enum(u8) {
    repeat,
    repeat_x,
    repeat_y,
    no_repeat,
};

pub const BlendMode = enum(u8) {
    source_over,
    source_in,
    source_out,
    source_atop,
    destination_over,
    destination_in,
    destination_out,
    destination_atop,
    lighter,
    copy,
    xor,
    multiply,
    screen,
    overlay,
    darken,
    lighten,
    color_dodge,
    color_burn,
    hard_light,
    soft_light,
    difference,
    exclusion,
    hue,
    saturation,
    color,
    luminosity,
};

/// Utilities namespace definition for context.
/// Utility mean they re not pure canvas call operations.
const Utils = struct {
    pub inline fn drawSVG(self: CanvasContext, svg: []const u8) void {
    @"2"(self.id, svg.ptr, svg.len);
}

    pub inline fn prepareFontProperties(self: *CanvasContext, pixel: FontPixel) void {
        self.@"font = $0 ++ 'px Ubuntu'"(pixel);
        self.@"lineWidth ="(calculateStrokeWidth(pixel));
        self.strokeColor(comptime Color.comptimeFromHexColorCode("#000000"));
    }

    pub inline fn clearContextRect(self: CanvasContext) void {
        @"17"(self.id);
    }
};

pub usingnamespace Utils;

id: Id,

/// Current lineWidth of this context.
/// Default value is 1 px.
line_width: f32 = 1.0,

/// Current globalAlpha of this context.
/// Default value is 1.0.
global_alpha: f32 = 1.0,

/// Current globalCompositeOperation of this context.
/// Default value is source_over.
global_composite_operation: BlendMode = .source_over,

/// Current textAlign of this context.
/// Default value is start.
text_align: TextAlign = .start,

/// Current lineCap of this context.
/// Default value is butt.
line_cap: LineCap = .butt,

/// Current lineJoin of this context.
/// Default value is miter.
line_join: LineJoin = .miter,

/// Current miterLimit of this context.
/// Default value is 10.0.
miter_limit: f32 = 10.0,

/// Current lineDashOffset of this context.
/// Default value is 0.0.
line_dash_offset: f32 = 0.0,

/// Current imageSmoothingEnabled of this context.
/// Default value is true.
image_smoothing_enabled: bool = true,

pub inline fn init(id: Id) *CanvasContext {
    var ctx: CanvasContext = .{ .id = id };

    return &ctx;
}

pub inline fn deinit(self: *CanvasContext) void {
    @"3"(self.id);

    self.* = undefined;
}

pub inline fn save(self: CanvasContext) void {
    @"4"(self.id);
}

pub inline fn restore(self: CanvasContext) void {
    @"5"(self.id);
}

pub inline fn resetTransform(self: CanvasContext) void {
    @"6"(self.id);
}

pub inline fn setTransform(self: CanvasContext, a: f32, b: f32, c: f32, d: f32, e: f32, f: f32) void {
    @"7"(self.id, a, b, c, d, e, f);
}

pub inline fn fill(self: CanvasContext) void {
    @"8"(self.id);
}

pub inline fn fillPath(self: CanvasContext, path: Path2D, comptime fill_rule: FillRule) void {
    @"9"(self.id, path.id, comptime @intFromBool(fill_rule == .nonzero));
}

pub inline fn stroke(self: CanvasContext) void {
    @"10"(self.id);
}

pub inline fn strokePath(self: CanvasContext, path: Path2D) void {
    @"11"(self.id, path.id);
}

pub inline fn clip(self: CanvasContext) void {
    @"12"(self.id);
}

pub inline fn clipPath(self: CanvasContext, path: Path2D) void {
    @"13"(self.id, path.id);
}

pub inline fn beginPath(self: CanvasContext) void {
    @"14"(self.id);
}

pub inline fn closePath(self: CanvasContext) void {
    @"15"(self.id);
}

pub inline fn rect(self: CanvasContext, x: f32, y: f32, w: f32, h: f32) void {
    @"16"(self.id, x, y, w, h);
}

pub inline fn clearRect(self: CanvasContext, x: f32, y: f32, w: f32, h: f32) void {
    @"18"(self.id, x, y, w, h);
}

pub inline fn fillPixel(self: CanvasContext) void {
    @"19"(self.id);
}

pub inline fn strokeRect(self: CanvasContext, w: f32, h: f32) void {
    @"20"(self.id, w, h);
}

pub inline fn fillColor(self: CanvasContext, color: Color) void {
    const r, const g, const b = color.rgb;

    @"21"(self.id, r, g, b);
}

pub inline fn strokeColor(self: CanvasContext, color: Color) void {
    const r, const g, const b = color.rgb;

    @"22"(self.id, r, g, b);
}

pub inline fn moveTo(self: CanvasContext, x: f32, y: f32) void {
    @"24"(self.id, x, y);
}

pub inline fn lineTo(self: CanvasContext, x: f32, y: f32) void {
    @"25"(self.id, x, y);
}

pub inline fn translate(self: CanvasContext, x: f32, y: f32) void {
    @"26"(self.id, x, y);
}

pub inline fn scale(self: CanvasContext, x: f32, y: f32) void {
    @"27"(self.id, x, y);
}

pub inline fn rotate(self: CanvasContext, angle: f32) void {
    @"28"(self.id, angle);
}

pub inline fn quadraticCurveTo(self: CanvasContext, cpx: f32, cpy: f32, x: f32, y: f32) void {
    @"29"(self.id, cpx, cpy, x, y);
}

pub inline fn bezierCurveTo(self: CanvasContext, cp1x: f32, cp1y: f32, cp2x: f32, cp2y: f32, x: f32, y: f32) void {
    @"30"(self.id, cp1x, cp1y, cp2x, cp2y, x, y);
}

pub inline fn arc(self: CanvasContext, x: f32, y: f32, radius: f32, start_angle: f32, end_angle: f32, comptime counterclockwise: bool) void {
    @"31"(self.id, x, y, radius, start_angle, end_angle, comptime @intFromBool(counterclockwise));
}

pub inline fn ellipse(self: CanvasContext, x: f32, y: f32, radius_x: f32, radius_y: f32, rotation: f32, start_angle: f32, end_angle: f32, comptime counterclockwise: bool) void {
    @"32"(self.id, x, y, radius_x, radius_y, rotation, start_angle, end_angle, comptime @intFromBool(counterclockwise));
}

pub inline fn copyCanvas(self: CanvasContext, src_context: CanvasContext, dx: f32, dy: f32) void {
    @"34"(self.id, src_context.id, dx, dy);
}

pub inline fn copyCanvasAsOnePixel(self: CanvasContext, src_context: CanvasContext, dx: f32, dy: f32) void {
    @"35"(self.id, src_context.id, dx, dy);
}

pub inline fn copyCanvasWithScale(self: CanvasContext, src_context: CanvasContext, dx: f32, dy: f32, dw: f32, dh: f32) void {
    @"36"(self.id, src_context.id, dx, dy, dw, dh);
}

pub inline fn fillText(self: CanvasContext, text: []const u8, x: f32, y: f32) void {
    @"37"(self.id, text.ptr, text.len, x, y);
}

pub inline fn strokeText(self: CanvasContext, text: []const u8, x: f32, y: f32) void {
    @"38"(self.id, text.ptr, text.len, x, y);
}

pub inline fn @"globalAlpha ="(self: *CanvasContext, alpha: f32) void {
    self.global_alpha = alpha;

    @"23"(self.id, alpha);
}

pub inline fn @"lineWidth ="(self: *CanvasContext, width: f32) void {
    self.line_width = width;

    @"33"(self.id, width);
}

pub const FontPixel = f32;

pub inline fn calculateStrokeWidth(w: f32) f32 {
    return w / 8.333333830038736;
}

pub inline fn @"font = $0 ++ 'px Ubuntu'"(self: CanvasContext, pixel: FontPixel) void {
    // No need to store the pixel because if really want to get previous font pixel, you need to parse the font
    // But that not real

    @"39"(self.id, pixel);
}

pub inline fn @"textAlign = 'center'"(self: *CanvasContext) void {
    self.text_align = .center;

    @"40"(self.id);
}

pub inline fn @"textAlign ="(self: *CanvasContext, comptime @"align": TextAlign) void {
    self.text_align = @"align";

    const align_string = comptime switch (@"align") {
        .left => "left",
        .right => "right",
        .center => "center",
        .start => "start",
        .end => "end",
    };

    @"41"(self.id, align_string.ptr, align_string.len);
}

pub inline fn @"lineCap = 'butt'"(self: *CanvasContext) void {
    self.line_cap = .butt;

    @"42"(self.id);
}

pub inline fn @"lineCap = 'round'"(self: *CanvasContext) void {
    self.line_cap = .round;

    @"43"(self.id);
}

pub inline fn @"lineCap = 'square'"(self: *CanvasContext) void {
    self.line_cap = .square;

    @"44"(self.id);
}

pub inline fn @"lineJoin = 'round'"(self: *CanvasContext) void {
    self.line_join = .round;

    @"45"(self.id);
}

pub inline fn @"lineJoin = 'miter'"(self: *CanvasContext) void {
    self.line_join = .miter;

    @"46"(self.id);
}

pub inline fn @"miterLimit ="(self: *CanvasContext, miter_limit: f32) void {
    self.miter_limit = miter_limit;

    @"47"(self.id, miter_limit);
}

pub inline fn @"setLineDash([])"(self: CanvasContext) void {
    @"48"(self.id);
}

pub inline fn @"lineDashOffset ="(self: *CanvasContext, ldo: f32) void {
    self.line_dash_offset = ldo;

    @"49"(self.id, ldo);
}

pub inline fn @"globalCompositeOperation = 'source-over'"(self: *CanvasContext) void {
    self.global_composite_operation = .source_over;

    @"50"(self.id);
}

pub inline fn @"globalCompositeOperation = 'destination-in'"(self: *CanvasContext) void {
    self.global_composite_operation = .destination_in;

    @"51"(self.id);
}

pub inline fn @"globalCompositeOperation = 'copy'"(self: *CanvasContext) void {
    self.global_composite_operation = .copy;

    @"52"(self.id);
}

pub inline fn @"globalCompositeOperation = 'lighter'"(self: *CanvasContext) void {
    self.global_composite_operation = .lighter;

    @"53"(self.id);
}

pub inline fn @"globalCompositeOperation = 'multiply'"(self: *CanvasContext) void {
    self.global_composite_operation = .multiply;

    @"54"(self.id);
}

pub inline fn @"imageSmoothingEnabled ="(self: *CanvasContext, comptime smoothing: bool) void {
    self.image_smoothing_enabled = smoothing;

    @"55"(self.id, comptime @intFromBool(smoothing));
}

pub inline fn setSize(self: CanvasContext, w: u16, h: u16) void {
    @"56"(self.id, w, h);
}

pub inline fn getSize(self: CanvasContext) [2]16 {
    var width: u16 = undefined;
    var height: u16 = undefined;

    @"57"(self.id, &width, &height);

    return .{ width, height };
}

/// Creates the context.
extern "0" fn @"0"(width: f32, height: f32, is_discardable: u8) Id;
/// Get context by element id.
extern "0" fn @"1"(ptr: mem.MemoryPointer, alpha: u8) Id;
/// Draw svg.
extern "0" fn @"2"(id: Id, ptr: [*]const u8, len: u32) void;
/// Destroys the context.
extern "0" fn @"3"(id: Id) void;
/// Performs save.
extern "0" fn @"4"(id: Id) void;
/// Performs restore.
extern "0" fn @"5"(id: Id) void;
/// Resets context transform.
extern "0" fn @"6"(id: Id) void;
/// Sets context transform.
extern "0" fn @"7"(id: Id, a: f32, b: f32, c: f32, d: f32, e: f32, f: f32) void;
/// Performs fill.
extern "0" fn @"8"(id: Id) void;
/// Performs path fill.
extern "0" fn @"9"(id: Id, path_id: Path2D.PathId, is_non_zero: u8) void;
/// Performs stroke.
extern "0" fn @"10"(id: Id) void;
/// Performs path stroke.
extern "0" fn @"11"(id: Id, path_id: Path2D.PathId) void;
/// Performs clip.
extern "0" fn @"12"(id: Id) void;
/// Performs path clip.
extern "0" fn @"13"(id: Id, path_id: Path2D.PathId) void;
/// Performs beginPath.
extern "0" fn @"14"(id: Id) void;
/// Performs closePath.
extern "0" fn @"15"(id: Id) void;
/// Performs rect.
extern "0" fn @"16"(id: Id, x: f32, y: f32, w: f32, h: f32) void;
/// Performs full clear.
extern "0" fn @"17"(id: Id) void;
/// Performs clearRect.
extern "0" fn @"18"(id: Id, x: f32, y: f32, w: f32, h: f32) void;
/// Draws a pixel.
extern "0" fn @"19"(id: Id) void;
/// Strokes a rect.
extern "0" fn @"20"(id: Id, w: f32, h: f32) void;
/// Sets fillStyle.
extern "0" fn @"21"(id: Id, r: u8, g: u8, b: u8) void;
/// Sets strokeStyle.
extern "0" fn @"22"(id: Id, r: u8, g: u8, b: u8) void;
/// Sets globalAlpha.
extern "0" fn @"23"(id: Id, alpha: f32) void;
/// Performs moveTo.
extern "0" fn @"24"(id: Id, x: f32, y: f32) void;
/// Performs lineTo.
extern "0" fn @"25"(id: Id, x: f32, y: f32) void;
/// Performs translate.
extern "0" fn @"26"(id: Id, x: f32, y: f32) void;
/// Performs scale.
extern "0" fn @"27"(id: Id, x: f32, y: f32) void;
/// Performs rotate.
extern "0" fn @"28"(id: Id, angle: f32) void;
/// Performs quadraticCurveTo.
extern "0" fn @"29"(id: Id, cpx: f32, cpy: f32, x: f32, y: f32) void;
/// Performs bezierCurveTo.
extern "0" fn @"30"(id: Id, cp1x: f32, cp1y: f32, cp2x: f32, cp2y: f32, x: f32, y: f32) void;
/// Performs arc.
extern "0" fn @"31"(id: Id, x: f32, y: f32, radius: f32, start_angle: f32, end_angle: f32, counterclockwise: u8) void;
/// Performs ellipse.
extern "0" fn @"32"(id: Id, x: f32, y: f32, radius_x: f32, radius_y: f32, rotation: f32, start_angle: f32, end_angle: f32, counterclockwise: u8) void;
/// Sets lineWidth.
extern "0" fn @"33"(id: Id, w: f32) void;
/// Performs drawImage (overload 1).
extern "0" fn @"34"(dst_id: Id, src_id: Id, dx: f32, dy: f32) void;
/// Performs drawImage (overload 2).
extern "0" fn @"35"(dst_id: Id, src_id: Id, dx: f32, dy: f32) void;
/// Performs drawImage (overload 3).
extern "0" fn @"36"(dst_id: Id, src_id: Id, dx: f32, dy: f32, dw: f32, dh: f32) void;
/// Performs fillText.
extern "0" fn @"37"(id: Id, ptr: [*]const u8, len: u32, x: f32, y: f32) void;
/// Performs strokeText.
extern "0" fn @"38"(id: Id, ptr: [*]const u8, len: u32, x: f32, y: f32) void;
/// Sets font.
extern "0" fn @"39"(id: Id, pixel: FontPixel) void;
/// Sets center to textAlign.
extern "0" fn @"40"(id: Id) void;
/// Sets textAlign.
extern "0" fn @"41"(id: Id, ptr: [*]const u8, len: u32) void;
/// Sets butt to lineCap.
extern "0" fn @"42"(id: Id) void;
/// Sets round to lineCap.
extern "0" fn @"43"(id: Id) void;
/// Sets square to lineCap.
extern "0" fn @"44"(id: Id) void;
/// Sets round to lineJoin.
extern "0" fn @"45"(id: Id) void;
/// Sets miter to lineJoin.
extern "0" fn @"46"(id: Id) void;
/// Sets miterLimit.
extern "0" fn @"47"(id: Id, miter_limit: f32) void;
/// Sets line dash to real line.
extern "0" fn @"48"(id: Id) void;
/// Sets lineDashOffset.
extern "0" fn @"49"(id: Id, line_dash_offset: f32) void;
/// Sets source-over to globalCompositeOperation.
extern "0" fn @"50"(id: Id) void;
/// Sets destination-in to globalCompositeOperation.
extern "0" fn @"51"(id: Id) void;
/// Sets copy to globalCompositeOperation.
extern "0" fn @"52"(id: Id) void;
/// Sets lighter to globalCompositeOperation.
extern "0" fn @"53"(id: Id) void;
/// Sets multiply to globalCompositeOperation.
extern "0" fn @"54"(id: Id) void;
/// Sets imageSmoothingEnabled.
extern "0" fn @"55"(id: Id, smoothing: u8) void;
/// Sets width and height.
extern "0" fn @"56"(id: Id, w: u16, h: u16) void;
/// Get width and height.
extern "0" fn @"57"(id: Id, w_addr: *u16, h_addr: *u16) void;

pub inline fn createCanvasContext(width: f32, height: f32, comptime is_discardable: bool) *CanvasContext {
    const id = @"0"(width, height, comptime @intFromBool(is_discardable));

    return CanvasContext.init(id);
}

pub inline fn createCanvasContextFromElement(comptime element_id: []const u8, comptime alpha: bool) *CanvasContext {
    const str = mem.allocCString(element_id);

    const id = @"1"(str, comptime @intFromBool(alpha));

    mem.free(str);

    return CanvasContext.init(id);
}

/// Function signature for rAF (requestAnimationFrame) event handler.
pub const RAFCallback = *const fn (time: f32) callconv(.c) void;

extern "0" fn @"65"(callback: RAFCallback) u32;

pub inline fn requestAnimationFrame(callback: RAFCallback) u32 {
    return @"65"(callback);
}
