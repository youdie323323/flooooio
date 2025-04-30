const std = @import("std");
const Path2D = @import("Path2D.zig");
const CanvasRenderingContext2D = @This();

pub const ContextId = u32;

id: ContextId,

pub inline fn init(id: ContextId) CanvasRenderingContext2D {
    return .{ .id = id };
}

pub inline fn save(self: CanvasRenderingContext2D) void {
    @"2"(self.id);
}

pub inline fn restore(self: CanvasRenderingContext2D) void {
    @"3"(self.id);
}

pub inline fn translate(self: CanvasRenderingContext2D, x: f64, y: f64) void {
    @"4"(self.id, x, y);
}

pub inline fn scale(self: CanvasRenderingContext2D, x: f64, y: f64) void {
    @"5"(self.id, x, y);
}

pub inline fn rotate(self: CanvasRenderingContext2D, angle: f64) void {
    @"6"(self.id, angle);
}

pub inline fn beginPath(self: CanvasRenderingContext2D) void {
    @"7"(self.id);
}

pub inline fn closePath(self: CanvasRenderingContext2D) void {
    @"8"(self.id);
}

pub inline fn moveTo(self: CanvasRenderingContext2D, x: f64, y: f64) void {
    @"9"(self.id, x, y);
}

pub inline fn lineTo(self: CanvasRenderingContext2D, x: f64, y: f64) void {
    @"10"(self.id, x, y);
}

pub inline fn font(self: CanvasRenderingContext2D, style: []const u8) void {
    @"11"(self.id, style.ptr, style.len);
}

pub inline fn fillStyle(self: CanvasRenderingContext2D, style: []const u8) void {
    @"12"(self.id, style.ptr, style.len);
}

pub inline fn fillText(self: CanvasRenderingContext2D, text: []const u8, x: f64, y: f64) void {
    @"13"(self.id, text.ptr, text.len, x, y);
}

pub inline fn fill(self: CanvasRenderingContext2D) void {
    @"14"(self.id);
}

pub inline fn fillPath(self: CanvasRenderingContext2D, path: Path2D, comptime is_non_zero: bool) void {
    @"15"(self.id, path.id, is_non_zero);
}

pub inline fn stroke(self: CanvasRenderingContext2D) void {
    @"16"(self.id);
}

pub inline fn strokePath(self: CanvasRenderingContext2D, path: Path2D) void {
    @"17"(self.id, path.id);
}

pub inline fn clip(self: CanvasRenderingContext2D) void {
    @"18"(self.id);
}

pub inline fn clipPath(self: CanvasRenderingContext2D, path: Path2D) void {
    @"19"(self.id, path.id);
}

pub inline fn lineWidth(self: CanvasRenderingContext2D, width: f64) void {
    @"20"(self.id, width);
}

pub inline fn lineCap(self: CanvasRenderingContext2D, style: []const u8) void {
    @"21"(self.id, style.ptr, style.len);
}

pub inline fn strokeStyle(self: CanvasRenderingContext2D, style: []const u8) void {
    @"22"(self.id, style.ptr, style.len);
}

pub inline fn strokeText(self: CanvasRenderingContext2D, text: []const u8, x: f64, y: f64) void {
    @"23"(self.id, text.ptr, text.len, x, y);
}

pub inline fn arc(self: CanvasRenderingContext2D, x: f64, y: f64, radius: f64, startAngle: f64, endAngle: f64, counterclockwise: bool) void {
    @"24"(self.id, x, y, radius, startAngle, endAngle, counterclockwise);
}

pub inline fn rect(self: CanvasRenderingContext2D, x: f64, y: f64, width: f64, height: f64) void {
    @"25"(self.id, x, y, width, height);
}

pub inline fn clearRect(self: CanvasRenderingContext2D, x: f64, y: f64, width: f64, height: f64) void {
    @"26"(self.id, x, y, width, height);
}

pub inline fn fillRect(self: CanvasRenderingContext2D, x: f64, y: f64, width: f64, height: f64) void {
    @"27"(self.id, x, y, width, height);
}

pub inline fn strokeRect(self: CanvasRenderingContext2D, x: f64, y: f64, width: f64, height: f64) void {
    @"28"(self.id, x, y, width, height);
}

pub inline fn textAlign(self: CanvasRenderingContext2D, a: []const u8) void {
    @"29"(self.id, a.ptr, a.len);
}

pub inline fn textBaseline(self: CanvasRenderingContext2D, baseline: []const u8) void {
    @"30"(self.id, baseline.ptr, baseline.len);
}

pub inline fn bezierCurveTo(self: CanvasRenderingContext2D, cp1x: f64, cp1y: f64, cp2x: f64, cp2y: f64, x: f64, y: f64) void {
    @"31"(self.id, cp1x, cp1y, cp2x, cp2y, x, y);
}

