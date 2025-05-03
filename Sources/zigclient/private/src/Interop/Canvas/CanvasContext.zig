///! This module proivded minimal canvas operations for wasm.
const std = @import("std");
const Path2D = @import("Path2D.zig");
const bindgen = @import("../Bindgen/lib.zig");
const Color = @import("./Color.zig");
const CanvasContext = @This();

pub const ContextId = u16;

id: ContextId,

pub inline fn init(id: ContextId) CanvasContext {
    return .{ .id = id };
}

pub inline fn drawSvg(self: CanvasContext, svg: []const u8) void {
    @"2"(self.id, svg.ptr, svg.len);
}

pub inline fn destroy(self: CanvasContext) void {
    @"3"(self.id);
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

pub inline fn fillPath(self: CanvasContext, path: Path2D, comptime is_non_zero: bool) void {
    @"9"(self.id, path.id, comptime @intFromBool(is_non_zero));
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

pub inline fn clearRectFull(self: CanvasContext) void {
    @"17"(self.id);
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

pub inline fn setGlobalAlpha(self: CanvasContext, alpha: f32) void {
    @"23"(self.id, alpha);
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

pub inline fn arc(self: CanvasContext, x: f32, y: f32, radius: f32, startAngle: f32, endAngle: f32, counterclockwise: bool) void {
    @"31"(self.id, x, y, radius, startAngle, endAngle, comptime @intFromBool(counterclockwise));
}

pub inline fn ellipse(self: CanvasContext, x: f32, y: f32, radiusX: f32, radiusY: f32, rotation: f32, startAngle: f32, endAngle: f32, counterclockwise: bool) void {
    @"32"(self.id, x, y, radiusX, radiusY, rotation, startAngle, endAngle, comptime @intFromBool(counterclockwise));
}

pub inline fn setLineWidth(self: CanvasContext, width: f32) void {
    @"33"(self.id, width);
}

pub inline fn copyCanvas(self: CanvasContext, src_context: CanvasContext, dx: f32, dy: f32) void {
    @"34"(self.id, src_context.id, dx, dy);
}

pub inline fn copyCanvasAsOnePixel(self: CanvasContext, src_context: CanvasContext, dx: f32, dy: f32) void {
    @"35"(self.id, src_context.id, dx, dy);
}

pub inline fn copyCanvasScaled(self: CanvasContext, src_context: CanvasContext, dx: f32, dy: f32, dw: f32, dh: f32) void {
    @"36"(self.id, src_context.id, dx, dy, dw, dh);
}

pub inline fn fillText(self: CanvasContext, text: []const u8, x: f32, y: f32) void {
    @"37"(self.id, text.ptr, text.len, x, y);
}

pub inline fn strokeText(self: CanvasContext, text: []const u8, x: f32, y: f32) void {
    @"38"(self.id, text.ptr, text.len, x, y);
}

pub inline fn font(self: CanvasContext, pixel: u16) void {
    @"39"(self.id, pixel);
}

pub inline fn setCenterToTextAlign(self: CanvasContext) void {
    @"40"(self.id);
}

pub inline fn setTextAlign(self: CanvasContext, @"align": []const u8) void {
    @"41"(self.id, @"align".ptr, @"align".len);
}

pub inline fn setButtToLineCap(self: CanvasContext) void {
    @"42"(self.id);
}

pub inline fn setRoundToLineCap(self: CanvasContext) void {
    @"43"(self.id);
}

pub inline fn setSquareToLineCap(self: CanvasContext) void {
    @"44"(self.id);
}

pub inline fn setRoundToLineJoin(self: CanvasContext) void {
    @"45"(self.id);
}

pub inline fn setMiterToLineJoin(self: CanvasContext) void {
    @"46"(self.id);
}

pub inline fn setMiterLimit(self: CanvasContext, miter_limit: u16) void {
    @"47"(self.id, miter_limit);
}

pub inline fn setRealLineToLineDash(self: CanvasContext) void {
    @"48"(self.id);
}

pub inline fn setLineDashOffset(self: CanvasContext, line_dash_offset: u16) void {
    @"49"(self.id, line_dash_offset);
}

pub inline fn setSourceOverToGlobalCompositeOperation(self: CanvasContext) void {
    @"50"(self.id);
}

pub inline fn setDestinationInToGlobalCompositeOperation(self: CanvasContext) void {
    @"51"(self.id);
}

pub inline fn setCopyToGlobalCompositeOperation(self: CanvasContext) void {
    @"52"(self.id);
}

pub inline fn setLighterToGlobalCompositeOperation(self: CanvasContext) void {
    @"53"(self.id);
}

pub inline fn setMultiplyToGlobalCompositeOperation(self: CanvasContext) void {
    @"54"(self.id);
}

pub inline fn setImageSmoothingEnabled(self: CanvasContext, comptime smoothing: bool) void {
    @"55"(self.id, comptime @intFromBool(smoothing));
}

pub inline fn setSize(self: CanvasContext, w: u16, h: u16) void {
    @"56"(self.id, w, h);
}

/// Creates the context.
extern "0" fn @"0"(width: f32, height: f32, is_discardable: u8) ContextId;
/// Get context by element id.
extern "0" fn @"1"(pointer: [*]const u8, length: u32, alpha: u8) ContextId;
/// Draw svg on context.
extern "0" fn @"2"(context_id: ContextId, pointer: [*]const u8, length: u32) void;
/// Destroys the context.
extern "0" fn @"3"(context_id: ContextId) void;
/// Performs save on context.
extern "0" fn @"4"(context_id: ContextId) void;
/// Performs restore on context.
extern "0" fn @"5"(context_id: ContextId) void;
/// Resets context transform.
extern "0" fn @"6"(context_id: ContextId) void;
/// Sets context transform.
extern "0" fn @"7"(context_id: ContextId, a: f32, b: f32, c: f32, d: f32, e: f32, f: f32) void;
/// Performs fill on context.
extern "0" fn @"8"(context_id: ContextId) void;
/// Performs path fill on context.
extern "0" fn @"9"(context_id: ContextId, path_id: Path2D.PathId, is_non_zero: u8) void;
/// Performs stroke on context.
extern "0" fn @"10"(context_id: ContextId) void;
/// Performs path stroke on context.
extern "0" fn @"11"(context_id: ContextId, path_id: Path2D.PathId) void;
/// Performs clip on context.
extern "0" fn @"12"(context_id: ContextId) void;
/// Performs path clip on context.
extern "0" fn @"13"(context_id: ContextId, path_id: Path2D.PathId) void;
/// Performs beginPath on context.
extern "0" fn @"14"(context_id: ContextId) void;
/// Performs closePath on context.
extern "0" fn @"15"(context_id: ContextId) void;
/// Performs rect on context.
extern "0" fn @"16"(context_id: ContextId, x: f32, y: f32, w: f32, h: f32) void;
/// Performs full clear on context.
extern "0" fn @"17"(context_id: ContextId) void;
/// Performs clearRect on context.
extern "0" fn @"18"(context_id: ContextId, x: f32, y: f32, w: f32, h: f32) void;
/// Draws a pixel.
extern "0" fn @"19"(context_id: ContextId) void;
/// Strokes a rect.
extern "0" fn @"20"(context_id: ContextId, w: f32, h: f32) void;
/// Sets fillStyle on context.
extern "0" fn @"21"(context_id: ContextId, r: u8, g: u8, b: u8) void;
/// Sets strokeStyle to context.
extern "0" fn @"22"(context_id: ContextId, r: u8, g: u8, b: u8) void;
/// Sets globalAlpha on context.
extern "0" fn @"23"(context_id: ContextId, alpha: f32) void;
/// Performs moveTo on context.
extern "0" fn @"24"(context_id: ContextId, x: f32, y: f32) void;
/// Performs lineTo on context.
extern "0" fn @"25"(context_id: ContextId, x: f32, y: f32) void;
/// Performs translate on context.
extern "0" fn @"26"(context_id: ContextId, x: f32, y: f32) void;
/// Performs scale on context.
extern "0" fn @"27"(context_id: ContextId, x: f32, y: f32) void;
/// Performs rotate on context.
extern "0" fn @"28"(context_id: ContextId, angle: f32) void;
/// Performs quadraticCurveTo on context.
extern "0" fn @"29"(context_id: ContextId, cpx: f32, cpy: f32, x: f32, y: f32) void;
/// Performs bezierCurveTo on context.
extern "0" fn @"30"(context_id: ContextId, cp1x: f32, cp1y: f32, cp2x: f32, cp2y: f32, x: f32, y: f32) void;
/// Performs arc on context.
extern "0" fn @"31"(context_id: ContextId, x: f32, y: f32, radius: f32, startAngle: f32, endAngle: f32, counterclockwise: u8) void;
/// Performs ellipse on context.
extern "0" fn @"32"(context_id: ContextId, x: f32, y: f32, radiusX: f32, radiusY: f32, rotation: f32, startAngle: f32, endAngle: f32, counterclockwise: u8) void;
/// Sets lineWidth to context.
extern "0" fn @"33"(context_id: ContextId, w: f32) void;
/// Performs drawImage (overload 1) on context.
extern "0" fn @"34"(dst_context_id: ContextId, src_context_id: ContextId, dx: f32, dy: f32) void;
/// Performs drawImage (overload 2) on context.
extern "0" fn @"35"(dst_context_id: ContextId, src_context_id: ContextId, dx: f32, dy: f32) void;
/// Performs drawImage (overload 3) on context.
extern "0" fn @"36"(dst_context_id: ContextId, src_context_id: ContextId, dx: f32, dy: f32, dw: f32, dh: f32) void;
/// Performs fillText on context.
extern "0" fn @"37"(context_id: ContextId, pointer: [*]const u8, length: u32, x: f32, y: f32) void;
/// Performs strokeText to context.
extern "0" fn @"38"(context_id: ContextId, pointer: [*]const u8, length: u32, x: f32, y: f32) void;
/// Sets font on context.
extern "0" fn @"39"(context_id: ContextId, pixel: u16) void;
/// Sets center to textAlign on context.
extern "0" fn @"40"(context_id: ContextId) void;
/// Sets textAlign on context.
extern "0" fn @"41"(context_id: ContextId, pointer: [*]const u8, length: u32) void;
/// Sets butt to lineCap on context.
extern "0" fn @"42"(context_id: ContextId) void;
/// Sets round to lineCap on context.
extern "0" fn @"43"(context_id: ContextId) void;
/// Sets square to lineCap on context.
extern "0" fn @"44"(context_id: ContextId) void;
/// Sets round to lineJoin on context.
extern "0" fn @"45"(context_id: ContextId) void;
/// Sets miter to lineJoin on context.
extern "0" fn @"46"(context_id: ContextId) void;
/// Sets miterLimit to context.
extern "0" fn @"47"(context_id: ContextId, miter_limit: u16) void;
/// Sets line dash to real line on context.
extern "0" fn @"48"(context_id: ContextId) void;
/// Sets lineDashOffset to context.
extern "0" fn @"49"(context_id: ContextId, line_dash_offset: u16) void;
/// Sets source-over to globalCompositeOperation on context.
extern "0" fn @"50"(context_id: ContextId) void;
/// Sets destination-in to globalCompositeOperation on context.
extern "0" fn @"51"(context_id: ContextId) void;
/// Sets copy to globalCompositeOperation on context.
extern "0" fn @"52"(context_id: ContextId) void;
/// Sets lighter to globalCompositeOperation on context.
extern "0" fn @"53"(context_id: ContextId) void;
/// Sets multiply to globalCompositeOperation on context.
extern "0" fn @"54"(context_id: ContextId) void;
/// Sets imageSmoothingEnabled on context.
extern "0" fn @"55"(context_id: ContextId, smoothing: u8) void;
/// Sets width and height to canvas.
extern "0" fn @"56"(context_id: ContextId, w: u16, h: u16) void;

pub inline fn createCanvasContext(width: f32, height: f32, comptime is_discardable: bool) CanvasContext {
    const context_id = @"0"(width, height, comptime @intFromBool(is_discardable));

    return CanvasContext.init(context_id);
}

pub inline fn getCanvasContextFromElement(comptime id: []const u8, comptime alpha: bool) CanvasContext {
    const context_id = @"1"(id.ptr, id.len, comptime @intFromBool(alpha));

    return CanvasContext.init(context_id);
}
