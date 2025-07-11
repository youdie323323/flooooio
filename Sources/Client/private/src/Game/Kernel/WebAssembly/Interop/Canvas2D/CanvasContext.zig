//! Provides minimal canvas operations for wasm.
const CanvasContext = @This();

pub const Id = u16;

pub const LineCap = enum(u2) {
    butt,
    round,
    square,
};

pub const LineJoin = enum(u2) {
    round,
    bevel,
    miter,
};

pub const TextAlign = enum(u3) {
    left,
    right,
    center,
    start,
    end,
};

pub const TextBaseline = enum(u3) {
    top,
    hanging,
    middle,
    alphabetic,
    ideographic,
    bottom,
};

pub const TextDirection = enum(u2) {
    inherit,
    ltr,
    rtl,
};

pub const FontKerning = enum(u2) {
    auto,
    normal,
    none,
};

pub const FillType = enum(u1) {
    nonzero,
    evenodd,
};

pub const PatternRepeat = enum(u2) {
    repeat,
    repeat_x,
    repeat_y,
    no_repeat,
};

pub const CompositeOperator = enum(u5) {
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

/// Getter/setter methods which is similar to ctx.blahblah = blah, ctx.blahblah
const Accessors = struct {
    pub const Properties = struct {
        /// Current lineWidth of this context.
        /// Default value is 1 px.
        line_width: f32 = 1.0,

        /// Current globalAlpha of this context.
        /// Default value is 1.0.
        global_alpha: f32 = 1.0,

        /// Current globalCompositeOperation of this context.
        /// Default value is source_over.
        global_composite_operation: CompositeOperator = .source_over,

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
    };

    pub inline fn strokeColor(self: *const CanvasContext, color: Color) void {
        const r, const g, const b = color.rgb;

        @"22"(self.id, r, g, b);
    }

    pub inline fn fillColor(self: *const CanvasContext, color: Color) void {
        const r, const g, const b = color.rgb;

        @"21"(self.id, r, g, b);
    }

    pub inline fn setLineWidth(self: *CanvasContext, width: f32) void {
        self.properties.line_width = width;

        @"33"(self.id, width);
    }

    pub inline fn lineWidth(self: *const CanvasContext) f32 {
        return self.properties.line_width;
    }

    pub inline fn setLineCap(self: *CanvasContext, comptime cap: LineCap) void {
        self.properties.line_cap = cap;

        switch (cap) {
            inline .butt => @"42"(self.id),
            inline .round => @"43"(self.id),
            inline .square => @"44"(self.id),
        }
    }

    pub inline fn lineCap(self: *const CanvasContext) LineCap {
        return self.properties.line_cap;
    }

    pub inline fn setLineJoin(self: *CanvasContext, comptime join: LineJoin) void {
        self.properties.line_join = join;

        switch (join) {
            inline .round => @"45"(self.id),
            inline .miter => @"46"(self.id),
            inline else => @compileError(std.fmt.comptimePrint("invalid line join: {any}", .{join})),
        }
    }

    pub inline fn lineJoin(self: *const CanvasContext) LineJoin {
        return self.properties.line_join;
    }

    pub inline fn setMiterLimit(self: *CanvasContext, comptime limit: comptime_float) void {
        self.properties.miter_limit = limit;

        @"47"(self.id, limit);
    }

    pub inline fn miterLimit(self: *const CanvasContext) f32 {
        return self.properties.miter_limit;
    }

    /// Do setLineDash([]) on context.
    pub inline fn setLineSolid(self: *const CanvasContext) void {
        @"48"(self.id);
    }

    pub inline fn setLineDashOffset(self: *CanvasContext, comptime offset: comptime_float) void {
        self.properties.line_dash_offset = offset;

        @"49"(self.id, offset);
    }

    pub inline fn lineDashOffset(self: *const CanvasContext) f32 {
        return self.properties.line_dash_offset;
    }

    pub inline fn setGlobalAlpha(self: *CanvasContext, alpha: f32) void {
        self.properties.global_alpha = alpha;

        @"23"(self.id, alpha);
    }

    pub inline fn globalAlpha(self: *const CanvasContext) f32 {
        return self.properties.global_alpha;
    }

    pub inline fn setStandardFont(self: *const CanvasContext, comptime pixel: f32) void {
        // TODO: should store font pixel?

        @"39"(self.id, pixel);
    }

    pub inline fn setGlobalCompositeOperation(self: *CanvasContext, comptime op: CompositeOperator) void {
        self.properties.global_composite_operation = op;

        switch (op) {
            inline .source_over => @"50"(self.id),
            inline .destination_in => @"51"(self.id),
            inline .copy => @"52"(self.id),
            inline .lighter => @"53"(self.id),
            inline .multiply => @"54"(self.id),
            inline else => @compileError(std.fmt.comptimePrint("invalid composite operator: {any}", .{op})),
        }
    }

    pub inline fn globalCompositeOperation(self: *const CanvasContext) CompositeOperator {
        return self.properties.global_composite_operation;
    }

    pub inline fn setTextAlign(self: *CanvasContext, comptime @"align": TextAlign) void {
        self.properties.text_align = @"align";

        const align_string = comptime switch (@"align") {
            .left => "left",
            .right => "right",
            .center => return @"40"(self.id),
            .start => "start",
            .end => "end",
        };

        @"41"(self.id, align_string.ptr, align_string.len);
    }

    pub inline fn textAlign(self: *const CanvasContext) TextAlign {
        return self.properties.text_align;
    }

    pub inline fn setImageSmoothingEnabled(self: *CanvasContext, comptime enabled: bool) void {
        self.properties.image_smoothing_enabled = enabled;

        @"55"(self.id, comptime @intFromBool(enabled));
    }

    pub inline fn imageSmoothingEnabled(self: *const CanvasContext) bool {
        return self.properties.image_smoothing_enabled;
    }

    pub inline fn setSize(self: *const CanvasContext, width: u16, height: u16) void {
        @"56"(self.id, width, height);
    }

    pub inline fn size(self: *const CanvasContext) @Vector(2, u16) {
        var width: u16 = undefined;
        var height: u16 = undefined;

        @"57"(self.id, &width, &height);

        return .{ width, height };
    }
};

pub usingnamespace Accessors;

/// Context path methods.
const PathMethods = struct {
    pub inline fn closePath(self: *const CanvasContext) void {
        @"15"(self.id);
    }

    pub inline fn moveTo(self: *const CanvasContext, x: f32, y: f32) void {
        @"24"(self.id, x, y);
    }

    pub inline fn lineTo(self: *const CanvasContext, x: f32, y: f32) void {
        @"25"(self.id, x, y);
    }

    pub inline fn quadraticCurveTo(self: *const CanvasContext, cpx: f32, cpy: f32, x: f32, y: f32) void {
        @"29"(self.id, cpx, cpy, x, y);
    }

    pub inline fn bezierCurveTo(self: *const CanvasContext, cp1x: f32, cp1y: f32, cp2x: f32, cp2y: f32, x: f32, y: f32) void {
        @"30"(self.id, cp1x, cp1y, cp2x, cp2y, x, y);
    }

    pub inline fn arc(self: *const CanvasContext, x: f32, y: f32, radius: f32, start_angle: f32, end_angle: f32, comptime anticlockwise: bool) void {
        @"31"(self.id, x, y, radius, start_angle, end_angle, comptime @intFromBool(anticlockwise));
    }

    pub inline fn ellipse(self: *const CanvasContext, x: f32, y: f32, radius_x: f32, radius_y: f32, rotation: f32, start_angle: f32, end_angle: f32, comptime anticlockwise: bool) void {
        @"32"(self.id, x, y, radius_x, radius_y, rotation, start_angle, end_angle, comptime @intFromBool(anticlockwise));
    }

    /// Performs closePath.
    extern "0" fn @"15"(id: Id) void;
    /// Performs moveTo.
    extern "0" fn @"24"(id: Id, x: f32, y: f32) void;
    /// Performs lineTo.
    extern "0" fn @"25"(id: Id, x: f32, y: f32) void;
    /// Performs quadraticCurveTo.
    extern "0" fn @"29"(id: Id, cpx: f32, cpy: f32, x: f32, y: f32) void;
    /// Performs bezierCurveTo.
    extern "0" fn @"30"(id: Id, cp1x: f32, cp1y: f32, cp2x: f32, cp2y: f32, x: f32, y: f32) void;
    /// Performs arc.
    extern "0" fn @"31"(id: Id, x: f32, y: f32, radius: f32, start_angle: f32, end_angle: f32, anticlockwise: u8) void;
    /// Performs ellipse.
    extern "0" fn @"32"(id: Id, x: f32, y: f32, radius_x: f32, radius_y: f32, rotation: f32, start_angle: f32, end_angle: f32, anticlockwise: u8) void;
};

pub usingnamespace PathMethods;

id: Id,

/// Internal context property values.
/// This should not accessed directly, if you want get value, call method that named with field name.
properties: Accessors.Properties = .{},

/// Internal context frames.
/// This should not accessed directly.
frames: [8]Accessors.Properties = undefined,

/// Current depth of context frames.
frames_depth: usize = 0,

pub inline fn init(allocator: std.mem.Allocator, id: Id) *CanvasContext {
    const ctx = allocator.create(CanvasContext) catch unreachable;

    ctx.* = .{ .id = id };

    return ctx;
}

pub inline fn deinit(self: *CanvasContext, allocator: std.mem.Allocator) void {
    @"3"(self.id);

    allocator.destroy(self);

    self.* = undefined;
}

pub inline fn save(self: *CanvasContext) void {
    @"4"(self.id);

    { // Save frame
        self.frames[self.frames_depth] = self.properties;

        self.frames_depth += 1;
    }
}

pub inline fn restore(self: *CanvasContext) void {
    @"5"(self.id);

    { // Restore frame
        self.frames_depth -= 1;

        self.properties = self.frames[self.frames_depth];
    }
}

pub inline fn resetTransform(self: *const CanvasContext) void {
    @"6"(self.id);
}

pub inline fn setTransform(self: *const CanvasContext, m11: f32, m12: f32, m21: f32, m22: f32, dx: f32, dy: f32) void {
    @"7"(self.id, m11, m12, m21, m22, dx, dy);
}

pub inline fn beginPath(self: *const CanvasContext) void {
    @"14"(self.id);
}

pub inline fn fill(self: *const CanvasContext) void {
    @"8"(self.id);
}

pub inline fn fillPath(self: *const CanvasContext, path: Path2D, comptime winding: FillType) void {
    @"9"(self.id, path.id, comptime @intFromBool(winding == .nonzero));
}

pub inline fn stroke(self: *const CanvasContext) void {
    @"10"(self.id);
}

pub inline fn strokePath(self: *const CanvasContext, path: Path2D) void {
    @"11"(self.id, path.id);
}

pub inline fn clip(self: *const CanvasContext) void {
    @"12"(self.id);
}

pub inline fn clipPath(self: *const CanvasContext, path: Path2D) void {
    @"13"(self.id, path.id);
}

pub inline fn rect(self: *const CanvasContext, x: f32, y: f32, width: f32, height: f32) void {
    @"16"(self.id, x, y, width, height);
}

pub inline fn fillRect(self: *const CanvasContext, x: f32, y: f32, width: f32, height: f32) void {
    @"66"(self.id, x, y, width, height);
}

pub inline fn clearRect(self: *const CanvasContext, x: f32, y: f32, width: f32, height: f32) void {
    @"18"(self.id, x, y, width, height);
}

pub inline fn fillPixel(self: *const CanvasContext) void {
    @"19"(self.id);
}

pub inline fn strokeRect(self: *const CanvasContext, width: f32, height: f32) void {
    @"20"(self.id, width, height);
}

pub inline fn translate(self: *const CanvasContext, x: f32, y: f32) void {
    @"26"(self.id, x, y);
}

pub inline fn scale(self: *const CanvasContext, x: f32, y: f32) void {
    @"27"(self.id, x, y);
}

pub inline fn rotate(self: *const CanvasContext, angle: f32) void {
    @"28"(self.id, angle);
}

pub inline fn copyCanvas(self: *const CanvasContext, src_context: *CanvasContext, dx: f32, dy: f32) void {
    @"34"(self.id, src_context.id, dx, dy);
}

pub inline fn copyCanvasAsOnePixel(self: *const CanvasContext, src_context: *CanvasContext, dx: f32, dy: f32) void {
    @"35"(self.id, src_context.id, dx, dy);
}

pub inline fn copyCanvasWithScale(self: *const CanvasContext, src_context: *CanvasContext, dx: f32, dy: f32, dw: f32, dh: f32) void {
    @"36"(self.id, src_context.id, dx, dy, dw, dh);
}

pub inline fn fillText(self: *const CanvasContext, text: []const u8, x: f32, y: f32) void {
    @"37"(self.id, text.ptr, text.len, x, y);
}

pub inline fn strokeText(self: *const CanvasContext, text: []const u8, x: f32, y: f32) void {
    @"38"(self.id, text.ptr, text.len, x, y);
}

// Begin utilities

pub inline fn drawSvg(self: *const CanvasContext, svg: []const u8) void {
    @"2"(self.id, svg.ptr, svg.len);
}

pub inline fn clearContextRect(self: *const CanvasContext) void {
    @"17"(self.id);
}

/// Creates the context.
extern "0" fn @"0"(width: f32, height: f32, is_discardable: u8) Id;
/// Get context by element id.
extern "0" fn @"1"(ptr: Mem.CStringPointer, alpha: u8) Id;
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
extern "0" fn @"7"(id: Id, m11: f32, m12: f32, m21: f32, m22: f32, dx: f32, dy: f32) void;
/// Performs fill.
extern "0" fn @"8"(id: Id) void;
/// Performs path fill.
extern "0" fn @"9"(id: Id, path_id: Path2D.Id, is_non_zero: u8) void;
/// Performs stroke.
extern "0" fn @"10"(id: Id) void;
/// Performs path stroke.
extern "0" fn @"11"(id: Id, path_id: Path2D.Id) void;
/// Performs clip.
extern "0" fn @"12"(id: Id) void;
/// Performs path clip.
extern "0" fn @"13"(id: Id, path_id: Path2D.Id) void;
/// Performs beginPath.
extern "0" fn @"14"(id: Id) void;
/// Performs rect.
extern "0" fn @"16"(id: Id, x: f32, y: f32, width: f32, height: f32) void;
/// Performs fillRect.
extern "0" fn @"66"(id: Id, x: f32, y: f32, width: f32, height: f32) void;
/// Performs full clear.
extern "0" fn @"17"(id: Id) void;
/// Performs clearRect.
extern "0" fn @"18"(id: Id, x: f32, y: f32, width: f32, height: f32) void;
/// Draws a pixel.
extern "0" fn @"19"(id: Id) void;
/// Strokes a rect.
extern "0" fn @"20"(id: Id, width: f32, height: f32) void;
/// Sets fillStyle.
extern "0" fn @"21"(id: Id, r: u8, g: u8, b: u8) void;
/// Sets strokeStyle.
extern "0" fn @"22"(id: Id, r: u8, g: u8, b: u8) void;
/// Sets globalAlpha.
extern "0" fn @"23"(id: Id, alpha: f32) void;
/// Performs translate.
extern "0" fn @"26"(id: Id, x: f32, y: f32) void;
/// Performs scale.
extern "0" fn @"27"(id: Id, x: f32, y: f32) void;
/// Performs rotate.
extern "0" fn @"28"(id: Id, angle: f32) void;
/// Sets lineWidth.
extern "0" fn @"33"(id: Id, width: f32) void;
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
extern "0" fn @"39"(id: Id, pixel: f32) void;
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
extern "0" fn @"47"(id: Id, limit: f32) void;
/// Sets line dash to real line.
extern "0" fn @"48"(id: Id) void;
/// Sets lineDashOffset.
extern "0" fn @"49"(id: Id, offset: f32) void;
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
extern "0" fn @"55"(id: Id, enabled: u8) void;

/// Sets width and height.
extern "0" fn @"56"(id: Id, width: u16, height: u16) void;
/// Gets width and height.
extern "0" fn @"57"(id: Id, w_addr: *u16, h_addr: *u16) void;

pub fn createCanvasContext(
    allocator: std.mem.Allocator,
    width: f32,
    height: f32,
    comptime is_discardable: bool,
) *CanvasContext {
    const id = @"0"(width, height, comptime @intFromBool(is_discardable));

    return CanvasContext.init(allocator, id);
}

pub fn createCanvasContextBySelector(
    allocator: std.mem.Allocator,
    comptime selector: []const u8,
    comptime alpha: bool,
) *CanvasContext {
    const selector_ptr = Mem.allocCString(selector);

    const id = @"1"(selector_ptr, comptime @intFromBool(alpha));

    Mem.freeCString(selector_ptr);

    return CanvasContext.init(allocator, id);
}

/// Function signature for rAF (requestAnimationFrame) event handler.
pub const RAFCallback = *const fn (time: f32) callconv(.c) void;

extern "0" fn @"65"(callback: RAFCallback) u32;

pub inline fn requestAnimationFrame(callback: RAFCallback) u32 {
    return @"65"(callback);
}

const std = @import("std");

const Path2D = @import("Path2D.zig");

const Color = @import("Color.zig");

const Mem = @import("../../../../../Mem.zig");
