///! This module proivded minimal canvas operations for wasm.
///! Im not going to use C string here for performance reason.
const std = @import("std");
const Path2D = @import("Path2D.zig");
const Color = @import("./Color.zig");
const mem = @import("../../../mem.zig");
const CanvasContext = @This();

pub const Id = u16;

id: Id,

pub inline fn init(id: Id) CanvasContext {
    return .{ .id = id };
}

pub inline fn deinit(self: CanvasContext) void {
    @"3"(self.id);
}

pub inline fn drawSVG(self: CanvasContext, svg: []const u8) void {
    @"2"(self.id, svg.ptr, svg.len);
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

pub inline fn clearContextRect(self: CanvasContext) void {
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

pub inline fn arc(self: CanvasContext, x: f32, y: f32, radius: f32, start_angle: f32, end_angle: f32, counterclockwise: bool) void {
    @"31"(self.id, x, y, radius, start_angle, end_angle, comptime @intFromBool(counterclockwise));
}

pub inline fn ellipse(self: CanvasContext, x: f32, y: f32, radius_x: f32, radius_y: f32, rotation: f32, start_angle: f32, end_angle: f32, counterclockwise: bool) void {
    @"32"(self.id, x, y, radius_x, radius_y, rotation, start_angle, end_angle, comptime @intFromBool(counterclockwise));
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

pub inline fn copyCanvasWithScale(self: CanvasContext, src_context: CanvasContext, dx: f32, dy: f32, dw: f32, dh: f32) void {
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

pub inline fn setTextAlign(self: CanvasContext, comptime @"align": []const u8) void {
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

pub inline fn getSize(self: CanvasContext) @Vector(2, u16) {
    var width: u16 = undefined;
    var height: u16 = undefined;

    @"57"(self.id, &width, &height);

    return .{ width, height };
}

/// Creates the context.
extern "0" fn @"0"(width: f32, height: f32, is_discardable: u8) Id;
/// Get context by element id.
extern "0" fn @"1"(ptr: mem.MemoryPointer, alpha: u8) Id;
/// Draw svg on context.
extern "0" fn @"2"(id: Id, ptr: [*]const u8, len: u32) void;
/// Destroys the context.
extern "0" fn @"3"(id: Id) void;
/// Performs save on context.
extern "0" fn @"4"(id: Id) void;
/// Performs restore on context.
extern "0" fn @"5"(id: Id) void;
/// Resets context transform.
extern "0" fn @"6"(id: Id) void;
/// Sets context transform.
extern "0" fn @"7"(id: Id, a: f32, b: f32, c: f32, d: f32, e: f32, f: f32) void;
/// Performs fill on context.
extern "0" fn @"8"(id: Id) void;
/// Performs path fill on context.
extern "0" fn @"9"(id: Id, path_id: Path2D.PathId, is_non_zero: u8) void;
/// Performs stroke on context.
extern "0" fn @"10"(id: Id) void;
/// Performs path stroke on context.
extern "0" fn @"11"(id: Id, path_id: Path2D.PathId) void;
/// Performs clip on context.
extern "0" fn @"12"(id: Id) void;
/// Performs path clip on context.
extern "0" fn @"13"(id: Id, path_id: Path2D.PathId) void;
/// Performs beginPath on context.
extern "0" fn @"14"(id: Id) void;
/// Performs closePath on context.
extern "0" fn @"15"(id: Id) void;
/// Performs rect on context.
extern "0" fn @"16"(id: Id, x: f32, y: f32, w: f32, h: f32) void;
/// Performs full clear on context.
extern "0" fn @"17"(id: Id) void;
/// Performs clearRect on context.
extern "0" fn @"18"(id: Id, x: f32, y: f32, w: f32, h: f32) void;
/// Draws a pixel.
extern "0" fn @"19"(id: Id) void;
/// Strokes a rect.
extern "0" fn @"20"(id: Id, w: f32, h: f32) void;
/// Sets fillStyle on context.
extern "0" fn @"21"(id: Id, r: u8, g: u8, b: u8) void;
/// Sets strokeStyle to context.
extern "0" fn @"22"(id: Id, r: u8, g: u8, b: u8) void;
/// Sets globalAlpha on context.
extern "0" fn @"23"(id: Id, alpha: f32) void;
/// Performs moveTo on context.
extern "0" fn @"24"(id: Id, x: f32, y: f32) void;
/// Performs lineTo on context.
extern "0" fn @"25"(id: Id, x: f32, y: f32) void;
/// Performs translate on context.
extern "0" fn @"26"(id: Id, x: f32, y: f32) void;
/// Performs scale on context.
extern "0" fn @"27"(id: Id, x: f32, y: f32) void;
/// Performs rotate on context.
extern "0" fn @"28"(id: Id, angle: f32) void;
/// Performs quadraticCurveTo on context.
extern "0" fn @"29"(id: Id, cpx: f32, cpy: f32, x: f32, y: f32) void;
/// Performs bezierCurveTo on context.
extern "0" fn @"30"(id: Id, cp1x: f32, cp1y: f32, cp2x: f32, cp2y: f32, x: f32, y: f32) void;
/// Performs arc on context.
extern "0" fn @"31"(id: Id, x: f32, y: f32, radius: f32, start_angle: f32, end_angle: f32, counterclockwise: u8) void;
/// Performs ellipse on context.
extern "0" fn @"32"(id: Id, x: f32, y: f32, radius_x: f32, radius_y: f32, rotation: f32, start_angle: f32, end_angle: f32, counterclockwise: u8) void;
/// Sets lineWidth to context.
extern "0" fn @"33"(id: Id, w: f32) void;
/// Performs drawImage (overload 1) on context.
extern "0" fn @"34"(dst_id: Id, src_id: Id, dx: f32, dy: f32) void;
/// Performs drawImage (overload 2) on context.
extern "0" fn @"35"(dst_id: Id, src_id: Id, dx: f32, dy: f32) void;
/// Performs drawImage (overload 3) on context.
extern "0" fn @"36"(dst_id: Id, src_id: Id, dx: f32, dy: f32, dw: f32, dh: f32) void;
/// Performs fillText on context.
extern "0" fn @"37"(id: Id, ptr: [*]const u8, len: u32, x: f32, y: f32) void;
/// Performs strokeText to context.
extern "0" fn @"38"(id: Id, ptr: [*]const u8, len: u32, x: f32, y: f32) void;
/// Sets font on context.
extern "0" fn @"39"(id: Id, pixel: u16) void;
/// Sets center to textAlign on context.
extern "0" fn @"40"(id: Id) void;
/// Sets textAlign on context.
extern "0" fn @"41"(id: Id, ptr: [*]const u8, len: u32) void;
/// Sets butt to lineCap on context.
extern "0" fn @"42"(id: Id) void;
/// Sets round to lineCap on context.
extern "0" fn @"43"(id: Id) void;
/// Sets square to lineCap on context.
extern "0" fn @"44"(id: Id) void;
/// Sets round to lineJoin on context.
extern "0" fn @"45"(id: Id) void;
/// Sets miter to lineJoin on context.
extern "0" fn @"46"(id: Id) void;
/// Sets miterLimit to context.
extern "0" fn @"47"(id: Id, miter_limit: u16) void;
/// Sets line dash to real line on context.
extern "0" fn @"48"(id: Id) void;
/// Sets lineDashOffset to context.
extern "0" fn @"49"(id: Id, line_dash_offset: u16) void;
/// Sets source-over to globalCompositeOperation on context.
extern "0" fn @"50"(id: Id) void;
/// Sets destination-in to globalCompositeOperation on context.
extern "0" fn @"51"(id: Id) void;
/// Sets copy to globalCompositeOperation on context.
extern "0" fn @"52"(id: Id) void;
/// Sets lighter to globalCompositeOperation on context.
extern "0" fn @"53"(id: Id) void;
/// Sets multiply to globalCompositeOperation on context.
extern "0" fn @"54"(id: Id) void;
/// Sets imageSmoothingEnabled on context.
extern "0" fn @"55"(id: Id, smoothing: u8) void;
/// Sets width and height to canvas.
extern "0" fn @"56"(id: Id, w: u16, h: u16) void;
/// Get width and height of canvas.
extern "0" fn @"57"(id: Id, w_addr: *u16, h_addr: *u16) void;

pub inline fn createCanvasContext(width: f32, height: f32, comptime is_discardable: bool) CanvasContext {
    const id = @"0"(width, height, comptime @intFromBool(is_discardable));

    return CanvasContext.init(id);
}

pub inline fn getCanvasContextFromElement(comptime element_id: []const u8, comptime alpha: bool) CanvasContext {
    const str = mem.allocCString(element_id);

    const id = @"1"(str, comptime @intFromBool(alpha));

    mem.free(str);

    return CanvasContext.init(id);
}

/// Function signature for RAF (requestAnimationFrame) event handler.
pub const RAFCallback = *const fn (time: f64) callconv(.c) void;

extern "0" fn @"65"(callback: RAFCallback) u32;

pub inline fn requestAnimationFrame(callback: RAFCallback) u32 {
    return @"65"(callback);
}