pub inline fn quadraticCurveTo(self: CanvasRenderingContext2D, cpx: f64, cpy: f64, x: f64, y: f64) void {
    @"32"(self.id, cpx, cpy, x, y);
}

pub inline fn clearRectFull(self: CanvasRenderingContext2D) void {
    @"33"(self.id);
}

extern "0" fn @"0"(width: f64, height: f64) ContextId;
extern "0" fn @"1"(pointer: [*]const u8, length: u32) ContextId;
/// Performs save on context.
extern "0" fn @"2"(context_id: ContextId) void;
/// Performs restore on context.
extern "0" fn @"3"(context_id: ContextId) void;
/// Performs translate on context.
extern "0" fn @"4"(context_id: ContextId, x: f64, y: f64) void;
/// Performs scale on context.
extern "0" fn @"5"(context_id: ContextId, x: f64, y: f64) void;
/// Performs rotate on context.
extern "0" fn @"6"(context_id: ContextId, angle: f64) void;
/// Performs beginPath on context.
extern "0" fn @"7"(context_id: ContextId) void;
/// Performs closePath on context.
extern "0" fn @"8"(context_id: ContextId) void;
/// Performs moveTo on context.
extern "0" fn @"9"(context_id: ContextId, x: f64, y: f64) void;
/// Performs lineTo on context.
extern "0" fn @"10"(context_id: ContextId, x: f64, y: f64) void;
/// Sets font to context.
extern "0" fn @"11"(context_id: ContextId, pointer: [*]const u8, length: u32) void;
/// Performs fillStyle on context.
extern "0" fn @"12"(context_id: ContextId, pointer: [*]const u8, length: u32) void;
/// Performs fillText on context.
extern "0" fn @"13"(context_id: ContextId, pointer: [*]const u8, length: u32, x: f64, y: f64) void;
/// Performs fill on context.
extern "0" fn @"14"(context_id: ContextId) void;
/// Performs path fill on context.
extern "0" fn @"15"(context_id: ContextId, path_id: Path2D.PathId, is_non_zero: bool) void;
/// Performs stroke on context.
extern "0" fn @"16"(context_id: ContextId) void;
/// Performs path stroke on context.
extern "0" fn @"17"(context_id: ContextId, path_id: Path2D.PathId) void;
/// Performs clip on context.
extern "0" fn @"18"(context_id: ContextId) void;
/// Performs path clip on context.
extern "0" fn @"19"(context_id: ContextId, path_id: Path2D.PathId) void;
/// Sets lineWidth to context.
extern "0" fn @"20"(context_id: ContextId, width: f64) void;
/// Sets lineCap to context.
extern "0" fn @"21"(context_id: ContextId, pointer: [*]const u8, length: u32) void;
/// Sets strokeStyle to context.
extern "0" fn @"22"(context_id: ContextId, pointer: [*]const u8, length: u32) void;
/// Sets strokeText to context.
extern "0" fn @"23"(context_id: ContextId, pointer: [*]const u8, length: u32, x: f64, y: f64) void;
/// Performs arc on context.
extern "0" fn @"24"(context_id: ContextId, x: f64, y: f64, radius: f64, startAngle: f64, endAngle: f64, counterclockwise: bool) void;
/// Performs rect on context.
extern "0" fn @"25"(context_id: ContextId, x: f64, y: f64, width: f64, height: f64) void;
/// Performs clearRect on context.
extern "0" fn @"26"(context_id: ContextId, x: f64, y: f64, width: f64, height: f64) void;
/// Performs fillRect on context.
extern "0" fn @"27"(context_id: ContextId, x: f64, y: f64, width: f64, height: f64) void;
/// Performs strokeRect on context.
extern "0" fn @"28"(context_id: ContextId, x: f64, y: f64, width: f64, height: f64) void;
/// Sets textAlign to context.
extern "0" fn @"29"(context_id: ContextId, pointer: [*]const u8, length: u32) void;
/// Sets textBaseline to context.
extern "0" fn @"30"(context_id: ContextId, pointer: [*]const u8, length: u32) void;
/// Performs bezierCurveTo on context.
extern "0" fn @"31"(context_id: ContextId, cp1x: f64, cp1y: f64, cp2x: f64, cp2y: f64, x: f64, y: f64) void;
/// Performs quadraticCurveTo on context.
extern "0" fn @"32"(context_id: ContextId, cpx: f64, cpy: f64, x: f64, y: f64) void;

// Begin utility canvas imports, like clearRectFull

/// Performs full clear on context.
extern "0" fn @"33"(context_id: ContextId) void;

pub inline fn createCanvas(comptime width: f64, comptime height: f64) CanvasRenderingContext2D {
    const context_id = @"0"(width, height);

    return CanvasRenderingContext2D.init(context_id);
}

pub inline fn pushCanvasByElementId(comptime id: []const u8) CanvasRenderingContext2D {
    const context_id = @"1"(id.ptr, id.len);

    return CanvasRenderingContext2D.init(context_id);
}